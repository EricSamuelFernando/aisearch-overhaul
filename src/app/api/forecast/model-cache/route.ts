import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MODEL_CACHE_URL =
  process.env.SNAPINTEREST_MODEL_CACHE_URL ||
  'https://snapinterest.snaphomz.com/model_cache.json';

type RawSeries = {
  forecast?: {
    dates?: string[];
    rates?: number[];
    central?: number[];
  };
};

const toForecastPoints = (series?: RawSeries) => {
  const dates = series?.forecast?.dates ?? [];
  const rates = series?.forecast?.central ?? series?.forecast?.rates ?? [];
  return dates.map((date, index) => ({
    date,
    rate: Number(rates[index] ?? 0),
  }));
};

export async function GET(request: NextRequest) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(MODEL_CACHE_URL, {
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch upstream forecast',
          status: response.status,
        },
        { status: 502 },
      );
    }

    const json = await response.json();
    const horizonParam = request.nextUrl.searchParams.get('horizon');

    if (horizonParam === '6' || horizonParam === '12' || horizonParam === '24') {
      const key = `ensemble_${horizonParam}m`;
      const points = toForecastPoints(json?.[key]);
      return NextResponse.json(
        {
          horizon: `${horizonParam}m`,
          points,
          timestamp: json?.timestamp ?? null,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=60',
          },
        },
      );
    }

    return NextResponse.json(json, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Forecast proxy failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
