import { createHash } from "crypto";
import { getRedis } from "./db";
import { MLSListing, ListingEnrichment, POIBadge, NeighborhoodScore, CommuteResult } from "@/types/ai-assistant";

const KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE = "https://maps.googleapis.com/maps/api";

const TTL_POI     = 60 * 60 * 24;          // 24h  — POI locations near a city
const TTL_GEO     = 60 * 60 * 24 * 7;      // 7d   — geocoded listing addresses
const TTL_ENRICH  = 60 * 60 * 24 * 7;      // 7d   — per-listing enrichment
const TTL_SOLAR   = 60 * 60 * 24 * 30;     // 30d  — solar potential data
const TTL_AQI     = 60 * 60 * 6;           // 6h   — air quality index
const TTL_POLLEN  = 60 * 60 * 12;          // 12h  — pollen forecast
const TTL_COMMUTE = 60 * 60 * 24;          // 24h  — commute times

if (!KEY) {
  console.warn("[Places] GOOGLE_PLACES_API_KEY is not set — POI proximity and enrichment disabled");
} else {
  console.log("[Places] GOOGLE_PLACES_API_KEY loaded ✓");
}

// User-friendly Haiku param → Google Places API type
const POI_TYPE_MAP: Record<string, string> = {
  hospital:   "hospital",
  school:     "school",
  grocery:    "supermarket",
  park:       "park",
  transit:    "transit_station",
  restaurant: "restaurant",
  gym:        "gym",
  pharmacy:   "pharmacy",
};

// POI types fetched per listing for enrichment
const ENRICH_TYPES: Array<{ haiku: string; label: string; google: string; radiusM: number }> = [
  { haiku: "hospital",   label: "Hospital", google: "hospital",        radiusM: 5000 },
  { haiku: "school",     label: "School",   google: "school",           radiusM: 2000 },
  { haiku: "grocery",    label: "Grocery",  google: "supermarket",      radiusM: 1500 },
  { haiku: "transit",    label: "Transit",  google: "transit_station",  radiusM: 800  },
  { haiku: "park",       label: "Park",     google: "park",             radiusM: 1000 },
];

function addrHash(s: string): string {
  return createHash("md5").update(s.toLowerCase().trim()).digest("hex").slice(0, 12);
}

