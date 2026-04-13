export interface AIAssistantMessage {
  role: "user" | "assistant";
  content: string;
  listings?: MLSListing[];
}

export interface SearchContext {
  params: MLSSearchParams;
  resolvedLocation: string; // human-readable e.g. "Las Vegas, NV"
  appliedAt: string;        // ISO timestamp
}

export interface BuyerProfile {
  userId: string;
  preferredLocations: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  bedroomsMin: number | null;
  bathroomsMin: number | null;
  mustHaves: string[];
  dealBreakers: string[];
  propertyTypes: string[];
  lastUpdated: string;
}

export interface MLSSearchParams {
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  listing_price_min?: number;
  listing_price_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  has_pool?: boolean;
  has_basement?: boolean;
  is_water_front?: boolean;
  is_water_view?: boolean;
  is_mountain_view?: boolean;
  /** Residential | Commercial | Land | Rental — use to exclude leases */
  listing_property_type?: string;
  /** SFR | MFR | LAND | CONDO | MOBILE | OTHER */
  property_sub_type?: string;
  living_area_min?: number;
  living_area_max?: number;
  year_built_min?: number;
  year_built_max?: number;
  days_on_market_min?: number;
  days_on_market_max?: number;
  size?: number;
  radius?: number;
  latitude?: number;
  longitude?: number;
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
  status?: string;
}
