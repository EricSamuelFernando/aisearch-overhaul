import Image from 'next/image';
import CustomButton from '@/components/custom-button';
import { Fragment, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type PropertyCardType = {
  address?: string;
  imageSource?: string;
  buttons?: ReactNode;
  moreAddressDetails?: string;
};

export const CompanyPropertyCard = ({
  buttons,
  address,
  imageSource,
  moreAddressDetails,
}: PropertyCardType) => {
  return (
    <div className='min-h-[100px] w-full rounded-lg bg-black p-4'>
      <div className='flex  items-center gap-x-4'>
        <Image
          height={80}
          width={80}
          src={imageSource || '/assets/images/header-img.jpg'}
          alt='property'
          className='object-fit rounded-md'
        />
        <div className='text-white'>
          <h2 className='font-bold'>{address || '212 1527th Ky Gray,'}</h2>
          <p>{moreAddressDetails || ''}</p>
        </div>
      </div>
      {buttons ? <Fragment>{buttons}</Fragment> : null}
    </div>
  );
};

export const CompanyPropertyCardButtons = () => {
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
