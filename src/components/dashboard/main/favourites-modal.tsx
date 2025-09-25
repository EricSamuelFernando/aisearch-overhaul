'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { imageLoader } from '@/utils/image-loader';
import { formatNumber } from '@/utils/math-utilities';
import { shortenAddress } from '@/utils/shorten-address';

type IPropertyCardInfoProps = {
  children?: React.ReactNode;
  badgeStatus?: string;
  property: any;
  className?: string;
};

const FavouriteModal: React.FC<IPropertyCardInfoProps> = ({
  badgeStatus,
  children,
  property,
  className,
}) => {
  const badgeColor =
    property?.status?.toLocaleLowerCase() === 'pending'
      ? 'bg-[#FF8700]'
      : property?.status?.toLocaleLowerCase() === 'now showing'
        ? 'bg-[#ACF337]'
        : 'bg-[#F7F2EB]';

  return (
    <div className={cn('w-[26rem] overflow-hidden rounded-2xl', className)}>
      <section className='relative h-[12rem] w-full overflow-hidden'>
        {property?.status && (
          <div
            className={cn(
              `absolute left-5 top-6 ${badgeColor} rounded-full px-7 py-1`,
            )}
          >
            <p className='text-sm font-bold capitalize'>{property?.status}</p>
          </div>
        )}

        <Image
          loader={imageLoader}
          priority={true}
          src={property?.image || '/assets/images/placeholder.svg'}
          alt={shortenAddress(property?.name)}
          className='h-full w-full object-cover'
          width={500}
          height={500}
        />
      </section>
      <section className='rounded-b-2xl bg-[#0A0A0A] px-8 pb-8 pt-4 '>
        <h2 className='text-[1.8rem] font-semibold text-[#F7F2EB]'>
          {formatNumber(property?.price || 0)}
        </h2>
        <h4 className='font-semibold text-[#F7F2EB]'>
          {property?.name}
        </h4>
        <div className='mb-2 h-16'>
          <p className='mt-4 text-lg font-normal text-[#F7F2EB]'>
            {shortenAddress(property?.address)}
          </p>
        </div>
        {children}
      </section>
    </div>
  );
};

export { FavouriteModal };
