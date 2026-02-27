'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import Conversation from './conversation';
import Disclosure from './disclosure';
import Showings from './showings';
import AllDocument from '@/components/property/manage/all-document';
import SharedDocument from '@/components/property/manage/shared-document';
import { FolderIcon, LockIcon } from '@public/assets/icons';
import { Icons } from '@/components/icons';
import CustomInput from '@/components/customs/input';
import PaymentModal from '@/components/modals/payment-modal/payment-modal';
import { success } from '@/components/alert/notify';
import SummarisationModal from '@/components/modals/SummaryModal';

interface TabProps {
  label: string;
  imageSrc: string;
  setSubTab?: any;
  subTab?: any;
}

const Tab: React.FC<TabProps & { isActive: boolean; onClick: () => void }> = ({
  label,
  imageSrc,
  isActive,
  setSubTab,
  subTab,
  onClick,
}) => {

  return (
    <div
      className={`flex flex-1 cursor-pointer flex-col items-center py-2 sm:py-3 md:py-4 pb-0 text-center ${isActive ? 'bg-ocOrange text-white' : ''
        }`}
      onClick={onClick}
    >
      <Image 
        width={30} 
        height={30} 
        src={`/assets/images/${imageSrc}.svg`} 
        alt={label}
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-[30px] lg:h-[30px]"
      />

      <span className='mb-1 sm:mb-2 text-xs sm:text-sm md:text-base'>{label}</span>


    </div>
  );
};

type ActiveTabType = 'Document' | 'Conversations' | 'Tours';
type SubTabType = 'Shared' | 'All';

export default function PropertyTabs(props: any) {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('Document');
  const [subTab, setSubTab] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  const onSuccess = () => {
    setIsPaymentModalOpen(false)
    success({ message: 'Payment successful!' })
    setTimeout(() => {
      setIsPaymentSuccessful(true);
    }, 500);

  }

  return (
    <div className='flex flex-col overflow-auto h-full'>
      {/* Main Tabs */}
      <div className='flex bg-grey-190 font-bold text-xs sm:text-sm md:text-base'>
        <Tab
          label='Documents'
          imageSrc='disclosure'
          isActive={activeTab === 'Document'}
          onClick={() => setActiveTab('Document')}
          setSubTab={setSubTab}
          subTab={subTab}
        />
        <Tab
          label='Conversations'
          imageSrc='convo'
          isActive={activeTab === 'Conversations'}
          onClick={() => setActiveTab('Conversations')}
        />
        <Tab
          label='Tours'
          imageSrc='tour'
          isActive={activeTab === 'Tours'}
          onClick={() => setActiveTab('Tours')}
        />
      </div>

      {/* Content Area */}
      <div className='h-full w-full flex-1'>
        {activeTab === 'Document' && (
          <div className="flex flex-col h-full">
            {/* Sub-tabs for Disclosure */}
            <div className="flex flex-col sm:flex-row h-max p-2 sm:p-3 md:p-4 items-start sm:items-center justify-between gap-2 sm:gap-4 md:gap-x-8">
              {/* Search Input */}
              <CustomInput
                placeholder="Search Document"
                className="placeholder:text-sm sm:placeholder:text-base"
                labelClass="hidden p-0 m-0"
                leftSection={<Icons.Search className="h-3 w-3 sm:h-4 sm:w-4" />}
                containerClass="w-full sm:w-2/3"
              />

              {/* Summarize Button */}
              <div className="w-full sm:w-1/3 py-1" onClick={() => setIsPaymentModalOpen(true)}>
                <button className="flex w-full sm:w-auto items-center justify-center sm:justify-between gap-x-1 sm:gap-x-2 rounded-2xl sm:rounded-3xl bg-black px-3 sm:px-4 py-2 text-white text-xs sm:text-sm">
                  <span>Summarize</span>
                  <span className="h-4 w-4 sm:h-5 sm:w-5">
                    <Icons.ColoredAi className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </button>
              </div>
            </div>
            <div className='mb-1 flex flex-col sm:flex-row border-b gap-2 border-gray-200 p-2 pt-0'>
              <button
                onClick={() => setSubTab('All')}
                className={`flex flex-col gap-1 py-2 sm:py-3 px-4 sm:px-6 md:px-8 border rounded-lg hover:bg-grey-190 text-center ${subTab === 'All' ? 'border-ocOrange ' : ''
                  }`}
              //className=''
              >
                {/* <Image
                  alt={'folder'}
                  src={FolderIcon}
                  width={36}
                  height={36}
                  className='object-contain object-center'
                /> */}
                <p className='text-xs sm:text-sm font-bold'> All </p>
              </button>
              <button
                onClick={() => setSubTab('Shared')}
                className={`flex flex-col gap-1 py-2 sm:py-3 px-4 sm:px-6 md:px-8 border rounded-lg hover:bg-grey-190 text-center ${subTab === 'Shared' ? 'border-ocOrange ' : ''
                  }`}
              >
                {/* <Image
                  alt={'folder'}
                  src={FolderIcon}
                  width={36}
                  height={36}
                  className='object-contain object-center'
                /> */}
                <p className='text-xs sm:text-sm font-bold'>Shared</p>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              {!subTab && (
                <div className="flex justify-center items-center h-32 sm:h-40 text-grey-500 text-base sm:text-lg font-medium px-4">
                  No folder selected
                </div>
              )}

              {subTab === 'All' && <AllDocument
                handleEditDocument={props.handleEditDocument}
              />}
              {subTab === 'Shared' && <SharedDocument
                handleEditDocument={props.handleEditDocument}
              />}
            </div>
          </div>
        )}

        {isPaymentModalOpen && (
          <PaymentModal
            onClose={() => setIsPaymentModalOpen(false)}
            onProceed={() => console.log('Paid')}
            title="Unlock AI Summary"
            subTitle='Your Shortcut to Clarity'
            icon={LockIcon}
            onSuccess={onSuccess}
            amount={25}
          />
        )}


        {
          isPaymentSuccessful && (<SummarisationModal />)

        }

        {activeTab === 'Conversations' && (
          <div className='flex h-[inherit] flex-col items-center justify-center p-4 sm:p-6'>
            <div className='relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48'>
              <Image
                src='/assets/images/feeds.svg'
                className='object-contain object-center'
                fill
                alt='empty-feed'
              />
            </div>
            <p className='py-1 text-sm sm:text-base text-grey-450 text-center'>No conversations yet with Seller Agent</p>
            <p className='py-2 text-lg sm:text-xl md:text-2xl font-[500] text-center'>Stay Informed!</p>
          </div>
        )}

        {activeTab === 'Tours' && <Showings />}
      </div>
    </div>
  );
}
