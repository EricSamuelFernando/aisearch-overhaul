import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { agentIsInvited } from '@/slices/verification/selectors/selectors';
import { setAgentInvited } from '@/slices/verification/seller-agent-flow';
import { useCallback } from 'react';

export const useAgentList = () => {
  const dispatch = useAppDispatch();
  const agentInvited = useAppSelector(agentIsInvited);

  const setAgentIsInvited = useCallback(
    (value: boolean) => {
      dispatch(setAgentInvited(value));
    },
    [dispatch],
  );
  return {
    agentInvited,
    setAgentIsInvited,
  };
};
