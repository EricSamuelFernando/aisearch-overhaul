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
      "x-api-key": process.env.REAPI_KEY!,
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
    (params.property_sub_type ?? "").toUpperCase() === "LAND" ||
    (params.listing_property_type ?? "").toUpperCase() === "LAND";

  const filtered = normalized.filter((l) => {
    const pt = (l.property_type ?? "").toLowerCase();
    if (pt.includes("lease") || pt.includes("rental")) return false;
    if (!wantsLand && pt.includes("land")) return false;
    return true;
  });

  if (filtered.length !== normalized.length) {
    console.log(`[MLS] filtered out ${normalized.length - filtered.length} lease/rental record(s)`);
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
    status: (leadTypes.mlsStatus as string) ?? (listing.standardStatus as string) ?? undefined,
  };
}

export function formatListingsForPrompt(listings: MLSListing[]): string {
  if (!listings.length) return "No listings found matching the search criteria.";

  // Keep per-listing text tight — large descriptions inflate Sonnet's input and slow it down.
  return listings
    .map(
      (l, i) =>
        `[${i + 1}] ${l.full_address}, ${l.city}, ${l.state} — $${l.listing_price?.toLocaleString()} | ${l.bedrooms}bd/${l.bathrooms}ba | ${l.living_area?.toLocaleString()} sqft${l.year_built ? ` | Built ${l.year_built}` : ""}${l.has_pool ? " | Pool" : ""}${l.days_on_market != null ? ` | ${l.days_on_market} DOM` : ""}${l.listing_url ? ` | ${l.listing_url}` : ""}`,
    )
    .join("\n");
}
