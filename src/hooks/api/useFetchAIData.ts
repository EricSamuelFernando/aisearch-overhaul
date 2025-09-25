import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { mlsDeploymentEnv } from '@/shared/constants/env';
import { pickErrorMessage, pickResult } from '@/lib/client';
import { ODataStrippedResponse } from '@/interfaces/mls-data.interface';

interface FilterParams {
  priceMin?: string;
  priceMax?: string;
  bedRooms?: string;
  bathRooms?: string;
  sqTfMin?: string;
  sqTfMax?: string;
  propertyType?: string;
}

interface FetchParams extends FilterParams {
  query?: string;
  page: number;
  limit: number;
}

const getAllMLSSearchData = async ({
  query,
  page,
  limit,
  priceMin,
  priceMax,
  bedRooms,
  bathRooms,
  sqTfMin,
  sqTfMax,
  propertyType,
}: FetchParams): Promise<ODataStrippedResponse> => {
  const url = `${mlsDeploymentEnv}/search`;
  return await axios
    .get(url, {
      params: {
        query: query,
        page,
        limit,
        priceMin,
        priceMax,
        bedRooms,
        bathRooms,
        sqTfMin,
        sqTfMax,
        propertyType,
      },
    })
    .then(pickResult, pickErrorMessage);
};

export const useGetAllMLSSearchData = (
  query: string | null,
  page: number,
  limit: number,
  filters: FilterParams,
) => {
  return useQuery<ODataStrippedResponse, Error>({
    queryKey: [
      'fetch-ai-property',
      'paginatedData',
      query,
      page,
      limit,
      filters,
    ],
    queryFn: async () => {
      return await getAllMLSSearchData({
        query: query || '',
        page,
        limit,
        ...filters,
      });
    },
    enabled: !!query,
  });
};