// Haversine distance in miles between two lat/lng pairs
function distanceMi(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geocode a street address → lat/lng. Cached 7 days per address.
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!KEY) return null;
  const redis = getRedis();
  const cacheKey = `places:geo:${addrHash(address)}`;
  try {
    const cached = await redis.get<{ lat: number; lng: number }>(cacheKey);
    if (cached) {
      console.log(`[Places] geocode cache hit: "${address.slice(0, 40)}"`);
      return cached;
    }
  } catch {}
  try {
    const url = `${BASE}/geocode/json?address=${encodeURIComponent(address)}&key=${KEY}`;
    const res = await fetch(url);
    const json = await res.json() as {
      status: string;
      results: Array<{ geometry: { location: { lat: number; lng: number } } }>;
    };
    if (json.status !== "OK" || !json.results[0]) {
      console.warn(`[Places] geocode failed for "${address.slice(0, 40)}" — status: ${json.status}`);
      return null;
    }
    const loc = json.results[0].geometry.location;
    console.log(`[Places] geocoded "${address.slice(0, 40)}" → ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    try { await redis.set(cacheKey, loc, { ex: TTL_GEO }); } catch {}
    return loc;
  } catch (err) {
    console.error("[Places] geocode error:", err);
    return null;
  }
}

// Nearby Search for one POI type → closest result within radius
async function nearestPOI(
  lat: number,
  lng: number,
  haikuType: string,
  label: string,
  googleType: string,
  radiusM: number,
): Promise<POIBadge | null> {
  if (!KEY) return null;
  try {
    const url =
      `${BASE}/place/nearbysearch/json` +
      `?location=${lat},${lng}&radius=${radiusM}&type=${googleType}&key=${KEY}`;
    const res = await fetch(url);
    const json = await res.json() as {
      status: string;
      results: Array<{ name: string; geometry: { location: { lat: number; lng: number } } }>;
    };
    if (json.status !== "OK" || !json.results[0]) {
      if (json.status !== "ZERO_RESULTS") {
        console.warn(`[Places] nearbySearch(${label}) status: ${json.status}`);
      }
      return null;
    }
    const place = json.results[0];
    const dist = distanceMi(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
    return {
      type: haikuType,
      label,
      name: place.name,
      distanceMi: Math.round(dist * 10) / 10,
    };
  } catch (err) {
    console.error(`[Places] nearbySearch(${label}) error:`, err);
    return null;
  }
}

// Compute 0–10 neighborhood score from the POI results
function computeScore(pois: (POIBadge | null)[]): NeighborhoodScore {
  const found = (type: string) => pois.some((p) => p?.type === type);
  const grocery  = found("grocery")  ? 2 : 0;
  const transit  = found("transit")  ? 2 : 0;
  const park     = found("park")     ? 2 : 0;
  const school   = found("school")   ? 2 : 0;
  const hospital = found("hospital") ? 2 : 0;
  return {
    score: grocery + transit + park + school + hospital,
    breakdown: { grocery, transit, park, school, hospital },
  };
}

// ── Solar API ────────────────────────────────────────────────────────────────
// Google Solar API — building solar potential. Cached 30 days.
export async function getSolarData(
  lat: number,
  lng: number,
): Promise<{ yearlyEnergyKwh: number; panelCount: number; carbonOffsetKg: number } | null> {
  if (!KEY) return null;
  const redis = getRedis();
  const cacheKey = `places:solar:v1:${addrHash(`${lat}${lng}`)}`;
  try {
    const cached = await redis.get<{ yearlyEnergyKwh: number; panelCount: number; carbonOffsetKg: number }>(cacheKey);
    if (cached) return cached;
  } catch {}
  try {
    const url =
      `https://solar.googleapis.com/v1/buildingInsights:findClosest` +
      `?location.latitude=${lat}&location.longitude=${lng}&key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Places] solar API error: ${res.status} for ${lat},${lng}`);
      return null;
    }
    const json = await res.json() as {
      solarPotential?: {
        maxArrayPanelsCount?: number;
        maxArrayAreaMeters2?: number;
        carbonOffsetFactorKgPerMwh?: number;
        solarPanelConfigs?: Array<{
          panelsCount: number;
          yearlyEnergyDcKwh: number;
        }>;
      };
    };
    const sp = json.solarPotential;
    if (!sp || !sp.solarPanelConfigs || sp.solarPanelConfigs.length === 0) {
      console.warn(`[Places] solar: no panel configs for ${lat},${lng}`);
      return null;
    }
    const lastConfig = sp.solarPanelConfigs[sp.solarPanelConfigs.length - 1];
    const yearlyEnergyKwh = lastConfig.yearlyEnergyDcKwh;
    const panelCount = lastConfig.panelsCount;
    const carbonOffsetFactorKgPerMwh = sp.carbonOffsetFactorKgPerMwh ?? 0;
    const carbonOffsetKg = (yearlyEnergyKwh / 1000) * carbonOffsetFactorKgPerMwh;
    const result = { yearlyEnergyKwh, panelCount, carbonOffsetKg };
    console.log(`[Places] solar: ${lat},${lng} → ${yearlyEnergyKwh}kWh/yr`);
    try { await redis.set(cacheKey, result, { ex: TTL_SOLAR }); } catch {}
    return result;
  } catch (err) {
    console.error(`[Places] solar error for ${lat},${lng}:`, err);
    return null;
  }
}

