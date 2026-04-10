// scripts/fix-mappings.ts
// Run after the first real MLS API call to lock down field mappings.
// Usage: npx ts-node --project tsconfig.json scripts/fix-mappings.ts

import fs from "fs";
import path from "path";

const FIRST_LISTING_PATH = path.join(process.cwd(), ".data", "mls-first-listing.json");
const MLS_TS_PATH = path.join(process.cwd(), "src", "lib", "ai-assistant", "mls.ts");

function main() {
  if (!fs.existsSync(FIRST_LISTING_PATH)) {
    console.error(
      "❌ No sample file found. Make a real property search in the AI assistant first, then re-run this script.",
    );
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(FIRST_LISTING_PATH, "utf-8"));

  console.log("\n══════════════════════════════════════════════");
  console.log("  RAW MLS LISTING FIELD DUMP");
  console.log("══════════════════════════════════════════════");
  printFields(raw, "");

  const detected = {
    id:             findField(raw, ["id", "listing_id", "listingId", "mlsId"]),
    full_address:   findField(raw, ["full_address", "fullAddress", "address.full", "address"]),
    city:           findField(raw, ["city", "address.city", "homedetails.city"]),
    state:          findField(raw, ["state", "address.state"]),
    zip:            findField(raw, ["zip", "address.zip", "address.postalCode", "address.postal_code"]),
    listing_price:  findField(raw, ["listing_price", "listingPrice", "list_price", "listPrice", "price"]),
    bedrooms:       findField(raw, ["bedrooms", "property.bedrooms", "beds"]),
    bathrooms:      findField(raw, ["bathrooms", "property.bathrooms", "baths", "property.bathsFull"]),
    living_area:    findField(raw, ["living_area", "livingArea", "sqft", "property.area"]),
    lot_size:       findField(raw, ["lot_size", "lotSize", "property.lotSize"]),
    year_built:     findField(raw, ["year_built", "yearBuilt", "property.yearBuilt"]),
    has_pool:       findField(raw, ["has_pool", "hasPool", "property.pool"]),
    days_on_market: findField(raw, ["days_on_market", "daysOnMarket", "mls.daysOnMarket"]),
    photos:         findField(raw, ["photos", "media"]),
    description:    findField(raw, ["description", "publicRemarks", "public_remarks", "remarks"]),
    property_type:  findField(raw, ["property_type", "propertyType", "property.type"]),
    status:         findField(raw, ["status", "mls.status"]),
  };

  console.log("\n══════════════════════════════════════════════");
  console.log("  AUTO-DETECTED FIELD MAPPINGS");
  console.log("══════════════════════════════════════════════");
  for (const [key, detectedPath] of Object.entries(detected)) {
    const val = detectedPath ? getNestedValue(raw, detectedPath) : undefined;
    console.log(
      `  ${key.padEnd(16)} → ${detectedPath ?? "NOT FOUND"} (value: ${JSON.stringify(val)?.slice(0, 60)})`,
    );
  }

  console.log("\n══════════════════════════════════════════════");
  console.log("  ACTION REQUIRED");
  console.log("══════════════════════════════════════════════");
  console.log(`
  Files to update:
    ${MLS_TS_PATH}

  1. Review the mappings above
  2. Replace the normalizeListing() function with an exact version using confirmed paths
  3. Remove all fallback chains once fields are confirmed
  4. Delete .data/.sample-written to allow re-verification if the API changes
  5. Commit the updated mls.ts

  Suggested exact normalizer:

  function normalizeListing(l: Record<string, unknown>): MLSListing {
    return {
      id:            String(l.${detected.id ?? "id"} ?? ""),
      full_address:  l.${detected.full_address ?? "full_address"} as string ?? "",
      city:          l.${detected.city ?? "city"} as string ?? "",
      state:         l.${detected.state ?? "state"} as string ?? "",
      zip:           String(l.${detected.zip ?? "zip"} ?? ""),
      listing_price: l.${detected.listing_price ?? "listing_price"} as number ?? 0,
      bedrooms:      l.${detected.bedrooms ?? "bedrooms"} as number ?? 0,
      bathrooms:     l.${detected.bathrooms ?? "bathrooms"} as number ?? 0,
      living_area:   l.${detected.living_area ?? "living_area"} as number ?? 0,
      lot_size:      l.${detected.lot_size ?? "lot_size"} as number | undefined,
      year_built:    l.${detected.year_built ?? "year_built"} as number | undefined,
      has_pool:      Boolean(l.${detected.has_pool ?? "has_pool"}),
      days_on_market:l.${detected.days_on_market ?? "days_on_market"} as number | undefined,
      photos:        ((l.${detected.photos ?? "photos"} as string[]) ?? []).slice(0, 3),
      description:   l.${detected.description ?? "description"} as string | undefined,
      property_type: l.${detected.property_type ?? "property_type"} as string | undefined,
      status:        l.${detected.status ?? "status"} as string | undefined,
    };
  }
  `);
}

function printFields(obj: Record<string, unknown>, prefix: string, depth = 0) {
  if (depth > 4) return;
  for (const key of Object.keys(obj ?? {})) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      console.log(`  ${fullKey}: { ... }`);
      printFields(val as Record<string, unknown>, fullKey, depth + 1);
    } else {
      console.log(`  ${fullKey}: ${JSON.stringify(val)?.slice(0, 80)}`);
    }
  }
}

function findField(obj: Record<string, unknown>, candidates: string[]): string | undefined {
  for (const p of candidates) {
    if (getNestedValue(obj, p) !== undefined) return p;
  }
  return undefined;
}

function getNestedValue(obj: Record<string, unknown>, p: string): unknown {
  return p.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

main();
