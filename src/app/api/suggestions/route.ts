import { NextRequest, NextResponse } from 'next/server';
import { loadProfile, loadHistory, loadConversationIndex } from '@/lib/ai-assistant/memory';
import { getUserMemoryContext } from '@/lib/ai-assistant/supermemory';
import { getRedis } from '@/lib/ai-assistant/db';
import { anthropic } from '@/lib/ai-assistant/claude';
import type { AIAssistantMessage } from '@/types/ai-assistant';

const SUGGESTIONS_TTL = 60 * 10; // 10 minutes
const SUGGESTIONS_VERSION = 'v5'; // bump to bust all cached suggestions

export interface Suggestion {
  label: string; // short editorial label shown in pill (≤28 chars)
  query: string; // full search query sent on click
}

function suggestionsKey(userId: string, locSlug: string) {
  return `suggestions:${SUGGESTIONS_VERSION}:${userId}:${locSlug}`;
}

function buildLocSlug(location: { city?: string; state?: string; countryCode?: string } | null): string {
  if (!location) return 'generic';
  const isUS = location.countryCode === 'US';
  if (!isUS || !location.city) return 'generic';
  return `${location.city}-${location.state || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const GENERIC_FALLBACKS: Suggestion[] = [
  { label: 'Homes under $600K',      query: '3 bed homes under $600,000' },
  { label: 'Buy vs. rent?',          query: 'Should I buy or rent right now in this market?' },
  { label: 'Near top schools',       query: 'Homes near top-rated schools' },
  { label: 'Best time to buy?',      query: 'Is now a good time to buy a home?' },
];

export async function POST(req: NextRequest) {
  try {
    const { userId, tempUserId, location } = await req.json() as {
      userId?: string | null;
      tempUserId?: string | null;
      location?: { city?: string; state?: string; country?: string; countryCode?: string } | null;
    };

    const effectiveId = userId || tempUserId || 'anon';
    const isRealUser = !!userId;

    // Only apply geo context for US users
    const isUSLocation = location?.countryCode === 'US';
    const geoContext = isUSLocation && location?.city
      ? { city: location.city, state: location.state || '' }
      : null;

    const locSlug = buildLocSlug(location ? { ...location, countryCode: location.countryCode } : null);
    const cacheKey = suggestionsKey(effectiveId, locSlug);

    // Check Redis cache first
    const redis = getRedis();
    const cached = await redis.get<Suggestion[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0 && typeof cached[0] === 'object') {
      return NextResponse.json({ suggestions: cached, cached: true });
    }

    // Parallel fetch: profile + memory + history
    const [profile, memoryContext, history] = await Promise.all([
      loadProfile(effectiveId).catch(() => null),
      isRealUser
        ? Promise.race([
            getUserMemoryContext(userId!, 'home search preferences real estate'),
            new Promise<string>((resolve) => setTimeout(() => resolve(''), 1200)),
          ])
        : Promise.resolve(''),
      loadConversationIndex(effectiveId, 1).then(async (convs) => {
        if (convs.length === 0) return loadHistory(effectiveId, 3).catch(() => []);
        return loadHistory(effectiveId, 6, convs[0].id).catch(() => []);
      }).catch(() => []),
    ]);

    // Build profile summary
    const profileParts: string[] = [];
    if (profile) {
      if (profile.preferredLocations?.length) {
        profileParts.push(`Preferred locations: ${profile.preferredLocations.slice(0, 3).join(', ')}`);
      }
      if (profile.budgetMax) {
        profileParts.push(`Max budget: $${profile.budgetMax.toLocaleString()}`);
      }
      if (profile.bedroomsMin) {
        profileParts.push(`Min bedrooms: ${profile.bedroomsMin}`);
      }
      if (profile.mustHaves?.length) {
        profileParts.push(`Must-haves: ${profile.mustHaves.slice(0, 3).join(', ')}`);
      }
      if (profile.propertyTypes?.length) {
        profileParts.push(`Property types: ${profile.propertyTypes.join(', ')}`);
      }
      const topCities = Object.entries(profile.topCities || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([city]) => city);
      if (topCities.length) {
        profileParts.push(`Most searched cities: ${topCities.join(', ')}`);
      }
    }

    // Recent user queries from history
    const recentQueries = (history as AIAssistantMessage[])
      .filter((m) => m.role === 'user')
      .slice(-2)
      .map((m) => m.content)
      .filter(Boolean);

    // Build context block
    const contextLines: string[] = [];
    if (geoContext) {
      contextLines.push(`User browser location: ${geoContext.city}, ${geoContext.state} (US)`);
    }
    if (profileParts.length) {
      contextLines.push(`User profile: ${profileParts.join('. ')}`);
    }
    if (memoryContext) {
      contextLines.push(`Behavioral memory:\n${memoryContext.slice(0, 500)}`);
    }
    if (recentQueries.length) {
      contextLines.push(`Recent searches: ${recentQueries.join(' | ')}`);
    }

    const hasPersonalization = profileParts.length > 0 || recentQueries.length > 0 || !!memoryContext;
    const personalizationLevel = isRealUser && hasPersonalization
      ? 'rich'
      : recentQueries.length > 0
      ? 'partial'
      : geoContext
      ? 'geo'
      : 'generic';

    const systemPrompt = `You are a real estate AI assistant for Snaphomz, a US real estate search platform.
Generate exactly 4 search suggestions. Each has a short LABEL and a full QUERY.

Rules for LABEL (shown in a pill button, max 2 lines):
- Max 36 characters. Count every character including spaces.
- Descriptive but concise — user should understand exactly what clicking does.
- Can be 1 line (~18 chars) or 2 lines (~36 chars split naturally at a word boundary.
- Examples: "Homes with pool in Austin" (25), "Buy vs. rent in today's market?" (31), "4-bed homes near top schools" (28), "What can I afford on $9K/mo?" (28)
- NO filler words. NO "I want", "Show me", "Find me".

Rules for QUERY (sent to the AI search on click):
- Full natural-language query, 1-2 sentences max
- Conversational, specific
- Weave in user context (location, budget, preferences) if available

Rules for both:
- Mix 4 types: property search, financial question, neighborhood info, lifestyle/comparison
- If US location is given, reference it in at least 2 suggestions
- NEVER repeat or rephrase the same idea twice

Return ONLY a raw JSON array of 4 objects. No markdown, no explanation.
Format: [{"label":"...","query":"..."},{"label":"...","query":"..."},...]`;

    const userPrompt = contextLines.length > 0
      ? `User context:\n${contextLines.join('\n')}\n\nGenerate 4 personalized suggestions.`
      : 'No user context. Generate 4 good general US real estate search suggestions.';

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      temperature: 0.75,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

    let suggestions: Suggestion[] = [];
    try {
      const match = raw.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          suggestions = parsed
            .filter((s): s is { label: string; query: string } =>
              s && typeof s === 'object' &&
              typeof s.label === 'string' && s.label.trim().length > 0 &&
              typeof s.query === 'string' && s.query.trim().length > 0
            )
            .map((s) => ({
              label: s.label.trim().slice(0, 36), // hard cap — fits 2 lines in pill
              query: s.query.trim(),
            }))
            .slice(0, 4);
        }
      }
    } catch {
      // fall through to fallback
    }

    // Fallback if generation failed or < 4 results
    if (suggestions.length < 4) {
      suggestions = geoContext
        ? [
            { label: `Homes in ${geoContext.city}`,          query: `Homes for sale in ${geoContext.city}, ${geoContext.state}` },
            { label: `Best areas in ${geoContext.city}`,     query: `Best neighborhoods in ${geoContext.city} for families` },
            { label: 'What can I afford?',                   query: 'How much home can I afford on my income?' },
            { label: 'Current mortgage rates',               query: 'What are current mortgage rates?' },
          ]
        : GENERIC_FALLBACKS;
    }

    // Cache in Redis
    await redis.set(cacheKey, suggestions, { ex: SUGGESTIONS_TTL });

    return NextResponse.json({ suggestions, cached: false, personalizationLevel });
  } catch (err) {
    console.error('[/api/suggestions] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ suggestions: GENERIC_FALLBACKS as Suggestion[], cached: false, error: true });
  }
}