// ── Air Quality API ──────────────────────────────────────────────────────────
// Google Air Quality API — current conditions. Cached 6 hours.
export async function getAirQuality(
  lat: number,
  lng: number,
): Promise<{ aqi: number; category: string } | null> {
  if (!KEY) return null;
  const redis = getRedis();
  const cacheKey = `places:aqi:v1:${addrHash(`${lat}${lng}`)}`;
  try {
    const cached = await redis.get<{ aqi: number; category: string }>(cacheKey);
    if (cached) return cached;
  } catch {}
  try {
    const res = await fetch(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: { latitude: lat, longitude: lng } }),
      },
    );
    if (!res.ok) {
      console.warn(`[Places] AQI API error: ${res.status} for ${lat},${lng}`);
      return null;
    }
    const json = await res.json() as {
      indexes?: Array<{
        code: string;
        aqi: number;
        category: string;
      }>;
    };
    if (!json.indexes || json.indexes.length === 0) {
      console.warn(`[Places] AQI: no indexes returned for ${lat},${lng}`);
      return null;
    }
    const usaIndex = json.indexes.find((idx) => idx.code === "usa_epa");
    const chosen = usaIndex ?? json.indexes[0];
    const result = { aqi: chosen.aqi, category: chosen.category };
    console.log(`[Places] AQI: ${lat},${lng} → ${result.aqi} (${result.category})`);
    try { await redis.set(cacheKey, result, { ex: TTL_AQI }); } catch {}
    return result;
  } catch (err) {
    console.error(`[Places] AQI error for ${lat},${lng}:`, err);
    return null;
  }
}

// ── Pollen API ───────────────────────────────────────────────────────────────
// Google Pollen API — 1-day forecast. Cached 12 hours.
export async function getPollenData(
  lat: number,
  lng: number,
): Promise<{ tree: string; grass: string; weed: string } | null> {
  if (!KEY) return null;
  const redis = getRedis();
  const cacheKey = `places:pollen:v1:${addrHash(`${lat}${lng}`)}`;
  try {
    const cached = await redis.get<{ tree: string; grass: string; weed: string }>(cacheKey);
    if (cached) return cached;
  } catch {}
  try {
    const url =
      `https://pollen.googleapis.com/v1/forecast:lookup` +
      `?location.latitude=${lat}&location.longitude=${lng}&days=1&key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Places] pollen API error: ${res.status} for ${lat},${lng}`);
      return null;
    }
    const json = await res.json() as {
      dailyInfo?: Array<{
        pollenTypeInfo?: Array<{
          code: string;
          indexInfo?: { category: string };
        }>;
      }>;
    };
    const day = json.dailyInfo?.[0];
    if (!day || !day.pollenTypeInfo) {
      console.warn(`[Places] pollen: no daily info for ${lat},${lng}`);
      return null;
    }
    const getCategory = (code: string): string => {
      const entry = day.pollenTypeInfo!.find((p) => p.code === code);
      return entry?.indexInfo?.category ?? "None";
    };
    const result = {
      tree:  getCategory("TREE"),
      grass: getCategory("GRASS"),
      weed:  getCategory("WEED"),
    };
    console.log(`[Places] pollen: ${lat},${lng} → tree:${result.tree} grass:${result.grass} weed:${result.weed}`);
    try { await redis.set(cacheKey, result, { ex: TTL_POLLEN }); } catch {}
    return result;
  } catch (err) {
    console.error(`[Places] pollen error for ${lat},${lng}:`, err);
    return null;
  }
}

