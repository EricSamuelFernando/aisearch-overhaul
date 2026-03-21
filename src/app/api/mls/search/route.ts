import { NextRequest, NextResponse } from 'next/server';
import {
  buildMlsSearchPayloadFromQuery,
  extractMlsSearchRecords,
  normalizeMlsSearchRecord,
  realEstatePost,
} from '@/lib/server/realestate-mls';

export const runtime = 'nodejs';

type UpstreamResult = { ok: boolean; status: number; json: any };

const MLS_PAGE_CACHE_TTL_MS = 3000;
const mlsPageInflight = new Map<string, Promise<UpstreamResult>>();
const mlsPageRecentCache = new Map<string, { expiresAt: number; value: UpstreamResult }>();
const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
const BACKEND_INGEST_URL = `${BACKEND_BASE}/api/mls/ingest`;
const INGEST_MAX_RECORDS = 200;

const stableKey = (value: any): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableKey).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableKey(value[k])}`).join(',')}}`;
};

const dedupedMlsSearchPagePost = async (payload: Record<string, any>): Promise<UpstreamResult> => {
  const key = stableKey(payload);
  const now = Date.now();

  const cached = mlsPageRecentCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  if (cached) {
    mlsPageRecentCache.delete(key);
  }

  const inflight = mlsPageInflight.get(key);
  if (inflight) {
    return inflight;
  }

  const promise = realEstatePost('/v2/MLSSearch', payload)
    .then((result) => {
      mlsPageRecentCache.set(key, {
        expiresAt: Date.now() + MLS_PAGE_CACHE_TTL_MS,
        value: result,
      });
      return result;
    })
    .finally(() => {
      mlsPageInflight.delete(key);
    });

  mlsPageInflight.set(key, promise);
  return promise;
};

const coerceNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const coerceString = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
};

const STATE_TO_ABBREV: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA',
  washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY', dc: 'DC', 'district of columbia': 'DC',
};

const normalizeState = (value: string | undefined) => {
  if (!value) return '';
  const raw = value.trim();
  if (!raw) return '';
  if (raw.length === 2) return raw.toUpperCase();
  return STATE_TO_ABBREV[raw.toLowerCase()] ?? raw.toUpperCase();
};

const normalizeText = (value: string | undefined) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractRecordAddressParts = (record: any) => {
  const address = record?.listing?.address ?? record?.address ?? {};
  const zip = String(address?.zipCode ?? record?.zipCode ?? record?.zip ?? '').trim();
  const city = String(address?.city ?? record?.city ?? '').trim();
  const state = String(address?.stateOrProvince ?? record?.stateOrProvince ?? record?.state ?? '').trim();
  const unparsed = String(
    address?.unparsedAddress ??
    record?.address ??
    record?.formattedAddress ??
    record?.fullAddress ??
    '',
  ).trim();
  return { zip, city, state, unparsed };
};

const shouldScopeByLocation = (payload: Record<string, any>, isMapViewportRefresh: boolean) => {
  if (isMapViewportRefresh) return false;
  return Boolean(
    coerceString(payload?.zip) ||
    coerceString(payload?.city) ||
    coerceString(payload?.state) ||
    coerceString(payload?.address),
  );
};

