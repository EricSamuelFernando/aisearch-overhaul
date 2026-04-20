# AI Search — Full Architecture Audit

## Overview

The AI search feature is a streaming SSE API at `/api/ai-assistant` backed by three Claude models, two Redis layers, Postgres, and Supermemory. Every user message goes through a two-model pipeline: Haiku routes the intent, Sonnet handles the response. MLS data is fetched, normalized, filtered, and injected into Sonnet's context for follow-up awareness.

---

## Request Lifecycle (end-to-end)

```
Client POST /api/ai-assistant
  { message, userId, email, name, mode, conversationId }
         │
         ├─ Redis parallel load (~30ms)
         │    profile, history (per convId), searchCtx (per convId), pendingAction
         │
         ├─ Supermemory fetch starts in background (non-blocking, 1500ms timeout)
         │
         ├─ [mode=interview] → skip routing → Sonnet (Home Pilot) → done
         │
         ├─ [pure affirmation + no pending + no searchCtx] → skip routing → Sonnet conversational → done
         │
         ├─ [multi-city intent + 2+ preferred locations] → skip routing → parallel MLS calls → Sonnet → done
         │
         ├─ Build Haiku routing input:
         │    intelligenceBlock (from BuyerProfile)
         │    searchCtxBlock (last search params, pre-adjusted for relative refinements)
         │    pendingActionBlock (proposed search from last assistant turn)
         │    routingHistory (last 8 messages, listings summarised as "[showed N listings: ...]")
         │
         ├─ Haiku routing + Supermemory race (parallel)
         │    → tool_use: search_mls | reference_listing | answer_user
         │
         ├─── answer_user ──→ Sonnet conversational (buildConversationalSystemPrompt)
         │                     receives: full conversation history + listing context blocks
         │                     emits: token stream → done
         │
         ├─── reference_listing ──→ look up listing from last history turn by 1-based index
         │                           emit listing_focus SSE
         │                           Sonnet with full listing detail block → done
         │
         └─── search_mls ──→ MLS API call
                              emit listings SSE immediately
                              Redis photo cache lookup (batch)
                              Sonnet summary stream (buildSearchSystemPrompt)
                              Vision ranking in parallel (if visual_query set)
                              emit photo_rank SSE
                              emit done SSE
                              [background] appendMessage, saveSearchContext, recordSearchEvent,
                                           extractAndUpdateProfile, writeMemory
```

---

## Models and Their Roles

| Model | Role | Max tokens | Called on |
|---|---|---|---|
| `claude-haiku-4-5-20251001` | Intent routing — picks `search_mls`, `reference_listing`, or `answer_user` | 256 | Every non-shortcut message |
| `claude-haiku-4-5-20251001` | Vision pass 1 — scores all listing photos in parallel | 200 | Every visual_query search |
| `claude-haiku-4-5-20251001` | Profile extraction — extracts buyer preferences fire-and-forget | 300 | After every conversational turn |
| `claude-haiku-4-5-20251001` | Interview extraction — richer profile from Home Pilot turns | 400 | After every interview turn |
| `claude-haiku-4-5-20251001` | Pending action extraction — detects proposed searches | 256 | After answer_user turns |
| `claude-sonnet-4-6` | Search summary — summarises MLS results with advisor framing | 512 | search_mls path |
| `claude-sonnet-4-6` | Conversational answer — follow-ups, profile reads, Q&A | 512 | answer_user + reference_listing |
| `claude-sonnet-4-6` | Home Pilot interview — lifestyle-based profile building | 400 | mode=interview |
| `claude-sonnet-4-6` | Vision pass 2 (fallback) — only for high-confidence queries with partial Haiku match | 200 | Up to 3 listings per search |

---

## MLS Data Pipeline

### API Call (`mls.ts`)

Endpoint: `POST https://api.realestateapi.com/v2/MLSSearch`  
Auth: `x-api-key: REALESTATE_API_KEY`

Hardcoded base payload (always sent):
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

### Field Normalization (`normalizeListing`)

Raw API path → `MLSListing` field:

