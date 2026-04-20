import { NextRequest } from 'next/server';

type ContextCacheEntry = {
  value: Record<string, any>;
  expiresAt: number;
};

const AI_BACKEND = (
  process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://demo-new-ai.snaphomz.com'
).replace(/\/+$/, '');

const CACHE_TTL_MS = 60 * 60 * 1000;
const CONTEXT_CACHE_KEY = '__ask_ai_context_cache__';

function getCache(): Map<string, ContextCacheEntry> {
  const g = globalThis as any;
  if (!g[CONTEXT_CACHE_KEY]) {
    g[CONTEXT_CACHE_KEY] = new Map<string, ContextCacheEntry>();
  }
  return g[CONTEXT_CACHE_KEY];
}

function getContextFromCache(contextId?: string | null): Record<string, any> | null {
  if (!contextId) return null;
  const cache = getCache();
  const entry = cache.get(contextId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(contextId);
    return null;
  }
  return entry.value;
}

function setContextInCache(contextId: string, value: Record<string, any>) {
  const cache = getCache();
  cache.set(contextId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function makeContextId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildContextBlock(context?: Record<string, any> | null): string {
  if (!context) return '';
  const lines: string[] = [];
  for (const [key, rawValue] of Object.entries(context)) {
    if (rawValue === null || rawValue === undefined || rawValue === '') continue;
    const value =
      typeof rawValue === 'string'
        ? rawValue
        : Array.isArray(rawValue)
          ? rawValue.join(', ')
          : JSON.stringify(rawValue);
    lines.push(`${key}: ${value}`);
  }
  return lines.join('\n');
}

function buildAugmentedQuery(query: string, context?: Record<string, any> | null): string {
  const contextBlock = buildContextBlock(context);
  if (!contextBlock) return query;
  return [
    'You are a real estate assistant. Answer specifically about the property context below.',
    '',
    'Property context:',
    contextBlock,
    '',
    `User question: ${query}`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get('x-user-id') || body?.userid;

    const query = String(body?.query || '').trim();
    if (!query) {
      return new Response(
        `data: {"type":"error","message":"query is required"}\n\n`,
        { status: 400, headers: { 'Content-Type': 'text/event-stream' } },
      );
    }

    const inputContext = body?.context && typeof body.context === 'object' ? body.context : null;
    const requestedContextId = typeof body?.context_id === 'string' ? body.context_id : null;

    let effectiveContextId = requestedContextId || null;
    let effectiveContext = inputContext || getContextFromCache(requestedContextId);

    if (inputContext) {
      effectiveContextId = effectiveContextId || makeContextId();
      setContextInCache(effectiveContextId, inputContext);
    }

    const augmentedQuery = buildAugmentedQuery(query, effectiveContext);
    const { context, context_id, ...passthrough } = body || {};

    // DISABLED: upstream proxy to demo-new-ai.snaphomz.com is no longer used.
    // The listing detail Ask AI is now wired to /api/ai-assistant (landing page AI).
    // console.log('[Proxy /api/ask-ai] -> upstream:', AI_BACKEND, '| query:', query);
    //
    // const upstream = await fetch(`${AI_BACKEND}/api/chat`, { ... });
    // ...

    return new Response(
      `data: {"type":"error","message":"/api/ask-ai is deprecated. Use /api/ai-assistant."}\n\ndata: {"type":"done"}\n\n`,
      { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } },
    );
  } catch (err: any) {
    console.error('[Proxy /api/ask-ai] Error:', err?.message);
    const safeMessage = String(err?.message || '').replace(/"/g, "'");
    return new Response(
      `data: {"type":"error","message":"Proxy error: ${safeMessage}"}\n\n`,
      { status: 502, headers: { 'Content-Type': 'text/event-stream' } },
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