const applyLocationScope = (
  records: any[],
  payload: Record<string, any>,
  isMapViewportRefresh: boolean,
) => {
  if (!shouldScopeByLocation(payload, isMapViewportRefresh)) return records;

  const queryZip = coerceString(payload?.zip);
  const queryCityNorm = normalizeText(coerceString(payload?.city));
  const queryStateNorm = normalizeState(coerceString(payload?.state));
  const queryAddressHead = coerceString(payload?.address)?.split(',')[0]?.trim() ?? '';
  const queryStreetWords = normalizeText(queryAddressHead)
    .split(' ')
    .filter((word) => word.length > 2)
    .slice(0, 6);
  const queryHasStreetNumber = /^\d/.test(queryAddressHead);

  const scoped = records.filter((record) => {
    const { zip, city, state, unparsed } = extractRecordAddressParts(record);
    const recZip = zip.trim();
    const recCityNorm = normalizeText(city);
    const recStateNorm = normalizeState(state);
    const recAddressNorm = normalizeText(unparsed);

    if (queryZip) {
      const normalizedQueryZip = queryZip.slice(0, 5);
      const normalizedRecZip = recZip.slice(0, 5);
      if (!normalizedRecZip || normalizedRecZip !== normalizedQueryZip) return false;
    }

    if (queryStateNorm) {
      if (!recStateNorm || recStateNorm !== queryStateNorm) return false;
    }

    if (queryCityNorm) {
      if (!recCityNorm) return false;
      if (
        recCityNorm !== queryCityNorm &&
        !recCityNorm.includes(queryCityNorm) &&
        !queryCityNorm.includes(recCityNorm)
      ) {
        return false;
      }
    }

    if (queryHasStreetNumber && queryStreetWords.length >= 2) {
      const streetMatch = queryStreetWords.every((word) => recAddressNorm.includes(word));
      if (!streetMatch) return false;
    }

    return true;
  });

  return scoped.length > 0 ? scoped : records;
};

const dedupeListingKey = (rec: any, fallback: string) => {
  const explicit = rec?.listing?.listingId ?? rec?.listingId ?? rec?.listing_id ?? rec?.id ?? rec?.mlsNumber;
  if (explicit !== undefined && explicit !== null && explicit !== '') return String(explicit);

  const address = rec?.listing?.address ?? rec?.address ?? {};
  const unparsed = String(
    address?.unparsedAddress ??
    rec?.address ??
    rec?.formattedAddress ??
    rec?.fullAddress ??
    '',
  ).trim().toLowerCase();
  const city = String(address?.city ?? rec?.city ?? '').trim().toLowerCase();
  const state = String(address?.stateOrProvince ?? rec?.state ?? '').trim().toLowerCase();
  const zip = String(address?.zipCode ?? rec?.zipCode ?? rec?.zip ?? '').trim();
  const lat = Number(rec?.listing?.property?.latitude ?? rec?.property?.latitude ?? rec?.latitude ?? rec?.lat);
  const lng = Number(rec?.listing?.property?.longitude ?? rec?.property?.longitude ?? rec?.longitude ?? rec?.lon ?? rec?.lng);
  const price = String(rec?.listing?.listPrice ?? rec?.listPrice ?? rec?.price ?? '').trim();

  const hasCompositeSignals = Boolean(unparsed || city || zip || price);
  if (!hasCompositeSignals) return fallback;

  const latKey = Number.isFinite(lat) ? lat.toFixed(6) : '';
  const lngKey = Number.isFinite(lng) ? lng.toFixed(6) : '';
  return [unparsed, city, state, zip, latKey, lngKey, price].join('|');
};

const textFields = (record: any) =>
  [
    record?.propertyType,
    record?.listing_property_type,
    record?.listing?.propertyType,
    record?.listing?.listingPropertyType,
    record?.public_land_use,
    record?.publicLandUse,
    record?.propertySubType,
    record?.listing?.propertySubType,
    record?.property?.propertyType,
    record?.property?.propertySubType,
    record?.listing?.standardStatus,
    record?.standardStatus,
    record?.listing?.customStatus,
    record?.customStatus,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());

const isActiveListing = (record: any) => {
  const std = String(
    record?.listing?.standardStatus ??
    record?.standardStatus ??
    record?.leadTypes?.mlsStatus ??
    '',
  ).toLowerCase();
  const custom = String(record?.listing?.customStatus ?? record?.customStatus ?? '').toLowerCase();
  const isListed = record?.listing?.isListed ?? record?.isListed;
  const mlsActive = record?.listing?.leadTypes?.mlsActive ?? record?.leadTypes?.mlsActive;
  const mlsSold = record?.listing?.leadTypes?.mlsSold ?? record?.leadTypes?.mlsSold;
  const mlsPending = record?.listing?.leadTypes?.mlsPending ?? record?.leadTypes?.mlsPending;

  const inactiveTerms = ['sold', 'closed', 'withdrawn', 'expired', 'cancelled', 'canceled', 'off market'];
  if (inactiveTerms.some((t) => std.includes(t) || custom.includes(t))) return false;
  if (mlsSold === true) return false;
  if (mlsPending === true && !std.includes('active')) return false;
  if (mlsActive === true) return true;
  if (isListed === true && !inactiveTerms.some((t) => std.includes(t) || custom.includes(t))) return true;
  if (std.includes('active') || std.includes('coming soon') || std.includes('new')) return true;
  return false;
};

