import { NextResponse } from 'next/server';
import { getAgentById } from '@/lib/load-agents';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const agent = await getAgentById(id);

  if (!agent) {
    return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json(agent);
}
