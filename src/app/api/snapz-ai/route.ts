import { NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SnapProperty {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedRooms?: number;
  bathRooms?: number | string;
  sqft?: string | number;
  name?: string;
  listingId?: string;
  propertyId?: string;
  // Rich fields
  propertyType?: string;
  yearBuilt?: number | string;
  lotSizeValue?: string | number;
  lotSizeUnit?: string;
  features?: Array<{ feature?: string; description?: string } | string> | null;
  publicRemarks?: string;
  propertyDescription?: string;
  hoa?: string | number | null;
  tags?: string[];
  mls_data?: any;
  listing?: any;
  unreadCommentCount?: number;
  comments?: string[];
  engaged?: boolean;
}

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  dimension: string; // e.g. 'location', 'price_range', 'comment:123 Main St'
  text: string;
  contextHint?: string;
  options: QuestionOption[];
}

interface Analysis {
  priceRange: { min: number; max: number };
  cities: string[];
  avgBeds: number;
  propertyType: string;
  consistentFeatures?: string[];
  ambiguousDimensions?: string[];
}

/** Session context loaded from backend — used to avoid repeating questions */
interface SessionContext {
  askedDimensions: string[];           // dimensions already asked in a previous session
  previousAnswers: Record<string, string>; // dimension → answer value from last session
  dismissedListingIds: string[];       // never recommend these again
}

interface AnalyzePhaseBody {
  phase: 'analyze' | 'questions'; // 'questions' kept for backward compat
  snapProperties: SnapProperty[];
  session?: SessionContext;
}

interface RecommendPhaseBody {
  phase: 'recommend';
  snapProperties: SnapProperty[];
  analysis: Analysis;
  answers: Record<string, string>;
  dismissedListingIds?: string[];
  likedListingIds?: string[];
}

type RequestBody = AnalyzePhaseBody | RecommendPhaseBody;

// ─── OpenAI helper ───────────────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 800,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${text}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content?.trim() || '{}';
}

// ─── Server-side property enrichment ─────────────────────────────────────────
// Fetches full listing details (publicRemarks, yearBuilt, HOA, garage, pool, etc.)
// from the AI backend's /api/get_data endpoint so Phase A has comprehensive context.
// Best-effort: a timeout or error on any single property never fails the whole flow.

async function enrichSnapProperties(properties: SnapProperty[]): Promise<SnapProperty[]> {
  const baseUri = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || 'https://demo-ai.snaphomz.com';
  const detailUrl = `${baseUri}/api/get_data`;

  const results = await Promise.allSettled(
    properties.slice(0, 12).map(async (p) => {
      const listingId = p.listingId || p.propertyId;
      if (!listingId) return p;

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(detailUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: Number(listingId) }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) return p;

        const json = await res.json();
        const rawData = json?.data;
        if (!rawData) return p;

        // API may return listing nested under { listing: {...} } or as the root object
        const listingObj = rawData?.listing || rawData;

        return {
          ...p,
          listing: listingObj,
          publicRemarks: p.publicRemarks || listingObj?.publicRemarks || listingObj?.remarks || '',
          propertyType: p.propertyType || listingObj?.property?.propertyType?.[0] || '',
          yearBuilt: p.yearBuilt || listingObj?.property?.yearBuilt,
          hoa: p.hoa ?? listingObj?.property?.associationFee ?? listingObj?.property?.hoa?.fee,
          lotSizeValue: p.lotSizeValue ?? listingObj?.property?.lotSizeSquareFeet ?? listingObj?.property?.lotSizeValue,
          state: p.state || listingObj?.address?.stateOrProvince || '',
        } as SnapProperty;
      } catch {
        return p; // Best-effort — never block Phase A because of enrichment failure
      }
    }),
  );

  return results.map((r, i) => (r.status === 'fulfilled' ? r.value : properties[i]));
}

// ─── Rich property summary builder ───────────────────────────────────────────

