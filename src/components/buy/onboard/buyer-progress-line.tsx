'use client';

import * as React from 'react';

import { useAppDispatch, useAppSelector } from '@/lib/hook';
import {
  buyerOnboardProgress,
  buyerPropertyPreference,
} from '@/slices/onboarding/onboarding-selectors';
import { BuyerOnboardingProgress } from '@/types/user.types';
import { updateBuyerOnboardingProgress } from '@/slices/onboarding/onboarding-slice';
import { useRouter } from 'next/navigation';
import { useUpdatePropertyPreference } from '@/hooks/api/property/usePropertyApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { ProgressLine } from '@/components/progress-line';
import { ProgressStepButtons } from '@/components/progress-step-buttons';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { error } from '@/components/alert/notify';
import { getAuthToken } from '@/lib/storage';
import { getIsAuthExpired } from '@/lib/api/axios';

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

type BuyerProgressButtonProps = {
  onComplete?: () => void;
  onSkip?: () => void;
  cancelLabel?: string;
  hideCancel?: boolean;
  hideBackOnFirst?: boolean;
};

const BuyerProgressButton: React.FC<BuyerProgressButtonProps> = ({
  onComplete,
  onSkip,
  cancelLabel,
  hideCancel = false,
  hideBackOnFirst = false,
}) => {
  const progress = useAppSelector(buyerOnboardProgress);
  const preferenceValues = useAppSelector(buyerPropertyPreference);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const data = useRegister();
  const { updatePropertyPreference } = useUpdatePropertyPreference(
    user?.id,
    user?.email || data?.email,
  );
  const [saving, setSaving] = React.useState(false);
  const canPersistPreference = React.useMemo(() => {
    const token = getAuthToken() || localStorage.getItem('userAccessToken');
    return Boolean(token) && !getIsAuthExpired();
  }, []);

  const currentIndex = steps.indexOf(progress);
  const hideBack = hideBackOnFirst && currentIndex === 0;

  const isPreferenceComplete = React.useMemo(
    () =>
      Boolean(
        preferenceValues?.propertyType &&
          preferenceValues?.preferredPropertyAddress &&
          preferenceValues?.spendAmount?.max,
      ),
    [preferenceValues],
  );

  const validateStep = React.useCallback(
    (step: BuyerOnboardingProgress, isFinal = false) => {
      // Validate only what is expected at the current step.
      if (step === BuyerOnboardingProgress.PROPERTY_AREA) {
        if (!preferenceValues?.preferredPropertyAddress) {
          error({ message: 'Please choose a preferred area before continuing.' });
          return false;
        }
        // If user is finishing from this step (edge case), ensure remaining fields too.
        if (isFinal && !preferenceValues?.propertyType) {
          error({ message: 'Please select a property type before finishing.' });
          return false;
        }
        if (isFinal && !preferenceValues?.spendAmount?.max) {
          error({ message: 'Please choose a budget range before finishing.' });
          return false;
        }
      }

      if (step === BuyerOnboardingProgress.PROPERTY_SELECTION) {
        if (!preferenceValues?.propertyType) {
          error({ message: 'Please select a property type before continuing.' });
          return false;
        }
        if (isFinal) {
          if (!preferenceValues?.preferredPropertyAddress) {
            error({ message: 'Please choose a preferred area before finishing.' });
            return false;
          }
          if (!preferenceValues?.spendAmount?.max) {
            error({ message: 'Please choose a budget range before finishing.' });
            return false;
          }
        }
      }

      if (step === BuyerOnboardingProgress.PROPERTY_SPEND_RANGE) {
        if (!preferenceValues?.spendAmount?.max) {
          error({ message: 'Please choose a budget range before continuing.' });
          return false;
        }
        // For the last step this already covers required fields since earlier steps ran before.
      }
      return true;
    },
    [preferenceValues],
  );

  const persistPreference = React.useCallback(async () => {
    if (!canPersistPreference) return; // Skip API call when unauthenticated
    setSaving(true);
    try {
      await updatePropertyPreference.mutateAsync({
        propertyType: preferenceValues?.propertyType || '',
        preferredPropertyAddress: preferenceValues?.preferredPropertyAddress || '',
        priceMin: preferenceValues?.spendAmount?.min ?? 0,
        priceMax: preferenceValues?.spendAmount?.max ?? 0,
        onboardingCompleted: isPreferenceComplete,
      });
    } catch (err) {
      // Mutation already handles toast, keep a fallback
      error({ message: 'Failed to save preference. Please try again.' });
      throw err;
    } finally {
      setSaving(false);
    }
  }, [canPersistPreference, isPreferenceComplete, preferenceValues, updatePropertyPreference]);

  const navigateTo = React.useCallback(
    async (skip?: boolean) => {
      if (skip && onSkip) {
        onSkip();
        return;
      }
      if (!skip && onComplete) {
        onComplete();
        return;
      }
      const link =
        isLoggedIn || user?.account_type === 'buyer'
          ? '/dashboard'
          : '/complete-onboarding';
      router.push(link);
    },
    [isLoggedIn, onComplete, onSkip, router, user?.account_type],
  );

  const handleNext = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // Front-end validation to avoid backend errors and confusing toasts
      const currentStep = steps[currentIndex];
      const isLastStep = currentIndex === steps.length - 1;
      const valid = validateStep(currentStep, isLastStep);
      if (!valid) return;

      if (currentIndex < steps.length - 1) {
        dispatch(
          updateBuyerOnboardingProgress({ progress: steps[currentIndex + 1] }),
        );
      } else {
        try {
          await persistPreference();
        } catch (err) {
          // allow navigation even if persistence fails (guest users / network hiccups)
        }
        await navigateTo(false);
      }
    },
    [currentIndex, dispatch, navigateTo, persistPreference],
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
      handleCancel={() => navigateTo(true)}
      handleNextContinue={handleNext}
      cancelLabel={cancelLabel}
      hideCancel={true}
      loading={saving}
      hideBack={hideBack}
    />
  );
};

export { BuyerProgressLine, BuyerProgressButton };