const isLeaseOrRentalLike = (record: any) => {
  const values = textFields(record);
  return values.some((v) =>
    /\b(residential\s+lease|lease|leased|rental|rent)\b/i.test(v),
  );
};

const isDisallowedCategory = (record: any) => {
  const values = textFields(record);
  return values.some((v) =>
    /\b(commercial|farm|land|lot|business(?:_opportunity)?|industrial)\b/i.test(v),
  );
};

const isLeaseOrRentalLikeNormalized = (record: any) =>
  isLeaseOrRentalLike(record) ||
  [
    record?.propertyType,
    record?.propertySubType,
    record?.listing?.propertyType,
    record?.listing?.propertySubType,
    record?.public_land_use,
  ]
    .filter(Boolean)
    .some((v) => /\b(residential\s+lease|lease|rental|rent)\b/i.test(String(v)));

const isDisallowedCategoryNormalized = (record: any) =>
  isDisallowedCategory(record) ||
  [record?.propertyType, record?.propertySubType, record?.public_land_use]
    .filter(Boolean)
    .some((v) => /\b(commercial|farm|land|lot|business|industrial)\b/i.test(String(v)));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = String(body?.query || '').trim();

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 },
      );
    }

    const payload = buildMlsSearchPayloadFromQuery(query);
    const isMapViewportRefresh = body?.latitude !== undefined && body?.longitude !== undefined;

    // Merge explicit UI filters from browse/filter drawers when present.
    const mergedPayload = {
      ...payload,
      bedrooms: coerceNumber(body?.bedrooms) ?? payload.bedrooms,
      bathrooms: coerceNumber(body?.bathrooms) ?? payload.bathrooms,
      listing_price_min: coerceNumber(body?.listing_price_min) ?? payload.listing_price_min,
      listing_price_max: coerceNumber(body?.listing_price_max) ?? payload.listing_price_max,
      listing_property_type: coerceString(body?.listing_property_type) ?? payload.listing_property_type,
      public_land_use: coerceString(body?.public_land_use) ?? payload.public_land_use,
      property_type: coerceString(body?.property_type) ?? payload.property_type,
      // MLS docs: geo radius searches support latitude/longitude + radius.
      latitude: coerceNumber(body?.latitude) ?? payload.latitude,
      longitude: coerceNumber(body?.longitude) ?? payload.longitude,
      radius: coerceNumber(body?.radius) ?? payload.radius,
      has_pool: typeof body?.has_pool === 'boolean' ? body.has_pool : payload.has_pool,
      additional_criteria:
        body?.additional_criteria && typeof body.additional_criteria === 'object'
          ? body.additional_criteria
          : payload.additional_criteria,
      propertyType: coerceString(body?.propertyType) ?? undefined,
    };

    // Defensive cleanup so we do not send empty values upstream.
    Object.keys(mergedPayload).forEach((key) => {
      if (
        mergedPayload[key as keyof typeof mergedPayload] === undefined ||
        mergedPayload[key as keyof typeof mergedPayload] === null ||
        mergedPayload[key as keyof typeof mergedPayload] === ''
      ) {
        delete (mergedPayload as Record<string, any>)[key];
      }
    });
    if (
      mergedPayload.additional_criteria &&
      typeof mergedPayload.additional_criteria === 'object' &&
      !Array.isArray(mergedPayload.additional_criteria) &&
      Object.keys(mergedPayload.additional_criteria).length === 0
    ) {
      delete (mergedPayload as Record<string, any>).additional_criteria;
    }
    const pageSize = isMapViewportRefresh ? 24 : 50;
    // const requestedMax = Number(process.env.MLS_DIRECT_MAX_RESULTS || 200);
    // const maxResults = isMapViewportRefresh
    //   ? pageSize
    //   : Math.min(500, Number.isFinite(requestedMax) && requestedMax > 0 ? requestedMax : 200);
    const maxResults = isMapViewportRefresh ? pageSize : 70;

    const aggregateRaw: any[] = [];
    const seenKeys = new Set<string>();
    let lastUpstream: { ok: boolean; status: number; json: any } | null = null;
    let partialUpstreamFailure:
      | { status: number; body: any; pagePayload: Record<string, any> }
      | null = null;
    let resultIndex = 0;
    let pagesFetched = 0;

    while (aggregateRaw.length < maxResults) {
      const pagePayload = {
        ...mergedPayload,
        size: Math.min(pageSize, maxResults - aggregateRaw.length),
        resultIndex,
      };
      const upstream = await dedupedMlsSearchPagePost(pagePayload);
      pagesFetched += 1;

      if (!upstream.ok) {
        if (aggregateRaw.length > 0) {
          partialUpstreamFailure = {
            status: upstream.status,
            body: upstream.json,
            pagePayload,
          };
          break;
        }
        return NextResponse.json(
          {
            error: 'MLS search upstream request failed',
            upstreamStatus: upstream.status,
            upstreamBody: upstream.json,
            payload: pagePayload,
          },
          { status: 502 },
        );
      }
      lastUpstream = upstream;

      const pageRecords = extractMlsSearchRecords(upstream.json);
      if (!pageRecords.length) break;

      for (const rec of pageRecords) {
        const key = dedupeListingKey(rec, `${resultIndex}-${aggregateRaw.length}`);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        aggregateRaw.push(rec);
        if (aggregateRaw.length >= maxResults) break;
      }

      if (isMapViewportRefresh) break;
      if (pageRecords.length < (pagePayload.size || pageSize)) break;
      resultIndex += pageRecords.length;
      if (pagesFetched >= 10) break;
    }

    const scopedRecords = applyLocationScope(aggregateRaw, mergedPayload, isMapViewportRefresh);

    const filteredRecords = scopedRecords
      .filter(isActiveListing)
      .filter((r) => !isLeaseOrRentalLike(r))
      .filter((r) => !isDisallowedCategory(r));

    const properties = filteredRecords
      .map((record, idx) => normalizeMlsSearchRecord(record, idx))
      .filter((p) => p && (p.latitude !== null && p.longitude !== null))
      .filter((p) => !isLeaseOrRentalLikeNormalized(p))
      .filter((p) => !isDisallowedCategoryNormalized(p));

    const countHint =
      ((lastUpstream?.json?.resultCount ||
        lastUpstream?.json?.count ||
        lastUpstream?.json?.data?.resultCount) as number | undefined) ??
      properties.length;

    const finalResponse =
      properties.length > 0
        ? `Found ${countHint} property match${Number(countHint) === 1 ? '' : 'es'} from MLS.`
        : 'No MLS listings matched that search. Try adding a city/ZIP or adjusting filters.';

    void fetch(BACKEND_INGEST_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        records: aggregateRaw.slice(0, INGEST_MAX_RECORDS),
        source: 'mls_bypass',
      }),
      cache: 'no-store',
    }).catch(() => null);

    return NextResponse.json({
      intent: 'property',
      properties,
      // search_results: properties,
      // // Legacy browse/listing page compatibility (old AI shape)
      // records: properties,
      result: {
        records: properties,
        search_query: query,
      },
      search_query: query,
      final_response: finalResponse,
      answer: finalResponse,
      metadata: {
        response_mode: 'cards_only',
        source: 'mls_bypass',
      },
      query_history_formatted: query,
      debug:
        process.env.NODE_ENV !== 'production'
          ? {
            payload: mergedPayload,
            upstreamStatus: lastUpstream?.status,
            pagesFetched,
            aggregated: aggregateRaw.length,
            scoped: scopedRecords.length,
            partialUpstreamFailure,
          }
          : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'MLS search proxy failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
