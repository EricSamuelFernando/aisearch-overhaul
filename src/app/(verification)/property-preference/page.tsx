'use client';

import {
  PropertyArea,
  PropertyRange,
  PropertyType,
} from '@/components/buy/onboard';
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

const BuyerOnboarding = () => {
  const progress = useAppSelector(buyerOnboardProgress);
  const Component = progressMapping[progress].component;

  return (
    <div className='w-full space-y-6 place-self-center md:col-span-2 lg:w-3/4'>
      <h1 className='w-full text-2xl font-medium md:w-4/6 md:text-4xl'>
        {progressMapping[progress].title}
      </h1>
      <div className='w-full md:w-4/6'>
        <Component />
      </div>
    </div>
  );
};

export default BuyerOnboarding;
