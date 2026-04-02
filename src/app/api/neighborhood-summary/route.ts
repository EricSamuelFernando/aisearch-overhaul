import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';

const CATEGORIES = [
  { key: 'dining',  label: 'Dining',  icon: '🍽️', types: ['restaurant', 'cafe', 'bar'] },
  { key: 'grocery', label: 'Grocery', icon: '🛒', types: ['grocery_store', 'supermarket'] },
  { key: 'parks',   label: 'Parks',   icon: '🌳', types: ['park', 'national_park', 'playground'] },
  { key: 'transit', label: 'Transit', icon: '🚌', types: ['transit_station', 'bus_station', 'subway_station', 'light_rail_station'] },
] as const;

// In-process cache — avoids duplicate Places API calls across page navigations
const ROUTE_CACHE = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 h

async function searchCategory(
  apiKey: string,
  lat: number,
  lng: number,
  types: readonly string[],
): Promise<{ count: number; topNames: string[] }> {
  try {
    const res = await fetch(PLACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName',
      },
      body: JSON.stringify({
        includedTypes: [...types],
        maxResultCount: 10,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 1609, // ~1 mile
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { count: 0, topNames: [] };
    const data = await res.json();
    const places = Array.isArray(data?.places) ? data.places : [];
    const topNames = places
      .slice(0, 3)
      .map((p: any) => p?.displayName?.text ?? '')
      .filter(Boolean);
    return { count: places.length, topNames };
  } catch {
    return { count: 0, topNames: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const cached = ROUTE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    const results = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const data = await searchCategory(apiKey, lat, lng, cat.types);
        return { key: cat.key, label: cat.label, icon: cat.icon, ...data };
      }),
    );

    const summary: Record<string, { label: string; icon: string; count: number; topNames: string[] }> = {};
    for (const r of results) {
      summary[r.key] = { label: r.label, icon: r.icon, count: r.count, topNames: r.topNames };
    }

    const payload = { summary };
    ROUTE_CACHE.set(cacheKey, { data: payload, ts: Date.now() });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: 'Neighborhood summary failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
