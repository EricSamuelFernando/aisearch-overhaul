'use client';

import React, { useState } from 'react';
import SettingsTour from '@/app/(dashboard)/dashboard/seller/settings-tour/page';
import TransactionSidebar from './transaction-sidebar';
import Templates from './template';
import { useSelector } from 'react-redux';
import { TransactionPropertyCard } from './transaction-property-card';
import ToursList from './tours-list';

const TABS = ['Templates', 'Schedule', 'Engagements'];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Templates');
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);

  const renderContent = () => {
    switch (activeTab) {
      case 'Templates':
        return <Templates />;
      case 'Schedule':
        return <SettingsTour />;
      case 'Engagements':
        return <div className='px-8 py-4 text-gray-700 text-base'>Engagements Content</div>;
      default:
        return null;
    }
  };

  return (
    <div className='mx-auto flex w-full max-w-7xl gap-8 px-4 py-8'>
      <div className='flex-1'>
        {/* Tabs */}
        <div className='flex space-x-6 border-b border-gray-200'>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`pb-2 text-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-gray-600 hover:text-orange-400'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className='mt-6'>
          {renderContent()}
        </div>
      </div>

      {/* Sidebar */}
      <aside className='hidden w-1/3 lg:block'>
      <TransactionPropertyCard
                  imageSource={claimedProperty?.image}
                  address={claimedProperty?.address}
                  moreAddressDetails={claimedProperty?.name}
                  
                />
                <div className='my-6'>
                  <ToursList />
                </div>
      </aside>
    </div>
  );
};

export default Settings;
