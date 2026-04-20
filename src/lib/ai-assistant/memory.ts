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
import { anthropic } from "./claude";

const PROFILE_TTL        = 60 * 60 * 24 * 90; // 90 days
const SESSION_GAP_MS     = 2 * 60 * 60 * 1000; // 2 hours — mirrors frontend SESSION_TIMEOUT_MS
const HISTORY_TTL        = 60 * 60 * 24 * 30; // 30 days
const SEARCH_CTX_TTL     = 60 * 60 * 24 * 7;  // 7 days
const PENDING_ACTION_TTL = 60 * 10;            // 10 minutes

const HISTORY_MAX = 40;

function profileKey(userId: string)       { return `profile:${userId}`; }
function historyKey(userId: string)       { return `history:${userId}`; }         // legacy flat key
function searchCtxKey(userId: string)     { return `search_ctx:${userId}`; }      // legacy
function pendingActionKey(userId: string) { return `pending_action:${userId}`; }

// Per-conversation keys (new multi-convo architecture)
function convHistoryKey(userId: string, convId: string) { return `chat:history:${userId}:${convId}`; }
function convIndexKey(userId: string)                   { return `chat:index:${userId}`; }
function convSearchCtxKey(userId: string, convId: string) { return `search_ctx:${userId}:${convId}`; }

export interface ConversationMeta {
  id: string;
  preview: string;
  messageCount: number;
  timestamp: string | null;
}

const DEFAULT_PROFILE = (userId: string): BuyerProfile => ({
  userId,
  // Identity
  email:           null,
  name:            null,
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
  interviewCompleted: false,
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
  personalContext:    {},
});

// ── Session tracking ─────────────────────────────────────────────────────────

/**
 * Mutates profile.sessionCount in place when this request is a new session
 * (lastActiveAt is null or gap > 2h). Returns true if incremented.
 * Caller should fire-and-forget saveProfile when true.
 */
export function bumpSessionIfNew(profile: BuyerProfile): boolean {
  const isNew =
    !profile.lastActiveAt ||
    Date.now() - new Date(profile.lastActiveAt).getTime() > SESSION_GAP_MS;
  if (isNew) profile.sessionCount += 1;
  return isNew;
}

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
        // Identity
        email:              row.email ?? null,
        name:               row.name  ?? null,
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
        interviewCompleted: row.interviewCompleted ?? false,
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
        personalContext:   (row.personalContext   as Record<string, string>)  ?? {},
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
        // Identity
        email:              profile.email ?? undefined,
        name:               profile.name  ?? undefined,
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
        interviewCompleted: profile.interviewCompleted,
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
        personalContext:   profile.personalContext,
      })
      .onConflictDoUpdate({
        target: buyerProfiles.userId,
        set: {
          // Identity
          email:              profile.email ?? undefined,
          name:               profile.name  ?? undefined,
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
          interviewCompleted: profile.interviewCompleted,
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
          personalContext:   profile.personalContext,
        },
      })
      .catch((err) => {
        console.warn("[Memory] Postgres saveProfile failed:", err instanceof Error ? err.message : err);
      }),
  ]);
}

// ── History ──────────────────────────────────────────────────────────────────

export async function loadHistory(userId: string, limit = 20, convId?: string): Promise<AIAssistantMessage[]> {
  const redis = getRedis();
  const key = convId ? convHistoryKey(userId, convId) : historyKey(userId);
  const items = await redis.lrange<AIAssistantMessage>(key, -limit, -1);
  return items ?? [];
}

export async function appendMessage(userId: string, message: AIAssistantMessage, convId?: string): Promise<void> {
  const redis = getRedis();
  const stamped: AIAssistantMessage = { ...message, timestamp: new Date().toISOString() };
  if (convId) {
    const key = convHistoryKey(userId, convId);
    await redis.rpush(key, stamped);
    await redis.ltrim(key, -HISTORY_MAX, -1);
    await redis.expire(key, HISTORY_TTL);
    await redis.zadd(convIndexKey(userId), { score: Date.now(), member: convId });
    await redis.expire(convIndexKey(userId), HISTORY_TTL);
  } else {
    const key = historyKey(userId);
    await redis.rpush(key, stamped);
    await redis.ltrim(key, -HISTORY_MAX, -1);
    await redis.expire(key, HISTORY_TTL);
  }
}

