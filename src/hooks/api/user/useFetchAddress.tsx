import { AddressProperty } from '@/interfaces/address';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AxiosResponse } from '@/types/axios.types';
import { CLAIM_PROPERTY_QUERY_BY_ADDERESS, PROPERTY_QUERY_BY_ADDERESS } from '@/utils/apis';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

export type FilterType<T> = {
  field: keyof T;
  value: string;
};

type AddressQuery = {
  search?: string;
};

const initialState: AddressQuery = {
  search: '',
};

type Action =
  | {
      type: 'SET_FILTER';
      payload: { field: keyof AddressQuery; value: string };
    }
  | { type: 'RESET_STATE' };

function UserReducer(state: AddressQuery, action: Action): AddressQuery {
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

export interface IReturn {
  result: AddressProperty[];
  total: number;
  page: string;
  limit: string;
}

const useFetchAddress = () => {
  const [filters, dispatch] = React.useReducer(UserReducer, initialState);

  const setFilter = React.useCallback(
    (payload: FilterType<AddressQuery>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  const addressData = useQuery({
    queryKey: ['address-property-query', filters.search],
    queryFn: async () => {
      if (!filters.search) return undefined;
      const response = await handleAsync<AxiosResponse<IReturn>>(
        client.get,
        `${CLAIM_PROPERTY_QUERY_BY_ADDERESS}/${filters.search}`,
      );
      return response.data;
    },
    enabled: !!filters.search,
  });

  return {
    addressData,
    setFilter,
    resetFilter,
    filters,
  };
};

export default useFetchAddress;
