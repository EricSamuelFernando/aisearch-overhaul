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
  // API call removed - returning empty response to prevent multiple calls
  return {
    message: '',
    result: [],
    total: 0,
    page: 1,
    limit: 10,
    success: true,
  } as AgentResponse;
};

export const useGetUserInvitedAgents = () => {
  return useQuery<AgentResponse>({
    queryKey: ['userInvitedAgents'],
    queryFn: getUserInvitedAgents,
    enabled: false, // Disabled to prevent /agent/user/invited-agents API calls
  });
};
