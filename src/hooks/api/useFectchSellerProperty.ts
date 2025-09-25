import { handleAsync } from '@/lib/api/handleApiResponse';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { AxiosResponse } from '@/types/axios.types';
import { FETCH_BUYER_PROPERTY, FETCH_SELLER_PROPERTY } from '@/utils/apis';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  useQueryStates,
  parseAsInteger,
  parseAsFloat,
  parseAsString,
} from 'nuqs';

import { useRouteQueryUpdate } from '@/hooks/utils/useRouteQueryUpdate';
import {
  IPropertiesResponse,
  IProperty,
} from '@/interfaces/property.interface';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { FilterType } from '@/types/global.types';
import { getQueryFromUrl } from '../../lib/helpers';

export type PropertyQuery = {
  page?: number;
  limit?: number;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  sqTfMin?: number;
  sqTfMax?: number;
  bedRooms?: number;
  features?: string;
};

// Function to parse query parameters and create an object

const initialState: PropertyQuery = {
  page: 1,
  limit: 4,
  ...getQueryFromUrl(),
};

// Define actions that can be dispatched to modify the state
type Action =
  | {
      type: 'SET_FILTER';
      payload: { field: keyof PropertyQuery; value: string | number | object };
    }
  | { type: 'RESET_STATE' };

/**
 * @description Reducer function to handle state modifications based on actions.
 * @param {PropertyQuery} state - The current state of filters.
 * @param {Action} action - The action to be performed on the state.
 * @returns {PropertyQuery} The updated state after applying the action.
 */

export const useFetchUserProperties = (accountType: 'seller' | 'buyer') => {
  function PlaceReducer(state: PropertyQuery, action: Action): PropertyQuery {
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
      limit: parseAsInteger.withDefault(6),
      search: parseAsString,
      priceMin: parseAsFloat,
      priceMax: parseAsFloat,
      sqTfMin: parseAsFloat,
      sqTfMax: parseAsFloat,
      bedRooms: parseAsInteger,
      features: parseAsString,
    },
    { history: 'push' },
  );

  const [filters, dispatch] = React.useReducer(PlaceReducer, initialState);

  const setFilter = React.useCallback(
    (payload: FilterType<PropertyQuery>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    setQuery((q) => ({ ...q, ...initialState }));
  }, [dispatch, setQuery]);

  const filterData = React.useCallback(() => {
    return setQuery((q) => ({ ...q, ...filters }));
  }, [filters, setQuery]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      setQuery((q) => ({ ...q, page }));
      setFilter({ field: 'page', value: page });
    },
    [setFilter, setQuery],
  );

  storeCookie({ key: USER_ROLE, value: accountType });

  const endpoint =
    accountType === 'seller' ? FETCH_SELLER_PROPERTY : FETCH_BUYER_PROPERTY;

  const propertiesData = useQuery({
    queryKey: [`fetch-${accountType}-properties`, query],
    queryFn: () => {
      return handleAsync<AxiosResponse<IPropertiesResponse>>(
        client.get,
        FETCH_SELLER_PROPERTY,
        {
          params: query,
        },
      );
    },
  });

  return {
    propertiesData,
    setFilter,
    resetFilter,
    filterData,
    filters,
    handlePageChange,
    setQuery,
  };
};

export const useFetchBuyerEngagedProperties = () => {
  return useQuery({
    queryKey: ['fetch-buyer-engaged-properties'],
    queryFn: fetchBuyerProperty,
  });
};

type EngagedPropertiesResponse = {
  limit: number;
  page: number;
  properties: IProperty[];
  total: number;
};

const fetchBuyerProperty = async () =>
  await client
    .get('property/buyer/interacted-properties')
    .then(pickResult<EngagedPropertiesResponse>, pickErrorMessage);
