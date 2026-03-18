import { NextRequest, NextResponse } from 'next/server';

const AI_BACKEND = (
    process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://demo-new-ai.snaphomz.com'
).replace(/\/+$/, '');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { listingId } = body;
        
        console.log('[Proxy /api/get_nearby_homes] → upstream:', AI_BACKEND, '| listingId:', listingId);

        if (!listingId) {
            return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90_000); // 90s max

        const upstream = await fetch(`${AI_BACKEND}/api/get_nearby_homes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ listingId }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!upstream.ok) {
            const errorText = await upstream.text();
            console.error('[Proxy /api/get_nearby_homes] Upstream error:', upstream.status, errorText);
            return NextResponse.json({ error: 'Upstream request failed', detail: errorText }, { status: upstream.status });
        }

        const data = await upstream.json();
        console.log('[Proxy /api/get_nearby_homes] ← upstream success');

        return NextResponse.json(data, { status: upstream.status });
    } catch (err: any) {
        if (err?.name === 'AbortError') {
            console.error('[Proxy /api/get_nearby_homes] Upstream timed out after 90s');
            return NextResponse.json({ error: 'Request timed out. The AI backend took too long to respond.' }, { status: 504 });
        }
        console.error('[Proxy /api/get_nearby_homes] Error:', err?.message);
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
