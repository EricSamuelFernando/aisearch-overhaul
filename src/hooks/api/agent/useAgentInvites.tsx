import { error, success } from '@/components/alert/notify';
import {
  AgentInvitesResponse,
  ApiResponse,
  InvitePayload,
} from '@/interfaces/property.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AGENT_INVITE_RESPONSE, AGENT_PROPERTY_INVITES } from '@/utils/apis';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from '@/types/axios.types';
import { queryClient } from '@/providers/query-provider';

export const useFetchAgentInvites = (invitedBy?: string) => {
  const agentInvites = useQuery({
    queryKey: ['agent-properties-invites', invitedBy],
    queryFn: () => {
      return handleAsync<AxiosResponse<ApiResponse<AgentInvitesResponse>>>(
        client.get,
        AGENT_PROPERTY_INVITES,
        {
          params: {
            invitedBy,
          },
        },
      );
    },
  });

  const invitesActions = useMutation({
    mutationKey: ['accept-reject-invite'],
    mutationFn: async (data: InvitePayload) => {
      return handleAsync<AxiosResponse<InvitePayload>>(
        client.put,
        `${AGENT_INVITE_RESPONSE}`,
        data,
      );
    },
    onSuccess: (data) => {
      if ((data as any).status === 200) {
        success({ message: data?.data?.message });
        queryClient.invalidateQueries({
          queryKey: ['agent-properties-invites'],
        });
        queryClient.invalidateQueries({
          queryKey: ['agent-seller-properties'],
        });
        queryClient.invalidateQueries({
          queryKey: ['agent-buyer-properties'],
        });
      }
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  return { agentInvites, invitesActions };
};
