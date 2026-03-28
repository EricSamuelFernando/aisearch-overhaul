import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You classify real estate search queries into exactly two categories.
Reply with a single word only — no punctuation, no explanation.

Reply "location" if the query is solely a specific place to browse listings:
- A ZIP code, street address, city+state, or MLS number with no other intent

Reply "natural" for everything else:
- Any question, comparison, or preference ("better", "vs", "is it worth")
- Any property criteria (beds, baths, price, schools, pool, yard)
- Any conversational or advisory intent ("should I", "wondering if", "family of five")
- Queries mentioning two or more cities/areas (comparison)

When in doubt, reply "natural".`;

const EXAMPLES = [
    { role: 'user', content: '90210' },
    { role: 'assistant', content: 'location' },
    { role: 'user', content: 'Austin TX' },
    { role: 'assistant', content: 'location' },
    { role: 'user', content: '123 Main St Houston TX' },
    { role: 'assistant', content: 'location' },
    { role: 'user', content: 'i am wondering if buying in roseville is better or buying in folsom california is better for a family of five' },
    { role: 'assistant', content: 'natural' },
    { role: 'user', content: '3 bedroom homes near good schools under 500k' },
    { role: 'assistant', content: 'natural' },
    { role: 'user', content: 'homes with a pool in Plano TX' },
    { role: 'assistant', content: 'natural' },
    { role: 'user', content: 'is Houston or Dallas better for young professionals' },
    { role: 'assistant', content: 'natural' },
];

export async function POST(req: NextRequest) {
    if (!OPENAI_API_KEY) {
        return NextResponse.json({ intent: 'natural' }, { status: 200 });
    }

    let query: string;
    try {
        const body = await req.json();
        query = (body?.query ?? '').trim();
    } catch {
        return NextResponse.json({ intent: 'natural' }, { status: 200 });
    }

    if (!query) {
        return NextResponse.json({ intent: 'natural' }, { status: 200 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...EXAMPLES,
                    { role: 'user', content: query },
                ],
                max_tokens: 3,
                temperature: 0,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.error('[/api/classify] OpenAI error:', response.status);
            return NextResponse.json({ intent: 'natural' }, { status: 200 });
        }

        const data = await response.json();
        const raw = (data?.choices?.[0]?.message?.content ?? '').trim().toLowerCase();
        const intent = raw.startsWith('location') ? 'location' : 'natural';

        console.log(`[/api/classify] query="${query}" → intent="${intent}"`);
        return NextResponse.json({ intent }, { status: 200 });
    } catch (err: any) {
        if (err?.name === 'AbortError') {
            console.error('[/api/classify] OpenAI timed out');
        } else {
            console.error('[/api/classify] Error:', err?.message);
        }
        // Safe default: never wrongly redirect to browse
        return NextResponse.json({ intent: 'natural' }, { status: 200 });
    }
}
