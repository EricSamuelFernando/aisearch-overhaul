'use client';

import React, { useMemo } from 'react';
import { FilterType } from '@/types/global.types';
import {
  PropertyQuery,
  useAgentProperty,
} from '@/hooks/api/agent/useAddAgentProperty';

export type QueryResponse<T> = {
  data: T | undefined;
  isFetching: boolean;
  isError: boolean;
};

export type Coordinate = {
  lat: number;
  lng: number;
};

type AgentCreatePropertyContextTypes = {
  setFilter: (payload: FilterType<Partial<PropertyQuery>>) => void;
  resetFilter: () => void;
  filters: Partial<PropertyQuery>;
  setQuery: React.Dispatch<React.SetStateAction<Partial<PropertyQuery>>>;
  view: 'list' | 'grid';
  setView: React.Dispatch<React.SetStateAction<'list' | 'grid'>>;
};

export const AgentCreatePropertiesContext =
  React.createContext<AgentCreatePropertyContextTypes | null>(null);

export function AgentPropertiesProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { filters, setFilter, resetFilter, setQuery, view, setView } =
    useAgentProperty();

  const contextValue = useMemo(
    () => ({
      setFilter,
      resetFilter,
      setQuery,
      filters,
      view,
      setView,
    }),
    [setFilter, resetFilter, setQuery, filters, view, setView],
  );

  return (
    <AgentCreatePropertiesContext.Provider value={contextValue}>
      {children}
    </AgentCreatePropertiesContext.Provider>
  );
}

export function useAgentCreatePropertyContext() {
  const context = React.useContext<AgentCreatePropertyContextTypes | null>(
    AgentCreatePropertiesContext,
  );

  if (context === undefined) {
    throw new Error(
      'AgentCreatePropertiesContext must be used within a AgentPropertiesProvider',
    );
  }

  return context as AgentCreatePropertyContextTypes;
}
