'use client';

import Link from 'next/link';
import { useAtom } from 'jotai';

import { claimPropertyAtom } from '@/hooks/claim-property-atom';
import { PropertySnippet } from '@/components/dashboard/main/property-snippet';
import PropertyInfoDetails from '@/components/dashboard/main/property-snippet-details';
import { useSelector } from 'react-redux';
import { FavouriteModal } from '@/components/dashboard/main/favourites-modal';
import { SellerAPIs } from '@/hooks/api/seller';
import { useRouter } from 'next/navigation';
import { userData } from '@/slices/auth/auth.slice';
import { error, success } from '@/components/alert/notify';
import axios from 'axios';
import { useState } from 'react';

const ListingEmptyPage = () => {
  const { claimPropertyAPI } = SellerAPIs()
  const router = useRouter();
  const user = useSelector(userData);
  const currentProperty = useSelector((state:any) => state.property.claimProperty); 
  console.log("Propertyt data : ",currentProperty,user);  
  const createSellerProperty = ()=>{
    // const data = {
    //   listingId:currentProperty?.listingId,
    //   propertyId:currentProperty?.id,
    //   name:currentProperty?.listing?.courtesyOf,
    //   address:currentProperty?.listing?.address?.unparsedAddress,
    //   city:currentProperty?.listing?.address?.city,
    //   zipCode:currentProperty?.listing?.address?.zipCode,
    //   price:currentProperty?.listing?.listPriceLow,
    //   image:currentProperty?.listing?.media?.primaryListingImageUrl,
    //   bedRooms:currentProperty.listing?.property?.bedroomsTotal,
    //   bathRooms:currentProperty.listing?.property?.bathroomsTotal,
    //   sqft:currentProperty.listing?.pricePerSqFt.toString+"",
    //   status:"pending",
    //   userId:user?.id
    // }
    // claimPropertyAPI.mutateAsync(data,{
    //   onSuccess:(response:any)=>{
    //     console.log("data : ",response);
    //     success({message:"You've successfully claimed the property"})
    //   }
    // })

    // <FavouriteModal property={{
    //   name:currentProperty?.propertyInfo?.address?.address,
    //   image:currentProperty?.public?.imageUrl,
    //   price:currentProperty?.estimatedValue,
    //   address:currentProperty?.listing?.address?.unparsedAddress
    //   }}>
    //   <PropertyInfoDetails
    //     noOfBeds={currentProperty.propertyInfo?.bedrooms}
    //     noOfBaths={currentProperty.propertyInfo?.bathrooms}
    //     lotSizeUnit={""}
    //     lotSizeValue={currentProperty.listing?.pricePerSqFt}
    //   />
    router.push(`/dashboard/seller/listing/listing-details?propertyId=${currentProperty?.id}&listingId=${currentProperty?.listingId}`)
  }
  return (
    <section className='flex min-h-full flex-col justify-center rounded-t-lg bg-[#F7F2EB] px-14 py-10'>
      <section className='flex items-center gap-x-24'>
        <FavouriteModal property={{
          name:"",
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
          <h1 className='mb-8 text-4xl font-medium'>Verify Ownership</h1>
          <p className='text-xl font-medium'>
            Proceed to have full control of this property here
          </p>
        </section>
      </section>
      <section className='mt-20 flex items-center justify-between'>
        <section>
          <Link
            href={'/dashboard?tab=listings'}
            className='rounded-full border border-solid border-black bg-transparent px-14 py-2 text-black'
          >
            Cancel
          </Link>
        </section>
        <section className='flex items-center gap-x-4'>
          <Link
            href={'/dashboard?tab=listings'}
            className='rounded-full border-0 bg-transparent px-14 py-2 text-black'
          >
            Later
          </Link>

          <Link
            href={''}
            onClick={(e)=>{
              e.preventDefault();
              createSellerProperty()
            }}
            className='rounded-full border border-solid border-black bg-black px-14 py-2 text-center text-white'
          >
            Start
          </Link>
        </section>
      </section>
    </section>
  );
};

export default ListingEmptyPage;
