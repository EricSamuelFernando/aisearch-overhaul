# AI Search — Architecture Reference

This document is a complete technical reference for the AI-powered real estate search system built into Snaphomz. It is intended to give any model or engineer full context to understand, debug, or extend this system without needing to read every source file.

---

## What This System Does

A user types a natural language message ("show me 4-bed homes in Austin under $800k with a pool"). The system routes that message through two AI models, fetches real MLS listings, streams the results back to the browser as tiles, ranks listing photos against the user's visual preferences, and remembers everything about the user across sessions. Follow-up questions ("which of these are duplexes?", "does the first one have a basement?") are answered using the full listing data that was injected into Sonnet's context.

---

## Tech Stack

- **Framework**: Next.js 14 App Router, TypeScript, `export const runtime = "nodejs"` on all AI routes
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`) — Haiku for routing/extraction, Sonnet for responses
- **MLS data**: RealEstateAPI.com v2 (`POST https://api.realestateapi.com/v2/MLSSearch`)
- **Cache**: Upstash Redis (serverless, REST)
- **Permanent storage**: Neon Postgres via Drizzle ORM
- **Semantic memory**: Supermemory
- **Streaming**: Server-Sent Events (SSE) over a single HTTP connection

---

## File Map

```
src/
├── app/api/ai-assistant/
│   ├── route.ts              # Main POST handler — orchestrates everything
│   └── history/route.ts      # GET handler — conversation history + index
├── lib/ai-assistant/
│   ├── claude.ts             # All system prompts + Anthropic client
│   ├── mls.ts                # MLS API call, normalization, filtering
│   ├── intelligence.ts       # BuyerProfile intelligence computation (pure, no I/O)
│   ├── memory.ts             # Redis + Postgres read/write + Haiku extraction
│   ├── vision.ts             # Two-pass photo ranking (Haiku + Sonnet)
│   ├── photo-cache.ts        # Redis photo rank cache
│   ├── supermemory.ts        # Supermemory read/write
│   ├── schema.ts             # Drizzle ORM schema (buyer_profiles, search_events)
│   ├── db.ts                 # Upstash Redis client
│   └── db-pg.ts              # Neon Postgres client
├── types/ai-assistant.ts     # All shared TypeScript interfaces
└── components/ai-assistant/
    └── LandingAIChat.tsx     # Frontend SSE parser + chat UI
```

---

## Complete Request Flow

Every user message follows this path:

### 1. Client sends POST

```
POST /api/ai-assistant
{
  message: string,
  userId: string,
  email?: string,
  name?: string,
  mode?: "interview",
  conversationId?: string   // UUID from sessionStorage; server generates if absent
}
```

### 2. Parallel Redis load (~30ms)

Four keys loaded simultaneously:
- `profile:{userId}` → `BuyerProfile` (falls back to Postgres, then default)
- `chat:history:{userId}:{convId}` → `AIAssistantMessage[]`
- `search_ctx:{userId}:{convId}` → `SearchContext` (last MLS params + location)
- `pending_action:{userId}` → `PendingAction` (proposed search from last assistant turn, 10min TTL)

### 3. Supermemory fetch (background, non-blocking)

Starts immediately alongside Redis load. 1500ms timeout — if it doesn't resolve in time, Sonnet proceeds without it. Never blocks the response.

### 4. Identity seeding

If `email` or `name` are present in the request and missing from the profile, they are written to the profile (fire-and-forget).

### 5. User message appended to history

`appendMessage(userId, { role: "user", content: message }, convId)` — written before routing so history is correct even if routing fails.

### 6. Pre-routing shortcuts (skip Haiku entirely)

Three conditions short-circuit Haiku:

**a. Interview mode** (`mode === "interview"` or `message === "__home_pilot_start__"`):
Sonnet runs the Home Pilot persona directly. No MLS. Profile extraction fires after.

**b. Pure affirmation with no context** (`"yes"`, `"sure"`, `"ok"`, etc. ≤5 words, no search-intent words, no pending action, no search context):
Sonnet answers conversationally. Haiku skipped entirely.

