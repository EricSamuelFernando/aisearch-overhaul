import Groq from "groq-sdk";
import { getRedis } from "./db";
import { db } from "./db-pg";
import { buyerProfiles, searchEvents } from "./schema";
import { eq } from "drizzle-orm";
import {
  BuyerProfile,
  AIAssistantMessage,
  SearchContext,
  PendingAction,
  MLSSearchParams,
  VisualContext,
} from "@/types/ai-assistant";
import { updateProfileIntelligence } from "./intelligence";

const PROFILE_TTL        = 60 * 60 * 24 * 90; // 90 days
const HISTORY_TTL        = 60 * 60 * 24 * 30; // 30 days
const SEARCH_CTX_TTL     = 60 * 60 * 24 * 7;  // 7 days
const PENDING_ACTION_TTL = 60 * 10;            // 10 minutes

const HISTORY_MAX = 40;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function profileKey(userId: string)       { return `profile:${userId}`; }
function historyKey(userId: string)       { return `history:${userId}`; }
function searchCtxKey(userId: string)     { return `search_ctx:${userId}`; }
function pendingActionKey(userId: string) { return `pending_action:${userId}`; }

const DEFAULT_PROFILE = (userId: string): BuyerProfile => ({
  userId,
  // Stated
  preferredLocations: [],
  budgetMin:          null,
  budgetMax:          null,
  bedroomsMin:        null,
  bathroomsMin:       null,
  mustHaves:          [],
  dealBreakers:       [],
  propertyTypes:      [],
  lastUpdated:        new Date().toISOString(),
  // Behavioral intelligence
  topCities:        {},
  avgBudgetMax:     null,
  avgBudgetMin:     null,
  avgBedroomsMin:   null,
  featureFrequency:   {},
  searchCount:        0,
  sessionCount:       0,
  lastActiveAt:       null,
  visualPreferences:  {},
});

// ── Profile load / save ──────────────────────────────────────────────────────

export async function loadProfile(userId: string): Promise<BuyerProfile> {
  const redis = getRedis();

  // 1. Redis cache — fastest path
  const cached = await redis.get<BuyerProfile>(profileKey(userId));
  if (cached) {
    // Backfill intelligence fields missing from older cached entries
    return {
      ...DEFAULT_PROFILE(userId),
      ...cached,
    };
  }

  // 2. Postgres — permanent storage
  try {
    const rows = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      const profile: BuyerProfile = {
        userId:             row.userId,
        // Stated
        preferredLocations: row.preferredLocations ?? [],
        budgetMin:          row.budgetMin ?? null,
        budgetMax:          row.budgetMax ?? null,
        bedroomsMin:        row.bedroomsMin ?? null,
        bathroomsMin:       row.bathroomsMin ?? null,
        mustHaves:          row.mustHaves ?? [],
        dealBreakers:       row.dealBreakers ?? [],
        propertyTypes:      row.propertyTypes ?? [],
        lastUpdated:        row.lastUpdated.toISOString(),
        // Behavioral intelligence — default to empty for pre-migration rows
        topCities:        (row.topCities as Record<string, number>) ?? {},
        avgBudgetMax:     row.avgBudgetMax ?? null,
        avgBudgetMin:     row.avgBudgetMin ?? null,
        avgBedroomsMin:   row.avgBedroomsMin ?? null,
        featureFrequency:  (row.featureFrequency  as Record<string, number>) ?? {},
        searchCount:       row.searchCount  ?? 0,
        sessionCount:      row.sessionCount ?? 0,
        lastActiveAt:      row.lastActiveAt?.toISOString() ?? null,
        visualPreferences: (row.visualPreferences as Record<string, number>) ?? {},
      };
      await redis.set(profileKey(userId), profile, { ex: PROFILE_TTL });
      return profile;
    }
  } catch (err) {
    console.warn("[Memory] Postgres loadProfile failed, using default:", err instanceof Error ? err.message : err);
  }

  return DEFAULT_PROFILE(userId);
}

