# AI Assistant — Project Context

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Groq (llama-3.3-70b-versatile) — intent routing + profile extraction
- Anthropic Claude Sonnet 4.6 — streaming summaries + conversational answers
- RealEstateAPI.com v2 (POST /v2/MLSSearch) — MLS listings
- Upstash Redis — conversation history + structured buyer profile
- Supermemory — behavioral memory (cross-session, semantic)

## Key Files
| File | Purpose |
|------|---------|
| `src/app/api/ai-assistant/route.ts` | Main API route — routing, MLS, streaming |
| `src/lib/ai-assistant/claude.ts` | INTENT_SYSTEM_PROMPT + buildSystemPrompt |
| `src/lib/ai-assistant/memory.ts` | Redis profile/history + Groq profile extraction |
| `src/lib/ai-assistant/mls.ts` | MLS API call, normalization, deduplication |
| `src/lib/ai-assistant/supermemory.ts` | Supermemory read/write |
| `src/lib/ai-assistant/db.ts` | Upstash Redis client |
| `src/components/ai-assistant/LandingAIChat.tsx` | Frontend SSE parser + tile renderer |
| `src/types/ai-assistant.ts` | MLSSearchParams, MLSListing, BuyerProfile types |

## Architecture Flow
1. **User sends message**
2. **Redis** loads profile + history (~30ms)
3. **Supermemory** fetch starts in background (non-blocking)
4. **Groq** routes via two-tool approach (`search_mls` or `answer_user`) — `tool_choice: "required"`
5. Supermemory context injected if it resolves within Groq's ~2s window
6. **search_mls path:** MLS API → emit tiles immediately via SSE → Sonnet streams summary
7. **answer_user path:** Sonnet streams conversational response
8. **After response:** Groq extracts profile updates → Redis; Supermemory write (both fire-and-forget)

## Two-Tool Routing
Groq always calls one of two tools — never returns free text:
- `search_mls` — any message with a city, price, beds, features, or follow-up refinement
- `answer_user` — pure greetings, questions about already-shown listings, general advice

## Memory Architecture
- **Redis BuyerProfile** — structured fields: budgetMin/Max, bedroomsMin, bathroomsMin, preferredLocations, mustHaves, dealBreakers, propertyTypes. Updated after every response via Groq tool call (anyOf null schema).
- **Redis History** — last 40 messages, 30-day TTL. Last 8 passed to Groq (trimmed), last 20 to Sonnet.
- **Supermemory** — behavioral/semantic memory. Writes every interaction. Reads race against Groq (2s timeout). containerTag = userId.

## SSE Event Types
```
{ type: "listings", data: MLSListing[] }   — emitted immediately after MLS returns
{ type: "token", text: string }            — streaming summary tokens
{ type: "done" }                           — stream complete
{ type: "error", message: string }         — error
```

## MLS Base Payload
```json
{ "active": true, "has_photos": true, "status": "Active", "sold": false, "include_photos": true, "size": 6 }
```
Post-fetch filters: lease/rental stripped, duplicates deduplicated by address.

## Known Issues / Pending
- Sonnet summary still takes 8-11s (total 11-16s) — switch to Groq for summary is the fix
- No rate limiting on the API route
- userId comes from localStorage — not tied to Cognito auth yet
- No fallback if Groq goes down

## Deployment
- Personal GitHub: `https://github.com/EricSamuelFernando/aisearch-overhaul.git`
- Remote name: `personal`, branch: `overhaul`
- Vercel project: `aisearch-overhaul.vercel.app`
- Push to deploy: `git push personal overhaul:main`

## Required Env Vars
```
ANTHROPIC_API_KEY
GROQ_API_KEY
REAPI_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SUPERMEMORY_API_KEY
NEXT_PUBLIC_* (Cognito, Google, Maps, etc.)
```

## Run Locally
```bash
npm run build && npm run start
# visits http://localhost:3000
# AI assistant at /ai-assistant or embedded in landing hero
```
