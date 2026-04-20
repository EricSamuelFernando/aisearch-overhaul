import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
    // Basic validation — must be http(s) URL
    new URL(decoded);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  try {
    const res = await fetch(decoded, {
      headers: {
        'x-api-key': process.env.REALESTATE_API_KEY ?? '',
        'Referer': 'https://realestateapi.com',
        'User-Agent': 'Snaphomz/1.0',
      },
    });

    if (!res.ok) return new NextResponse(null, { status: res.status });

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    return new NextResponse(res.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
