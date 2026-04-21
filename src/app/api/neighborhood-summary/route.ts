import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';

const CATEGORIES = [
  { key: 'dining',  label: 'Dining',  icon: '🍽️', types: ['restaurant', 'cafe', 'bar'],                               weight: 30 },
  { key: 'grocery', label: 'Grocery', icon: '🛒', types: ['grocery_store', 'supermarket'],                             weight: 25 },
  { key: 'transit', label: 'Transit', icon: '🚌', types: ['transit_station', 'bus_station', 'subway_station', 'light_rail_station'], weight: 25 },
  { key: 'parks',   label: 'Parks',   icon: '🌳', types: ['park', 'national_park', 'playground'],                      weight: 20 },
] as const;

// Count thresholds for full score per category
const FULL_COUNT: Record<string, number> = { dining: 10, grocery: 3, transit: 5, parks: 3 };

const ROUTE_CACHE = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 h

async function searchCategory(
  apiKey: string,
  lat: number,
  lng: number,
  types: readonly string[],
): Promise<{ count: number; topNames: string[]; topRated: { name: string; rating: number } | null; avgRating: number | null }> {
  try {
    const res = await fetch(PLACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.rating',
      },
      body: JSON.stringify({
        includedTypes: [...types],
        maxResultCount: 10,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 1609,
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { count: 0, topNames: [], topRated: null, avgRating: null };
    const data = await res.json();
    const places: any[] = Array.isArray(data?.places) ? data.places : [];

    const topNames = places
      .slice(0, 3)
      .map((p: any) => p?.displayName?.text ?? '')
      .filter(Boolean);

    // Find highest-rated place
    const rated = places
      .filter((p: any) => typeof p?.rating === 'number')
      .sort((a: any, b: any) => b.rating - a.rating);

    const topRated = rated[0]
      ? { name: rated[0].displayName?.text ?? '', rating: rated[0].rating }
      : null;

    const ratings = rated.map((p: any) => p.rating as number);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    return { count: places.length, topNames, topRated, avgRating };
  } catch {
    return { count: 0, topNames: [], topRated: null, avgRating: null };
  }
}

function computeWalkScore(results: { key: string; count: number }[]): number {
  let score = 0;
  for (const cat of CATEGORIES) {
    const r = results.find((x) => x.key === cat.key);
    const count = r?.count ?? 0;
    const full = FULL_COUNT[cat.key] ?? 10;
    const pct = Math.min(1, count / full);
    score += pct * cat.weight;
  }
  return Math.round(score);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const cached = ROUTE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const results = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const data = await searchCategory(apiKey, lat, lng, cat.types);
        return { key: cat.key, label: cat.label, icon: cat.icon, ...data };
      }),
    );

    const walkScore = computeWalkScore(results);

    const summary: Record<string, unknown> = {};
    for (const r of results) {
      summary[r.key] = {
        label: r.label,
        icon: r.icon,
        count: r.count,
        topNames: r.topNames,
        topRated: r.topRated,
        avgRating: r.avgRating,
      };
    }

    const payload = { summary, walkScore };
    ROUTE_CACHE.set(cacheKey, { data: payload, ts: Date.now() });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: 'Neighborhood summary failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