function buildRichPropertySummary(p: SnapProperty, index: number): string {
  const parts: string[] = [];

  // Basic identity
  const label = p.address || p.name || 'Unknown';
  const city = p.city || p.listing?.address?.city || '';
  const state = p.state || p.listing?.address?.stateOrProvince || '';
  const zip = p.zipCode || p.listing?.address?.zipCode || '';
  const location = [city, state, zip].filter(Boolean).join(', ');
  parts.push(`${index + 1}. ${label}${location ? ` | ${location}` : ''}`);

  // Price
  const price = p.price ?? p.listing?.listPriceLow ?? 0;
  parts.push(`   Price: $${price.toLocaleString()}`);

  // Size
  const beds = p.bedRooms ?? p.listing?.property?.bedroomsTotal ?? 0;
  const baths = p.bathRooms ?? p.listing?.property?.bathroomsTotal ?? 0;
  const sqft = p.sqft ?? p.listing?.property?.livingArea ?? '';
  if (beds || baths || sqft) {
    parts.push(`   Size: ${beds} bed / ${baths} bath${sqft ? ` / ${sqft} sqft` : ''}`);
  }

  // Property type
  const propType =
    p.propertyType ||
    p.listing?.property?.propertyType?.[0] ||
    p.mls_data?.data?.property?.propertyType ||
    '';
  if (propType) parts.push(`   Type: ${propType}`);

  // Year built
  const yearBuilt = p.yearBuilt ?? p.listing?.property?.yearBuilt ?? p.mls_data?.data?.property?.yearBuilt;
  if (yearBuilt) parts.push(`   Year built: ${yearBuilt}`);

  // Lot size
  const lotSize =
    p.lotSizeValue ??
    p.listing?.property?.lotSizeValue ??
    p.mls_data?.data?.property?.lotSizeSquareFeet;
  const lotUnit = p.lotSizeUnit || 'sqft';
  if (lotSize) parts.push(`   Lot: ${lotSize} ${lotUnit}`);

  // HOA
  const hoa =
    p.hoa ??
    p.mls_data?.data?.property?.hoa?.fee ??
    p.listing?.property?.association?.fee ??
    p.listing?.property?.associationFee;
  if (hoa) parts.push(`   HOA: $${hoa}/mo`);

  // Garage
  const garage =
    p.listing?.homedetails?.garageSpaces ??
    p.listing?.property?.garageSpaces ??
    p.listing?.homedetails?.garage;
  if (garage) parts.push(`   Garage: ${garage} space${Number(garage) !== 1 ? 's' : ''}`);

  // Pool
  const hasPool =
    p.listing?.property?.hasPool ??
    p.listing?.homedetails?.hasPool ??
    p.listing?.homedetails?.poolYn;
  if (hasPool) parts.push(`   Pool: Yes`);

  // Fireplace
  const fireplace = p.listing?.homedetails?.fireplaceYn ?? p.listing?.homedetails?.fireplace;
  if (fireplace) parts.push(`   Fireplace: Yes`);

  // Cooling / AC
  const cooling = p.listing?.homedetails?.cooling;
  if (cooling) parts.push(`   Cooling: ${cooling}`);

  // Tags
  const tags = p.tags?.length ? p.tags : p.listing?.tags;
  if (Array.isArray(tags) && tags.length) {
    parts.push(`   Tags: ${tags.slice(0, 8).join(', ')}`);
  }

  // Features
  const features = p.features ?? p.listing?.features;
  if (Array.isArray(features) && features.length) {
    const featureLabels = features
      .slice(0, 10)
      .map((f: any) => (typeof f === 'string' ? f : f?.feature || f?.description || ''))
      .filter(Boolean);
    if (featureLabels.length) parts.push(`   Features: ${featureLabels.join(', ')}`);
  }

  // Remarks (first 120 chars)
  const remarks =
    p.publicRemarks ||
    p.propertyDescription ||
    p.listing?.publicRemarks ||
    p.mls_data?.data?.publicRemarks;
  if (remarks) {
    parts.push(`   Remarks: "${String(remarks).slice(0, 120).replace(/\n/g, ' ')}…"`);
  }

  // User engagement & comments
  if (p.engaged) {
    parts.push(`   Engagement: ★ You commented on this property`);
  }
  if (Array.isArray(p.comments) && p.comments.length) {
    const snippets = p.comments
      .slice(0, 3)
      .map((c) => `"${String(c).slice(0, 80)}"`)
      .join('; ');
    parts.push(`   Your comments: ${snippets}`);
  }

  return parts.join('\n');
}

