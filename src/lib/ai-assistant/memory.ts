import Groq from "groq-sdk";
import { getRedis } from "./db";
import { BuyerProfile, AIAssistantMessage, SearchContext } from "@/types/ai-assistant";

const PROFILE_TTL      = 60 * 60 * 24 * 90; // 90 days
const HISTORY_TTL      = 60 * 60 * 24 * 30; // 30 days
const SEARCH_CTX_TTL   = 60 * 60 * 24 * 7;  // 7 days — last search context
const HISTORY_MAX = 40;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function profileKey(userId: string)      { return `profile:${userId}`; }
function historyKey(userId: string)      { return `history:${userId}`; }
function searchCtxKey(userId: string)    { return `search_ctx:${userId}`; }

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
