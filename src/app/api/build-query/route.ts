import { NextRequest, NextResponse } from 'next/server';
import { loadProfile } from '@/lib/ai-assistant/memory';
import { anthropic } from '@/lib/ai-assistant/claude';

export async function POST(req: NextRequest) {
  try {
    const { filterLabels, location, userId, tempUserId } = await req.json() as {
      filterLabels: string[];
      location: { city?: string; state?: string; countryCode?: string } | null;
      userId?: string | null;
      tempUserId?: string | null;
    };

    if (!filterLabels || filterLabels.length === 0) {
      return NextResponse.json({ query: '' });
    }

    const effectiveId = userId || tempUserId || 'anon';
    const isRealUser = !!userId;

    // Load profile for personalization (only for authenticated users)
    const profile = isRealUser
      ? await loadProfile(effectiveId).catch(() => null)
      : null;

    // Location string
    const isUS = location?.countryCode === 'US';
    const locationStr = isUS && location?.city
      ? `${location.city}${location.state ? `, ${location.state}` : ''}`
      : null;

    // Build context lines from profile
    const contextLines: string[] = [];
    if (locationStr) contextLines.push(`Location: ${locationStr}`);
    if (profile?.budgetMin != null && profile?.budgetMax != null) {
      contextLines.push(`Budget: $${profile.budgetMin.toLocaleString()}–$${profile.budgetMax.toLocaleString()}`);
    } else if (profile?.budgetMax != null) {
      contextLines.push(`Budget: up to $${profile.budgetMax.toLocaleString()}`);
    } else if (profile?.budgetMin != null) {
      contextLines.push(`Budget: from $${profile.budgetMin.toLocaleString()}`);
    }

    const systemPrompt = `You generate a single real estate search query from selected filters.
Return ONLY the query string — no quotes, no markdown, no explanation.
Make it natural, specific, and include location if provided.
Use budget context only if it naturally fits.
Examples:
- "Show me 3 bed homes in Austin, TX"
- "3 bed single family homes with pool in Dallas under $700K"
- "Condos with home office in San Francisco"`;

    const userPrompt = `Filters: ${filterLabels.join(', ')}
${contextLines.length > 0 ? `Context: ${contextLines.join(' | ')}` : 'No user context'}
Generate one search query.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const query = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

    return NextResponse.json({ query });
  } catch (err) {
    console.error('[/api/build-query] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ query: '' }, { status: 500 });
  }
}
