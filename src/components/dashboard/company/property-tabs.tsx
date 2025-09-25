'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import Disclosure from './disclosure';
import Conversation from './conversation';

interface TabProps {
  label: string;
  imageSrc: string;
}

const Tab: React.FC<TabProps & { isActive: boolean; onClick: () => void }> = ({
  label,
  imageSrc,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={`flex flex-1 cursor-pointer flex-col  items-center justify-between py-4 text-center ${
        isActive ? 'bg-ocOrange' : ''
      }`}
      onClick={onClick}
    >
      <Image
        width={30}
        height={30}
        src={`/assets/images/${imageSrc}.svg`}
        objectFit='contain'
        alt='Agent'
      />
      <span>{label}</span>
    </div>
  );
};

type ActiveTabType = 'Disclosure' | 'Conversations' | 'Services';
export function PropertyTabs() {
  const [activeTab, setActiveTab] = useState<ActiveTabType | null>(
    'Disclosure',
  );

  const handleTabClick = (label: ActiveTabType) => {
    setActiveTab(label);
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex bg-grey-190 font-bold'>
        <Tab
          label='Disclosure'
          imageSrc='disclosure'
          isActive={activeTab === 'Disclosure'}
          onClick={() => handleTabClick('Disclosure')}
        />
        <Tab
          label='Conversations'
          imageSrc='convo'
          isActive={activeTab === 'Conversations'}
          onClick={() => handleTabClick('Conversations')}
        />
        <Tab
          label='Services'
          imageSrc='tour'
          isActive={activeTab === 'Services'}
          onClick={() => handleTabClick('Services')}
        />
      </div>

      <div className='h-full flex-auto py-5'>
        {activeTab === 'Disclosure' ? <Disclosure /> : null}

        {activeTab === 'Conversations' ? (
          <div className='m-6 bg-grey-690'>
            <p className='pb-4 text-center text-sm text-grey-230'>Today</p>
            <Conversation />
            <Conversation />
          </div>
        ) : null}

        {activeTab === 'Services' ? (
          <div>
            <h3>Services</h3>
          </div>
        ) : null}
      </div>
    </div>
  );
}
