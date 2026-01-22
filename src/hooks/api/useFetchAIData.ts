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
  // API call removed - returning empty response to prevent multiple calls
  return {
    value: [],
  } as any;
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
    enabled: false, // Disabled - /search route is not available in backend
  });
};
