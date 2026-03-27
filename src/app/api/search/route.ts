import { NextRequest, NextResponse } from 'next/server';

const AI_BACKEND = (
    process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://demo-new-ai.snaphomz.com'
).replace(/\/+$/, '');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('[Proxy /api/search] → upstream:', AI_BACKEND, '| query:', body?.query);
        const userId = req.headers.get('x-user-id') || body?.userid;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90_000); // 90s max

        const upstream = await fetch(`${AI_BACKEND}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(userId ? { 'x-user-id': userId } : {}),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        const data = await upstream.json();
        console.log('[Proxy /api/search] ← upstream status:', upstream.status, '| properties:', data?.properties?.length ?? 0);

        return NextResponse.json(data, { status: upstream.status });
    } catch (err: any) {
        if (err?.name === 'AbortError') {
            console.error('[Proxy /api/search] Upstream timed out after 90s');
            return NextResponse.json({ error: 'Search timed out. The AI backend took too long to respond.' }, { status: 504 });
        }
        console.error('[Proxy /api/search] Error:', err?.message);
        return NextResponse.json({ error: 'Upstream search failed', detail: err?.message }, { status: 502 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
        },
    });
}
