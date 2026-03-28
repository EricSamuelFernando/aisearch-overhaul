import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are an AI assistant embedded in the Snaphomz browse listings page. You help users find homes by controlling the page's search filters, location, and map UI. You do NOT fetch property data yourself — the page's own MLS search fires automatically after your response updates the filters.

Every message includes the user's text, current page state (location, active filters, map state, visible listing summaries), and recent conversation history.

RESPONSE SCHEMA — return ONLY this JSON object, no other text:
{
  "city": string | null,
  "state": string | null,
  "beds": number | null,
  "baths": number | null,
  "priceMin": number | null,
  "priceMax": number | null,
  "propertyType": string | null,
  "subcategories_add": string[],
  "subcategories_remove": string[],
  "clear_filters": boolean,
  "map_overlay": string | null,
  "poi_add": string[],
  "poi_remove": string[],
  "view_mode": string | null,
  "compare_mode": boolean | null,
  "clear_draw": boolean,
  "reply": string
}

FIELD RULES:
- null = do not change this field
- beds / baths: 0 = clear the filter, positive integer = set minimum count
- priceMin / priceMax: 0 = clear the filter, positive number = set price bound in dollars
- propertyType: null = no change, "" = clear, "RESIDENTIAL" = houses/residential, "RESIDENTIAL_INCOME" = income/multi-family
- city + state: set ONLY when user explicitly names a different location. Use 2-letter US state codes (CA, TX, NY…).
- clear_filters: true ONLY when user says "clear/reset/remove all filters" — does NOT change location
- subcategories_add / subcategories_remove: always arrays (empty [] if nothing to change)
  Valid values: has_pool, is_park_view, is_water_view, is_city_view, is_water_front, is_mountain_view
- map_overlay: null = no change, "schools" = show school district boundaries on map, "none" = hide
  IMPORTANT: ANY mention of schools / school districts / school zones → use map_overlay, NEVER poi_add
- poi_add / poi_remove: always arrays (empty [] if nothing to change)
  Valid values: restaurants, gyms, hospitals, parks  ← schools is NOT valid here, use map_overlay instead
  Use poi_add to show markers, poi_remove to hide them
- view_mode: null = no change, "map" = switch to map view, "grid" = switch to grid view
- compare_mode: null = no change, true = enable compare mode, false = disable compare mode
- clear_draw: true ONLY when user asks to clear/remove a drawn area or polygon
- reply: 1 short sentence confirming what you did, or answering the question. Be direct.

COMPOUND QUERIES — handle multiple changes in one response:
"3 bed homes in Austin TX under $600k with a pool"
→ { city: "Austin", state: "TX", beds: 3, priceMax: 600000, subcategories_add: ["has_pool"], all others null/[]/false, reply: "Searching 3-bed homes in Austin, TX under $600k with a pool." }

"show school districts and switch to map view"
→ { map_overlay: "schools", view_mode: "map", poi_add: [], poi_remove: [], all others null/[]/false, reply: "Showing school districts in map view." }

"show me gyms and restaurants near these homes"
→ { poi_add: ["gyms", "restaurants"], poi_remove: [], all others null/[]/false, reply: "Showing gyms and restaurants on the map." }

"show me schools near these homes" / "show school zones" / "which school district?"
→ { map_overlay: "schools", poi_add: [], poi_remove: [], all others null/[]/false, reply: "Showing school districts on the map." }

"hide the gyms"
→ { poi_add: [], poi_remove: ["gyms"], all others null/[]/false, reply: "Gyms hidden." }

QUESTION HANDLING — if user asks about visible listings ("what's the cheapest?", "how many results?"):
Use topProperties in context. Set all action fields to null / [] / false. Put the answer in reply.

CONVERSATIONAL MEMORY — use history to resolve follow-ups:
"make it 4 beds instead" after "show me 3 beds" → beds: 4 (not null)
"now show Austin" → city: "Austin", state: inferred or ask

