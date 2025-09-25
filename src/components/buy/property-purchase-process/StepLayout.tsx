'use client';

import * as React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useModalContext } from '@/providers/modal-provider';

interface PurchaseProcessStepLayoutProps {
  title: string;
  displayCalculator?: boolean;
}

const PurchaseProcessStepLayout: React.FC<
  React.PropsWithChildren<PurchaseProcessStepLayoutProps>
> = ({ children, displayCalculator = false, title }) => {
  const { openModal } = useModalContext();

  return (
    <div className='relative my-5 grid h-4/5 w-full grid-flow-col place-items-baseline px-0 md:grid-cols-3 md:px-5'>
      {displayCalculator ? (
        <div className='absolute right-[5%] top-[12%]'>
          <Button
            onClick={() => {
              openModal('loan-calculator');
            }}
            className='w-full bg-transparent text-ocOrange'
            variant='ghost'
          >
            See a loan Calculator
          </Button>
        </div>
      ) : null}
      <div className='relative hidden h-[32rem] w-full overflow-hidden rounded-b-xl rounded-t-full md:col-span-1 md:block'>
        <Image
          src='/assets/images/v2/dome.png'
          alt='Snap Homz home'
          objectFit='contain'
          fill
        />
      </div>
      <div className='w-full space-y-12 place-self-center md:col-span-2 lg:w-3/4'>
        <h1 className='w-full text-2xl font-medium md:w-[75%] md:text-4xl'>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

export { PurchaseProcessStepLayout };
