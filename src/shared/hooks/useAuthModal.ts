import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import {
  Screens,
  setNavBtnClick,
  Mode,
  setMode,
} from '@/slices/auth/auth-modal.slice';
import { useCallback } from 'react';
import { setModalScreen } from '../../slices/auth/auth-modal.slice';
import { useCustomDisclosure } from '../../providers/disclosure-provider';
// import { useCustomDisclosure } from '@/app/(main)/context/disclosure-context';

// Selects the user slice from the global state
export const authScreen = (state: RootState) => state.authScreen;

/**
 * @description Hook providing actions related to authentication s to be used in components
 * @returns {Object} An object containing setUser action
 */
export const useAuthModalActions = () => {
  const dispatch = useAppDispatch();
  const { close } = useCustomDisclosure();

  return {
    /**
     * @description Action to get current user role
     */
    setScreen: useCallback(
      (screen: Screens) => {
        dispatch(setModalScreen(screen));
      },
      [dispatch],
    ),
    getClickedNavBtn: useCallback(
      (screen: Screens) => {
        dispatch(setNavBtnClick(screen));
      },
      [dispatch],
    ),
    setMode: useCallback(
      (mode: Mode) => {
        dispatch(setMode(mode));
      },
      [dispatch],
    ),
    close: useCallback(() => {
      dispatch(close);
    }, [dispatch, close]),
  };
};

/**
 * @description Hook for accessing user type state from the global state.
 * @returns {Object} The user slice of the global state.
 */
export const useAuthModal = () => {
  return useAppSelector(authScreen);
};
