import { IPropertiesResponse } from '@/interfaces/property.interface';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { PROPERTIES } from '@/utils/apis';
import { useQuery } from '@tanstack/react-query';

const getAllPropertiesListing = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return client
    .get(`${PROPERTIES}?page=${page}&limit=${limit}`)
    .then(pickResult, pickErrorMessage);
};

export const useGetAllPropertiesListings = (page: number, limit: number) => {
  return useQuery<IPropertiesResponse, Error>({
    queryKey: ['get-all-property-listings', page, limit],
    queryFn: () => getAllPropertiesListing({ page, limit }),
    //@ts-ignore
    keepPreviousData: true,
  });
};
