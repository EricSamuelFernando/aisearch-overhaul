# AI Assistant — Project Context

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) — intent routing (tool_choice: any, Anthropic SDK)
- Anthropic Claude Sonnet 4.6 — streaming summaries + conversational answers
- Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) — two-pass photo vision scoring
- SambaNova (`Meta-Llama-3.3-70B-Instruct`) — background profile/pending-action extraction (fire-and-forget only)
- RealEstateAPI.com v2 (POST `/v2/MLSSearch`) — MLS listings
- Upstash Redis — conversation history + buyer profile cache + search context + pending actions + photo rank cache
- Neon (Postgres) + Drizzle ORM — permanent buyer profile + search event log
- Supermemory — behavioral/semantic memory (cross-session, vector search, per-user `containerTags`)

## Key Files
| File | Purpose |
|------|---------|
| `src/app/api/ai-assistant/route.ts` | Main API route — routing, MLS, SSE streaming, visual context wiring |
| `src/lib/ai-assistant/claude.ts` | Intent prompt (buildIntentSystemPrompt) + search/conversational system prompts |
| `src/lib/ai-assistant/intelligence.ts` | Pure computation — updateProfileIntelligence, buildIntelligenceBlock, applyRelativeRefinement, buildSearchMemoryContent |
| `src/lib/ai-assistant/memory.ts` | Redis + Postgres profile/history + SambaNova extraction + recordSearchEvent |
| `src/lib/ai-assistant/supermemory.ts` | Supermemory read/write (1500ms timeout) |
| `src/lib/ai-assistant/mls.ts` | MLS API call, normalization, deduplication, post-fetch filters |
| `src/lib/ai-assistant/vision.ts` | Two-pass photo ranking — Haiku on all listings, Sonnet fallback for high-confidence partial matches |
| `src/lib/ai-assistant/photo-cache.ts` | Redis photo rank cache — keyed by `listingId + MD5(visualQuery)[0:8]`, 7-day TTL |
| `src/lib/ai-assistant/schema.ts` | Drizzle schema — `buyer_profiles` + `search_events` tables |
| `src/lib/ai-assistant/db.ts` | Upstash Redis client singleton |
| `src/lib/ai-assistant/db-pg.ts` | Neon/Drizzle Postgres client (lazy proxy) |
| `src/components/ai-assistant/LandingAIChat.tsx` | Frontend SSE parser + tile renderer + chat UI + photo_rank merge |
| `src/components/ai-assistant/ListingTile.tsx` | Individual listing card — photo carousel, best-match badge, expanded details, query highlights |
| `src/types/ai-assistant.ts` | MLSSearchParams, MLSListing, BuyerProfile, SearchContext, PendingAction, VisualContext, PhotoRankResult |

## Architecture Flow
1. **User sends message**
2. **Redis** loads profile + history + searchCtx + pendingAction in parallel (~30ms)
3. **Supermemory** fetch starts in background (non-blocking, 1500ms race timeout)
4. **Multi-city pre-route** — if user says "search my preferred locations" and has 2+ saved locations, fires parallel MLS calls (max 3 cities), merges + deduplicates, skips Haiku routing entirely
5. **Relative refinement pre-computation** — `applyRelativeRefinement()` detects terms like "cheaper", "bigger", "newer" and applies deterministic JS math to last searchCtx params. Adjusted values injected into Haiku context so no LLM arithmetic needed.
6. **Buyer Intelligence block** built from already-loaded Redis profile (zero extra I/O) — injected into Haiku system prompt via `buildIntentSystemPrompt(intelligenceBlock)`
7. **Haiku** routes via three-tool approach (`search_mls`, `reference_listing`, or `answer_user`) — `tool_choice: { type: "any" }` (Anthropic SDK format). Single retry on 429.
8. Supermemory context injected if resolved within Haiku's window
9. **search_mls path:**
   - Haiku params coerced (string → number/boolean) at boundary before MLS call
   - Visual fields (`visual_query`, `room_hint`, `visual_confidence`, `description_keywords`) extracted from Haiku params before passing to MLS
   - **Issue 7 override** (line ~700): if `isPureAffirmation && pendingAction`, rawParams is overridden with `{ ...searchCtx.params, ...pendingAction.params, ...visual }` — pending action city/state always wins
   - Text scoring via `scoreByDescription()` runs instantly against listing descriptions
   - **55+ filter** (post-MLS): if `profile.personalContext.age < 55`, listings whose description contains age-restricted terms are dropped before SSE emit
   - Redis photo rank cache checked (batch lookup, ~10ms)
   - MLS API called → emit `listings` SSE immediately (cached rankings applied inline)
   - `visualSummaryContext` block built from visual query + text score matches → injected into Sonnet summary message
   - Vision ranking starts in parallel for uncached listings (Haiku + optional Sonnet fallback)
   - Sonnet streams visual-aware summary
   - Vision result emitted as `photo_rank` SSE when ready (capped at 8s)
   - Top photo matches (score ≥ 0.5) written to Supermemory with quality context (fire-and-forget)