export async function loadConversationIndex(userId: string, limit = 5): Promise<ConversationMeta[]> {
  const redis = getRedis();
  const convIds = await redis.zrange(convIndexKey(userId), 0, limit - 1, { rev: true }) as string[];
  if (!convIds || convIds.length === 0) return [];

  const metas = await Promise.all(
    convIds.map(async (convId) => {
      const key = convHistoryKey(userId, convId);
      const [messages, count] = await Promise.all([
        redis.lrange<AIAssistantMessage>(key, 0, 2),
        redis.llen(key),
      ]);
      const msgs = messages ?? [];
      const firstUser = msgs.find((m) => m.role === "user");
      const preview = firstUser?.content?.slice(0, 80) ?? "Conversation";
      const lastMsg = msgs.at(-1);
      return { id: convId, preview, messageCount: count ?? 0, timestamp: lastMsg?.timestamp ?? null };
    }),
  );

  return metas;
}

// ── Guest session merge ──────────────────────────────────────────────────────

function mergeCounts(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const result = { ...a };
  for (const [k, v] of Object.entries(b)) result[k] = (result[k] ?? 0) + v;
  return result;
}

function mostRecent(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
}

/**
 * Merges a guest (anonymous) profile + most recent conversation into a real
 * authenticated user account. Called once after login when a guestId exists
 * in localStorage. Returns the migrated convId so the UI can restore it,
 * or null if there was nothing worth migrating.
 */
