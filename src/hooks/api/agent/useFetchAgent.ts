import { error } from '@/components/alert/notify';
import { IAgentResponse } from '@/interfaces/agent.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AxiosResponse } from '@/types/axios.types';
import {
  ADD_AGENT_TO_PROPERTY,
  GET_USER_AGENT_LIST,
  INVITE_AGENT,
  SEARCH_AGENT,
  VERIFY_OWNERSHIP,
  INVITE_USER_AGENT,
  INVITE_AGENT_TO_PROPERTY,
} from '@/utils/apis';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import React from 'react';
import { success } from '../../../components/alert/notify';

export type AgentFilterType<T> = {
  field: keyof T;
  value: string;
};

export type AgentQuery = {
  search?: string;
  page: number;
  limit: number;
};

// Define actions that can be dispatched to modify the state
type Action =
  | {
      type: 'SET_FILTER';
      payload: { field: keyof AgentQuery; value: string };
    }
  | { type: 'RESET_STATE' };

const initialState: AgentQuery = {
  search: '',
  page: 1,
  limit: 4,
};

/**
 * @description Reducer function to handle state modifications based on actions.
 * @param {AgentQuery} state - The current state of filters.
 * @param {Action} action - The action to be performed on the state.
 * @returns {AgentQuery} The updated state after applying the action.
 */

export const useFetchAgents = () => {
  function AgentReducer(state: AgentQuery, action: Action): AgentQuery {
    switch (action.type) {
      case 'SET_FILTER':
        return {
          ...state,
          [action.payload.field]: action.payload.value,
        };
      case 'RESET_STATE':
        return initialState;
      default:
        return state;
    }
  }

  const [query, setQuery] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      search: parseAsString,
    },
    { history: 'push' },
  );

  const [filters, dispatch] = React.useReducer(AgentReducer, initialState);

  const setFilter = React.useCallback(
    (payload: AgentFilterType<AgentQuery>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    setQuery((q) => ({ ...q, ...initialState }));
  }, [dispatch]);

  const filterData = React.useCallback(() => {
    return setQuery((q) => ({ ...q, ...filters }));
  }, [filters]);

  const handleSearch = React.useCallback((search: string) => {
    setQuery((q) => ({ ...q, search }));
    setFilter({ field: 'search', value: search });
  }, []);

  const agentData = useQuery({
    queryKey: ['agent-info', query],
    queryFn: () => {
      // API call removed - returning empty response to prevent multiple calls
      return Promise.resolve({
        data: {
          message: '',
          result: [],
          total: 0,
          page: 1,
          limit: 10,
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as unknown as AxiosResponse<IAgentResponse>);
    },
    enabled: false, // Disabled to prevent /agent/search API calls
  });

  const agents = {
    agentData,
    setFilter,
    resetFilter,
    filterData,
    filters,
    handleSearch,
  };

  return agents;
};

export const useHandleAgent = () => {
  const getUserAgentList = useQuery({
    queryKey: ['user-agent-list'],
    queryFn: () => {
      // API call removed - returning empty response to prevent multiple calls
      return Promise.resolve({
        data: {
          message: '',
          result: [],
          total: 0,
          page: 1,
          limit: 10,
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as unknown as AxiosResponse<IAgentResponse>);
    },
    enabled: false, // Disabled to prevent /agent/user/invited-agents API calls
  });

  const inviteAgentToProperty = useMutation({
    mutationKey: ['invite-agent-to-property'],
    mutationFn: async (data: { agentEmail: string; propertyId: string }) => {
      return await client.post(INVITE_AGENT_TO_PROPERTY, {
        agentEmail: data.agentEmail,
        propertyId: data.propertyId,
      });
    },

    onSuccess: (data) => {
      if ((data as any).status === 200) {
        console.log(data);

        success({ message: 'Invitation to the agent was sent successfully' });
      }
    },

    onError: (err: any) => {
      console.log(err);

      error({ message: err?.response?.data?.message });
    },
  });

  const inviteAgentToUserProfile = useMutation({
    mutationKey: ['invite-agent-to-user-profile'],
    mutationFn: async (data: { emails: string[] }) => {
      return await client.post(INVITE_USER_AGENT, {
        emails: data.emails,
      });
    },
    onSuccess: (data) => {
      if ((data as any).status === 200) {
        success({ message: 'Invitation to the agent was sent successfully' });
      }
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const inviteAgent = useMutation({
    mutationKey: ['invite-agent-to-user-profile'],
    mutationFn: async (data: { emails: string[] }) => {
      return await client.post(INVITE_USER_AGENT, {
        emails: data.emails,
      });
    },
    onSuccess: (data) => {
      if ((data as any).status === 200) {
        success({ message: 'Invitation to the agent was sent successfully' });
      }
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const addAgentToProperty = useMutation({
    mutationKey: ['add-agent-to-property'],
    mutationFn: async (data: { email: string; propertyId: string }) => {
      return await client.post(ADD_AGENT_TO_PROPERTY, {
        agentEmail: data?.email,
        propertyId: data.propertyId,
      });
    },

    onSuccess: (data) => {
      if (data) {
        success({ message: 'Invitation to the agent was sent successfully' });
      }
    },

    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const getAgents = useQuery({
    queryKey: ['agent-list'],
    queryFn: () => {
      // API call removed - returning empty response to prevent multiple calls
      return Promise.resolve({
        data: {
          message: '',
          result: [],
          total: 0,
          page: 1,
          limit: 10,
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as unknown as AxiosResponse<IAgentResponse>);
    },
    enabled: false, // Disabled to prevent /agent/search API calls
  });

  const verifyOwnership = useMutation({
    mutationKey: ['verify-ownership'],
    mutationFn: async ({
      propertyOwnershipDetails,
      proofOfOwnership,
      propertyId,
    }: {
      propertyOwnershipDetails: { nameOnProperty: string; email: string };
      proofOfOwnership: {
        name: string;
        url: string;
        thumbNail: string;
        documentType: string;
      }[];
      propertyId: string;
    }) => {
      const response = await client.post(`${VERIFY_OWNERSHIP}/${propertyId}`, {
        propertyOwnershipDetails,
        proofOfOwnership,
      });
      return response.data;
    },
    onSuccess: () => {
      success({ message: 'Property verification is underway!.' });
    },
    onError: (err: any) => {
      error({
        message:
          err?.response?.data?.message || 'Error occurred during verification.',
      });
    },
  });

  return {
    getUserAgentList,
    inviteAgentToProperty,
    getAgents,
    addAgentToProperty,
    inviteAgentToUserProfile,
    verifyOwnership,
  };
};
