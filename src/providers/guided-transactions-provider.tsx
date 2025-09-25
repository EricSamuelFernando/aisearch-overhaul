'use client';

import React from 'react';
import { createContext, useContext, useState } from 'react';
import { StepKey } from '@/types/guided-transactions.types';

type TransactionContextType = {
  currentStep: StepKey;
  setCurrentStep: (step: StepKey) => void;
};

const TransactionGuideContext = createContext<TransactionContextType | null>(
  null,
);

export const useTransactionGuideContext = () => {
  const context = useContext(TransactionGuideContext);
  if (!context) {
    throw new Error(
      'useTransactionGuideContext must be used within a TransactionProvider',
    );
  }
  return context;
};

type TransactionGuideProviderProps = {
  children: React.ReactNode;
};

export const TransactionProvider: React.FC<TransactionGuideProviderProps> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState<StepKey>('add-agent');

  return (
    <TransactionGuideContext.Provider value={{ currentStep, setCurrentStep }}>
      {children}
    </TransactionGuideContext.Provider>
  );
};
