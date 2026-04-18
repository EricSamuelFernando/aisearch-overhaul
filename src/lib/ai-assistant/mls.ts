import fs from "fs";
import path from "path";
import { MLSSearchParams, MLSListing } from "@/types/ai-assistant";

const MLS_BASE_URL = "https://api.realestateapi.com/v2/MLSSearch";
const SAMPLE_WRITTEN_FLAG = path.join(process.cwd(), ".data", ".sample-written");

export async function searchListings(params: MLSSearchParams): Promise<MLSListing[]> {
  // Base params — always present (matches working curl example)
  const { listing_property_type, ...restParams } = params;
  const payload: Record<string, unknown> = {
    active: true,
    has_photos: true,
    status: "Active",
    custom_status: "Active",
    sold: false,
    include_photos: true,
    size: restParams.size ?? 6,
    ...restParams,
  };

  // Only send listing_property_type if explicitly provided (API enum is ALL_CAPS)
  if (listing_property_type) {
    payload.listing_property_type = listing_property_type.toUpperCase();
  }

  console.log("[MLS] payload →", JSON.stringify(payload));

  const response = await fetch(MLS_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "x-api-key": process.env.REALESTATE_API_KEY!,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MLS API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Write raw sample on first successful call for field calibration
  if (!fs.existsSync(SAMPLE_WRITTEN_FLAG)) {
    try {
      const dataDir = path.join(process.cwd(), ".data");
      fs.mkdirSync(dataDir, { recursive: true });
      const firstRecord = (data.data ?? data.results ?? [])[0] ?? data;
      fs.writeFileSync(
        path.join(dataDir, "mls-raw-sample.json"),
        JSON.stringify(data, null, 2),
      );
      fs.writeFileSync(
        path.join(dataDir, "mls-first-listing.json"),
        JSON.stringify(firstRecord, null, 2),
      );
      fs.writeFileSync(SAMPLE_WRITTEN_FLAG, new Date().toISOString());
    } catch (e) {
      console.warn("[MLS] Could not write raw sample:", e);
    }
  }

  const records: unknown[] = data.data ?? data.results ?? [];
  console.log(`[MLS] raw records from API: ${records.length} | total reported: ${data.total ?? "?"}`);

  const normalized = records.map(normalizeListing);

  // Strip lease/rental results; also strip land unless the search explicitly requested it
  const wantsLand =
    (params.listing_property_type ?? "").toUpperCase() === "LAND" ||
    (params.property_sub_type ?? "").toLowerCase() === "land" ||
    (params.property_type ?? "").toUpperCase() === "LAND";

  const filtered = normalized.filter((l) => {
    const pt = (l.property_type ?? "").toLowerCase();
    const mt = (l.mls_type ?? "").toLowerCase();
    // Drop lease/rental — check both property_type and mlsType array
    if (pt.includes("lease") || pt.includes("rental")) return false;
    if (mt.includes("lease") || mt.includes("rental")) return false;
    if (!wantsLand && pt.includes("land")) return false;
    // API sometimes returns pending/contingent/sold despite active:true in payload
    const status = (l.status ?? "").toLowerCase();
    if (status && status !== "active") return false;
    // Price sanity: residential listing_price below $20k is a monthly rent, not a purchase
    if (l.listing_price > 0 && l.listing_price < 20000) return false;
    return true;
  });

  if (filtered.length !== normalized.length) {
    console.log(`[MLS] filtered out ${normalized.length - filtered.length} lease/rental/non-active record(s)`);
  }

  // Deduplicate by address — API sometimes returns the same property twice
  const seen = new Set<string>();
  const deduped = filtered.filter((l) => {
    const key = l.full_address.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length !== filtered.length) {
    console.log(`[MLS] deduplicated ${filtered.length - deduped.length} duplicate(s)`);
  }

  return deduped;
}

// Exact field paths confirmed from live RealEstateAPI.com v2 response.
// All listing data is nested under the `listing` object.
function normalizeListing(raw: unknown): MLSListing {
  const l = raw as Record<string, unknown>;
  const listing = (l.listing ?? {}) as Record<string, unknown>;
  const address = (listing.address ?? {}) as Record<string, unknown>;
  const property = (listing.property ?? {}) as Record<string, unknown>;
  const leadTypes = (listing.leadTypes ?? {}) as Record<string, unknown>;
  const media = (listing.media ?? {}) as Record<string, unknown>;

  const photos = ((media.photosList as Record<string, unknown>[]) ?? [])
    .slice(0, 20)
    .map((p) => (p.highRes ?? p.midRes ?? p.lowRes) as string)
    .filter(Boolean);

  return {
    id: String(l.id ?? l.listingId ?? ""),
    full_address: (address.unparsedAddress as string) ?? "",
    city: (address.city as string) ?? "",
    state: (address.stateOrProvince as string) ?? "",
    zip: (address.zipCode as string) ?? "",
    listing_price: (listing.listPriceLow as number) ?? (leadTypes.mlsListingPrice as number) ?? 0,
    bedrooms: (property.bedroomsTotal as number) ?? 0,
    bathrooms: (property.bathroomsTotal as number) ?? 0,
    living_area: (property.livingArea as number) ?? 0,
    lot_size: (property.lotSizeSquareFeet as number) ?? undefined,
    year_built: (property.yearBuilt as number) ?? undefined,
    has_pool: Boolean(property.hasPool),
    days_on_market: leadTypes.mlsDaysOnMarket != null
      ? Number(leadTypes.mlsDaysOnMarket)
      : undefined,
    photos,
    listing_url: (listing.url as string) ?? undefined,
    description: (listing.publicRemarks as string) ?? undefined,
    property_type: (property.propertyType as string) ?? undefined,
    property_sub_type: ((property.propertySubType as string[]) ?? [])[0] ?? undefined,
    mls_type: ((leadTypes.mlsType as string[]) ?? [])[0] ?? undefined,
    status: (leadTypes.mlsStatus as string) ?? (listing.standardStatus as string) ?? undefined,
    garage_spaces: (property.garageSpaces as number) ?? undefined,
    stories: (property.stories as number) ?? undefined,
    has_basement: property.hasBasement != null ? Boolean(property.hasBasement) : undefined,
    hoa_fee: (property.associationFee as number) ?? undefined,
    neighborhood: (property.neighborhood as string) ?? (property.subdivisionName as string) ?? undefined,
    is_waterfront: property.isWaterFront != null ? Boolean(property.isWaterFront) : undefined,
    is_water_view: property.isWaterView != null ? Boolean(property.isWaterView) : undefined,
    is_mountain_view: property.isMountainView != null ? Boolean(property.isMountainView) : undefined,
    is_city_view: property.isCityView != null ? Boolean(property.isCityView) : undefined,
    is_park_view: property.isParkView != null ? Boolean(property.isParkView) : undefined,
  };
}

export function formatListingsForPrompt(listings: MLSListing[]): string {
  if (!listings.length) return "No listings found matching the search criteria.";

  // Keep per-listing text tight — large descriptions inflate Sonnet's input and slow it down.
  return listings
    .map(
      (l, i) =>
        `[${i + 1}] ${l.full_address}, ${l.city}, ${l.state} — $${l.listing_price?.toLocaleString()} | ${l.bedrooms}bd/${l.bathrooms}ba | ${l.living_area?.toLocaleString()} sqft${l.year_built ? ` | Built ${l.year_built}` : ""}${l.property_sub_type ? ` | ${l.property_sub_type}` : l.property_type ? ` | ${l.property_type}` : ""}${l.stories != null ? ` | ${l.stories === 1 ? "Single story" : `${l.stories} stories`}` : ""}${l.garage_spaces ? ` | ${l.garage_spaces}-car garage` : ""}${l.has_pool ? " | Pool" : ""}${l.has_basement ? " | Basement" : ""}${l.hoa_fee != null ? ` | HOA $${l.hoa_fee}/mo` : ""}${l.neighborhood ? ` | ${l.neighborhood}` : ""}${l.is_waterfront ? " | Waterfront" : l.is_water_view ? " | Water view" : ""}${l.is_mountain_view ? " | Mountain view" : ""}${l.is_city_view ? " | City view" : ""}${l.is_park_view ? " | Park view" : ""}${l.days_on_market != null ? ` | ${l.days_on_market} DOM` : ""}${l.listing_url ? ` | ${l.listing_url}` : ""}`,
    )
    .join("\n");
}
