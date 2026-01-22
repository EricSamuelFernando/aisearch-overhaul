'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PurchaseProcessStepLayout } from '@/components/buy/property-purchase-process/StepLayout';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { MORTGAGE_APPLICATION_URL } from '@/shared/constants/env';
import { useAppSelector } from '@/lib/hook';
import { useSelector } from 'react-redux';
import { accessToken } from '@/slices/auth/auth.slice';

const PreApprovalAffiliatesPage: React.FC = () => {
  const { propertyQuery } = useAppSelector(state => state.property)
  const { propertyId } = useParams<{ propertyId: string }>();
  const [answer, setAnswer] = React.useState("");
  const router = useRouter()
  const means = localStorage.getItem("means")
  const propertyData = useSelector((state: any) => state.property.property);
  const token = useSelector(accessToken);
  const {
    combinedProcessState,
    updatePropertyPreference,
    setAgentPreviousStep,
    setLenderPreviousStep,
  } = usePurchaseProcessStore();

  React.useEffect(() => {
    setLenderPreviousStep(`/start-process/${propertyId}/options`);
    setAgentPreviousStep(`/start-process/${propertyId}/options`);
  }, [setAgentPreviousStep, setLenderPreviousStep]);

  React.useEffect(() => {
    setLenderPreviousStep(`/start-process/${propertyId}/options`);
  }, [setLenderPreviousStep]);

  const OptionsDataList = [
    {
      id: 'options-data-002',
      value: true,
      label: 'Yes',
    },
    {
      id: 'options-data-001',
      value: false,
      label: 'No',
    },
  ];

  const handlePreApprovalAffiliateChange = (value: boolean) => {
    // updatePropertyPreference('preApprovalAffiliates', value);
    if (value) {
      setAnswer("Yes");
    } else {
      setAnswer("No");
    }
  };

  return (
    <>
      <PurchaseProcessStepLayout title='Would you like to obtain a pre-approval with our affiliates?'>
        <div className='flex w-[70%] flex-col space-y-6'>
          {OptionsDataList.map(({ id, value, label }) => (
            <button
              key={id}
              onClick={() => handlePreApprovalAffiliateChange(value)}
              className={cn(
                `w-full rounded-md border border-black px-4 py-3  text-black transition-all`,
                (combinedProcessState.propertyPreference
                  .preApprovalAffiliates === value || answer === label) &&
                'bg-black text-white hover:bg-black',
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
            href={`/start-process/${propertyId}/finance-process`}
            className='flex h-8 w-28 items-center justify-center rounded-full border-2 border-black bg-transparent px-12 py-2 text-center text-black'
          >
            Back
          </Link>
          <Link
            href={'/buy/browse'}
            className='px-8 py-2 font-bold text-ocOrange'
          >
            Cancel
          </Link>
        </div>

        <div className='flex flex-nowrap items-center gap-3'>
          <Button
            roundness='full'
            className='h-8 w-28 px-[4.5rem] py-2'
            disabled={answer === ""}
            // disabled={
            //   combinedProcessState.propertyPreference.preApprovalAffiliates ===
            //   null
            // }
            onClick={() => {
              // if (answer === "Yes") {
              //   const actualToken = token || localStorage.getItem('userAccessToken') || "";
              //   window.location.href = `${MORTGAGE_APPLICATION_URL}/start-process?listingId=${propertyId}&propertyId=${propertyData?.id}&means=${means}&pq=${propertyQuery}&token=${actualToken}`;
              // } else {
              //   router.push('/start-process/${propertyId}/spoken-to-lenders')
              // }
              router.push(`/start-process/${propertyId}/spoken-to-lenders`);
            }}
          >
            <Link
              href={""
                // combinedProcessState.propertyPreference
                //   .preApprovalAffiliates === true
                //   ? `/start-process/${propertyId}/add-agent`
                //   : `/start-process/${propertyId}/spoken-to-lenders`
              }
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

export default PreApprovalAffiliatesPage;
