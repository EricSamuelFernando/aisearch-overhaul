import { useMutation } from '@tanstack/react-query';

import { error, success } from '@/components/alert/notify';
import client, { pickErrorMessage, pickResult } from '@/lib/client';

const updateTitleEscrow = async (propertyId: string) => {
  return await client
    .post(`property/complete/offer/title&Escrow/${propertyId}`)
    .then(pickResult, pickErrorMessage);
};

export const useUpdateTitleEscrow = (propertyId: string) => {
  return useMutation({
    mutationFn: () => updateTitleEscrow(propertyId),
    mutationKey: ['updateTitleEscrow', propertyId],
    onSuccess: (data) => {
      success({ message: data?.data?.message });
    },
    onError: (err) => {
      console.log(err);
      // @ts-ignore
      error({ message: err });
    },
  });
};
