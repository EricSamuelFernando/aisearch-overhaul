import { NextRequest, NextResponse } from 'next/server';

type CacheEntry = {
  ratePct: number;
  date: string | null;
  timestamp: number;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FALLBACK_RATE = 6.5;

const cache = new Map<string, CacheEntry>();

const getSeriesForTerm = (term: string) => {
  return term === '15' ? 'MORTGAGE15US' : 'MORTGAGE30US';
};

const buildResponse = (entry: CacheEntry, source: string) => {
  return NextResponse.json(
    {
      ratePct: entry.ratePct,
      date: entry.date,
      source,
    },
    {
      status: 200,
    },
  );
};

export async function GET(request: NextRequest) {
  const termParam = request.nextUrl.searchParams.get('term') ?? '30';
  const term = termParam === '15' ? '15' : '30';
  const seriesId = getSeriesForTerm(term);
  const now = Date.now();

  const cached = cache.get(seriesId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return buildResponse(cached, 'cache');
  }

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    const fallbackEntry: CacheEntry = cached ?? {
      ratePct: FALLBACK_RATE,
      date: null,
      timestamp: now,
    };
    cache.set(seriesId, fallbackEntry);
    return buildResponse(fallbackEntry, cached ? 'cache' : 'fallback');
  }

  try {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('limit', '1');
    url.searchParams.set('file_type', 'json');
    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`FRED request failed: ${response.status}`);
    }

    const json = await response.json();
    const observation = json?.observations?.[0];
    const rateValue = Number(observation?.value);
    const dateValue = observation?.date ?? null;

    if (!Number.isFinite(rateValue)) {
      throw new Error('Invalid rate value');
    }

    const entry: CacheEntry = {
      ratePct: rateValue,
      date: dateValue,
      timestamp: now,
    };

    cache.set(seriesId, entry);
    return buildResponse(entry, 'live');
  } catch (error) {
    const fallbackEntry: CacheEntry = cached ?? {
      ratePct: FALLBACK_RATE,
      date: null,
      timestamp: now,
    };
    cache.set(seriesId, fallbackEntry);
    return buildResponse(fallbackEntry, cached ? 'cache' : 'fallback');
  }
}