export async function saveProfile(profile: BuyerProfile): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.set(profileKey(profile.userId), profile, { ex: PROFILE_TTL }),
    db
      .insert(buyerProfiles)
      .values({
        userId:             profile.userId,
        // Stated
        preferredLocations: profile.preferredLocations,
        budgetMin:          profile.budgetMin ?? undefined,
        budgetMax:          profile.budgetMax ?? undefined,
        bedroomsMin:        profile.bedroomsMin ?? undefined,
        bathroomsMin:       profile.bathroomsMin ?? undefined,
        mustHaves:          profile.mustHaves,
        dealBreakers:       profile.dealBreakers,
        propertyTypes:      profile.propertyTypes,
        lastUpdated:        new Date(profile.lastUpdated),
        // Behavioral intelligence
        topCities:        profile.topCities,
        avgBudgetMax:     profile.avgBudgetMax ?? undefined,
        avgBudgetMin:     profile.avgBudgetMin ?? undefined,
        avgBedroomsMin:   profile.avgBedroomsMin ?? undefined,
        featureFrequency:  profile.featureFrequency,
        searchCount:       profile.searchCount,
        sessionCount:      profile.sessionCount,
        lastActiveAt:      profile.lastActiveAt ? new Date(profile.lastActiveAt) : undefined,
        visualPreferences: profile.visualPreferences,
      })
      .onConflictDoUpdate({
        target: buyerProfiles.userId,
        set: {
          // Stated
          preferredLocations: profile.preferredLocations,
          budgetMin:          profile.budgetMin ?? undefined,
          budgetMax:          profile.budgetMax ?? undefined,
          bedroomsMin:        profile.bedroomsMin ?? undefined,
          bathroomsMin:       profile.bathroomsMin ?? undefined,
          mustHaves:          profile.mustHaves,
          dealBreakers:       profile.dealBreakers,
          propertyTypes:      profile.propertyTypes,
          lastUpdated:        new Date(profile.lastUpdated),
          // Behavioral intelligence
          topCities:         profile.topCities,
          avgBudgetMax:      profile.avgBudgetMax ?? undefined,
          avgBudgetMin:      profile.avgBudgetMin ?? undefined,
          avgBedroomsMin:    profile.avgBedroomsMin ?? undefined,
          featureFrequency:  profile.featureFrequency,
          searchCount:       profile.searchCount,
          sessionCount:      profile.sessionCount,
          lastActiveAt:      profile.lastActiveAt ? new Date(profile.lastActiveAt) : undefined,
          visualPreferences: profile.visualPreferences,
        },
      })
      .catch((err) => {
        console.warn("[Memory] Postgres saveProfile failed:", err instanceof Error ? err.message : err);
      }),
  ]);
}

// ── History ──────────────────────────────────────────────────────────────────

export async function loadHistory(userId: string, limit = 20): Promise<AIAssistantMessage[]> {
  const redis = getRedis();
  const items = await redis.lrange<AIAssistantMessage>(historyKey(userId), -limit, -1);
  return items ?? [];
}

export async function appendMessage(userId: string, message: AIAssistantMessage): Promise<void> {
  const redis = getRedis();
  const key = historyKey(userId);
  await redis.rpush(key, message);
  await redis.ltrim(key, -HISTORY_MAX, -1);
  await redis.expire(key, HISTORY_TTL);
}

// ── Search context ───────────────────────────────────────────────────────────

export async function loadSearchContext(userId: string): Promise<SearchContext | null> {
  const redis = getRedis();
  return redis.get<SearchContext>(searchCtxKey(userId));
}

export async function saveSearchContext(userId: string, ctx: SearchContext): Promise<void> {
  const redis = getRedis();
  await redis.set(searchCtxKey(userId), ctx, { ex: SEARCH_CTX_TTL });
}

// ── Pending action ───────────────────────────────────────────────────────────

export async function loadPendingAction(userId: string): Promise<PendingAction | null> {
  const redis = getRedis();
  return redis.get<PendingAction>(pendingActionKey(userId));
}

export async function clearPendingAction(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(pendingActionKey(userId));
}

// ── Search event recording ───────────────────────────────────────────────────

/**
 * Fire-and-forget after every successful search_mls call.
 * 1. Inserts a raw event into search_events (immutable audit log).
 * 2. Updates buyer_profiles intelligence fields using the already-loaded
 *    profile to avoid an extra Redis round-trip.
 * Never blocks the main response stream.
 */
export async function recordSearchEvent(
  userId: string,
  params: MLSSearchParams,
  resultCount: number,
  currentProfile: BuyerProfile,
  visualContext?: VisualContext,
): Promise<void> {
  try {
    // Insert raw event — atomic, no conflicts possible
    await db
      .insert(searchEvents)
      .values({
        userId,
        params: params as Record<string, unknown>,
        resultCount,
        searchedAt: new Date(),
      })
      .catch((err) => {
        console.warn("[Memory] search_events insert failed:", err instanceof Error ? err.message : err);
      });

    // Compute intelligence delta and save merged profile
    const intelligenceDelta = updateProfileIntelligence(currentProfile, params, resultCount, visualContext);
    const updatedProfile: BuyerProfile = { ...currentProfile, ...intelligenceDelta };
    await saveProfile(updatedProfile);

    console.log(
      `\x1b[36m[Intelligence]\x1b[0m search event recorded for ${userId} — search #${updatedProfile.searchCount}`,
    );
  } catch (err) {
    // Non-critical — never break the main flow
    console.warn("[Intelligence] recordSearchEvent failed:", err instanceof Error ? err.message : err);
  }
}

// ── Profile extraction (Groq, fire-and-forget) ───────────────────────────────

/**
 * Extract structured buyer profile updates from the conversation using Groq.
 * Runs fire-and-forget after the response is streamed.
 * Supports both addition AND removal of preferences for accurate profile correction.
 */
