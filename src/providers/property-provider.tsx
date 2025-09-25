'use client';

import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import React from 'react';
import { useFetchProperties } from '../hooks/api/useFetchProperties';
import { ODataResponse } from '../interfaces/mls-data.interface';
import { FilterType } from '../types/global.types';
import { PropertySearchQuery } from '../types/property.types';

export type QueryResponse<T> = {
  data: T | undefined;
  isFetching: boolean;
  isError: boolean;
};

export type Coordinate = {
  lat: number;
  lng: number;
};

type PropertyContextTypes = {
  aiData: UseInfiniteQueryResult<InfiniteData<ODataResponse, unknown>, Error>;
  setFilter: (payload: FilterType<PropertySearchQuery>) => void;
  resetFilter: () => void;
  filters: PropertySearchQuery;
  filterData: () => void;
  handlePageChange: (page: number) => void;
  coordinates: Coordinate[] | undefined;
  setQuery: any;
};

export const PropertiesContext =
  React.createContext<PropertyContextTypes | null>(null);

export function PropertiesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    // propertiesData,
    setFilter,
    resetFilter,
    filters,
    filterData,
    handlePageChange,
    setQuery,
    aiData,
  } = useFetchProperties();

  const coords: Coordinate[] | undefined = React.useMemo(() => {
    return aiData.data?.pages[0]?.data?.value?.map((item) => ({
      lat: item.Latitude,
      lng: item.Longitude,
    }));
  }, []);

  const latndlng = aiData?.data?.pages[0]?.data?.value?.map((item) => ({
    lat: item.Latitude,
    lng: item.Longitude,
  }));

  return (
    <PropertiesContext.Provider
      value={{
        // propertyData: propertiesData,
        setFilter,
        resetFilter,
        filters,
        filterData,
        handlePageChange,
        coordinates: coords,
        setQuery,
        aiData,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function usePropertiesContext() {
  const context = React.useContext<PropertyContextTypes | null>(
    PropertiesContext,
  );

  if (context === undefined) {
    throw new Error(
      'PropertiesContext must be used within a PropertiesProvider',
    );
  }

  return context as PropertyContextTypes;
}
