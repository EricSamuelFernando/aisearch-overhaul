'use client';

import Heading from '@/components/heading';
import { Icons } from '@/components/icons';
import { useTransactionGuideContext } from '@/providers/guided-transactions-provider';
import { StepKey, StepProp } from '@/types/guided-transactions.types';
import { cn } from '@/lib/utils';

const stepList: StepProp[] = [
  {
    title: 'Add an Agent',
    desc: 'Assisted or self tour',
    key: 'add-agent',
    icon: Icons.Tour,
  },
  {
    title: 'Draft an Offer',
    desc: 'Assisted or self composed',
    key: 'draft-offer',
    icon: Icons.Offer,
  },
  {
    title: 'Review Disclosure',
    desc: 'Assisted or self review',
    key: 'review-disclosure',
    icon: Icons.Disclosure,
  },
  {
    title: 'Title & Escrow',
    desc: 'Platform recommended',
    key: 'title-escrow',
    icon: Icons.Shield,
  },
  {
    title: 'Sign & Close',
    desc: 'Online digital signature',
    key: 'sign-close',
    icon: Icons.Signature,
  },
];

export const StatCards = () => {
  const { setCurrentStep } = useTransactionGuideContext();
  const handleSetCurrentStep = (step: StepKey) => {
    setCurrentStep(step);
  };
  return (
    <div className='space-y-1 border-r border-[#DBE2EE] pt-8'>
      {stepList.map((item) => (
        <CurrentGuideStep
          onClick={() => handleSetCurrentStep(item.key)}
          key={item.key}
          step={item}
        />
      ))}
    </div>
  );
};

type CurrentStepProp = {
  step: StepProp;
  onClick: () => void;
};

export const CurrentGuideStep = ({ step, onClick }: CurrentStepProp) => {
  const { currentStep } = useTransactionGuideContext();
  const { icon, title, desc, key } = step;
  const Icon = icon ?? null;
  const Dot = currentStep === key ? Icons.CircleDotFilled : Icons.CircleDot;

  return (
    <div
      key={key}
      onClick={onClick}
      className='relative flex cursor-pointer items-start gap-x-6'
    >
      <Dot className='absolute -right-2 top-4' />
      <div className='w-2/3 text-right'>
        <Heading
          className='m-0 w-full  pb-1 text-right text-lg font-semibold'
          title={title}
        />
        <p className='font-light text-grey-850'>{desc}</p>
      </div>
      <div className='h-full'>
        <div
          className={cn(
            'flex items-center justify-center rounded-full p-2',
            currentStep === key ? 'bg-ocOrange' : 'bg-white ',
          )}
        >
          <Icon className='h-7 w-7' />
        </div>
        <div className='my-auto flex h-[40px] justify-center'>
          <div className='h-full w-[1px] bg-[#E5E5E5]'></div>
        </div>
      </div>
    </div>
  );
};
