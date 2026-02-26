import { NextRequest, NextResponse } from 'next/server';
import {
  buildMlsSearchPayloadFromQuery,
  extractMlsSearchRecords,
  normalizeMlsSearchRecord,
  realEstatePost,
} from '@/lib/server/realestate-mls';

export const runtime = 'nodejs';

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
    const upstream = await realEstatePost('/v2/MLSSearch', mergedPayload);

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: 'MLS search upstream request failed',
          upstreamStatus: upstream.status,
          upstreamBody: upstream.json,
          payload: mergedPayload,
        },
        { status: 502 },
      );
    }

    const rawRecords = extractMlsSearchRecords(upstream.json);
    const filteredRecords = rawRecords.filter(isActiveListing);
    const properties = filteredRecords
      .map((record, idx) => normalizeMlsSearchRecord(record, idx))
      .filter((p) => p && (p.latitude !== null && p.longitude !== null));

    const countHint =
      (filteredRecords.length ||
        upstream.json?.resultCount ||
        upstream.json?.count ||
        upstream.json?.data?.resultCount) ??
      properties.length;

    const finalResponse =
      properties.length > 0
        ? `Found ${countHint} property match${Number(countHint) === 1 ? '' : 'es'} from MLS.`
        : 'No MLS listings matched that search. Try adding a city/ZIP or adjusting filters.';

    return NextResponse.json({
      intent: 'property',
      properties,
      search_results: properties,
      // Legacy browse/listing page compatibility (old AI shape)
      records: properties,
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
      debug: process.env.NODE_ENV !== 'production' ? { payload: mergedPayload, upstreamStatus: upstream.status } : undefined,
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
