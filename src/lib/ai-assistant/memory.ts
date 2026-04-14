import Groq from "groq-sdk";
import { getRedis } from "./db";
import { BuyerProfile, AIAssistantMessage, SearchContext, PendingAction, MLSSearchParams } from "@/types/ai-assistant";

const PROFILE_TTL         = 60 * 60 * 24 * 90; // 90 days
const HISTORY_TTL         = 60 * 60 * 24 * 30; // 30 days
const SEARCH_CTX_TTL      = 60 * 60 * 24 * 7;  // 7 days
const PENDING_ACTION_TTL  = 60 * 10;            // 10 minutes — stale proposals must not linger
const HISTORY_MAX = 40;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function profileKey(userId: string)       { return `profile:${userId}`; }
function historyKey(userId: string)       { return `history:${userId}`; }
function searchCtxKey(userId: string)     { return `search_ctx:${userId}`; }
function pendingActionKey(userId: string) { return `pending_action:${userId}`; }

const DEFAULT_PROFILE = (userId: string): BuyerProfile => ({
  userId,
  preferredLocations: [],
  budgetMin: null,
  budgetMax: null,
  bedroomsMin: null,
  bathroomsMin: null,
  mustHaves: [],
  dealBreakers: [],
  propertyTypes: [],
  lastUpdated: new Date().toISOString(),
});

export async function loadProfile(userId: string): Promise<BuyerProfile> {
  const redis = getRedis();
  const data = await redis.get<BuyerProfile>(profileKey(userId));
  return data ?? DEFAULT_PROFILE(userId);
}

export async function saveProfile(profile: BuyerProfile): Promise<void> {
  const redis = getRedis();
  await redis.set(profileKey(profile.userId), profile, { ex: PROFILE_TTL });
}

export async function loadHistory(userId: string, limit = 20): Promise<AIAssistantMessage[]> {
  const redis = getRedis();
  const items = await redis.lrange<AIAssistantMessage>(historyKey(userId), -limit, -1);
  return items ?? [];
}

export async function loadSearchContext(userId: string): Promise<SearchContext | null> {
  const redis = getRedis();
  return redis.get<SearchContext>(searchCtxKey(userId));
}

export async function saveSearchContext(userId: string, ctx: SearchContext): Promise<void> {
  const redis = getRedis();
  await redis.set(searchCtxKey(userId), ctx, { ex: SEARCH_CTX_TTL });
}

export async function loadPendingAction(userId: string): Promise<PendingAction | null> {
  const redis = getRedis();
  return redis.get<PendingAction>(pendingActionKey(userId));
}

export async function clearPendingAction(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(pendingActionKey(userId));
}

/**
 * Fire-and-forget after every answer_user response.
 * Uses Groq to detect if Claude proposed a specific search and extracts params.
 * Stores as PendingAction so the next user turn ("yes", "do that", "go ahead")
 * can be correctly routed to search_mls without re-asking.
 */
