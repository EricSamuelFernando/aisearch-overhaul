import * as React from 'react';

import CustomButton from '@/components/custom-button';
import Image from 'next/image';
import Link from 'next/link';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EmptyStateProps {
  img: string;
  description: string;
  ctaText?: string;
  actionFn?: () => void;
  showCTA?: boolean;
  imgClassName?: string;
  link?: string;
}

const AgentEmptyState: React.FC<EmptyStateProps> = ({
  img,
  description,
  ctaText,
  showCTA,
  imgClassName,
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div
        className={`relative ${
          imgClassName || 'h-[150px] w-[150px]'
        } rounded-full`}
      >
        <Image
          src={img || '/assets/images/home-empty.svg'}
          objectFit='contain'
          fill
          alt='empty'
        />
      </div>
      <div className='my-8'>
        <p className='text-[#9d9d9d]'>{description || 'Nothing to Display'}</p>
      </div>
      {showCTA && (
        // <Link href="/dashboard/agent/add-property">
        //   <CustomButton
        //     label={ctaText}
        //     className="bg-black text-white rounded-full px-6"
        //   />
        // </Link>

        <Button asChild roundness='full'>
          <Link href='/dashboard/agent/add-property'>{ctaText}</Link>
        </Button>
      )}
    </div>
  );
};

export default AgentEmptyState;

const NewEmptyState: React.FC<EmptyStateProps> = ({
  img,
  description,
  ctaText,
  showCTA,
  imgClassName,
  link,
}) => {
  return (
    <div className='my-10 flex  flex-col items-center justify-center py-10'>
      <div
        className={`relative ${
          imgClassName || 'h-[150px] w-[150px]'
        } rounded-full`}
      >
        <Image
          src={img || '/assets/images/home-empty.svg'}
          objectFit='contain'
          fill
          alt='Snap Homz Online'
        />
      </div>
      <div className='my-8'>
        <p className='text-[#9d9d9d]'>{description || 'Nothing to Display'}</p>
      </div>
      {showCTA ? (
        <Button asChild roundness='full'>
          <Link href={link!}>{ctaText}</Link>
        </Button>
      ) : null}
    </div>
  );
};

const ExpandedEmptyState: React.FC<
  React.PropsWithChildren<EmptyStateProps>
> = ({ children, img, description, imgClassName }) => (
  <div className='my-10 flex  flex-col items-center justify-center py-10'>
    <div
      className={`relative ${
        imgClassName || 'h-[150px] w-[150px]'
      } rounded-full`}
    >
      <Image
        src={img || '/assets/images/home-empty.svg'}
        objectFit='contain'
        fill
        alt='Snap Homz Online'
      />
    </div>
    <div className='my-8'>
      <p className='text-[#9d9d9d]'>{description || 'Nothing to Display'}</p>
    </div>
    {children}
  </div>
);

export { ExpandedEmptyState, NewEmptyState };
