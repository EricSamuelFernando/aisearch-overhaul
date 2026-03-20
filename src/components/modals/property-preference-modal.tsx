'use client';

import React from 'react';

import CustomModal from '@/components/custom-modal';
import {
  BuyerProgressButton,
  BuyerProgressLine,
  PropertyArea,
  PropertyRange,
  PropertyType,
} from '@/components/buy/onboard';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hook';
import { buyerOnboardProgress } from '@/slices/onboarding/onboarding-selectors';
import { BuyerOnboardingProgress } from '@/types/user.types';

type ProgressMappingType = {
  title: string;
  component: React.FC;
};

const progressMapping: Record<BuyerOnboardingProgress, ProgressMappingType> = {
  'property-area': {
    title: 'Have a specific area in mind?',
    component: PropertyArea,
  },
  'property-select': {
    title: 'Select property type',
    component: PropertyType,
  },
  'property-spend': {
    title: 'How much are you planning to spend on your property?',
    component: PropertyRange,
  },
};

type PropertyPreferenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
};

const PropertyPreferenceModal: React.FC<PropertyPreferenceModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  onComplete,
}) => {
  const progress = useAppSelector(buyerOnboardProgress);
  const Component = progressMapping[progress].component;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      contentClassName='w-[calc(100vw-2rem)] max-w-3xl overflow-x-hidden p-5 sm:p-8'
    >
      <div className='flex items-center justify-between gap-3'>
        <h3 className='text-lg font-semibold text-black sm:text-xl'>Buyer Preference</h3>
        <Button
          variant='ghost'
          roundness='full'
          className='h-10 border border-black px-5 py-2 text-ocOrange'
          onClick={() => {
            console.log('[PropertyPreferenceModal] Skip clicked');
            if (onSkip) {
              console.log('[PropertyPreferenceModal] Calling onSkip');
              onSkip();
            } else if (onClose) {
              console.log('[PropertyPreferenceModal] Calling onClose (fallback)');
              onClose();
            }
          }}
        >
          Skip
        </Button>
      </div>

      <div className='mt-4'>
        <BuyerProgressLine />
      </div>

      <div className='mt-6'>
        <h4 className='text-lg font-medium text-black'>
          {progressMapping[progress].title}
        </h4>
        <div className='mt-4'>
          <Component />
        </div>
      </div>

      <div className='mt-8'>
        <BuyerProgressButton
          onComplete={onComplete}
          onSkip={onSkip || onClose}
          cancelLabel='Skip'
          hideCancel
        />
      </div>
    </CustomModal>
  );
};

export default PropertyPreferenceModal;
