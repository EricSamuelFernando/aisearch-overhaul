import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPropertiesResponse } from '@/interfaces/property.interface';
import { getQueryFromUrl } from '@/lib/helpers';
import {
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { PropertySearchQuery } from '../../../types/property.types';
import { FilterType } from '../../../types/global.types';
import { AxiosResponse } from '../../../types/axios.types';

// Define initial state for filters
const initialState: PropertySearchQuery = {
  page: 1,
  limit: 4,
  ...getQueryFromUrl(),
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

export const useFetchAgentProperties = (url: string, queryKey: string) => {
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
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(4),
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
      const query = { ...q, ...initialState };
      return query;
    });
  }, [dispatch]);

  const filterData = React.useCallback(() => {
    return setQuery((q) => ({ ...q, ...filters }));
  }, [filters]);

  const handlePageChange = React.useCallback((page: number) => {
    setQuery((q) => ({ ...q, page }));
    setFilter({ field: 'page', value: page });
  }, []);

  const propertyData = useQuery({
    queryKey: [queryKey],
    queryFn: () => {
      return handleAsync<AxiosResponse<IPropertiesResponse>>(client.get, url, {
        params: query,
      });
    },
  });

  const Properties = {
    propertyData,
    setFilter,
    resetFilter,
    filterData,
    filters,
    handlePageChange,
    setQuery,
  };

  return Properties;
};
