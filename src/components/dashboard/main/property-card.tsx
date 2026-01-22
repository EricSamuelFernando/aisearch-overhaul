'use client';

import { Button } from '@/components/ui/button';
import { IProperty } from '@/interfaces/property.interface';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import PropertyOverview from './property-overview';
import { useDeleteBuyerProperty } from '@/hooks/api/property/useDeleteBuyerProperty';
import { DeletePropertyModal } from '../delete-property-modal';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setEngagedProperty } from '@/slices/property/property-slice';

interface Props  {
  infoCard?: React.ReactNode;
  className?: string;
  propertyImage?: string;
  propertyAddress?:string;
  propertyProgress?:number;
  propertyId?: string;
  listingId?: string | number;
  id: string,
  propertyName:string,
  selectedProperty?:any,
  handleRemoveProperty: (id:string)=>void
}

function BuyerListingItem(props: Props) {
  const {
    id,
    className,
    handleRemoveProperty,
    selectedProperty
  } = props;  
  const {
    mutate: deleteProperty,
    isPending,
    isError,
  } = useDeleteBuyerProperty();
  const router = useRouter();
  const dispatch = useDispatch();
  // const stateAndPostalCpde = `${propertyAddressDetails?.state}, ${propertyAddressDetails?.postalCode}`;
  // const address = propertyAddressDetails?.formattedAddress;

  // const handleRemoveProperty = () => {
  //   deleteProperty(id);
  // };

  return (
    <div
      className={cn('rounded-2xl bg-[#F7F2EB] px-[9px] py-[12.5px]', className)}
    >
      <PropertyOverview
        streetName={props.propertyName}
        address={props.propertyAddress||''}
        image={props?.propertyImage}
        textColor='text-black text-lg'
        progress={props?.propertyProgress ||0}
      />
      <div className='mx-auto mb-2 mt-12 flex items-center justify-center gap-x-2 gap-y-4'>
        <Button className='font-700 flex-1 text-sm' asChild roundness='full'>
          <Link href=""
          onClick={(e)=>{
            e.preventDefault();
            dispatch(setEngagedProperty(selectedProperty));
            router.push(`/dashboard/buyer/property/${props?.propertyId}`);
          }}
          >
          Open
          </Link>
        </Button>

        <Button
          variant='outline'
          className='font-700 flex-1 bg-transparent text-sm'
          asChild
          roundness='full'
        >
          <Link href=""
            onClick={(e)=>{
              e.preventDefault()
              dispatch(setEngagedProperty(selectedProperty));
              router.push(`/dashboard/buyer/property/${props?.propertyId}/manage`);
            }}
          >Manage</Link>
        </Button>

        <DeletePropertyModal
          isPending={isPending}
          id={id}
          handleRemoveProperty={handleRemoveProperty}
        />
      </div>
    </div>
  );
}

export default BuyerListingItem;
