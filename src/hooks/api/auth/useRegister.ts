'use client';

import { useCallback } from 'react';
import { UserType } from '@/types/user.types';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import {
  selectAccountType,
  selectEmail,
  setAuthToken,
} from '@/slices/auth/register.slices';

export const registerPayload = (state: RootState) => state.register;

export const useRegisterActions = () => {
  const dispatch = useAppDispatch();

  return {
    /**
     * @description Action to store user registration details in the redux store.
     */
    selectAccountType: useCallback(
      (accountType: UserType) => dispatch(selectAccountType(accountType)),
      [dispatch],
    ),
    selectEmail: useCallback(
      (email: string) => dispatch(selectEmail(email)),
      [dispatch],
    ),
    setAuthToken: useCallback(
      (token: string) => dispatch(setAuthToken(token)),
      [dispatch],
    ),
  };
};

/**
 * @description Hook for accessing regitration values state from the global state.
 * @returns {Object} The auth slice of the global state.
 */
export const useRegister = () => {
  return useAppSelector(registerPayload);
};