// ── Distance Matrix API ──────────────────────────────────────────────────────
// Commute time from one origin to multiple destinations. Cached 24h per dest.
export async function getCommuteTimes(
  originLat: number,
  originLng: number,
  destinations: Array<{ id: string; lat: number; lng: number }>,
  mode: string,
  maxMinutes?: number,
): Promise<CommuteResult[]> {
  if (!KEY) return [];
  const redis = getRedis();
  console.log(
    `[Places] commute from ${originLat.toFixed(4)},${originLng.toFixed(4)}: ${destinations.length} destinations, mode=${mode}`,
  );

  // Check cache for each destination individually
  const cacheKeyBase = `places:commute:v1:${addrHash(`${originLat}${originLng}${mode}`)}`;
  const cachedResults: CommuteResult[] = [];
  const uncachedDests: Array<{ id: string; lat: number; lng: number }> = [];

  await Promise.all(
    destinations.map(async (dest) => {
      try {
        const cached = await redis.get<CommuteResult>(`${cacheKeyBase}:${dest.id}`);
        if (cached) {
          cachedResults.push(cached);
        } else {
          uncachedDests.push(dest);
        }
      } catch {
        uncachedDests.push(dest);
      }
    }),
  );

  if (uncachedDests.length === 0) return cachedResults;

  const destParam = uncachedDests
    .map((d) => `${d.lat},${d.lng}`)
    .join("|");

  let url =
    `${BASE}/distancematrix/json` +
    `?origins=${originLat},${originLng}` +
    `&destinations=${encodeURIComponent(destParam)}` +
    `&mode=${mode}` +
    `&key=${KEY}`;

  if (mode === "transit") {
    url += `&departure_time=now`;
  }

  try {
    const res = await fetch(url);
    const json = await res.json() as {
      status: string;
      rows?: Array<{
        elements: Array<{
          status: string;
          duration?: { value: number };
          distance?: { value: number };
        }>;
      }>;
    };

    if (json.status !== "OK" || !json.rows?.[0]) {
      console.warn(`[Places] distancematrix status: ${json.status}`);
      return cachedResults;
    }

    const elements = json.rows[0].elements;
    const freshResults: CommuteResult[] = [];

    for (let i = 0; i < uncachedDests.length; i++) {
      const dest = uncachedDests[i];
      const element = elements[i];

      if (!element || element.status !== "OK" || !element.duration || !element.distance) {
        console.warn(`[Places] commute element status for ${dest.id}: ${element?.status ?? "missing"}`);
        continue;
      }

      const minutes = Math.round(element.duration.value / 60);
      const calcDistanceMi = element.distance.value / 1609.34;
      const withinLimit = maxMinutes == null || minutes <= maxMinutes;

      const result: CommuteResult = {
        listingId: dest.id,
        minutes,
        distanceMi: Math.round(calcDistanceMi * 10) / 10,
        mode,
        withinLimit,
      };

      console.log(`[Places] commute ${dest.id}: ${minutes}min ${result.distanceMi}mi`);

      try {
        await redis.set(`${cacheKeyBase}:${dest.id}`, result, { ex: TTL_COMMUTE });
      } catch {}

      freshResults.push(result);
    }

    return [...cachedResults, ...freshResults];
  } catch (err) {
    console.error(`[Places] distancematrix error:`, err);
    return cachedResults;
  }
}

