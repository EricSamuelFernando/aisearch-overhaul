import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Agent } from '@/types/agent.types';

const CSV_FILE_PATH = path.join(
  process.cwd(),
  'public/data/agents_data.csv'
);

// Cache parsed agents in memory so we don't keep
// re-reading and parsing the large CSV file.
let cachedAgents: Agent[] | null = null;

type RawRow = Record<string, any>;

function isCsvEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized.length === 0 || normalized === 'n/a';
  }
  return false;
}

function toNumber(value: any): number | undefined {
  if (isCsvEmpty(value)) return undefined;
  const n = Number(String(value).replace(/[$,]/g, ''));
  return Number.isNaN(n) ? undefined : n;
}

function sanitizeImageUrl(value: any): string | undefined {
  if (!value) return undefined;
  const url = String(value).trim();
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/')
  ) {
    return url;
  }
  return undefined;
}

// Helper: Cleans invisible characters (BOM) from keys
function cleanKeys(row: RawRow): RawRow {
  const newRow: RawRow = {};
  Object.keys(row).forEach((key) => {
    const cleanKey = key.replace(/^\uFEFF/, '').trim();
    newRow[cleanKey] = row[key];
  });
  return newRow;
}

// Helper: Smart Search to find values even if column names vary slightly
function findValue(row: RawRow, searchTerms: string[]): string | undefined {
  const keys = Object.keys(row);
  // direct match first
  for (const term of searchTerms) {
    if (row[term]) return String(row[term]).trim();
  }
  // case-insensitive exact match
  for (const term of searchTerms) {
    const foundKey = keys.find((k) => k.toLowerCase() === term.toLowerCase());
    if (foundKey && row[foundKey]) return String(row[foundKey]).trim();
  }
  return undefined;
}

