'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';
import { imageLoader } from '@/utils/image-loader';
import { formatCurrency } from '@/lib/utils';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import { useCallback } from 'react';

const NewMLSPropertyCard = (props: Readonly<MlsPropertyListing>) => {
  const { saveMlsProperty } = usePropertyActions();

  const handleClick = useCallback(() => {
    saveMlsProperty(props);
  }, [props, saveMlsProperty]);

  return (
    <Link
      href={`/buy/${props.ListingKey}/mls/preview`}
      onClick={handleClick}
      className='max-h-100 flex w-full cursor-pointer flex-col overflow-hidden rounded-xl shadow-md transition duration-300'
    >
      <div className='relative aspect-video h-44 w-full object-cover object-center'>
        <Image
          className='aspect-video h-full w-full object-cover object-center'
          fill
          loader={imageLoader}
          alt='snaphomz-property-image'
          src={props?.Media?.[0]?.Thumbnail ?? '/assets/images/placeholder.svg'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/images/placeholder.svg';
          }}
        />
      </div>
      <div className='flex flex-1 flex-col bg-black px-5 pb-4 pt-2 text-white'>
        <div className='pt-1'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='truncate text-xl font-bold leading-8'>
              {formatCurrency(props.ListPrice || 0, 'USD')}
            </h3>
          </div>
          <p className='mb-10 line-clamp-2 text-sm'>{props.UnparsedAddress}</p>
        </div>
        <div className='flex flex-1 flex-col justify-end'>
          <div className='flex items-start justify-between'>
            {[
              { icon: 'bed.svg', value: props.BedroomsTotal, unit: 'Bed' },
              {
                icon: 'bathroom-white.svg',
                value: props.BathroomsTotalInteger,
                unit: 'Bath',
              },
              {
                icon: 'area-white.svg',
                value: props.LotSizeArea,
                unit: props.LotSizeUnits || 'sqft',
              },
            ].map((item, index) => (
              <div
                key={item.icon}
                className={
                  index === 1
                    ? 'flex flex-1 flex-col items-center justify-center px-8'
                    : ''
                }
              >
                <div className='relative mb-2 h-6 w-6'>
                  <Image
                    fill
                    alt={item.unit}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    src={`/assets/images/${item.icon}`}
                  />
                </div>
                <div className='flex items-center gap-x-2 text-base font-bold leading-6 text-white'>
                  {index === 1 && <Icons.Elipsis />}
                  <span>{`${item.value || 0} ${item.unit}`}</span>
                  {index === 1 && <Icons.Elipsis />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewMLSPropertyCard;
