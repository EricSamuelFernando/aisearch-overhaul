'use client';

import React from 'react';
import { useTransactionGuideContext } from '@/providers/guided-transactions-provider';
import { StepKey } from '@/types/guided-transactions.types';
import { DraftOffer } from './draft-offer';

type Props = {};

export function GuideDetails({}: Props) {
  const { currentStep }: { currentStep: StepKey } =
    useTransactionGuideContext();

  const renderContent = () => {
    switch (currentStep) {
      case 'add-agent':
        return 'add-agent';
      case 'draft-offer':
        return <DraftOffer />;
      case 'review-disclosure':
        return 'review-disclosure';
      case 'title-escrow':
        return 'title-escrow';
      case 'sign-close':
        return 'sign-close';
      default:
        null;
    }
  };
  return <div>{renderContent()}</div>;
}
