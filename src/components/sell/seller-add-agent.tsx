'use client';

import React from 'react';
import { AgentsProvider } from '@/providers/agent-list-provider';
import { Button } from '../ui/button';
import SellerAddAgentForm, {
  SellerAgentsCard,
} from '../seller-add-agent/seller-add-agent-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Props = {
  showGuidedTransaction?: boolean;
  onBack?: () => void;
  onSaveAndContinue?: () => void;
  setAgentInvited?: (invited: boolean) => void;
  agentInvited?: boolean;
  className?: string;
};

function SellerAddAgent({
  showGuidedTransaction = true,
  onBack,
  onSaveAndContinue,
  setAgentInvited,
  agentInvited,
  className,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id')!;

  const handleInviteAgentSuccess = () => {
    setAgentInvited?.(true);
  };

  const handleSaveAndContinue = () => {
    router.push(`/dashboard/seller/listing/listingprocess?id=${propertyId}`);
    setAgentInvited?.(false);
  };

  return (
    <AgentsProvider>
      <section className={cn('h-screen overflow-hidden', className)}>
        <div className='flex'>
          <div className='mt-14 h-full w-3/5 pl-4'>
            <SectionHeader className='font-medium' title='Add an agent' />
            <div className='w-full'>
              <AgentsProvider>
                <SellerAddAgentForm
                  showGuidedTransaction={showGuidedTransaction}
                  onSuccess={handleInviteAgentSuccess}
                />
              </AgentsProvider>
            </div>
          </div>

          <div className='mt-8 h-full w-2/5 pl-8'>
            <SellerAgentsCard />
          </div>
        </div>
        <section className='mt-[8.5rem] flex items-center justify-between'>
          <Link
            href={`http://localhost:3000/dashboard/seller/listing/listingprocess?id=${propertyId}`}
            className='rounded-full border-[1px] border-black px-10 py-1 font-bold text-black'
          >
            <span>Back</span>
          </Link>

          <section className='flex items-center'>
            <Button
              roundness='full'
              variant='default'
              className='border-[1px] px-10 py-1 font-bold text-white'
              onClick={
                agentInvited ? handleSaveAndContinue : handleInviteAgentSuccess
              }
            >
              <span>{agentInvited ? 'Save & Continue' : 'Continue'}</span>
            </Button>
          </section>
        </section>
      </section>
    </AgentsProvider>
  );
}

export default SellerAddAgent;
