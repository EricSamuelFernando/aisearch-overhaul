import Divider from '@/components/divider';
import { cn } from '@/lib/utils';
import Image, { StaticImageData } from 'next/image';
import React, { ReactNode } from 'react';
import { ObjectString } from '@/types/global.types';

interface PropertyList {
  actionBtn: ReactNode;
  className: string;
  title?: string;
  description?: string;
  img: string | StaticImageData;
  variant: 'light' | 'dark';
  address?: string;
  imageSource?: string;
  buttons?: ReactNode;
  moreAddressDetails?: string;
}
const PropertyList: React.FC<PropertyList> = ({
  actionBtn,
  className,
  title,
  description,
  img,
  variant,
  buttons,
  address,
  imageSource,
  moreAddressDetails,
}) => {
  const bgVaraints: ObjectString = {
    light: 'bg-grey-150 text-dark',
    dark: 'bg-black text-white',
  };
  return (
    <div
      className={cn(
        ' w-full rounded-2xl px-[0.625rem] py-3',
        className,
        bgVaraints[variant],
      )}
    >
      <div className='flex items-center justify-between p-2'>
        <div className='flex items-center'>
          <div>
            <div className='relative h-20 w-24'>
              <Image
                height={80}
                width={80}
                src={imageSource || '/assets/images/header-img.jpg'}
                alt='property'
                className='object-fit rounded-md'
              />
            </div>
          </div>
          <div className='ml-4 '>
            <h4 className='text-[1.25rem] font-light'>{title}</h4>
            <p className='text-md font-light'>{description}</p>
          </div>
        </div>
      </div>
      <div className='mx-4 mt-1 border-t border-grey-750' />
      {actionBtn}
    </div>
  );
};

export default PropertyList;