IMPORTANT: Only change the fields the user explicitly requests. Never reset filters the user did not mention.`;

interface BrowseContext {
  city: string | null;
  state: string | null;
  beds: number | null;
  baths: number | null;
  priceMin: number | null;
  priceMax: number | null;
  propertyType: string | null;
  activeSubCategories: string[];
  mapOverlay: string;
  currentView: string;
  isCompareMode: boolean;
  resultCount: number;
  topProperties: Array<{ address: string; price: number; beds: number; baths: number }>;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { message, context, history = [] } = body as {
      message: string;
      context: BrowseContext;
      history: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Build context summary injected into the user turn
    const ctx = context || {};
    const locationStr = ctx.city ? `${ctx.city}${ctx.state ? `, ${ctx.state}` : ''}` : 'not set';
    const filtersStr = [
      ctx.beds != null ? `beds≥${ctx.beds}` : null,
      ctx.baths != null ? `baths≥${ctx.baths}` : null,
      ctx.priceMin != null ? `price≥$${ctx.priceMin.toLocaleString()}` : null,
      ctx.priceMax != null ? `price≤$${ctx.priceMax.toLocaleString()}` : null,
      ctx.propertyType ? `type=${ctx.propertyType}` : null,
    ].filter(Boolean).join(', ') || 'none';

    const subCatsStr = ctx.activeSubCategories?.length > 0
      ? ctx.activeSubCategories.join(', ')
      : 'none';

    const topPropsStr = Array.isArray(ctx.topProperties) && ctx.topProperties.length > 0
      ? ctx.topProperties
          .map((p, i) => `${i + 1}. ${p.address} — $${Number(p.price || 0).toLocaleString()}, ${p.beds}bd/${p.baths}ba`)
          .join('\n')
      : 'none loaded yet';

    const contextBlock = `PAGE STATE:
Location: ${locationStr}
Active filters: ${filtersStr}
Active subcategories: ${subCatsStr}
Map overlay: ${ctx.mapOverlay || 'none'}
Current view: ${ctx.currentView || 'map'}
Compare mode: ${ctx.isCompareMode ? 'on' : 'off'}
Total results on screen: ${ctx.resultCount ?? 0}
Top visible listings:
${topPropsStr}`;

    const messages = [
      // Trim history to last 6 messages (3 turns) to stay within token budget
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: `${contextBlock}\n\nUser: ${message}` },
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 350,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('[BrowseAI] OpenAI error:', openaiRes.status, errText);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const openaiJson = await openaiRes.json();
    const raw = openaiJson?.choices?.[0]?.message?.content?.trim() || '{}';

    let delta: Record<string, any>;
    try {
      delta = JSON.parse(raw);
    } catch {
      console.error('[BrowseAI] Failed to parse LLM response:', raw);
      return NextResponse.json({
        city: null, state: null, beds: null, baths: null,
        priceMin: null, priceMax: null, propertyType: null,
        subcategories_add: [], subcategories_remove: [],
        clear_filters: false,
        map_overlay: null, poi_add: [], poi_remove: [],
        view_mode: null, compare_mode: null, clear_draw: false,
        reply: "Sorry, I didn't quite understand that. Could you rephrase?",
      });
    }

    // Sanitize — ensure correct types so the client can trust the shape
    const sanitized = {
      city: typeof delta.city === 'string' ? delta.city : null,
      state: typeof delta.state === 'string' ? delta.state : null,
      beds: typeof delta.beds === 'number' ? delta.beds : null,
      baths: typeof delta.baths === 'number' ? delta.baths : null,
      priceMin: typeof delta.priceMin === 'number' ? delta.priceMin : null,
      priceMax: typeof delta.priceMax === 'number' ? delta.priceMax : null,
      propertyType: typeof delta.propertyType === 'string' ? delta.propertyType : null,
      subcategories_add: Array.isArray(delta.subcategories_add) ? delta.subcategories_add : [],
      subcategories_remove: Array.isArray(delta.subcategories_remove) ? delta.subcategories_remove : [],
      clear_filters: delta.clear_filters === true,
      map_overlay: typeof delta.map_overlay === 'string' ? delta.map_overlay : null,
      poi_add: Array.isArray(delta.poi_add) ? delta.poi_add : [],
      poi_remove: Array.isArray(delta.poi_remove) ? delta.poi_remove : [],
      view_mode: typeof delta.view_mode === 'string' ? delta.view_mode : null,
      compare_mode: typeof delta.compare_mode === 'boolean' ? delta.compare_mode : null,
      clear_draw: delta.clear_draw === true,
      reply: typeof delta.reply === 'string' && delta.reply.trim()
        ? delta.reply.trim()
        : 'Done.',
    };

    return NextResponse.json(sanitized);
  } catch (err) {
    console.error('[BrowseAI] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
