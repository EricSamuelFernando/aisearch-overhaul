'use client';

import Heading from '@/components/heading';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  setFinancialProcess,
  setSpendAmount,
} from '@/slices/onboarding/property-preference';
import React from 'react';
import { useModalContext } from '@/providers/modal-provider';
import PreApprovalFileUpload from '@/components/onboardig/upload-preapprovals';
import {
  WorkWithLender,
  AffiliatePreApproval,
} from '@/components/onboardig/affilate-preapproval';
import { Button } from '../ui/button';
import { CashProofUpload } from './upload-proof-of-cash';
export interface Button {
  title: string;
  value: string;
}

export const buttonList: Button[] = [
  { title: 'I’m looking at options', value: 'I’m looking at options' },
  { title: 'I Spoke to a lender', value: 'I Spoke to a lender' },
  { title: 'I am pre-approved', value: 'I am pre-approved' },
  { title: 'Buying with cash', value: 'Buying with cash' },
];

type ButtonValue = (typeof buttonList)[number]['value'];

export const StepFive = () => {
  const financeProcess = useAppSelector(
    (state: RootState) => state.propertyPreference.financialProcess,
  ) as ButtonValue;

  const renderScreen = () => {
    switch (financeProcess) {
      case 'I’m looking at options':
        return <AffiliatePreApproval />;
      case 'I Spoke to a lender':
        return <WorkWithLender />;
      case 'I am pre-approved':
        return <PreApprovalFileUpload />;
      case 'Buying with cash':
        return <CashProofUpload />;
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};

export function FianceProcess() {
  const { openModal } = useModalContext();

  return (
    <section className='flex h-full max-w-2xl flex-col items-stretch'>
      <div className='h-max text-right'>
        <Button
          onClick={() => {
            openModal('loan-calculator');
          }}
          variant='ghost'
          className='text-ocOrange'
        >
          See a loan Calculator
        </Button>
      </div>
      <div className='grid flex-auto  place-content-center space-y-4'>
        <Heading
          className='w-4/5 font-normal tracking-wider sm:text-2xl md:text-3xl lg:text-3xl'
          title='Where are you in the financing process?'
        />
        <ButtonList />
      </div>
    </section>
  );
}

const ButtonList: React.FC = () => {
  const financeProcess = useAppSelector(
    (state: RootState) => state.propertyPreference.financialProcess,
  );
  const dispatch = useAppDispatch();

  const handleClick = (value: string) => {
    dispatch(setFinancialProcess(value));
  };

  return (
    <div className='grid max-w-lg grid-cols-2 gap-4'>
      {buttonList.map((button: Button) => (
        <Button
          key={button.value}
          variant='outline'
          onClick={() => handleClick(button.value)}
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            financeProcess === button.value
              ? 'bg-black text-white'
              : 'text-black',
          )}
        >
          {button.title}
        </Button>
      ))}
    </div>
  );
};