10. **reference_listing path:** look up listing from ALL history turns (newest-first) by position index → emit `listing_focus` SSE → Sonnet streams focused analysis
11. **answer_user path:** Sonnet streams conversational response using buyer profile + history
12. **After response (fire-and-forget):** `recordSearchEvent` (search_events insert + intelligence update + profile save) + profile extraction + pending action extraction + Supermemory write

## QA Bug Fixes (all shipped)

Seven bugs were identified in QA testing and fixed. All fixes are production-ready.

### Issue 1 — Constraint mutation on location switch
**Symptom:** Changing only the city would drop bedrooms_min, bathrooms_min, has_pool from the search.
**Fix:** Added explicit CARRY-FORWARD RULES block to Haiku intent prompt in `claude.ts`:
- Every search_mls call starts with ALL params from Last search context as base
- Params are only replaced if the user's message explicitly changes them
- bedrooms_min, bathrooms_min, feature flags never dropped unless user explicitly removes them
- "luxury" tier change only adjusts price — never removes structural filters

### Issue 2 — Session context bleeding
**Symptom:** Opening a new browser tab/session would inherit stale search context from a previous session.
**Fix:** `LandingAIChat.tsx` mount logic — new session branch always generates a fresh `convId = uuidv4()`. Per-conversation Redis keys (`chat:history:{userId}:{convId}`, `search_ctx:{userId}:{convId}`) ensure clean slate.

### Issue 3 — Inconsistent routing for city queries
**Symptom:** Some city-only messages routed to `answer_user` and asked clarifying questions instead of searching.
**Fix:** Added explicit rule to `claude.ts` intent prompt: "NEVER call answer_user when the user names a city, state, neighborhood, or zip code — always call search_mls immediately."

### Issue 4 — Rental listings appearing in results
**Symptom:** Short-term rentals and lease listings appeared in purchase search results.
**Fix (mls.ts):**
- Added `custom_status: "Active"` to MLS API payload (required alongside `status: "Active"`)
- Post-fetch filter checks both `property_type` and `mls_type` for "lease"/"rental" strings
- Status filter: any status !== "active" is dropped
- Price sanity: `listing_price < $20k` = monthly rent, not a purchase → dropped

### Issue 5 — Wrong listing tile on identity-based reference
**Symptom:** "Tell me about the New York home" triggered reference_listing and showed the wrong tile.
**Fix (claude.ts + route.ts):**
- Identity references ("the New York home", "the cheap one") → `answer_user` not `reference_listing`
- `reference_listing` only fires on explicit position: #N, first/second/third/last
- Handler scans ALL history turns newest-first (not just most recent search) to find the listing at the given index

### Issue 6 — 55+ age-restricted communities shown to younger buyers
**Symptom:** After user stated their age (e.g. 42), 55+ community listings still appeared.
**Fix (route.ts + memory.ts):**
- Post-MLS filter in route.ts: if `profile.personalContext.age < 55`, filter listings whose `description` contains age-restricted terms (`"55+"`, `"senior community"`, `"age restricted"`, `"active adult community"`, etc.)
- Age key fallback: checks `personalContext.age` → `personalContext.user_age` → scans all keys containing "age"/"old" with numeric value
- `memory.ts` extraction prompt updated to enforce canonical key `"age"` (not `"age_years"` or `"user_age"`)
- `PREFERENCE_TERMS` list in route.ts extended to include `"55+"`, `"senior"`, `"age restrict"`, `"i'm "`, `"years old"` so these statements trigger Supermemory write
- **Known ceiling:** filter only catches listings that explicitly mention 55+ in their MLS description. Community-name-only (e.g. "Sun City") not filterable at this layer.

### Issue 7 — Wrong location used on pending action confirmation
**Symptom:** Assistant proposes "search Austin, TX" → user confirms "yes" → search runs in previous city.
**Fix (route.ts):**
- Code-level override at line ~700: when `isPureAffirmation && pendingAction`, rawParams is replaced with `{ ...searchCtx.params, ...pendingAction.params, ...visual }` — pending action params win unconditionally
- pendingActionBlock prompt text updated: "CRITICAL: The city and state in the pending action OVERRIDE Last search context city/state"
- After search, `saveSearchContext` saves the post-override params — next carry-forward has the correct city

## MLS Data Layer (fully audited)

### Normalization (mls.ts — confirmed from live API response)
All listing data lives under `raw.listing`. Key nested paths:
```
listing.address.unparsedAddress        → full_address
listing.listPriceLow                   → listing_price (fallback: leadTypes.mlsListingPrice)
listing.property.bedroomsTotal         → bedrooms
listing.property.bathroomsTotal        → bathrooms
listing.property.livingArea            → living_area
listing.property.propertySubType[0]    → property_sub_type  (ARRAY — take [0])
listing.property.garageSpaces          → garage_spaces
listing.property.stories               → stories
listing.property.hasBasement           → has_basement
listing.property.associationFee        → hoa_fee
listing.property.neighborhood          → neighborhood (fallback: subdivisionName)
listing.property.isWaterFront          → is_waterfront
listing.property.isWaterView           → is_water_view
listing.property.isMountainView        → is_mountain_view
listing.property.isCityView            → is_city_view
listing.property.isParkView            → is_park_view
listing.media.photosList[].highRes     → photos[] (up to 20, prefer highRes → midRes → lowRes)
listing.publicRemarks                  → description
leadTypes.mlsType[0]                   → mls_type (ARRAY — take [0], used for lease/rental filter)
leadTypes.mlsDaysOnMarket              → days_on_market
leadTypes.mlsStatus                    → status (fallback: listing.standardStatus)
```

