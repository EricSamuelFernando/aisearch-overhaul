'use client';

import Link from 'next/link';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PurchaseProcessStepLayout } from '@/components/buy/property-purchase-process/StepLayout';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { useAuth } from '@/shared/hooks/useAuth';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { error } from '@/components/alert/notify';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';

const SpokenToLendersPage: React.FC = () => {
  const router = useRouter();
  const { propertyId } = useParams<{ propertyId: string }>();
  const {
    combinedProcessState,
    updatePropertyPreference,
    initializeFromUser,
    setAgentPreviousStep,
    lenderPreviousStep,
  } = usePurchaseProcessStore();
  const { user } = useAuth();
  const [withLenders, setWithLenders] = React.useState(combinedProcessState.propertyPreference.workWithLender)
  const currentUser = useSelector(userData);
  const engagementData = useSelector((state: any) => state.property?.property);
  const { propertyEngagementMutation } = usePropertyAPI();
  React.useEffect(() => {
    if (user?.propertyPreference) {
      // @ts-ignore
      initializeFromUser(user.propertyPreference);
    }
  }, [user, initializeFromUser]);

  const OptionsDataList = [
    {
      id: 'options-data-001',
      value: false,
      label: 'No',
    },
    {
      id: 'options-data-002',
      value: true,
      label: 'Yes',
    },
  ];

  const handleNext = () => {
    const meanType = localStorage.getItem("means")
    console.log("With lenders : ", typeof withLenders, withLenders);

    if (!withLenders) {
      console.log("SDFFSDFs");
      router.back()
    } else {
      propertyEngagementMutation.mutate(
        {
          propertyName: engagementData?.listing?.courtesyOf,
          price: engagementData?.listing?.listPriceLow,
          listingId: +engagementData?.listingId,
          propertyId: engagementData?.id,
          city: engagementData?.address?.city || "Los angeles",
          zipCode: engagementData?.listing?.address?.zipCode,
          // province: engagementData?.listing?.address?.stateOrProvince,
          propertyAddress: engagementData?.listing?.address?.unparsedAddress,
          propertyImage: engagementData?.listing?.media?.primaryListingImageUrl,
          userId: currentUser?.id,
          answers: undefined,
          propertyProgress: 10,
          fullAddress: `${engagementData?.public?.address?.label}, USA`
        }, {
        onSuccess: (response: any) => {
          console.log("Response   ", response);
          const engagementId = response?.data?.createEngagement?.id;
          router.push(`/dashboard/buyer/property/${propertyId}/add-agent?engagementId=${engagementId}&mean_type=${meanType}`)
          // router.push("/dashboard/buyer")
        }
      }
      )
    }
  }

  React.useEffect(() => {
    setAgentPreviousStep(`/start-process/${propertyId}/spoken-to-lenders`);
  }, [setAgentPreviousStep]);

  const backHref = React.useMemo(() => {
    if (lenderPreviousStep) {
      return lenderPreviousStep;
    } else {
      return `/start-process/${propertyId}/finance-process`;
    }
  }, [lenderPreviousStep, propertyId]);

  const handleWorkWithLenderChange = (value: boolean) => {
    console.log("Valuesss :", value);
    setWithLenders(value)
    updatePropertyPreference('workWithLender', value);
  };

  return (
    <>
      <PurchaseProcessStepLayout title='Do you want to work with a lender and upload your pre-approval?'>
        <div className='flex w-[70%] flex-col space-y-6'>
          {OptionsDataList.map(({ id, value, label }) => (
            <button
              key={id}
              onClick={() => handleWorkWithLenderChange(value)}
              className={cn(
                `w-full rounded-md border border-black px-4 py-3 text-black transition-all`,
                combinedProcessState.propertyPreference.workWithLender ===
                value && 'bg-black text-white hover:bg-black',
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
            disabled={
              combinedProcessState.propertyPreference.workWithLender === null
            }
          >
            <Link
              href={``}
              onClick={handleNext}
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

export default SpokenToLendersPage;
