import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  anthropic,
  buildIntentSystemPrompt,
  buildSearchSystemPrompt,
  buildConversationalSystemPrompt,
  buildInterviewSystemPrompt,
} from "@/lib/ai-assistant/claude";
import { buildIntelligenceBlock, buildSearchMemoryContent, applyRelativeRefinement } from "@/lib/ai-assistant/intelligence";
import { searchListings, formatListingsForPrompt } from "@/lib/ai-assistant/mls";
import {
  loadProfile,
  saveProfile,
  loadHistory,
  loadSearchContext,
  saveSearchContext,
  loadPendingAction,
  clearPendingAction,
  appendMessage,
  extractAndUpdateProfile,
  extractAndUpdateProfileFromInterview,
  markInterviewCompleted,
  bumpSessionIfNew,
  extractAndSavePendingAction,
  recordSearchEvent,
} from "@/lib/ai-assistant/memory";
import { writeMemory, getUserMemoryContext } from "@/lib/ai-assistant/supermemory";
import { rankListingPhotos } from "@/lib/ai-assistant/vision";
import { getBatchCachedRankings, setBatchCachedRankings } from "@/lib/ai-assistant/photo-cache";
import { resolvePOILocation, enrichListings, loadCachedEnrichments, geocodeAddress, getCommuteTimes } from "@/lib/ai-assistant/places";
import { MLSSearchParams, PhotoRankResult, ListingEnrichment, CommuteResult } from "@/types/ai-assistant";

