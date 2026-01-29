import { Location } from '@/components/sell/listingPreview/Location';
import { Agent } from '@/types/agent.types';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/graphql';

let cachedAgents: Agent[] | null = null;

type ExternalAgent = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  brokerage?: string | null;
  locationRaw?: string | null;
  city?: string | null;
  state?: string | null;
  primary_service_regions?: string | null;
  jobTitle?: string | null;
  licenseNumber?: string | null;
  Location?: string | null;
  languages?: string | null;
  avgRating?: number | null;
  avgRatingForCustomerDisplay?: number | null;
  homesPurchasedLastYear?: number | null;
  homesSoldLastYear?: number | null;
  homeTransactionsLastYear?: number | null;
  numHomesClosed?: number | null;
  totalDeals?: number | null;
  purchaseVolumeLastYear?: number | null;
  salesVolumeLastYear?: number | null;
  transactionVolumeLastYear?: number | null;
  dealVolume?: number | null;
  estimated_gci?: number | null;
  commission_rate?: string | null;
  averagePurchasePriceLastYear?: number | null;
  averageSalePriceLastYear?: number | null;
  averageTransactionPriceLastYear?: number | null;
  highestPurchasePriceLastYear?: number | null;
  highestSalePriceLastYear?: number | null;
  highestTransactionPriceLastYear?: number | null;
  highestDealPrice?: number | null;
  profile_image_url?: string | null;
  active_listings_count?: number | null;
  active_listings_json?: string | null;
  description?: string | null;
  website?: string | null;
  profileUrl?: string | null;
  recommendationsCount?: number | null;
  socialMediaUrls?: string | null;
  forSaleCount?: number | null;
  forSaleMin?: number | null;
  forSaleMax?: number | null;
  recentlySoldCount?: number | null;
  recentlySoldMin?: number | null;
  recentlySoldMax?: number | null;
  address?: string | null;
  office?: string | null;
};

const externalAgentFields = `
  id
  full_name
  email
  phone
  brokerage
  locationRaw
  city
  state
  primary_service_regions
  jobTitle
  licenseNumber
  languages
  avgRating
  avgRatingForCustomerDisplay
  homesPurchasedLastYear
  homesSoldLastYear
  homeTransactionsLastYear
  numHomesClosed
  totalDeals
  purchaseVolumeLastYear
  salesVolumeLastYear
  transactionVolumeLastYear
  dealVolume
  estimated_gci
  commission_rate
  averagePurchasePriceLastYear
  averageSalePriceLastYear
  averageTransactionPriceLastYear
  highestPurchasePriceLastYear
  highestSalePriceLastYear
  highestTransactionPriceLastYear
  highestDealPrice
  profile_image_url
  active_listings_count
  active_listings_json
  description
  website
  profileUrl
  recommendationsCount
  socialMediaUrls
  forSaleCount
  forSaleMin
  forSaleMax
  recentlySoldCount
  recentlySoldMin
  recentlySoldMax
  address
  office
`;

