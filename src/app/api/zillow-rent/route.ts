import https from 'node:https';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type CacheEntry = {
  currentRent: number;
  previousRent: number | null;
  delta: number | null;
  timestamp: number;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const buildCacheKey = (address: string | null, zpid: string | null) => {
  return zpid ? `zpid:${zpid}` : `addr:${address ?? 'unknown'}`;
};

const normalizeAddressText = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ');

const normalizeCountyLike = (value: string | null) => {
  if (!value) return '';
  return normalizeAddressText(value)
    .replace(/\bcounty\b/gi, '')
    .replace(/\bparish\b/gi, '')
    .trim();
};

const STREET_SUFFIX_MAP: Array<[RegExp, string]> = [
  [/\bdrive\b\.?$/i, 'Dr'],
  [/\bstreet\b\.?$/i, 'St'],
  [/\bavenue\b\.?$/i, 'Ave'],
  [/\bboulevard\b\.?$/i, 'Blvd'],
  [/\broad\b\.?$/i, 'Rd'],
  [/\blane\b\.?$/i, 'Ln'],
  [/\bcourt\b\.?$/i, 'Ct'],
  [/\bplace\b\.?$/i, 'Pl'],
  [/\bterrace\b\.?$/i, 'Ter'],
  [/\bcircle\b\.?$/i, 'Cir'],
  [/\bparkway\b\.?$/i, 'Pkwy'],
  [/\bhighway\b\.?$/i, 'Hwy'],
];

const abbreviateStreetSuffix = (street: string) => {
  let value = normalizeAddressText(street);
  for (const [pattern, replacement] of STREET_SUFFIX_MAP) {
    if (pattern.test(value)) {
      value = value.replace(pattern, replacement);
      break;
    }
  }
  return value;
};

const buildAddressVariants = (address: string | null, countyOrParish?: string | null): string[] => {
  if (!address) return [];

  const normalized = normalizeAddressText(address);
  if (!normalized) return [];

  const county = normalizeCountyLike(countyOrParish ?? null);
  const variants: string[] = [];
  const seen = new Set<string>();
  const add = (candidate?: string | null) => {
    if (!candidate) return;
    const value = normalizeAddressText(candidate);
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    variants.push(value);
  };

  const parts = normalized.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const street = parts[0];
    const streetAbbrev = abbreviateStreetSuffix(street);
    const city = parts.length >= 3 ? parts[1] : '';
    const stateZip = parts.length >= 3 ? parts.slice(2).join(', ') : parts[1];

    const zipMatch = stateZip.match(/\b(\d{5}(?:-\d{4})?)\b/);
    const stateMatch = stateZip.match(/\b([A-Za-z]{2})\b/);
    const zip = zipMatch?.[1] ?? '';
    const state = stateMatch?.[1]?.toUpperCase() ?? '';

    // Try canonical street-suffix abbreviations first (e.g. Drive -> Dr) because Zillow graph_charts is picky.
    if (streetAbbrev && streetAbbrev !== street) {
      if (streetAbbrev) add(streetAbbrev);
      if (city && state && zip) add(`${streetAbbrev}, ${city}, ${state} ${zip}`);
      if (county && state && zip) add(`${streetAbbrev}, ${county}, ${state} ${zip}`);
      if (county && zip) add(`${streetAbbrev}, ${county}, ${zip}`);
      if (state && zip) add(`${streetAbbrev}, ${state} ${zip}`);
      if (zip) add(`${streetAbbrev}, ${zip}`);
    }

    // Keep original full address high, but after the most Zillow-friendly abbreviated forms.
    add(normalized);

    // Fallbacks in order: keep state+zip, keep zip, then county-based canonical city alias, then street only.
    if (street && stateZip) add(`${street}, ${stateZip}`);
    if (street && state && zip) add(`${street}, ${state} ${zip}`);
    if (street && zip) add(`${street}, ${zip}`);
    if (street && county && state && zip) add(`${street}, ${county}, ${state} ${zip}`);
    if (street && county && zip) add(`${street}, ${county}, ${zip}`);

    if (streetAbbrev && streetAbbrev !== street) {
      if (streetAbbrev && stateZip) add(`${streetAbbrev}, ${stateZip}`);
      if (streetAbbrev && county && state && zip) add(`${streetAbbrev}, ${county}, ${state} ${zip}`);
      if (streetAbbrev && county && zip) add(`${streetAbbrev}, ${county}, ${zip}`);
      if (streetAbbrev && state) add(`${streetAbbrev}, ${state}`);
    }

    // Optional county/city-less fallback if stateZip was malformed but city exists.
    if (street && city && state) add(`${street}, ${state}`);
    if (streetAbbrev && streetAbbrev !== street && city && state) add(`${streetAbbrev}, ${state}`);

    if (street) add(street);
    if (streetAbbrev && streetAbbrev !== street) add(streetAbbrev);
  } else {
    add(normalized);
  }

  return variants;
};

type RapidAttempt = {
  requestUrl: string;
  addressTried?: string;
  rapidStatus?: number;
  reason?: string;
  rapidBody?: unknown;
};

