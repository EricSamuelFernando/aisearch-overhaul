import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { useCallback } from 'react';
import { Agent } from '@/interfaces/agent.interface';
import {
  setCurrentStep,
  setSelectedAgent,
  resetState,
  setUploadedFile,
  setDate,
  setFileUrl,
} from '@/slices/pre-approval/preapproval-slice';

/**
 * @description  Hook providing actions related to adding pre approval documents for use in components
 * @returns {Object} An object containing property, current view amongst other things.
 */

export const approvals = (state: RootState) => state.preApproval;

export const usePreapprovalActions = () => {
  const dispatch = useAppDispatch();

  return {
    setCurentStep: useCallback(
      (view: number) => {
        dispatch(setCurrentStep(view));
      },
      [dispatch],
    ),
    setSelectedAgent: useCallback(
      (agent: Agent | undefined) => {
        dispatch(setSelectedAgent(agent));
      },
      [dispatch],
    ),
    setUploadedFile: useCallback(
      (file: File[] | undefined) => {
        dispatch(setUploadedFile(file));
      },
      [dispatch],
    ),
    setDate: useCallback(
      (date: Date | undefined) => {
        dispatch(setDate(date));
      },
      [dispatch],
    ),
    setFileUrl: useCallback(
      (url: string | undefined) => {
        dispatch(setFileUrl(url));
      },
      [dispatch],
    ),
    resetState: useCallback(() => {
      dispatch(resetState());
    }, [dispatch]),
  };
};

export default usePreapprovalActions;

export const useAddPreApprovals = () => {
  return useAppSelector(approvals);
};
