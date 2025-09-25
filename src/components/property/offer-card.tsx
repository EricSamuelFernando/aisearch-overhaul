import React from 'react';
import { HeadingLevelTwo } from '../heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { useAuth } from '@/shared/hooks/useAuth';
import { Badge } from '../ui/badge';
import { Router } from 'next/router';
import { useParams, useRouter } from 'next/navigation';
import { set } from 'lodash';
import { setOffer } from '@/slices/property/property-slice';
import { userData } from '@/slices/auth/auth.slice';
import Image from 'next/image';

type Props = {
  isCounterOffer?: boolean;

};
export function OfferCard({ isCounterOffer = true, expiryDate, price,
  key,
  offerId,
  financeType,
  downPayment,
  cashAmount,
  status,
  user,
  offerStatusHandler,
  createdAt,
  isShowFinalize,
  offerFinalization,
  offer
}: any) {
  const loggedInUser = useAuth()
  const EXPIRY_DATE = new Date(expiryDate);
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(userData)
  const propertyId = params?.propertyId

  const handlePreview = () => {
    dispatch(setOffer(offer))
    router.push(`/dashboard/buyer/property/${propertyId}/offer/preview`)
  }

  return (
    <aside className='h-max w-full max-w-[24rem] rounded-[1.25rem] bg-[#F8F8F8] pb-8'>
      <div className='flex h-[10rem] w-full items-center gap-x-[1rem] rounded-[1.25rem] bg-ocOrange px-[1.7rem]'>

        <div className='flex h-[4.5rem] w-[4.5rem] uppercase items-center justify-center rounded-full bg-black text-2xl text-white'>
          {user?.profile ? <>
            <Image
              alt='profile'
              height={80}
              width={80}
              unoptimized
              className='rounded-full object-cover object-center'
              src={user?.profile || '/assets/images/Mask Group 43.png'}
            />
          </> :
            <h3>{`${user?.firstName[0] + user?.lastName[0]}` || `RS`}</h3>}
        </div>

        <div className=' text-white'>

          <HeadingLevelTwo className='text-2xl text-black'>
            {`${user?.firstName?.charAt(0).toUpperCase() + user?.firstName?.slice(1)} ${user?.lastName?.charAt(0).toUpperCase() + user?.lastName?.slice(1)}` || `Robin Scherbatsky`}
          </HeadingLevelTwo>
          <p className='font-normal text-md text-[#FFE4BE]'>{`Expire: Dec 20, 2023`}</p>
          <p className='font-semibold text-md'>Expiry- {`Expire: Dec 20, 2023`}</p>
          {offer?.isBuyer ? <p className='font-semibold text-sm'>This offer is finalized</p> : null}
        </div>
      </div>

      <div className="px-6 py-4">
        <Badge
          className={`
      ${status === 'PENDING' ? 'bg-orange-500' : ''}
      ${status === 'ACCEPTED' ? 'bg-green-500' : ''}
      ${status === 'REJECTED' ? 'bg-red-500' : ''}
    `}
        >
          {status}
        </Badge>
      </div>
      <section className='grid grid-cols-2  text-lg items-start gap-4 px-6  py-8 pt-0'>
        <div className='col-span-1 flex flex-col justify-between'>
          <p className='text-capitalize text-grey-70'>Offer Price</p>
          <p className='text-capitalize my-0 p-0 text-xl font-bold leading-6 text-black'>
            {(price || 30000).toLocaleString('en-US')}
          </p>
        </div>

        <div className='col-span-1  flex h-full flex-col justify-between'>
          <p className='text-capitalize text-grey-70'>Finance Type</p>
          <p className='text-capitalize text-base font-bold text-black'>{financeType || `Cash`}</p>
        </div>
        <div className='col-span-1  flex h-full flex-col justify-between'>
          <p className='text-capitalize text-grey-70'>Down Payment</p>
          <p className='text-capitalize text-base font-bold text-black'>{(downPayment || 0).toLocaleString('en-US') || `CASH`}</p>
        </div>{' '}
        <div className='col-span-1  flex h-full flex-col justify-between'>
          <p className='text-capitalize text-grey-70'>Cash Amount</p>
          <p className='text-capitalize text-base font-bold text-black'>{(cashAmount || 0).toLocaleString('en-US')}</p>
        </div>
      </section>

     {
         
      status != 'INACTIVE' &&
      <div
        className={cn(
          'itens-center  flex flex-wrap gap-2  gap-x-1 px-3',
          isCounterOffer ? 'justify-between' : 'justify-between',
        )}
      >
        {/* {status != 'PENDING' ? 
        (  
        <Button disabled variant='outline' roundness='full' className='  px-5' onClick={() => offerStatusHandler(key , 'DECLINED' )}>
           {status}
          </Button>
        ) :null } */}
        {isCounterOffer && (status == 'PENDING' && offer?.isBuyer) ? (
          <Button variant='outline' roundness='full' className=' w-full  px-5' onClick={() => offerStatusHandler(offerId, 'DECLINED')}>
            Reject Offer
          </Button>
        ) : null}

        {
          isCounterOffer && (status == 'PENDING' && offer?.isBuyer) ? (
            <Button roundness='full' className=' w-full px-5' onClick={() => offerStatusHandler(offerId, 'ACCEPTED')} >
              Accept Offer
            </Button>
          ) : null}


        <div className="flex flex-row flex-wrap gap-2 px-4">
          {(offer?.createdBy?.id !== currentUser?.id && !offer?.isBuyer) && (
            <Button
              className="rounded-full  bg-orange-500 hove:bg-orange-600  p-4 px-8 text-white"
              onClick={() => {
                offerFinalization?.(offer?.id, 'FINALIZED')
              }}
            >
              Finalize Offer
            </Button>
          )}

          {status === "ACCEPTED" && (
            <Button
              className="rounded-full border border-black bg-transparent hover:border- orange-600 hover:bg-orange-600 hover:text-white p-4 px-8 text-black"
              onClick={() => {
                window.open("https://www.zipformplus.com/")
              }}
            >
              Sign Document
            </Button>
          )}

          <Button
            className="rounded-full border border-black bg-black p-4 px-8 text-white"
            onClick={handlePreview}
          >
            View Offer
          </Button>
        </div>
      </div>
    }
    </aside>
  );
}
