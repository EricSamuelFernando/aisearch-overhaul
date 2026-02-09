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
};

const BuyerProgressButton: React.FC<BuyerProgressButtonProps> = ({
  onComplete,
  onSkip,
  cancelLabel,
}) => {
  const progress = useAppSelector(buyerOnboardProgress);
  const preferenceValues = useAppSelector(buyerPropertyPreference);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const data = useRegister();
  const { updatePropertyPreference } = useUpdatePropertyPreference(
    user?.email || data?.email,
  );
  const [saving, setSaving] = React.useState(false);

  const currentIndex = steps.indexOf(progress);

  const isPreferenceComplete = Boolean(
    preferenceValues?.propertyType &&
      preferenceValues?.preferredPropertyAddress &&
      preferenceValues?.spendAmount?.max,
  );

  const persistPreference = React.useCallback(async () => {
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
  }, [isPreferenceComplete, preferenceValues, updatePropertyPreference]);

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
      if (currentIndex < steps.length - 1) {
        dispatch(
          updateBuyerOnboardingProgress({ progress: steps[currentIndex + 1] }),
        );
      } else {
        await persistPreference();
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
      loading={saving}
    />
  );
};

export { BuyerProgressLine, BuyerProgressButton };