// ── Option 1 ────────────────────────────────────────────────────────────────
// Resolve a POI type / named place near a city to lat/lng + resolved name.
// Used by the route before the MLS call to set latitude/longitude/radius params.
export async function resolvePOILocation(
  poiQuery: string,           // e.g. "hospital" or "UCSF Medical Center"
  city: string,
  state: string,
): Promise<{ lat: number; lng: number; name: string } | null> {
  if (!KEY) return null;
  // Map user-friendly type to Google type for generic queries, or use as-is for named places
  const searchTerm = POI_TYPE_MAP[poiQuery.toLowerCase()] ?? poiQuery;
  const redis = getRedis();
  const cacheKey = `places:poi:${addrHash(searchTerm + city + state)}`;
  try {
    const cached = await redis.get<{ lat: number; lng: number; name: string }>(cacheKey);
    if (cached) {
      console.log(`[Places] POI cache hit: "${poiQuery}" near ${city}, ${state} → "${cached.name}"`);
      return cached;
    }
  } catch {}
  try {
    const query = `${searchTerm} in ${city} ${state}`;
    const url = `${BASE}/place/textsearch/json?query=${encodeURIComponent(query)}&key=${KEY}`;
    console.log(`[Places] resolving POI: "${query}"`);
    const res = await fetch(url);
    const json = await res.json() as {
      status: string;
      results: Array<{ name: string; geometry: { location: { lat: number; lng: number } } }>;
    };
    if (json.status !== "OK" || !json.results[0]) {
      console.warn(`[Places] POI text search failed for "${query}" — status: ${json.status}`);
      return null;
    }
    const place = json.results[0];
    const loc = { lat: place.geometry.location.lat, lng: place.geometry.location.lng, name: place.name };
    console.log(`[Places] POI resolved: "${place.name}" → ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    try { await redis.set(cacheKey, loc, { ex: TTL_POI }); } catch {}
    return loc;
  } catch (err) {
    console.error("[Places] POI text search error:", err);
    return null;
  }
}

// ── Open-Meteo Weather ────────────────────────────────────────────────────────
// Current conditions + 30-year climate normals. No API key required. Cached 6h (current) + 30d (climate).
const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

export async function getWeatherData(
  lat: number,
  lng: number,
): Promise<ListingEnrichment["weather"] | null> {
  const redis = getRedis();
  const coordKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const currentKey = `places:weather:current:v1:${coordKey}`;
  const climateKey = `places:weather:climate:v1:${coordKey}`;

  try {
    // Try to load both from cache
    const [cachedCurrent, cachedClimate] = await Promise.all([
      redis.get<{ tempF: number; condition: string; humidity: number }>(currentKey),
      redis.get<{ summerHighF: number; winterLowF: number; annualRainfallIn: number }>(climateKey),
    ]);

    // Fetch current weather if not cached
    let current = cachedCurrent;
    if (!current) {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,relative_humidity_2m&temperature_unit=fahrenheit&timezone=auto`,
      );
      if (res.ok) {
        const data = await res.json();
        const c = data.current;
        current = {
          tempF: Math.round(c.temperature_2m),
          condition: WMO_CONDITIONS[c.weathercode as number] ?? "Unknown",
          humidity: Math.round(c.relative_humidity_2m),
        };
        await redis.set(currentKey, current, { ex: 6 * 3600 }); // 6h TTL
      }
    }

    // Fetch climate normals if not cached
    let climate = cachedClimate;
    if (!climate) {
      const res = await fetch(
        `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lng}&start_date=1991-01-01&end_date=2020-12-31&monthly=temperature_2m_max,temperature_2m_min,precipitation_sum&models=ERA5`,
      );
      if (res.ok) {
        const data = await res.json();
        const maxTemps: number[] = data.monthly?.temperature_2m_max ?? [];
        const minTemps: number[] = data.monthly?.temperature_2m_min ?? [];
        const precip: number[] = data.monthly?.precipitation_sum ?? [];

        // Convert Celsius to Fahrenheit, precipitation mm to inches
        const toF = (c: number) => Math.round(c * 9 / 5 + 32);
        const toIn = (mm: number) => Math.round(mm / 25.4 * 10) / 10;

        // Summer = months 5,6,7 (Jun/Jul/Aug, 0-indexed), Winter = months 11,0,1 (Dec/Jan/Feb)
        const summerIdx = [5, 6, 7];
        const winterIdx = [11, 0, 1];
        const avg = (arr: number[], idxs: number[]) =>
          idxs.reduce((s, i) => s + (arr[i] ?? 0), 0) / idxs.length;

        climate = {
          summerHighF: toF(avg(maxTemps, summerIdx)),
          winterLowF: toF(avg(minTemps, winterIdx)),
          annualRainfallIn: toIn(precip.reduce((s, v) => s + (v ?? 0), 0)),
        };
        await redis.set(climateKey, climate, { ex: 30 * 24 * 3600 }); // 30d TTL
      }
    }

    if (!current || !climate) return null;
    return { ...current, ...climate };
  } catch (e) {
    console.warn("[Weather] getWeatherData failed:", e);
    return null;
  }
}

