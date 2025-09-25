import { useMutation } from '@tanstack/react-query';

import { success, error } from '@/components/alert/notify';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { queryClient } from '@/providers/query-provider';

export const deleteProperty = async (id: string) => {
  return await client
    .delete(`/property/delete/${id}`, {
      headers: {
        role: 'buyer',
      },
    })
    .then(pickResult, pickErrorMessage);
};

export const useDeleteBuyerProperty = () => {
  const mutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    mutationKey: ['DELETE_PROPERTY'],
    onSuccess: (data) => {
      console.log(data);
      
      success({ message: data?.data?.message });

      queryClient.invalidateQueries({
        queryKey: ['fetch-buyer-engaged-properties'],
      });
    },
    onError: (err) => {
      console.log(err);
      // @ts-ignore
      error({ message: err });
    },
  });

  return mutation;
};
