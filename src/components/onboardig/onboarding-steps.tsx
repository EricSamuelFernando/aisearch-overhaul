'use client';

import AddAgentSection from '@/components/dashboard/user/add-agent-section';
import { TransactionStages } from '@/components/guided-transactions/transaction-stages';
import { useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { TransactionProvider } from '@/providers/guided-transactions-provider';
import { OnboardingStep } from '@/slices/onboarding/onboarding-slice';
import { StepsLayout } from './steps-layout';

type Props = {};

export function OnboardingSteps({}: Props) {
  const currentStep = useAppSelector(
    (state: RootState) => state.steps.currentStep,
  );
  const renderStepContent = (step: OnboardingStep) => {
    switch (step) {
      case OnboardingStep.Step6:
        return <AddAgentSection />;
      case OnboardingStep.Step7:
        return (
          <TransactionProvider>
            <TransactionStages />
          </TransactionProvider>
        );
      default:
        return <StepsLayout />;
    }
  };
  return <>{renderStepContent(currentStep)}</>;
}
