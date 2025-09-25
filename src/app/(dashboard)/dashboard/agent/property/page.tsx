'use client';

import { agentListingTabs } from '@/utils/data';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AgentOffers } from '@/components/dashboard/agent/agent-offers';
import AgentDocument from '@/components/dashboard/agent/agent-documents';
import TabSwitch from '@/components/dashboard/main/tab-switch';

export type TabQuery =
  | 'documents'
  | 'offers'
  | 'views'
  | 'messages'
  | 'settings';
const Page = () => {
  const searchParams = useSearchParams();
  const search = (searchParams?.get('tab') || 'documents') as TabQuery;
  const renderTabPanel = (tabValue: TabQuery) => {
    switch (tabValue) {
      case 'offers':
        return <AgentOffers />;
      case 'messages':
        return 'messages';
      case 'settings':
        return 'settings';
      // case 'views':
      //   return <AgentOffersDetail />;
      default:
      case 'documents':
        return <AgentDocument />;
    }
  };
  return (
    <section className='px-[3.219rem]'>
      <TabSwitch
        className='border-grey-400 py-0'
        tabs={agentListingTabs}
        tabClass='text-grey-710 bg-ocGray flex  items-center'
        activeTabClass='py-6'
        backButton={
          <Link
            href='/dashboard/agent'
            className='flex cursor-pointer items-center gap-x-2'
          >
            <ArrowLeft />
            <span>My Listings</span>
          </Link>
        }
      />

      <section className='min-h-[350px]'>{renderTabPanel(search)}</section>
    </section>
  );
};

export default Page;
