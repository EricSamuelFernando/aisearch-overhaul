'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthToken } from '@/lib/storage';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ViewHistoryItem {
  id: string;
  userId: string;
  listingId?: string;
  propertyId?: string;
  propertyAddress?: string;
  city?: string;
  state?: string;
  price?: string;
  propertyType?: string;
  propertyImage?: string;
  viewedAt: string;
}

export interface ViewHistoryResponse {
  items: ViewHistoryItem[];
  total: number;
  totalPages: number;
}

export interface RecordViewInput {
  listingId?: string;
  propertyId?: string;
  propertyAddress?: string;
  city?: string;
  state?: string;
  price?: string;
  propertyType?: string;
  propertyImage?: string;
}

// ─── Hook: Record a property view ───────────────────────────────────────────

export const useRecordPropertyView = () => {
  const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('userAccessToken') : null);

  const recordPropertyView = useMutation({
    mutationKey: ['record-property-view'],
    mutationFn: async (input: RecordViewInput) => {
      if (!token) return null; // silently skip if not logged in

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation RecordPropertyView($input: CreateViewHistoryInput!) {
              recordPropertyView(input: $input) {
                id
                listingId
                propertyId
                propertyAddress
                city
                state
                price
                propertyType
                propertyImage
                viewedAt
              }
            }
          `,
          variables: { input },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.errors) {
        console.warn('Failed to record property view:', response.data.errors[0]?.message);
        return null;
      }

      return response.data?.data?.recordPropertyView;
    },
    // We don't show any toast for view tracking — it's silent
  });

  return { recordPropertyView };
};

// ─── Hook: Get user's view history ──────────────────────────────────────────

export const useGetViewHistory = (page: number = 1, perPage: number = 20) => {
  const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('userAccessToken') : null);

  const getViewHistory = useQuery({
    queryKey: ['user-view-history', page, perPage],
    queryFn: async (): Promise<ViewHistoryResponse> => {
      if (!token) {
        return { items: [], total: 0, totalPages: 1 };
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetUserViewHistory($page: Int!, $perPage: Int!) {
              getUserViewHistory(page: $page, perPage: $perPage) {
                items {
                  id
                  userId
                  listingId
                  propertyId
                  propertyAddress
                  city
                  state
                  price
                  propertyType
                  propertyImage
                  viewedAt
                }
                total
                totalPages
              }
            }
          `,
          variables: { page, perPage },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.errors) {
        throw new Error(response.data.errors[0]?.message || 'Failed to fetch view history');
      }

      return response.data?.data?.getUserViewHistory || { items: [], total: 0, totalPages: 1 };
    },
    enabled: !!token,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { getViewHistory };
};
