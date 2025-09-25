import React, { useEffect, useLayoutEffect } from 'react';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { Home } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import SellerDashboardNav from './seller-dashboard-nav';
import SellerListing from './seller-listing';
import SellerOverview from './seller-overview';
import FeedsPane from './feeds-pane';
import MessageTab from '../messages/message-tab';
import { useQueryClient } from '@tanstack/react-query';
import ConversationPage from '../conversation';
import SellInventory from '../inventory/page';
type Props = {};

export const ManageRental = (
  <div className='flex cursor-pointer items-center gap-x-2 border-l-[1px] border-l-grey-550 px-8'>
    <Home color='#a3a3a3' />
    Manage Rentals
  </div>
);

function SellerDashboard({}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams?.get('tab') || 'overview';
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
  if (search === 'messages') {
    router.replace('/dashboard/chat'); // Use `replace` if you don't want to keep the current page in history
  }
  
}, [search, router]);

  useEffect(() => {
    if (search === 'listings') {
      queryClient.invalidateQueries({ queryKey: ['fetch-seller-properties'] });
    }
  }, [search, queryClient, router]);

  const renderTabPanel = () => {
    switch (search) {
      case 'overview':
        return <SellerOverview />;
      case 'listings':
        return <SellerListing />;
      case 'feeds':
        return <FeedsPane />;
      case 'inventory':
        return <SellInventory />;
      case 'conversation':
        return null;
      default:
        return <SellerOverview />;
    }
  };

  return (
    <section>
      <SellerDashboardNav />
      <section className='px-[3.219rem] py-8'>{renderTabPanel()}</section>
    </section>
  );
}

export default SellerDashboard;
