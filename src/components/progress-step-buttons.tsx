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
  cancelLabel?: string;
  hideBack?: boolean;
  hideCancel?: boolean;
}

const ProgressStepButtons: React.FC<
  React.PropsWithChildren<ProgressStepButtonsProps>
> = ({
  children,
  continueButtonText = 'Next',
  cancelLabel = 'Cancel',
  handleBack,
  handleCancel,
  handleNextContinue,
  disableNextButton,
  loading = false,
  hideBack = false,
  hideCancel = false,
}) => (
  <div className='flex w-full flex-wrap items-center gap-3 px-0 md:flex-nowrap md:justify-between md:px-5'>
    <div className='flex w-full min-w-0 flex-1 flex-nowrap items-center gap-3 md:ml-3 md:w-auto md:flex-none'>
      {!hideBack ? (
        <Button
          onClick={handleBack}
          roundness='full'
          className='h-12 min-w-0 flex-1 border-2 border-black bg-transparent px-4 py-3 text-black hover:border-none hover:bg-grey-830 sm:w-40 sm:flex-none sm:px-10'
        >
          Back
        </Button>
      ) : null}
      {!hideCancel ? (
        <Button
          onClick={handleCancel}
          roundness='full'
          variant='ghost'
          className='h-10 w-24 px-6 py-2.5 text-ocOrange'
        >
          {cancelLabel}
        </Button>
      ) : null}
    </div>
    <div className='flex w-full min-w-0 flex-1 flex-nowrap items-center justify-end gap-3 md:w-auto md:flex-none'>
      {children}
      <Button
        disabled={disableNextButton || loading}
        onClick={handleNextContinue}
        roundness='full'
        className='h-12 min-w-0 flex-1 px-4 py-3 sm:w-44 sm:flex-none sm:px-12'
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
