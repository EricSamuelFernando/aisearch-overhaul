import { NextRequest } from 'next/server';

// AI_CHAT_LAMBDA_URL should point directly to the Lambda Function URL (not API Gateway)
// so that RESPONSE_STREAM mode bypasses API Gateway's buffering and 29s timeout.
// Falls back to API Gateway URL for local dev and if not set.
const AI_BACKEND = (
    process.env.AI_CHAT_LAMBDA_URL ||
    process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://demo-new-ai.snaphomz.com'
).replace(/\/+$/, '');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = req.headers.get('x-user-id') || body?.userid;

        console.log('[Proxy /api/chat] → upstream:', AI_BACKEND, '| query:', body?.query);

        const upstream = await fetch(`${AI_BACKEND}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                ...(userId ? { 'x-user-id': userId } : {}),
            },
            body: JSON.stringify(body),
        });

        if (!upstream.ok || !upstream.body) {
            return new Response(
                `data: {"type":"error","message":"Upstream error ${upstream.status}"}\n\n`,
                { status: 502, headers: { 'Content-Type': 'text/event-stream' } }
            );
        }

        // Pass the SSE stream through without buffering
        return new Response(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive',
            },
        });
    } catch (err: any) {
        console.error('[Proxy /api/chat] Error:', err?.message);
        return new Response(
            `data: {"type":"error","message":"Proxy error: ${String(err?.message).replace(/"/g, "'")}"}}\n\n`,
            { status: 502, headers: { 'Content-Type': 'text/event-stream' } }
        );
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
        },
    });
}
