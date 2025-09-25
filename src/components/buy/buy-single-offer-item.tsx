import Image from 'next/image';
import React from 'react';

type PropsType = {
  isNew: boolean;
  clientImageUrl: string;
  clientName: string;
  clientEmail: string;
  clientMobileNumber: string;
  offerAmount: string;
  offerType: string;
  downPaymentAmount: string;
  loanAmount: string;
  onViewOffer: () => void;
  onRespondToOffer: () => void;
  onAddToFavorites: () => void;
  onChat: () => void;
};

const SingleOfferItem = ({
  isNew,
  clientImageUrl,
  clientName,
  clientEmail,
  clientMobileNumber,
  offerAmount,
  offerType,
  downPaymentAmount,
  loanAmount,
  onViewOffer,
  onRespondToOffer,
}: PropsType) => {
  return (
    <section className='bg-grey-60 h-294 w-64 overflow-hidden rounded-[10px]'>
      <section className='h-120 rounded-b-[10px] bg-ocOrange pl-18.5 pr-9'>
        <div className='pt-12.5' />
        <section className='flex items-start justify-between'>
          {isNew ? (
            <div className='h-3.5 w-35.5 items-center justify-center rounded-[7px] bg-ocLightOrange'>
              <p className='text-center text-xsm font-bold text-black'>New</p>
            </div>
          ) : null}
          <section className='flex justify-center'>
            <section className='h-30 w-30 items-center justify-center rounded-full bg-terracotta'></section>
            <div className='w-1' />
            <section className='h-30 w-30 items-center justify-center rounded-full bg-terracotta'></section>
          </section>
        </section>

        <section className='mt-6.5 flex'>
          <Image
            className='mr-17.5 h-48.5 w-48.5 overflow-hidden rounded-full'
            objectFit='contain'
            src={clientImageUrl}
            alt={clientName}
          />

          <section className=''>
            <h3 className='text-sm font-bold'>{clientName}</h3>
            <h3 className='text-10 text-white'>{clientEmail}</h3>
            <h3 className='text-10 font-medium text-white'>
              Mobile: `${clientMobileNumber}`
            </h3>
          </section>
        </section>
      </section>
      <div className='pl-18.5'>
        <div className='pt-18.5' />
        <section className='flex items-start'>
          <div>
            <p className='text-capitalize text-10 text-grey-70'>Offer Price</p>
            <p className='text-capitalize text-17 font-bold text-black'>
              {offerAmount}
            </p>
          </div>
          <div className='w-[33px]' />
          <div>
            <p className='text-capitalize text-10 text-grey-70'>Finance Type</p>
            <p className='text-uppercase mt-[0.344rem] text-xs font-bold text-black'>
              {offerType}
            </p>
          </div>
        </section>
        <div className='h-3.5' />
        <section className='flex items-start'>
          <div>
            <p className='text-capitalize text-10 text-grey-70'>Down Payment</p>
            <p className='text-capitalize text-xs font-medium text-black'>
              {downPaymentAmount}
            </p>
          </div>
          <div className='w-[33px]' />
          <div>
            <p className='text-capitalize text-10 text-grey-70'>Loan Amount</p>
            <p className='text-uppercase text-xs font-medium text-black'>
              {loanAmount}
            </p>
          </div>
        </section>
        <div className='h-19.5' />
        <section className='flex items-start'>
          <button
            onClick={onViewOffer}
            className='h-25 w-91 items-center justify-center overflow-hidden rounded-2xl bg-black text-10 text-white'
          >
            View Offer
          </button>
          <div className='w-[15px]' />
          <button
            onClick={onRespondToOffer}
            className='h-25 w-[6.625rem] items-center justify-center overflow-hidden rounded-2xl border border-solid border-black bg-white text-10 text-black'
          >
            Respond to Offer
          </button>
        </section>
      </div>
    </section>
  );
};

export default SingleOfferItem;
