'use client';

import { IProperty } from '@/interfaces/property.interface';
import { shortenAddress } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/math-utilities';
import Image from 'next/image';
import React, { ReactElement } from 'react';

type IPropertyCardProps = {
  children?: ReactElement;
  badgeStatus?: string;
  property: IProperty;
  className?: string;
};

const PropertyECard: React.FC<IPropertyCardProps> = ({
  badgeStatus,
  children,
  property,
  className,
}) => {
  const badgeColor =
    badgeStatus?.toLocaleLowerCase() === 'pending'
      ? 'bg-[#FF8700]'
      : badgeStatus?.toLocaleLowerCase() === 'now showing'
        ? 'bg-[#ACF337]'
        : 'bg-[#F7F2EB]';

  return (
    <section className={cn('w-[26rem] overflow-hidden rounded-2xl', className)}>
      <section className='relative h-[12rem] w-full overflow-hidden'>
        {badgeStatus ? (
          <div
            className={cn(
              `absolute left-5 top-6 ${badgeColor} z-10 rounded-full px-7 py-1`,
            )}
          >
            <p className='text-sm font-bold'>{badgeStatus}</p>
          </div>
        ) : null}

        <Image
          priority={true}
          src={property?.images[0]?.url}
          alt={shortenAddress(property?.propertyName)}
          className='object-cover'
          fill
          // height={220}
          // width={464}
        />
      </section>
      <section className='rounded-b-2xl bg-[#0A0A0A] pb-8 pl-4 pr-2 pt-4 '>
        <h2 className='text-[1.8rem] font-semibold text-[#F7F2EB]'>
          {formatNumber(property?.price?.amount || 0)}
        </h2>
        <div className='mb-2 h-16'>
          <p className='mt-4 text-[1.375rem] font-normal text-[#F7F2EB]'>
            {shortenAddress(property?.propertyAddressDetails?.formattedAddress)}
          </p>
        </div>

        {children}
      </section>
    </section>
  );
};

export { PropertyECard };