export async function mergeGuestProfile(
  guestId: string,
  realUserId: string,
): Promise<string | null> {
  const redis = getRedis();

  const [guest, real] = await Promise.all([
    loadProfile(guestId),
    loadProfile(realUserId),
  ]);

  const guestHasData =
    guest.searchCount > 0 ||
    Object.keys(guest.personalContext).length > 0 ||
    guest.preferredLocations.length > 0 ||
    guest.mustHaves.length > 0 ||
    guest.interviewCompleted;

  if (!guestHasData) return null;

  const merged: BuyerProfile = {
    // Start from guest — carries interview/search data
    ...guest,
    userId: realUserId,
    // Identity always from real account
    email: real.email ?? guest.email,
    name:  real.name  ?? guest.name,
    // Stated: merge arrays, real scalar wins
    preferredLocations: Array.from(new Set([...guest.preferredLocations, ...real.preferredLocations])),
    budgetMin:    real.budgetMin    ?? guest.budgetMin,
    budgetMax:    real.budgetMax    ?? guest.budgetMax,
    bedroomsMin:  real.bedroomsMin  ?? guest.bedroomsMin,
    bathroomsMin: real.bathroomsMin ?? guest.bathroomsMin,
    mustHaves:    Array.from(new Set([...guest.mustHaves,    ...real.mustHaves])),
    dealBreakers: Array.from(new Set([...guest.dealBreakers, ...real.dealBreakers])),
    propertyTypes: Array.from(new Set([...guest.propertyTypes, ...real.propertyTypes])),
    interviewCompleted: guest.interviewCompleted || real.interviewCompleted,
    // Behavioral intelligence: additive merge
    topCities:        mergeCounts(guest.topCities,        real.topCities),
    featureFrequency: mergeCounts(guest.featureFrequency, real.featureFrequency),
    visualPreferences: mergeCounts(guest.visualPreferences, real.visualPreferences),
    avgBudgetMax:    real.avgBudgetMax    ?? guest.avgBudgetMax,
    avgBudgetMin:    real.avgBudgetMin    ?? guest.avgBudgetMin,
    avgBedroomsMin:  real.avgBedroomsMin  ?? guest.avgBedroomsMin,
    searchCount:  guest.searchCount  + real.searchCount,
    sessionCount: guest.sessionCount + real.sessionCount,
    lastActiveAt: mostRecent(guest.lastActiveAt, real.lastActiveAt),
    personalContext: { ...guest.personalContext, ...real.personalContext },
    lastUpdated: new Date().toISOString(),
  };

  await saveProfile(merged);

  // Migrate the most recent guest conversation to the real userId
  const guestConvIds = await redis.zrange(
    convIndexKey(guestId), 0, 0, { rev: true },
  ) as string[];

  let migratedConvId: string | null = null;

  if (guestConvIds.length > 0) {
    const convId = guestConvIds[0];
    const srcHistory   = convHistoryKey(guestId, convId);
    const srcSearchCtx = convSearchCtxKey(guestId, convId);
    const dstHistory   = convHistoryKey(realUserId, convId);
    const dstSearchCtx = convSearchCtxKey(realUserId, convId);

    const [messages, searchCtx] = await Promise.all([
      redis.lrange(srcHistory, 0, -1),
      redis.get(srcSearchCtx),
    ]);

    if (messages && messages.length > 0) {
      await redis.rpush(dstHistory, ...(messages as string[]));
      await redis.expire(dstHistory, HISTORY_TTL);
      await redis.zadd(convIndexKey(realUserId), { score: Date.now(), member: convId });
      await redis.expire(convIndexKey(realUserId), HISTORY_TTL);
      migratedConvId = convId;
    }

    if (searchCtx) {
      await redis.set(dstSearchCtx, searchCtx, { ex: SEARCH_CTX_TTL });
    }

    // Clean up guest keys — fire-and-forget
    Promise.all([
      redis.del(profileKey(guestId)),
      redis.del(convIndexKey(guestId)),
      redis.del(srcHistory),
      redis.del(srcSearchCtx),
    ]).catch(() => {});
  } else {
    redis.del(profileKey(guestId)).catch(() => {});
  }

  return migratedConvId;
}

// ── Search context ───────────────────────────────────────────────────────────

export async function loadSearchContext(userId: string, convId?: string): Promise<SearchContext | null> {
  const redis = getRedis();
  const key = convId ? convSearchCtxKey(userId, convId) : searchCtxKey(userId);
  return redis.get<SearchContext>(key);
}

