import { useQuery } from '@tanstack/react-query';

import client, { pickErrorMessage, pickResult } from '@/lib/client';

const getSinglePropertyTour = async (id: string) => {
  return await client
    .get(`property/user/tours/property/${id}`)
    .then(pickResult, pickErrorMessage);
};

export const useGetSinglePropertyTour = (id: string) => {
  return useQuery({
    queryKey: ['singlePropertyTour'],
    queryFn: () => getSinglePropertyTour(id),
  });
};
