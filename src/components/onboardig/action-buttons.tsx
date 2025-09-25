'use client';

import { Button } from '@/components/ui/button';
import {
  useCompleteUserPreference,
  useSavePropertyPreference,
} from '@/hooks/api/property/usePropertyApi';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hook';
import { AppDispatch, RootState } from '../../lib/store';
import {
  nextStep,
  agentPreviousStep,
} from '../../slices/onboarding/onboarding-slice';
import { useRouter } from 'next/navigation';

function ActionButtons() {
  const dispatch: AppDispatch = useAppDispatch();
  const { currentStep, steps } = useAppSelector(
    (state: RootState) => state.steps,
  );
  const propertyPreference = useAppSelector( (state: RootState) => state.propertyPreference,
  );
  const router = useRouter();
  const currentIndex = steps.indexOf(currentStep);
  const isLastStep = currentIndex === steps.length - 1;

  const stepsArr = ['step2', 'step3', 'step4', 'step5'];
  const { mutateAsync, isPending, isSuccess, data, isError } =  useSavePropertyPreference();
  const {mutateAsync: completePreferenceMutation,isPending: completePending,} = useCompleteUserPreference();

  console.log(propertyPreference)
  const handleNext = async () => {
    if (stepsArr.includes(currentStep)) {
     // await mutateAsync(propertyPreference);
      dispatch(nextStep());
    }
    if (isLastStep) {
      //await completePreferenceMutation(propertyPreference);
     // router.push('/dashboard');
    } else {
      //dispatch(nextStep());
    }
  };

  const handlePrevious = () => {
    dispatch(agentPreviousStep());
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(nextStep());
    }
  }, []);

  return (
    <section className='mt-10 flex h-max items-center justify-between'>
      <div className='flex items-center gap-x-2'>
        <Button
          roundness='full'
          className='w-[8rem] px-8'
          onClick={handlePrevious}
        >
          Back
        </Button>

        <Button
          roundness='full'
          className='w-[8rem] px-8'
          onClick={handlePrevious}
          variant='outline'
        >
          Cancel
        </Button>
      </div>

      <div>
        <Button
          roundness='full'
          disabled={isPending || completePending}
          className='w-[8rem] px-8 disabled:bg-gray-500'
          onClick={handleNext}
        >
          {isPending || completePending ? (
            <Loader className='animate animate-spin' />
          ) : null}
          {isLastStep ? 'Save & Continue' : 'Next'}
        </Button>
      </div>
    </section>
  );
}

export default ActionButtons;
