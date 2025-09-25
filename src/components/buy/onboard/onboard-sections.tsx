'use client';

import { AddAgentProcess } from './add-agent';
import { PurchaseMeans } from './purchase-means';
import { useAddPreApprovals } from '@/shared/hooks/useAddPreapproval';

import { RealtorList } from './realtor-list';
import { PreApprovalScreen } from './pre-approval-section';
import { PreApprovalUpload } from './preapproval-upload';

export function OnboardSection() {
  const { currentStep } = useAddPreApprovals();
  switch (currentStep) {
    case 1:
      return (
        <section className='mx-auto grid min-h-[60vh] place-content-center gap-8 px-[3.219rem]  md:grid-cols-2'>
          <AddAgentProcess />
          <RealtorList />
        </section>
      );
    case 2:
      return <PreApprovalScreen />;
    case 3:
      return <PreApprovalUpload />;
    default:
      return <PurchaseMeans />;
  }
}
