'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

import { SummaryCardItem } from '../agent/shared';

// types
import { AgentOfferResponse } from '@/interfaces/property.interface';
import { SellerPropertyOffersInterface } from '@/hooks/interfaces/seller_offer.interface';
import { useDispatch, useSelector } from 'react-redux';
import { setOffer } from '@/slices/property/property-slice';
import { RoundedButton } from '@/components/RoundedButton';
import { userData } from '@/slices/auth/auth.slice';

type TransactionOfferGridViewProps = {
  onCommentClick?: () => void;
  offerFinalization?: (id: string, finalizeType: string) => void;
  propertyOffers: SellerPropertyOffersInterface[]
  isBuyer?:Boolean;
};

function TransactionOfferGridView({
  onCommentClick,
  propertyOffers,
  offerFinalization,
  isBuyer
}: TransactionOfferGridViewProps) {
  const messageCount = 5;
  return (
    <section className='flex gap-8'>
      <aside className='w-full'>
        <div className='grid grid-cols-2 gap-8'>
          {propertyOffers.map((item) => (
            <OfferCard
              isBuyer={isBuyer}
              key={item.id}
              offer={item}
              type='listing'
              offerFinalization={offerFinalization}
              onCommentClick={onCommentClick}
              messageCount={messageCount}
            />
          ))}
        </div>
      </aside>
    </section>
  );
}

export default TransactionOfferGridView;

const OfferCard = ({
  offer,
  type,
  isBuyer,
  offerFinalization,
  onCommentClick,
  messageCount,
}: {
  offer: SellerPropertyOffersInterface;
  type: 'listing' | 'buy-leads';
  isBuyer?:Boolean;
  onCommentClick?: () => void;
  offerFinalization?: (id: string, finalizeType: string) => void;
  messageCount: number;
}) => {
  const router = useRouter();
  const  dispatch = useDispatch()
  const  searchParams = useSearchParams()
  const tab = searchParams?.get('tab')

  const currentUser = useSelector(userData);
  const handleClick = () => {
    dispatch(setOffer(offer))
    router.push(`/dashboard/seller/offer/view?id=${offer.id}&type=${tab}`);
  };
  
  return (
    <div className='w-full rounded-b-2xl bg-[#f8f8f8]'>
      <div className='w-full rounded-2xl bg-ocOrange p-4'>
        <div className='grid grid-cols-2 items-center justify-between'>
          <div className='col-span-1'>
            <span className='inline-block rounded-full bg-[#ffb576] px-3 text-base font-semibold text-black'>
              New
            </span>
          </div>
          <div className='col-span-1 flex justify-end gap-x-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#d16f3e]'>
              <Heart className='text-white' fill='white' />
            </div>
            <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-[#d16f3e]'>
              <button onClick={onCommentClick} className='relative'>
                <MessageCircle className='text-white' fill='white' />
                {1 > 0 && (
                  <span className='absolute inset-0 flex items-center justify-center text-sm font-bold text-black'>
                    {2}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-x-4 py-3'>
          {
             offer?.createdBy?.profile ?
             <Image
             alt='profile'
             height={80}
             width={80}
             className='rounded-full object-cover object-center'
             src={offer?.createdBy?.profile ||'/assets/images/Mask Group 43.png'}
             unoptimized
           />
           :
           <div className='bg-black text-whte w-24 h-24 rounded-full'>
           {offer?.createdBy?.firstName[0]} {offer?.createdBy?.lastName[0] } 
            </div>
          }
         
          <div>
            <h2 className='text-lg font-bold'>{offer?.createdBy?.firstName} {offer?.createdBy?.lastName}</h2>
            <p className='email my-1 text-sm font-light text-white'>
              {offer?.createdBy?.email}
            </p>
            <p className='mobile text-sm text-white'>
              Mobile: {offer?.createdBy?.phone}
            </p>
          </div>
        </div>
      </div>

      <div className='pb-6'>
        <div className='mb-3 grid grid-cols-2 gap-4 p-4'>
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Offer Price</span>}
            description={
              <span className='text-lg font-bold'>
                {formatCurrency(
                  +offer?.price,
                  "$",
                )}
              </span>
            }
          />
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Finance Type</span>}
            description={
              <span className='text-lg font-bold'>
                {offer?.financeType.toUpperCase()}
              </span>
            }
          />
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Down Payment</span>}
            description={
              <span className='text-base'>
                {formatCurrency(
                  +offer?.downPayment,
                  "$",
                )}
              </span>
            }
          />
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Loan Amount</span>}
            description={
              <span className='text-base'>
                {formatCurrency(
                  +offer?.cashAmount,
                  "$",
                )}
              </span>
            }
          />
        </div>

        <div className="flex flex-row flex-wrap gap-x-4 px-4">
          {(offer?.createdBy?.id !== currentUser?.id && (!offer?.isBuyer && isBuyer)) && (
            <Button
              className="rounded-full border border-black bg-orange-400 p-4 px-8 text-white"
              onClick={() => offerFinalization?.(offer?.id, 'FINALIZED')}
            >
              Finalize Offer
            </Button>
          )}

          <Button
            className="rounded-full border border-black bg-black p-4 px-8 text-white"
            onClick={handleClick}
          >
            View Offer
          </Button>
        </div>

      </div>
    </div>
  );
};
