'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UseFormReturnType, useForm } from '@mantine/form';
import { OfferRequest } from '@/types/property.types';
import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/lib/hook';

interface ClaimsFormContextType {
  form: UseFormReturnType<OfferRequest>;
  isFormInitialized: boolean;
}

const ClaimsFormContext = createContext<ClaimsFormContextType | null>(null);

export function ClaimsFormProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { propertyId: id } = useParams<{ propertyId: string }>();
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const { selectedOffer } = useAppSelector((state) => state.property);
  const params = useSearchParams()
  const requestType = params?.get('type')
  const offerData = requestType === "edit" ? selectedOffer : null;
  console.log("OFFER DATA" , offerData)

  const form = useForm<any>({
    initialValues: {
      property: '',
      financeType: 'loan',
      apprasalContingency: {
        amount: 0,
        unit: 'yes',
      },
      financeContingency: {
        amount: 0,
        unit: 'yes',
      },
      inspectionContingency: {
        amount: 0,
        unit: 'yes',
      },
      coverLetter: '',
      documents: [],
      closeEscrow: {
        amount: 0,
        unit: 'yes',
      },
      offerPrice: {
        amount: 0,
        currency: 'USD',
      },
      downPayment: {
        amount: 0,
        currency: 'USD',
      },
      loanAmount: {
        amount: 0,
        currency: 'USD',
      },
      specialTerms: '',
      buyerAgent: '',
      submitWithOutAgentApproval: true,
    },
    validate: {
      downPayment: {
        amount: (value) =>
          value <= 0 ? 'Down payment must be greater than 0' : null,
      },
      offerPrice: {
        amount: (value) =>
          value <= 0 ? 'Offer price must be greater than 0' : null,
      },
      loanAmount: {
        amount: (value, values) =>
          values.financeType === 'loan' && value <= 0
            ? 'Loan amount must be greater than 0'
            : null,
      },
      financeType: (value) => (!value ? 'Finance type is required' : null),
      coverLetter: (value) => (!value ? 'Cover letter is required' : null),
      specialTerms: (value) => (!value ? 'Special terms are required' : null),
    },
  });

  useEffect(() => {
    if (offerData) {
      form.setValues({
        property: offerData.propertyId || '',
        financeType: offerData.financeType || 'loan' ,
        apprasalContingency:  {
          amount: 0 || offerData.appraisalContingencyDays ,
          unit: 'yes',
        },
        financeContingency:  {
          amount: 0 || offerData.financeContingencyDays ,
          unit: 'yes',
        },
        inspectionContingency: 
       {
          amount: 0 || offerData.inspectionContingencyDays,
          unit: 'yes',
        },
        coverLetter: offerData.coverLetter || '',
        documents: offerData.documents || [],
        closeEscrow:  {
          amount: 0 || offerData.closeEscrowDays,
          unit: 'yes',
        },
        offerPrice:  {
          amount: 0 || offerData.price,
          currency: 'USD',
        },
        downPayment:  {
          amount: 0 || offerData.downPayment,
          currency: 'USD',
        },
        loanAmount:  {
          amount: 0 || offerData.cashAmount ,
          currency: 'USD',
        },
        specialTerms: offerData.specialTerms || '',
        buyerAgent: offerData?.buyerAgent?.id || '',
        submitWithOutAgentApproval:
          offerData.submitWithOutAgentApproval || true,
      });
      setIsFormInitialized(true);
    }
  }, [offerData, isFormInitialized]);

  return (
    <ClaimsFormContext.Provider value={{ form, isFormInitialized }}>
      {children}
    </ClaimsFormContext.Provider>
  );
}

export function useClaimsFormContext() {
  const context = useContext(ClaimsFormContext);
  if (!context) {
    throw new Error('useClaimsForm must be used within a FormProvider');
  }
  return context;
}
