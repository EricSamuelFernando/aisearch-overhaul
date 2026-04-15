# AI Assistant — Project Context

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Groq (`llama-3.3-70b-versatile`) — intent routing + background profile/pending-action extraction
- Anthropic Claude Sonnet 4.6 — streaming summaries + conversational answers
- Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) — two-pass photo vision scoring
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
| `src/lib/ai-assistant/memory.ts` | Redis + Postgres profile/history + Groq extraction + recordSearchEvent |
| `src/lib/ai-assistant/supermemory.ts` | Supermemory read/write (1500ms timeout) |
| `src/lib/ai-assistant/mls.ts` | MLS API call, normalization, deduplication |
| `src/lib/ai-assistant/vision.ts` | Two-pass photo ranking — Haiku on all listings, Sonnet fallback for high-confidence partial matches |
| `src/lib/ai-assistant/photo-cache.ts` | Redis photo rank cache — keyed by `listingId + MD5(visualQuery)[0:8]`, 7-day TTL |
| `src/lib/ai-assistant/schema.ts` | Drizzle schema — `buyer_profiles` + `search_events` tables |
| `src/lib/ai-assistant/db.ts` | Upstash Redis client singleton |
| `src/lib/ai-assistant/db-pg.ts` | Neon/Drizzle Postgres client (lazy proxy) |
| `src/components/ai-assistant/LandingAIChat.tsx` | Frontend SSE parser + tile renderer + chat UI + photo_rank merge |
| `src/types/ai-assistant.ts` | MLSSearchParams, MLSListing, BuyerProfile, SearchContext, PendingAction, VisualContext, PhotoRankResult |

## Architecture Flow
1. **User sends message**
2. **Redis** loads profile + history + searchCtx + pendingAction in parallel (~30ms)
3. **Supermemory** fetch starts in background (non-blocking, 1500ms race timeout)
4. **Relative refinement pre-computation** — `applyRelativeRefinement()` detects terms like "cheaper", "bigger", "newer" and applies deterministic JS math to last searchCtx params. Adjusted values injected into Groq context so no LLM arithmetic needed.
5. **Buyer Intelligence block** built from already-loaded Redis profile (zero extra I/O) — injected into Groq system prompt via `buildIntentSystemPrompt(intelligenceBlock)`
6. **Groq** routes via three-tool approach (`search_mls`, `reference_listing`, or `answer_user`) — `tool_choice: "required"`
7. Supermemory context injected if resolved within Groq's window
8. **search_mls path:**
   - Groq params coerced (string → number/boolean) at boundary before MLS call
   - Visual fields (`visual_query`, `room_hint`, `visual_confidence`, `description_keywords`) extracted from Groq params before passing to MLS
   - Text scoring via `scoreByDescription()` runs instantly against listing descriptions
   - Redis photo rank cache checked (batch lookup, ~10ms)
   - MLS API called → emit `listings` SSE immediately (cached rankings applied inline)
   - Vision ranking starts in parallel for uncached listings (Haiku + optional Sonnet fallback)
   - Sonnet streams summary
   - Vision result emitted as `photo_rank` SSE when ready (capped at 8s)
9. **reference_listing path:** look up listing from history by index → emit `listing_focus` SSE → Sonnet streams focused analysis
10. **answer_user path:** Sonnet streams conversational response using buyer profile + history
11. **After response (fire-and-forget):** `recordSearchEvent` (search_events insert + intelligence update + profile save) + profile extraction + pending action extraction via Groq + Supermemory write

## Three-Tool Routing (Groq)
Groq always calls one of three tools — never returns free text. `tool_choice: "required"`.

- `search_mls` — any message with a city, price, beds, features, visual/aesthetic description, follow-up refinement, re-fetch, relative refinement ("cheaper", "bigger", "newer"), profile-triggered search ("show me homes matching my profile"), or similarity search ("more like listing 2")
- `reference_listing` — user asks about the specific facts/details of one already-shown listing by position ("tell me about the 2nd house", "what year was #3 built"). NOT for similarity searches.
- `answer_user` — pure greetings, general real estate advice, profile reads ("what's my budget?"), standalone affirmations with no pending action

### Intent Classification Rules (key ones)
- **Relative refinements:** pre-adjusted values already in Last search context — Groq uses exact values, no arithmetic
- **Similar-to-listing:** "show me more like listing 2" → `search_mls` (NOT `reference_listing`)
- **Profile-triggered search:** "show me homes matching my profile" → `search_mls` using Primary market + budget from Buyer Intelligence block
- **Casual affirmations:** "sounds good", "ok", "makes sense" → `answer_user` unless a Pending proposed action block is present
- **Region/state-only:** "homes in Texas" with no city → ask for city unless Buyer Intelligence has a Primary market in that state
- **Visual/aesthetic:** any aesthetic description → `search_mls` with `visual_query` set, always

## Memory Architecture

### Redis (fast cache, structured)
- **BuyerProfile** — stated preferences (budgetMin/Max, bedroomsMin, bathroomsMin, preferredLocations, mustHaves, dealBreakers, propertyTypes) + behavioral intelligence (topCities, avgBudgetMax, avgBudgetMin, avgBedroomsMin, featureFrequency, visualPreferences, searchCount, sessionCount, lastActiveAt). TTL: 90 days.
- **History** — last 40 messages with `listings` array attached to assistant turns. TTL: 30 days. Last 8 passed to Groq, last 20 to Sonnet.
- **SearchContext** — last applied search params + resolvedLocation. TTL: 7 days. Injected into Groq for implicit carry-over + relative refinement base.
- **PendingAction** — proposed search extracted after `answer_user` turns. TTL: 10 min. Injected into Groq so "yes/do that/go ahead" correctly triggers search_mls.
- **Photo rank cache** — keyed `photo_rank:v2:{listingId}:{md5(visualQuery)[0:8]}`. TTL: 7 days.

