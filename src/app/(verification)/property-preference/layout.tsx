import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
import { Button } from '@/components/ui/button';
import {
  BuyerProgressButton,
  BuyerProgressLine,
} from '@/components/buy/onboard';

export const metadata: Metadata = {
  title: 'Buyer Onboarding Verification | Snaphomz',
  description: 'Snap Homz | User onboarding Verification',
};

const BuyerOnboardingLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <section
    aria-label='buyer-onboarding-layout'
    id='buyer-onboarding-layout'
    className='mb-3 flex h-screen w-full flex-col bg-primary-100'
  >
    <div className='mb-2 flex w-full items-center justify-between px-4 py-3 md:px-8'>
      <Link href='/'>
        <Image src={SnapHomz} alt='logo' className='h-[3.75rem] w-44' />
      </Link>
      <Link rel='no-refferer no-openner' href='/complete-onboarding'>
        <Button
          roundness='full'
          variant='ghost'
          className='px-8 py-2 text-ocOrange'
        >
          Skip
        </Button>
      </Link>
    </div>
    <React.Suspense
      fallback={
        <div className='h-2 w-full animate-pulse bg-ocOrange bg-gradient-to-tr shadow-sm'>
          Loading
        </div>
      }
    >
      <BuyerProgressLine />
    </React.Suspense>
    <div className='flex h-full w-full flex-col px-4 md:px-8'>
      <div className='my-5 grid h-4/5 w-full grid-flow-col place-items-baseline px-0 md:grid-cols-3 md:px-5'>
        <div className='relative hidden h-full w-[85%] overflow-hidden rounded-b-xl rounded-t-full md:col-span-1 md:block'>
          <Image
            src='/assets/images/v2/dome.png'
            alt='Snap Homz home'
            objectFit='contain'
            fill
          />
        </div>
        {children}
      </div>
      <BuyerProgressButton />
    </div>
  </section>
);

export default BuyerOnboardingLayout;
