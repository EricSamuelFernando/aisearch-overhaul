import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  const zpid = request.nextUrl.searchParams.get('zpid');
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
    const url = new URL('https://private-zillow.p.rapidapi.com/graph_charts');
    url.searchParams.set('recent_first', 'True');
    url.searchParams.set('which', 'rent_zestimate_history');

    if (zpid) {
      url.searchParams.set('byzpid', zpid);
    }
    if (address) {
      url.searchParams.set('byaddress', address);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
      cache: 'no-store',
    });

    const responseText = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'RapidAPI request failed',
          rapidStatus: response.status,
          rapidBody: responseText,
          requestUrl: url.toString(),
        },
        { status: 502 },
      );
    }

    let json: any = null;
    if (responseText) {
      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        return NextResponse.json(
          {
            error: 'Failed to parse RapidAPI response',
            rapidBody: responseText,
            requestUrl: url.toString(),
          },
          { status: 502 },
        );
      }
    }

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
    const rentDelta =
      Number.isFinite(currentRent) && Number.isFinite(previousRent)
        ? currentRent - previousRent
        : null;

    if (!Number.isFinite(currentRent)) {
      return NextResponse.json(
        {
          error: 'Rent estimate not found in response',
          rapidBody: json,
          requestUrl: url.toString(),
        },
        { status: 502 },
      );
    }

    cache.set(cacheKey, {
      currentRent,
      previousRent: Number.isFinite(previousRent) ? previousRent : null,
      delta: Number.isFinite(rentDelta) ? rentDelta : null,
      timestamp: now,
    });

    return NextResponse.json(
      {
        currentRent,
        previousRent: Number.isFinite(previousRent) ? previousRent : null,
        delta: Number.isFinite(rentDelta) ? rentDelta : null,
        source: 'live',
      },
      { status: 200 },
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
