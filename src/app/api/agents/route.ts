import { NextResponse } from 'next/server';
import { getAgentsFromCSV, searchAgents } from '@/lib/load-agents';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;
  const safeLimit = Number.isFinite(limit as number) ? (limit as number) : undefined;

  const agents = query
    ? await searchAgents(query, { limit: safeLimit })
    : await getAgentsFromCSV({ limit: safeLimit });

  return NextResponse.json(agents);
}
