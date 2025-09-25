import { useQuery } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import * as React from 'react';

import { PropertySearchQuery } from '@/types/property.types';
import { FilterType } from '@/types/global.types';
import { IPropertiesResponse } from '@/interfaces/property.interface';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { PROPERTIES } from '@/utils/apis';
import { ODataStrippedResponse } from '@/interfaces/mls-data.interface';
import { mlsDeploymentEnv } from '@/shared/constants/env';

interface FetchParams {
  pageParam?: string | unknown;
  query?: string;
  limit: number;
}

const initialState: PropertySearchQuery = {
  page: 1,
  limit: 20,
};

// Define actions that can be dispatched to modify the state
type Action =
  | {
      type: 'SET_FILTER';
      payload: {
        field: keyof PropertySearchQuery;
        value: string | number | object;
      };
    }
  | { type: 'RESET_STATE' }
  | { type: 'CHANGE_PAGE'; payload: { page: number } };

const Reducer = (
  state: PropertySearchQuery,
  action: Action,
): PropertySearchQuery => {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case 'RESET_STATE':
      return initialState;
    case 'CHANGE_PAGE':
      return {
        ...state,
        page: action.payload.page,
      };
    default:
      return state;
  }
};

const fetchAIData = async ({ pageParam = '', query, limit }: FetchParams) => {
  const url = `${mlsDeploymentEnv}/search`;
  return await axios
    .get(url, {
      params: { query, limit, page: pageParam },
    })
    .then(pickResult, pickErrorMessage);
};

const useFetchAIDBProperties = () => {
  const [filters, dispatch] = React.useReducer(Reducer, initialState);

  const allPropertyQuery = useQuery<IPropertiesResponse>({
    queryKey: ['get-all-property-query'],
    queryFn: async () => {
      return await client.get(PROPERTIES).then(pickResult, pickErrorMessage);
    },
  });

  const mlsPropertyQuery = useQuery<ODataStrippedResponse, Error>({
    queryKey: [
      'fetch-ai-property',
      'paginatedData',
      filters.search,
      filters.limit || 4,
    ],
    queryFn: async () => {
      return await fetchAIData({
        pageParam: filters.page || 1,
        query: filters.search || '',
        limit: filters.limit || 20,
      });
    },
  });

  const setFilter = React.useCallback(
    (payload: FilterType<PropertySearchQuery>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      dispatch({ type: 'CHANGE_PAGE', payload: { page } });
    },
    [dispatch],
  );

  return {
    filters,
    resetFilter,
    setFilter,
    handlePageChange,
    allPropertyQuery,
    mlsPropertyQuery,
  };
};

export { useFetchAIDBProperties };