export async function saveSearchContext(userId: string, ctx: SearchContext, convId?: string): Promise<void> {
  const redis = getRedis();
  const key = convId ? convSearchCtxKey(userId, convId) : searchCtxKey(userId);
  await redis.set(key, ctx, { ex: SEARCH_CTX_TTL });
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

// ── Profile extraction (Haiku, fire-and-forget) ──────────────────────────────

/**
 * Extract structured buyer profile updates from the conversation using Claude Haiku.
 * Runs fire-and-forget after the response is streamed.
 * Supports both addition AND removal of preferences for accurate profile correction.
 */
export async function extractAndUpdateProfile(
  userId: string,
  userMessage: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const result = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      temperature: 0,
      system: `Extract buyer preference updates from a real estate conversation turn.
Only extract what is explicitly stated or clearly implied. Return null for unknown fields.
For removals: detect when a user replaces or negates a preference ("not Austin", "forget the pool", "actually 2 beds is fine", "instead of X").`,
      messages: [
        {
          role: "user",
          content: `User said: "${userMessage}"\nAssistant responded: "${assistantResponse.slice(0, 500)}"`,
        },
      ],
      tools: [
        {
          name: "update_profile",
          description: "Update the buyer profile with preferences found in this conversation turn",
          input_schema: {
            type: "object" as const,
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
              // Personal context — freeform key-value facts about the person
              // Keys: snake_case. REQUIRED key names for common fields:
              //   age → numeric string e.g. "42" (ALWAYS use "age", never "age_years" or "user_age")
              //   current_city, has_children, workplace, life_stage
              // Values: whatever the user said, verbatim or short summary
              personalContext: {
                anyOf: [{ type: "object", additionalProperties: { type: "string" } }, { type: "null" }],
                description: "Personal facts to ADD/UPDATE e.g. { age: '42', current_city: 'Chicago', has_children: 'yes, ages 4 and 7' }. Use 'age' (not 'user_age' or 'age_years') when the user states their age.",
              },
            },
            required: [],
          },
        },
      ],
      tool_choice: { type: "any" },
    });

    const toolBlock = result.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") return;

    const raw = toolBlock.input as {
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
      personalContext?:     Record<string, string> | null;
    };

    const current = await loadProfile(userId);

    // Coerce any value to a string array — guards against the model returning
    // a string instead of an array, and against corrupted Redis/Postgres data.
    const toArr = (v: unknown): string[] =>
      Array.isArray(v) ? (v as string[]) : typeof v === "string" && v.length > 0 ? [v] : [];

    // Helper: case-insensitive partial match for removals
    const shouldRemove = (item: string, removals: string[]): boolean =>
      removals.some((r) => item.toLowerCase().includes(r.toLowerCase()));

    const curLocations  = toArr(current.preferredLocations);
    const curMustHaves  = toArr(current.mustHaves);
    const curBreakers   = toArr(current.dealBreakers);
    const curTypes      = toArr(current.propertyTypes);
    const removeLocations   = toArr(raw.removeLocations);
    const removeMustHaves   = toArr(raw.removeMustHaves);
    const removeDealBreakers = toArr(raw.removeDealBreakers);

    const merged: BuyerProfile = {
      ...current,
      // Scalars — overwrite if provided (user explicitly changed them)
      budgetMin:    raw.budgetMin    ?? current.budgetMin,
      budgetMax:    raw.budgetMax    ?? current.budgetMax,
      bedroomsMin:  raw.bedroomsMin  ?? current.bedroomsMin,
      bathroomsMin: raw.bathroomsMin ?? current.bathroomsMin,
      // Arrays — filter removals first, then union with additions
      preferredLocations: Array.from(new Set([
        ...curLocations.filter((l) => !shouldRemove(l, removeLocations)),
        ...toArr(raw.preferredLocations),
      ])),
      mustHaves: Array.from(new Set([
        ...curMustHaves.filter((m) => !shouldRemove(m, removeMustHaves)),
        ...toArr(raw.mustHaves),
      ])),
      dealBreakers: Array.from(new Set([
        ...curBreakers.filter((d) => !shouldRemove(d, removeDealBreakers)),
        ...toArr(raw.dealBreakers),
      ])),
      propertyTypes: Array.from(new Set([
        ...curTypes,
        ...toArr(raw.propertyTypes),
      ])),
      // Personal context — merge additively, never wipe existing keys
      personalContext: {
        ...current.personalContext,
        ...(raw.personalContext ?? {}),
      },
      lastUpdated: new Date().toISOString(),
    };

    // Guard against extraction returning inverted budget (min > max)
    if (merged.budgetMin !== null && merged.budgetMax !== null && merged.budgetMin > merged.budgetMax) {
      [merged.budgetMin, merged.budgetMax] = [merged.budgetMax, merged.budgetMin];
    }

    await saveProfile(merged);
    console.log(`\x1b[36m[Memory]\x1b[0m profile updated for ${userId}`);
  } catch (err) {
    console.warn("[Memory] profile extraction failed:", err instanceof Error ? err.message : err);
  }
}

// ── Property type normalization ──────────────────────────────────────────────

