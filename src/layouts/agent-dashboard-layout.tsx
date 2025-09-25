'use client';

import { Home } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';

import AgentDashboardNav from '@/components/dashboard/agent/agent-dashboard-nav';
import { AgentSellerPropertiesProvider } from '@/providers/agent-seller-provider';
import { AGENT_BUYER_PROPERTY, AGENT_SELLER_PROPERTY } from '@/utils/apis';
import BuyLead from '@/app/(dashboard)/dashboard/agent/buy-leads';
import SellersListings from '@/components/dashboard/agent/listings';

export const ManageRental = (
  <div className='flex cursor-pointer items-center gap-x-2 border-l-[1px] border-l-grey-550 px-8'>
    <Home color='#a3a3a3' />
    Manage Rentals
  </div>
);

function AgentDashboardLayout() {
  const searchParams = useSearchParams();
  const search = searchParams?.get('tab') || 'listing';

  useEffect(() => {
    storeCookie({ key: USER_ROLE, value: 'agent' });
  }, []);

  const renderTabPanel = (tabValue: string) => {
    switch (tabValue) {
      case 'feeds':
        return 'Feeds';
      case 'messages':
        return 'Messages';
      case 'buy-leads':
        return (
          <AgentSellerPropertiesProvider
            url={AGENT_BUYER_PROPERTY}
            type='agent-buyer-properties'
          >
            <BuyLead />
          </AgentSellerPropertiesProvider>
        );
      default:
      case 'listing':
        return (
          <AgentSellerPropertiesProvider
            url={AGENT_SELLER_PROPERTY}
            type='agent-seller-properties'
          >
            <SellersListings />
          </AgentSellerPropertiesProvider>
        );
    }
  };

  return (
    <section className='px-[3.219rem]'>
      <AgentDashboardNav />
      <section className='min-h-[350px] py-8'>{renderTabPanel(search)}</section>
    </section>
  );
}

export { AgentDashboardLayout };
