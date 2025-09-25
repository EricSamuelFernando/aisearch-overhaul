'use client';

import React, { Fragment, ReactNode, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import SharePropertyModal from '@/components/modals/share-property-modal';
import { truncateText } from '@/lib/utils';
import { useSelector } from 'react-redux';
// Commented imports you won't use for dummy
// import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';
// import { useSelector } from 'react-redux';

type PropertyCardType = {
  address?: string;
  imageSource?: string;
  buttons?: ReactNode;
  moreAddressDetails?: string;
};

export const TransactionPropertyCard = ({
  buttons,
  address,
  imageSource,
  moreAddressDetails,
}: PropertyCardType) => {
  const dummyPropertyInfo = {
    formattedAddress: '123 Main St, Springfield, USA',
  };
  const property_info = dummyPropertyInfo;
  const propertyData = useSelector((state:any)=>state?.property?.claimProperty);
  const selectedPropertyData = {
    media:propertyData?.mls_data?.data?.media?.primaryListingImageUrl,
    courtesyOf:propertyData?.mls_data?.data?.courtesyOf,
    completeAddress:`${propertyData?.mls_data?.data?.address?.unparsedAddress},
    ${propertyData?.mls_data?.data?.address?.countyOrParish},
    ${propertyData?.mls_data?.data?.address?.city},
    ${propertyData?.mls_data?.data?.address?.zipCode},
     `
  }

  return (
    <div className='w-full rounded-2xl bg-black px-4 py-6'>
      <div className='flex items-center gap-x-4'>
        <Image
          height={80}
          width={80}
          src={selectedPropertyData?.media || '/assets/images/header-img.jpg'}
          alt='property'
          unoptimized
          className='object-fit rounded-md'
        />
        <div className='ml-4 text-white'>
          <h4 className='text-[1.25rem] font-light'>
            {truncateText(selectedPropertyData?.courtesyOf||"", 60) || '212 1527th Ky Gray,'}
          </h4>
          <h4 className='text-[1rem] font-light'>
            {truncateText(selectedPropertyData?.completeAddress||"", 60) || '212 1527th Ky Gray,'}
          </h4>
        </div>
      </div>
      {buttons ? <Fragment>{buttons}</Fragment> : null}
    </div>
  );
};

export const TransactionPropertyCardButtons = () => {
  const router = useRouter();
  // Dummy propertyId instead of URL search
  const propertyId = 'dummy-property-id';
  const  searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
 
  const propertyData = useSelector((state:any)=>state?.property?.claimProperty);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openSharePropertyModal = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (propertyId) {
      router.push(`/dashboard/seller/listing/edit?id=${propertyId}&type=${tab}`);
    }
  };

  return (
    <div>
      <div className='mx-3 mt-3 border-t border-grey-750' />
      <div className='mt-14 flex gap-x-2'>
        <Button
          roundness='full'
          className='w-full border border-white'
          onClick={openSharePropertyModal}
        >
          Share Property
        </Button>

        <Button roundness='full' className='w-full border border-white'>
          Video Tour
        </Button>
        <Button
          variant='outline'
          roundness='full'
          className='w-full text-black'
          onClick={handleEditClick}
        >
          Edit
        </Button>

        {isModalOpen && (
          <SharePropertyModal
            onClose={() => setIsModalOpen(false)}
            propertyId={propertyId}
            propertyData={propertyData}
          />
        )}
      </div>
    </div>
  );
};
