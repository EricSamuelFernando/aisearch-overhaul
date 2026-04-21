import { NextRequest, NextResponse } from 'next/server';
import { realEstatePost } from '@/lib/server/realestate-mls';

function parseModTs(ts: string | undefined): number {
  if (!ts) return 0;
  try {
    return new Date(ts.replace(' UTC', 'Z')).getTime();
  } catch {
    return 0;
  }
}

function filterProperties(records: any[]): any[] {
  if (!records?.length) return [];

  // Deduplicate by property id — keep most recent modificationTimestamp
  const byId = new Map<string, any>();
  for (const r of records) {
    const id = r?.id;
    if (!id) continue;
    const key = String(id);
    const existing = byId.get(key);
    if (!existing || parseModTs(r.modificationTimestamp) > parseModTs(existing.modificationTimestamp)) {
      byId.set(key, r);
    }
  }

  // Deduplicate by mlsNumber — keep most recent
  const byMls = new Map<string, any>();
  for (const r of byId.values()) {
    const mls = r?.listing?.mlsNumber;
    if (!mls) continue;
    const key = String(mls);
    const existing = byMls.get(key);
    if (!existing || parseModTs(r.modificationTimestamp) > parseModTs(existing.modificationTimestamp)) {
      byMls.set(key, r);
    }
  }

  return Array.from(byMls.values()).filter((r) => {
    const prop = r?.listing?.property ?? {};
    return (
      r?.id &&
      r?.listingId &&
      prop?.propertyType !== 'Residential Lease' &&
      prop?.bathroomsTotal != null && prop?.bathroomsTotal !== 0 &&
      prop?.bedroomsTotal != null && prop?.bedroomsTotal !== 0 &&
      prop?.livingArea != null && prop?.livingArea !== 0
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    console.log('[get_nearby_homes] Direct MLS call lat=%s lng=%s', latitude, longitude);

    const basePayload = {
      latitude,
      longitude,
      radius: 10,
      size: 80,
      include_photos: true,
    };

    // Two parallel MLS calls: active listings + sold listings
    const [activeResult, soldResult] = await Promise.allSettled([
      realEstatePost('/v2/MLSSearch', { ...basePayload, active: true }),
      realEstatePost('/v2/MLSSearch', { ...basePayload, sold: true }),
    ]);

    const activeRecords: any[] =
      activeResult.status === 'fulfilled' && activeResult.value.ok
        ? activeResult.value.json?.data ?? []
        : [];

    const soldRecords: any[] =
      soldResult.status === 'fulfilled' && soldResult.value.ok
        ? soldResult.value.json?.data ?? []
        : [];

    if (!activeRecords.length && !soldRecords.length) {
      return NextResponse.json({ message: 'No listings found.' });
    }

    const nearbyHomes = filterProperties(activeRecords).slice(0, 10);
    const offtheMarket = filterProperties(soldRecords).slice(0, 10);

    console.log('[get_nearby_homes] nearbyHomes=%d offtheMarket=%d', nearbyHomes.length, offtheMarket.length);

    return NextResponse.json({ nearbyHomes, offtheMarket });
  } catch (err: any) {
    console.error('[get_nearby_homes] Error:', err?.message);
    return NextResponse.json({ error: 'Internal server error', detail: err?.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
