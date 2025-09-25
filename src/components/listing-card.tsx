'use client';

import { shortenAddress } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/math-utilities';
import Image from 'next/image';
import { ReactElement } from 'react';

type IPropertyCardProps = {
  children?: ReactElement;
  badgeStatus?: string;
  property: any;
  className?: string;
  isEditEnabled?: boolean;
};

const ListingCard: React.FC<IPropertyCardProps> = ({
  badgeStatus,
  children,
  property,
  className,
  isEditEnabled = false,
}) => {
  const badgeStatusString = typeof badgeStatus === 'string' ? badgeStatus : '';

  const badgeColor = (() => {
    switch (badgeStatusString?.toLocaleLowerCase()) {
      case 'pending verification':
        return 'bg-[#FFD600]';
      case 'now showing':
        return 'bg-[#ACF337]';
      case 'verified':
        return 'bg-[#00FF00]';
      case 'not verified':
        return 'bg-[#FF8548]';
      case 'under contract':
        return 'bg-[#EFC65D]';
      case 'sold':
        return 'bg-[#0000FF]';
      default:
        return 'bg-[#F7F2EB]';
    }
  })();

  return (
    <section
      className={cn(
        'w-full max-w-[26rem] overflow-hidden rounded-2xl',
        className,
      )}
    >
      <section className='relative h-[11.8rem] overflow-hidden'>
        {badgeStatusString ? (
          <div
            className={cn(
              `absolute left-5 top-6 ${badgeColor} rounded-full px-7 py-1`,
            )}
          >
            <p className='text-sm font-bold'>{badgeStatusString}</p>
          </div>
        ) : null}

        <Image
          src={property.images[0]?.url || '/assets/images/home.png'}
          alt={property?.propertyName || 'Property Image'}
          className='object-contain'
          height={220}
          width={464}
        />
      </section>
      <section className='rounded-b-2xl bg-[#0A0A0A] pb-8 pl-4 pr-2 pt-4 '>
        <h2 className='text-[1.8rem] font-semibold text-[#F7F2EB]'>
          {formatNumber(property?.price?.amount || 0)}
        </h2>
        <div className='mb-2 h-16'>
          <p className='mt-4 text-[1.375rem] font-normal text-[#BABABA]'>
            {shortenAddress(property?.propertyAddressDetails?.formattedAddress)}
          </p>
        </div>

        {children}
      </section>
    </section>
  );
};

export { ListingCard };
