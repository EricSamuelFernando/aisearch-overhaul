'use client';

import React from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import PropertyInfoDetails from '@/components/dashboard/main/property-snippet-details';
import { claimPropertyAtom } from '@/hooks/claim-property-atom';
import { PropertySnippet } from '@/components/dashboard/main/property-snippet';
import PropertySnippetDetails from '@/components/dashboard/main/property-snippet-details';
import { FavouriteModal } from '@/components/dashboard/main/favourites-modal';
import { useSelector } from 'react-redux';

const PendingVerification = () => {
  const currentProperty = useSelector((state: any) => state.property.claimProperty);

  return (
    <section className='flex min-h-full flex-col justify-center rounded-t-lg bg-[#F7F2EB] px-14 py-10'>
      <section className='flex items-center gap-x-24'>
        <FavouriteModal property={{
          name:currentProperty?.courtesyOf,
          image:currentProperty?.media?.primaryListingImageUrl,
          price:currentProperty?.listPrice,
          address:currentProperty?.listing?.address?.unparsedAddress
          }}>
          <PropertyInfoDetails
            noOfBeds={currentProperty.property?.bedroomsTotal}
            noOfBaths={currentProperty.property?.bathroomsTotal}
            lotSizeUnit={""}
            lotSizeValue={currentProperty?.property?.livingArea}
          />
        </FavouriteModal>
        <section className=''>
          <h1 className='mb-8 text-4xl font-medium'>Verification Pending</h1>
          <p className='text-xl font-medium'>
            Your property is undergoing verification
          </p>
        </section>
      </section>
      <section className='mt-20 flex items-center justify-between'>
        <section>
          <Link
            href={'/dashboard/seller/listing/listing-details'}
            className='rounded-full border border-solid border-black bg-transparent px-14 py-2 text-black'
          >
            Back
          </Link>
        </section>

        <Link
          href={'/dashboard?tab=listings'}
          className='rounded-full border border-solid border-black bg-black px-14 py-2 text-center text-white'
        >
          Continue
        </Link>
      </section>
    </section>
  );
};

export default PendingVerification;