**c. Multi-city intent** (message contains "preferred locations" / "all my cities" / "saved locations" AND profile has 2+ `preferredLocations`):
Parallel MLS calls — one per saved location (capped at 3), merged and deduplicated. Haiku skipped.

### 7. Haiku intent routing

Haiku receives:
- Full intent system prompt (routing rules + param mapping)
- Intelligence block (derived from BuyerProfile — top city, avg budget, features, aesthetics)
- Last search context block (params from last search, pre-adjusted for relative refinements)
- Pending action block (proposed search from last assistant turn)
- Last 8 history messages (listings summarised as `[showed N listings: #1 addr, ...]`)
- Current user message

Haiku must call exactly one of three tools: `search_mls`, `reference_listing`, `answer_user`.

Haiku runs in parallel with the Supermemory fetch — whichever finishes last unblocks the next step.

### 8. Branch by tool

#### answer_user
Sonnet receives the full `conversationMessages` array (history with listing context blocks injected) and streams a response.

#### reference_listing
- Extracts `listing_index` (1-based) from tool input
- Looks up the listing from the last history turn that had listings
- Emits `listing_focus` SSE with the target listing
- Sonnet receives the full listing detail block (all fields + full description) and streams a response

#### search_mls
- Coerces any string-typed numeric/boolean params
- Strips visual fields (`visual_query`, `room_hint`, `visual_confidence`, `description_keywords`) — these are not MLS API fields
- Calls MLS API
- Batch photo cache lookup (Redis, ~10ms) — cache hits applied before listings SSE fires
- Emits `listings` SSE immediately
- Sonnet streams summary
- Vision ranking runs in parallel for uncached listings (if `visual_query` set)
- Emits `photo_rank` SSE when vision completes
- Emits `done` SSE
- Background tasks: `appendMessage`, `saveSearchContext`, `recordSearchEvent`, `extractAndUpdateProfile`, `writeMemory`

---

## MLS API

### Request

```typescript
POST https://api.realestateapi.com/v2/MLSSearch
Headers: { "x-api-key": REALESTATE_API_KEY, "Content-Type": "application/json" }

// Base payload (always present — hardcoded in mls.ts)
{
  active: true,
  has_photos: true,
  status: "Active",
  custom_status: "Active",   // required — "status" alone doesn't filter pending listings
  sold: false,
  include_photos: true,      // required — without this, photosList is absent from response
  size: 6,                   // default; Haiku can set up to 12
  // + any search params from Haiku (city, state, bedrooms_min, etc.)
}
```

`listing_property_type` is never sent. Only `property_sub_type` is used for property classification.

### Response Structure (confirmed from live API)

```
data[N]
  .listingId                        → MLSListing.id
  .listing
    .listPriceLow                   → MLSListing.listing_price
    .publicRemarks                  → MLSListing.description
    .url                            → MLSListing.listing_url
    .standardStatus                 → MLSListing.status (fallback)
    .address
      .unparsedAddress              → MLSListing.full_address
      .city                         → MLSListing.city
      .stateOrProvince              → MLSListing.state
      .zipCode                      → MLSListing.zip
    .leadTypes
      .mlsStatus                    → MLSListing.status (primary)
      .mlsDaysOnMarket              → MLSListing.days_on_market (string, coerced to number)
      .mlsListingPrice              → MLSListing.listing_price (fallback)
    .property
      .bedroomsTotal                → MLSListing.bedrooms
      .bathroomsTotal               → MLSListing.bathrooms
      .livingArea                   → MLSListing.living_area (sqft)
      .lotSizeSquareFeet            → MLSListing.lot_size
      .yearBuilt                    → MLSListing.year_built
      .hasPool                      → MLSListing.has_pool
      .hasBasement                  → MLSListing.has_basement
      .garageSpaces                 → MLSListing.garage_spaces
      .stories                      → MLSListing.stories
      .associationFee               → MLSListing.hoa_fee
      .neighborhood                 → MLSListing.neighborhood (falls back to subdivisionName)
      .subdivisionName              → MLSListing.neighborhood (fallback)
      .propertyType                 → MLSListing.property_type (e.g. "Residential")
      .propertySubType              → MLSListing.property_sub_type
                                       *** THIS IS AN ARRAY e.g. ["Single Family Residence"] ***
                                       We take [0]. Full MLS strings: "Single Family Residence",
                                       "Duplex", "Condominium", "Townhouse", etc.
      .isWaterFront                 → MLSListing.is_waterfront
      .isWaterView                  → MLSListing.is_water_view
      .isMountainView               → MLSListing.is_mountain_view
      .isCityView                   → MLSListing.is_city_view
      .isParkView                   → MLSListing.is_park_view
    .media
      .photosList[N]
        .highRes                    → MLSListing.photos[] (up to 20)
        .midRes                     → fallback if highRes absent
        .lowRes                     → fallback if midRes absent
      .primaryListingImageUrl       → present without include_photos; not used when photosList available
      .photosCount                  → total photo count (string), not used
```

