// src/types/agent.types.ts

export interface Agent {
  // Internal
  id: string;

  // Basic identity (canonical + aliases so existing UI keeps working)
  full_name: string; // canonical, mapped from CSV "Name"
  fullName?: string; // alias for components that expect fullName
  name?: string; // alias
  Name?: string; // alias (matches CSV header exactly)
  agentEmail?: string;

  email?: string; // mapped from agentEmail

  phone?: string; // canonical, mapped from CSV "Phone"
  phoneNumber?: string; // alias for components that expect phoneNumber
  Phone?: string; // alias (matches CSV header exactly)

  Brokerage?: string;

  city?: string; // parsed from Location
  state?: string; // parsed from Location
  primary_service_regions?: string; // derived from Location for search
  brokerageName?: string; // not in CSV yet, left for future / UI compatibility

  // Raw location string
  locationRaw?: string; // original Location column

  // New columns from CSV
  jobTitle?: string;
  licenseNumber?: string;
  languages?: string;

  avgRating?: number;
  avgRatingForCustomerDisplay?: number;

  homesPurchasedLastYear?: number;
  homesSoldLastYear?: number;
  homeTransactionsLastYear?: number;
  numHomesClosed?: number;

  totalDeals?: number; // "Total Deals"
  purchaseVolumeLastYear?: number;
  salesVolumeLastYear?: number;
  transactionVolumeLastYear?: number;
  dealVolume?: number; // "Deal Volume"
  estimated_gci?: number; // Estimated Gross Commission Income (USD)
  commission_rate?: string;

  averagePurchasePriceLastYear?: number;
  averageSalePriceLastYear?: number;
  averageTransactionPriceLastYear?: number;

  highestPurchasePriceLastYear?: number;
  highestSalePriceLastYear?: number;
  highestTransactionPriceLastYear?: number;
  highestDealPrice?: number; // "Highest Deal Price"

  isIncludingPreRedfinStats?: boolean;
  isLifetimeDisplay?: boolean;

  profile_image_url?: string;
  active_listings_count?: number;
  active_listings_json?: string;
  Description?: string;
  Website?: string;
  profileUrl?: string;
  recommendationsCount?: number;
  socialMediaUrls?: string;
  forSaleCount?: number;
  forSaleMin?: number;
  forSaleMax?: number;
  recentlySoldCount?: number;
  recentlySoldMin?: number;
  recentlySoldMax?: number;
  Address?: string;
  Office?: string;
}
