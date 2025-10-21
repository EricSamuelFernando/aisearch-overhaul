'use client';

import * as React from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/hook';
import {
  buyerOnboardProgress,
  buyerPropertyPreference,
} from '@/slices/onboarding/onboarding-selectors';
import { BuyerOnboardingProgress } from '@/types/user.types';
import {
  resetOnboardingSlice,
  updateBuyerOnboardingProgress,
} from '@/slices/onboarding/onboarding-slice';
import { useRouter } from 'next/navigation';
import {
  useCompleteUserPreference,
  useSavePropertyPreference,
} from '@/hooks/api/property/usePropertyApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProgressLine } from '@/components/progress-line';
import { ProgressStepButtons } from '@/components/progress-step-buttons';
import axios from 'axios';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { maskEmail } from '@/lib/utils';
import { PROPERTY_SEARCH_PREFERENCE_AI_URL } from '@/shared/constants/env';
import {useSearchParams } from  'next/navigation';
const steps = Object.values(BuyerOnboardingProgress).map((step) => step);

const BuyerProgressLine: React.FC = () => {
  const activeStep = useAppSelector(buyerOnboardProgress);

  const currentIndex = steps.indexOf(activeStep);

  const progressPercentage = React.useMemo(
    () => (currentIndex === 0 ? 18 : (currentIndex / (steps.length - 1)) * 88),
    [currentIndex],
  );

  return <ProgressLine percentage={progressPercentage} />;
};

const BuyerProgressButton: React.FC = () => {
  const progress = useAppSelector(buyerOnboardProgress);
  const preferenceValues = useAppSelector(buyerPropertyPreference);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  //const data = useRegister();
     const searchParams = useSearchParams();
    
     const typeParam :any= searchParams.get("redirectionUrl") || "null";

  const { mutateAsync } = useSavePropertyPreference();

  const { mutateAsync: completePreferenceMutation } = useCompleteUserPreference();

  const currentIndex = steps.indexOf(progress);

  const data = useRegister();
 
  const PREFERENCE_BACKEND_URI = PROPERTY_SEARCH_PREFERENCE_AI_URL || "http://13.60.114.186:9000/api/search/preference"

  const storePreference = async () => {
       try {
         const response = await axios.post(PREFERENCE_BACKEND_URI,
          {
            user:data?.email || "12345",
            preference:`Looking for a ${preferenceValues?.propertyType} in ${preferenceValues?.preferredPropertyAddress}. Budget is between ${preferenceValues?.spendAmount?.min} and ${preferenceValues?.spendAmount?.max} USD`
          },{
            headers:{
              'Content-Type':'application/json'
            }
          }
         ) 
         console.log(response)
       } catch (error:any ) {
           console.log(error?.message)
       }
  }

  const navigateTo = React.useCallback(async () => {
    const link =
      isLoggedIn || user?.account_type === 'buyer'
        ? '/dashboard'
        :  `/complete-onboarding?redirectionUrl=${encodeURIComponent(typeParam)}`;
    router.push(link);
    // await completePreferenceMutation(preferenceValues);
    //dispatch(resetOnboardingSlice());
     await storePreference()
  }, [
    preferenceValues,
    dispatch,
    isLoggedIn,
    user,
    router,
    completePreferenceMutation,
  ]);

  const handleNext = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex < steps.length - 1) {
        dispatch(
          updateBuyerOnboardingProgress({ progress: steps[currentIndex + 1] }),
        );
        //await mutateAsync(preferenceValues);
      } else {
        await navigateTo();
      }
    },
    [currentIndex, dispatch, navigateTo, preferenceValues, mutateAsync],
  );

  const handlePrevious = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentIndex > 0) {
        dispatch(
          updateBuyerOnboardingProgress({ progress: steps[currentIndex - 1] }),
        );
      }
    },
    [currentIndex, dispatch],
  );

  return (
    <ProgressStepButtons
      handleBack={handlePrevious}
      handleCancel={navigateTo}
      handleNextContinue={handleNext}
    />
  );
};

export { BuyerProgressLine, BuyerProgressButton };
