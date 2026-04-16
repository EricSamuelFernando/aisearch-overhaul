import { pgTable, text, real, integer, jsonb, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { MLSSearchParams } from "@/types/ai-assistant";

// ── Buyer Profiles ───────────────────────────────────────────────────────────
// Stores both stated preferences (conversation-extracted) and behavioral
// intelligence (derived from actual search events). Single source of truth
// for per-user buyer state. Redis is the fast cache; this is the permanent store.
export const buyerProfiles = pgTable("buyer_profiles", {
  userId: text("user_id").primaryKey(),

  // Identity — seeded from Cognito on first request, never extracted
  email: text("email"),
  name:  text("name"),

  // Stated preferences — extracted from conversation via Haiku
  preferredLocations: jsonb("preferred_locations").$type<string[]>().notNull().default([]),
  budgetMin:          real("budget_min"),
  budgetMax:          real("budget_max"),
  bedroomsMin:        real("bedrooms_min"),
  bathroomsMin:       real("bathrooms_min"),
  mustHaves:          jsonb("must_haves").$type<string[]>().notNull().default([]),
  dealBreakers:       jsonb("deal_breakers").$type<string[]>().notNull().default([]),
  propertyTypes:      jsonb("property_types").$type<string[]>().notNull().default([]),
  lastUpdated:        timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),

  // Behavioral intelligence — derived from search_events, never from conversation
  // Frequency map: { "Austin,TX": 4, "Dallas,TX": 1 }
  topCities:        jsonb("top_cities").$type<Record<string, number>>().notNull().default({}),
  // Running averages of actual search params used (not stated budget)
  avgBudgetMax:     real("avg_budget_max"),
  avgBudgetMin:     real("avg_budget_min"),
  avgBedroomsMin:   real("avg_bedrooms_min"),
  // Feature flag frequency: { "pool": 5, "waterfront": 2 }
  featureFrequency: jsonb("feature_frequency").$type<Record<string, number>>().notNull().default({}),
  // Lifetime activity counters
  searchCount:      integer("search_count").notNull().default(0),
  sessionCount:     integer("session_count").notNull().default(0),
  lastActiveAt:     timestamp("last_active_at", { withTimezone: true }),
  // Visual/aesthetic preference frequency: { "hardwood floors": 4, "blue kitchen": 2 }
  visualPreferences: jsonb("visual_preferences").$type<Record<string, number>>().notNull().default({}),
  // Personal context — freeform key-value extracted from conversation
  // e.g. { "current_city": "Chicago", "has_children": "yes, ages 4 and 7" }
  personalContext: jsonb("personal_context").$type<Record<string, string>>().notNull().default({}),
});

// ── Search Events ────────────────────────────────────────────────────────────
// Immutable event log — one row per MLS search. Source of truth for computing
// behavioral intelligence. Never mutated after insert.
// Future uses: re-compute intelligence, analytics, A/B testing, alerts.
export const searchEvents = pgTable(
  "search_events",
  {
    id:          uuid("id").defaultRandom().primaryKey(),
    userId:      text("user_id").notNull(),
    params:      jsonb("params").$type<MLSSearchParams>().notNull(),
    resultCount: integer("result_count").notNull().default(0),
    searchedAt:  timestamp("searched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("search_events_user_idx").on(table.userId),
    index("search_events_searched_at_idx").on(table.searchedAt),
  ],
);
