'use client';

import {
  AgentFilterType,
  AgentQuery,
  useFetchAgents,
} from '@/hooks/api/agent/useFetchAgent';
import { IAgentResponse } from '@/interfaces/agent.interface';
import { UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { AxiosResponse } from '../types/axios.types';

type AgentContextTypes = {
  agentData: UseQueryResult<AxiosResponse<IAgentResponse> | undefined, Error>;
  setFilter: (payload: AgentFilterType<AgentQuery>) => void;
  resetFilter: () => void;
  filters: AgentQuery;
  handleSearch: (search: string) => void;
  filterData: () => void;
};

export const AgentsContext = React.createContext<AgentContextTypes | null>(
  null,
);

type AgentsProviderProps = {
  children: React.ReactNode;
  className?: string;
};

export function AgentsProvider({
  children,
  className = '',
}: Readonly<AgentsProviderProps>) {
  const {
    agentData,
    setFilter,
    resetFilter,
    filterData,
    filters,
    handleSearch,
  } = useFetchAgents();

  const contextValue = useMemo(
    () => ({
      agentData,
      setFilter,
      resetFilter,
      handleSearch,
      filterData,
      filters,
    }),
    [agentData, setFilter, resetFilter, handleSearch, filterData, filters],
  );

  return (
    <div className={className}>
      <AgentsContext.Provider value={contextValue}>
        {children}
      </AgentsContext.Provider>
    </div>
  );
}

export function useAgentsContext() {
  const context = React.useContext<AgentContextTypes | null>(AgentsContext);

  if (context === undefined) {
    throw new Error('Agent Context must be used within an Agents Provider');
  }

  return context as AgentContextTypes;
}
