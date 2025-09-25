'use client';

import { debounce } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Agent } from '@/interfaces/agent.interface';
import { useAgentList } from '@/shared/hooks/useAgentList';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { Icons } from '@/components/icons';
import { useModalContext } from '@/providers/modal-provider';
import { RealtorProfile } from '@/components/buy/onboard/realtor-profile';
import CustomInput from '../customs/input';
import { Button } from '../ui/button';
import useAgentsSearch from '@/hooks/api/user/useAgentsSearch';
import { Skeleton } from '../ui/skeleton';

export const AgentSelection = () => {
  const { closeModal } = useModalContext();
  const { getUserAgentList } = useHandleAgent();
  const { data: agentsData, refetch } = getUserAgentList;
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const result = await refetch();
      setAgents(result?.data?.data?.data?.result || []);
    };

    fetchAgents();
  }, [refetch]);

  return (
    <section className='h-full max-w-lg rounded-3xl bg-white'>
      <div className='flex items-center justify-end'>
        <Button
          className='mb-2 cursor-pointer'
          variant='ghost'
          size='icon'
          onClick={() => closeModal()}
        >
          <Icons.Close className='h-4 w-4 cursor-pointer' />
        </Button>
      </div>
      <AgentList />
    </section>
  );
};

const AgentList = () => {
  const { propertyId } = useParams<{ propertyId: string; item: string }>();
  const searchParams = useSearchParams();
  const paramsPropertyId = searchParams.get('id')!;

  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>(''); // Changed to single string
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const limit = 10;
  const page = 1;
  const { addAgentToProperty } = useHandleAgent();
  const { closeModal } = useModalContext();
  const { setAgentIsInvited } = useAgentList();

  const debouncedSearchCallback = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 500),
    [],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setSearch(value);
      debouncedSearchCallback(value);
    },
    [debouncedSearchCallback],
  );

  useEffect(() => {
    setSearch('');
  }, [addAgentToProperty.isSuccess]);

  const handleInvite = async () => {
    if (!selectedAgent) return;

    await addAgentToProperty?.mutateAsync({
      email: selectedAgent,
      propertyId: propertyId || paramsPropertyId,
    });

    closeModal();
    setAgentIsInvited(true);
  };

  const handleSelection = (email: string) => {
    setSelectedAgent(selectedAgent === email ? '' : email);
  };

  const { data, isLoading } = useAgentsSearch(debouncedSearch, limit, page);

  return (
    <section>
      <CustomInput
        placeholder='Search agent by name, location, zip'
        onChange={handleSearchChange}
      />
      <>
        {isLoading ? (
          <Skeleton className='h-24 w-full' />
        ) : (
          <>
            <div className='h-80 overflow-y-auto pb-30'>
              {data?.data.result.map((agent) => (
                <RealtorProfile
                  realtorName={agent.fullname}
                  key={agent._id}
                  id={agent._id}
                  onClick={() => handleSelection(agent.email)}
                  className='my-0 rounded-none bg-transparent pb-4'
                  address={agent.region}
                  isChecked={selectedAgent === agent.email}
                />
              ))}
            </div>
            <div className='mt-10 flex items-center justify-center'>
              {selectedAgent ? (
                <Button
                  onClick={handleInvite}
                  variant='outline'
                  roundness='full'
                >
                  {addAgentToProperty?.isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : null}
                  {addAgentToProperty?.isPending
                    ? 'Inviting...'
                    : 'Invite Selected Agent'}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </>
    </section>
  );
};