export const runtime = "nodejs";

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Retry wrapper for Anthropic overload (529) and rate-limit (429) errors.
// Streaming calls can be retried because the error surfaces before the stream opens.
async function withRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 2): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; error?: { type?: string } };
      const retryable = apiErr?.status === 429 || apiErr?.status === 529 || apiErr?.error?.type === "overloaded_error";
      if (retryable && attempt < maxAttempts) {
        const delay = attempt * 2000;
        console.warn(`\x1b[33m[AI]\x1b[0m ${label} overloaded/rate-limited — retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}

// Tool Sonnet calls during the Home Pilot interview to signal completion.
// Replaces the fragile string-match approach — model explicitly declares it's done.
const INTERVIEW_COMPLETION_TOOL: Anthropic.Tool = {
  name: "complete_interview",
  description:
    "Signal that the Home Pilot interview is complete and the assistant is ready to search for homes. " +
    "Call this ONLY when you have gathered: rough location, rough budget, household composition, and at least one aesthetic preference. " +
    "Always include your final conversational text message alongside this tool call.",
  input_schema: { type: "object" as const, properties: {} },
};


function log(label: string, ref: number) {
  const ms = Date.now() - ref;
  const color = ms < 1000 ? "\x1b[32m" : ms < 3000 ? "\x1b[33m" : "\x1b[31m";
  console.log(`\x1b[36m[AI]\x1b[0m ${color}+${ms}ms\x1b[0m  ${label}`);
}

// ── Haiku routing tools (Anthropic format) ───────────────────────────────────
const ANTHROPIC_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_mls",
    description:
      "Search MLS for real estate listings. Call this when the user wants to find, " +
      "browse, filter, or re-show properties — including follow-ups like 'now show me X', " +
      "'what about Dallas instead', 'filter to ones with a pool', 'show those again', " +
      "'pull those listings again', 're-run that search'. " +
      "Do NOT call this if the user is asking about the details of one specific already-shown listing.",
    input_schema: {
      type: "object" as const,
      properties: {
        // ── Geography ──────────────────────────────────────────────────────
        city:    { type: "string",  description: "City name, title-cased e.g. 'Austin'" },
        state:   { type: "string",  description: "Two-letter ALL-CAPS state code e.g. 'TX'" },
        county:  { type: "string",  description: "County name — fallback when city search returns 0 results e.g. 'Sacramento County'" },
        zip:     { type: "string",  description: "ZIP code e.g. '78701'" },

        // ── Property classification ────────────────────────────────────────
        property_sub_type: {
          type: "string",
          enum: [
            "Single Family", "Condo", "Townhouse", "Duplex", "Multi-Family",
            "Triplex", "Fourplex", "Apartment", "Manufactured Home", "Mobile Home",
            "Cabin", "Ranch", "Mixed Use",
          ],
          description:
            "Set when user names a specific property type. " +
            "'condo' → 'Condo'. 'townhouse' → 'Townhouse'. 'single family'/'sfr' → 'Single Family'. " +
            "'duplex' → 'Duplex'. 'triplex' → 'Triplex'. 'fourplex'/'quadplex' → 'Fourplex'. " +
            "'multi-family'/'multi-unit'/'investment property' → 'Multi-Family'. " +
            "'apartment'/'apartment building' → 'Apartment'. " +
            "'cabin' → 'Cabin'. 'ranch style'/'ranch home' → 'Ranch'. " +
            "'manufactured home' → 'Manufactured Home'. 'mobile home' → 'Mobile Home'. " +
            "'mixed use' → 'Mixed Use'. " +
            "'house'/'home' alone → do NOT set this field.",
        },

        // ── Price ──────────────────────────────────────────────────────────
        listing_price_min:    { type: "number",  description: "Minimum listing price in dollars" },
        listing_price_max:    { type: "number",  description: "Maximum listing price in dollars" },
        price_per_sqft_min:   { type: "number",  description: "Minimum price per sq ft — use for 'best value per sqft' or 'under $X/sqft' queries" },
        price_per_sqft_max:   { type: "number",  description: "Maximum price per sq ft" },

        // ── Beds / Baths / Size ───────────────────────────────────────────
        bedrooms_min:         { type: "integer", description: "Minimum bedrooms" },
        bedrooms_max:         { type: "integer", description: "Maximum bedrooms — use for 'no more than X beds', 'cozy 2-bed max'" },
        bathrooms_min:        { type: "number",  description: "Minimum bathrooms" },
        bathrooms_max:        { type: "number",  description: "Maximum bathrooms" },
        living_area_min:      { type: "integer", description: "Minimum living area in sq ft" },
        living_area_max:      { type: "integer", description: "Maximum living area in sq ft" },
        lot_size_min:         { type: "integer", description: "Minimum lot size in sq ft — use for 'big yard', 'half acre' (21780 sqft), 'acre+' (43560 sqft)" },
        lot_size_max:         { type: "integer", description: "Maximum lot size in sq ft" },
        stories:              { type: "integer", description: "Exact story count — use for 'single story'/'ranch style'/'no stairs' (1) or 'two story' (2)" },

        // ── Features ──────────────────────────────────────────────────────
        has_pool:             { type: "boolean", description: "Must have a pool" },
        has_basement:         { type: "boolean", description: "Must have a basement" },

        // ── Views / Aesthetics — set boolean AND visual_query together ─────
        is_water_front:       { type: "boolean", description: "On waterfront — also set visual_query for photo ranking" },
        is_water_view:        { type: "boolean", description: "Has water view — also set visual_query for photo ranking" },
        is_mountain_view:     { type: "boolean", description: "Has mountain view — ALSO set visual_query='mountain range visible through windows, scenic mountain backdrop exterior'" },
        is_city_view:         { type: "boolean", description: "Has city view — ALSO set visual_query='city skyline view, downtown city lights view from window'" },
        is_park_view:         { type: "boolean", description: "Overlooks a park — ALSO set visual_query='park view, green park visible from window, overlooking park'" },

        // ── Age / Market timing ───────────────────────────────────────────
        year_built_min:       { type: "integer", description: "Minimum year built" },
        year_built_max:       { type: "integer", description: "Maximum year built" },
        days_on_market_min:   { type: "integer", description: "Minimum days on market — use for 'been sitting a while', 'motivated seller'" },
        days_on_market_max:   { type: "integer", description: "Maximum days on market — use for 'fresh listings', 'just listed' (set to 7)" },
        latest_only:          { type: "boolean", description: "true = eliminate ghost active listings — always set true alongside active searches" },

        // ── HOA ───────────────────────────────────────────────────────────
        listing_association_fee_max: { type: "integer", description: "Max HOA/association fee per month — use for 'low HOA', 'no HOA' (set to 0), 'under $200 HOA'" },

        // ── Result control ────────────────────────────────────────────────
        size: { type: "integer", description: "Number of results — default 6, max 12. Visual queries: always size=12" },

        // ── Proximity (Google Places resolution) ──────────────────────────
        near_poi_type: {
          type: "string",
          enum: ["hospital", "school", "grocery", "park", "transit", "restaurant", "gym", "pharmacy"],
          description:
            "Set when user wants homes near a specific amenity type. " +
            "'near hospitals' / 'close to hospital' → 'hospital'. " +
            "'good schools' / 'school district' / 'near schools' → 'school'. " +
            "'walkable' / 'near transit' / 'near subway' → 'transit'. " +
            "'near grocery' / 'walkable to stores' / 'near Trader Joes' → 'grocery'. " +
            "'near parks' / 'near green space' → 'park'. " +
            "Never set for general location queries with no amenity intent.",
        },
        near_poi_query: {
          type: "string",
          description:
            "Named place to resolve proximity to. Use for specific institutions or branded stores. " +
            "'near UCSF' → 'UCSF Medical Center'. 'near Whole Foods' → 'Whole Foods'. " +
            "'near Stanford' → 'Stanford University'. " +
            "Overrides near_poi_type when set. Include city context if helpful.",
        },
        commute_from: {
          type: "string",
          description:
            "Full address or named place the user wants to commute FROM. " +
            "Set when user says 'near my office at [address]', 'within X min of [place]', 'commute from [address]'. " +
            "Include city and state if user provides them. Example: '123 Market St, San Francisco, CA'.",
        },
        commute_max_minutes: {
          type: "integer",
          description: "Maximum acceptable commute time in minutes. Only set when user explicitly states a commute limit.",
        },
        commute_mode: {
          type: "string",
          enum: ["driving", "transit", "walking"],
          description: "Travel mode for commute. Default: driving. Use transit if user says 'public transit', 'subway', 'BART', 'metro'. Use walking if user says 'walkable', 'walking distance'.",
        },
        commute_from_2: {
          type: "string",
          description:
            "Second commute origin — use when user needs to be within commute range of TWO places. " +
            "Example: 'between my office at [A] and my kid school at [B]' → commute_from=[A], commute_from_2=[B].",
        },
        commute_max_minutes_2: {
          type: "integer",
          description: "Maximum commute time in minutes for the second origin (commute_from_2).",
        },

        // ── Visual / Photo ranking (not sent to MLS — processed client-side) ──
        visual_query: {
          type: "string",
          description:
            "Visual/aesthetic feature to rank listing photos against. " +
            "Set ONLY for things MLS filters cannot express (style, materials, finishes, ambiance). " +
            "Expand to 15–20 specific camera-visible words. " +
            "Examples: 'blue painted kitchen cabinets, blue island', 'shiplap walls, barn door, farmhouse sink', " +
            "'floor-to-ceiling bookshelves, dedicated reading room', 'soaking tub, rainfall shower, natural stone'. " +
            "Do NOT set for pool, waterfront, views (use the boolean flags), bedrooms, price.",
        },
        room_hint: {
          type: "string",
          enum: ["kitchen", "dining_room", "bathroom", "living_room", "bedroom", "exterior", "backyard", "any"],
          description: "Which room the visual_query refers to.",
        },
        visual_confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "'high' = specific material/color/fixture. 'medium' = style or common feature. 'low' = generic aesthetic.",
        },
        description_keywords: {
          type: "string",
          description: "Comma-separated terms to match in listing text. Include synonyms: 'library,study,bookshelf,reading room'.",
        },
      },
    },
  },
  {
    name: "reference_listing",
    description:
      "User is asking about the details of ONE specific listing by an explicit position reference — " +
      "a number (#1, #3), an ordinal (first, second, third), or 'the last one'. " +
      "Examples: 'tell me more about the second house', 'what year was #3 built', 'how big is the first one'. " +
      "NEVER call this for questions about multiple listings: 'which of these are duplexes', " +
      "'are any of these single family homes', 'which has a pool', 'which is the biggest' — those are answer_user. " +
      "NEVER call this without a clear position reference. When in doubt, use answer_user.",
    input_schema: {
      type: "object" as const,
      properties: {
        listing_index: {
          type: "integer",
          description: "1-based position of the listing (1 = first tile shown, 2 = second, etc.)",
        },
      },
      required: ["listing_index"],
    },
  },
  {
    name: "answer_user",
    description:
      "Answer a general conversational question that does NOT involve property listings. " +
      "Use for greetings, general real estate advice, mortgage questions, profile questions. " +
      "Never use this if the user wants to find, re-show, or re-fetch any listings.",
    input_schema: {
      type: "object" as const,
      properties: {
        topic: { type: "string", description: "Brief description of what the user is asking about" },
      },
      required: ["topic"],
    },
  },
];

/**
 * Score a listing description against keyword terms.
 * Returns 0–0.75 so text matches always show "Best match" badge (≥0.5)
 * but never outrank a strong photo match (vision can score up to 1.0).
 */
function scoreByDescription(description: string | undefined, keywords: string[]): number {
  if (!description || keywords.length === 0) return 0;
  const desc = description.toLowerCase();
  const hits = keywords.filter((kw) => kw.length > 2 && desc.includes(kw.toLowerCase())).length;
  if (hits === 0) return 0;
  // 1 hit → 0.60, more hits scale toward 0.75
  return Math.min(0.60 + (hits / keywords.length) * 0.15, 0.75);
}

const PREFERENCE_TERMS = [
  'budget', 'afford', 'bedroom', 'bathroom', 'pool', 'garage',
  'yard', 'basement', 'school district', 'commute', 'waterfront',
  'condo', 'townhouse', 'single family', 'must have', 'deal breaker',
  'prefer', 'looking for', "don't want", "don't show", 'avoid', 'no hoa',
  'square feet', 'sqft', 'neighborhood', 'downtown', 'suburb',
  "i'm ", 'i am ', 'years old', 'my age', 'age is',
  '55+', 'senior', 'age restrict', 'adult community',
] as const;

function containsPreferenceSignal(message: string): boolean {
  if (message.length <= 30) return false;
  const lower = message.toLowerCase();
  return PREFERENCE_TERMS.some((term) => lower.includes(term));
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const T0 = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(sseEvent(data)));

      console.log("\n\x1b[36m[AI]\x1b[0m ─────────────── new request ───────────────");

      try {
        const { message, userId, email, name, mode, conversationId: incomingConvId } = await req.json();
        const convId: string = incomingConvId ?? crypto.randomUUID();

        if (!message || !userId) {
          send({ type: "error", message: "Missing message or userId" });
          controller.close();
          return;
        }

        console.log(`\x1b[36m[AI]\x1b[0m query: "${message.slice(0, 80)}"`);

        // Supermemory fires in background — never blocks Redis or routing
        const memoryPromise = getUserMemoryContext(userId, message);

        // Redis parallel load (~30ms) — profile now includes intelligence fields
        const [profile, history, searchCtx, pendingAction] = await Promise.all([
          loadProfile(userId),
          loadHistory(userId, 20, convId),
          loadSearchContext(userId, convId),
          loadPendingAction(userId),
        ]);
        log("profile + history loaded", T0);

        // Let the client sync UI state (e.g. interviewDone button label) from the
        // authoritative database value without a separate network round-trip.
        send({ type: "profile", data: { interviewCompleted: profile.interviewCompleted } });

        // Increment session counter when this is a new session (gap > 2h).
        if (bumpSessionIfNew(profile)) saveProfile(profile); // fire-and-forget

        // Seed identity fields if this is the first time we've seen them —
        // never overwrite an existing value, just fill in nulls.
        if ((email && !profile.email) || (name && !profile.name)) {
          profile.email = profile.email ?? (email || null);
          profile.name  = profile.name  ?? (name  || null);
          saveProfile(profile); // fire-and-forget — non-critical path
        }

        // Don't record the synthetic start trigger in history
        const isInterviewStart = message === "__home_pilot_start__";
        if (!isInterviewStart) {
          await appendMessage(userId, { role: "user", content: message }, convId);
        }

        // ── Interview mode (Home Pilot) — bypass Haiku entirely ──────────────
        if (mode === "interview") {
          const memoryContext = await Promise.race([
            memoryPromise,
            new Promise<string>((resolve) => setTimeout(() => resolve(""), 2000)),
          ]);

          const interviewMessages: Anthropic.MessageParam[] = isInterviewStart
            ? [{ role: "user" as const, content: "Please begin the interview." }]
            : [
                ...history.flatMap((m) => ([{
                  role: m.role as "user" | "assistant",
                  content: m.content,
                }])),
                { role: "user" as const, content: message },
              ];

          const interviewStream = await withRetry(
            () => anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 500,
              system: buildInterviewSystemPrompt(profile),
              messages: interviewMessages,
              tools: [INTERVIEW_COMPLETION_TOOL],
              tool_choice: { type: "auto" },
              stream: true,
            }),
            "interview Sonnet",
          );

          let interviewResp = "";
          let interviewComplete = false;
          let firstIToken = true;
          for await (const ev of interviewStream) {
            // Detect tool call — model explicitly signals interview is done
            if (ev.type === "content_block_start" && ev.content_block.type === "tool_use") {
              if (ev.content_block.name === "complete_interview") interviewComplete = true;
            }
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              if (firstIToken) { log("first interview token", T0); firstIToken = false; }
              interviewResp += ev.delta.text;
              send({ type: "token", text: ev.delta.text });
            }
          }
          send({ type: "done" });
          log("DONE — interview turn", T0);

          await appendMessage(userId, { role: "assistant", content: interviewResp }, convId);

          if (!isInterviewStart) {
            if (interviewComplete) {
              // Final interview turn — await so profile is in Redis before the auto-search fires
              await extractAndUpdateProfileFromInterview(userId, message, interviewResp);
              await markInterviewCompleted(userId);
              send({ type: "interview_complete" });
            } else {
              extractAndUpdateProfileFromInterview(userId, message, interviewResp);
            }
            writeMemory(
              userId,
              `Home Pilot interview — User said: "${message.slice(0, 200)}". ` +
              `AI asked: "${interviewResp.replace(/SUGGEST:.*$/m, "").trim().slice(0, 200)}"`,
            );
          }

          controller.close();
          return;
        }

        // Pre-load enrichment from Redis cache for all history turns with listings.
        // This gives Sonnet full awareness of POI distances and neighborhood scores
        // so it can answer follow-up questions without per-path ad-hoc injections.
        const historyListingIds = history
          .filter((m) => m.listings && m.listings.length > 0)
          .flatMap((m) => m.listings!.map((l) => String(l.id)));
        const enrichmentByListingId = new Map<string, ListingEnrichment>();
        if (historyListingIds.length > 0) {
          const cached = await loadCachedEnrichments(
            [...new Set(historyListingIds)],
            searchCtx?.nearPOI?.name,
          ).catch(() => [] as ListingEnrichment[]);
          for (const e of cached) enrichmentByListingId.set(e.listingId, e);
        }

        // Build conversation history for Claude — inject listing context blocks
        // so Claude can answer positional follow-ups and proximity questions.
        const conversationMessages: Anthropic.MessageParam[] = [
          ...history.flatMap((m) => {
            const base: Anthropic.MessageParam = {
              role: m.role as "user" | "assistant",
              content: m.content,
            };
            if (m.role === "assistant" && m.listings && m.listings.length > 0) {
              const listingBlock = m.listings
                .map((l, i) => {
                  const enrich = enrichmentByListingId.get(String(l.id));
                  const enrichStr = enrich
                    ? [
                        enrich.distanceToSearchPOI
                          ? `${enrich.distanceToSearchPOI.distanceMi}mi from ${enrich.distanceToSearchPOI.name}`
                          : null,
                        enrich.neighborhood.score > 0
                          ? `Area ${enrich.neighborhood.score}/10`
                          : null,
                        enrich.pois.length > 0
                          ? `nearby: ${enrich.pois.map((p) => `${p.label} ${p.distanceMi}mi`).join(", ")}`
                          : null,
                      ].filter(Boolean).join(" | ")
                    : "";
                  return `#${i + 1}: ${l.full_address} — $${l.listing_price?.toLocaleString()}, ${l.bedrooms}bd/${l.bathrooms}ba, ${l.living_area?.toLocaleString()} sqft${l.year_built ? `, built ${l.year_built}` : ""}${l.property_sub_type ? `, ${l.property_sub_type}` : l.property_type ? `, ${l.property_type}` : ""}${l.stories != null ? `, ${l.stories === 1 ? "single story" : `${l.stories} stories`}` : ""}${l.garage_spaces ? `, ${l.garage_spaces}-car garage` : ""}${l.has_pool ? ", pool" : ""}${l.has_basement ? ", basement" : ""}${l.hoa_fee != null ? `, HOA $${l.hoa_fee}/mo` : ""}${l.neighborhood ? `, ${l.neighborhood}` : ""}${l.is_waterfront ? ", waterfront" : l.is_water_view ? ", water view" : ""}${l.is_mountain_view ? ", mountain view" : ""}${l.is_city_view ? ", city view" : ""}${l.is_park_view ? ", park view" : ""}${l.description ? ` | "${l.description.slice(0, 200)}${l.description.length > 200 ? "…" : ""}"` : ""}${enrichStr ? ` | [${enrichStr}]` : ""}`;
                })
                .join("\n");
              return [
                base,
                {
                  role: "user" as const,
                  content: `[Listings shown to user in the previous turn]\n${listingBlock}\n[End of listings]`,
                },
                {
                  role: "assistant" as const,
                  content: "Got it — I have those listings as context.",
                },
              ];
            }
            return [base];
          }),
          { role: "user", content: message },
        ];

        // ── Step 1: Haiku routing (~300-500ms) ───────────────────────────────
        console.log("\x1b[36m[AI]\x1b[0m \x1b[35m→ Haiku routing call\x1b[0m");

        // ── Pre-route pure affirmations in code — never let the LLM mishandle them ──
        // A pure affirmation is a short message (≤5 words) with no search-intent words.
        // If one is detected with no pending action and no search context, skip routing entirely.
        const SEARCH_WORDS = /\b(show|find|search|home|house|listing|propert|look|get|pull|fetch)\b/i;
        const PURE_AFFIRMATION = /^(yes|yeah|sure|ok|okay|yep|yup|sounds good|makes sense|that works|got it|great|alright|cool|perfect|nice|awesome|fine)\.?!?\s*$/i;
        const isPureAffirmation = PURE_AFFIRMATION.test(message.trim()) && !SEARCH_WORDS.test(message);

        if (isPureAffirmation && !pendingAction && !searchCtx) {
          // Nothing to confirm, nothing to search — answer conversationally
          const memoryContext = await Promise.race([
            memoryPromise,
            new Promise<string>((resolve) => setTimeout(() => resolve(""), 2000)),
          ]);
          const ackStream = await withRetry(
            () => anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 256,
              system: buildConversationalSystemPrompt(profile, memoryContext),
              messages: [{ role: "user", content: message }],
              stream: true,
            }),
            "affirmation Sonnet",
          );
          let ackResp = "";
          for await (const ev of ackStream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              ackResp += ev.delta.text;
              send({ type: "token", text: ev.delta.text });
            }
          }
          send({ type: "done" });
          await appendMessage(userId, { role: "assistant", content: ackResp }, convId);
          controller.close();
          return;
        }

        // ── Multi-city pre-route ─────────────────────────────────────────────────
        // Fires when user explicitly asks to search across their saved/preferred
        // locations (not just "show me homes" ambiguity). Runs parallel MLS calls —
        // one per location (capped at 3), merges and deduplicates, streams a unified
        // summary. Skips Haiku routing entirely — intent is unambiguous.
        const MULTI_CITY_INTENT = /\b(preferred locations?|all my (?:cities|locations?|markets?)|saved (?:locations?|cities|markets?)|my (?:saved|preferred) (?:locations?|cities|markets?))\b/i;
        const isMultiCity = MULTI_CITY_INTENT.test(message) && profile.preferredLocations.length > 1;

        if (isMultiCity) {
          const parseLocation = (loc: string): { city?: string; state?: string } => {
            const parts = loc.split(",").map((s) => s.trim());
            return { city: parts[0], state: parts[1]?.split(" ")[0] };
          };

          const locations = profile.preferredLocations.slice(0, 3);
          const carryParams: MLSSearchParams = searchCtx?.params ?? {};
          const perCity = Math.ceil(12 / locations.length);

          const [cityResults, memoryContext] = await Promise.all([
            Promise.all(
              locations.map((loc) => {
                const { city, state } = parseLocation(loc);
                return searchListings({ ...carryParams, city, state, size: perCity });
              }),
            ),
            Promise.race([memoryPromise, new Promise<string>((resolve) => setTimeout(() => resolve(""), 2000))]),
          ]);

          // Deduplicate across cities by full address
          const seen = new Set<string>();
          const listings = cityResults.flat().filter((l) => {
            if (seen.has(l.full_address)) return false;
            seen.add(l.full_address);
            return true;
          });

          const primaryLoc = parseLocation(locations[0]);
          log(`multi-city (${locations.join(" + ")}): ${listings.length} listing(s)`, T0);
          send({ type: "listings", data: { listings, params: { ...carryParams, ...primaryLoc } } });
          log("tiles emitted to client", T0);

          const multiSummaryStream = await withRetry(
            () => anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 600,
              system: buildSearchSystemPrompt(profile, memoryContext),
              messages: [
                { role: "user", content: message },
                { role: "assistant", content: `Searching across ${locations.join(", ")}...` },
                {
                  role: "user",
                  content: `[MLS RESULTS — searched ${locations.join(", ")}]\n${formatListingsForPrompt(listings)}\n[/MLS RESULTS]\n\nSummarise these listings. Note which city each one is in.`,
                },
              ],
              stream: true,
            }),
            "multi-city Sonnet",
          );

          let multiFullResp = "";
          let firstMultiToken = true;
          for await (const ev of multiSummaryStream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              if (firstMultiToken) { log("first token", T0); firstMultiToken = false; }
              multiFullResp += ev.delta.text;
              send({ type: "token", text: ev.delta.text });
            }
          }
          send({ type: "done" });
          log("DONE — multi-city", T0);

          await appendMessage(userId, { role: "assistant", content: multiFullResp, listings }, convId);
          clearPendingAction(userId);
          saveSearchContext(userId, {
            params: { ...carryParams, ...primaryLoc },
            resolvedLocation: locations.join(" + "),
            appliedAt: new Date().toISOString(),
          }, convId);
          recordSearchEvent(userId, { ...carryParams, ...primaryLoc }, listings.length, profile);
          writeMemory(userId, `User searched preferred locations: ${locations.join(", ")}. ${listings.length} result(s).`);
          controller.close();
          return;
        }

        // Build buyer intelligence block from already-loaded profile (zero extra I/O)
        const intelligenceBlock = buildIntelligenceBlock(profile);
        if (intelligenceBlock) log("intelligence block ready", T0);

        // Pre-compute relative refinements in JS — deterministic, no LLM arithmetic.
        // Adjusted values are shown to Haiku so it uses the exact numbers we computed.
        const relativeDelta = searchCtx
          ? applyRelativeRefinement(message, searchCtx.params)
          : null;
        const adjustedCtxParams = relativeDelta
          ? { ...searchCtx!.params, ...relativeDelta }
          : searchCtx?.params;

        if (relativeDelta) log(`relative refinement applied: ${JSON.stringify(relativeDelta)}`, T0);

        const searchCtxBlock = searchCtx
          ? `\n## Last search context\nLocation: ${searchCtx.resolvedLocation}\nFilters: ${Object.entries(adjustedCtxParams!)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}\n${relativeDelta ? `Note: filters already pre-adjusted for the user's relative request — use these exact values.\n` : ""}`
          : "";

        const pendingActionBlock = pendingAction
          ? `\n## Pending proposed action\nThe assistant proposed this search last turn: "${pendingAction.description}"\nParams: ${Object.entries(pendingAction.params)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}\nIf the user confirms ("yes", "do that", "go ahead", "sure"), call search_mls with these params. CRITICAL: The city and state in the pending action OVERRIDE Last search context city/state — do NOT substitute a different location.\n`
          : "";

        // History messages — no system role (Anthropic passes system separately)
        const routingHistory: Anthropic.MessageParam[] = [
          ...history.slice(-8).map((m) => ({
            role: m.role as "user" | "assistant",
            content:
              m.role === "assistant"
                ? m.listings && m.listings.length > 0
                  ? `[showed ${m.listings.length} listings: ${m.listings.map((l, i) => `#${i + 1} ${l.full_address}`).join(", ")}]`
                  : "[assistant responded with answer]"
                : m.content,
          })),
          { role: "user" as const, content: message },
        ];

        const routingSystem = buildIntentSystemPrompt(intelligenceBlock) + searchCtxBlock + pendingActionBlock;

        // ── Haiku routing ────────────────────────────────────────────────────
        const callHaikuRouting = () => anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          temperature: 0,
          system: routingSystem,
          messages: routingHistory,
          tools: ANTHROPIC_TOOLS,
          tool_choice: { type: "any" },
        });

        const [haikuResponse, memoryContext] = await Promise.all([
          withRetry(callHaikuRouting, "Haiku routing"),
          Promise.race([memoryPromise, new Promise<string>((resolve) => setTimeout(() => resolve(""), 2000))]),
        ]);

        const toolUseBlock = haikuResponse.content.find((b) => b.type === "tool_use") as Anthropic.ToolUseBlock | undefined;
        // Normalise to shared interface so the rest of the route is provider-agnostic
        const rawToolCall = toolUseBlock
          ? { function: { name: toolUseBlock.name, arguments: JSON.stringify(toolUseBlock.input) } }
          : undefined;
        // ─────────────────────────────────────────────────────────────────────

        log("Haiku routing done", T0);
        if (memoryContext) log("memory context ready", T0);

        const toolCall = rawToolCall;
        const toolName = toolCall?.function.name;
        console.log(`\x1b[36m[AI]\x1b[0m tool: ${toolName ?? "none"}`);

        // ── answer_user → Sonnet handles it conversationally ─────────────────
        if (!toolCall || toolName === "answer_user") {
          console.log("\x1b[36m[AI]\x1b[0m conversational path → Sonnet");

          const convStream = await withRetry(
            () => anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 512,
              system: buildConversationalSystemPrompt(profile, memoryContext),
              messages: conversationMessages,
              stream: true,
            }),
            "conversational Sonnet",
          );

          let fullResp = "";
          let firstToken = true;
          for await (const ev of convStream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              if (firstToken) { log("first token", T0); firstToken = false; }
              fullResp += ev.delta.text;
              send({ type: "token", text: ev.delta.text });
            }
          }
          send({ type: "done" });
          log("DONE — conversational", T0);

          await appendMessage(userId, { role: "assistant", content: fullResp }, convId);
          extractAndUpdateProfile(userId, message, fullResp);
          extractAndSavePendingAction(userId, fullResp);
          if (containsPreferenceSignal(message)) {
            writeMemory(userId, `User said: "${message.slice(0, 200)}"`);
          }

          controller.close();
          return;
        }

        // ── reference_listing → look up from history, focus single tile ───────
        if (toolName === "reference_listing") {
          console.log("\x1b[36m[AI]\x1b[0m reference_listing path");
          const { listing_index } = JSON.parse(toolCall.function.arguments) as { listing_index: number };

          // Search all history turns newest-first — user may reference a listing from
          // an earlier turn, not necessarily the most recent search.
          const allListingTurns = [...history].reverse().filter((m) => m.listings && m.listings.length > 0);
          let targetListing = allListingTurns
            .map((t) => t.listings![listing_index - 1])
            .find(Boolean);

          if (!targetListing) {
            // No listing at that index — fall through to conversational
            const fallbackStream = await withRetry(
              () => anthropic.messages.create({
                model: "claude-sonnet-4-6",
                max_tokens: 512,
                system: buildConversationalSystemPrompt(profile, memoryContext),
                messages: conversationMessages,
                stream: true,
              }),
              "reference fallback Sonnet",
            );
            let fallbackResp = "";
            for await (const ev of fallbackStream) {
              if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
                fallbackResp += ev.delta.text;
                send({ type: "token", text: ev.delta.text });
              }
            }
            send({ type: "done" });
            await appendMessage(userId, { role: "assistant", content: fallbackResp }, convId);
            extractAndUpdateProfile(userId, message, fallbackResp);
            writeMemory(userId, `User asked about listing but none found at index ${listing_index}.`);
            controller.close();
            return;
          }

          send({ type: "listing_focus", data: targetListing, index: listing_index });
          log(`listing_focus tile emitted (index ${listing_index})`, T0);

          const focusedListingText = [
            `Address: ${targetListing.full_address}`,
            `Price: $${targetListing.listing_price?.toLocaleString()}`,
            `Bedrooms: ${targetListing.bedrooms}`,
            `Bathrooms: ${targetListing.bathrooms}`,
            `Living area: ${targetListing.living_area?.toLocaleString()} sqft`,
            targetListing.lot_size       ? `Lot size: ${targetListing.lot_size?.toLocaleString()} sqft` : null,
            targetListing.year_built     ? `Year built: ${targetListing.year_built}` : null,
            targetListing.stories        != null ? `Stories: ${targetListing.stories}` : null,
            targetListing.garage_spaces  ? `Garage spaces: ${targetListing.garage_spaces}` : null,
            targetListing.has_pool       != null ? `Pool: ${targetListing.has_pool ? "Yes" : "No"}` : null,
            targetListing.has_basement   != null ? `Basement: ${targetListing.has_basement ? "Yes" : "No"}` : null,
            targetListing.hoa_fee        != null ? `HOA fee: $${targetListing.hoa_fee}/mo` : null,
            targetListing.neighborhood   ? `Neighborhood: ${targetListing.neighborhood}` : null,
            targetListing.property_sub_type ? `Property type: ${targetListing.property_sub_type}` : targetListing.property_type ? `Property type: ${targetListing.property_type}` : null,
            targetListing.is_waterfront  ? `Waterfront: Yes` : null,
            targetListing.is_water_view  ? `Water view: Yes` : null,
            targetListing.is_mountain_view ? `Mountain view: Yes` : null,
            targetListing.is_city_view   ? `City view: Yes` : null,
            targetListing.is_park_view   ? `Park view: Yes` : null,
            targetListing.days_on_market != null ? `Days on market: ${targetListing.days_on_market}` : null,
            targetListing.description    ? `Description: ${targetListing.description}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          const focusStream = await withRetry(
            () => anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 512,
              system: buildConversationalSystemPrompt(profile, memoryContext),
              messages: [
                ...conversationMessages.slice(0, -1),
                {
                  role: "user",
                  content: `${message}\n\n[Listing #${listing_index} details]\n${focusedListingText}\n[End of listing]`,
                },
              ],
              stream: true,
            }),
            "listing focus Sonnet",
          );

          let focusResp = "";
          let firstToken = true;
          for await (const ev of focusStream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              if (firstToken) { log("first token", T0); firstToken = false; }
              focusResp += ev.delta.text;
              send({ type: "token", text: ev.delta.text });
            }
          }
          send({ type: "done" });
          log("DONE — reference_listing", T0);

          await appendMessage(userId, { role: "assistant", content: focusResp, focusedListing: targetListing }, convId);
          extractAndUpdateProfile(userId, message, focusResp);
          writeMemory(
            userId,
            `User asked about listing #${listing_index} in ${targetListing.city}, ${targetListing.state} ($${targetListing.listing_price?.toLocaleString()}, ${targetListing.bedrooms}bd).`,
          );
          controller.close();
          return;
        }

        // ── search_mls → fetch listings, stream summary ───────────────────────
        // Declared here so they're in scope for vision merge and controller await
        let visionPromise: Promise<void> | null = null;

        const rawParams = JSON.parse(toolCall.function.arguments);

        // Issue 7 fix: pure affirmation confirming a pending action.
        // Haiku's carry-forward rules can silently substitute the Last search context
        // city/state for the pending action city/state. Override here in code — pending
        // action params are authoritative for location, price, and structural filters.
        // We preserve any visual params Haiku added (visual_query, room_hint, etc.).
        if (isPureAffirmation && pendingAction) {
          const visual: Record<string, unknown> = {};
          if (rawParams.visual_query)        visual.visual_query        = rawParams.visual_query;
          if (rawParams.room_hint)           visual.room_hint           = rawParams.room_hint;
          if (rawParams.visual_confidence)   visual.visual_confidence   = rawParams.visual_confidence;
          if (rawParams.description_keywords) visual.description_keywords = rawParams.description_keywords;
          // Base = search context (beds/baths/features), then pending action wins (location/price), then visual
          Object.assign(rawParams, { ...(searchCtx?.params ?? {}), ...pendingAction.params, ...visual });
          console.log(`\x1b[36m[AI]\x1b[0m pending action override applied: city=${rawParams.city ?? "?"} state=${rawParams.state ?? "?"}`);
        }

        // Haiku occasionally returns typed params as strings — coerce at the boundary
        const NUMERIC_MLS_PARAMS = [
          "listing_price_min", "listing_price_max",
          "price_per_sqft_min", "price_per_sqft_max",
          "bedrooms_min", "bedrooms_max",
          "bathrooms_min", "bathrooms_max",
          "living_area_min", "living_area_max",
          "lot_size_min", "lot_size_max",
          "year_built_min", "year_built_max",
          "days_on_market_min", "days_on_market_max",
          "stories", "listing_association_fee_max",
          "size", "radius", "latitude", "longitude",
        ] as const;
        for (const key of NUMERIC_MLS_PARAMS) {
          if (typeof rawParams[key] === "string") {
            const n = Number(rawParams[key]);
            rawParams[key] = isNaN(n) ? undefined : n;
          }
        }
        const BOOLEAN_MLS_PARAMS = [
          "has_pool", "has_basement",
          "is_water_front", "is_water_view", "is_mountain_view",
          "is_city_view", "is_park_view", "latest_only",
        ] as const;
        for (const key of BOOLEAN_MLS_PARAMS) {
          if (typeof rawParams[key] === "string") {
            rawParams[key] = rawParams[key] === "true" ? true : rawParams[key] === "false" ? false : undefined;
          }
        }

        // Extract visual fields before passing params to MLS (they are not MLS API fields)
        const visualQuery: string | undefined = rawParams.visual_query;
        const roomHint: string = rawParams.room_hint ?? "any";
        const visualConfidence: "high" | "medium" | "low" = rawParams.visual_confidence ?? "medium";
        const descKeywords: string[] = rawParams.description_keywords
          ? (rawParams.description_keywords as string).split(",").map((k: string) => k.trim()).filter(Boolean)
          : [];
        delete rawParams.visual_query;
        delete rawParams.room_hint;
        delete rawParams.visual_confidence;
        delete rawParams.description_keywords;

        // Extract proximity params — resolved to lat/lng via Google Places before MLS call
        const nearPOIType: string | undefined = rawParams.near_poi_type;
        const nearPOIQuery: string | undefined = rawParams.near_poi_query;
        delete rawParams.near_poi_type;
        delete rawParams.near_poi_query;

        // Extract commute params — resolved via Distance Matrix after MLS (fire-and-forget)
        const commuteFrom: string | undefined = rawParams.commute_from;
        const commuteMaxMinutes: number | undefined = rawParams.commute_max_minutes;
        const commuteMode = (rawParams.commute_mode ?? "driving") as "driving" | "transit" | "walking";
        const commuteFrom2: string | undefined = rawParams.commute_from_2;
        const commuteMaxMinutes2: number | undefined = rawParams.commute_max_minutes_2;
        delete rawParams.commute_from;
        delete rawParams.commute_max_minutes;
        delete rawParams.commute_mode;
        delete rawParams.commute_from_2;
        delete rawParams.commute_max_minutes_2;

        // Geocode commute origins on the hot path (cached — ~5ms warm, ~150ms cold)
        let commuteOrigin1: { lat: number; lng: number } | null = null;
        let commuteOrigin2: { lat: number; lng: number } | null = null;
        if (commuteFrom) {
          commuteOrigin1 = await geocodeAddress(commuteFrom);
          if (commuteOrigin1) log(`Commute origin 1 geocoded: "${commuteFrom.slice(0, 40)}"`, T0);
        }
        if (commuteFrom2) {
          commuteOrigin2 = await geocodeAddress(commuteFrom2);
          if (commuteOrigin2) log(`Commute origin 2 geocoded: "${commuteFrom2.slice(0, 40)}"`, T0);
        }

        // Option 1: resolve POI to lat/lng and inject into MLS params (cached 24h in Redis)
        let resolvedPOI: { name: string; lat: number; lng: number } | null = null;
        if ((nearPOIType || nearPOIQuery) && (rawParams.city || rawParams.state)) {
          const resolved = await resolvePOILocation(
            nearPOIQuery ?? nearPOIType!,
            rawParams.city ?? "",
            rawParams.state ?? "",
          );
          if (resolved) {
            rawParams.latitude  = resolved.lat;
            rawParams.longitude = resolved.lng;
            rawParams.radius    = 3; // 3-mile radius around the POI
            resolvedPOI = { name: resolved.name, lat: resolved.lat, lng: resolved.lng };
            log(`POI resolved: "${resolved.name}" → ${resolved.lat.toFixed(4)},${resolved.lng.toFixed(4)}`, T0);
          }
        }

        const searchParams: MLSSearchParams = rawParams;

        console.log(`\x1b[36m[AI]\x1b[0m search params: ${JSON.stringify(searchParams)}`);
        if (visualQuery) {
          console.log(`\x1b[36m[AI]\x1b[0m \x1b[35mvisual_query:\x1b[0m "${visualQuery}" room_hint="${roomHint}" confidence="${visualConfidence}"`);
        }

        let listings: Awaited<ReturnType<typeof searchListings>> = [];
        let listingsText = "";

        try {
          // ── Visual search: check Redis cache before MLS call so cached
          //    rankings can be injected into the listings SSE immediately ──
          let cacheMap = new Map<string, PhotoRankResult | null>();

          listings = await searchListings(searchParams);
          log(`MLS returned ${listings.length} listing(s)`, T0);

          // Filter age-restricted (55+) communities when user is known to be under 55.
          // Check canonical key "age" first; fall back to scanning all personalContext values
          // for a numeric-looking string in case an older extraction used a different key name.
          const userAgeRaw = profile.personalContext?.age
            ?? profile.personalContext?.user_age
            ?? Object.entries(profile.personalContext ?? {}).find(([k, v]) =>
                (k.includes("age") || k.includes("old")) && /^\d+$/.test(v.trim())
              )?.[1]
            ?? null;
          const userAge = userAgeRaw !== null ? parseInt(String(userAgeRaw), 10) : null;
          if (userAge !== null && !isNaN(userAge) && userAge < 55) {
            const AGE_RESTRICTED_TERMS = [
              "55+", "55 and older", "55 and over", "55 or older",
              "55+ community", "senior community", "age restricted",
              "age-restricted", "age qualified", "age-qualified",
              "active adult community", "55 years",
            ];
            const before = listings.length;
            listings = listings.filter((l) => {
              const desc = (l.description ?? "").toLowerCase();
              return !AGE_RESTRICTED_TERMS.some((term) => desc.includes(term.toLowerCase()));
            });
            if (listings.length < before) {
              log(`Filtered ${before - listings.length} age-restricted listing(s) (user age ${userAge})`, T0);
            }
          }

          if (visualQuery && listings.length > 0) {
            // Batch cache lookup — fast Redis call (~10ms)
            cacheMap = await getBatchCachedRankings(
              listings.map((l) => l.id),
              visualQuery,
            );

            // Apply cached rankings inline — these listings already have correct photo order
            // before the "listings" SSE event fires, so cards render with best photo instantly
            let cacheHits = 0;
            listings = listings.map((l) => {
              const cached = cacheMap.get(l.id);
              if (cached) {
                cacheHits++;
                return { ...l, photos: cached.rankedPhotos, bestScore: cached.bestScore };
              }
              return l;
            });
            if (cacheHits > 0) log(`photo_rank cache hit: ${cacheHits}/${listings.length}`, T0);
          }

          send({ type: "listings", data: { listings, params: searchParams } });
          log("tiles emitted to client", T0);
          listingsText = formatListingsForPrompt(listings);

          // Options 2+3: fire POI enrichment in parallel with Sonnet — same pattern as vision.
          // Geocodes addresses, fetches nearby amenities, computes neighborhood score.
          // Result arrives as poi_enrichment SSE — never blocks the summary stream.
          if (listings.length > 0) {
            enrichListings(listings, resolvedPOI ?? undefined)
              .then((enrichments) => {
                if (enrichments.length > 0) {
                  send({ type: "poi_enrichment", data: enrichments });
                  log(`poi_enrichment sent (${enrichments.length} listing(s))`, T0);
                }
              })
              .catch((err) => {
                console.warn("[Places] enrichment failed:", err instanceof Error ? err.message : err);
              });
          }

          // Fire commute times in parallel — Distance Matrix per listing, emitted as commute_data SSE
          if (listings.length > 0 && (commuteOrigin1 || commuteOrigin2)) {
            const enrichedListings = listings.filter(l => l.full_address);
            // Geocode all listing addresses to lat/lng (cached — fast on warm path)
            Promise.all(
              enrichedListings.map(async l => {
                const latLng = await geocodeAddress(l.full_address!);
                return latLng ? { id: String(l.id), lat: latLng.lat, lng: latLng.lng } : null;
              })
            ).then(async (geocodedRaw) => {
              const geocodedDests = geocodedRaw.filter((d): d is { id: string; lat: number; lng: number } => d !== null);
              if (geocodedDests.length === 0) return;
              const [results1, results2] = await Promise.all([
                commuteOrigin1
                  ? getCommuteTimes(
                      commuteOrigin1.lat,
                      commuteOrigin1.lng,
                      geocodedDests,
                      commuteMode,
                      commuteMaxMinutes,
                    )
                  : Promise.resolve([] as CommuteResult[]),
                commuteOrigin2
                  ? getCommuteTimes(
                      commuteOrigin2.lat,
                      commuteOrigin2.lng,
                      geocodedDests,
                      commuteMode,
                      commuteMaxMinutes2,
                    )
                  : Promise.resolve([] as CommuteResult[]),
              ]);
              // Merge: a listing is withinLimit only if it passes BOTH origins (when both set)
              const merged: CommuteResult[] = results1.map(r1 => {
                const r2 = results2.find(r => r.listingId === r1.listingId);
                return {
                  ...r1,
                  withinLimit: r1.withinLimit && (r2 ? r2.withinLimit : true),
                };
              });
              // Include any listings only in results2 (shouldn't happen but be safe)
              results2.forEach(r2 => {
                if (!merged.find(r => r.listingId === r2.listingId)) {
                  merged.push(r2);
                }
              });
              if (merged.length > 0) {
                send({ type: "commute_data", data: merged });
                log(`commute_data sent (${merged.length} listing(s))`, T0);
              }
            }).catch(err => console.error("[AI] commute calculation error:", err));
          }

          // ── For listings NOT in cache: start vision in parallel with Claude.
          //    We store the promise so we can await it before closing the
          //    SSE controller — fixes "Controller is already closed" error.
          if (visualQuery && listings.length > 0) {
            const uncachedListings = listings.filter((l) => !cacheMap.get(l.id));

            if (uncachedListings.length > 0) {
              console.log(`\x1b[36m[AI]\x1b[0m \x1b[35mstarting vision for ${uncachedListings.length} uncached listing(s)\x1b[0m`);

              visionPromise = rankListingPhotos(uncachedListings, visualQuery, roomHint, visualConfidence)
                .then(async (results) => {
                  send({ type: "photo_rank", data: results });
                  log(`photo_rank SSE sent for ${results.length} listing(s)`, T0);
                  await setBatchCachedRankings(visualQuery, results);
                  log("photo_rank cached", T0);

                  const topMatches = results
                    .filter((r) => r.bestScore >= 0.5)
                    .sort((a, b) => b.bestScore - a.bestScore);
                  if (topMatches.length > 0) {
                    const topListing = listings.find((l) => l.id === topMatches[0].listingId);
                    const quality = topMatches[0].bestScore >= 0.7 ? "strong" : "partial";
                    writeMemory(
                      userId,
                      `Visual match result: "${visualQuery}" in ${resolvedLocation} — ${quality} photo match found. ` +
                      `Best: ${topListing?.full_address ?? "unknown"} (score ${topMatches[0].bestScore.toFixed(2)}). ` +
                      `${topMatches.length}/${results.length} listing(s) above 0.5 threshold.`,
                    );
                    log(`supermemory enriched with top visual match (score ${topMatches[0].bestScore.toFixed(2)})`, T0);
                  }
                })
                .catch((err) => {
                  console.warn("\x1b[33m[Vision] ranking failed:\x1b[0m", err instanceof Error ? err.message : err);
                });
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("\x1b[31m[MLS error]\x1b[0m", msg);
          listingsText = `MLS search failed: ${msg}. Apologise briefly and suggest the user try again.`;
          send({ type: "listings", data: { listings: [], params: searchParams } });
        }

        const resolvedLocation =
          [searchParams.city, searchParams.state].filter(Boolean).join(", ") || "Unknown";

        // Build visual search context block for Sonnet — tells it what was searched
        // and which listings have description evidence, so it can frame the response
        // around the visual feature rather than writing a generic spec summary.
        let visualSummaryContext = "";
        if (visualQuery) {
          visualSummaryContext = `[Visual search: "${visualQuery}"${roomHint !== "any" ? ` — ${roomHint}` : ""}]\nTiles are ordered by photo match strength. Focus your summary on the visual feature.`;
        }

        let poiSummaryContext = "";
        if (resolvedPOI) {
          poiSummaryContext = `[Proximity filter: these listings are within 3 miles of "${resolvedPOI.name}". Mention this in your summary — tell the user how close the homes are to the place they searched near. Each listing tile shows the exact distance.]`;
        }

        let commuteSummaryContext = "";
        if (commuteFrom) {
          const parts = [`[Commute filter: user wants homes within ${commuteMaxMinutes ?? "?"} min ${commuteMode} from "${commuteFrom}".`];
          if (commuteFrom2) parts.push(`Also within ${commuteMaxMinutes2 ?? "?"} min from "${commuteFrom2}".`);
          parts.push("Commute times are being calculated and will appear as badges on each tile. Mention the commute requirement in your summary.]");
          commuteSummaryContext = parts.join(" ");
        }

        log("starting Sonnet summary stream", T0);

        const summaryStream = await withRetry(
          () => anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 512,
            system: buildSearchSystemPrompt(profile, memoryContext),
            messages: [
              { role: "user", content: message },
              { role: "assistant", content: "Searching MLS now..." },
              {
                role: "user",
                content: `[MLS RESULTS]\n${listingsText}\n[/MLS RESULTS]\n${visualSummaryContext ? `\n${visualSummaryContext}\n` : ""}${poiSummaryContext ? `\n${poiSummaryContext}\n` : ""}${commuteSummaryContext ? `\n${commuteSummaryContext}\n` : ""}\nSummarise these listings for the user.`,
              },
            ],
            stream: true,
          }),
          "search summary Sonnet",
        );

        let fullResponse = "";
        let firstToken = true;

        for await (const event of summaryStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            if (firstToken) { log("first summary token", T0); firstToken = false; }
            fullResponse += event.delta.text;
            send({ type: "token", text: event.delta.text });
          }
        }

        // Wait for vision to finish before closing the SSE controller.
        // Vision typically finishes alongside or before Claude. Cap wait at 8s
        // so a slow/failing vision call never hangs the connection indefinitely.
        if (visionPromise) {
          await Promise.race([
            visionPromise,
            new Promise<void>((resolve) => setTimeout(resolve, 8000)),
          ]);
        }

        send({ type: "done" });
        log("DONE — total", T0);

        // Persist history and context synchronously (fast, Redis)
        await appendMessage(userId, { role: "assistant", content: fullResponse, listings }, convId);
        clearPendingAction(userId);
        saveSearchContext(userId, {
          params: searchParams,
          resolvedLocation,
          appliedAt: new Date().toISOString(),
          ...(resolvedPOI ? { nearPOI: { query: nearPOIQuery ?? nearPOIType ?? "", ...resolvedPOI } } : {}),
          ...(commuteFrom ? { commuteFilter: { from: commuteFrom, maxMinutes: commuteMaxMinutes, mode: commuteMode, from2: commuteFrom2, maxMinutes2: commuteMaxMinutes2 } } : {}),
        }, convId);

        // Fire-and-forget background tasks — never block the stream
        // Pass the already-loaded profile to avoid an extra Redis round-trip
        // Visual context forwarded so intelligence tracks aesthetic preferences
        const visualCtx = visualQuery
          ? { visualQuery, roomHint, visualConfidence, descKeywords }
          : undefined;

        recordSearchEvent(userId, searchParams, listings.length, profile, visualCtx);
        extractAndUpdateProfile(userId, message, fullResponse);
        writeMemory(
          userId,
          buildSearchMemoryContent(
            searchParams,
            listings.length,
            resolvedLocation,
            profile.searchCount + 1, // +1 because recordSearchEvent hasn't written yet
            visualCtx,
          ),
        );

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("\x1b[31m[AI error]\x1b[0m", msg);
        log("ERROR", T0);
        send({ type: "error", message: msg });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":    "text/event-stream",
      "Cache-Control":   "no-cache",
      "X-Accel-Buffering": "no",
      "Connection":      "keep-alive",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
    },
  });
}