// ── Options 2+3 ─────────────────────────────────────────────────────────────
// Enrich listings with nearby POI badges, neighborhood score, solar potential,
// air quality, pollen data, and optional distance to the specific POI that was
// searched (e.g. "Galleria Mall").
// Fired in parallel with the Sonnet summary — never blocks the SSE stream.
export async function enrichListings(
  listings: MLSListing[],
  referencePOI?: { name: string; lat: number; lng: number },
): Promise<ListingEnrichment[]> {
  if (!KEY) {
    console.warn("[Places] enrichListings skipped — GOOGLE_PLACES_API_KEY not set");
    return [];
  }
  const redis = getRedis();
  const batch = listings.slice(0, 8); // cap to limit cold API cost
  console.log(`[Places] enriching ${batch.length} listing(s)${referencePOI ? ` (ref POI: "${referencePOI.name}")` : ""}`);

  const results = await Promise.all(
    batch.map(async (listing): Promise<ListingEnrichment> => {
      const id = String(listing.id);
      // Cache key bumped to v4/v3 to force re-fetch with new weather field.
      // v4 = with refPOI, v3 = without refPOI
      const cacheKey = referencePOI
        ? `places:enrich:v4:${id}:${addrHash(referencePOI.name)}`
        : `places:enrich:v3:${id}`;

      try {
        const cached = await redis.get<ListingEnrichment>(cacheKey);
        if (cached) {
          console.log(`[Places] enrich cache hit: listing ${id}`);
          return cached;
        }
      } catch {}

      const latLng = listing.full_address
        ? await geocodeAddress(listing.full_address)
        : null;

      const empty: ListingEnrichment = {
        listingId: id,
        pois: [],
        neighborhood: { score: 0, breakdown: { grocery: 0, transit: 0, park: 0, school: 0, hospital: 0 } },
      };

      if (!latLng) {
        console.warn(`[Places] no lat/lng for listing ${id} ("${listing.full_address?.slice(0, 40)}")`);
        return empty;
      }

      // Run all parallel lookups together: POI badges + solar + AQI + pollen + weather
      const [rawPOIs, solar, airQuality, pollen, weather] = await Promise.all([
        Promise.all(
          ENRICH_TYPES.map(({ haiku, label, google, radiusM }) =>
            nearestPOI(latLng.lat, latLng.lng, haiku, label, google, radiusM),
          ),
        ),
        getSolarData(latLng.lat, latLng.lng),
        getAirQuality(latLng.lat, latLng.lng),
        getPollenData(latLng.lat, latLng.lng),
        getWeatherData(latLng.lat, latLng.lng),
      ]);

      const distanceToSearchPOI = referencePOI
        ? {
            name: referencePOI.name,
            distanceMi: Math.round(distanceMi(latLng.lat, latLng.lng, referencePOI.lat, referencePOI.lng) * 10) / 10,
          }
        : undefined;

      const enrichment: ListingEnrichment = {
        listingId: id,
        location: { lat: latLng.lat, lng: latLng.lng },
        pois: rawPOIs.filter((p): p is POIBadge => p !== null),
        neighborhood: computeScore(rawPOIs),
        ...(distanceToSearchPOI ? { distanceToSearchPOI } : {}),
        ...(solar ? { solar } : {}),
        ...(airQuality ? { airQuality } : {}),
        ...(pollen ? { pollen } : {}),
        ...(weather ? { weather } : {}),
      };

      const foundTypes = enrichment.pois.map((p) => `${p.label}(${p.distanceMi}mi)`).join(", ");
      const refStr = distanceToSearchPOI ? ` | ${distanceToSearchPOI.distanceMi}mi from ${distanceToSearchPOI.name}` : "";
      const solarStr = solar ? ` | solar:${Math.round(solar.yearlyEnergyKwh)}kWh/yr` : "";
      const aqiStr = airQuality ? ` | AQI:${airQuality.aqi}(${airQuality.category})` : "";
      console.log(
        `[Places] listing ${id} enriched — score: ${enrichment.neighborhood.score}/10${refStr}${solarStr}${aqiStr} | ${foundTypes || "no POIs found"}`,
      );

      try { await redis.set(cacheKey, enrichment, { ex: TTL_ENRICH }); } catch {}
      return enrichment;
    }),
  );

  return results;
}

// ── Cache loader for follow-up turns ─────────────────────────────────────────
// Loads enrichments from Redis for listing IDs — used by answer_user path so
// Sonnet can answer distance questions without re-calling Google Places.
export async function loadCachedEnrichments(
  listingIds: string[],
  referencePOIName?: string,
): Promise<ListingEnrichment[]> {
  const redis = getRedis();
  const results = await Promise.all(
    listingIds.map(async (id) => {
      const keys = referencePOIName
        ? [
            `places:enrich:v3:${id}:${addrHash(referencePOIName)}`,
            `places:enrich:v2:${id}`,
          ]
        : [`places:enrich:v2:${id}`];
      for (const key of keys) {
        try {
          const cached = await redis.get<ListingEnrichment>(key);
          if (cached) return cached;
        } catch {}
      }
      return null;
    }),
  );
  return results.filter((e): e is ListingEnrichment => e !== null);
}
