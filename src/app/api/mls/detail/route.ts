import { NextRequest, NextResponse } from 'next/server';
import { normalizeMlsDetailResponse, realEstatePost } from '@/lib/server/realestate-mls';

export const runtime = 'nodejs';

const toIntOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const listingIdInt = toIntOrNull(body?.listingId ?? body?.listing_id);
    const propertyIdInt = toIntOrNull(body?.propertyId ?? body?.id);
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const city = typeof body?.city === 'string' ? body.city.trim() : '';
    const state = typeof body?.state === 'string' ? body.state.trim() : typeof body?.province === 'string' ? body.province.trim() : '';
    const zip = typeof body?.zip === 'string' ? body.zip.trim() : '';

    const attempts: Record<string, any>[] = [];
    if (listingIdInt !== null) attempts.push({ listing_id: listingIdInt });
    if (propertyIdInt !== null) attempts.push({ id: propertyIdInt });
    if (address) attempts.push({ address });
    if (!address && (city || state || zip)) {
      attempts.push({ city, state, zip });
    }

    if (attempts.length === 0) {
      return NextResponse.json(
        { error: 'listingId, propertyId, or address/city/state/zip is required' },
        { status: 400 },
      );
    }

    let lastError: any = null;
    for (const attempt of attempts) {
      const upstream = await realEstatePost('/v2/MLSDetail', attempt);
      if (!upstream.ok) {
        lastError = { status: upstream.status, body: upstream.json, attempt };
        continue;
      }

      const normalized = normalizeMlsDetailResponse(upstream.json);
      return NextResponse.json(normalized);
    }

    return NextResponse.json(
      {
        error: 'MLS detail upstream request failed',
        lastError,
      },
      { status: 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'MLS detail proxy failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

