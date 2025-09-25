'use client';

import * as React from 'react';

import { Button } from './ui/button';
import { Loader } from 'lucide-react';

interface ProgressStepButtonsProps {
  handleBack(e: React.MouseEvent<HTMLButtonElement>): void;
  handleCancel(): void;
  handleNextContinue(e: React.MouseEvent<HTMLButtonElement>): void;
  continueButtonText?: string;
  disableNextButton?: boolean;
  loading?: boolean;
}

const ProgressStepButtons: React.FC<
  React.PropsWithChildren<ProgressStepButtonsProps>
> = ({
  children,
  continueButtonText = 'Next',
  handleBack,
  handleCancel,
  handleNextContinue,
  disableNextButton,
  loading = false,
}) => (
  <div className='flex w-full flex-nowrap items-center justify-between px-0 md:px-5'>
    <div className='flex flex-row flex-nowrap items-center gap-3'>
      <Button
        onClick={handleBack}
        roundness='full'
        className='h-8 w-28 border-2 border-black bg-transparent px-9 py-2 text-black hover:border-none hover:bg-grey-830'
      >
        Back
      </Button>
      <Button
        onClick={handleCancel}
        roundness='full'
        variant='ghost'
        className='px-8 py-2 text-ocOrange'
      >
        Cancel
      </Button>
    </div>
    <div className='flex flex-nowrap items-center gap-3'>
      {children}
      <Button
        disabled={disableNextButton || loading}
        onClick={handleNextContinue}
        roundness='full'
        className='h-8 w-28 px-[4.5rem] py-2'
      >
        {loading ? (
          <Loader className='w-max animate-spin' />
        ) : (
          continueButtonText
        )}
      </Button>
    </div>
  </div>
);

export { ProgressStepButtons };
