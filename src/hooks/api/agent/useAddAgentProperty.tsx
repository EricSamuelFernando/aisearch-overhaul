import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AGENT_ADD_PROPERTY } from '@/utils/apis';
import { useMutation } from '@tanstack/react-query';
import React from 'react';

import { error, success } from '@/components/alert/notify';
import {
  IPropertiesResponse,
  IPropertyAddressDetails,
  IPropertyListing,
} from '@/interfaces/property.interface';
import { useState } from 'react';
import { FilterType } from '@/types/global.types';
import { PropertyDetails } from '@/types/property.types';
import { AxiosResponse } from '@/types/axios.types';

export type PropertyQuery = PropertyDetails &
  IPropertyAddressDetails & {
    step: number;
    email: string;
    propertyType: string;
    unit: number;
    sqrFt: number;
    propertyName?: string;
    lotSize: number;
  };

// Define initial state for filters
const initialState: Partial<PropertyQuery> = {
  // formattedAddress: '',
  latitude: '',
  longitude: '',
  placeId: '',
  streetNumber: '',
  streetName: '',
  city: '',
  province: '',
  state: '',
  postalCode: '',
  country: '',
  email: '',
  propertyType: '',
  unit: '' as unknown as number,
  sqrFt: '' as unknown as number,
  step: 1,
  lotSizeUnit: '' as unknown as number,
  lotSize: 0,
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

export const useAgentProperty = () => {
  const [view, setView] = useState<'list' | 'grid'>('list');

  function PropertyReducer(
    state: Partial<PropertyQuery>,
    action: Action,
  ): Partial<PropertyQuery> {
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

  const [filters, dispatch] = React.useReducer(PropertyReducer, initialState);
  const [_query, setQuery] = React.useState(() => ({
    ...filters,
  }));

  const setFilter = React.useCallback(
    (payload: FilterType<Partial<PropertyQuery>>) => {
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
    return setQuery((q) => {
      const query = { ...q, ...filters };
      return query;
    });
  }, [filters]);

  const addProperty = useMutation({
    mutationKey: ['agent-add-property'],
    mutationFn: async (data: IPropertyListing) => {
      return handleAsync<AxiosResponse<IPropertiesResponse>>(
        client.post,
        `${AGENT_ADD_PROPERTY}`,
        {
          ...data,
        },
      );
    },
    onSuccess: (data) => {
      if ((data as any).status === 200) {
        success({ message: 'Invitation to the agent was sent successfully' });
      }
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const Properties = {
    setFilter,
    resetFilter,
    filterData,
    filters,
    addProperty,
    setQuery,
    view,
    setView,
  };

  return Properties;
};