function mapExternalAgentToAgent(agent: any): any {
  const fullName = agent.full_name || '';
  const location =
    agent.locationRaw ||
    [agent.city, agent.state].filter(Boolean).join(', ') ||
    undefined;

  return {
    id: agent.id,
    full_name: fullName,
    fullName,
    name: fullName,
    Name: fullName,
    agentEmail: agent.email || undefined,
    email: agent.email || undefined,
    phone: agent.phone || undefined,
    phoneNumber: agent.phone || undefined,
    Phone: agent.phone || undefined,
    Brokerage: agent.brokerage || undefined,
    brokerageName: agent.brokerage || undefined,
    Location: location || undefined,
    locationRaw: agent.locationRaw || undefined,
    city: agent.city || undefined,
    state: agent.state || undefined,
    primary_service_regions: agent.primary_service_regions || undefined,
    jobTitle: agent.jobTitle || undefined,
    licenseNumber: agent.licenseNumber || undefined,
    languages: agent.languages || undefined,
    avgRating: agent.avgRating || undefined,
    avgRatingForCustomerDisplay: agent.avgRatingForCustomerDisplay || undefined,
    homesPurchasedLastYear: agent.homesPurchasedLastYear || undefined,
    homesSoldLastYear: agent.homesSoldLastYear || undefined,
    homeTransactionsLastYear: agent.homeTransactionsLastYear || undefined,
    numHomesClosed: agent.numHomesClosed || undefined,
    totalDeals: agent.totalDeals || undefined,
    purchaseVolumeLastYear: agent.purchaseVolumeLastYear || undefined,
    salesVolumeLastYear: agent.salesVolumeLastYear || undefined,
    transactionVolumeLastYear: agent.transactionVolumeLastYear || undefined,
    dealVolume: agent.dealVolume || undefined,
    estimated_gci: agent.estimated_gci || undefined,
    commission_rate: agent.commission_rate || undefined,
    averagePurchasePriceLastYear: agent.averagePurchasePriceLastYear || undefined,
    averageSalePriceLastYear: agent.averageSalePriceLastYear || undefined,
    averageTransactionPriceLastYear:
      agent.averageTransactionPriceLastYear || undefined,
    highestPurchasePriceLastYear:
      agent.highestPurchasePriceLastYear || undefined,
    highestSalePriceLastYear: agent.highestSalePriceLastYear || undefined,
    highestTransactionPriceLastYear:
      agent.highestTransactionPriceLastYear || undefined,
    highestDealPrice: agent.highestDealPrice || undefined,
    profile_image_url: agent.profile_image_url || undefined,
    active_listings_count: agent.active_listings_count || undefined,
    active_listings_json: agent.active_listings_json || undefined,
    Description: agent.description || undefined,
    Website: agent.website || undefined,
    profileUrl: agent.profileUrl || undefined,
    recommendationsCount: agent.recommendationsCount || undefined,
    socialMediaUrls: agent.socialMediaUrls || undefined,
    forSaleCount: agent.forSaleCount || undefined,
    forSaleMin: agent.forSaleMin || undefined,
    forSaleMax: agent.forSaleMax || undefined,
    recentlySoldCount: agent.recentlySoldCount || undefined,
    recentlySoldMin: agent.recentlySoldMin || undefined,
    recentlySoldMax: agent.recentlySoldMax || undefined,
    Address: agent.address || undefined,
    Office: agent.office || undefined,
  };
}

async function fetchExternalAgents({
  search,
  limit,
  offset,
}: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: ExternalAgent[]; total: number }> {
  const response = await fetch(GRAPHQL_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query ExternalAgents($search: String, $limit: Int, $offset: Int) {
          externalAgents(search: $search, limit: $limit, offset: $offset) {
            total
            data {
              ${externalAgentFields}
            }
          }
        }
      `,
      variables: { search, limit, offset },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return { data: [], total: 0 };
  }

  const json = await response.json();
  if (json?.errors?.length) {
    return { data: [], total: 0 };
  }
  return json?.data?.externalAgents || { data: [], total: 0 };
}

async function fetchExternalAgentById(id: string): Promise<ExternalAgent | null> {
  const response = await fetch(GRAPHQL_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query ExternalAgentById($id: String!) {
          externalAgentById(id: $id) {
            ${externalAgentFields}
          }
        }
      `,
      variables: { id },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  if (json?.errors?.length) {
    return null;
  }
  return json?.data?.externalAgentById || null;
}

export async function getAgentsFromCSV(options?: {
  limit?: number;
  offset?: number;
}): Promise<Agent[]> {
  const limit = options?.limit ?? 50000;
  const offset = options?.offset ?? 0;
  const useCache = !options || (!options.limit && !options.offset);

  if (useCache && cachedAgents) {
    return cachedAgents;
  }

  const { data } = await fetchExternalAgents({
    limit,
    offset,
  });
  const mapped = data.map(mapExternalAgentToAgent);
  if (useCache) {
    cachedAgents = mapped;
  }
  return mapped;
}

export async function getAgentById(id: string): Promise<Agent | undefined> {
  const agent = await fetchExternalAgentById(id);
  if (!agent) return undefined;
  return mapExternalAgentToAgent(agent);
}

export async function searchAgents(
  query: string,
  options?: { limit?: number; offset?: number },
): Promise<Agent[]> {
  const trimmed = query.trim();
  const limit = options?.limit ?? 50000;
  const offset = options?.offset ?? 0;
  if (!trimmed) {
    return getAgentsFromCSV({ limit, offset });
  }

  const { data } = await fetchExternalAgents({
    search: trimmed,
    limit,
    offset,
  });
  return data.map(mapExternalAgentToAgent);
}

