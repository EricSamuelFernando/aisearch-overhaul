'use client';

import CustomProgressBar from '@/components/customs/custom-ring-progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { imageLoader } from '@/utils/image-loader';
import Link from 'next/link';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { EngagedPropertyInterface } from '../user/property-detail-layout';
import { useState } from 'react';

type Props = {
  className?: string;
  trailColor?: string;
  textColor?: string;
  pathColor?: string;
  streetName: string;
  address: string;
  image?: string;
  status?: string;
  progress?: number;
  size?: number;
  trackWidth?: number;
  indicatorWidth?: number;
  isManage?: boolean;
  propertyId?:string;
};

export const OverviewSkeleton = () => (
  <div className='flex animate-pulse items-center justify-between gap-x-4'>
    <div className='flex flex-auto items-center gap-x-4'>
      <div className='relative h-20 w-24 bg-gray-300' />
      <div className='py-2 '>
        <p className='h-4 w-1/2 bg-gray-300' />
        <p className='h-4 max-w-[70%] bg-gray-400' />
      </div>
    </div>
    <div className='h-[80px] w-[80px] rounded-full bg-gray-300' />
  </div>
);

export function PropertyOverview({
  className,
  pathColor = 'black',
  trailColor = '#d6d6d6',
  streetName,
  address,
  textColor,
  image,
  status,
  size = 80,
  progress = 0,
  trackWidth = 5,
  indicatorWidth = 5,
  isManage = false,
  propertyId 
}: Props) {
  const { userPath } = useCurrentUser();
  const [propertyData, setPropertyData] = useState<EngagedPropertyInterface>();
  return (
    <div className={cn('flex items-center justify-between ', className)}>
      <div className='grid flex-auto grid-cols-3 items-center gap-x-4'>
        <div className='relative aspect-square w-20 h-20 sm:w-24 sm:h-24 col-span-1 col-start-1 sm:col-span-1 sm:col-start-1'>
          <Image
            loader={imageLoader}
            src={image ?? '/assets/images/placeholder.svg'}
            alt={`${streetName}-image`}
            className='h-full w-full rounded-md'
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>

        <div className='col-span-4 col-start-2 flex flex-col items-start justify-between'>
          <div>
            <p className='line-clamp-2 text-md font-bold'>{address}</p>
            <p className='line-clamp-1 text-sm font-light'>
              {streetName ? streetName : 'Street name not available'}
            </p>
          </div>
          <br />
          {isManage ? <Button
            asChild
            variant='outline'
            className={cn('px-4 md:min-w-[150px] bg-black border border-ocOrange')}
            roundness='full'
          >
            <Link href={`${userPath}/property/${propertyId}/manage`}>
              <span className='flex w-full  items-center gap-x-2'>
                <span className='flex h-4 w-4 items-center justify-center rounded-full bg-ocOrange p-3'>
                  1
                </span>
                <span className='font-bold'>Manage</span>
              </span>
            </Link>
           
          </Button> : null}

        
          {status ? (
            <Button
              variant='ocreal'
              className='text-xs text-black'
              roundness='full'
            >
              Now Showing
            </Button>
          ) : null}
        </div>
      </div>
      <div>
        <CustomProgressBar
          trackColor={trailColor}
          indicatorColor={pathColor}
          size={size!}
          progress={progress!}
          trackWidth={trackWidth!}
          indicatorWidth={indicatorWidth!}
          spinnerMode={false}
          label={
            <p className='flex h-full  items-center justify-center text-center text-white'>
              <span
                className={cn('text-sm text-black', textColor)}
              >{`${progress}%`}</span>
            </p>
          }
        />
      </div>
    </div>
  );
}

export default PropertyOverview;
