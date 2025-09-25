'use client';

import { useEffect, useState } from 'react';
import { CustomInput } from '@/components/customs/input';
import { Grid2X2, Menu } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import TransactionOfferListView from '@/components/dashboard/main/transaction-single-offer';
import TransactionOfferGridView from '@/components/dashboard/main/transaction-all-offer';
import {
  TransactionPropertyCard,
  TransactionPropertyCardButtons,
} from '@/components/dashboard/main/transaction-property-card';
import ToursList from '@/components/dashboard/main/tours-list';
import Divider from '@/components/divider';
import AddComment from '@/components/dashboard/main/add-comment';
import { useSelector } from 'react-redux';
import { SellerAPIs } from '@/hooks/api/seller';
import { SellerPropertyOffersInterface } from '@/hooks/interfaces/seller_offer.interface';
import { error } from '@/components/alert/notify';
import { useGetPropertyOffersByProperty } from '@/hooks/api/agent/useAgentProperty';

const TransactionOffers = (props:any) => {
  const [view, setView] = useState('grid');
  const [showAddComment, setShowAddComment] = useState(false);
  const claimedProperty = useSelector((state: any) => state?.property?.claimProperty);
  const params = useSearchParams();
  const id = params?.get('id');
  const {
    getClaimedPropertyOffersAPI,
  } = SellerAPIs();
  const { data: propertyOffers, isLoading: offerLoading, error } = useGetPropertyOffersByProperty(claimedProperty?.id?.toString(), claimedProperty?.listingid?.toString());
  const handleCommentClick = () => {
    setShowAddComment(!showAddComment);
  };
  
  return (
    <section>
      <aside className='mt-6 grid grid-cols-9 gap-x-2'>
        <div
          className={`col-span-${view === 'grid' ? '6' : '9'
            } mt-4 flex flex-col justify-between px-8`}
        >
          <div className='flex w-full items-start gap-x-4'>
            <div className='flex flex-grow gap-x-2'>
              <CustomInput
                leftSection={
                  <Image
                    src='/assets/icons/search-p.svg'
                    alt='Search'
                    height={22}
                    width={22}
                  />
                }
                placeholder='Search File'
                className='rounded-xl md:w-[36.688rem]'
              />
            </div>

            <div className='ml-4 flex flex-shrink-0 items-center gap-x-4'>
              <Grid2X2
                onClick={() => setView('grid')}
                className='cursor-pointer text-gray-700'
                size={28}
              />
              <Menu
                onClick={() => setView('list')}
                className='cursor-pointer text-gray-700'
                size={28}
              />
            </div>

            {view === 'list' && (
              <div className='ml-6 mt-[-1.125rem] w-1/3 flex-shrink-0'>
                <TransactionPropertyCard />
              </div>
            )}
          </div>

          {offerLoading ? (
            <div className="text-center text-gray-500 font-medium">Loading offers...</div>
          ) : error ? (
            <div className="text-center text-red-500 font-medium">Failed to load offers.</div>
          ) : !propertyOffers || propertyOffers.length === 0 ? (
            <div className="text-center text-gray-500 font-medium">
              No offers available in this property.
            </div>
          ) : view === 'grid' ? (
            <TransactionOfferGridView
              propertyOffers={propertyOffers}
              onCommentClick={handleCommentClick}
              isBuyer={props?.isBuyer}
            />
          ) : (
            <div className="w-full">
              <TransactionOfferListView
                propertyOffers={propertyOffers}
              />
            </div>
          )}


        </div>
        {view === 'grid' && (
          <div className='col-span-3'>
            {showAddComment ? (
              <div className='rounded-lg'>
                <AddComment id={id as string} />
              </div>
            ) : (
              <>
                <TransactionPropertyCard
                  imageSource={claimedProperty?.image}
                  address={claimedProperty?.address}
                  moreAddressDetails={claimedProperty?.name}
                  buttons={<TransactionPropertyCardButtons />}
                />
                <div className='my-6'>
                  <ToursList />
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </section>
  );
};

export default TransactionOffers;
