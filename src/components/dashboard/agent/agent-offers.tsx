'use client';

import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';
import AgentGridView from './agent-grid-view';
import AgentListView from './agent-list-view';

export const AgentOffers = () => {
  const { view } = useAgentCreatePropertyContext();
  return (
    <section>
      {view === 'list' ? <AgentListView /> : null}
      {view === 'grid' ? <AgentGridView /> : null}
    </section>
  );
};