// Helper: normalize "alin-glogovicean" -> "Alin Glogovicean"
function normalizeName(raw: string): string {
  if (!raw) return '';
  // replace hyphens/underscores with spaces
  const cleaned = raw.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned
    .split(/\s+/)
    .map((part) =>
      part.length === 0
        ? ''
        : part[0].toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(' ');
}

export async function getAgentsFromCSV(): Promise<Agent[]> {
  if (cachedAgents) {
    return cachedAgents;
  }

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`CSV file not found at: ${CSV_FILE_PATH}`);
    return [];
  }

  const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');

  const parsed = Papa.parse<RawRow>(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  // @ts-ignore
  const agents: Agent[] = parsed.data.map((rawRow, index) => {
    const row = cleanKeys(rawRow);

    const rawNameFromCsv =
      findValue(row, ['Name', 'name', 'Full Name', 'Agent Name']) || '';
    const normalizedName = normalizeName(rawNameFromCsv);

    const phoneFromCsv = findValue(row, [
      'Phone',
      'phone',
      'PhoneNumber',
      'Cell',
      'Mobile',
      'agentPhone',
      'Office Phone',
    ]);
    const brokerageFromCsv = findValue(row, [
      'Brokerage',
      'brokerage',
      'Broker',
      'Company',
    ]);
    const emailFromCsv = findValue(row, ['agentEmail', 'email', 'Email']);
    const locationRaw =
      findValue(row, ['Location', 'location', 'Region']) || '';

    // Commission rate - keep as raw string (e.g. "2.5%" or "2.5")
    const commissionRateFromCsv = findValue(row, [
      'commission_rate',
      'Commission Rate',
      'commissionRate',
      'Commission rate',
    ]);

    let firstName = '';
    let lastName = '';
    if (normalizedName) {
      const parts = normalizedName.trim().split(' ');
      if (parts.length > 0) firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(' ');
    }

    let city: string | undefined;
    let state: string | undefined;
    if (locationRaw) {
      const parts = locationRaw.split(',').map((p) => p.trim());
      city = parts[0] || undefined;
      state = parts[1] || undefined;
    }

    const avgRating = toNumber(row['avgRating']);

    return {
      id: String(index + 1),

      // Use normalized name for all display/name fields
      Name: normalizedName,
      Phone: phoneFromCsv,
      Brokerage: brokerageFromCsv,
      Location: locationRaw,
      agentEmail: emailFromCsv,

      // Total Sales (lifetime)
      dealVolume: toNumber(row['Deal Volume']),

      // Sales (last 12 months)
      salesVolumeLastYear: toNumber(row['salesVolumeLastYear']),
      purchaseVolumeLastYear: toNumber(row['purchaseVolumeLastYear']),
      transactionVolumeLastYear: toNumber(row['transactionVolumeLastYear']),

      // Estimated Gross Commission Income (from CSV, in dollars)
      estimated_gci: toNumber(row['estimated_gci']),
      commission_rate: commissionRateFromCsv,

      full_name: normalizedName,
      fullName: normalizedName,
      name: normalizedName,
      firstName,
      lastName,

      phone: phoneFromCsv,
      phoneNumber: phoneFromCsv,

      email: emailFromCsv,
      brokerageName: brokerageFromCsv,

      city,
      state,
      primary_service_regions: locationRaw || undefined,
      locationRaw: locationRaw || undefined,

      jobTitle: findValue(row, ['jobTitle', 'Job Title']),
      licenseNumber: findValue(row, ['licenseNumber', 'License Number']),
      languages: findValue(row, ['languages', 'Languages']),

      // Rating fields
      avgRating,
      rating: avgRating, // alias so UI can use agent.rating

      homesSoldLastYear: toNumber(row['homesSoldLastYear']),
      homesPurchasedLastYear: toNumber(row['homesPurchasedLastYear']),
      homeTransactionsLastYear: toNumber(row['homeTransactionsLastYear']),
      numHomesClosed: toNumber(row['numHomesClosed']),
      totalDeals: toNumber(row['Total Deals']),

      averagePurchasePriceLastYear: toNumber(
        row['averagePurchasePriceLastYear']
      ),
      averageSalePriceLastYear: toNumber(row['averageSalePriceLastYear']),
      averageTransactionPriceLastYear: toNumber(
        row['averageTransactionPriceLastYear']
      ),

      highestPurchasePriceLastYear: toNumber(
        row['highestPurchasePriceLastYear']
      ),
      highestSalePriceLastYear: toNumber(row['highestSalePriceLastYear']),

      // Highest / Cheapest Deal values from CSV
      highestTransactionPriceLastYear: toNumber(
        row['highestTransactionPriceLastYear']
      ),
      highestDealPrice: toNumber(row['Highest Deal Price']),

      profile_image_url: sanitizeImageUrl(row['profile_image_url']),
      active_listings_count: toNumber(row['active_listings_count']),
      active_listings_json: findValue(row, ['active_listings_json']),

      Description: findValue(row, ['Description']),
      Website: findValue(row, ['Website']),
      profileUrl: findValue(row, ['Profile Url', 'Profile URL']),
      recommendationsCount: toNumber(row['Recommendations Count']),
      socialMediaUrls: findValue(row, ['Social Media Urls']),
      forSaleCount: toNumber(row['For Sale Count']),
      forSaleMin: toNumber(row['For Sale Min']),
      forSaleMax: toNumber(row['For Sale Max']),
      recentlySoldCount: toNumber(row['Recently Sold Count']),
      recentlySoldMin: toNumber(row['Recently Sold Min']),
      recentlySoldMax: toNumber(row['Recently Sold Max']),
      Address: findValue(row, ['Address']),
      Office: findValue(row, ['Office']),
    };
  });

  cachedAgents = agents;
  return agents;
}

export async function getAgentById(id: string): Promise<Agent | undefined> {
  const agents = await getAgentsFromCSV();
  return agents.find((agent) => agent.id === id);
}

export async function searchAgents(query: string): Promise<Agent[]> {
  const agents:any = await getAgentsFromCSV();
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) return agents;

  return agents.filter((agent:any) => {
    const haystack = [
      agent.Name,
      agent.agentEmail,
      agent.Location,
      agent.Brokerage,
      agent.Phone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(trimmed);
  });
}
