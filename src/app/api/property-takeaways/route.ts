import { NextResponse } from 'next/server';
import crypto from 'crypto';

type CacheEntry = {
  summary: string;
  createdAt: number;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const buildCacheKey = (payload: any) => {
  const raw = JSON.stringify(payload ?? {});
  return crypto.createHash('sha256').update(raw).digest('hex');
};

const buildPrompt = (payload: any) => {
  const address = payload?.address?.unparsedAddress || payload?.address?.label || '';
  const city = payload?.address?.city || '';
  const state = payload?.address?.stateOrProvince || '';
  const zip = payload?.address?.zipCode || '';
  const listPrice = payload?.listPrice || '';
  const property = payload?.property || {};
  const homedetails = payload?.homedetails || {};
  const tags = Array.isArray(payload?.tags) ? payload.tags.slice(0, 8) : [];

  const nearbySchools = Array.isArray(payload?.nearbySchools)
    ? payload.nearbySchools.slice(0, 6).map((school: any) => ({
        name: school?.name,
        distance: school?.distance,
        rating: school?.rating,
      }))
    : [];

  const collegeReadiness = payload?.collegeReadiness || null;

  return {
    address,
    city,
    state,
    zip,
    listPrice,
    property,
    homedetails,
    tags,
    nearbySchools,
    collegeReadiness,
    publicRemarks: payload?.publicRemarks || '',
  };
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured.' },
        { status: 500 },
      );
    }

    const payload = await request.json();
    const cacheKey = buildCacheKey(payload);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      return NextResponse.json({ summary: cached.summary, cached: true });
    }

    const promptPayload = buildPrompt(payload);
    const systemPrompt =
      'You are Snaphomz AI. Write a concise, neutral paragraph (3-5 sentences) summarizing the property and local school readiness. Do not use bullet points. Do not invent data. If a field is missing, omit it.';

    const userPrompt = `Property data:\n${JSON.stringify(promptPayload, null, 2)}\n\nOutput a single paragraph.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to generate takeaways', details: errorText },
        { status: 500 },
      );
    }

    const json = await response.json();
    const summary = json?.choices?.[0]?.message?.content?.trim() || '';

    cache.set(cacheKey, { summary, createdAt: Date.now() });

    return NextResponse.json({ summary, cached: false });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error generating takeaways' },
      { status: 500 },
    );
  }
}
