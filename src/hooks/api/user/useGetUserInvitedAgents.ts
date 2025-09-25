import { useQuery } from '@tanstack/react-query';

import client, { pickErrorMessage, pickResult } from '@/lib/client';

export interface AgentMobile {
  number_body: string;
  mobile_extension: string;
  raw_mobile: string;
  _id?: string;
}

export interface Agent {
  _id: string;
  email: string;
  connectedUsers: string[];
  verification_code: string;
  token_expiry_time: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  firstname: string;
  fullname: string;
  lastname: string;
  licence_number: string;
  mobile: AgentMobile;
  region: string;
  completedOnboarding: boolean;
}

export interface AgentResponse {
  message: string;
  result: Agent[];
  total: number;
  page: number;
  limit: number;
  success: boolean;
}

const getUserInvitedAgents = async (): Promise<AgentResponse> => {
  return await client
    .get('agent/user/invited-agents')
    .then(pickResult, pickErrorMessage);
};

export const useGetUserInvitedAgents = () => {
  return useQuery<AgentResponse>({
    queryKey: ['userInvitedAgents'],
    queryFn: getUserInvitedAgents,
  });
};