export async function extractAndUpdateProfile(
  userId: string,
  userMessage: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Extract buyer preference updates from a real estate conversation turn.
Only extract what is explicitly stated or clearly implied. Return null for unknown fields.
For removals: detect when a user replaces or negates a preference ("not Austin", "forget the pool", "actually 2 beds is fine", "instead of X").`,
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
            description: "Update the buyer profile with preferences found in this conversation turn",
            parameters: {
              type: "object",
              properties: {
                // Additions
                preferredLocations: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                  description: "Cities/regions to ADD e.g. ['Austin, TX']",
                },
                budgetMin:    { anyOf: [{ type: "number" }, { type: "null" }] },
                budgetMax:    { anyOf: [{ type: "number" }, { type: "null" }] },
                bedroomsMin:  { anyOf: [{ type: "integer" }, { type: "null" }] },
                bathroomsMin: { anyOf: [{ type: "number" }, { type: "null" }] },
                mustHaves: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                  description: "Features to ADD to must-haves",
                },
                dealBreakers: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                  description: "Items to ADD to deal-breakers",
                },
                propertyTypes: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                },
                // Removals — for preference correction
                removeLocations: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                  description: "Locations to REMOVE (user said 'not X', 'forget X', 'instead of X')",
                },
                removeMustHaves: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                  description: "Must-haves to REMOVE",
                },
                removeDealBreakers: {
                  anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                  description: "Deal-breakers to REMOVE",
                },
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

    const raw = JSON.parse(toolCall.function.arguments) as {
      preferredLocations?:  string[] | null;
      budgetMin?:           number   | null;
      budgetMax?:           number   | null;
      bedroomsMin?:         number   | null;
      bathroomsMin?:        number   | null;
      mustHaves?:           string[] | null;
      dealBreakers?:        string[] | null;
      propertyTypes?:       string[] | null;
      removeLocations?:     string[] | null;
      removeMustHaves?:     string[] | null;
      removeDealBreakers?:  string[] | null;
    };

    const current = await loadProfile(userId);

    // Helper: case-insensitive partial match for removals
    const shouldRemove = (item: string, removals: string[]): boolean =>
      removals.some((r) => item.toLowerCase().includes(r.toLowerCase()));

    const merged: BuyerProfile = {
      ...current,
      // Scalars — overwrite if provided (user explicitly changed them)
      budgetMin:    raw.budgetMin    ?? current.budgetMin,
      budgetMax:    raw.budgetMax    ?? current.budgetMax,
      bedroomsMin:  raw.bedroomsMin  ?? current.bedroomsMin,
      bathroomsMin: raw.bathroomsMin ?? current.bathroomsMin,
      // Arrays — filter removals first, then union with additions
      preferredLocations: Array.from(new Set([
        ...current.preferredLocations.filter((l) => !shouldRemove(l, raw.removeLocations ?? [])),
        ...(raw.preferredLocations ?? []),
      ])),
      mustHaves: Array.from(new Set([
        ...current.mustHaves.filter((m) => !shouldRemove(m, raw.removeMustHaves ?? [])),
        ...(raw.mustHaves ?? []),
      ])),
      dealBreakers: Array.from(new Set([
        ...current.dealBreakers.filter((d) => !shouldRemove(d, raw.removeDealBreakers ?? [])),
        ...(raw.dealBreakers ?? []),
      ])),
      propertyTypes: Array.from(new Set([
        ...current.propertyTypes,
        ...(raw.propertyTypes ?? []),
      ])),
      lastUpdated: new Date().toISOString(),
    };

    await saveProfile(merged);
    console.log(`\x1b[36m[Memory]\x1b[0m profile updated for ${userId}`);
  } catch (err) {
    console.warn("[Memory] profile extraction failed:", err instanceof Error ? err.message : err);
  }
}

// ── Pending action extraction (Groq, fire-and-forget) ────────────────────────

/**
 * Detects if Claude proposed a specific search in an answer_user response.
 * Saves params as PendingAction so the next "yes/go ahead" correctly triggers search_mls.
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
          content: `Detect whether an AI real estate assistant proposed a specific MLS search in its response.
If a specific search was proposed (city/neighbourhood, price, beds, features), extract the params.
If no specific search was proposed — just general advice, questions, or vague offers — return proposed=false.`,
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
            description: "Call this to set or clear a pending search proposal.",
            parameters: {
              type: "object",
              properties: {
                proposed:           { type: "boolean" },
                description:        { anyOf: [{ type: "string" }, { type: "null" }] },
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
      proposed:            boolean;
      description?:        string | null;
      city?:               string | null;
      state?:              string | null;
      listing_price_max?:  number | null;
      listing_price_min?:  number | null;
      bedrooms_min?:       number | null;
      bathrooms_min?:      number | null;
      has_pool?:           boolean | null;
      days_on_market_max?: number | null;
      living_area_min?:    number | null;
    };

    if (!raw.proposed) return;

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
      type:        "search_mls",
      params,
      description: raw.description ?? "proposed search",
      proposedAt:  new Date().toISOString(),
    };
    await redis.set(pendingActionKey(userId), action, { ex: PENDING_ACTION_TTL });
    console.log(`\x1b[36m[Memory]\x1b[0m pending action saved for ${userId}: ${action.description}`);
  } catch (err) {
    console.warn("[Memory] pending action extraction failed:", err instanceof Error ? err.message : err);
  }
}
