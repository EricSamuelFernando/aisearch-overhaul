'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';

import { ODataResponse } from '@/interfaces/mls-data.interface';
import { FilterType } from '@/types/global.types';
import {
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import aiClient from '../../lib/ai-client';
import { getQueryFromUrl } from '../../lib/helpers';
import { PropertySearchQuery } from '../../types/property.types';

import queryString from 'query-string';
import axios from 'axios';
import { PROPERTY_SEARCH_AI_URL, mlsDeploymentEnv } from '@/shared/constants/env';

interface Params {
  [key: string]: string | number | null | undefined;
}

function removeNulls(params: Params) {
  const result: Params = {};

  Object.keys(params).forEach((key) => {
    const val = params[key];

    if (val !== undefined && val !== null) result[key] = val;
  });

  return result;
}

// fetchAIProperty change
export const fetchAIProperty = async (
  params: UserQueryParams,
  nextLink?: string,
) => {

  const res = await aiClient.post(`/`, params, {
    baseURL: PROPERTY_SEARCH_AI_URL,
  });
  return res.data;
};

interface FetchParams {
  pageParam?: string | unknown;
  query?: string;
  limit: number;
}

// fetchPaginatedData change
const fetchPaginatedData = async ({
  pageParam = '',
  query,
  limit,
}: FetchParams): Promise<ODataResponse> => {
  // API call removed - returning empty response to prevent multiple calls
  return {
    data: {
      value: [],
      '@odata.nextLink': null,
    },
  } as any;
};

const initialState: PropertySearchQuery = {
  page: 1,
  limit: 4,
  // search: sessionStorage.getItem('query') || '',
  // search: 'Show me houses in chicago with 2 bedrooms and one bath',
  // ...getQueryFromUrl(),
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
  | { type: 'RESET_STATE' };

export const useFetchProperties = () => {
  function PlaceReducer(
    state: PropertySearchQuery,
    action: Action,
  ): PropertySearchQuery {
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
      page: parseAsInteger,
      limit: parseAsInteger,
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
    (payload: FilterType<PropertySearchQuery>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    setQuery((q) => {
      const query = { ...initialState };
      return query;
    });
  }, [dispatch, setQuery]);

  const filterData = React.useCallback(() => {
    return setQuery((q) => {
      const query = { ...q, ...filters };
      return query;
    });
  }, [filters, setQuery]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      setFilter({ field: 'page', value: page });

      setQuery((q) => {
        const query = { ...q, page };
        return query;
      });
    },
    [setFilter, setQuery],
  );

  const aiData = useInfiniteQuery<ODataResponse, Error>({
    queryKey: [
      'fetch-ai-property',
      'paginatedData',
      query.search,
      query.limit || 4,
    ],
    queryFn: ({ pageParam = '' }) => {
      return fetchPaginatedData({
        pageParam,
        query: query.search || '',
        limit: query.limit || 4,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: ODataResponse, pages: ODataResponse[]) =>
      lastPage.data['@odata.nextLink'] || null,
    enabled: false, // Disabled - /search route is not available in backend
  });

  const Properties = {
    // propertiesData,
    setFilter,
    resetFilter,
    filterData,
    filters,
    handlePageChange,
    setQuery,
    aiData,
  };

  return Properties;
};

type UserQueryParams = {
  take?: number;
  lastCursor?: string;
  question?: string;
};

export const useFetchAiProperty = (question: string) => {
  const aiData = useInfiniteQuery<ODataResponse, Error>({
    queryKey: ['fetch-ai-property'],
    queryFn: () => {
      return fetchAIProperty({ question });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, pages: ODataResponse[]) =>
      lastPage.data?.['@odata.nextLink'] || lastPage['@odata.nextLink'],
  });

  return aiData;
};
