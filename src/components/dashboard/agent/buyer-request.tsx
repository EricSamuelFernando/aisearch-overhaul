import CustomAvatar from '@/components/customs/avatar';
import {
  AgentInvitesResponse,
  InvitePayload,
} from '@/interfaces/property.interface';
import { getInitials } from '@/lib/helpers';
import { UseMutationResult } from '@tanstack/react-query';
import React, { useState } from 'react';
import { AxiosResponse } from '../../../types/axios.types';
import { useFetchAgentInvites } from '../../../hooks/api/agent/useAgentInvites';

interface BuyerRequestProps {
  requestInfo: AgentInvitesResponse;
  actions: UseMutationResult<
    AxiosResponse<InvitePayload>,
    Error,
    InvitePayload,
    unknown
  >;
}

const BuyerRequest: React.FC<BuyerRequestProps> = ({
  requestInfo,
  actions,
}) => {
  const [loadCause, setLoadCause] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const { invitesActions } = useFetchAgentInvites();

  const acceptLoading = loadCause === 'ACCEPT' && invitesActions.isPending;
  const rejectLoading = loadCause === 'REJECT' && invitesActions.isPending;

  return (
    <section>
      <section className='rounded-[10px] bg-black px-3 py-[18px]'>
        <div className='mb-7 flex items-center'>
          <div>
            <CustomAvatar
              className='bg-black text-white'
              alt='Jane Doe'
              size={32}
            >
              {getInitials(
                requestInfo?.invitedBy?.firstname,
                requestInfo?.invitedBy?.firstname,
              )}
            </CustomAvatar>
          </div>
          <div className='ml-3'>
            <h3 className='text-lg text-white'>
              {requestInfo?.invitedBy?.fullname}
            </h3>
            <p className='text-sm text-gray-100'>
              {requestInfo?.property?.propertyAddressDetails?.formattedAddress}
            </p>
          </div>
        </div>
        <div>
          <aside className='flex items-center justify-between'>
            <button
              className='w-full rounded-full !border !border-white bg-black px-6 py-2 text-sm text-white'
              onClick={() => {
                setLoadCause('ACCEPT');
                invitesActions.mutate({
                  inviteId: requestInfo?._id,
                  response: 'accepted',
                });
              }}
              disabled={invitesActions.isPending}
            >
              {acceptLoading ? 'Loading...' : 'Accept'}
            </button>
            <button
              className='ml-6  w-full rounded-full !border !border-white bg-white px-6 py-2 text-sm text-black'
              onClick={() => {
                setLoadCause('REJECT');
                invitesActions.mutate({
                  inviteId: requestInfo?._id,
                  response: 'rejected',
                });
              }}
              disabled={invitesActions.isPending}
            >
              {rejectLoading ? 'Loading...' : 'Reject'}
            </button>
          </aside>
        </div>
      </section>
    </section>
  );
};

export default BuyerRequest;
