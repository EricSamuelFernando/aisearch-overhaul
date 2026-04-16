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
4. **Multi-city pre-route** — if user says "search my preferred locations" and has 2+ saved locations, fires parallel MLS calls (max 3 cities), merges + deduplicates, skips Haiku routing entirely
5. **Relative refinement pre-computation** — `applyRelativeRefinement()` detects terms like "cheaper", "bigger", "newer" and applies deterministic JS math to last searchCtx params. Adjusted values injected into Haiku context so no LLM arithmetic needed.
6. **Buyer Intelligence block** built from already-loaded Redis profile (zero extra I/O) — injected into Haiku system prompt via `buildIntentSystemPrompt(intelligenceBlock)`
7. **Haiku** routes via three-tool approach (`search_mls`, `reference_listing`, or `answer_user`) — `tool_choice: { type: "any" }` (Anthropic SDK format). Single retry on 429.
8. Supermemory context injected if resolved within Haiku's window
9. **search_mls path:**
   - Haiku params coerced (string → number/boolean) at boundary before MLS call
   - Visual fields (`visual_query`, `room_hint`, `visual_confidence`, `description_keywords`) extracted from Haiku params before passing to MLS
   - Text scoring via `scoreByDescription()` runs instantly against listing descriptions
   - Redis photo rank cache checked (batch lookup, ~10ms)
   - MLS API called → emit `listings` SSE immediately (cached rankings applied inline)
   - `visualSummaryContext` block built from visual query + text score matches → injected into Sonnet summary message
   - Vision ranking starts in parallel for uncached listings (Haiku + optional Sonnet fallback)
   - Sonnet streams visual-aware summary
   - Vision result emitted as `photo_rank` SSE when ready (capped at 8s)
   - Top photo matches (score ≥ 0.5) written to Supermemory with quality context (fire-and-forget)
10. **reference_listing path:** look up listing from history by index → emit `listing_focus` SSE → Sonnet streams focused analysis
11. **answer_user path:** Sonnet streams conversational response using buyer profile + history
12. **After response (fire-and-forget):** `recordSearchEvent` (search_events insert + intelligence update + profile save) + profile extraction + pending action extraction via SambaNova + Supermemory write

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

- `search_mls` — any message with a city, price, beds, features, visual/aesthetic description, follow-up refinement, re-fetch, relative refinement ("cheaper", "bigger", "newer"), profile-triggered search ("show me homes matching my profile"), or similarity search ("more like listing 2")
- `reference_listing` — user asks about the specific facts/details of one already-shown listing by position ("tell me about the 2nd house", "what year was #3 built"). NOT for similarity searches.
- `answer_user` — pure greetings, general real estate advice, profile reads ("what's my budget?"), standalone affirmations with no pending action

### Intent Classification Rules (key ones)
- **Relative refinements:** pre-adjusted values already in Last search context — Haiku uses exact values, no arithmetic
- **Similar-to-listing:** "show me more like listing 2" → `search_mls` (NOT `reference_listing`)
- **Profile-triggered search:** "show me homes matching my profile" → `search_mls` using Primary market + budget from Buyer Intelligence block
- **Continuity messages:** "keep searching", "more", "continue", "next" with Last search context → `search_mls` with same params
- **Region/state-only:** "homes in Texas" with no city → use Primary market from Buyer Intelligence if it matches that state, otherwise `answer_user` to ask which city
- **Visual/aesthetic:** any aesthetic description → `search_mls` with `visual_query` set, always
- **Tiebreaker:** when in doubt between `search_mls` and `answer_user` — always `search_mls`

### Intent Prompt Philosophy
The Haiku routing prompt is intentionally short (~65 lines). Long prompts with many examples make routing *worse* — attention dilutes and the model pattern-matches examples instead of reasoning. The prompt defines categories, not examples. Every routing bug should be fixed by simplifying the prompt or handling in code — never by adding more examples.

## Memory Architecture

### Redis (fast cache, structured)
- **BuyerProfile** — stated preferences (budgetMin/Max, bedroomsMin, bathroomsMin, preferredLocations, mustHaves, dealBreakers, propertyTypes) + behavioral intelligence (topCities, avgBudgetMax, avgBudgetMin, avgBedroomsMin, featureFrequency, visualPreferences, searchCount, sessionCount, lastActiveAt). TTL: 90 days.
- **History** — last 40 messages with `listings` array attached to assistant turns. TTL: 30 days. Last 8 passed to Haiku, last 20 to Sonnet.
- **SearchContext** — last applied search params + resolvedLocation. TTL: 7 days. Injected into Haiku for implicit carry-over + relative refinement base.
- **PendingAction** — proposed search extracted after `answer_user` turns. TTL: 10 min. Injected into Haiku so "yes/do that/go ahead" correctly triggers search_mls.
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

`buildIntelligenceBlock()` converts this into a Haiku-injected prompt section. Rules:
- Only shows the **single top city** — never secondary cities (multiple cities caused SambaNova to merge them into garbage strings like "Folsom / San Francisco, CA")
- Only shows features/aesthetics used 2+ times (noise filter)
- Shows `avgBudgetMax` as `listing_price_max` default only
- **Never shows `avgBudgetMin`** — behavioral average of price floors is sparse/noisy and caused phantom `listing_price_min` filters eliminating most results
- Explicit rule: never set `listing_price_min` from behavioral data — only from explicit user statements

