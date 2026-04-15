CREATE TABLE "buyer_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"preferred_locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"budget_min" real,
	"budget_max" real,
	"bedrooms_min" real,
	"bathrooms_min" real,
	"must_haves" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deal_breakers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"property_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"top_cities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"avg_budget_max" real,
	"avg_budget_min" real,
	"avg_bedrooms_min" real,
	"feature_frequency" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"search_count" integer DEFAULT 0 NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "search_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"params" jsonb NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"searched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "search_events_user_idx" ON "search_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_events_searched_at_idx" ON "search_events" USING btree ("searched_at");