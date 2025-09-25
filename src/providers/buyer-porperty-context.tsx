'use client';
import {
  useMemo,
  useEffect,
  createContext,
  ReactNode,
  useContext,
} from 'react';
import { Coordinate, PropertyContextTypes } from './seller-property-context';
import { useFetchUserProperties } from '@/hooks/api/useFectchSellerProperty';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import FaqBuyerModal from '@/components/dashboard/user/faq-buyer-modal';

export const BuyerPropertiesContext =
  createContext<PropertyContextTypes | null>(null);

export function BuyerPropertiesProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const {
    propertiesData,
    setFilter,
    resetFilter,
    filters,
    filterData,
    handlePageChange,
    setQuery,
  } = useFetchUserProperties('buyer');

  useEffect(() => {
    storeCookie({ key: USER_ROLE, value: 'buyer' });
  }, []);

  const coordinates: Coordinate[] | undefined =
    propertiesData.data?.data.data?.result.map((item) => ({
      lat: +item?.propertyAddressDetails?.latitude,
      lng: +item?.propertyAddressDetails?.longitude,
    }));

  const contextValue = useMemo(
    () => ({
      propertyData: propertiesData,
      setFilter,
      resetFilter,
      filters,
      filterData,
      handlePageChange,
      coordinates,
      setQuery,
    }),
    [
      propertiesData,
      setFilter,
      resetFilter,
      filters,
      filterData,
      handlePageChange,
      coordinates,
      setQuery,
    ],
  );
  return (
    <BuyerPropertiesContext.Provider value={contextValue}>
      {children}
  
    </BuyerPropertiesContext.Provider>
  );
}

export function useBuyerPropertiesContext() {
  const context = useContext<PropertyContextTypes | null>(
    BuyerPropertiesContext,
  );

  if (context === undefined) {
    throw new Error(
      'useBuyerPropertiesContext must be used within a PropertiesProvider',
    );
  }

  return context as PropertyContextTypes;
}
