'use client';

import { error as errorNotify } from '@/components/alert/notify';
import { useForm } from '@mantine/form';
import { useSearchParams } from 'next/navigation';
import { FormEventHandler, useEffect } from 'react';

import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { cn, validateEmail } from '@/lib/utils';

import {
  useAddPreApprovals,
  usePreapprovalActions,
} from '@/shared/hooks/useAddPreapproval';
import { Realtor } from '.';

import CustomInput from '@/components/customs/input';
import { ButtonLoader } from '@/components/loader';
import SkeletonLoader from '@/components/skeleton-loader';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { useAgentsContext } from '@/providers/agent-list-provider';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

function AddAgentForm() {
  const { setSelectedAgent, setCurentStep, resetState } =
    usePreapprovalActions();
  const { handleSearch, agentData } = useAgentsContext();
  const params = useSearchParams();
  const { userPath } = useCurrentUser();

  const id = params?.get('id');
  const search = params?.get('user');

  const prevState = useAddPreApprovals();

  const { addAgentToProperty } = useHandleAgent();
  const agents = agentData?.data?.data?.data?.result;
  const loading = agentData?.isLoading || agentData?.isFetching;
  const { agent: agentInfo } = prevState;
  const {
    mutate: addAgent,
    isPending: addPending,
    isSuccess,
    error,
  } = addAgentToProperty;
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: '',
    },
  });
  const debouncedEmail = useDebounce(form.values.email, 500);

  useEffect(() => {
    if (!debouncedEmail) return;

    if (debouncedEmail) {
      handleSearch(debouncedEmail);
    }
  }, [debouncedEmail]);

  const handleSubmit: FormEventHandler<HTMLFormElement> | undefined = (e) => {
    e.preventDefault();
  };

  const handleInvite = async () => {
    if (validateEmail(form.values.email)) {
      await addAgentToProperty.mutate({
        email: form.values.email,
        propertyId: id as string,
      });
    } else {
      errorNotify({
        message: 'Please provide a valid Email',
      });
      return;
    }
  };

  const handleAddAgent = async () => {
    addAgent({ email: agentInfo?.email!, propertyId: id as string });
  };

  if (isSuccess || (error && error?.response?.status === 400)) {
    if (user?.preApproval) {
      if (search === 'seller') {
        resetState();
      } else {
        router.push(`${userPath}/property/${id}`);
        resetState();
      }
      resetState();
    } else {
      setCurentStep(2);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-[400px]'>
      <div className='my-4 space-y-8'>
        <CustomInput
          {...form.getInputProps('email')}
          type='email'
          placeholder='Enter agent’s Info'
        />

        <div className='h-[380px] space-y-4 overflow-y-auto'>
          {loading ? <SkeletonLoader className='h-[100px] w-full' /> : null}

          {!loading && agents && agents.length > 0
            ? agents?.map((agent) => {
                return (
                  <Realtor
                    onClick={() => {
                      setSelectedAgent(agent);
                    }}
                    key={agent?._id}
                    className={cn(
                      'rounded-2xl p-4',
                      agentInfo?._id === agent._id
                        ? 'cursor-not-allowed bg-black text-white'
                        : 'bg-grey-880',
                    )}
                    id={agent._id}
                    realtorName={agent.fullname}
                  />
                );
              })
            : null}

          {!loading && agents && agents.length < 1 ? (
            <div className='text-small flex items-center gap-x-2'>
              <span className='font-[500]'>
                Your agent not listed on our platform?
              </span>{' '}
              <span
                onClick={handleInvite}
                className='cursor-pointer font-bold underline'
              >
                Invite them
              </span>
              {addAgentToProperty.isPending ? (
                <span>
                  <ButtonLoader />
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <Button
        disabled={addPending || !agentInfo?._id}
        onClick={handleAddAgent}
        className={cn(
          'my-4  min-w-[150px] font-bold',
          agentInfo?._id ? 'cursor-pointer' : 'cursor-not-allowed',
        )}
      >
        {addPending ? <ButtonLoader /> : null}
        {user?.preApproval ? 'Add Agent' : 'Next'}
      </Button>
    </form>
  );
}

export { AddAgentForm };