| MLSListing field | Raw API path | Notes |
|---|---|---|
| `id` | `listingId` or `id` | |
| `full_address` | `listing.address.unparsedAddress` | |
| `city` | `listing.address.city` | |
| `state` | `listing.address.stateOrProvince` | |
| `zip` | `listing.address.zipCode` | |
| `listing_price` | `listing.listPriceLow` or `listing.leadTypes.mlsListingPrice` | |
| `bedrooms` | `listing.property.bedroomsTotal` | |
| `bathrooms` | `listing.property.bathroomsTotal` | |
| `living_area` | `listing.property.livingArea` | sqft |
| `lot_size` | `listing.property.lotSizeSquareFeet` | |
| `year_built` | `listing.property.yearBuilt` | |
| `has_pool` | `listing.property.hasPool` | boolean |
| `days_on_market` | `listing.leadTypes.mlsDaysOnMarket` | coerced to number |
| `photos` | `listing.media.photosList[].highRes` | up to 20, falls back to midRes/lowRes |
| `listing_url` | `listing.url` | |
| `description` | `listing.publicRemarks` | full text |
| `property_type` | `listing.property.propertyType` | e.g. "Residential" |
| `property_sub_type` | `listing.property.propertySubType[0]` | array — takes first element e.g. "Single Family Residence" |
| `status` | `listing.leadTypes.mlsStatus` or `listing.standardStatus` | |
| `garage_spaces` | `listing.property.garageSpaces` | |
| `stories` | `listing.property.stories` | |
| `has_basement` | `listing.property.hasBasement` | boolean |
| `hoa_fee` | `listing.property.associationFee` | per month |
| `neighborhood` | `listing.property.neighborhood` or `listing.property.subdivisionName` | |
| `is_waterfront` | `listing.property.isWaterFront` | |
| `is_water_view` | `listing.property.isWaterView` | |
| `is_mountain_view` | `listing.property.isMountainView` | |
| `is_city_view` | `listing.property.isCityView` | |
| `is_park_view` | `listing.property.isParkView` | |
| `bestScore` | Populated post-vision | 0–1 confidence from photo ranking |

### Post-fetch Filters (applied in order)

1. Strip `lease` / `rental` by `property_type`
2. Strip `land` unless search explicitly requested land
3. Strip non-active: any listing where `status` is present and not `"active"` (catches pending/contingent/sold that slip past API filter)
4. Deduplicate by `full_address` (API sometimes returns the same property twice)

### What Sonnet Sees

**Search path (`formatListingsForPrompt`)** — one line per listing:
```
[N] address, city, state — $price | Nbd/Nba | sqft | Built YYYY | property_sub_type
    | N stories | N-car garage | Pool | Basement | HOA $N/mo | Neighborhood
    | Waterfront/views | N DOM | url
```
Description is NOT included here — keeps Sonnet's input tight for search summaries.

**Conversational follow-up path** — injected as a fake user turn after each assistant message that had listings:
```
#1: address — $price, Nbd/Nba, sqft, built YYYY, property_sub_type, N stories,
    N-car garage, pool, basement, HOA $N/mo, neighborhood, view flags
    | "first 200 chars of description…"
```
This is what enables "which of these are duplexes?" and "which has a chef's kitchen?" to work correctly.

**reference_listing path** — full structured block:
```
Address, Price, Bedrooms, Bathrooms, Living area, Lot size, Year built,
Stories, Garage spaces, Pool (Yes/No), Basement (Yes/No), HOA fee,
Neighborhood, Property type, View flags, Days on market, Description (full)
```

---

## Memory Layers

### Upstash Redis (hot cache)

| Key pattern | Content | TTL |
|---|---|---|
| `profile:{userId}` | Full `BuyerProfile` JSON | 90 days |
| `chat:history:{userId}:{convId}` | Redis list of `AIAssistantMessage[]` (per-conversation) | 30 days |
| `chat:index:{userId}` | Sorted set of convIds scored by timestamp | 30 days |
| `search_ctx:{userId}:{convId}` | `SearchContext` (last MLS params + location) | 7 days |
| `pending_action:{userId}` | `PendingAction` (proposed search from last assistant turn) | 10 minutes |
| `photo_rank:v2:{listingId}:{md5(visualQuery)[0:8]}` | `PhotoRankResult` (ranked photos + bestScore) | 7 days |