// ─── Phase A: Analyze snap and generate personalised questions ────────────────

async function analyzeAndGenerateQuestions(
  apiKey: string,
  snapProperties: SnapProperty[],
  session?: SessionContext,
): Promise<{ questions: Question[]; analysis: Analysis }> {
  const propertyList = snapProperties.map(buildRichPropertySummary).join('\n\n');

  // Only show TYPE A instructions when there is genuine comment data.
  // This prevents the AI from hallucinating comment questions based on
  // property remarks/features that mention outdoor spaces, kitchens, etc.
  const hasAnyComments = snapProperties.some(
    (p) => Array.isArray(p.comments) && p.comments.length > 0,
  );

  // Build session memory block for the prompt
  const hasSession = session && session.askedDimensions.length > 0;
  const sessionBlock = hasSession
    ? `
─── SESSION MEMORY (from previous use) ───────────────────────────────────────
Dimensions already asked (DO NOT ask about these again): ${session.askedDimensions.join(', ')}
User's confirmed preferences from last session:
${Object.entries(session.previousAnswers).map(([dim, val]) => `  - ${dim}: ${val}`).join('\n')}

IMPORTANT: Only ask about dimensions NOT listed above. If new properties in this snap introduce a new ambiguous dimension that wasn't asked before, ask about it. If all meaningful dimensions are already covered, return "questions": [] — the system will use saved answers directly.
──────────────────────────────────────────────────────────────────────────────`
    : '';

  const systemPrompt = `You are Snaphomz AI, an elite real estate personalisation engine with deep memory.
Your job is to analyse a user's saved property collection and ask the single most impactful clarifying question(s) to understand their true preference — not generic questions, but questions that emerge directly from what IS in their snap.
Return ONLY a valid JSON object — no markdown, no explanation, no code fences.`;

  // TYPE A (comment confirmation) block — only injected when real comment data exists
  const typeABlock = hasAnyComments
    ? `TYPE A — COMMENT CONFIRMATION (highest priority if applicable):
- Only ask if a property has "Your comments" data AND that property's dimension is NOT already in session memory
- You MUST use the property's actual street address in the question text (never "this property")
- You MUST quote the exact comment verbatim in the question text
- Pattern: "You commented '[exact comment]' on [street address] — what specifically drew you to it?"
- dimension: "comment:<street address>" (e.g. "comment:6519 Denver Ave")
- CRITICAL: Options must be extracted DIRECTLY from the comment text and the property's actual features/remarks.
    If the comment mentions "pool" → include "The pool / outdoor space" as an option
    If the comment mentions "kitchen" → include "The updated kitchen" as an option
    If the comment mentions "school" → include "The school district" as an option
    If the comment mentions "quiet" or "neighborhood" → include "The neighborhood feel" as an option
    Always include "The overall price & value" as the last option
    Generate 3–4 options that are SPECIFIC to what was commented, NOT generic buckets
- contextHint: quote the comment and mention the address

`
    : `IMPORTANT: There are NO user comments in this snap. Do NOT generate any question of type "comment:*". Do NOT ask about or reference any comment the user may have made. Only generate TYPE B questions.

`;

  const userPrompt = `The user has saved the following properties in their Snapz collection:

${propertyList}
${sessionBlock}

─── YOUR TASK ───────────────────────────────────────────────────────────────

STEP 1 — DEEP PROPERTY ANALYSIS
For each property, analyse ALL available data:
- Price, location, size (beds/baths/sqft), property type, year built, lot size, HOA
- Features, tags, remarks/description — look for lifestyle signals:
    • School mentions → school_proximity dimension
    • Pool/spa → outdoor_amenities dimension
    • "Open floor plan", "vaulted ceilings" → layout_style dimension
    • "Work from home", "office" → home_office dimension
    • "New construction", "move-in ready" → move_in_readiness dimension
    • "Investment", "rental", "cap rate" → purpose dimension
    • Garage count → garage dimension
    • "Gated", "community", "resort" → community_type dimension
    • "Downtown", "walkable", "near shops" → walkability dimension
    • "Quiet", "cul-de-sac", "private" → privacy dimension
- Properties with "Engagement: ★" carry extra preference weight

STEP 2 — IDENTIFY WHAT IS ALREADY KNOWN vs AMBIGUOUS
- CONSISTENT across all properties → do NOT ask
- AMBIGUOUS (varies across properties) → worth asking
- Already in SESSION MEMORY → do NOT ask again

STEP 3 — BUILD QUESTION LIST (target 2–4 questions)
Ask 2–4 high-value questions that would most change recommendations. Aim for at least 2 unless session memory already covers all key dimensions.
Each question must reveal something genuinely different about the user's preferences — never ask about dimensions that are consistent across all properties.

${typeABlock}TYPE B — LIFESTYLE / AMBIGUITY QUESTIONS (fill remaining slots, max 3 total):
- Must reference ACTUAL data from this snap (e.g. "2 of your homes are in Irvine, 1 in Tustin")
- Dimension vocabulary (use snake_case keys):
    location | price_range | bedroom_count | bathroom_count | property_type
    lot_size | year_built | hoa | home_office | school_proximity
    outdoor_amenities | garage | community_type | walkability | privacy
    lifestyle_purpose | move_in_readiness | layout_style
- NEVER ask about consistent dimensions
- Options must reference actual values from THIS snap's data
- Each option max 5 words, concrete and specific

STEP 4 — FILL ANALYSIS OBJECT

Return this EXACT JSON structure (no extra keys):
{
  "questions": [
    {
      "id": "q1",
      "dimension": "<snake_case dimension key>",
      "text": "<specific, personalised question ending with ?>",
      "contextHint": "<short concrete observation directly from their snap data>",
      "options": [
        { "label": "<specific, max 5 words>", "value": "<specific, max 5 words>" },
        { "label": "<specific, max 5 words>", "value": "<specific, max 5 words>" },
        { "label": "<specific, max 5 words>", "value": "<specific, max 5 words>" }
      ]
    }
  ],
  "analysis": {
    "priceRange": { "min": <number>, "max": <number> },
    "cities": ["<city1>", "<city2>"],
    "avgBeds": <number>,
    "propertyType": "<dominant type>",
    "consistentFeatures": ["<feature>"],
    "ambiguousDimensions": ["<dimension>"]
  }
}`;

  const raw = await callOpenAI(apiKey, systemPrompt, userPrompt, 1500);
  const result = JSON.parse(raw) as { questions: Question[]; analysis: Analysis };

  // Server-side safety: strip any comment-dimension questions where the
  // corresponding property has no actual comment data. This catches cases
  // where the AI hallucinates a TYPE A question from property remarks/features.
  if (Array.isArray(result.questions)) {
    result.questions = result.questions.filter((q) => {
      if (!q.dimension?.startsWith('comment:')) return true; // keep TYPE B questions
      // For TYPE A: verify the snap actually contains a property with comments
      return hasAnyComments;
    });
  }

  return result;
}

