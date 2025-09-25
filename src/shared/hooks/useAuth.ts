import { useCallback } from 'react';
import { User, UserType } from '@/types/user.types';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { login, logout, switchUser } from '@/slices/auth/auth.slice';
import { setConveresationUnReadCount, setMessageUnReadCount } from '@/slices/chat/chat.slice';

// Selects the auth slice from the global state
export const auth = (state: RootState) => state.auth;

/**
 * @description Hook providing actions related to authentication for use in components.
 * @returns {Object} An object containing login and logout actions.
 */
export const useAuthActions = () => {
  const dispatch = useAppDispatch();

  return {
    /**
     * @description Action to perform a user login.
     */
    login: useCallback(
      (user: User) => {
        dispatch(login(user));
      },

      [dispatch],
    ),

    /**
     * @description Action to Switch A User Current role
     */
    switchUser: useCallback(
      (user: UserType) => {
        dispatch(switchUser(user));
      },
      [dispatch],
    ),

    /**
     * @description Action to perform a user logout.
     */
    logout: useCallback(() => dispatch(logout()), [dispatch]),

    /**
    * @description Action to Switch A User Current role
    */
    manageConversationUnread: useCallback(
      (count: Number) => {
        dispatch(setConveresationUnReadCount(count));
      },
      [dispatch],
    ),
    /**
    * @description Action to Switch A User Current role
    */
    manageMessageUnread: useCallback(
      (count: Number) => {
        dispatch(setMessageUnReadCount(count));
      },
      [dispatch],
    ),
  };
};

/**
 * @description Hook for accessing authentication state from the global state.
 * @returns {Object} The auth slice of the global state.
 */
export const useAuth = () => {
  return useAppSelector(auth);
};
