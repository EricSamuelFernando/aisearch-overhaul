// Import necessary types and React hooks
// import { FilterType, onBoardingQuery } from '@/services/models/filters';
import React from 'react';
import { FilterType, onBoardingQuery } from '../../../intferfaces/filters';

// Define initial state for filters
const initialState: onBoardingQuery = {
  mobile_extension: '',
  mobile: '',
  number_body: '',
  firstname: '',
  lastname: '',
  account_type: '',
  password: '',
  email: '',
};

// Define actions that can be dispatched to modify the state
type Action =
  | {
      type: 'SET_FILTER';
      payload: { field: keyof onBoardingQuery; value: string | number };
    }
  | { type: 'RESET_STATE' }
  | {
      type: 'SEARCH_USER';
      payload: string;
    };

/**
 * @description Reducer function to handle state modifications based on actions.
 * @param {onBoardingQuery} state - The current state of filters.
 * @param {Action} action - The action to be performed on the state.
 * @returns {onBoardingQuery} The updated state after applying the action.
 */

function UserReducer(state: onBoardingQuery, action: Action): onBoardingQuery {
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

/**
 * @description Custom hook for managing filters and interacting with user data.
 * @returns {Object} An object containing relevant data and functions.
 */
export const useFilters = () => {
  // Use reducer to manage state changes for filters
  const [filters, dispatch] = React.useReducer(UserReducer, initialState);
  const [_query, setQuery] = React.useState(() => ({
    ...filters,
  }));

  /**
   * @description Function to set individual filters.
   * @param {UserFilterType} payload - The payload containing filter information.
   */
  const setFilter = React.useCallback(
    (payload: FilterType<onBoardingQuery>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    setQuery((q) => ({ ...q, ...initialState }));
  }, [dispatch]);

  // Return an object containing relevant data and functions
  return {
    filters,
    setQuery,
    setFilter,
    resetFilter,
  };
};
