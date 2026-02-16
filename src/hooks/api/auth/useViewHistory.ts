'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthToken } from '@/lib/storage';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

const getCacheKey = () => {
  if (typeof window === 'undefined') return 'viewHistoryCache:anon';
  try {
    const user = JSON.parse(localStorage.getItem('userDetails') || '{}');
    if (user?.id) return `viewHistoryCache:${user.id}`;
  } catch {}
  return 'viewHistoryCache:anon';
};

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
  bedroomsTotal?: number;
  bathroomsTotal?: number;
  livingArea?: number;
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
  bedroomsTotal?: number;
  bathroomsTotal?: number;
  livingArea?: number;
  viewedAt?: string;
}

// ─── Hook: Record a property view ───────────────────────────────────────────

export const useRecordPropertyView = () => {
  const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('userAccessToken') : null);
  const queryClient = useQueryClient();

  const recordPropertyView = useMutation({
    mutationKey: ['record-property-view'],
    mutationFn: async (input: RecordViewInput) => {
      if (!token) return null; // silently skip if not logged in
      const payload = { ...input, viewedAt: input.viewedAt || new Date().toISOString() };
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
                bedroomsTotal
                bathroomsTotal
                livingArea
                viewedAt
              }
            }
          `,
          variables: { input: payload },
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

      // Cache locally per user for resilience
      try {
        const cacheKey = getCacheKey();
        const existing = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        const key = payload.listingId || payload.propertyId;
        if (key) {
          existing[key] = {
            listingId: payload.listingId,
            propertyId: payload.propertyId,
            listPriceLow: payload.price,
            address: {
              unparsedAddress: payload.propertyAddress,
              city: payload.city,
              stateOrProvince: payload.state,
            },
            media: {
              primaryListingImageUrl: payload.propertyImage,
            },
            property: {
              propertyType: payload.propertyType,
              bedroomsTotal: payload.bedroomsTotal,
              bathroomsTotal: payload.bathroomsTotal,
              livingArea: payload.livingArea,
            },
            viewedAt: payload.viewedAt,
          };
          localStorage.setItem(cacheKey, JSON.stringify(existing));
        }
      } catch {}

      return response.data?.data?.recordPropertyView;
    },
    // We don't show any toast for view tracking — it's silent
    onSuccess: () => {
      // Refresh view history so the just-viewed listing shows up immediately
      queryClient.invalidateQueries({ queryKey: ['user-view-history'] });
    },
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

      try {
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

        const payload = response.data?.data?.getUserViewHistory || { items: [], total: 0, totalPages: 1 };

        // Enrich items with bedroomsTotal/bathroomsTotal/livingArea from local cache
        // (the backend query schema doesn't expose these fields, but we saved them locally on view)
        let localCache: Record<string, any> = {};
        if (typeof window !== 'undefined') {
          try { localCache = JSON.parse(localStorage.getItem(getCacheKey()) || '{}'); } catch {}
        }
        payload.items = [...(payload.items || [])].map((item: ViewHistoryItem) => {
          const key = item.listingId || item.propertyId;
          const cached = key ? localCache[key] : null;
          return {
            ...item,
            bedroomsTotal: cached?.property?.bedroomsTotal ?? item.bedroomsTotal,
            bathroomsTotal: cached?.property?.bathroomsTotal ?? item.bathroomsTotal,
            livingArea: cached?.property?.livingArea ?? item.livingArea,
            propertyImage: item.propertyImage || cached?.media?.primaryListingImageUrl,
            price: item.price || (cached?.listPriceLow ? String(cached.listPriceLow) : undefined),
          };
        });

        // Sort by viewedAt desc — most recently viewed on top
        payload.items.sort(
          (a: ViewHistoryItem, b: ViewHistoryItem) =>
            new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
        );
        return payload;
      } catch (err) {
        // Fallback: use locally cached view history (recorded in property preview)
        if (typeof window !== 'undefined') {
          try {
            const cached = JSON.parse(localStorage.getItem(getCacheKey()) || '{}');
            const cachedItems: ViewHistoryItem[] = Object.entries(cached).map(
              ([key, value]: [string, any]) => ({
                id: key,
                userId: 'local',
                listingId: value?.listingId || key,
                propertyId: value?.propertyId,
                propertyAddress:
                  value?.address?.unparsedAddress ||
                  value?.propertyAddress ||
                  value?.address?.label ||
                  '',
                city: value?.address?.city || '',
                state: value?.address?.stateOrProvince || value?.address?.state || '',
                price: value?.listPriceLow
                  ? String(value.listPriceLow)
                  : value?.price
                  ? String(value.price)
                  : undefined,
                propertyType: value?.property?.propertyType,
                propertyImage:
                  value?.media?.primaryListingImageUrl ||
                  value?.propertyImage ||
                  value?.media?.photosList?.[0]?.url ||
                  undefined,
                bedroomsTotal: value?.property?.bedroomsTotal,
                bathroomsTotal: value?.property?.bathroomsTotal,
                livingArea: value?.property?.livingArea,
                viewedAt: new Date().toISOString(),
              }),
            );
            if (cachedItems.length) {
              const sorted = cachedItems.sort(
                (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
              );
              return {
                items: sorted,
                total: sorted.length,
                totalPages: 1,
              };
            }
          } catch {
            // ignore cache parse errors
          }
        }
        throw err;
      }
    },
    enabled: !!token,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Auto-refresh so newly viewed properties appear quickly
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  return { getViewHistory };
};
