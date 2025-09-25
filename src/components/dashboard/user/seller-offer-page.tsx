'use client';

import AgentGridView from '@/components/dashboard/main/transaction-all-offer';
import AgentListView from '@/components/dashboard/main/transaction-single-offer';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';

export const SellerOfferPageContent = () => {
  const { view } = useAgentCreatePropertyContext();

  return (
    <section>
      {view === 'list' ? <AgentListView /> : null}
      {view === 'grid' ? <AgentGridView 
      propertyOffers={[]}
      /> : null}
    </section>
  );
};
