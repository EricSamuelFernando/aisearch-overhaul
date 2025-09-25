'use client';

import { ApiResponse } from '@/interfaces/property.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  AGENT_TOURS,
  DELETE_TOUR,
  GET_FUTURE_TOURS,
  GET_PAST_TOURS,
} from '@/utils/apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ITour } from '@/interfaces/tours.interface';
import { AxiosResponse } from '@/types/axios.types';

export const useFetchTours = (type: 'upcoming' | 'past') => {
  const { user } = useAuth();
  const currentUser = user?.account_type;
  const url = type === 'upcoming' ? GET_FUTURE_TOURS : GET_PAST_TOURS;
  const agentTours = useQuery({
    queryKey: [`fetch-${type}-tours`, `${currentUser}-tours`],
    queryFn: () => {
      return handleAsync<AxiosResponse<ApiResponse<ITour>>>(client.get, url);
    },
  });

  return agentTours;
};

export const useDeleteTours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tourId: string) =>
      client
        .delete(`${DELETE_TOUR}/${tourId}`)
        .then((response) => response.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
  });
};
