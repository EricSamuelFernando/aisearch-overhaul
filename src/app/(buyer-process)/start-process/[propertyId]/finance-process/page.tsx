'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { Button } from '@/components/ui/button';
import { PurchaseProcessStepLayout } from '@/components/buy/property-purchase-process/StepLayout';
import { useAuth } from '@/shared/hooks/useAuth';

enum FinancialOptionsType {
  OPTIONS = 'looking_at_options',
  PRE_LENDER = 'spoke_to_lender',
  PRE_APPROVED = 'pre_approved',
  CASH = 'buying_with_cash',
}

const FinanceProcessPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const {
    combinedProcessState,
    updatePropertyPreference,
    updateBuyerPreference,
    initializeFromUser,
    setLenderPreviousStep,
  } = usePurchaseProcessStore();
  const { user } = useAuth();
  const router = useRouter();
  const selectedOption =
    combinedProcessState.propertyPreference.financialProcess;

    React.useEffect(() => {
      setLenderPreviousStep(`/start-process/${propertyId}/finance-process`);
      if (user?.propertyPreference) {
        // @ts-ignore
        initializeFromUser(user.propertyPreference);
      }
    
      updateBuyerPreference('property', propertyId);
      updateBuyerPreference('listingId', propertyId);
    }, [user, initializeFromUser, propertyId, updateBuyerPreference, setLenderPreviousStep]);
    

  // React.useEffect(() => {
  //   setLenderPreviousStep(`/start-process/${propertyId}/finance-process`);
  //   if (user?.propertyPreference) {
  //     // @ts-ignore
  //     initializeFromUser(user.propertyPreference);
  //   }

  //   updateBuyerPreference('property', propertyId);
  //   updateBuyerPreference('listingId', propertyId);
  // }, [user, initializeFromUser, propertyId, updateBuyerPreference]);

  const setSelectedOption = React.useCallback(
    (value: FinancialOptionsType) => {
      updatePropertyPreference('financialProcess', value);
    },
    [updatePropertyPreference],
  );

  const nextLink = React.useMemo(() => {
    switch (selectedOption) {
      case FinancialOptionsType.OPTIONS:
        return `/start-process/${propertyId}/options`;
      case FinancialOptionsType.PRE_LENDER:
        return `/start-process/${propertyId}/spoken-to-lenders`;
      case FinancialOptionsType.PRE_APPROVED:
        return `/start-process/${propertyId}/preapproved-documents`;
      case FinancialOptionsType.CASH:
        return `/start-process/${propertyId}/buy-with-cash`;
      default:
        return '#';
    }
  }, [selectedOption, propertyId]);

  console.log("FinanceOptions");
  

  return (
    <>
      <PurchaseProcessStepLayout
        title='Where are you in the financial process?'
        displayCalculator
      >
        <div className='grid w-full grid-cols-2 gap-4 font-medium'>
          {OptionsDataList.map(({ id, value, label }) => (
            <button
              key={id}
              onClick={() => setSelectedOption(value)}
              className={cn(
                `w-full rounded-md border border-black px-4 py-3 transition-all`,
                selectedOption === value && 'bg-black text-white',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </PurchaseProcessStepLayout>
      <div className='mt-auto flex w-full flex-nowrap items-center justify-between px-0 md:px-5'>
        <div className='flex flex-row flex-nowrap items-center gap-3'>
          <Link
            href=""
            className='flex h-8 w-fit items-center justify-center rounded-full border-2 border-black bg-transparent px-12 py-2 text-center text-black'
            onClick={(e)=>{
              e.preventDefault();
              router.push(`/start-process/${propertyId}/transaction-agreement`)
            }}
          >
            Back 
          </Link>
          <Link
            href={`/buy/${propertyId}/prop/preview`}
            className='px-8 py-2 font-bold text-ocOrange'
          >
            Cancel
          </Link>
        </div>

        <div className='flex flex-nowrap items-center gap-3'>
          <Button
            roundness='full'
            className='h-8 w-28 px-[4.5rem] py-2'
            disabled={!selectedOption}
          >
            <Link
              href={nextLink}
              className='flex h-8 w-28 items-center justify-center px-[4.5rem] py-2'
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

type FinancialOptionsDataList = Array<OptionsTypeDataList>;
type OptionsTypeDataList = {
  id: string;
  label: string;
  value: FinancialOptionsType;
};

const OptionsDataList: FinancialOptionsDataList = [
  {
    id: 'financial-options-type-001',
    label: "I'm looking at options",
    value: FinancialOptionsType.OPTIONS,
  },
  {
    id: 'financial-options-type-002',
    label: 'I spoke to a lender',
    value: FinancialOptionsType.PRE_LENDER,
  },
  {
    id: 'financial-options-type-003',
    label: 'I am pre-approved',
    value: FinancialOptionsType.PRE_APPROVED,
  },
  {
    id: 'financial-options-type-004',
    label: 'Buying with cash',
    value: FinancialOptionsType.CASH,
  },
];

export default FinanceProcessPage;