### Post-fetch Filters (applied in order after normalization)

1. **Lease/rental**: drop if `property_type` contains "lease" or "rental"
2. **Land**: drop if `property_type` contains "land" AND search did not explicitly request land
3. **Non-active**: drop if `status` is present and not `"active"` (catches pending/contingent that slip past API filter)
4. **Deduplication**: drop if `full_address` already seen (API sometimes returns same property twice)

---

## What Sonnet Sees — Listing Context

This is critical. Sonnet's ability to answer follow-up questions depends entirely on what data is injected into its context.

### Search summary path (`formatListingsForPrompt`)

One line per listing, compact format:
```
[1] 4685 Farrier Way, Roseville, CA — $970,000 | 4bd/4ba | 3,854 sqft | Built 2004
    | Single Family Residence | 2 stories | 2-car garage | Pool | HOA $115/mo
    | Heritage at Diamond Oaks | 4 DOM | https://realty.com/...
```
**Description intentionally excluded** — keeps Sonnet's input tight for search summaries.

### Conversational follow-up path (conversation context block)

Injected as fake user/assistant turns after each assistant message that included listings:
```
[User turn injected]:
#1: 4685 Farrier Way — $970,000, 4bd/4ba, 3,854 sqft, built 2004, Single Family Residence,
    2 stories, 2-car garage, pool, HOA $115/mo, Heritage at Diamond Oaks
    | "Welcome to this stunning home featuring an open floor plan, chef's kitchen with..."

[Assistant turn injected]:
"Got it — I have those listings as context."
```
Description is truncated to **200 characters**. This enables questions like "which of these are duplexes?", "any with a chef's kitchen?", "which has the lowest HOA?".

### reference_listing path (single listing detail block)

Full structured block, no truncation:
```
Address: 4685 Farrier Way, Roseville, CA
Price: $970,000
Bedrooms: 4
Bathrooms: 4
Living area: 3,854 sqft
Lot size: 11,670 sqft
Year built: 2004
Stories: 2
Garage spaces: 2
Pool: Yes
Basement: No
HOA fee: $115/mo
Neighborhood: Heritage at Diamond Oaks
Property type: Single Family Residence
Days on market: 4
Description: [full publicRemarks text]
```

---

## Three Claude Models and Their Exact Roles

### Haiku — Intent Router (every non-shortcut message)

```
Model: claude-haiku-4-5-20251001
Max tokens: 256
Temperature: 0
tool_choice: { type: "any" }  // must call exactly one tool
```

