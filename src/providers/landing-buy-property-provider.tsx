'use client';

import * as React from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import { FilterType } from '@/types/global.types';
import { PropertySearchQuery } from '@/types/property.types';
import {
  IPropertiesResponse,
  IProperty,
  LandingPropertyListings,
  LandingPropertyListingShuffledSet,
  UnifiedLandingPropertiesType,
} from '@/interfaces/property.interface';
import { useFetchAIDBProperties } from '@/hooks/api/useFetchAI-DBPropeties';
import { ODataStrippedResponse } from '@/interfaces/mls-data.interface';
import useGoogleAuth from '@/hooks/api/auth/useGoogleAuth';
import GoogleOneTap from '@/hooks/api/auth/googleOneTap';
import { useSelector } from 'react-redux';

export type Coordinate = {
  lat: number;
  lng: number;
};

type LandingBuyPropertyContextTypes = {
  setFilter: (payload: FilterType<PropertySearchQuery>) => void;
  resetFilter: () => void;
  filters: PropertySearchQuery;
  handlePageChange: (page: number) => void;
  propertyListingsResult: UseQueryResult<IPropertiesResponse, Error>;
  propertyListings: LandingPropertyListings;
  loading: boolean;
  mlsPropertyQuery: UseQueryResult<ODataStrippedResponse, Error>;
};

function transform<T>(
  items: T[],
  type: T extends IProperty ? 'property' : 'mls',
): UnifiedLandingPropertiesType<T>[] {
  return items.map((item) => ({
    data: item,
    type,
  }));
}

const LandingBuyPropertyContext =
  React.createContext<LandingBuyPropertyContextTypes | null>(null);

const LandingBuyPropertyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { googleLogin } = useGoogleAuth();
  const userData = useSelector((state: { auth: { user: any,isLoggedIn:boolean } }) => state.auth);  
  const {
    allPropertyQuery: propertyListingsResult,
    mlsPropertyQuery,
    filters,
    resetFilter,
    setFilter,
    handlePageChange,
  } = useFetchAIDBProperties();

  const loading =
    propertyListingsResult.isFetching || mlsPropertyQuery.isFetching;

  const transformedData = React.useMemo(() => {
    let newData: LandingPropertyListings = [];
    if (propertyListingsResult.isSuccess || mlsPropertyQuery.isSuccess) {
      const mlsData = Array.isArray(mlsPropertyQuery.data?.value)
        ? transform(mlsPropertyQuery.data.value, 'mls')
        : [];
      const propertyData = Array.isArray(propertyListingsResult.data?.result)
        ? transform(propertyListingsResult.data.result, 'property')
        : [];

      try {
        const firstThreeMlsData = mlsData.slice(0, 3);
        const remainingData = mlsData.slice(3);

        const combinedData = [...remainingData, ...propertyData];

        const shuffledSet = new Set<LandingPropertyListingShuffledSet>();

        while (shuffledSet.size < combinedData.length) {
          const randomIndex = Math.floor(Math.random() * combinedData.length);
          shuffledSet.add(combinedData[randomIndex]);
        }

        const shuffledArray = Array.from(shuffledSet);

        newData = [...firstThreeMlsData, ...shuffledArray];
      } catch (error) {
        newData = [];
        throw new Error(`${error}`);
      }
    } else {
      newData = [];
    }

    return newData;
  }, [
    propertyListingsResult.isSuccess,
    propertyListingsResult.data,
    mlsPropertyQuery.data,
    mlsPropertyQuery.isSuccess,
  ]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '448512456564-p64marq9uat5onc9ncj0mr69uol806s4.apps.googleusercontent.com';
  const hasValidClientId = googleClientId && googleClientId.trim().length > 0;

  return (
    <>
    {userData?.isLoggedIn || !hasValidClientId ? null :
      <GoogleOneTap />
    }
      <LandingBuyPropertyContext.Provider
        value={{
          filters,
          resetFilter,
          setFilter,
          propertyListingsResult,
          handlePageChange,
          loading,
          propertyListings: transformedData,
          mlsPropertyQuery,
        }}
      >
        {children}
      </LandingBuyPropertyContext.Provider>
    </>
  );
};

const useLandingBuyPropertiesContext = () => {
  const context = React.useContext<LandingBuyPropertyContextTypes | null>(
    LandingBuyPropertyContext,
  );

  if (context === undefined) {
    throw new Error(
      'PropertiesContext must be used within a PropertiesProvider',
    );
  }

  return context as unknown as LandingBuyPropertyContextTypes;
};

export {
  LandingBuyPropertyContext,
  LandingBuyPropertyProvider,
  useLandingBuyPropertiesContext,
};
