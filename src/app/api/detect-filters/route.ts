import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai-assistant/claude';
import { FILTER_GROUPS } from '@/lib/filter-data';

// Build the filter catalogue once at module load
const FILTER_CATALOGUE = FILTER_GROUPS
  .flatMap((g) => g.filters)
  .map((f) => `${f.id}: ${f.label}`)
  .join('\n');

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json() as { text: string };
    if (!text?.trim()) return NextResponse.json({ filterIds: [] });

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      temperature: 0,
      system: `You identify which real estate filter IDs are mentioned or semantically implied in a search query.
Available filters (id: label):
${FILTER_CATALOGUE}

Rules:
- Understand synonyms and variations (e.g. "single-family", "SFH", "detached house" → singlefamily)
- Understand number formats (e.g. "4 bedrooms", "4BR", "at least 4 beds" → 4bed)
- Return ONLY a JSON array of matching filter IDs. Empty array [] if none match.
- No explanation, no markdown — raw JSON array only.`,
      messages: [{ role: 'user', content: text }],
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '[]';
    const match = raw.match(/\[[\s\S]*?\]/);
    const filterIds: string[] = match ? JSON.parse(match[0]) : [];

    // Validate: only return IDs that actually exist
    const validIds = new Set(FILTER_GROUPS.flatMap((g) => g.filters).map((f) => f.id));
    const safe = filterIds.filter((id) => validIds.has(id));

    return NextResponse.json({ filterIds: safe });
  } catch (err) {
    console.error('[/api/detect-filters] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ filterIds: [] });
  }
}