// ─── Comment answer translator ────────────────────────────────────────────────
// When the user answers a comment confirmation question (e.g. "The overall price & value"
// for "comment:2413 Village Azalea Drive"), we need to look up the actual property data
// so the AI can translate the label into a concrete search criterion.

function translateCommentAnswer(
  dimension: string,
  answer: string,
  snapProperties: SnapProperty[],
): string {
  // Only applies to comment dimensions (e.g. "comment:2413 Village Azalea Drive")
  if (!dimension.startsWith('comment:')) {
    return `${dimension}: ${answer}`;
  }

  const addressFragment = dimension.replace(/^comment:/i, '').trim().toLowerCase();

  // Find the matching property by fuzzy address match
  const matched = snapProperties.find((p) => {
    const addr = (p.address || p.name || '').toLowerCase();
    return addr.includes(addressFragment) || addressFragment.includes(addr.split(' ').slice(0, 3).join(' '));
  });

  if (!matched) {
    return `${dimension}: ${answer}`;
  }

  const price = matched.price ?? (matched.listing?.listPriceLow) ?? 0;
  const city = matched.city || matched.listing?.address?.city || '';
  const state = matched.state || matched.listing?.address?.stateOrProvince || '';
  const zip = matched.zipCode || matched.listing?.address?.zipCode || '';
  const beds = matched.bedRooms ?? matched.listing?.property?.bedroomsTotal ?? 0;
  const baths = matched.bathRooms ?? matched.listing?.property?.bathroomsTotal ?? 0;
  const sqft = matched.sqft ?? matched.listing?.property?.livingArea ?? '';
  const propType = matched.propertyType || matched.listing?.property?.propertyType?.[0] || '';
  const lot = matched.lotSizeValue ?? matched.listing?.property?.lotSizeValue ?? '';

  const answerLower = answer.toLowerCase();

  // Translate each label into a concrete search directive
  if (answerLower.includes('price') || answerLower.includes('value')) {
    const lo = Math.round(price * 0.9);
    const hi = Math.round(price * 1.1);
    return `Price & value preference: User confirmed they liked the price at ${matched.address || addressFragment} ($${price.toLocaleString()} in ${city}${state ? ', ' + state : ''}). Target price range $${lo.toLocaleString()}–$${hi.toLocaleString()}.`;
  }

  if (answerLower.includes('neighborhood') || answerLower.includes('area') || answerLower.includes('location')) {
    return `Neighborhood preference: User confirmed they liked the neighborhood/area of ${matched.address || addressFragment}. Prioritize ${[city, state, zip].filter(Boolean).join(', ')} — same city/zip, similar community feel.`;
  }

  if (answerLower.includes('size') || answerLower.includes('layout') || answerLower.includes('floor')) {
    return `Size & layout preference: User confirmed they liked the size of ${matched.address || addressFragment} (${beds} bed / ${baths} bath${sqft ? ` / ${sqft} sqft` : ''}). Target similar size homes.`;
  }

  if (answerLower.includes('pool') || answerLower.includes('outdoor') || answerLower.includes('yard') || answerLower.includes('garden') || answerLower.includes('backyard')) {
    return `Outdoor preference: User confirmed they liked the outdoor space / pool / yard at ${matched.address || addressFragment}. Include pool or large yard as a key requirement.`;
  }

  if (answerLower.includes('school') || answerLower.includes('district')) {
    return `School preference: User confirmed they liked the school district near ${matched.address || addressFragment} (${city}). Prioritize top-rated school districts in that area.`;
  }

  if (answerLower.includes('kitchen') || answerLower.includes('interior') || answerLower.includes('finish') || answerLower.includes('updated') || answerLower.includes('renovated')) {
    return `Interior preference: User confirmed they liked the kitchen/interior finishes at ${matched.address || addressFragment}. Prioritize updated kitchens and modern finishes.`;
  }

  if (answerLower.includes('garage') || answerLower.includes('parking')) {
    return `Garage preference: User confirmed they liked the garage/parking at ${matched.address || addressFragment}. Include garage as a requirement.`;
  }

  if (answerLower.includes('lot') || answerLower.includes('land')) {
    return `Lot preference: User confirmed they liked the lot size at ${matched.address || addressFragment}${lot ? ` (${lot} sqft lot)` : ''}. Prioritize properties with generous lot sizes.`;
  }

  if (answerLower.includes('type') || answerLower.includes('style') || answerLower.includes('architecture')) {
    return `Property style preference: User confirmed they liked the type/style of ${matched.address || addressFragment}${propType ? ` (${propType})` : ''}. Prioritize similar property style.`;
  }

  if (answerLower.includes('feel') || answerLower.includes('vibe') || answerLower.includes('overall') || answerLower.includes('everything')) {
    return `Overall home preference: User loved ${matched.address || addressFragment} overall ($${price.toLocaleString()}, ${beds} bed, ${city}${propType ? ', ' + propType : ''}). Find very similar homes.`;
  }

  // Fallback: give the AI the full property context alongside the answer
  return `User answered "${answer}" for ${matched.address || addressFragment} ($${price.toLocaleString()}, ${beds} bed / ${baths} bath, ${city}${state ? ', ' + state : ''}${propType ? ', ' + propType : ''}). Use this answer and the property data to inform the search.`;
}

