'use client';

import axios from 'axios';
import { USER_ROLE } from '@/shared/constants/env';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from '@/types/axios.types';
import {
  GET_NOTIFICATIONS,
  MARK_ALL_AS_READ,
  MARK_ONE_NOTIFICATION_AS_READ,
} from '@/utils/apis';
import client from '@/lib/client';
import { ApiNewResponse, ApiResponse } from '@/interfaces/property.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';

export type Notification = {
  _id: string;
  title: string;
  body: string;
  user: string;
  userType: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  result: Notification[];
  total: number;
  page: number;
  limit: number;
};

export const useNotificationApi = () => {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => {
      return handleAsync<AxiosResponse<ApiNewResponse<Notification>>>(
        client.get,
        GET_NOTIFICATIONS,
      );
    },
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await client.put<AxiosResponse<Notification>>(
        `${MARK_ONE_NOTIFICATION_AS_READ}${id}`,
        null,
        {
          headers: { role: USER_ROLE },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await client.put<AxiosResponse<{ result: boolean }>>(
        MARK_ALL_AS_READ,
        null,
        {
          headers: { role: USER_ROLE },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notificationsQuery,
    markOneAsReadMutation,
    markAllAsReadMutation,
  };
};
