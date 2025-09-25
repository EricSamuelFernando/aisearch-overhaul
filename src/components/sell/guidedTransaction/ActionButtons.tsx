import Image from 'next/image';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ActionButtons: React.FC = () => {
  const propertyId = useSearchParams().get('id') || '';

  const router = useRouter();

  const handleBackClick = () => {
    router.push('/dashboard/seller/estimated-cost');
  };

  const handleViewEstimatedCostClick = () => {
    router.push('/dashboard/seller/estimated-cost');
  };

  const handleNavigateToListingProcess = () => {
    router.push(`/dashboard/seller/listing/listingprocess?id=${propertyId}`);
  };

  return (
    <section className='flex w-full items-center justify-between p-16'>
      <section className='flex items-center'>
        <button
          className='mr-4 rounded-full border-2 border-black bg-transparent px-10 py-3 text-sm text-black'
          onClick={handleBackClick}
        >
          Back
        </button>
        <button className='border-0 border-transparent bg-transparent px-4 py-5 text-sm font-bold text-ocOrange'>
          Cancel
        </button>
      </section>
      <section className='flex items-center justify-between p-16'>
        <section className='flex items-center'>
          <button
            className='border-0 border-transparent bg-transparent px-4 py-5 text-sm font-bold text-ocOrange'
            onClick={handleViewEstimatedCostClick}
          >
            View estimated cost
          </button>
          <Image
            src={'/assets/icons/infoIcon.svg'}
            alt='Information'
            height={16}
            width={16}
            className='mr-8 object-contain object-center'
          />
        </section>
        <section className='flex items-center'>
          <button
            className='mr-4 rounded-full border-2 border-black bg-black px-8 py-3 text-sm text-white'
            onClick={handleNavigateToListingProcess}
          >
            Accept & Proceed
          </button>
        </section>
      </section>
    </section>
  );
};

export default ActionButtons;
