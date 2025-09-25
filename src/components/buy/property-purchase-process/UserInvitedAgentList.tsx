'use client';
import * as React from 'react';

import { sellerGetInitials } from '@/lib/helpers';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import SkeletonLoader from '@/components/skeleton-loader';
import { Button } from '@/components/ui/button';

interface UserInvitedAgentListProps {
  displayAgent: boolean;
  meansType?:string;
  toggleDisplayAgent: (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
  ) => void;
}

const UserInvitedAgentList: React.FC<UserInvitedAgentListProps> = ({
  displayAgent,
  meansType,
  toggleDisplayAgent,
}) => {
  const { getUserAgentList } = useHandleAgent();

  const { data, isLoading, isFetching } = getUserAgentList;
  const loading = isLoading || isFetching;
  const agents = data?.data?.data?.result;

  return (
    <div className='flex flex-col space-y-7'>
      {!displayAgent ? (
        <div className='inline-flex items-center space-x-2'>
          {/* <p className='text-lg font-medium text-black'>
            Have an agent saved in your account?
          </p> */}
          {/* <div
            className='pointer-events-auto cursor-pointer border-b-2 border-black text-lg font-bold text-black'
            onClick={toggleDisplayAgent}
          >
            Choose Profile
          </div> */}
        </div>
      ) : (
        <>
          <div className='inline-flex items-center space-x-2'>
            <p className='text-lg font-medium text-black'>
              Have an agent saved outside here?
            </p>
            <div
              className='pointer-events-auto cursor-pointer border-b-2 border-black text-lg font-bold text-black'
              onClick={toggleDisplayAgent}
            >
              Invite Them
            </div>
          </div>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SelectCardLoader key={i.toString()} />
            ))
          ) : Array.isArray(agents) && agents.length > 0 ? (
            agents.map((agent, index) => (
              <AgentSelectCard
                key={index.toString() + agent._id}
                fullName={agent.fullname}
                address={agent.region}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDisplayAgent(e);
                }}
              />
            ))
          ) : (
            <div className='text-xl font-semibold capitalize leading-6 text-black'>
              No agent found on your profile
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface AgentSelectCardProps {
  fullName?: string;
  address?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AgentSelectCard: React.FC<AgentSelectCardProps> = ({
  fullName = 'N/A',
  address,
  onClick,
}) => (
  <div className='flex w-2/4 items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm'>
    <div className='mb-4 flex items-start space-x-4'>
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black'>
        {sellerGetInitials(fullName)}
      </div>
      <div>
        <h2 className='text-base font-semibold leading-7 text-black'>
          {fullName}
        </h2>
        <p className='text-md text-black'>{address || 'Unknown'}</p>
      </div>
    </div>
    <Button
      variant='secondary'
      className='border border-black bg-white px-[3rem] font-semibold'
      roundness='full'
      onClick={onClick}
    >
      Select
    </Button>
  </div>
);

const SelectCardLoader = () => (
  <div className='flex w-2/4 items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm'>
    <div className='mb-4 flex items-start space-x-4'>
      <SkeletonLoader className='h-16 w-16 rounded-full' />
      <div className='flex flex-col gap-4'>
        <SkeletonLoader className='h-5 w-28' />
        <SkeletonLoader className='h-3 w-20' />
      </div>
    </div>
    <SkeletonLoader className='h-12 w-36 rounded-full' />
  </div>
);

export { UserInvitedAgentList };
