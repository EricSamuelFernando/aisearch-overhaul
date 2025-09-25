'use client';
import { useFetchUserProperties } from '@/hooks/api/useFectchSellerProperty';
import { IPropertiesResponse } from '@/interfaces/property.interface';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { AxiosResponse } from '@/types/axios.types';
import { PropertySearchQuery } from '@/types/property.types';
import { UseQueryResult } from '@tanstack/react-query';
import { ReactNode, createContext, useContext, useEffect } from 'react';
import { FilterType } from '../types/global.types';

export type QueryResponse<T> = {
  data: T | undefined;
  isFetching: boolean;
  isError: boolean;
};

export type Coordinate = {
  lat: number;
  lng: number;
};

export type PropertyContextTypes = {
  propertyData: UseQueryResult<AxiosResponse<IPropertiesResponse>, Error>;
  setFilter: (payload: FilterType<PropertySearchQuery>) => void;
  resetFilter: () => void;
  filters: PropertySearchQuery;
  filterData: () => void;
  handlePageChange: (page: number) => void;
  coordinates: Coordinate[] | undefined;
  setQuery: any;
};

export const SellerPropertiesContext =
  createContext<PropertyContextTypes | null>(null);

export function SellerPropertiesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    propertiesData,
    setFilter,
    resetFilter,
    filters,
    filterData,
    handlePageChange,
    setQuery,
  } = useFetchUserProperties('seller');

  useEffect(() => {
    storeCookie({ key: USER_ROLE, value: 'seller' });
  }, []);

  const coordinates: Coordinate[] | undefined =
    propertiesData.data?.data.data?.result.map((item) => ({
      lat: +item?.propertyAddressDetails?.latitude,
      lng: +item?.propertyAddressDetails?.longitude,
    }));

  return (
    <SellerPropertiesContext.Provider
      value={{
        propertyData: propertiesData,
        setFilter,
        resetFilter,
        filters,
        filterData,
        handlePageChange,
        coordinates,
        setQuery,
      }}
    >
      {children}
    </SellerPropertiesContext.Provider>
  );
}

export function useSellerPropertiesContext() {
  const context = useContext<PropertyContextTypes | null>(
    SellerPropertiesContext,
  );

  if (context === undefined) {
    throw new Error(
      'useSellerPropertiesContext must be used within a PropertiesProvider',
    );
  }

  return context as PropertyContextTypes;
}