### Supermemory (semantic, behavioral)
- Writes every interaction (fire-and-forget) via `buildSearchMemoryContent()` — clean behavioral signals only, no raw listing data.
- Visual searches write the aesthetic label: `Visual preference: "hardwood floors" (any).`
- **Visual match quality write** — after vision scoring completes, top photo matches (score ≥ 0.5) write a second Supermemory entry with specific listing address + score. Future sessions get qualitative context ("322 Ocean Court scored 0.85 for chef's kitchen") not just a counter.
- Reads race against Haiku (1500ms timeout). Returns empty string on timeout — graceful degradation.
- `containerTag = userId` — fully isolated per user.

## Visual Search Pipeline
1. Haiku extracts `visual_query`, `room_hint`, `visual_confidence`, `description_keywords` alongside standard MLS params
2. Visual fields stripped from MLS params before API call (they are not MLS filter fields)
3. Text scoring via `scoreByDescription()` — instant, zero API cost, scores 0–0.75
4. Redis batch cache check for existing photo rankings (~10ms)
5. For uncached listings: `rankListingPhotos()` — Haiku on all listings in parallel (15s timeout), Sonnet fallback for partial Haiku matches (score 0–0.3) on `high` confidence queries only, capped at 3 Sonnet calls
6. `visualSummaryContext` block built (visual query + text score matches by listing address) and injected into Sonnet summary message
7. Vision runs in parallel with Sonnet summary — `photo_rank` SSE emitted when ready
8. Tiles reorder on frontend by photo match score — strongest visual match becomes the thumbnail
9. Rankings cached in Redis with 7-day TTL
10. Visual context passed to `recordSearchEvent` → `visualPreferences` frequency updated in profile
11. Visual context passed to `buildSearchMemoryContent` → Supermemory gets aesthetic label signal
12. Top photo matches (score ≥ 0.5) write quality signal to Supermemory from vision callback

### Sonnet Visual Summary Behavior
When `visualSummaryContext` is present in the results message, Sonnet:
- Leads with the visual feature, not generic price/beds/baths specs
- Cites description evidence as concrete proof ("Listing 2 explicitly mentions X")
- Tells the user tiles are ordered by photo match strength
- Is honest when no description evidence exists ("photo ranking is your best signal")
- Never claims to see photos directly — it has descriptions and ranking context only

## Multi-City Search
Triggers when user explicitly says "search my preferred locations", "all my cities", "my saved locations" etc. AND has 2+ preferred locations saved.
- Skips Haiku routing entirely — intent is unambiguous
- Fires parallel MLS calls (max 3 cities), distributing result slots evenly
- Deduplicates by full address across cities
- Sonnet summary notes which city each listing is in
- Search context saved for primary location for carry-over

## Param Coercion
Haiku occasionally returns typed params as strings. `route.ts` coerces at the boundary before any downstream use:
- Numeric fields (listing_price_min/max, bedrooms_min/max, living_area_min/max, year_built_min/max, etc.) — string → Number, NaN → undefined
- Boolean fields (has_pool, has_basement, is_water_front, is_water_view, is_mountain_view) — "true"/"false" → boolean, other → undefined

## Profile Extraction Safety
`extractAndUpdateProfile` in `memory.ts` uses a `toArr()` helper that coerces any value to `string[]` before array operations. Guards against:
- SambaNova returning a string instead of an array for array fields
- Corrupted Redis/Postgres data from pre-migration rows

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

## User Identity
- **Logged-in users:** `userId` = backend `id` from `localStorage.userDetails` (set after Cognito Google login)
- **Anonymous users:** persistent random UUID from `localStorage.snapz_ai_user_id`
- `getUserId()` in `LandingAIChat.tsx` handles both cases

## Known Issues / Planned

### Memory
- **No history on chat open** — frontend starts blank every session despite Redis holding 30 days of history and Postgres holding the full profile. The user has to ask "what did we talk about?" to trigger recall, which defeats the persistent memory value prop. Fix: `GET /api/ai-assistant/history` endpoint that returns the last N messages from Redis + `loadProfile` → mount fetch in `LandingAIChat.tsx` to hydrate the chat window on open.
- **`sessionCount` is a dead field** — tracked in `BuyerProfile`, Redis, and Postgres but never incremented. `searchCount` works correctly. `sessionCount` needs a different trigger (first message of a new browser session) which is not wired up. Either implement it (detect new session vs continuation based on `lastActiveAt` timestamp gap) or remove the field from schema + profile to avoid confusion.
- **`answer_user` Supermemory write is too generic** — fires for every conversational response including greetings and general Q&A with: `"User preference signal from conversation: ${message.slice(0, 200)}"`. This pollutes Supermemory with noise. Fix: only write on `answer_user` turns that contain an actual preference signal (budget, location, feature mention) — gate the write behind a content check or pass it through the same extraction logic used for profile updates.

### Infrastructure
- **SambaNova 429 on fire-and-forget extraction** — non-critical (profile/pending action extraction in `memory.ts`). Caught and logged. If frequent, add retry with backoff on the extraction calls.
- **Routing latency** — Haiku routing ~0.5–1s (improvement over SambaNova's ~3s). If Fireworks credits become available, test `accounts/fireworks/models/llama-v3p3-70b-instruct` as OpenAI-compatible alternative (uncomment the provider block in `route.ts`).

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
SAMBANOVA_API_KEY                     # Used only for background profile/pending-action extraction in memory.ts
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
