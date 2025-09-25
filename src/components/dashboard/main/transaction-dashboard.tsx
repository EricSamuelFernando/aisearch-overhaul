'use client';

import DocumentsList from '@/components/dashboard/agent/documents';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { transactionsTabs } from '@/utils/data';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Conversation from '../user/conversation';
import TransactionOffers from '@/app/(dashboard)/dashboard/seller/offer/page';
import Settings from './settings';
import TransactionTabSwitch from './transaction-tabSwitch';
import SellerDoc from '@/components/sell/seller-doc';
import TransactionCounterOffers from '@/app/(dashboard)/dashboard/seller/offer/counter-offer';

type Props = {};

function TransactionDashboard({}: Props) {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'Documents';
  const propertyId = searchParams?.get('id') || '';

  useEffect(() => {
    storeCookie({ key: USER_ROLE, value: 'seller' });
  }, []);

  const [tabView, setTabView] = useState(initialTab);

  const handleTabChange = (newTab: string) => {
    setTabView(newTab);
  };

  const renderTabPanel = () => {
    switch (tabView) {
      case 'documents':
        return <SellerDoc propertyId={propertyId} />
      case 'offers':
        return <TransactionOffers isBuyer={false} />;
      case 'counter-offers':
          return <TransactionCounterOffers />;
      case 'conversations':
        return <Conversation />;
      case 'settings':
        return <Settings />;
      default:
        return <SellerDoc propertyId={propertyId} />
    }
  };

  return (
    <section className='mb-8 px-8'>
      <TransactionTabSwitch
        tabs={transactionsTabs}
        tabClass='text-grey-710 bg-ocGray flex items-center py-6 p-4'
        activeTabClass=''
        onChangeTab={handleTabChange}
        defaultKey='documents'
      />

      <section className='min-h-[350px]'>{renderTabPanel()}</section>
    </section>
  );
}

export default TransactionDashboard;