const PROPERTY_TYPE_CANONICAL: [string[], string][] = [
  [["single family", "single-family", "sfr", "singlefamily"], "Single Family"],
  [["multi-family", "multifamily", "multi family", "mfr", "investment property", "income property"], "Multi-Family"],
  [["condo", "condominium"], "Condo"],
  [["townhouse", "townhome", "town house", "town home"], "Townhouse"],
  [["duplex"], "Duplex"],
  [["triplex"], "Triplex"],
  [["fourplex", "quadplex", "4plex", "four-plex", "quad-plex"], "Fourplex"],
  [["manufactured home", "mobile home", "manufactured", "mobile"], "Manufactured Home"],
  [["cabin"], "Cabin"],
  [["apartment"], "Apartment"],
  [["land", "vacant lot", "lot only"], "Land"],
];

function normalizePropertyType(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [patterns, canonical] of PROPERTY_TYPE_CANONICAL) {
    if (patterns.some((p) => lower === p || lower.includes(p))) return canonical;
  }
  return raw.trim();
}

// ── Interview profile extraction (Haiku, fire-and-forget) ───────────────────
//
// Richer than extractAndUpdateProfile — used exclusively on Home Pilot turns.
// Extracts visual preference labels (for visualPreferences map), infers specs
// from lifestyle/household, and accumulates every personal fact into personalContext.

export async function extractAndUpdateProfileFromInterview(
  userId: string,
  userMessage: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const result = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      temperature: 0,
      system: `Extract rich buyer profile data from a Home Pilot interview turn.
Be aggressive — infer specs from lifestyle and household context.
Derive bedrooms from household size (couple+2kids→3, couple→2, single→1).
Derive must-haves from daily life (works from home→home office, entertains→open kitchen, has kids→yard+school district, cooks→chef kitchen).
Extract visual labels as short concrete phrases for photo search matching.`,
      messages: [
        {
          role: "user",
          content: `User said: "${userMessage}"\nAssistant responded: "${assistantResponse.slice(0, 600)}"`,
        },
      ],
      tools: [
        {
          name: "update_profile_from_interview",
          description: "Store all buyer intelligence extracted from this interview turn",
          input_schema: {
            type: "object" as const,
            properties: {
              preferredLocations: {
                anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                description: "Cities/regions mentioned e.g. ['Austin, TX']",
              },
              budgetMin:    { anyOf: [{ type: "number" }, { type: "null" }] },
              budgetMax:    { anyOf: [{ type: "number" }, { type: "null" }] },
              bedroomsMin:  {
                anyOf: [{ type: "integer" }, { type: "null" }],
                description: "Infer from household — couple+2kids→3, couple→2, single→1",
              },
              bathroomsMin: { anyOf: [{ type: "number" }, { type: "null" }] },
              propertyTypes: {
                anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                description: "Use EXACT MLS values only: 'Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Duplex', 'Triplex', 'Fourplex', 'Manufactured Home', 'Cabin', 'Apartment', 'Land'. Infer: family with kids→Single Family, young couple→Condo or Single Family, investor→Multi-Family",
              },
              mustHaves: {
                anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                description: "Features inferred from lifestyle: 'home office', 'large yard', 'open kitchen', 'school district', 'chef kitchen', 'guest room'",
              },
              dealBreakers: {
                anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
              },
              // Personal context — every life fact worth remembering
              personalContext: {
                anyOf: [{ type: "object", additionalProperties: { type: "string" } }, { type: "null" }],
                description: "Life facts keyed in snake_case: driving_move, household_composition, work_style, lifestyle, timeline, current_city, life_stage, has_children, commute_info, entertaining_style",
              },
              // Visual labels — short phrases that describe aesthetic preferences.
              // These increment the visualPreferences frequency map and power future visual searches.
              visualPreferenceLabels: {
                anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
                description: "Short aesthetic labels (max 4 words each) from vibe/style descriptions. e.g. ['warm natural wood', 'open floor plan', 'modern farmhouse exterior', 'bright white kitchen', 'cozy living room']",
              },
            },
            required: [],
          },
        },
      ],
      tool_choice: { type: "any" },
    });

    const toolBlock = result.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") return;

    const raw = toolBlock.input as {
      preferredLocations?:      string[] | null;
      budgetMin?:               number   | null;
      budgetMax?:               number   | null;
      bedroomsMin?:             number   | null;
      bathroomsMin?:            number   | null;
      propertyTypes?:           string[] | null;
      mustHaves?:               string[] | null;
      dealBreakers?:            string[] | null;
      personalContext?:         Record<string, string> | null;
      visualPreferenceLabels?:  string[] | null;
    };

    const current = await loadProfile(userId);

    const toArr = (v: unknown): string[] =>
      Array.isArray(v) ? (v as string[]) : typeof v === "string" && v.length > 0 ? [v] : [];

    // Increment visualPreferences for each stated aesthetic label
    const visualPreferences = { ...current.visualPreferences };
    for (const label of toArr(raw.visualPreferenceLabels)) {
      const key = label.trim().toLowerCase();
      if (key) visualPreferences[key] = (visualPreferences[key] ?? 0) + 1;
    }

    const merged: BuyerProfile = {
      ...current,
      budgetMin:    raw.budgetMin    ?? current.budgetMin,
      budgetMax:    raw.budgetMax    ?? current.budgetMax,
      bedroomsMin:  raw.bedroomsMin  ?? current.bedroomsMin,
      bathroomsMin: raw.bathroomsMin ?? current.bathroomsMin,
      preferredLocations: Array.from(new Set([
        ...toArr(current.preferredLocations),
        ...toArr(raw.preferredLocations),
      ])),
      mustHaves: Array.from(new Set([
        ...toArr(current.mustHaves),
        ...toArr(raw.mustHaves),
      ])),
      dealBreakers: Array.from(new Set([
        ...toArr(current.dealBreakers),
        ...toArr(raw.dealBreakers),
      ])),
      propertyTypes: Array.from(new Set([
        ...toArr(current.propertyTypes),
        ...toArr(raw.propertyTypes).map(normalizePropertyType),
      ])),
      personalContext: {
        ...current.personalContext,
        ...(raw.personalContext ?? {}),
      },
      visualPreferences,
      lastUpdated: new Date().toISOString(),
    };

    if (merged.budgetMin !== null && merged.budgetMax !== null && merged.budgetMin > merged.budgetMax) {
      [merged.budgetMin, merged.budgetMax] = [merged.budgetMax, merged.budgetMin];
    }

    await saveProfile(merged);
    console.log(`\x1b[36m[Memory]\x1b[0m interview profile updated for ${userId}`);
  } catch (err) {
    console.warn("[Memory] interview extraction failed:", err instanceof Error ? err.message : err);
  }
}

