'use client';

import React, { useMemo } from 'react';

import { IPropertiesResponse } from '@/interfaces/property.interface';
import { UseQueryResult } from '@tanstack/react-query';
import { PropertySearchQuery } from '@/types/property.types';
import { FilterType } from '@/types/global.types';
import { AxiosResponse } from '@/types/axios.types';
import { useFetchAgentProperties } from '@/hooks/api/agent/useFetchAgentProperty';

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
  setFilter: (payload: FilterType<PropertySearchQuery>) => void;
  resetFilter: () => void;
  filters: Partial<PropertySearchQuery>;
  handlePageChange: (page: number) => void;
  setQuery: any;
  propertyData: UseQueryResult<AxiosResponse<IPropertiesResponse>, Error>;
};

export const SellerAgentPropertiesContext =
  React.createContext<AgentCreatePropertyContextTypes | null>(null);

export function AgentSellerPropertiesProvider({
  children,
  url,
  type,
}: Readonly<{
  children: React.ReactNode;
  type: 'agent-seller-properties' | 'agent-buyer-properties';
  url: string;
}>) {
  const {
    propertyData,
    handlePageChange,
    filters,
    setFilter,
    resetFilter,
    setQuery,
  } = useFetchAgentProperties(url, type);

  const contextValue = useMemo(
    () => ({
      setFilter,
      resetFilter,
      setQuery,
      filters,
      propertyData,
      handlePageChange,
    }),
    [setFilter, resetFilter, setQuery, filters, propertyData, handlePageChange],
  );

  return (
    <SellerAgentPropertiesContext.Provider value={contextValue}>
      {children}
    </SellerAgentPropertiesContext.Provider>
  );
}

export function useSellerAgentPropertyContext() {
  const context = React.useContext<AgentCreatePropertyContextTypes | null>(
    SellerAgentPropertiesContext,
  );

  if (context === undefined) {
    throw new Error(
      'AgentCreatePropertiesContext must be used within a AgentPropertiesProvider',
    );
  }

  return context as AgentCreatePropertyContextTypes;
}