const rapidGet = (
  url: string,
  headers: Record<string, string>,
): Promise<{ status: number; body: string }> =>
  new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            body: data,
          });
        });
      },
    );

    req.setTimeout(8000, () => {
      req.destroy(new Error('RapidAPI request timed out'));
    });
    req.on('error', reject);
    req.end();
  });

const extractRentPayload = (json: any) => {
  const chartPoints =
    json?.DataPoints?.homeValueChartData?.[0]?.points || [];

  const currentRent =
    Number(json?.Current_Rent_Zestimate) ||
    Number(json?.current_rent_zestimate) ||
    Number(json?.data?.Current_Rent_Zestimate) ||
    Number(json?.DataPoints?.Current_Rent_Zestimate) ||
    Number(json?.DataPoints?.current_rent_zestimate) ||
    Number(chartPoints?.[0]?.y);

  const previousRent = Number(chartPoints?.[1]?.y);
  const delta =
    Number.isFinite(currentRent) && Number.isFinite(previousRent)
      ? currentRent - previousRent
      : null;

  return {
    currentRent,
    previousRent: Number.isFinite(previousRent) ? previousRent : null,
    delta: Number.isFinite(delta) ? delta : null,
  };
};

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  const zpid = request.nextUrl.searchParams.get('zpid');
  const county = request.nextUrl.searchParams.get('county');
  const now = Date.now();
  const cacheKey = buildCacheKey(address, zpid);

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        currentRent: cached.currentRent,
        previousRent: cached.previousRent,
        delta: cached.delta,
        source: 'cache',
      },
      { status: 200 },
    );
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || 'private-zillow.p.rapidapi.com';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'RAPIDAPI_KEY is not configured' },
      { status: 500 },
    );
  }

  if (!address && !zpid) {
    return NextResponse.json(
      { error: 'address or zpid is required' },
      { status: 400 },
    );
  }

  try {
    const attempts: RapidAttempt[] = [];
    const addressVariants = zpid ? [] : buildAddressVariants(address, county);
    const attemptInputs =
      zpid
        ? [{ zpid, address: null as string | null }]
        : addressVariants.map((addr) => ({ zpid: null as string | null, address: addr }));

    for (const input of attemptInputs) {
      const url = new URL('https://private-zillow.p.rapidapi.com/graph_charts');
      url.searchParams.set('recent_first', 'True');
      url.searchParams.set('which', 'rent_zestimate_history');

      if (input.zpid) {
        // If zpid is present, prefer zpid-only lookup to avoid address canonicalization issues.
        url.searchParams.set('byzpid', input.zpid);
      } else if (input.address) {
        url.searchParams.set('byaddress', input.address);
      }

      const rapidHeaders = {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        // Match the successful manual tests more closely.
        accept: 'application/json',
        'accept-encoding': 'identity',
        'user-agent': 'curl/8.0',
      };
      const response = await rapidGet(url.toString(), rapidHeaders);
      const responseText = response.body;

      if (response.status < 200 || response.status >= 300) {
        attempts.push({
          requestUrl: url.toString(),
          addressTried: input.address ?? undefined,
          rapidStatus: response.status,
          reason: 'non_ok_status',
          rapidBody: responseText,
        });
        continue;
      }

      let json: any = null;
      if (responseText) {
        try {
          json = JSON.parse(responseText);
        } catch {
          attempts.push({
            requestUrl: url.toString(),
            addressTried: input.address ?? undefined,
            reason: 'parse_error',
            rapidBody: responseText,
          });
          continue;
        }
      }

      const parsed = extractRentPayload(json);
      if (!Number.isFinite(parsed.currentRent)) {
        attempts.push({
          requestUrl: url.toString(),
          addressTried: input.address ?? undefined,
          reason: 'rent_not_found',
          rapidBody: json,
        });
        continue;
      }

      cache.set(cacheKey, {
        currentRent: parsed.currentRent,
        previousRent: parsed.previousRent,
        delta: parsed.delta,
        timestamp: now,
      });

      return NextResponse.json(
        {
          currentRent: parsed.currentRent,
          previousRent: parsed.previousRent,
          delta: parsed.delta,
          source: 'live',
          matchedBy: input.zpid ? 'zpid' : 'address',
          addressUsed: input.address ?? undefined,
          attempts: attempts.length + 1,
        },
        { status: 200 },
      );
    }

    const lastAttempt = attempts[attempts.length - 1];
    return NextResponse.json(
      {
        error: 'Rent estimate not found in response',
        attemptsTried: attempts,
        requestUrl: lastAttempt?.requestUrl,
        rapidStatus: lastAttempt?.rapidStatus,
        rapidBody: lastAttempt?.rapidBody,
      },
      { status: 502 },
    );
  } catch (error) {
    if (cached) {
      return NextResponse.json(
        {
          currentRent: cached.currentRent,
          previousRent: cached.previousRent,
          delta: cached.delta,
          source: 'cache',
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to fetch rent estimate',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