export async function extractAndSavePendingAction(
  userId: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 256,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You detect whether an AI real estate assistant proposed a specific MLS search in its response.
If a specific search was proposed (specific city/neighborhood, price, beds, features), extract the params.
If no specific search was proposed — just general advice, questions, or vague offers — return null for all fields.`,
        },
        {
          role: "user",
          content: `Assistant response: "${assistantResponse.slice(0, 800)}"`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "set_pending_search",
            description: "Call this if a specific search was proposed. Return null params if no specific search was proposed.",
            parameters: {
              type: "object",
              properties: {
                proposed: { type: "boolean", description: "true if a specific search was proposed, false otherwise" },
                description: { anyOf: [{ type: "string" }, { type: "null" }], description: "Short human-readable description e.g. 'search Sunset & Richmond, 3bd, pool, under $1M'" },
                city:               { anyOf: [{ type: "string" }, { type: "null" }] },
                state:              { anyOf: [{ type: "string" }, { type: "null" }] },
                listing_price_max:  { anyOf: [{ type: "number" }, { type: "null" }] },
                listing_price_min:  { anyOf: [{ type: "number" }, { type: "null" }] },
                bedrooms_min:       { anyOf: [{ type: "integer" }, { type: "null" }] },
                bathrooms_min:      { anyOf: [{ type: "number" }, { type: "null" }] },
                has_pool:           { anyOf: [{ type: "boolean" }, { type: "null" }] },
                days_on_market_max: { anyOf: [{ type: "integer" }, { type: "null" }] },
                living_area_min:    { anyOf: [{ type: "integer" }, { type: "null" }] },
              },
              required: ["proposed"],
            },
          },
        },
      ],
      tool_choice: "required",
    });

    const toolCall = result.choices[0].message.tool_calls?.[0];
    if (!toolCall) return;

    const raw = JSON.parse(toolCall.function.arguments) as {
      proposed: boolean;
      description?: string | null;
      city?: string | null;
      state?: string | null;
      listing_price_max?: number | null;
      listing_price_min?: number | null;
      bedrooms_min?: number | null;
      bathrooms_min?: number | null;
      has_pool?: boolean | null;
      days_on_market_max?: number | null;
      living_area_min?: number | null;
    };

    if (!raw.proposed) return;

    // Build params — only include non-null fields
    const params: MLSSearchParams = Object.fromEntries(
      Object.entries({
        city:               raw.city,
        state:              raw.state,
        listing_price_max:  raw.listing_price_max,
        listing_price_min:  raw.listing_price_min,
        bedrooms_min:       raw.bedrooms_min,
        bathrooms_min:      raw.bathrooms_min,
        has_pool:           raw.has_pool,
        days_on_market_max: raw.days_on_market_max,
        living_area_min:    raw.living_area_min,
      }).filter(([, v]) => v !== null && v !== undefined),
    );

    if (Object.keys(params).length === 0) return;

    const redis = getRedis();
    const action: PendingAction = {
      type: "search_mls",
      params,
      description: raw.description ?? "proposed search",
      proposedAt: new Date().toISOString(),
    };
    await redis.set(pendingActionKey(userId), action, { ex: PENDING_ACTION_TTL });
    console.log(`\x1b[36m[Memory]\x1b[0m pending action saved for ${userId}: ${action.description}`);
  } catch (err) {
    // Non-critical — never break the main flow
    console.warn("[Memory] pending action extraction failed:", err instanceof Error ? err.message : err);
  }
}

export async function appendMessage(userId: string, message: AIAssistantMessage): Promise<void> {
  const redis = getRedis();
  const key = historyKey(userId);
  await redis.rpush(key, message);
  await redis.ltrim(key, -HISTORY_MAX, -1);
  await redis.expire(key, HISTORY_TTL);
}

/**
 * Extract structured buyer profile updates from the conversation using Groq tool calling.
 * Runs fire-and-forget after the response is streamed — never blocks the user.
 * Replaces the fragile [PROFILE_UPDATE] regex approach.
 */
export async function extractAndUpdateProfile(
  userId: string,
  userMessage: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 256,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Extract buyer preferences from a real estate conversation turn. Only extract what is explicitly stated or clearly implied. Return null for unknown fields.`,
        },
        {
          role: "user",
          content: `User said: "${userMessage}"\nAssistant responded: "${assistantResponse.slice(0, 500)}"`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "update_profile",
            description: "Update the buyer profile with any preferences found in the conversation",
            parameters: {
              type: "object",
              properties: {
                preferredLocations: { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }], description: "Cities/regions mentioned as desired e.g. ['Austin, TX']" },
                budgetMin:          { anyOf: [{ type: "number" }, { type: "null" }], description: "Minimum budget in dollars" },
                budgetMax:          { anyOf: [{ type: "number" }, { type: "null" }], description: "Maximum budget in dollars" },
                bedroomsMin:        { anyOf: [{ type: "integer" }, { type: "null" }], description: "Minimum bedrooms" },
                bathroomsMin:       { anyOf: [{ type: "number" }, { type: "null" }], description: "Minimum bathrooms" },
                mustHaves:          { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }], description: "Required features e.g. ['pool', 'garage']" },
                dealBreakers:       { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }], description: "Unwanted features" },
                propertyTypes:      { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }], description: "Property types e.g. ['condo', 'single family']" },
              },
              required: [],
            },
          },
        },
      ],
      tool_choice: "required",
    });

    const toolCall = result.choices[0].message.tool_calls?.[0];
    if (!toolCall) return;

    // Groq returns null for unknown fields — type explicitly so TS is happy
    const raw = JSON.parse(toolCall.function.arguments) as {
      preferredLocations?: string[] | null;
      budgetMin?:          number  | null;
      budgetMax?:          number  | null;
      bedroomsMin?:        number  | null;
      bathroomsMin?:       number  | null;
      mustHaves?:          string[] | null;
      dealBreakers?:       string[] | null;
      propertyTypes?:      string[] | null;
    };

    const current = await loadProfile(userId);

    const merged: BuyerProfile = {
      ...current,
      budgetMin:    raw.budgetMin    ?? current.budgetMin,
      budgetMax:    raw.budgetMax    ?? current.budgetMax,
      bedroomsMin:  raw.bedroomsMin  ?? current.bedroomsMin,
      bathroomsMin: raw.bathroomsMin ?? current.bathroomsMin,
      preferredLocations: Array.from(new Set([...current.preferredLocations, ...(raw.preferredLocations ?? [])])),
      mustHaves:     Array.from(new Set([...current.mustHaves,    ...(raw.mustHaves     ?? [])])),
      dealBreakers:  Array.from(new Set([...current.dealBreakers, ...(raw.dealBreakers  ?? [])])),
      propertyTypes: Array.from(new Set([...current.propertyTypes,...(raw.propertyTypes ?? [])])),
      lastUpdated:   new Date().toISOString(),
    };

    await saveProfile(merged);
    console.log(`\x1b[36m[Memory]\x1b[0m profile updated for ${userId}`);
  } catch (err) {
    // Non-critical — never break the main flow
    console.warn("[Memory] profile extraction failed:", err instanceof Error ? err.message : err);
  }
}