// ─── Phase B: Build search query + fetch recommendations ─────────────────────

async function generateRecommendations(
  apiKey: string,
  snapProperties: SnapProperty[],
  analysis: Analysis,
  answers: Record<string, string>,
  dismissedListingIds?: string[],
  likedListingIds?: string[],
): Promise<any[]> {
  const propertyList = snapProperties
    .map((p, i) => {
      const engagement = p.engaged ? ' [★ ENGAGED]' : '';
      const commentNote =
        p.comments?.length
          ? ` | Recent comments: ${p.comments.slice(0, 2).map((c) => `"${String(c).slice(0, 60)}"`).join(', ')}`
          : '';
      return `${i + 1}. ${p.address || p.name || 'Unknown'}, ${p.city || ''} | $${(p.price || 0).toLocaleString()} | ${p.bedRooms || 0} bed${engagement}${commentNote}`;
    })
    .join('\n');

  // Translate comment answers into concrete search directives using actual property data
  const answerList = Object.entries(answers)
    .map(([dim, val]) => `- ${translateCommentAnswer(dim, val, snapProperties)}`)
    .join('\n') || '(none yet)';

  const consistent = analysis.consistentFeatures?.length
    ? `Consistent across all saved homes: ${analysis.consistentFeatures.join(', ')}`
    : '';

  const ambiguous = analysis.ambiguousDimensions?.length
    ? `User was asked about: ${analysis.ambiguousDimensions.join(', ')}`
    : '';

  // Find liked properties in this snap to use as style baseline
  const likedSet = new Set(likedListingIds ?? []);
  const likedProperties = snapProperties.filter(
    (p) => p.listingId && likedSet.has(String(p.listingId))
      || (p.propertyId && likedSet.has(String(p.propertyId)))
  );
  const likedBlock = likedProperties.length
    ? `Properties the user previously LIKED (thumbs up) — treat these as strong positive style/location/price signals:\n${likedProperties.map((p) => `  - ${p.address || p.name}, ${p.city} | $${(p.price || 0).toLocaleString()} | ${p.bedRooms || 0} bed`).join('\n')}`
    : '';

  const systemPrompt = `You are an elite real estate search assistant for Snaphomz with deep user preference memory.
Convert all available preference signals into a single precise natural language search query that will find homes the user will love.
Return ONLY a valid JSON object — no markdown, no explanation.`;

  const userPrompt = `Build a personalised property search query using ALL of these signals:

USER'S SAVED PROPERTIES:
${propertyList}

USER'S EXPLICIT ANSWERS TO PERSONALISATION QUESTIONS (highest priority signal):
${answerList}

DETECTED PATTERNS:
- Price range: $${analysis.priceRange.min.toLocaleString()}–$${analysis.priceRange.max.toLocaleString()}
- Cities saved: ${analysis.cities.join(', ') || 'various'}
- Average bedrooms: ${analysis.avgBeds}
- Property type: ${analysis.propertyType}
${consistent}
${ambiguous}

${likedBlock}

RULES:
1. User's EXPLICIT ANSWERS are the #1 signal — honour them precisely
2. Properties marked [★ ENGAGED] = user commented recently = very strong style/location signal
3. Liked properties = positive style baseline — match similar type, price tier, and neighbourhood feel
4. If user answered a comment confirmation (e.g. "The pool / outdoor space") → make that a primary search feature
5. Include consistent features that appear across all saved homes
6. Be specific: include city, price ceiling, bed count, and key lifestyle features
7. Example of a good query: "4 bedroom single family home with pool in Irvine CA under $1.4M in a quiet neighbourhood near top schools, updated kitchen"

Return ONLY:
{
  "searchQuery": "<specific natural language query>"
}`;

  const raw = await callOpenAI(apiKey, systemPrompt, userPrompt, 400);
  const { searchQuery } = JSON.parse(raw);

  console.log('[snapz-ai] Generated search query:', searchQuery);

  const searchUrl = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI
    ? `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/search`
    : 'https://demo-ai.snaphomz.com/api/search';

  console.log('[snapz-ai] Calling search URL:', searchUrl);

  const searchResponse = await fetch(searchUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: searchQuery }),
  });

  if (!searchResponse.ok) {
    const errText = await searchResponse.text();
    console.error('[snapz-ai] Search backend error:', searchResponse.status, errText);
    return [];
  }

  const searchData = await searchResponse.json();
  console.log('[snapz-ai] Search response keys:', Object.keys(searchData || {}));

  const results: any[] =
    searchData?.result?.records ||
    searchData?.results?.records ||
    searchData?.records ||
    searchData?.results ||
    searchData?.nearbyHomes ||
    (Array.isArray(searchData) ? searchData : []);

  console.log('[snapz-ai] Found', results.length, 'results');

  // Build exclusion set: properties already in the snap + previously dismissed by user
  const existingIds = new Set(
    snapProperties.map((p) => String(p.listingId || p.propertyId || '')).filter(Boolean),
  );
  const dismissedSet = new Set(dismissedListingIds ?? []);

  return results
    .filter((r: any) => {
      const id = String(
        r?.listingId || r?.listing?.listingId || r?.listing?.mlsNumber || r?.id || '',
      );
      if (!id) return true; // include when ID can't be determined
      if (existingIds.has(id)) return false;  // already in snap
      if (dismissedSet.has(id)) return false; // user dismissed before
      return true;
    })
    .slice(0, 10);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }

    const body: RequestBody = await request.json();

    if (!body?.phase) {
      return NextResponse.json({ error: 'Missing phase field.' }, { status: 400 });
    }

    // ── Phase A: Analyze snap and generate questions ─────────────────────────
    if (body.phase === 'analyze' || body.phase === 'questions') {
      const { snapProperties, session } = body as AnalyzePhaseBody;

      if (!snapProperties?.length) {
        return NextResponse.json({ error: 'No snap properties provided.' }, { status: 400 });
      }

      // Enrich with full listing details (publicRemarks, yearBuilt, HOA, garage, pool…)
      // so the AI has comprehensive context to generate meaningful questions.
      const enrichedForAnalysis = await enrichSnapProperties(snapProperties);
      const result = await analyzeAndGenerateQuestions(apiKey, enrichedForAnalysis, session);
      return NextResponse.json(result);
    }

    // ── Phase B: Return recommendations ─────────────────────────────────────
    if (body.phase === 'recommend') {
      const { snapProperties, analysis, answers, dismissedListingIds, likedListingIds } = body as RecommendPhaseBody;

      if (!snapProperties?.length || !analysis || !answers) {
        return NextResponse.json(
          { error: 'Missing required fields for recommend phase.' },
          { status: 400 },
        );
      }

      const properties = await generateRecommendations(apiKey, snapProperties, analysis, answers, dismissedListingIds, likedListingIds);
      return NextResponse.json({ properties });
    }

    return NextResponse.json({ error: 'Invalid phase.' }, { status: 400 });
  } catch (err: any) {
    console.error('[snapz-ai] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error in Snapz AI.', details: err?.message },
      { status: 500 },
    );
  }
}
