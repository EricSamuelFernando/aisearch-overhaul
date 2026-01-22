import { NextResponse } from 'next/server';
import { getAgentsFromCSV, searchAgents } from '@/lib/load-agents';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const agents = query ? await searchAgents(query) : await getAgentsFromCSV();

  return NextResponse.json(agents);
}
