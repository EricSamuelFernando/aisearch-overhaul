export interface AIAssistantMessage {
  role: "user" | "assistant";
  content: string;
  listings?: MLSListing[];
  focusedListing?: MLSListing;
  /** ISO timestamp added at write time — absent on messages written before this field existed */
  timestamp?: string;
}

export interface SearchContext {
  params: MLSSearchParams;
  resolvedLocation: string; // human-readable e.g. "Las Vegas, NV"
  appliedAt: string;        // ISO timestamp
}

export interface PendingAction {
  type: "search_mls";
  params: MLSSearchParams;
  description: string; // human-readable e.g. "search Sunset, Richmond with pool under $1M"
  proposedAt: string;  // ISO timestamp
}

export interface BuyerProfile {
  userId: string;

  // ── Identity (seeded from Cognito, never extracted) ──────────────────────
  email: string | null;
  name: string | null;

  // ── Stated preferences (extracted from conversation) ────────────────────
  preferredLocations: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  bedroomsMin: number | null;
  bathroomsMin: number | null;
  mustHaves: string[];
  dealBreakers: string[];
  propertyTypes: string[];
  lastUpdated: string;

  // ── Personal context (freeform, Haiku-extracted from conversation) ────────
  // e.g. { "current_city": "Chicago", "has_children": "yes, ages 4 and 7", "commute_limit": "30 min" }
  personalContext: Record<string, string>;

  // ── Behavioral intelligence (derived from actual search events) ──────────
  // Frequency map of locations actually searched: { "Austin,TX": 4, "Dallas,TX": 1 }
  topCities: Record<string, number>;
  // Running averages of search params actually used
  avgBudgetMax: number | null;
  avgBudgetMin: number | null;
  avgBedroomsMin: number | null;
  // Feature flags used in searches: { "pool": 5, "waterfront": 2 }
  featureFrequency: Record<string, number>;
  // Lifetime counters
  searchCount: number;
  sessionCount: number;
  lastActiveAt: string | null;
  // Visual/aesthetic preferences — derived from visual_query searches
  // e.g. { "hardwood floors": 4, "blue kitchen": 2, "big windows": 3 }
  visualPreferences: Record<string, number>;
}

// Visual context extracted by Haiku alongside standard search params.
// Passed through the pipeline so memory can track aesthetic preferences.
export interface VisualContext {
  visualQuery?: string;
  roomHint?: string;
  visualConfidence?: "high" | "medium" | "low";
  descKeywords?: string[];
}

// Raw search event — one row per MLS search made by the user
export interface SearchEvent {
  id: string;
  userId: string;
  params: MLSSearchParams;
  resultCount: number;
  searchedAt: string;
}

export interface MLSSearchParams {
  // ── Geography ───────────────────────────────────────────────────────────────
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;

  // ── Property classification ──────────────────────────────────────────────
  /** Broadest MLS category: RESIDENTIAL | RESIDENTIAL_INCOME | RENTAL | LAND | COMMERCIAL | FARM */
  listing_property_type?: string;
  /** MLS full-string sub-type: "Single Family" | "Condo" | "Townhouse" | "Duplex" | "Multi-Family" | "Triplex" | "Fourplex" | "Manufactured Home" | "Land" | "Apartment" | "Cabin" | "Ranch" */
  property_sub_type?: string;
  /** Public-record type: SFR | MFR | LAND | CONDO | MOBILE | OTHER */
  property_type?: string;

  // ── Price ───────────────────────────────────────────────────────────────────
  listing_price_min?: number;
  listing_price_max?: number;
  price_per_sqft_min?: number;
  price_per_sqft_max?: number;

  // ── Beds / Baths / Size ──────────────────────────────────────────────────
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  living_area_min?: number;
  living_area_max?: number;
  lot_size_min?: number;
  lot_size_max?: number;
  stories?: number;

  // ── Features ────────────────────────────────────────────────────────────────
  has_pool?: boolean;
  has_basement?: boolean;

  // ── Views / Aesthetics ───────────────────────────────────────────────────
  is_water_front?: boolean;
  is_water_view?: boolean;
  is_mountain_view?: boolean;
  is_city_view?: boolean;
  is_park_view?: boolean;

  // ── Age / Market timing ──────────────────────────────────────────────────
  year_built_min?: number;
  year_built_max?: number;
  days_on_market_min?: number;
  days_on_market_max?: number;
  listing_date_min?: string;
  listing_date_max?: string;
  /** true = eliminate ghost active/closed overlap — use with active:true */
  latest_only?: boolean;

  // ── HOA ──────────────────────────────────────────────────────────────────
  listing_association_fee_min?: number;
  listing_association_fee_max?: number;

  // ── Result control ───────────────────────────────────────────────────────
  size?: number;
  sort?: Record<string, "asc" | "desc">;
}

export interface MLSListing {
  id: string;
  full_address: string;
  city: string;
  state: string;
  zip: string;
  listing_price: number;
  bedrooms: number;
  bathrooms: number;
  living_area: number;
  lot_size?: number;
  year_built?: number;
  has_pool?: boolean;
  days_on_market?: number;
  photos?: string[];
  listing_url?: string;
  description?: string;
  property_type?: string;
  property_sub_type?: string;
  mls_type?: string;
  status?: string;
  garage_spaces?: number;
  stories?: number;
  has_basement?: boolean;
  hoa_fee?: number;
  neighborhood?: string;
  is_waterfront?: boolean;
  is_water_view?: boolean;
  is_mountain_view?: boolean;
  is_city_view?: boolean;
  is_park_view?: boolean;
  /** Populated after photo_rank SSE — confidence score 0-1 from vision model */
  bestScore?: number;
}

export interface PhotoRankResult {
  listingId: string;
  rankedPhotos: string[];
  bestScore: number;
}