### MLS API Payload (always sent)
```json
{
  "active": true,
  "has_photos": true,
  "status": "Active",
  "custom_status": "Active",
  "sold": false,
  "include_photos": true,
  "size": 6
}
```

### Post-Fetch Filter Chain (mls.ts)
1. Drop if `property_type` or `mls_type` contains "lease" or "rental"
2. Drop if land (unless search explicitly requested land)
3. Drop if `status !== "active"` (catches pending/contingent slipping through)
4. Drop if `listing_price > 0 && listing_price < 20000` (monthly rent, not purchase)
5. Deduplicate by `full_address` (API sometimes returns duplicates)

### Conversation Context Block (route.ts)
Between each assistant history turn that had listings, synthetic user/assistant turns are injected:
```
[Listings shown to user in the previous turn]
#1: 123 Main St — $450,000, 3bd/2ba, 1,800 sqft, built 2005, Single Family, single story, 2-car garage, pool, HOA $150/mo, Downtown | "Updated kitchen with quartz counters…"
...
[End of listings]
```
Includes: address, price, beds/baths/sqft, year built, property_sub_type, stories, garage, pool, basement, HOA, neighborhood, views, description (truncated 200 chars).

### formatListingsForPrompt (mls.ts)
Used for Sonnet's summary context. Same fields as context block, plus DOM and listing URL. Omits description (performance).

## Routing Provider Architecture
Haiku is the active router. SambaNova and Fireworks are commented out in `route.ts` for easy switching.

**To switch to SambaNova or Fireworks:**
1. Uncomment `import OpenAI from "openai"` at top of `route.ts`
2. Uncomment the provider client (`sambanova` or `fireworks`)
3. Uncomment the `TOOLS` array (OpenAI format) and routing block
4. Comment out the `ANTHROPIC_TOOLS` array and Haiku routing block

**Tool schema formats:**
- Haiku (active): `Anthropic.Tool[]` — `input_schema: { type, properties }`, `tool_choice: { type: "any" }`
- SambaNova/Fireworks: `OpenAI.ChatCompletionTool[]` — `parameters: { type, properties }`, `tool_choice: "required"`

**SambaNova** (`api.sambanova.ai/v1`, `Meta-Llama-3.3-70B-Instruct`) — still used in `memory.ts` for background profile + pending action extraction (fire-and-forget, non-critical path). 429s on this path are caught and logged, never surface to user.

## Three-Tool Routing (Haiku)
Haiku always calls one of three tools — never returns free text. `tool_choice: { type: "any" }`.

