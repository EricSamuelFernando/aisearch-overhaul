import Image from 'next/image';
import CustomButton from '@/components/custom-button';
import { Fragment, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';

type PropertyCardType = {
  address?: string;
  imageSource?: string;
  buttons?: ReactNode;
  moreAddressDetails?: string;
  engagedProperty?: any;
};

export const AgentPropertyCard = ({
  buttons,
  address,
  imageSource,
  moreAddressDetails,
  engagedProperty
}: PropertyCardType) => {
  const propertyData = useSelector((state: any) => state?.property?.claimProperty);
  const selectedPropertyData = {
    media: propertyData?.mls_data?.data?.media?.primaryListingImageUrl,
    courtesyOf: propertyData?.mls_data?.data?.courtesyOf,
    completeAddress: `${propertyData?.mls_data?.data?.address?.unparsedAddress},
      ${propertyData?.mls_data?.data?.address?.countyOrParish},
      ${propertyData?.mls_data?.data?.address?.city},
      ${propertyData?.mls_data?.data?.address?.zipCode},
       `
  }
  return (
    <div className='min-h-[100px] w-full rounded-lg bg-black p-4'>
      <div className='flex  items-center gap-x-4'>
        <Image
          height={80}
          width={80}
          src={selectedPropertyData?.media || '/assets/images/header-img.jpg'}
          alt='property'
          unoptimized
          className='object-fit rounded-md'
        />
        <div className='text-white'>
          <h2 className='font-bold'>{selectedPropertyData?.courtesyOf || '212 1527th Ky Gray,'}</h2>
          <p>{selectedPropertyData?.completeAddress || ''}</p>
        </div>
      </div>
      {buttons ? <Fragment>{buttons}</Fragment> : null}
    </div>
  );
};

export const AgentPropertyCardButtons = () => {
  return (
    <div className='gap-x-2 py-4'>
      <div className='hr mx-[10%] h-[0.3px] bg-gray-200' />
      <div className='mt-8 flex items-center gap-x-2'>
        <Button roundness='full' className='w-full'>
          Share Property
        </Button>

        <Button variant='outline' roundness='full' className='w-full'>
          Video Tour
        </Button>
        <Button variant='outline' roundness='full' className='w-full'>
          Edit
        </Button>
      </div>
    </div>
  );
};
