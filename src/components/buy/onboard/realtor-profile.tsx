import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAddPreApprovals } from '@/shared/hooks/useAddPreapproval';
import { sellerGetInitials } from '@/lib/helpers';

export interface RealtorProps extends React.HTMLProps<HTMLDivElement> {
  imagePath?: string;
  realtorName?: string;
  id?: string;
  address?: string;
}

export const Realtor = React.forwardRef<HTMLDivElement, RealtorProps>(
  (props, ref) => {
    const {
      imagePath,
      realtorName: name = 'Robin Scherbatsky',
      address,
      className,
      ...rest
    } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn('flex items-center  justify-start gap-x-4', className)}
      >
        <div className='relative h-[80px] w-[80px]'>
          {/* <Image
            fill
            alt='profile'
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            src={imagePath || '/assets/images/Mask Group 43.png'}
          /> */}
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black'>
            {sellerGetInitials(name)}
          </div>
        </div>

        <div>
          <h2 className='text-lg font-bold text-black'>{name}</h2>
          <p className='font-normal text-ocBlack-50'>
            <span className='block'>{address || 'Queens, NY'}</span>
            <span>11 Listings, 8 Deals</span>
          </p>
        </div>
      </div>
    );
  },
);

Realtor.displayName = 'Realtor';

interface RealtorProfileProps extends RealtorProps {
  onClick?: () => void;
  realtorName: string;
  id: string;
  showButton?: boolean;
  isChecked?: boolean;
}

export const RealtorProfile = React.forwardRef<
  HTMLDivElement,
  RealtorProfileProps
>((props, ref) => {
  const {
    onClick,
    realtorName: name,
    id,
    showButton = true,
    className,
    isChecked = false,
    ...rest
  } = props;
  const { agent } = useAddPreApprovals();

  return (
    <section
      ref={ref}
      className={cn(
        'mb-4 flex items-center justify-between gap-x-8 rounded-xl bg-white p-6',
        className,
      )}
    >
      <Realtor realtorName={name!} {...rest} />

      {showButton && (
        <>
          {isChecked ? (
            <button
              onClick={onClick}
              className={cn(
                'rounded-2xl border-none bg-white px-6 py-1 text-center font-bold text-black',
              )}
            >
              <CheckCircle className='ml-16' />
            </button>
          ) : (
            <button
              onClick={onClick}
              className={cn(
                'min-w-[100px] rounded-2xl border-[1px] border-black bg-black py-1 font-bold  text-white',
                isChecked ? 'cursor-not-allowed' : 'cursor-pointer ',
              )}
            >
              Select
            </button>
          )}
        </>
      )}
    </section>
  );
});

RealtorProfile.displayName = 'RealtorProfile';

export const NewRealtor = React.forwardRef<HTMLDivElement, RealtorProps>(
  (props, ref) => {
    const {
      imagePath,
      realtorName: name = 'N/A',
      address,
      className,
      ...rest
    } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          'flex w-max cursor-pointer flex-col items-center justify-center text-center',
          className,
        )}
      >
        {/* <div className='mb-4'>
          <Image
             alt='profile'
             height={80}
             width={80}
             className='object-contain rounded-full object-center mb-2'
             src={imagePath || '/assets/images/Mask Group 43.png'}
           />
          <div className='w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-black text-lg font-bold'>
            {sellerGetInitials(name)}
          </div>
          <h2 className='font-semibold text-base'>{name}</h2>
          <span className='block text-md'>{address || 'Unknown'}</span>
        </div> */}
        <div className='mb-4 flex flex-col items-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black'>
            {sellerGetInitials(name)}
          </div>
          <h2 className='mt-2 text-base font-semibold'>{name}</h2>
          <span className='block text-md'>{address || 'Unknown'}</span>
        </div>
      </div>
    );
  },
);

NewRealtor.displayName = 'New Realtor';
