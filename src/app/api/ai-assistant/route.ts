import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { anthropic, buildSearchSystemPrompt, buildConversationalSystemPrompt, INTENT_SYSTEM_PROMPT } from "@/lib/ai-assistant/claude";
import { searchListings, formatListingsForPrompt } from "@/lib/ai-assistant/mls";
import {
  loadProfile,
  loadHistory,
  loadSearchContext,
  saveSearchContext,
  appendMessage,
  extractAndUpdateProfile,
} from "@/lib/ai-assistant/memory";
import { writeMemory, getUserMemoryContext } from "@/lib/ai-assistant/supermemory";
import { rankListingPhotos } from "@/lib/ai-assistant/vision";
import { getBatchCachedRankings, setBatchCachedRankings } from "@/lib/ai-assistant/photo-cache";
import { MLSSearchParams, PhotoRankResult } from "@/types/ai-assistant";

export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function log(label: string, ref: number) {
  const ms = Date.now() - ref;
  const color = ms < 1000 ? "\x1b[32m" : ms < 3000 ? "\x1b[33m" : "\x1b[31m";
  console.log(`\x1b[36m[AI]\x1b[0m ${color}+${ms}ms\x1b[0m  ${label}`);
}

const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_mls",
      description:
        "Search MLS for real estate listings. Call this when the user wants to find, " +
        "browse, filter, or re-show properties — including follow-ups like 'now show me X', " +
        "'what about Dallas instead', 'filter to ones with a pool', 'show those again'. " +
        "Do NOT call this if the user is asking about a specific listing already shown.",
      parameters: {
        type: "object",
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
            enum: ["kitchen", "bathroom", "living_room", "bedroom", "exterior", "backyard", "any"],
            description: "Which room the visual_query refers to. Helps prioritize which photos to score.",
          },
          description_keywords: {
            type: "string",
            description:
              "Comma-separated terms to search in listing text descriptions. " +
              "Use for features that may not be photographed: library, wine cellar, theater, solar panels. " +
              "Include synonyms: 'library,study,bookshelf,bookshelves,reading room'. " +
              "Set alongside visual_query whenever the feature is rare or architectural.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reference_listing",
      description:
        "User is asking about a specific listing that was already shown in a previous turn — " +
        "e.g. 'tell me more about the second house', 'what year was the first one built', " +
        "'how big is listing #3', 'tell me about that last one'. " +
        "Never call this for a new search. Always prefer this over search_mls when listings were already shown.",
      parameters: {
        type: "object",
        properties: {
          listing_index: {
            type: "integer",
            description: "1-based position of the listing the user is referring to (1 = first tile shown, 2 = second, etc.)",
          },
        },
        required: ["listing_index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "answer_user",
      description:
        "Answer a general conversational question that does NOT involve listings. " +
        "Use this for greetings, general real estate advice, mortgage questions, " +
        "neighborhood questions, or anything that doesn't reference a specific shown listing " +
        "and doesn't need a new MLS search.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Brief description of what the user is asking about" },
        },
        required: ["topic"],
      },
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

        // Redis is fast (~30ms)
        const [profile, history, searchCtx] = await Promise.all([
          loadProfile(userId),
          loadHistory(userId, 20),
          loadSearchContext(userId),
        ]);
        log("profile + history loaded", T0);

        await appendMessage(userId, { role: "user", content: message });

        // Build Claude messages — if an assistant turn showed listings, append a
        // numbered block so Claude can answer positional follow-ups ("the second home").
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

        // ── Step 1: Groq routing (~1-2s) — race Supermemory in parallel ─────────
        console.log("\x1b[36m[AI]\x1b[0m \x1b[35m→ Groq routing call\x1b[0m");

        // Build the search context block injected into Groq so implicit carry-over
        // queries ("such homes", "same filters in X") always have concrete params.
        const searchCtxBlock = searchCtx
          ? `\n## Last search context\nLocation: ${searchCtx.resolvedLocation}\nFilters: ${Object.entries(searchCtx.params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}\n`
          : "";

        const [groqResponse, memoryContext] = await Promise.all([
          groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 256,
            temperature: 0,
            messages: [
              { role: "system", content: INTENT_SYSTEM_PROMPT + searchCtxBlock },
              ...history.slice(-8).map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.role === "assistant"
                  ? m.listings && m.listings.length > 0
                    ? `[showed ${m.listings.length} listings: ${m.listings.map((l, i) => `#${i + 1} ${l.full_address}`).join(", ")}]`
                    : "[assistant responded with answer]"
                  : m.content,
              })),
              { role: "user", content: message },
            ],
            tools: TOOLS,
            tool_choice: "required",
          }),
          // Give Supermemory the same time Groq takes — if not done, resolve empty
          Promise.race([
            memoryPromise,
            new Promise<string>((resolve) => setTimeout(() => resolve(""), 2000)),
          ]),
        ]);

        log("Groq routing done", T0);
        if (memoryContext) log("memory context ready", T0);

        const toolCall = groqResponse.choices[0].message.tool_calls?.[0];
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
          writeMemory(userId, `User asked: ${message}\nAssistant answered: ${fullResp}`);

          controller.close();
          return;
        }

        // ── reference_listing → look up from history, focus single tile ─────
        if (toolName === "reference_listing") {
          console.log("\x1b[36m[AI]\x1b[0m reference_listing path");
          const { listing_index } = JSON.parse(toolCall.function.arguments) as { listing_index: number };

          // Find the most recent assistant turn that has listings
          const lastListingTurn = [...history].reverse().find((m) => m.listings && m.listings.length > 0);
          const targetListing = lastListingTurn?.listings?.[listing_index - 1];

          if (!targetListing) {
            // No listing found at that index — fall through to conversational answer
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
            writeMemory(userId, `User asked: ${message}\nAssistant answered: ${fallbackResp}`);
            controller.close();
            return;
          }

          // Emit a single focused tile immediately — no MLS call needed
          send({ type: "listing_focus", data: targetListing, index: listing_index });
          log(`listing_focus tile emitted (index ${listing_index})`, T0);

          // Build a focused listing block for Claude
          const focusedListingText = [
            `Address: ${targetListing.full_address}`,
            `Price: $${targetListing.listing_price?.toLocaleString()}`,
            `Bedrooms: ${targetListing.bedrooms}`,
            `Bathrooms: ${targetListing.bathrooms}`,
            `Living area: ${targetListing.living_area?.toLocaleString()} sqft`,
            targetListing.lot_size ? `Lot size: ${targetListing.lot_size?.toLocaleString()} sqft` : null,
            targetListing.year_built ? `Year built: ${targetListing.year_built}` : null,
            targetListing.has_pool != null ? `Pool: ${targetListing.has_pool ? "Yes" : "No"}` : null,
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
              ...conversationMessages.slice(0, -1), // history without current message
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

          await appendMessage(userId, { role: "assistant", content: focusResp });
          extractAndUpdateProfile(userId, message, focusResp);
          writeMemory(userId, `User asked about listing #${listing_index} (${targetListing.full_address}): ${message}\nAssistant answered: ${focusResp}`);
          controller.close();
          return;
        }

        // ── search_mls → fetch listings, stream summary ───────────────────────
        // Declared here so they're in scope for vision merge and controller await
        let visionPromise: Promise<void> | null = null;
        const textScoreMap = new Map<string, number>(); // listingId → description text score

        const rawParams = JSON.parse(toolCall.function.arguments);

        // Extract visual fields before passing params to MLS (they are not MLS API fields)
        const visualQuery: string | undefined = rawParams.visual_query;
        const roomHint: string = rawParams.room_hint ?? "any";
        const descKeywords: string[] = rawParams.description_keywords
          ? (rawParams.description_keywords as string).split(",").map((k: string) => k.trim()).filter(Boolean)
          : [];
        delete rawParams.visual_query;
        delete rawParams.room_hint;
        delete rawParams.description_keywords;

        const searchParams: MLSSearchParams = rawParams;
        // For visual queries, fetch more candidates so vision has a larger pool to score
        if (visualQuery && !searchParams.size) {
          searchParams.size = 12;
        }
        console.log(`\x1b[36m[AI]\x1b[0m search params: ${JSON.stringify(searchParams)}`);
        if (visualQuery) {
          console.log(`\x1b[36m[AI]\x1b[0m \x1b[35mvisual_query:\x1b[0m "${visualQuery}" room_hint="${roomHint}"`);
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

              visionPromise = rankListingPhotos(uncachedListings, visualQuery, roomHint)
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
              content: `[MLS RESULTS]\n${listingsText}\n[/MLS RESULTS]\n\nSummarise these listings for the user.`,
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

        await appendMessage(userId, { role: "assistant", content: fullResponse, listings });
        saveSearchContext(userId, {
          params: searchParams,
          resolvedLocation: [searchParams.city, searchParams.state].filter(Boolean).join(", ") || "Unknown",
          appliedAt: new Date().toISOString(),
        });
        extractAndUpdateProfile(userId, message, fullResponse);
        writeMemory(
          userId,
          `User searched: "${message}"\nFilters: ${JSON.stringify(searchParams)}\nResults: ${listingsText}\nSummary: ${fullResponse}`,
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
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      "Connection": "keep-alive",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
    },
  });
}
