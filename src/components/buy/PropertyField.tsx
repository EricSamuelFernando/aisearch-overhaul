import { PropertyCardProp } from '@/interfaces/card.interface';
import { IProperty } from '@/interfaces/property.interface';
import { cn } from '@/lib/utils';
import { default as Image, default as NextImage } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props extends IProperty {
  infoCard?: React.ReactNode;
  className?: string;
}

function NewPropertyCard({
  currency = '$',
  address,
  infoCard,
  price,
  className,
}: PropertyCardProp) {
  return (
    <div className={cn('max-w-[350px]', className)}>
      <div className='relative h-[200px] w-full rounded-t-lg'>
        <div className='flex h-full w-full items-center justify-center text-center'>
          <p>No Image Found</p>
        </div>
        <div className='absolute left-4 top-6'>{infoCard}</div>
        {/* <span className="block border-grey-410 absolute border-[2px] w-5 h-5  rounded-full bg-grey-850 top-4 right-4" /> */}
      </div>
      <div className='min-h-[200px] rounded-b-xl bg-black p-4 text-white'>
        <div className='pb-4 pt-2'>
          <p className='pb-2 font-bold'>
            <span>{currency}</span>
            <span>{price}</span>
          </p>
          <p>{address}</p>
        </div>

        <div className='features flex items-center space-x-4'>
          <div>
            <div className='relative h-4 w-4'>
              <Image
                fill
                alt='profile'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src='/assets/images/bed.svg'
              />
            </div>

            <div className='flex items-end gap-x-2 font-bold'>
              <span>3 Bed</span> <span className='text-2xl'>.</span>
            </div>
          </div>

          <div>
            <div className='relative h-4 w-4'>
              <Image
                fill
                alt='profile'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src='/assets/images/bathroom-white.svg'
              />
            </div>

            <div className='flex items-end gap-x-2 font-bold'>
              <span>2 Bath</span> <span className='text-2xl'>.</span>
            </div>
          </div>

          <div>
            <div className='relative h-4 w-4'>
              <Image
                fill
                alt='profile'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src='/assets/images/area-white.svg'
              />
            </div>
            <div className='flex items-end gap-x-2 font-bold'>
              <span>1.51 sft</span> <span className='text-2xl'>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPropertyCard;