- `search_mls` — any message with a city, price, beds, features, visual/aesthetic description, follow-up refinement, re-fetch, relative refinement ("cheaper", "bigger", "newer"), profile-triggered search ("show me homes matching my profile"), or similarity search ("more like listing 2"). When in doubt → always search_mls.
- `reference_listing` — user asks about ONE listing with explicit position (#N, first/second/third/last). NOT for identity references ("the New York home" → answer_user). NOT for multiple listings.
- `answer_user` — pure greetings, general real estate advice, profile reads. NEVER when user names a city/state/zip/neighborhood.

### Two-Category Param Model (Haiku prompt — replaces flat carry-forward rules)
Params are split into two categories with different carry-forward behavior:

**PREFERENCE PARAMS** — always carry forward unless user explicitly changes them:
`listing_price_min/max`, `bedrooms_min`, `bathrooms_min`, `has_pool`, `has_basement`, `stories`, `lot_size_min`, `listing_association_fee_max`, `days_on_market_max`, `property_sub_type`, `visual_query`, `visual_confidence`, `room_hint`, `description_keywords`, `size`, all `is_*` view booleans.

**GEOGRAPHIC PARAMS** — always derived fresh from the current message:
`city`, `state`, `zip`, `near_poi_type`, `near_poi_query`, `commute_from`, `commute_from_2`, `commute_max_minutes`, `commute_max_minutes_2`, `commute_mode`.
- Any geographic signal in the current message (city name, POI, commute origin, landmark) → derive from that signal, never from Last search context
- No geographic signal → carry forward geographic params from Last search context
- `commute_from` always implies `city`/`state`: "30 min from Apple Park" → `commute_from="Apple Park, Cupertino, CA"`, `city="Cupertino"`, `state="CA"`

**Why this model:** avoids the failure mode where a commute search in a new city carries forward the previous search's city (Roseville) and produces wrong results.

### Clarification Rule (Haiku prompt)
Never guess personal details about the user. If the request requires personal information not stated in the current message and not in the Buyer Intelligence profile, use `answer_user` to ask. Applies to: work address ("where I work", "my office"), school location ("my kids' school"), any personal place ("my gym", "my church"). Does NOT apply to general search params — for those, search with defaults or carry forward.

### Intent Prompt Philosophy
The Haiku routing prompt is intentionally structured. Two-category param model provides a single architectural rule that resolves all carry-forward conflicts. Every routing bug should be fixed by clarifying the model — not by adding per-case patches.

⚠️ **Pending refactor:** The two-category model is currently encoded in the Haiku prompt (non-deterministic). The correct production architecture is to have Haiku extract only a *delta* (what changed) and apply carry-forward logic in a typed `mergeSearchContext(lastCtx, delta)` TypeScript function — testable, deterministic, no LLM involved in business logic. Tracked in todo list.

## Memory Architecture

### Redis (fast cache, structured)
- **BuyerProfile** — stated preferences + behavioral intelligence. TTL: 90 days.
- **History** — last 40 messages with `listings` array attached to assistant turns. TTL: 30 days. Last 8 passed to Haiku, last 20 to Sonnet.
- **SearchContext** — last applied search params + resolvedLocation. TTL: 7 days. Per-conversation key.
- **PendingAction** — proposed search extracted after `answer_user` turns. TTL: 10 min. Per-user key (not per-conversation). Cleared after every search_mls.
- **Photo rank cache** — keyed `photo_rank:v2:{listingId}:{md5(visualQuery)[0:8]}`. TTL: 7 days.

### Postgres / Neon (permanent)
- `buyer_profiles` table — permanent source of truth for BuyerProfile.
- `search_events` table — immutable event log, one row per MLS search.
- `loadProfile`: Redis hit → Postgres fallback → default. Backfills Redis on Postgres hit.
- `saveProfile`: writes to Redis + Postgres simultaneously (upsert).
- Schema managed via `drizzle-kit push` (not migrations).

### BuyerProfile.personalContext
Freeform `Record<string, string>` extracted by Haiku after every turn. Key naming is enforced:
- `age` → always `"age"` (not `"age_years"`, `"user_age"`). Enforced in extraction prompt.
- `current_city`, `has_children`, `workplace`, `life_stage` — canonical snake_case keys.
- Merged additively — existing keys never wiped.
- `age` is read by the 55+ community filter in route.ts.

### Buyer Intelligence (derived from search_events)
Computed by `updateProfileIntelligence()` after every search:
- `topCities` — frequency map of cities actually searched
- `avgBudgetMax / avgBudgetMin / avgBedroomsMin` — running averages
- `featureFrequency` — MLS boolean flags used (pool, waterfront, single story, no HOA, large lot, etc.)
- `visualPreferences` — aesthetic labels from visual searches

Rules in `buildIntelligenceBlock()`:
- Only shows the **single top city** — never secondary cities
- Features/aesthetics used 2+ times (1+ for interview-stated aesthetics)
- `avgBudgetMax` shown as `listing_price_max` default only
- **Never shows `avgBudgetMin`** — too sparse/noisy, caused phantom lower-bound filters

### Supermemory (semantic, behavioral)
- Writes every search interaction (fire-and-forget) via `buildSearchMemoryContent()`
- `answer_user` path writes only when `containsPreferenceSignal(message)` is true
- `PREFERENCE_TERMS` includes: budget, afford, bedroom, bathroom, pool, garage, yard, basement, school district, commute, waterfront, prefer, looking for, don't want, don't show, avoid, no hoa, 55+, senior, age restrict, i'm, years old, etc.
- Top photo matches (score ≥ 0.5) write a second quality entry after vision completes
- Reads race against Haiku (1500ms timeout)
- `containerTag = userId` — fully isolated per user

## Type System

### MLSSearchParams (types/ai-assistant.ts)
Includes all MLS filter fields plus visual pipeline fields (stripped before MLS API call):
```typescript
visual_query?: string;
room_hint?: string;
visual_confidence?: "high" | "medium" | "low";
description_keywords?: string;  // comma-separated
```
These are set by Haiku, read in route.ts, then deleted from rawParams before `searchListings()` is called.

### MLSListing (types/ai-assistant.ts)
Full field set (all confirmed from live API):
`id`, `full_address`, `city`, `state`, `zip`, `listing_price`, `bedrooms`, `bathrooms`, `living_area`, `lot_size`, `year_built`, `has_pool`, `days_on_market`, `photos[]`, `listing_url`, `description`, `property_type`, `property_sub_type`, `mls_type`, `status`, `garage_spaces`, `stories`, `has_basement`, `hoa_fee`, `neighborhood`, `is_waterfront`, `is_water_view`, `is_mountain_view`, `is_city_view`, `is_park_view`, `bestScore`

## Visual Search Pipeline
1. Haiku extracts `visual_query`, `room_hint`, `visual_confidence`, `description_keywords` alongside standard MLS params
2. Visual fields stripped from MLS params before API call
3. Text scoring via `scoreByDescription()` — instant, zero API cost, scores 0–0.75
4. Redis batch cache check for existing photo rankings (~10ms)
5. For uncached listings: `rankListingPhotos()` — Haiku on all listings in parallel (15s timeout), Sonnet fallback for partial Haiku matches (score 0–0.3) on `high` confidence queries only, capped at 3 Sonnet calls
6. `visualSummaryContext` block built and injected into Sonnet summary message
7. Vision runs in parallel with Sonnet summary — `photo_rank` SSE emitted when ready (8s cap)
8. Tiles reorder on frontend by photo match score
9. Rankings cached in Redis with 7-day TTL

## Multi-City Search
Triggers when user explicitly says "search my preferred locations", "all my cities" etc. AND has 2+ preferred locations saved.
- Skips Haiku routing entirely
- Fires parallel MLS calls (max 3 cities), distributing result slots evenly
- Deduplicates by full address across cities
- `clearPendingAction(userId)` called after multi-city search too

## SSE Event Types (legacy reference — see updated list in Google Places section above)

## ListingTile Highlights (client-side)
`showMoreHighlights` in `ListingTile.tsx` auto-expands and highlights fields that match the user's query:
- `built` — highlights year_built when query mentions "built in", "year built", "constructed in"
- `dom` — highlights days_on_market when query mentions "DOM", "days on market"
- `lot` — highlights lot_size when query mentions "lot"
- `pool` — highlights pool status based on whether user wants/doesn't want pool

## Decision Signals (property detail page)
`BuyerDecisionSignals.tsx` — horizontal scroll row of 7 cards on the property preview page:
1. **Monthly Cost** — P&I + tax (1.25% default) + HOA + insurance. Hardcoded 6.8% / 20% down / 30yr. Note shown to user.
2. **Market Position** — `(subjectPpsf - compPpsfAvg) / compPpsfAvg * 100`. ±5% threshold for "Fair Value" vs above/below market. Shows DOM.
3. **Schools Nearby** — top 3 schools with SVG rating rings. "View all ↓" dispatches `preview-nav` custom event.
4. **Neighborhood** — calls `/api/neighborhood-summary` with lat/lng. Shows dining, grocery, parks, transit counts from Google Places. Has dedup guard.
5. **Sold Nearby** — filters comps to ±30% sqft, sorts newest, top 3. Shows avg $/sqft. ⚠️ Fallback to list price if closePrice missing.
6. **Home Condition** — calls `NEXT_PUBLIC_AI_BACKEND_BASE_URI/api/image_categorization`. Shows issues count, high-priority count, standout count. Has sessionStorage cache.
7. **Municode Ordinance** — static link to library.municode.com for the property's city/state. No live data fetch.

`PropertyTakeawaysAI.tsx` — AI narrative above the cards:
- Calls `/api/property-takeaways` → GPT-4o-mini generates 3–5 sentence summary
- Splits into 3 story sections: Home / Neighborhood / Top Schools
- ⚠️ Uses **OpenAI** (`gpt-4o-mini`, `OPENAI_API_KEY`) — inconsistent with rest of app which uses Anthropic
- ⚠️ Cache is **in-memory Map** — resets on every Vercel cold start, effectively no caching. Should be Redis.

## Home Pilot — Profile-Building Interview (Active)
Fully implemented and live. Entry point: orange pill button below the search bar in collapsed state in `LandingAIChat.tsx`.
- Route bypass: `mode === "interview"` in request body skips Haiku, uses `buildInterviewSystemPrompt`.
- **Transition detection (tool-based):** Sonnet is given `INTERVIEW_COMPLETION_TOOL` (`complete_interview`) with `tool_choice: "auto"`. When interview is complete, Sonnet calls the tool alongside its text. Route detects `content_block_start` with `tool_use` type and name `complete_interview` → sets `interviewComplete = true`. Replaces the old brittle string-match (`isTransition`).
- **`interviewCompleted` persisted:** `BuyerProfile.interviewCompleted` boolean stored in Redis + Postgres. Emitted to client as `profile` SSE event on every request so `interviewDone` state survives page refresh without sessionStorage.
- Storage: extracts full personalContext bag (`driving_move`, `household_composition`, `work_style`, `lifestyle`, `timeline`, etc.) + infers bedrooms/mustHaves/propertyTypes from lifestyle signals.
- Always writes to Supermemory on interview turns (no PREFERENCE_TERMS gate).
- `startNewConversation` resets `interviewModeRef.current`, `interviewMode`, and `pendingAutoSendRef.current` to prevent interview state leaking into fresh chats.

## Google Places API Integration (Active)

Three-option integration. Key: `GOOGLE_PLACES_API_KEY` (server-side only). File: `src/lib/ai-assistant/places.ts`.

### Option 1 — Proximity Routing
Haiku tool schema (`search_mls`) has two new optional params:
- `near_poi_type` (enum: hospital/school/grocery/park/transit/restaurant/gym/pharmacy) — generic category
- `near_poi_query` (string) — named place, e.g. "UCSF Medical Center San Francisco"
- Never both simultaneously

In `route.ts`, before the MLS call:
1. `near_poi_type`/`near_poi_query` extracted and deleted from rawParams
2. `resolvePOILocation(poiQuery, city, state)` called → Google Places Text Search → lat/lng
3. `latitude`, `longitude`, `radius=3` injected into rawParams for MLS API

`resolvePOILocation` is Redis-cached 24h at `places:poi:{md5(term+city+state)[:12]}`.

Intent prompt updated in `claude.ts` with `### Proximity` section: generic categories → `near_poi_type`, named places → `near_poi_query`, always include city+state.

### Option 2 — Listing Enrichment (POI badges)
After MLS listings SSE is emitted, `enrichListings(listings)` fires in parallel (fire-and-forget):
```typescript
enrichListings(listings).then(enrichments => send({ type: "poi_enrichment", data: enrichments }));
```
- Batches up to 8 listings
- Per listing: geocodes `full_address` → Nearby Search for 5 types (hospital 5km, school 2km, grocery 1.5km, transit 800m, park 1km)
- Returns `POIBadge[]` (type, label, name, distanceMi)
- All geocodes cached 7d; per-listing enrichment cached 7d at `places:enrich:v1:{listingId}`

Frontend (`LandingAIChat.tsx`) handles `poi_enrichment` SSE: merges enrichment into last message's listings by `listingId`. `ListingTile.tsx` renders POI badges in expanded "Show More" section with emoji icons (🏥🏫🛒🚇🌳) and distances.

### Option 3 — Neighborhood Score
Same Nearby Search results used to compute 0–10 score: 2pts per found type (grocery/transit/park/school/hospital). Rendered as a color-coded pill in `ListingTile.tsx`:
- Green (≥8): `bg-[#ECFDF3] text-[#166534]` — "Area N/10"
- Amber (5–7): `bg-[#FFFBEB] text-[#92400E]`
- Gray (<5): `bg-gray-50 text-gray-500`

### Option 4 — Distance-to-Searched-POI
When the search used a named POI (`near_poi_query`), `enrichListings` is called with `referencePOI: { name, lat, lng }`. Each listing's enrichment gets `distanceToSearchPOI: { name, distanceMi }`. This is embedded directly into the listing context block that flows into all Sonnet paths — Sonnet always has the distance to the searched POI without any per-path injection.

### Option 5 — Commute Search (Distance Matrix)
Haiku `search_mls` tool has 5 new commute params: `commute_from`, `commute_max_minutes`, `commute_mode`, `commute_from_2`, `commute_max_minutes_2`.

Flow in `route.ts`:
1. Commute params extracted and deleted from rawParams before MLS call
2. Commute origins geocoded (cached 7d at `places:geo:v1:{hash}`) — hot-path, ~5ms warm
3. MLS search runs normally → listings SSE emitted
4. Fire-and-forget: `getCommuteTimes()` calls Distance Matrix API for each listing address, cached 24h per destination at `places:commute:v1:{originHash}:{destId}`
5. Two-origin merge: listing passes only if within limit of BOTH origins (AND logic)
6. `commute_data` SSE emitted with `CommuteResult[]`
7. `commuteSummaryContext` injected into Sonnet summary message
8. `commuteFilter` saved in SearchContext

`CommuteResult`: `{ listingId, minutes, distanceMi, mode, withinLimit }`

Frontend: `commute_data` SSE merged into last message's `commuteResults`. `ListingTile` renders commute badge (🚗 X min · X mi) — green if `withinLimit`, red if over.

**Latency:** Only origin geocoding is on the hot path (+5ms warm, +150ms cold). Distance Matrix is fire-and-forget — zero perceived latency. Cost: ~$0.03/1000 commute searches.

### Option 6 — Solar, Air Quality, Pollen (Google APIs)
Fired in parallel inside `enrichListings`:
- **Solar** (`getSolarData`): Google Solar API, cached 30d at `places:solar:v1:{coordHash}`. Yearly kWh, panel count, CO₂ offset. Shown in `ListingTile` Show More — **Single Family only** (`property_sub_type === "Single Family"`).
- **Air Quality** (`getAirQuality`): POST to Google Air Quality API, cached 6h at `places:aqi:v1:{coordHash}`. AQI number + category. Color-coded in tile: green ≤50, yellow ≤100, red >100.
- **Pollen** (`getPollenData`): Google Pollen API, cached 12h at `places:pollen:v1:{coordHash}`. Tree + grass + weed levels.

### Option 7 — Open-Meteo Weather
`getWeatherData(lat, lng)` in `places.ts`. No API key required — Open-Meteo is free.

Two separate fetches:
- **Current conditions**: `api.open-meteo.com/v1/forecast` → temp (°F), WMO condition code → readable string, humidity. Cached 6h at `places:weather:current:v1:{lat2dp}_{lng2dp}`.
- **Climate normals**: `climate-api.open-meteo.com/v1/climate` → 1991–2020 ERA5 monthly data → summer avg high (Jun/Jul/Aug), winter avg low (Dec/Jan/Feb), annual rainfall (in). Cached 30d at `places:weather:climate:v1:{coordKey}`.

Returned as `ListingEnrichment.weather?: { tempF, condition, humidity, summerHighF, winterLowF, annualRainfallIn }`.

Rendered in `ListingTile` Show More section. Injected into Sonnet system prompt enrichment block so Sonnet can answer climate/seasonal questions directly.

### Option 8 — Street View
Static image URL rendered in `ListingTile` Show More section using `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. `onError` handler hides it when the address has no Street View coverage. No server-side fetch or caching needed — browser calls Google CDN directly.

### Enrichment in Conversation History
`loadCachedEnrichments(listingIds, referencePOIName?)` batch-loads enrichments from Redis for all listing IDs in history turns. Called at the start of every request before `conversationMessages` is built. Enrichment data is embedded directly into the listing context block that Sonnet always sees:
```
#1: 6102 Maxie St — $529,000 … | 0.8mi from Galleria Mall | Area 8/10 | nearby: School 0.4mi, Grocery 0.8mi
```
This means Sonnet always has POI distances, area score, and all enrichment data across ALL response paths (search, reference, answer) without any per-path injection.

### Google API Key Restriction
The `GOOGLE_PLACES_API_KEY` must use **"IP addresses"** restriction in Google Cloud Console — NOT "Websites". Server-side Node.js `fetch` does not send a `Referer` header, so a "Websites" restriction will return `REQUEST_DENIED` for every call. For Vercel production: either use no application restriction (rely on API-level restrictions) or add Vercel's egress IPs.

### Cache Key Versions
- Enrichment with refPOI: `places:enrich:v4:{listingId}:{addrHash(poiName)}`
- Enrichment without refPOI: `places:enrich:v3:{listingId}`
Bump version when adding new fields to `ListingEnrichment` to force re-fetch.

### New Types (`src/types/ai-assistant.ts`)
```typescript
POIBadge          { type, label, name, distanceMi }
NeighborhoodScore { score, breakdown: { grocery, transit, park, school, hospital } }
ListingEnrichment {
  listingId,
  pois: POIBadge[],
  neighborhood: NeighborhoodScore,
  distanceToSearchPOI?: { name, distanceMi },
  location?: { lat, lng },
  solar?: { yearlyEnergyKwh, panelCount, carbonOffsetKg },
  airQuality?: { aqi, category },
  pollen?: { tree, grass, weed },
  weather?: { tempF, condition, humidity, summerHighF, winterLowF, annualRainfallIn },
}
CommuteResult     { listingId, minutes, distanceMi, mode, withinLimit }
MLSListing.enrichment?: ListingEnrichment   // added field
SearchContext.nearPOI?: { query, name, lat, lng }
```

MLSSearchParams commute additions: `commute_from?`, `commute_max_minutes?`, `commute_mode?`, `commute_from_2?`, `commute_max_minutes_2?`

## withRetry — Anthropic Overload Handling
All 8 `anthropic.messages.create` calls in `route.ts` are wrapped with `withRetry<T>(fn, label, maxAttempts=2)`. Retries on HTTP 429, 529, and `overloaded_error` type with `2s × attempt` backoff. Logs each retry to console.

## SSE Event Types (updated)
```
{ type: "listings",       data: { listings: MLSListing[], params: MLSSearchParams } }
{ type: "listing_focus",  data: MLSListing, index: number }
{ type: "photo_rank",     data: PhotoRankResult[], lowMatch?: boolean }
{ type: "poi_enrichment", data: ListingEnrichment[] }         // POIs + score + solar + AQI + pollen + weather + distanceToSearchPOI
{ type: "commute_data",   data: CommuteResult[] }              // fire-and-forget after listings SSE
{ type: "profile",        data: { interviewCompleted?: boolean } }
{ type: "debug",          data: { pool, text_matches, vision_targets, best_score, low_match } }
{ type: "token",          text: string }
{ type: "done" }
{ type: "error",          message: string }
```

## Session Restore — Dual-Layer Guard
Mobile browsers (iOS Safari) suspend tabs without clearing sessionStorage, causing stale chat to appear on return.

Fix (`LandingAIChat.tsx`):
- `SESSION_TS_KEY` (sessionStorage) — set on every message
- `LAST_ACTIVITY_KEY` (localStorage) — set on every message, 2h TTL gate
- On mount: session restore only if BOTH `sessionTs` (sessionStorage) AND `activityFresh` (localStorage) are within 2 hours
- `startNewConversation` writes a fresh `convId` and clears `LAST_ACTIVITY_KEY`

## avgBudgetMax Windowed Average
`runningAvg()` in `intelligence.ts` is now capped at `INTELLIGENCE_WINDOW = 10` — the effective weight never exceeds 10 searches. Prevents an early low-budget search from permanently dragging down the average across dozens of sessions.

## Known Issues / Pending

### PropertyTakeawaysAI — Two issues to fix
1. **OpenAI dependency** — `/api/property-takeaways/route.ts` uses `gpt-4o-mini` via `OPENAI_API_KEY`. Should be migrated to Claude (Haiku for speed/cost). Fails with 500 if `OPENAI_API_KEY` is absent.
2. **In-memory cache** — `Map<string, CacheEntry>` at module scope dies on every cold start. Should use Redis with same pattern as rest of app.

### Sold Nearby card — price fallback issue
`NeighborhoodCompsCard` falls back to `listPriceLow || listPrice` if `closePrice` is missing from comps data. A "Sold Nearby" card showing list price (not close price) is misleading. Needs a guard that hides the price or labels it as "Listed at" when closePrice is absent.

### sessionCount is a dead field
Tracked in `BuyerProfile`, Redis, and Postgres but never incremented. `searchCount` works correctly. Either implement it (detect new session vs continuation based on `lastActiveAt` gap) or remove from schema + profile.

### answer_user Supermemory write — now gated
Fixed: `containsPreferenceSignal()` now includes age/55+/senior/preference terms so personal context statements always reach Supermemory.

### 55+ filter ceiling
The age-restricted community filter only works when the MLS public remarks explicitly mention "55+", "senior community", etc. Listings in age-restricted communities that only use the development name (e.g. "Sun City") are not caught. No fix available at the MLS data layer.

### Property Preview Page — Enrichment Integration (planned, not yet built)
Plan: add a `<NeighborhoodIntelligence>` section to the property detail page at `/buy/[propertyId]/prop/preview`.
- New API route `/api/property-enrichment` — accepts `lat`, `lng`, `address`, `listingId`, `subType`, calls existing `places.ts` functions, returns `ListingEnrichment`. Reuses Redis cache — if AI assistant already enriched the listing, preview page gets it instantly.
- New component `<NeighborhoodIntelligence>` — three cards: Area Score + POI badges, Environment (weather + AQI + pollen), Solar (single family only).
- Inserted between "Home Highlights" and "Schools Nearby" sections on the detail page.
- Street View: review existing button in sidebar, replace/enhance with inline static image.

### LandingAIChat.tsx Merge Conflict (resolved)
Conflict at line ~1421 between colleague's `SearchFilterPills` component (upstream) and session's Home Pilot button + old Try Asking UI (stashed). Resolution: kept colleague's `SearchFilterPills` entirely + added Home Pilot button above it. Old Try Asking suggestions list and Be Inspired section (stashed) dropped — superseded by `SearchFilterPills`.

⚠️ `onBeInspiredClick` handler in `SearchFilterPills` uses `new RegExp(...)` — violates no-regex rule in CLAUDE.md. Exception granted for now; fix when touching that component next.

### Infrastructure
- **SambaNova 429 on fire-and-forget extraction** — non-critical, caught and logged.
- **Routing latency** — Haiku routing ~0.5–1s. If Fireworks credits available, test as alternative (provider block already in route.ts, just uncomment).
- **REALESTATE_API_KEY** — renamed from `REAPI_KEY`. Verify this env var is set in Vercel production settings.
- **`GOOGLE_PLACES_API_KEY` in Vercel** — must be added to Vercel env vars for production enrichment to work. Key restriction must be "IP addresses" not "Websites".

### Multi-Conversation Architecture (implemented)
Per-conversation Redis keys are active (`chat:history:{userId}:{convId}`, `search_ctx:{userId}:{convId}`). `convId` is generated in `LandingAIChat.tsx` and persisted in sessionStorage. New sessions always get a fresh convId. Legacy flat keys (`chat:history:{userId}`) remain in Redis but are no longer written to.

## Auth
- AWS Cognito (User Pool `us-east-1_XP9jpI8bY`) with Google identity provider
- Callback URL: `{origin}/auth/callback`
- `/api/auth/graphql` — Next.js proxy route to `demo-api.snaphomz.com/auth/graphql` (avoids CORS)

## Deployment
- GitHub: `https://github.com/EricSamuelFernando/aisearch-overhaul.git`
- Remote: `personal`, branch: `overhaul` → `main`
- Vercel: `aisearch-overhaul.vercel.app`
- Push to deploy: `git push personal overhaul:main`

## Required Env Vars
```
ANTHROPIC_API_KEY
SAMBANOVA_API_KEY                     # Background profile/pending-action extraction in memory.ts only
REALESTATE_API_KEY                    # Renamed from REAPI_KEY — verify in Vercel settings
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SUPERMEMORY_API_KEY
DATABASE_URL                          # Neon Postgres connection string
OPENAI_API_KEY                        # Only for /api/property-takeaways (gpt-4o-mini) — pending migration to Claude
NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL  # Points to /api/auth/graphql (proxy)
NEXT_PUBLIC_AUTH_SERIVCE_URL          # https://demo-api.snaphomz.com
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL  # https://demo-api.snaphomz.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_DOMAIN
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_AI_BACKEND_BASE_URI       # Used by HomeCondition card for image_categorization API
GOOGLE_PLACES_API_KEY                 # Server-side only — POI proximity routing + listing enrichment (places.ts)
```

## Run Locally
```bash
npm run build && npm run start
# Production server at http://localhost:8001
# Dev server: npm run dev → http://localhost:3001
# AI assistant embedded in landing hero + /ai-assistant route
```

## Schema Migrations
Use `npx drizzle-kit push` — diffs against live Neon DB and applies ALTER TABLE statements directly.
Do NOT use `drizzle-kit generate` + `drizzle-kit migrate` (will fail if tables already exist).
