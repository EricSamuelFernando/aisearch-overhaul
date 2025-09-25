import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';

import { showToast } from '@/hooks/utils/toastHelper';
import client, { pickErrorMessage, pickResult } from '@/lib/client';

export type CreateAgentMessage = {
  agent: string;
  property: string;
};

const createPropertyAgentMessage = async (body: CreateAgentMessage) => {
  return client
    .post(`message/create/user/user-message`, JSON.stringify(body))
    .then(pickResult)
    .catch(pickErrorMessage);
};

export const useCreatePropertyAgentMessage = () => {
  return useMutation({
    mutationFn: (body: CreateAgentMessage) => createPropertyAgentMessage(body),
    mutationKey: ['createPropertyAgentMessage'],
    onSuccess(data) {
      if (!toast.isActive('send-message-toast')) {
        showToast('success', data.message, {
          className: 'bg-green-500',
          toastId: 'send-message-toast',
        });
      }
    },
  });
};
