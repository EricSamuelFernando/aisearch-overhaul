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
        const key = String(
          rec?.listing?.listingId ??
          rec?.listingId ??
          rec?.listing_id ??
          rec?.id ??
          rec?.mlsNumber ??
          `${resultIndex}-${aggregateRaw.length}`,
        );
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

    const filteredRecords = aggregateRaw
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
