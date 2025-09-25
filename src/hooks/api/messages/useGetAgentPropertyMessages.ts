import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import client from '@/lib/client';
import { pickErrorMessage, pickResult } from '@/lib/client';

const getAgentPropertyMessages = (
  propertyId: string,
  agentId: string,
): Promise<MessagesResponse> => {
  return client
    .get(`message/user/message-thread/${propertyId}/${agentId}`)
    .then(pickResult, pickErrorMessage);
};

export const useGetAgentPropertyMessages = (
  agentId: string,
  propertyId: string,
  options?: Omit<
    UseQueryOptions<MessagesResponse, Error>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<MessagesResponse, Error>({
    queryKey: ['get-connected-agents', propertyId, agentId],
    queryFn: () => getAgentPropertyMessages(propertyId, agentId),
    ...options,
  });
};