export async function markInterviewCompleted(userId: string): Promise<void> {
  const profile = await loadProfile(userId);
  if (profile.interviewCompleted) return;
  await saveProfile({ ...profile, interviewCompleted: true });
}

// ── Pending action extraction (Haiku, fire-and-forget) ───────────────────────

/**
 * Detects if Claude proposed a specific search in an answer_user response.
 * Saves params as PendingAction so the next "yes/go ahead" correctly triggers search_mls.
 */
export async function extractAndSavePendingAction(
  userId: string,
  assistantResponse: string,
): Promise<void> {
  try {
    const result = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      temperature: 0,
      system: `Detect whether an AI real estate assistant proposed a specific MLS search in its response.
If a specific search was proposed (city/neighbourhood, price, beds, features), extract the params.
If no specific search was proposed — just general advice, questions, or vague offers — return proposed=false.`,
      messages: [
        {
          role: "user",
          content: `Assistant response: "${assistantResponse.slice(0, 800)}"`,
        },
      ],
      tools: [
        {
          name: "set_pending_search",
          description: "Call this to set or clear a pending search proposal.",
          input_schema: {
            type: "object" as const,
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
      ],
      tool_choice: { type: "any" },
    });

    const toolBlock = result.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") return;

    const raw = toolBlock.input as {
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
