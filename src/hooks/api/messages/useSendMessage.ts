import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';

import { showToast } from '@/hooks/utils/toastHelper';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { queryClient } from '@/providers/query-provider';

export type SendMessages = {
  message: string;
  content: string;
  documents?: string | string[];
};

const sendMessage = async (body: SendMessages) => {
  return client
    .post(`message/send/user/chat`, JSON.stringify(body))
    .then(pickResult)
    .catch(pickErrorMessage);
};

export const useSendMessage = (propertyId: string, agentId: string) => {
  return useMutation({
    mutationFn: (body: SendMessages) => sendMessage(body),
    mutationKey: ['sendMessage'],
    onSuccess(data) {
      if (!toast.isActive('send-message-toast')) {
        showToast('success', data.message, {
          className: 'bg-green-500',
          toastId: 'send-message-toast',
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['get-connected-agents', propertyId, agentId],
      });
    },
    onError(data) {
      if (!toast.isActive('send-message-toast')) {
        showToast('error', data.message, {
          className: 'bg-green-500',
          toastId: 'send-message-toast',
        });
      }
    },
  });
};
