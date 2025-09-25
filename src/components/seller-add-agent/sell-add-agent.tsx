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

import { cn, validateEmail } from '@/lib/utils';
import { useModalContext } from '@/providers/modal-provider';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import useAgentsSearch from '../../hooks/api/user/useAgentsSearch';
import { Icons } from '../icons';
import { Skeleton } from '../ui/skeleton';

import { ActionButton } from '@/components/ui/action-button';
import { InputField } from '@/components/ui/propertyInput';
import { AgentsProvider } from '@/providers/agent-list-provider';
import { AgentsCard } from '@/components/add-agent/add-agent-form';
import CustomButton from '@/components/shared/custom-button';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';

interface AddAgentPageProps {
  onBack: () => void;
  onSaveAndContinue: () => void;
  setAgentInvited: (invited: boolean) => void;
}

const SelerAddAgentForm: React.FC<AddAgentPageProps> = ({
  onBack,
  onSaveAndContinue,
  setAgentInvited,
}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [emails, setEmails] = useState<string[]>([]);
  const [inviteSuccessful, setInviteSuccessful] = useState<boolean>(false);
  const { inviteAgentToUserProfile } = useHandleAgent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id')!;

  const handleInvite = async () => {
    if (emailInput.trim() === '') return;

    const newEmails = [...emails, emailInput.trim()];
    setEmails(newEmails);

    try {
      await inviteAgentToUserProfile.mutateAsync({ emails: newEmails });
      setAgentInvited(true);
      setInviteSuccessful(true);
      setEmailInput('');
    } catch (error) {
      console.error('Error while inviting agent:', error);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(event.target.value);
  };

  const handleContinueIndependently = () => {
    router.push(`/dashboard/seller/guided-transaction?id=${propertyId}`);
  };

  const handleSaveAndContinue = () => {
    router.push(`/dashboard/seller/listing/listingprocess?id=${propertyId}`);
  };

  return (
    <AgentsProvider>
      <section className='flex h-screen-nav flex-col justify-between pt-8'>
        <section className='flex'>
          <section className='flex flex-1 flex-col justify-center'>
            <h2 className='mb-6 text-6xl font-medium'>Add an agent</h2>
            <div className='flex items-center'>
              <InputField
                label=''
                placeholder='Enter email address'
                name={''}
                onChange={handleEmailChange}
                value={emailInput}
              />

              <Button
                roundness='full'
                variant='default'
                className={`${
                  emailInput ? 'bg-black' : 'bg-ocGrey-100'
                } ml-4 border-[1px] px-10 py-1 font-bold text-white`}
                onClick={handleInvite}
              >
                <span>Invite</span>
              </Button>
            </div>
            <section className='flex items-start'>
              <div className='text-2xl'>
                <p className='my-8 text-center font-medium text-ocGrey-100'>
                  OR
                </p>
                <p className='font-medium'>
                  <button
                    onClick={handleContinueIndependently}
                    className='mt-4 text-xl'
                  >
                    Continue to transact independently
                  </button>
                </p>
              </div>
            </section>
          </section>

          <div className='mt-4 flex items-start pl-24'>
            <div className='rounded-lg'>
              <SellerAgentsCard headerText='Choose Realtor from the list' />
            </div>
          </div>
        </section>
        <section className='flex w-full items-center justify-between pb-10'>
          <div>
            <Button
              roundness='full'
              variant='outline'
              className='border-[1px] border-black px-10 py-1 font-bold text-black'
              onClick={onBack}
            >
              <span>Back</span>
            </Button>
          </div>
          <div>
            <Button
              roundness='full'
              variant='default'
              className='border-[1px] px-10 py-1 font-bold text-white'
              onClick={handleSaveAndContinue}
            >
              <span>{inviteSuccessful ? 'Save & Continue' : 'Continue'}</span>
            </Button>
          </div>
        </section>
      </section>
    </AgentsProvider>
  );
};

export default SelerAddAgentForm;

export const SellerAgentsCard = ({ headerText = 'Choose Snaphomz Agents' }) => {
  const { openModal } = useModalContext();
  const limit = 3;
  const page = 1;
  const { data, isLoading } = useAgentsSearch('', limit, page);

  return (
    <div className='h-max max-w-md rounded-3xl bg-white p-10 px-8'>
      <Heading className='mb-10 p-0 text-2xl font-medium' title={headerText} />

      <div className='flex items-center justify-between gap-x-6'>
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
