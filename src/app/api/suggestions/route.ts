import { NextRequest, NextResponse } from 'next/server';
import { loadProfile, loadHistory, loadConversationIndex } from '@/lib/ai-assistant/memory';
import { getUserMemoryContext } from '@/lib/ai-assistant/supermemory';
import { getRedis } from '@/lib/ai-assistant/db';
import { anthropic } from '@/lib/ai-assistant/claude';
import type { AIAssistantMessage } from '@/types/ai-assistant';

const SUGGESTIONS_TTL = 60 * 10; // 10 minutes
const SUGGESTIONS_VERSION = 'v2'; // bump to bust all cached suggestions

function suggestionsKey(userId: string, locSlug: string) {
  return `suggestions:${SUGGESTIONS_VERSION}:${userId}:${locSlug}`;
}

function buildLocSlug(location: { city?: string; state?: string; countryCode?: string } | null): string {
  if (!location) return 'generic';
  const isUS = location.countryCode === 'US';
  if (!isUS || !location.city) return 'generic';
  return `${location.city}-${location.state || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const GENERIC_FALLBACKS = [
  '3 bed homes under $600k near good schools',
  'How much house can I afford on $10k/month?',
  'Best cities for first-time home buyers',
  'Compare mortgage rates and monthly payments',
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
    const cached = await redis.get<string[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
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
Generate exactly 4 short, specific, natural-language search suggestions for the search bar.

Rules:
1. Each suggestion must be under 65 characters
2. Sound like real typed queries (conversational, natural)
3. Mix 4 types: property search, financial question, neighborhood info, lifestyle/comparison
4. If US location is given, reference it in at least 2 of the 4 suggestions
5. If user has preferences (budget, beds, locations), weave them into suggestions
6. If user has recent searches, suggest related follow-up queries
7. Be specific — include numbers, locations, features where possible
8. NEVER repeat or rephrase the same idea twice
9. Return ONLY a raw JSON array of 4 strings. No markdown, no explanation, no extra text.`;

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

    let suggestions: string[] = [];
    try {
      const match = raw.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          suggestions = parsed
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            .map((s) => s.trim())
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
            `Homes for sale in ${geoContext.city}, ${geoContext.state}`,
            `Best neighborhoods in ${geoContext.city} for families`,
            'How much home can I afford on my income?',
            'What are current mortgage rates?',
          ]
        : GENERIC_FALLBACKS;
    }

    // Cache in Redis
    await redis.set(cacheKey, suggestions, { ex: SUGGESTIONS_TTL });

    return NextResponse.json({ suggestions, cached: false, personalizationLevel });
  } catch (err) {
    console.error('[/api/suggestions] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ suggestions: GENERIC_FALLBACKS, cached: false, error: true });
  }
}