### Postgres / Neon (permanent)
- `buyer_profiles` table — permanent source of truth for BuyerProfile including all behavioral intelligence columns.
- `search_events` table — immutable event log, one row per MLS search. Source of truth for re-computing intelligence. Indexed on `user_id` + `searched_at`.
- `loadProfile`: Redis hit → Postgres fallback → default. Backfills Redis on Postgres hit. Backward-compatible defaults for pre-migration rows.
- `saveProfile`: writes to Redis + Postgres simultaneously (upsert).
- Schema managed via `drizzle-kit push` (not migrations).

### Buyer Intelligence (derived from search_events, never from conversation)
Computed by `updateProfileIntelligence()` in `intelligence.ts` after every search:
- `topCities` — frequency map of cities actually searched: `{ "Austin,TX": 4 }`
- `avgBudgetMax / avgBudgetMin / avgBedroomsMin` — running averages of actual search params used
- `featureFrequency` — MLS boolean flags used: `{ "pool": 3, "waterfront": 1 }`
- `visualPreferences` — aesthetic labels from visual searches: `{ "hardwood floors": 4, "blue kitchen": 2 }`
- `searchCount` — lifetime search counter

`buildIntelligenceBlock()` converts this into a Groq-injected prompt section. Only shows features/aesthetics used 2+ times (noise filter). Tells Groq to use behavioral averages as search defaults.

### Supermemory (semantic, behavioral)
- Writes every interaction (fire-and-forget) via `buildSearchMemoryContent()` — clean behavioral signals only, no raw listing data.
- Visual searches write: `Visual preference: "hardwood floors" (any).`
- Reads race against Groq (1500ms timeout). Returns empty string on timeout — graceful degradation.
- `containerTag = userId` — fully isolated per user.

## Visual Search Pipeline
1. Groq extracts `visual_query`, `room_hint`, `visual_confidence`, `description_keywords` alongside standard MLS params
2. Visual fields stripped from MLS params before API call (they are not MLS filter fields)
3. Text scoring via `scoreByDescription()` — instant, zero API cost, scores 0–0.75
4. Redis batch cache check for existing photo rankings (~10ms)
5. For uncached listings: `rankListingPhotos()` — Haiku on all listings in parallel (15s timeout), Sonnet fallback for partial Haiku matches (score 0–0.3) on `high` confidence queries only, capped at 3 Sonnet calls
6. Vision runs in parallel with Sonnet summary — `photo_rank` SSE emitted when ready
7. Rankings cached in Redis with 7-day TTL
8. Visual context passed to `recordSearchEvent` → `visualPreferences` frequency updated in profile
9. Visual context passed to `buildSearchMemoryContent` → Supermemory gets aesthetic label signal

## SSE Event Types
```
{ type: "listings",      data: MLSListing[] }          — emitted immediately after MLS returns
{ type: "listing_focus", data: MLSListing, index }      — single tile for reference_listing path
{ type: "photo_rank",    data: PhotoRankResult[] }      — vision scores, merged into tiles by frontend
{ type: "token",         text: string }                 — streaming summary tokens
{ type: "done" }                                        — stream complete
{ type: "error",         message: string }              — error
```

## MLS Base Payload
```json
{ "active": true, "has_photos": true, "status": "Active", "sold": false, "include_photos": true, "size": 6 }
```
Post-fetch filters: lease/rental stripped, duplicates deduplicated by address.
Visual queries fetch `size: 12` to give vision a larger pool to score.

## Groq Param Coercion
Groq occasionally returns typed params as strings. `route.ts` coerces at the boundary before any downstream use:
- Numeric fields (listing_price_min/max, bedrooms_min/max, living_area_min/max, year_built_min/max, etc.) — string → Number, NaN → undefined
- Boolean fields (has_pool, has_basement, is_water_front, is_water_view, is_mountain_view) — "true"/"false" → boolean, other → undefined

## User Identity
- **Logged-in users:** `userId` = backend `id` from `localStorage.userDetails` (set after Cognito Google login)
- **Anonymous users:** persistent random UUID from `localStorage.snapz_ai_user_id`
- `getUserId()` in `LandingAIChat.tsx` handles both cases

## Known Issues / Planned
- **No history on chat open** — frontend starts blank every session. Fix: GET `/api/ai-assistant/history` endpoint + mount fetch in `LandingAIChat.tsx`
- **Groq rate limit** — free tier is 100K TPD. Upgrade to Dev tier ($9/mo) for 1M TPD
- **Sonnet summary latency** — 8–11s total. Could swap to Groq llama for summaries if latency becomes priority

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
GROQ_API_KEY
REAPI_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SUPERMEMORY_API_KEY
DATABASE_URL                          # Neon Postgres connection string
NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL  # Points to /api/auth/graphql (proxy)
NEXT_PUBLIC_AUTH_SERIVCE_URL          # https://demo-api.snaphomz.com
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL  # https://demo-api.snaphomz.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_DOMAIN
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
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
