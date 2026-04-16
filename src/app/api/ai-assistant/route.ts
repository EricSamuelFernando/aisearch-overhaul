import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
// [OpenAI-compatible routing — uncomment + comment out Haiku block to switch provider]
// import OpenAI from "openai";
import {
  anthropic,
  buildIntentSystemPrompt,
  buildSearchSystemPrompt,
  buildConversationalSystemPrompt,
} from "@/lib/ai-assistant/claude";
import { buildIntelligenceBlock, buildSearchMemoryContent, applyRelativeRefinement } from "@/lib/ai-assistant/intelligence";
import { searchListings, formatListingsForPrompt } from "@/lib/ai-assistant/mls";
import {
  loadProfile,
  loadHistory,
  loadSearchContext,
  saveSearchContext,
  loadPendingAction,
  clearPendingAction,
  appendMessage,
  extractAndUpdateProfile,
  extractAndSavePendingAction,
  recordSearchEvent,
} from "@/lib/ai-assistant/memory";
import { writeMemory, getUserMemoryContext } from "@/lib/ai-assistant/supermemory";
import { rankListingPhotos } from "@/lib/ai-assistant/vision";
import { getBatchCachedRankings, setBatchCachedRankings } from "@/lib/ai-assistant/photo-cache";
import { MLSSearchParams, PhotoRankResult } from "@/types/ai-assistant";

export const runtime = "nodejs";

// const sambanova = new OpenAI({ apiKey: process.env.SAMBANOVA_API_KEY, baseURL: "https://api.sambanova.ai/v1" });
// const fireworks  = new OpenAI({ apiKey: process.env.FIREWORKS_API_KEY,  baseURL: "https://api.fireworks.ai/inference/v1" });

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}


function log(label: string, ref: number) {
  const ms = Date.now() - ref;
  const color = ms < 1000 ? "\x1b[32m" : ms < 3000 ? "\x1b[33m" : "\x1b[31m";
  console.log(`\x1b[36m[AI]\x1b[0m ${color}+${ms}ms\x1b[0m  ${label}`);
}

