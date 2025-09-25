import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

const getPropertyOffer = async (id: string) => {
  return await client
    .get(`property/user/property-offer/${id}`)
    .then(pickResult, pickErrorMessage);
};

export const useGetPropertyOffer = (id: string) => {
  return useQuery({
    queryKey: ['propertyOffer'],
    queryFn: () => getPropertyOffer(id),
  });
};