Legacy keys (`history:{userId}`, `search_ctx:{userId}`) remain for backward compat.

### Neon Postgres (permanent)

| Table | Content | Write strategy |
|---|---|---|
| `buyer_profiles` | Full `BuyerProfile` — upsert on userId | Every profile save |
| `search_events` | Raw search audit log: userId, params, resultCount, timestamp | Every search_mls call |

Schema managed with Drizzle ORM. Sync with `npx drizzle-kit push` (not generate/migrate).

### Supermemory (semantic, cross-session)

- One document per behavioral event, tagged by `containerTags: [userId]`
- Read: `client.profile({ containerTag: userId, q: message, threshold: 0.5 })` — semantic retrieval
- Write: fire-and-forget after search and preference-signal conversational turns
- Timeout: 1500ms — graceful degradation, never blocks the response

**What gets written to Supermemory:**
- Search events: location, bedrooms, budget, features, visual preference label, result count
- Visual match results: top match address, score, location
- Home Pilot interview turns: user input + question asked
- Preference signals from conversation: user message when it contains a preference keyword

**What does NOT get written:**
- Raw listing data, addresses, or prices
- Generic greetings or Q&A with no preference signal

---

## BuyerProfile — Fields and Sources

```typescript
// Identity (seeded from request, never extracted)
email, name

// Stated preferences (extracted by Haiku from conversation, fire-and-forget)
preferredLocations, budgetMin, budgetMax, bedroomsMin, bathroomsMin,
mustHaves, dealBreakers, propertyTypes

// Personal context (extracted by Haiku from Home Pilot interview)
personalContext: Record<string, string>
// e.g. { driving_move, household_composition, work_style, lifestyle,
//         timeline, current_city, life_stage, has_children, commute_info }

// Behavioral intelligence (derived from actual search events, computed in intelligence.ts)
topCities: Record<string, number>      // frequency map e.g. { "Austin,TX": 4 }
avgBudgetMax, avgBudgetMin             // running averages of search prices
avgBedroomsMin                         // running average of bedrooms_min
featureFrequency: Record<string, number> // e.g. { pool: 5, waterfront: 2 }
searchCount, sessionCount, lastActiveAt

// Visual/aesthetic preferences (extracted from visual_query searches + Home Pilot)
visualPreferences: Record<string, number> // e.g. { "hardwood floors": 4, "blue kitchen": 2 }
```

---

## Haiku Intent Routing

Three tools, `tool_choice: { type: "any" }` — always picks exactly one:

| Tool | When | Key constraint |
|---|---|---|
| `search_mls` | User wants to find, browse, filter, or re-show properties | Carries forward last search ctx params; visual_query fields are stripped before MLS call |
| `reference_listing` | User asks about ONE listing with explicit positional reference (#1, "first", "third") | NOT for plural questions ("which of these...") — those are answer_user |
| `answer_user` | Everything else: greetings, Q&A, profile reads, plural listing questions | |

**Pre-route shortcuts (skip Haiku entirely):**
- Pure affirmation with no pending action and no search context → answer_user directly
- Multi-city intent ("all my preferred locations") with 2+ saved locations → parallel MLS

**Intelligence block injected into Haiku's system prompt:**
- Primary market (top city by search frequency)
- Typical budget max (running average)
- Typical bedrooms min (running average)
- Frequently searched features (used 2+ times)
- Aesthetic preferences (visual_query labels)
- Stated preferences (locations, budget, must-haves, deal-breakers)
- Personal context (household, work style, life stage)

**Relative refinement (pre-computed in JS before Haiku call):**
Terms like "cheaper", "bigger", "more bedrooms", "newer" are detected and pre-adjusted against the last search context. The pre-adjusted values are shown to Haiku so it never needs to do arithmetic.

---

## Vision Pipeline (`vision.ts`)

Triggered when Haiku sets `visual_query` on a `search_mls` call.

**Pass 1 — Haiku (all listings in parallel):**
- Sends up to 20 photos per listing
- Prompts model to score each photo 0.0–1.0 against the visual query
- Room filter applied if `room_hint` is set (scores non-matching rooms as 0.0)
- Timeout: 15s

**Pass 2 — Sonnet fallback (high confidence only):**
- Only runs when `visual_confidence = "high"`
- Only retries listings where Haiku score is > 0 but < 0.3 (partial match)
- Score of 0.0 is not retried (Haiku found nothing)
- Capped at 3 Sonnet calls per search
- Timeout: 25s

**Photo cache:**
- Key: `photo_rank:v2:{listingId}:{md5(visualQuery)[0:8]}`
- Batch cache lookup happens before MLS call — cache hits are applied before the `listings` SSE fires
- Uncached listings run vision in parallel with Sonnet summary
- Vision promise awaited before closing SSE controller (max 8s cap)

---

## System Prompts

| Prompt builder | Used on | Key contents |
|---|---|---|
| `buildIntentSystemPrompt` | Haiku routing | Full routing rules + param mapping + intelligence block |
| `buildSearchSystemPrompt` | Sonnet search summary | Advisor role + profile block + formatting rules (no markdown symbols, no repeated tile specs) |
| `buildConversationalSystemPrompt` | Sonnet answer_user + reference_listing | Advisor role + profile block + cross-session memory block + formatting rules |
| `buildInterviewSystemPrompt` | Sonnet Home Pilot | Interview persona + existing profile + question order + SUGGEST format |

---

## SSE Event Types

| Event type | Payload | When |
|---|---|---|
| `listings` | `MLSListing[]` | Immediately after MLS returns (search_mls path) |
| `listing_focus` | `{ data: MLSListing, index: number }` | reference_listing path |
| `token` | `{ text: string }` | Each streamed text chunk from Sonnet |
| `photo_rank` | `PhotoRankResult[]` | After vision completes (parallel with Sonnet) |
| `done` | `{}` | End of response |
| `error` | `{ message: string }` | On failure |

---

## Multi-Conversation Architecture

- `conversationId` is sent in the POST body; generated by client (`crypto.randomUUID()`) and persisted in `sessionStorage` as `landing_ai_chat_conv_id`
- If absent (legacy clients), server generates a UUID
- Each conversation has isolated Redis keys for history and search context
- Conversation index: sorted set `chat:index:{userId}` scored by timestamp — newest first
- History panel fetches `?mode=conversations` to get the last 5 conversation previews
- "New chat" clears sessionStorage convId and generates a fresh UUID on next message

---

## Environment Variables

| Variable | Used in | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | claude.ts, vision.ts, memory.ts | All Claude API calls |
| `REALESTATE_API_KEY` | mls.ts | RealEstateAPI.com MLS search |
| `UPSTASH_REDIS_REST_URL` | db.ts | Serverless Redis |
| `UPSTASH_REDIS_REST_TOKEN` | db.ts | Serverless Redis auth |
| `SUPERMEMORY_API_KEY` | supermemory.ts | Semantic memory |
| `DATABASE_URL` | db-pg.ts | Neon Postgres (Drizzle) |
| `SAMBANOVA_API_KEY` | Not actively used — legacy from previous routing setup |

---

## Known Limitations and Edge Cases

- **`propertySubType` is an array** in the API response — we take `[0]`. If multiple sub-types exist only the first is used.
- **`custom_status: "Active"` filter** added to payload because `status: "Active"` alone did not reliably exclude pending listings. A post-fetch status filter also exists as a safety net.
- **Photos**: `photosList` is only present when `include_photos: true` is in the payload (which it always is). Without it only `primaryListingImageUrl` is returned.
- **Supermemory cold starts**: can take up to 1500ms. If it times out, Sonnet proceeds with profile + Redis context only — no semantic degradation.
- **`public` section**: almost entirely null in most API responses — not normalized.
- **`description` in search prompt**: intentionally excluded from `formatListingsForPrompt` to keep Sonnet's input size tight. It appears in the conversation context block (truncated to 200 chars) and in full in the `reference_listing` detail block.
- **Regex ban** (CLAUDE.md): all string matching uses `includes`, `startsWith`, `split`, or typed logic — no regex anywhere except inside `intelligence.ts` relative refinement terms (pre-existing, to be refactored).
- **Haiku 429 handling**: one automatic retry after 3s delay.
- **Vision timeout**: capped at 8s wait on SSE controller close — a slow vision call can't hang the connection indefinitely.
