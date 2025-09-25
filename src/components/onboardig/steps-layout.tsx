import {
  FianceProcess,
  StepFive,
} from '@/components/onboardig/finance-process';
import { FianceRange } from '@/components/onboardig/finance-range';
import SelectProperty from '@/components/onboardig/select-property';
import { SelectPropertyType } from '@/components/onboardig/select-property-type';
import { useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { OnboardingStep } from '@/slices/onboarding/onboarding-slice';
import Image from 'next/image';

export function OnboardingFirstSection() {
  const currentStep = useAppSelector(
    (state: RootState) => state.steps.currentStep,
  );
  const renderStepContent = (step: OnboardingStep) => {
    switch (step) {
      case OnboardingStep.Step1:
        return <SelectProperty />;
      case OnboardingStep.Step2:
        return <SelectPropertyType />;
      case OnboardingStep.Step3:
        return <FianceRange />;
      case OnboardingStep.Step4:
        return <FianceProcess />;
      case OnboardingStep.Step5:
        return <StepFive />;
      default:
        return null;
    }
  };
  return <>{renderStepContent(currentStep)}</>;
}

export function StepsLayout() {
  return (
    <section className='my-12 grid h-full  justify-between gap-x-16 md:grid-cols-3'>
      <section className='hidden h-full items-center justify-center  pr-10 pt-6 md:flex'>
        <Image
          src='/assets/images/v2/dome.png'
          alt='Snap Homz home'
          height={570}
          width={450}
          className='object-contain object-center'
        />
      </section>
      <div className='col-span-2'>
        <OnboardingFirstSection />
      </div>
    </section>
  );
}
