'use client';

import { RootState } from '@/lib/store';
import { useAppSelector } from '@/lib/hook';

export const ProgressBar = ({ totalSteps }: { totalSteps: number }) => {
  const { steps, currentStep } = useAppSelector(
    (state: RootState) => state.steps,
  );

  const currentIndex = steps.indexOf(currentStep);

  const progress = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className='w-full rounded-lg bg-gray-300'>
      <div
        className='h-1  rounded-lg bg-ocOrange'
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
