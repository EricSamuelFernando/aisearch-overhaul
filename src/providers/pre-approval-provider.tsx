'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

export type PreApprovalStatusType = boolean | 'cash';

interface PreApprovalContextType {
  setCurrentStage: (stage: string) => void;
  currentStage: string;
  preApprovalStatus: PreApprovalStatusType;
  setPreApprovalStatus: (status: PreApprovalStatusType) => void;
  useAffilateLender: boolean;
  setUseAffilateLender: (status: boolean) => void;
  methods: UseFormReturn<typeof initialValues>;
}

const PreApprovalContext = createContext<PreApprovalContextType | null>(null);

const initialPreApproval = {
  preApprovalDocument: undefined,
  proofOfDownPayment: undefined,
  proofOfFunds: undefined,
  email: undefined,
  fullName: undefined,
  bankStatements: [],
};

const FileSchema = z.instanceof(FileList);

export const preApprovalSchema = z.object({
  preApprovalDocument: z.instanceof(FileList).optional(),
  proofOfDownPayment: z.instanceof(FileList).optional(),
  proofOfFunds: z.instanceof(FileList).optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  bankStatements: z.array(FileSchema),
});

const initialValues = preApprovalSchema.parse(initialPreApproval);

export const usePreApprovalContext = () => {
  const context = useContext(PreApprovalContext);

  if (!context) {
    throw new Error('usePreApproval must be used within a PreApprovalProvider');
  }

  return context;
};

interface PreApprovalProviderProps {
  children: React.ReactNode;
}

export const PreApprovalProvider: React.FC<PreApprovalProviderProps> = ({
  children,
}) => {
  const defaults = useMemo(() => initialValues, [initialValues]);

  const methods = useForm<typeof defaults>({
    defaultValues: defaults,
  });

  const [currentStage, setCurrentStage] = useState<string>('1');
  const [preApprovalStatus, setPreApprovalStatus] =
    useState<PreApprovalStatusType>(false);
  const [useAffilateLender, setUseAffilateLender] = useState<boolean>(false);

  const contextValue = useMemo(
    () => ({
      currentStage,
      setCurrentStage,
      preApprovalStatus,
      setPreApprovalStatus,
      useAffilateLender,
      setUseAffilateLender,
      methods,
    }),
    [
      currentStage,
      setCurrentStage,
      preApprovalStatus,
      setPreApprovalStatus,
      useAffilateLender,
      setUseAffilateLender,
      methods,
    ],
  );

  return (
    <PreApprovalContext.Provider value={contextValue}>
      {children}
    </PreApprovalContext.Provider>
  );
};
