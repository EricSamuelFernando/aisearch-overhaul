import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { error } from '@/components/alert/notify';
import { headers } from 'next/headers';
import { getAuthToken } from '@/lib/storage';

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

export const useSellerPropertyAnalyticsAPI = () => {
  const headers = {
    headers: {
      'Authorizarin': getAuthToken()
    }
  }
  const createSellerAnalytics = useMutation({
    mutationKey: ['createSellerPropertyAnalytic'],
    mutationFn: async (inputData: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation createSellerPropertyAnalytic($createSellerPropertyAnalyticInput: CreateSellerPropertyAnalyticInput!) {
            createSellerPropertyAnalytic(createSellerPropertyAnalyticInput: $createSellerPropertyAnalyticInput) {
              fileName
          }
        }
          `,
          variables: { createSellerPropertyAnalyticInput: inputData },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return response.data.data.createSellerPropertyAnalytic;
    },
    onError: (err: any) => {
      error({ message: err.message });
    },
  });

  const getAnalytics = useMutation({
    mutationKey: ['sellerPropertyAnalytics'],
    mutationFn: async () => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          query {
            sellerPropertyAnalytics {
              id
              propertyId
              propertyUrl
              createdAt
            }
          }
        `,
      });

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data.errors?.[0]?.message || 'Failed to fetch analytics');
      }

      return response.data.data.sellerPropertyAnalytics;
    },
    onError: (err: any) => {
      error({ message: err.message });
    },
  });


  const updateAnalytics = useMutation({
    mutationKey: ['updateSellerPropertyAnalytic'],
    mutationFn: async (inputData: any) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation updateSellerPropertyAnalytic($input: UpdateSellerPropertyAnalyticInput!) {
            updateSellerPropertyAnalytic(input: $input) {
              id
              propertyId
              updatedAt
            }
          }
        `,
        variables: { input: inputData },
      });

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data.errors?.[0]?.message || 'Failed to update analytic');
      }

      return response.data.data.updateSellerPropertyAnalytic;
    },
    onError: (err: any) => {
      error({ message: err.message });
    },
  });

  return {
    createSellerAnalytics,
    getAnalytics,
    updateAnalytics,
  };
};

export const getAllPropertyAnalytics = () => useQuery({
  queryKey: ['sharedProperties'],
  queryFn: async () => {
    const response = await axios.post(
      GRAPHQL_URI,
      {
        query: `
            query {
              sellerPropertyAnalytics {
                id
                propertyId
                listingId
                fileName
                fileType
                fileSize
                fileUrl
                createdBy
                createdAt
                updatedAt
              }
            }
          `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data.data.sellerPropertyAnalytics;
  },
})

