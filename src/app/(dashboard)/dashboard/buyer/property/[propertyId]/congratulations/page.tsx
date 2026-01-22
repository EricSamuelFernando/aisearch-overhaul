'use client';

import React from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import PropertyOverview from '@/components/dashboard/main/property-overview';
import { useParams } from 'next/navigation';
import { IProperty } from '@/interfaces/property.interface';
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';

type Props = {};

function Congratulations({}: Props) {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  const { getSingleProperty }:any = useGetSingleProperty(id!);
  const property:any = getSingleProperty?.data?.data?.data?.property as any;

  return (
    <section className="grid h-full place-content-center bg-[url('../../public/assets/images/v2/left-confetti.png')] bg-left px-4">
      <div className='flex flex-col items-center justify-center text-center md:w-[30rem]'>
        <Heading
          className='sm:text-2xl md:text-3xl lg:text-5xl'
          title='Congratulations!!!'
        />
        <p className='text-center text-base md:text-lg'>
          On Closing a $400,000 Home
        </p>

        <PropertyOverview
          className='my-8 h-max w-full rounded-lg bg-black p-5 text-2xl text-white'
          trailColor='#454545'
          textColor='text-white'
          pathColor='white'
          progress={100}
          streetName={property?.price?.amount?.toString()}
          address={property?.propertyAddressDetails?.formattedAddress}
        />

        <div className='my-16'>
          <Button variant='outline' roundness='full'>
            Discover Concierge Services
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Congratulations;
