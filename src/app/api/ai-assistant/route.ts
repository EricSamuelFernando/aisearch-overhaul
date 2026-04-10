import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { anthropic, buildSystemPrompt, INTENT_SYSTEM_PROMPT } from "@/lib/ai-assistant/claude";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
import { searchListings, formatListingsForPrompt } from "@/lib/ai-assistant/mls";
import {
  loadProfile,
  loadHistory,
  appendMessage,
  extractAndUpdateProfile,
} from "@/lib/ai-assistant/memory";
import { MLSSearchParams } from "@/types/ai-assistant";

export const runtime = "nodejs";

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function log(label: string, ref: number) {
  const ms = Date.now() - ref;
  const color = ms < 1000 ? "\x1b[32m" : ms < 3000 ? "\x1b[33m" : "\x1b[31m";
  console.log(`\x1b[36m[AI]\x1b[0m ${color}+${ms}ms\x1b[0m  ${label}`);
}

// ── Tool definitions ─────────────────────────────────────────────────────────
// Groq uses OpenAI format; Anthropic uses its own format.
// We define both so each client gets the right shape.

const MLS_TOOL_PROPERTIES = {
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
  size:               { type: "integer", description: "Results count, default 6 max 12" },
};

const MLS_TOOL_DESCRIPTION =
  "Search MLS real estate listings. Call this whenever the user wants to find, browse, " +
  "filter, or re-show properties — including follow-ups like 'show those again' or 'filter to ones with a pool'.";

// Groq / OpenAI format
const MLS_TOOL_GROQ: Groq.Chat.ChatCompletionTool = {
  type: "function",
  function: {
    name: "search_mls",
    description: MLS_TOOL_DESCRIPTION,
    parameters: { type: "object", properties: MLS_TOOL_PROPERTIES, required: [] },
  },
};


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

        const [profile, history] = await Promise.all([
          loadProfile(userId),
          loadHistory(userId, 20),
        ]);
        const systemPrompt = buildSystemPrompt(profile);
        log("profile + history loaded", T0);

        await appendMessage(userId, { role: "user", content: message });

        const conversationMessages: Anthropic.MessageParam[] = [
          ...history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: message },
        ];

        // ── Step 1: Groq (Llama 3.1 8B) extracts intent ──────────────────────
        // Runs on LPU hardware → ~200-400ms vs ~1500-4000ms for any API-based LLM.
        console.log("\x1b[36m[AI]\x1b[0m \x1b[35m→ Groq intent call (llama3-groq-8b)\x1b[0m");

        const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
          ...conversationMessages.slice(-6).map((m) => ({
            role: m.role as "user" | "assistant",
            content: typeof m.content === "string" ? m.content : "",
          })),
        ];

        const groqResponse = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          max_tokens: 256,
          temperature: 0,
          messages: [
            { role: "system", content: INTENT_SYSTEM_PROMPT },
            ...groqMessages,
          ],
          tools: [MLS_TOOL_GROQ],
          tool_choice: "auto",
        });

        log("Groq intent done", T0);

        const groqChoice = groqResponse.choices[0];
        const groqToolCall = groqChoice.message.tool_calls?.[0];

        // ── No search needed — conversational response ────────────────────────
        if (!groqToolCall) {
          console.log("\x1b[36m[AI]\x1b[0m conversational (no tool call)");
          const responseText = groqChoice.message.content ?? "";
          send({ type: "token", text: responseText });
          send({ type: "done" });
          log("DONE — conversational", T0);
          await appendMessage(userId, { role: "assistant", content: responseText });
          await extractAndUpdateProfile(userId, responseText);
          controller.close();
          return;
        }

        // ── Step 2: Execute MLS search immediately ────────────────────────────
        const searchParams: MLSSearchParams = JSON.parse(groqToolCall.function.arguments);
        console.log(`\x1b[36m[AI]\x1b[0m tool params: ${JSON.stringify(searchParams)}`);

        let listings: Awaited<ReturnType<typeof searchListings>> = [];
        let listingsText = "";

        try {
          listings = await searchListings(searchParams);
          log(`MLS returned ${listings.length} listing(s)`, T0);
          send({ type: "listings", data: listings });
          log("tiles emitted to client", T0);
          listingsText = formatListingsForPrompt(listings);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("\x1b[31m[MLS error]\x1b[0m", msg);
          listingsText = `MLS search failed: ${msg}. Apologise briefly and suggest the user try again.`;
          send({ type: "listings", data: [] });
        }

        // ── Step 3: Sonnet streams the summary ───────────────────────────────
        // Simple prompt injection — no tool_result format needed since intent
        // was handled by Groq, not Anthropic.
        log("starting Sonnet summary stream", T0);

        const summaryMessages: Anthropic.MessageParam[] = [
          { role: "user", content: message },
          { role: "assistant", content: "Searching MLS now..." },
          {
            role: "user",
            content: `[MLS RESULTS]\n${listingsText}\n[/MLS RESULTS]\n\nSummarise these listings for the user.`,
          },
        ];

        const summaryStream = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          system: systemPrompt,
          messages: summaryMessages,
          stream: true,
        });

        let fullResponse = "";
        let firstToken = true;

        for await (const event of summaryStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            if (firstToken) {
              log("first summary token", T0);
              firstToken = false;
            }
            fullResponse += event.delta.text;
            send({ type: "token", text: event.delta.text });
          }
        }

        send({ type: "done" });
        log("DONE — total", T0);
        await appendMessage(userId, { role: "assistant", content: fullResponse });
        await extractAndUpdateProfile(userId, fullResponse);
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
