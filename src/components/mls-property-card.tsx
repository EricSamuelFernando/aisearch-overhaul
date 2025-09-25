import Image from 'next/image';

import { formatNumber } from '@/utils/math-utilities';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';
import { InfoCard } from '@/components/property-infocard';
import { Icons } from '@/components/icons';

export function MLSPropertyCard(
  props: Readonly<MlsPropertyListing> & {
    handleClick?: () => void;
  },
) {
  return (
    <section onClick={props?.handleClick} className='w-full cursor-pointer'>
      <div>
        <div className='relative h-48 w-full rounded-t-lg'>
          {props?.Media && props?.Media?.length > 0 ? (
            <div>
              <Image
                src={props?.Media[0].Thumbnail}
                alt={props?.ListingId}
                className='h-full w-full rounded-t-xl bg-no-repeat'
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
              {props.StandardStatus ? (
                <div className='absolute left-4 top-6'>
                  {props?.MlsStatus}
                  <InfoCard title={props.StandardStatus} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center text-center'>
              <p>No Image Found</p>
            </div>
          )}
        </div>
        <div className='rounded-b-xl bg-black px-6 py-4 text-white'>
          <div className='py-3'>
            <div className='mb-4 flex items-center justify-between'>
              <p className='text-xl font-bold'>
                {formatNumber(props.ListPrice || 0)}
              </p>

              <p className='flex items-center gap-x-2'>
                <Icons.ColoredAi />
                <span className='text-2xl text-[#FFE4A8]'>80%</span>
              </p>
            </div>
            <p className='mb-10 text-sm'>{`${props.UnparsedAddress}`}</p>
          </div>
          <div className='flex items-start justify-between'>
            <div className=''>
              <div className='relative mb-2 h-6 w-6'>
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
              <div className='flex items-center gap-x-2 font-bold'>
                <span>{props.BedroomsTotal || 0} Bed</span>
              </div>
            </div>
            <div className='flex flex-1 flex-col  items-center justify-center px-8'>
              <div className='relative mb-2 h-6 w-6'>
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
              <div className='flex w-full items-center justify-between gap-x-2 font-bold'>
                <Icons.Elipsis />
                <span>{props.BathroomsTotalInteger || 0} Bath</span>
                <Icons.Elipsis />
              </div>
            </div>
            <div className=''>
              <div className='relative mb-2 h-6 w-6'>
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
              <div className='flex items-center gap-x-2 font-bold lowercase'>
                <span>{`${props.LotSizeArea || 0} ${
                  props.LotSizeUnits || 'sft'
                }`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
