'use client';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { error as errorNotify } from '@/components/alert/notify';
import {
  NewRealtor,
  RealtorProfile,
} from '@/components/buy/onboard/realtor-profile';
import CustomInput from '@/components/customs/input';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { cn, validateEmail } from '@/lib/utils';
import { useModalContext } from '@/providers/modal-provider';
import { Loader, Loader2 } from 'lucide-react';
import Link from 'next/link';
import useAgentsSearch from '../../hooks/api/user/useAgentsSearch';
import { Icons } from '../icons';
import { Skeleton } from '../ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';

type Props = {
  showGuidedTransaction?: boolean;
  onSuccess?: () => void;
};

function SellerAddAgentForm({
  showGuidedTransaction = false,
  onSuccess,
}: Props) {
  const [search, setSearch] = useState('');
  const { inviteAgentToProperty } = useHandleAgent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id')!;

  const handleContinueIndependently = () => {
    router.push(`/dashboard/seller/guided-transaction?id=${propertyId}`);
  };

  const handleSaveAndContinue = () => {
    router.push(`/dashboard/seller/listing/listingprocess?id=${propertyId}`);
  };

  const handleInvite = async () => {
    try {
      const response = await inviteAgentToProperty?.mutateAsync({
        agentEmail: search,
        propertyId: propertyId! as string,
      });

      if (response && response.data && response.data.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Invitation failed:', response?.data);
      }
    } catch (error) {
      console.error('Error inviting agent:', error);
    }
  };

  useEffect(() => {
    setSearch('');
  }, [inviteAgentToProperty.isSuccess]);

  return (
    <>
      <div className='mt-14 flex items-center gap-x-6'>
        <div className='w-1/2'>
          <CustomInput
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder='Enter email address'
            className='h-12 rounded-lg'
            containerClass='p-0 mb-0'
          />
        </div>
        <Button
          roundness='full'
          className='min-w-[150px] px-4 text-xs disabled:bg-black/60'
          onClick={handleInvite}
          disabled={inviteAgentToProperty?.isPending || !validateEmail(search)}
        >
          {inviteAgentToProperty?.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : null}
          {inviteAgentToProperty?.isPending ? 'Inviting...' : 'Invite'}
        </Button>
      </div>

      {showGuidedTransaction ? (
        <section className='flex items-start'>
          <div className='items-center text-center text-xl'>
            <p className='my-12 text-center text-lg font-medium text-ocGrey-100'>
              OR
            </p>
            <section className='flex items-center gap-x-2 font-medium'>
              <button onClick={handleContinueIndependently} className='text-lg'>
                Continue to transact independently
              </button>
              <Icons.Warning className='h-4 w-4' />
            </section>
          </div>
        </section>
      ) : null}
    </>
  );
}

export default SellerAddAgentForm;

export const SellerAgentsCard = ({
  headerText = 'Choose Realtor from the list',
}) => {
  const { openModal } = useModalContext();
  const limit = 3;
  const page = 1;
  const { data, isLoading } = useAgentsSearch('', limit, page);

  return (
    <div className='h-max max-w-md rounded-3xl bg-white p-10 px-12'>
      <Heading className='mb-10 p-0 text-2xl font-medium' title={headerText} />

      <div className='flex items-center justify-between'>
        {isLoading ? (
          <>
            <Skeleton className='h-20 w-full' />
          </>
        ) : (
          <>
            {data?.data.result.map((agent) => (
              <NewRealtor
                onClick={() => {
                  console.log(agent);
                }}
                key={agent._id}
                className={cn(
                  'rounded-2xl',
                  // agentInfo?._id === agent._id
                  //   ? 'bg-black text-white cursor-not-allowed'
                  //   : 'bg-grey-880'
                )}
                id={agent._id}
                realtorName={agent.fullname}
                address={agent.region}
              />
            ))}
          </>
        )}
      </div>

      {data?.data.result ? (
        <div className='mt-10 flex items-center justify-center'>
          <Button
            variant='secondary'
            onClick={() => openModal('select-agent')}
            className='border border-black bg-white px-6 font-semibold'
            roundness='full'
          >
            Load Directory
          </Button>
        </div>
      ) : null}
    </div>
  );
};