Three tools available:
- `search_mls` — find/browse/filter/re-show properties
- `reference_listing` — detail on ONE listing with explicit position reference (#1, "first", "third")
- `answer_user` — everything else

**Critical routing rules:**
- `reference_listing` requires explicit positional reference. "Which of these are duplexes?" → `answer_user`. No position = answer_user.
- Relative terms (cheaper, bigger, newer) are pre-adjusted in JS before Haiku sees them — Haiku uses the pre-computed values directly
- Confirmations ("yes", "go ahead") with a pending action → `search_mls` with pending action params
- "Show me more like #2" → `search_mls` (similarity search), NOT `reference_listing`

### Haiku — Profile Extractor (fire-and-forget after every turn)

```
Model: claude-haiku-4-5-20251001
Max tokens: 300
Temperature: 0
```

Extracts from the conversation turn: locations, budget, bedrooms, bathrooms, must-haves, deal-breakers, property types, removals (user said "not Austin", "forget the pool"), personal context.

Supports both additions AND removals. Budget inversion guard (if min > max, swap them).

### Haiku — Interview Extractor (fire-and-forget after Home Pilot turns)

```
Model: claude-haiku-4-5-20251001
Max tokens: 400
Temperature: 0
```

Richer extraction from lifestyle context: infers bedrooms from household size, must-haves from daily routine, property types from life stage. Also extracts `visualPreferenceLabels` (short aesthetic phrases like "warm natural wood", "modern farmhouse") that increment `visualPreferences` in BuyerProfile.

### Haiku — Pending Action Detector (fire-and-forget after answer_user turns)

```
Model: claude-haiku-4-5-20251001
Max tokens: 256
Temperature: 0
```

Detects whether Sonnet proposed a specific search ("I can pull up 3-bed condos in Denver under $600k — want me to?"). If yes, saves params as `PendingAction` in Redis (10min TTL). Next user confirmation triggers that search.

### Haiku — Vision Pass 1 (parallel, all listings)

```
Model: claude-haiku-4-5-20251001
Max tokens: 200
Temperature: 0
Timeout: 15s
```

Scores each photo 0.0–1.0 against the visual query. Sends up to 20 photos per listing. Room filter enforced: if `room_hint` is set, photos of other rooms must score 0.0. Returns a JSON array of scores.

### Sonnet — Search Summary

```
Model: claude-sonnet-4-6
Max tokens: 512
System: buildSearchSystemPrompt (advisor role + profile block + formatting rules)
```

Receives MLS results via `formatListingsForPrompt`. Streams a structured response: city + count line, one-liner snapshot, 2-3 listing callouts, one catch/tradeoff, one recommendation. Never repeats data the tiles already show.

### Sonnet — Conversational / reference_listing

```
Model: claude-sonnet-4-6
Max tokens: 512
System: buildConversationalSystemPrompt (advisor role + profile block + Supermemory block)
```

Receives full conversation history with listing context blocks injected. Has access to all listing fields for every listing shown in the conversation.

### Sonnet — Home Pilot (interview mode)

```
Model: claude-sonnet-4-6
Max tokens: 400
System: buildInterviewSystemPrompt
```

Builds buyer profile through natural conversation about life, not specs. One question per turn. Emits `SUGGEST: option | option | option` chips for UI rendering. Transitions to search when it has location + budget + household + aesthetic.

### Sonnet — Vision Pass 2 (selective fallback)

```
Model: claude-sonnet-4-6
Max tokens: 200
Temperature: 0
Timeout: 25s
Max: 3 listings per search
```

Only fires for listings where Haiku score is `> 0 AND < 0.3` (partial match, not total miss). Never retries score 0.0 — that means Haiku looked and found nothing. Only runs when `visual_confidence === "high"`.

---

## Memory Architecture

### Layer 1 — Upstash Redis (hot, serverless)

| Key | Type | Content | TTL |
|---|---|---|---|
| `profile:{userId}` | JSON | Full `BuyerProfile` | 90 days |
| `chat:history:{userId}:{convId}` | Redis List | `AIAssistantMessage[]` per conversation | 30 days |
| `chat:index:{userId}` | Sorted Set | convIds scored by timestamp | 30 days |
| `search_ctx:{userId}:{convId}` | JSON | Last MLS params + location per conversation | 7 days |
| `pending_action:{userId}` | JSON | Proposed search from last assistant turn | 10 minutes |
| `photo_rank:v2:{listingId}:{md5(query)[0:8]}` | JSON | Ranked photos + bestScore | 7 days |

Legacy flat keys (`history:{userId}`, `search_ctx:{userId}`) still exist for backward compat.

`AIAssistantMessage` structure:
```typescript
{
  role: "user" | "assistant"
  content: string
  listings?: MLSListing[]      // full listing objects stored on assistant search turns
  focusedListing?: MLSListing  // single listing on reference_listing turns
  timestamp?: string           // ISO
}
```

### Layer 2 — Neon Postgres (permanent)

Two tables managed by Drizzle ORM. Sync schema with `npx drizzle-kit push`.

**`buyer_profiles`** — one row per user, upserted on every profile save:
All BuyerProfile fields including intelligence fields (topCities, avgBudgetMax, featureFrequency, visualPreferences, personalContext).

**`search_events`** — immutable audit log, one row per MLS search:
userId, params (JSON), resultCount, searchedAt.

### Layer 3 — Supermemory (semantic, cross-session)

Read: `client.profile({ containerTag: userId, q: message, threshold: 0.5 })` — semantic retrieval against the current query. Returns a `profile` string injected into Sonnet's system prompt as `## Behavioral memory from previous sessions:`.

Write: fire-and-forget. Content is pre-built by `buildSearchMemoryContent` or written directly — never raw listing data.

**What gets written:**
- Every search: location, bedrooms, budget, features, visual preference label, result count
- Visual match results: top matching listing + score
- Home Pilot interview turns: user input + question asked
- Conversational turns with preference signals (budget, bedrooms, must-haves, etc. mentioned)

**What never gets written:** Raw listing addresses, prices, or full descriptions. Supermemory stores behavioral signals only.

---

## BuyerProfile — Complete Field Reference

```typescript
interface BuyerProfile {
  userId: string

  // Identity — seeded from request body, never AI-extracted
  email: string | null
  name: string | null

  // Stated preferences — extracted by Haiku from conversation (fire-and-forget)
  preferredLocations: string[]       // e.g. ["Austin, TX", "Denver, CO"]
  budgetMin: number | null
  budgetMax: number | null
  bedroomsMin: number | null
  bathroomsMin: number | null
  mustHaves: string[]                // e.g. ["pool", "home office", "large yard"]
  dealBreakers: string[]             // e.g. ["HOA", "busy street"]
  propertyTypes: string[]            // e.g. ["Single Family", "Condo"]
  lastUpdated: string                // ISO

  // Personal context — extracted by Haiku from Home Pilot interview
  // Freeform key-value facts about the person's life
  personalContext: Record<string, string>
  // Keys: driving_move, household_composition, work_style, lifestyle,
  //        timeline, current_city, life_stage, has_children, commute_info

  // Behavioral intelligence — computed from actual search events in intelligence.ts
  topCities: Record<string, number>     // frequency map: { "Austin,TX": 4, "Denver,CO": 1 }
  avgBudgetMax: number | null           // running average of listing_price_max used in searches
  avgBudgetMin: number | null           // running average of listing_price_min
  avgBedroomsMin: number | null         // running average of bedrooms_min
  featureFrequency: Record<string, number>  // { "pool": 5, "waterfront": 2, "no HOA": 3 }
  searchCount: number
  sessionCount: number
  lastActiveAt: string | null

  // Visual/aesthetic preferences — from visual_query searches + Home Pilot
  visualPreferences: Record<string, number>
  // e.g. { "hardwood floors": 4, "blue kitchen": 2, "modern farmhouse": 3 }
}
```

### How intelligence block is built (injected into Haiku's routing prompt):

- Primary market: top city by frequency (only one — never combine cities)
- Typical budget max: used as `listing_price_max` default when user doesn't specify
- Typical bedrooms min: default when not specified
- Frequently searched features: those used 2+ times
- Aesthetic preferences: those used 1+ time (low threshold so interview data appears immediately)
- Stated preferences: locations, budget range, must-haves, deal-breakers
- Personal context: household, work style, life stage + derived routing hints (has kids → prefer SFR, WFH → home office must-have)

---

## Haiku Search Parameters

Full parameter set Haiku can set on `search_mls`:

```
Geography:      city, state, county, zip
Classification: property_sub_type (enum, see below)
Price:          listing_price_min, listing_price_max, price_per_sqft_min, price_per_sqft_max
Beds/Baths:     bedrooms_min, bedrooms_max, bathrooms_min, bathrooms_max
Size:           living_area_min, living_area_max, lot_size_min, lot_size_max, stories
Features:       has_pool, has_basement
Views:          is_water_front, is_water_view, is_mountain_view, is_city_view, is_park_view
Age/Timing:     year_built_min, year_built_max, days_on_market_min, days_on_market_max, latest_only
HOA:            listing_association_fee_max
Results:        size (default 6, max 12; visual queries always 12)
Visual:         visual_query, room_hint, visual_confidence, description_keywords
```

`property_sub_type` enum values (what Haiku sends → what API filters on):
`"Single Family"`, `"Condo"`, `"Townhouse"`, `"Duplex"`, `"Multi-Family"`, `"Triplex"`, `"Fourplex"`, `"Apartment"`, `"Manufactured Home"`, `"Mobile Home"`, `"Cabin"`, `"Ranch"`, `"Mixed Use"`

Note: The API returns the full MLS string in responses (`"Single Family Residence"`, etc.) which differs from what we send for filtering. The search filter values are accepted by the API as partial/exact matches.

Visual params (`visual_query`, `room_hint`, `visual_confidence`, `description_keywords`) are stripped from the payload before the MLS API call — they are only used for photo ranking.

### Relative refinement (pre-computed in JS before Haiku call)

Detected in `applyRelativeRefinement` (intelligence.ts). When found, the delta is applied to `searchCtx.params` and the pre-adjusted values are shown to Haiku:

| User says | Adjustment |
|---|---|
| "cheaper", "more affordable" | `listing_price_max × 0.8` |
| "more expensive", "higher-end" | `listing_price_max × 1.3` |
| "bigger", "more space" | `living_area_min + 500` |
| "smaller", "more compact" | `living_area_min − 500` |
| "newer", "new construction" | `year_built_min = 2015` |
| "older", "historic" | `year_built_max = 1980` |
| "more bedrooms" | `bedrooms_min + 1` |
| "fewer bedrooms" | `bedrooms_min − 1` |
| "show me more", "more results" | `size = 12` |

---

## Vision Pipeline

Triggered when Haiku sets `visual_query` on a `search_mls` call.

```
User: "show me homes with a wine cellar"
Haiku: visual_query = "wine racks with bottles, temperature-controlled wine storage room"
       room_hint = "any"
       visual_confidence = "high"
       description_keywords = "wine cellar,wine room,wine storage"
```

### Photo cache check (before MLS call)

Batch Redis lookup: `photo_rank:v2:{listingId}:{md5(query)[0:8]}` for all listing IDs. Cache hits are applied to listings before the `listings` SSE fires — cards render with the best photo instantly. TTL: 7 days.

### Pass 1 — Haiku (all uncached listings, parallel)

- Up to 20 photos per listing sent as image content blocks
- Each photo labelled `Photo 1:`, `Photo 2:`, etc.
- Scoring prompt: 0.0–1.0 per photo, returns JSON array
- Room filter: if `room_hint !== "any"`, non-matching rooms must score 0.0
- Results sorted descending — best photo first
- Timeout: 15s per listing

### Pass 2 — Sonnet (selective, high confidence only)

- Condition: `visual_confidence === "high"` AND listing score `> 0 AND < 0.3`
- Score 0.0 = Haiku found nothing, Sonnet won't either — skip
- Max 3 Sonnet calls per search
- Same prompt + images as Haiku, higher accuracy
- Only updates result if Sonnet score > Haiku score
- Timeout: 25s

### Timing

Vision runs in parallel with Sonnet's summary stream. SSE controller waits up to 8s for vision to complete before closing. `photo_rank` SSE fires as soon as vision is done, updating card photo order on the frontend.

---

## SSE Event Reference

```typescript
{ type: "listings",      data: MLSListing[] }        // tiles rendered immediately
{ type: "listing_focus", data: MLSListing, index: number }  // single tile highlighted
{ type: "token",         text: string }               // streamed text chunk
{ type: "photo_rank",    data: PhotoRankResult[] }    // reorders card photos
{ type: "done" }                                      // end of response
{ type: "error",         message: string }            // failure
```

`PhotoRankResult`:
```typescript
{ listingId: string, rankedPhotos: string[], bestScore: number }
```

---

## Multi-Conversation Architecture

Each conversation has isolated Redis keys. The frontend maintains `conversationId` in `sessionStorage` under the key `landing_ai_chat_conv_id`.

- New conversation: client generates `crypto.randomUUID()`, stores in sessionStorage, sends in POST body
- Continue conversation: same `conversationId` sent — Redis keys already exist
- Conversation index: sorted set `chat:index:{userId}` scored by message timestamp
- History panel: `GET /api/ai-assistant/history?userId=X&mode=conversations` → returns last 5 conversations with preview (first user message, truncated to 80 chars) and message count
- Load conversation: `GET /api/ai-assistant/history?userId=X&convId=Y` → returns messages (photos trimmed to 3 per listing for transfer efficiency)

---

## System Prompts Summary

### `buildIntentSystemPrompt` (Haiku routing)

Contains: routing rules for all three tools, param mapping rules (price, size, property types, views), visual_query expansion examples, state code rules, intelligence block appended per-request.

Key rules baked in:
- `search_mls` wins over `answer_user` when in doubt
- `reference_listing` requires explicit position — never for plural questions
- `property_sub_type` only — never set `listing_property_type`
- View booleans always paired with `visual_query`
- Carry forward all unspecified params from last search context

### `buildSearchSystemPrompt` (Sonnet search summary)

Contains: advisor persona, profile block, formatting rules. Response structure: city+count line → one-liner snapshot → 2-3 listing callouts (address bold, one key insight, one follow-up sentence max) → one catch/tradeoff → one recommendation or question.

Forbidden: markdown symbols (`#`, `-` bullets, `|`, `—`), emojis, repeating tile data, fabricating listings.

### `buildConversationalSystemPrompt` (Sonnet conversational)

Contains: advisor persona, profile block, Supermemory block, cross-session memory acknowledgement. For profile reads: one field per line. For comparisons: markdown table allowed. Max 4 sentences for Q&A.

### `buildInterviewSystemPrompt` (Sonnet Home Pilot)

Contains: interview persona, existing profile (skip already-known fields), question order (motivation → household → daily use → aesthetic → location/budget), transition trigger, mandatory SUGGEST format.

---

## Design Constraints

**No regex** (CLAUDE.md rule): all string matching uses `includes`, `startsWith`, `split`, or typed logic. The only exception is `intelligence.ts` relative refinement and route.ts pre-routing checks (pre-existing, flagged for refactoring).

**No `listing_property_type`**: only `property_sub_type` is used for property classification. `listing_property_type` was removed from Haiku's tool schema.

**`custom_status: "Active"` is required**: `status: "Active"` alone does not filter pending listings from the API. Both must be sent.

**`include_photos: true` is required**: without it, `photosList` is absent from the response and only `primaryListingImageUrl` (single photo) is available.

**Haiku 429 handling**: one automatic retry after 3s delay.

**Profile extraction never blocks**: all five Haiku extraction calls (`extractAndUpdateProfile`, `extractAndUpdateProfileFromInterview`, `extractAndSavePendingAction`) are fire-and-forget. Failures are logged but never surface to the user.

**Supermemory write never blocks**: `writeMemory` is always fire-and-forget. The SSE connection closes before Supermemory confirms the write.

---

## Environment Variables

| Variable | Required | Used in |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | claude.ts, vision.ts, memory.ts |
| `REALESTATE_API_KEY` | Yes | mls.ts — `x-api-key` header |
| `UPSTASH_REDIS_REST_URL` | Yes | db.ts |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | db.ts |
| `SUPERMEMORY_API_KEY` | Yes | supermemory.ts |
| `DATABASE_URL` | Yes | db-pg.ts (Neon Postgres) |
| `SAMBANOVA_API_KEY` | No | Legacy — not actively used |
| `GROQ_API_KEY` | No | Legacy — not actively used |

---

## Latency Budget (approximate, Vercel edge)

| Step | Time |
|---|---|
| Redis parallel load | ~30ms |
| Haiku routing + Supermemory race | ~400–600ms |
| MLS API call | ~800–1500ms |
| Redis photo cache batch lookup | ~10ms |
| Listings SSE fires | ~1200–2100ms from request |
| Sonnet first token | ~200–400ms after listings SSE |
| Vision pass 1 (Haiku, parallel) | ~3–8s (doesn't block Sonnet) |
| Vision pass 2 (Sonnet, if triggered) | ~5–12s (doesn't block summary) |
| Total to first text token | ~1400–2500ms |
| Total to done | ~3–5s (non-visual) / ~5–15s (visual) |
