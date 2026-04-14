import { pgTable, text, real, jsonb, timestamp } from "drizzle-orm/pg-core";

export const buyerProfiles = pgTable("buyer_profiles", {
  userId:             text("user_id").primaryKey(),
  preferredLocations: jsonb("preferred_locations").$type<string[]>().notNull().default([]),
  budgetMin:          real("budget_min"),
  budgetMax:          real("budget_max"),
  bedroomsMin:        real("bedrooms_min"),
  bathroomsMin:       real("bathrooms_min"),
  mustHaves:          jsonb("must_haves").$type<string[]>().notNull().default([]),
  dealBreakers:       jsonb("deal_breakers").$type<string[]>().notNull().default([]),
  propertyTypes:      jsonb("property_types").$type<string[]>().notNull().default([]),
  lastUpdated:        timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
});