// ── [OpenAI-compatible tool schema — uncomment for SambaNova / Fireworks] ────
// const TOOLS: OpenAI.ChatCompletionTool[] = [
//   { type: "function", function: { name: "search_mls", description: "Search MLS for real estate listings...", parameters: { type: "object", properties: { city: { type: "string" }, state: { type: "string" }, listing_price_min: { type: "number" }, listing_price_max: { type: "number" }, bedrooms_min: { type: "integer" }, bathrooms_min: { type: "number" }, has_pool: { type: "boolean" }, is_water_front: { type: "boolean" }, is_water_view: { type: "boolean" }, living_area_min: { type: "integer" }, year_built_min: { type: "integer" }, year_built_max: { type: "integer" }, days_on_market_max: { type: "integer" }, size: { type: "integer" }, visual_query: { type: "string" }, room_hint: { type: "string", enum: ["kitchen","dining_room","bathroom","living_room","bedroom","exterior","backyard","any"] }, visual_confidence: { type: "string", enum: ["high","medium","low"] }, description_keywords: { type: "string" } }, required: [] } } },
//   { type: "function", function: { name: "reference_listing", description: "User is asking about the details of ONE specific listing already shown.", parameters: { type: "object", properties: { listing_index: { type: "integer", description: "1-based position" } }, required: ["listing_index"] } } },
//   { type: "function", function: { name: "answer_user", description: "Answer a general conversational question with no property search intent.", parameters: { type: "object", properties: { topic: { type: "string" } }, required: ["topic"] } } },
// ];
// ─────────────────────────────────────────────────────────────────────────────

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
        city:               { type: "string",  description: "City name, title-cased e.g. 'Austin'" },
        state:              { type: "string",  description: "Two-letter state code e.g. 'TX'" },
        listing_price_min:  { type: "number",  description: "Minimum price in dollars" },
        listing_price_max:  { type: "number",  description: "Maximum price in dollars" },
        bedrooms_min:       { type: "integer", description: "Minimum bedrooms" },
        bathrooms_min:      { type: "number",  description: "Minimum bathrooms" },
        has_pool:           { type: "boolean", description: "Must have a pool" },
        is_water_front:     { type: "boolean", description: "Must be on waterfront" },
        is_water_view:      { type: "boolean", description: "Must have water view" },
        living_area_min:    { type: "integer", description: "Minimum sq ft" },
        year_built_min:     { type: "integer", description: "Minimum year built" },
        year_built_max:     { type: "integer", description: "Maximum year built" },
        days_on_market_max: { type: "integer", description: "Maximum days on market" },
        size:               { type: "integer", description: "Number of results, default 6 max 12" },
        visual_query: {
          type: "string",
          description:
            "Visual/aesthetic feature the user wants to see in listing photos. " +
            "Set ONLY when user describes something visual that cannot be expressed as an MLS filter. " +
            "Examples: 'blue painted kitchen cabinets', 'bright natural sunlight through large windows', " +
            "'open concept kitchen flowing into living room', 'hardwood floors', 'vaulted ceilings', " +
            "'modern white interior', 'mountain view from inside'. " +
            "Do NOT set for pool, waterfront, bedrooms, price — those are MLS filters.",
        },
        room_hint: {
          type: "string",
          enum: ["kitchen", "dining_room", "bathroom", "living_room", "bedroom", "exterior", "backyard", "any"],
          description: "Which room the visual_query refers to.",
        },
        visual_confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description:
            "'high' = very specific visual feature. 'medium' = moderately specific. 'low' = generic aesthetic.",
        },
        description_keywords: {
          type: "string",
          description:
            "Comma-separated terms to search in listing text descriptions. " +
            "Include synonyms: 'library,study,bookshelf,bookshelves,reading room'.",
        },
      },
    },
  },
  {
    name: "reference_listing",
    description:
      "User is asking about the details of ONE specific listing already shown in a previous turn — " +
      "e.g. 'tell me more about the second house', 'what year was the first one built', " +
      "'how big is listing #3'. Never call this to re-show all listings or run a new search.",
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

// Terms that indicate a genuine buyer preference — used to gate Supermemory writes
// on answer_user turns so we don't pollute with greetings and generic Q&A.
// Length guard (<=30 chars) handles the short cases before this list is checked.
const PREFERENCE_TERMS = [
  'budget', 'afford', 'bedroom', 'bathroom', 'pool', 'garage',
  'yard', 'basement', 'school district', 'commute', 'waterfront',
  'condo', 'townhouse', 'single family', 'must have', 'deal breaker',
  'prefer', 'looking for', "don't want", 'avoid', 'no hoa',
  'square feet', 'sqft', 'neighborhood', 'downtown', 'suburb',
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
        const { message, userId } = await req.json();

        if (!message || !userId) {
          send({ type: "error", message: "Missing message or userId" });
          controller.close();
          return;
        }

        console.log(`\x1b[36m[AI]\x1b[0m query: "${message.slice(0, 80)}"`);

        // Supermemory fires in background — never blocks Redis or Groq
        const memoryPromise = getUserMemoryContext(userId, message);

        // Redis parallel load (~30ms) — profile now includes intelligence fields
        const [profile, history, searchCtx, pendingAction] = await Promise.all([
          loadProfile(userId),
          loadHistory(userId, 20),
          loadSearchContext(userId),
          loadPendingAction(userId),
        ]);
        log("profile + history loaded", T0);

        await appendMessage(userId, { role: "user", content: message });

        // Build conversation history for Claude — inject listing context blocks
        // so Claude can answer positional follow-ups ("the second home").
        const conversationMessages: Anthropic.MessageParam[] = [
          ...history.flatMap((m) => {
            const base: Anthropic.MessageParam = {
              role: m.role as "user" | "assistant",
              content: m.content,
            };
            if (m.role === "assistant" && m.listings && m.listings.length > 0) {
              const listingBlock = m.listings
                .map(
                  (l, i) =>
                    `#${i + 1}: ${l.full_address} — $${l.listing_price?.toLocaleString()}, ${l.bedrooms}bd/${l.bathrooms}ba, ${l.living_area?.toLocaleString()} sqft${l.year_built ? `, built ${l.year_built}` : ""}`,
                )
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

        // ── Step 1: SambaNova routing (~1-3s) ────────────────────────────────
        console.log("\x1b[36m[AI]\x1b[0m \x1b[35m→ SambaNova routing call\x1b[0m");

        // ── Pre-route pure affirmations in code — never let the LLM mishandle them ──
        // A pure affirmation is a short message (≤5 words) with no search-intent words.
        // If one is detected with no pending action and no search context, skip Groq entirely.
        const SEARCH_WORDS = /\b(show|find|search|home|house|listing|propert|look|get|pull|fetch)\b/i;
        const PURE_AFFIRMATION = /^(yes|yeah|sure|ok|okay|yep|yup|sounds good|makes sense|that works|got it|great|alright|cool|perfect|nice|awesome|fine)\.?!?\s*$/i;
        const isPureAffirmation = PURE_AFFIRMATION.test(message.trim()) && !SEARCH_WORDS.test(message);

        if (isPureAffirmation && !pendingAction && !searchCtx) {
          // Nothing to confirm, nothing to search — answer conversationally
          const memoryContext = await Promise.race([
            memoryPromise,
            new Promise<string>((resolve) => setTimeout(() => resolve(""), 2000)),
          ]);
          const ackStream = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 256,
            system: buildConversationalSystemPrompt(profile, memoryContext),
            messages: [{ role: "user", content: message }],
            stream: true,
          });
          let ackResp = "";
          for await (const ev of ackStream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              ackResp += ev.delta.text;
              send({ type: "token", text: ev.delta.text });
            }
          }
          send({ type: "done" });
          await appendMessage(userId, { role: "assistant", content: ackResp });
          controller.close();
          return;
        }

        // ── Multi-city pre-route ─────────────────────────────────────────────────
        // Fires when user explicitly asks to search across their saved/preferred
        // locations (not just "show me homes" ambiguity). Runs parallel MLS calls —
        // one per location (capped at 3), merges and deduplicates, streams a unified
        // summary. Skips SambaNova entirely — intent is unambiguous.
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

          log(`multi-city (${locations.join(" + ")}): ${listings.length} listing(s)`, T0);
          send({ type: "listings", data: listings });
          log("tiles emitted to client", T0);

          const multiSummaryStream = await anthropic.messages.create({
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
          });

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

          await appendMessage(userId, { role: "assistant", content: multiFullResp, listings });
          clearPendingAction(userId);
          const primaryLoc = parseLocation(locations[0]);
          saveSearchContext(userId, {
            params: { ...carryParams, ...primaryLoc },
            resolvedLocation: locations.join(" + "),
            appliedAt: new Date().toISOString(),
          });
          recordSearchEvent(userId, { ...carryParams, city: locations[0], state: primaryLoc.state }, listings.length, profile);
          writeMemory(userId, `User searched preferred locations: ${locations.join(", ")}. ${listings.length} result(s).`);
          controller.close();
          return;
        }

        // Build buyer intelligence block from already-loaded profile (zero extra I/O)
        const intelligenceBlock = buildIntelligenceBlock(profile);
        if (intelligenceBlock) log("intelligence block ready", T0);

        // Pre-compute relative refinements in JS — deterministic, no LLM arithmetic.
        // Adjusted values are shown to Groq so it uses the exact numbers we computed.
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
          ? `\n## Pending proposed action\nThe assistant proposed a search last turn: "${pendingAction.description}"\nParams: ${Object.entries(pendingAction.params)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}\nIf the user confirms ("yes", "do that", "go ahead", "sure"), call search_mls with these params.\n`
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

        // ── [OpenAI-compatible routing — uncomment for SambaNova / Fireworks] ──
        // const callRouting = () => sambanova.chat.completions.create({
        //   model: "Meta-Llama-3.3-70B-Instruct",   // Fireworks: "accounts/fireworks/models/llama-v3p3-70b-instruct"
        //   max_tokens: 256, temperature: 0,
        //   messages: [{ role: "system", content: routingSystem }, ...routingHistory],
        //   tools: TOOLS, tool_choice: "required",
        // });
        // const [routingResponse, memoryContext] = await Promise.all([
        //   callRouting().catch(async (err) => { if (err?.status === 429) { await new Promise(r => setTimeout(r, 3000)); return callRouting(); } throw err; }),
        //   Promise.race([memoryPromise, new Promise<string>(r => setTimeout(() => r(""), 2000))]),
        // ]);
        // const rawToolCall = routingResponse.choices[0].message.tool_calls?.[0] as { function: { name: string; arguments: string } } | undefined;
        // ─────────────────────────────────────────────────────────────────────

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
          callHaikuRouting().catch(async (err) => {
            if (err?.status === 429) {
              console.warn("\x1b[33m[AI]\x1b[0m Haiku routing 429 — retrying in 3s");
              await new Promise((r) => setTimeout(r, 3000));
              return callHaikuRouting();
            }
            throw err;
          }),
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
          const convStream = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 512,
            system: buildConversationalSystemPrompt(profile, memoryContext),
            messages: conversationMessages,
            stream: true,
          });

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

          await appendMessage(userId, { role: "assistant", content: fullResp });
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

          const lastListingTurn = [...history].reverse().find((m) => m.listings && m.listings.length > 0);
          const targetListing = lastListingTurn?.listings?.[listing_index - 1];

          if (!targetListing) {
            // No listing at that index — fall through to conversational
            const fallbackStream = await anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 512,
              system: buildConversationalSystemPrompt(profile, memoryContext),
              messages: conversationMessages,
              stream: true,
            });
            let fallbackResp = "";
            for await (const ev of fallbackStream) {
              if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
                fallbackResp += ev.delta.text;
                send({ type: "token", text: ev.delta.text });
              }
            }
            send({ type: "done" });
            await appendMessage(userId, { role: "assistant", content: fallbackResp });
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
            targetListing.lot_size    ? `Lot size: ${targetListing.lot_size?.toLocaleString()} sqft` : null,
            targetListing.year_built  ? `Year built: ${targetListing.year_built}` : null,
            targetListing.has_pool    != null ? `Pool: ${targetListing.has_pool ? "Yes" : "No"}` : null,
            targetListing.days_on_market != null ? `Days on market: ${targetListing.days_on_market}` : null,
            targetListing.description ? `Description: ${targetListing.description}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          const focusStream = await anthropic.messages.create({
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
          });

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

          await appendMessage(userId, { role: "assistant", content: focusResp, focusedListing: targetListing });
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
        const textScoreMap = new Map<string, number>(); // listingId → description text score

        const rawParams = JSON.parse(toolCall.function.arguments);

        // Groq occasionally returns typed params as strings — coerce at the boundary
        const NUMERIC_MLS_PARAMS = [
          "listing_price_min", "listing_price_max",
          "bedrooms_min", "bedrooms_max",
          "bathrooms_min", "bathrooms_max",
          "living_area_min", "living_area_max",
          "year_built_min", "year_built_max",
          "days_on_market_min", "days_on_market_max",
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

        const searchParams: MLSSearchParams = rawParams;
        // For visual queries, fetch more candidates so vision has a larger pool to score
        if (visualQuery && !searchParams.size) {
          searchParams.size = 12;
        }
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

          // ── Text scoring: instant, zero API cost — runs against listing descriptions
          if (visualQuery && descKeywords.length > 0 && listings.length > 0) {
            for (const l of listings) {
              const score = scoreByDescription(l.description, descKeywords);
              if (score > 0) textScoreMap.set(l.id, score);
            }
            if (textScoreMap.size > 0) {
              log(`description text match: ${textScoreMap.size}/${listings.length} listing(s)`, T0);
              // Apply text scores immediately so initial card order reflects text evidence
              listings = listings.map((l) => {
                const textScore = textScoreMap.get(l.id) ?? 0;
                return textScore > 0 ? { ...l, bestScore: textScore } : l;
              });
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
            // Pre-sort: cache hits with scores bubble up; uncached (no score) hold at end
            listings.sort((a, b) => (b.bestScore ?? -1) - (a.bestScore ?? -1));
          }

          send({ type: "listings", data: listings });
          log("tiles emitted to client", T0);
          listingsText = formatListingsForPrompt(listings);

          // ── For listings NOT in cache: start vision in parallel with Claude.
          //    We store the promise so we can await it before closing the
          //    SSE controller — fixes "Controller is already closed" error.
          if (visualQuery && listings.length > 0) {
            const uncachedListings = listings.filter((l) => !cacheMap.get(l.id));

            if (uncachedListings.length > 0) {
              console.log(`\x1b[36m[AI]\x1b[0m \x1b[35mstarting vision for ${uncachedListings.length} uncached listing(s)\x1b[0m`);

              visionPromise = rankListingPhotos(uncachedListings, visualQuery, roomHint, visualConfidence)
                .then(async (results) => {
                  // Merge vision score with text score — take the higher of the two
                  const merged = results.map((r) => {
                    const textScore = textScoreMap.get(r.listingId) ?? 0;
                    return textScore > r.bestScore ? { ...r, bestScore: textScore } : r;
                  });
                  send({ type: "photo_rank", data: merged });
                  log(`photo_rank SSE sent for ${merged.length} listing(s)`, T0);
                  await setBatchCachedRankings(visualQuery, merged);
                  log("photo_rank cached", T0);

                  // Feed top photo matches back into Supermemory — this closes the
                  // intelligence loop: we write not just that a visual search happened,
                  // but what actually scored well. Future sessions get semantic context
                  // about which features resonated, not just that they were searched.
                  const topMatches = merged
                    .filter((r) => r.bestScore >= 0.5)
                    .sort((a, b) => b.bestScore - a.bestScore);
                  if (topMatches.length > 0) {
                    const topListing = listings.find((l) => l.id === topMatches[0].listingId);
                    const quality = topMatches[0].bestScore >= 0.7 ? "strong" : "partial";
                    writeMemory(
                      userId,
                      `Visual match result: "${visualQuery}" in ${resolvedLocation} — ${quality} photo match found. ` +
                      `Best: ${topListing?.full_address ?? "unknown"} (score ${topMatches[0].bestScore.toFixed(2)}). ` +
                      `${topMatches.length}/${merged.length} listing(s) above 0.5 threshold.`,
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
          send({ type: "listings", data: [] });
        }

        const resolvedLocation =
          [searchParams.city, searchParams.state].filter(Boolean).join(", ") || "Unknown";

        // Build visual search context block for Sonnet — tells it what was searched
        // and which listings have description evidence, so it can frame the response
        // around the visual feature rather than writing a generic spec summary.
        let visualSummaryContext = "";
        if (visualQuery) {
          const lines = [`[Visual search: "${visualQuery}"${roomHint !== "any" ? ` — ${roomHint}` : ""}]`];
          const textMatches = [...textScoreMap.entries()]
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => listings.find((l) => l.id === id)?.full_address)
            .filter(Boolean) as string[];
          if (textMatches.length > 0) {
            lines.push(`Description evidence found in: ${textMatches.join("; ")}`);
          } else {
            lines.push("No description mentions found — photo ranking is the primary signal.");
          }
          lines.push("Tiles are ordered by photo match strength. Focus your summary on the visual feature.");
          visualSummaryContext = lines.join("\n");
        }

        log("starting Sonnet summary stream", T0);

        const summaryStream = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          system: buildSearchSystemPrompt(profile, memoryContext),
          messages: [
            { role: "user", content: message },
            { role: "assistant", content: "Searching MLS now..." },
            {
              role: "user",
              content: `[MLS RESULTS]\n${listingsText}\n[/MLS RESULTS]\n${visualSummaryContext ? `\n${visualSummaryContext}\n` : ""}\nSummarise these listings for the user.`,
            },
          ],
          stream: true,
        });

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
        await appendMessage(userId, { role: "assistant", content: fullResponse, listings });
        clearPendingAction(userId);
        saveSearchContext(userId, {
          params: searchParams,
          resolvedLocation,
          appliedAt: new Date().toISOString(),
        });

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
