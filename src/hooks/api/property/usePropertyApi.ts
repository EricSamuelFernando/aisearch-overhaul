'use client';

import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { success, error } from '@/components/alert/notify';
import {
  IPropertiesResponse,
  IProperty,
  ISingleProperty,
} from '@/interfaces/property.interface';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import {
  GET_PROPERTY,
  PROPERTIES,
  UPDATE_PROPERTY,
  PROPERTY_QUERY_BY_ADDERESS,
  FETCH_SELLER_PROPERTY,
  SCHEDULE_PROPERTY_TOUR,
  BUYER_CREATE_OFFER,
  USER_SAVE_PREFERENCE,
  USER_COMPLETE_PREFERENCE,
  PUBLISH_PROPERTY_ENDPOINT,
  SHARE_PROPERTY,
} from '@/utils/apis';
import { AxiosResponse } from '@/types/axios.types';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { handleAsync } from '@/lib/api/handleApiResponse';
import { OfferRequest, PropertyOfferType } from '@/types/property.types';
import { queryClient } from '@/providers/query-provider';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { IPropertyPreference } from '@/interfaces/property-preference';
import { removeFalsyValues } from '@/lib/utils';
import { useEditPropertyFormContext } from '@/providers/edit-property-context';
import axios from 'axios';
import { GET_PROPERTY_SEARCH_PREFERENCE_AI_URL, PROPERTY_DETAIL_SEARCH_AI_URL } from '@/shared/constants/env';
import { getAuthToken } from '@/lib/storage';
import { getIsAuthExpired } from '@/lib/api/axios';

interface SharePropertyRequestBody {
  role: string;
  name: string;
  email: string;
  message: string;
  property: string;
}

interface SharePropertyResponse {
  success: boolean;
  message: string;
}

export const usePropertyApi = () => {
  const router = useRouter();
  const { userPath } = useCurrentUser();

  const allPropertyQuery = useQuery({
    queryKey: ['get-all-property-query'],
    queryFn: async () => {
      return await handleAsync<AxiosResponse<IPropertiesResponse>>(
        client.get,
        PROPERTIES,
      );
    },
  });



  const updatePropertyMutation = useMutation({
    mutationKey: ['update-property'],
    mutationFn: async (data: Partial<IProperty> & { _id: string }) => {
      return await handleAsync<AxiosResponse<IProperty>>(
        client.put,
        `${UPDATE_PROPERTY}/${data._id}`,
        data,
      );
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      await queryClient.invalidateQueries({
        queryKey: ['fetch-user-properties'],
      });
      success({ message: data?.data?.message });
      // router.push(`${userPath}/listing?id=${data?.data.data?.property?._id}`)
    },
  });

  const createOfferMutation = useMutation({
    mutationKey: ['create-offer'],
    mutationFn: async (data: Partial<OfferRequest>) => {
      return await handleAsync<AxiosResponse<any>>(
        client.post,
        BUYER_CREATE_OFFER,
        data,
      );
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      success({ message: data?.data?.message });
      router.push(
        `/dashboard/buyer/property/${data?.data.data?.result?.property}`,
      );
    },

    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const createTourMutation = useMutation({
    mutationKey: ['create-tour'],
    mutationFn: async (data: { property: string; tourDate: string }) => {
      return await handleAsync<AxiosResponse<any>>(
        client.post,
        `${SCHEDULE_PROPERTY_TOUR}`,
        data,
      );
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      success({ message: data?.data?.message });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const userPropertyQuery = useQuery({
    queryKey: ['user-property-query'],
    queryFn: async () => {
      return await handleAsync<AxiosResponse<IPropertiesResponse>>(
        client.get,
        FETCH_SELLER_PROPERTY,
      );
    },
  });
  return {
    allPropertyQuery,
    updatePropertyMutation,
    userPropertyQuery,
    createTourMutation,
    createOfferMutation,
  };
};

export const usePublishMutation = (publishStatus: string) => {
  const { methods } = useEditPropertyFormContext();
  const values = methods.getValues();
  const queryClient = useQueryClient();



  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const isPublishing = publishStatus === 'publish';
      const response = await client.put<{
        status: boolean;
        message: string;
        data: any;
      }>(
        `${PUBLISH_PROPERTY_ENDPOINT}${id}`,
        { publish: isPublishing },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['property', id] });

      if (data.message) {
        success({
          message:
            data.message ||
            'Success! The property is now published."',
        });
      } else {
        error({
          message:
            data.message ||
            'The property could not be published. Please try again.',
        });
      }
    },

    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'An error occurred while publishing the property.';
      console.error('Failed to update property status', error);
      error({ message: errorMessage });
    },
  });

  return publishMutation;
};

export const useShareProperty = () => {
  return useMutation({
    mutationKey: ['share-property'],
    mutationFn: async (data: SharePropertyRequestBody) => {
      const response = await handleAsync<AxiosResponse<SharePropertyResponse>>(
        client.post,
        SHARE_PROPERTY,
        data,
      );
      return response;
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      success({
        message: data?.data?.message || 'Property shared successfully!',
      });
    },
    onError: (err: any) => {
      error({
        message:
          err?.response?.data?.message || 'Failed to share the property.',
      });
    },
  });
};

// export const useGetSingleProperty = (propertyId: string , city:string="" , province:string="" , mostRecentStatus:string ="") => {
//   const { saveCurrenctProperty: setCurrenctProperty } = usePropertyActions();

//   const getSingleProperty = useMutation({
//     mutationFn: async () => {
//       axios.post(PROPERTY_DETAIL_SEARCH_AI_URL, {
//         "search_query": `city:\"${city}\" AND mostRecentStatus:\"${mostRecentStatus}\" AND province:\"${province}\"`,
//         "id": propertyId
//       })
//     },
//     onSuccess: (data) => {
//       console.log(data)
//       // const { ...property } = data
//       // setCurrenctProperty(property);
//     },
//     onError: (error: any) => {
//       const errorMessage = error.response?.data?.message || 'An error occurred while publishing the property.';
//       console.error('Failed to update property status', error);
//       toast.error(errorMessage);
//     },
//   });

//   return { getSingleProperty };
// };

export const useGetSingleProperty = (propertyId: string) => {
  const { saveCurrenctProperty: setCurrenctProperty } = usePropertyActions();
  const getSingleProperty = useQuery({
    queryKey: ['get-property-single-listing', propertyId],
    queryFn: async () => {
      try {
        const response = await axios.post(PROPERTY_DETAIL_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search/preference', {
          listingId: Number(propertyId)
        });

        // Map the response to match expected structure
        // dashboard layout expects data.property to be the property object
        return {
          property: response.data?.data,
          success: true,
          message: 'Fetched successfully',
        };
      } catch (error) {
        console.error("Error fetching single property:", error);
        return {
          property: {},
          success: false,
          message: 'Failed to fetch property'
        };
      }

      // Old code commented out as requested:
      // // API call completely disabled - /api/property/{id} will NOT be called
      // // Returning empty response to prevent any   network requests
      // return {
      //   property: {},
      //   success: true,
      //   message: '',
      // };
    },
    enabled: !!propertyId,
    // Old code commented out:
    // enabled: false, // Completely disabled - will NOT execute even if refetched

    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { getSingleProperty };
};

export const useGetPropertyByAddress = (address: string) => {
  const getPropertyAddress = useQuery({
    queryKey: ['buyer-property-query', address],
    queryFn: async () => {
      return await handleAsync<AxiosResponse<IPropertiesResponse>>(
        client.get,
        `${PROPERTY_QUERY_BY_ADDERESS}/"${address}"`,
      );
    },
  });

  return { getPropertyAddress };
};

export const useGetPropertyPreference = (email?: string) => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";
  const token = getAuthToken() || localStorage.getItem('userAccessToken');

  // GraphQL query to fetch from DB
  const getPropertyPreferenceFromDB = useQuery({
    queryKey: ['property-preference-db'],
    queryFn: async () => {
      // Bail out immediately if auth is expired to prevent Unauthorized errors
      if (getIsAuthExpired()) {
        throw new Error('Session expired. Please login again.');
      }
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query {
              getPropertyPreference {
                id
                propertyType
                preferredPropertyAddress
                spendAmount {
                  min
                  max
                }
                onboardingCompleted
                financialProcess
                preApprovalAffiliates
                workWithLender
                createdAt
                updatedAt
              }
            }
          `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.errors) {
        throw new Error(response.data.errors[0]?.message || 'Failed to fetch property preference');
      }

      return response.data?.data?.getPropertyPreference || null;
    },
    enabled: !!token,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // AI API query - returns raw response structure
  const getPropertyPreferenceFromAI = useQuery({
    queryKey: ['property-preference-ai', email],
    queryFn: async () => {
      if (!email) return null;
      const response = await axios.get(`${GET_PROPERTY_SEARCH_PREFERENCE_AI_URL}/${email}`);
      // AI API returns { preference: {...}, user: "..." }
      // Return the raw response structure so component can access preference.mls_type, preference.listing_price_max, etc.
      return response.data || null;
    },
    enabled: !!email,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  return {
    getPropertyPreferenceFromDB,
    getPropertyPreferenceFromAI
  };
}

export const useUpdatePropertyPreference = (email?: string) => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";
  const PROPERTY_SEARCH_PREFERENCE_AI_URL = `${process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI}/api/search/preference` || 'http://13.60.114.186:9000/api/search/preference';
  const token = getAuthToken() || localStorage.getItem('userAccessToken');
  const queryClientHook = useQueryClient();

  const updatePropertyPreference = useMutation({
    mutationKey: ['update-property-preference'],
    mutationFn: async (data: {
      propertyType?: string;
      preferredPropertyAddress?: string;
      priceMin?: number;
      priceMax?: number;
      city?: string;
      onboardingCompleted?: boolean;
    }) => {
      // Bail out immediately if auth is expired
      if (getIsAuthExpired()) {
        throw new Error('Session expired. Please login again.');
      }
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare GraphQL mutation data according to PropertyPreferenceInput schema
      const propertyData: any = {
        onboardingCompleted: data.onboardingCompleted ?? false,
        preApprovalAffiliates: false,
      };

      if (data.propertyType) {
        propertyData.propertyType = data.propertyType;
      }

      if (data.preferredPropertyAddress || data.city) {
        propertyData.preferredPropertyAddress = data.preferredPropertyAddress || data.city;
      }

      // spendAmount is required in the schema, so always include it
      propertyData.spendAmount = {
        min: data.priceMin !== undefined ? data.priceMin : 0,
        max: data.priceMax !== undefined ? data.priceMax : 0,
      };

      // Update via GraphQL (DB)
      const graphqlResponse = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation AddOrUpdatePropertyPreference($propertyData: PropertyPreferenceInput!) {
              addOrUpdatePropertyPreference(propertyData: $propertyData) {
                id
                propertyType
                preferredPropertyAddress
                spendAmount {
                  min
                  max
                }
                onboardingCompleted
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            propertyData,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (graphqlResponse.data?.errors) {
        throw new Error(graphqlResponse.data.errors[0]?.message || 'Failed to update property preference');
      }

      const dbResult = graphqlResponse.data?.data?.addOrUpdatePropertyPreference;

      // Also sync with AI API if email is provided
      if (email) {
        try {
          const preferenceText = `Looking for a ${data.propertyType || ''} in ${data.preferredPropertyAddress || data.city || ''}. Budget is between ${data.priceMin || 0} and ${data.priceMax || 0} USD`;

          await axios.post(
            PROPERTY_SEARCH_PREFERENCE_AI_URL,
            {
              user: email,
              preference: preferenceText,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        } catch (aiError) {
          console.warn('Failed to sync with AI API:', aiError);
          // Don't throw - DB update succeeded, AI sync is secondary
        }
      }

      return dbResult;
    },
    onSuccess: async (data: any) => {
      console.log('Preference updated:', data);
      // NOTE: Toast is NOT shown here to prevent auto-sync from layouts triggering it on every page load.
      // The calling component should show its own toast in the mutate onSuccess callback when user explicitly saves.
      // Invalidate queries to refetch
      queryClientHook.invalidateQueries({ queryKey: ['property-preference-db'] });
      queryClientHook.invalidateQueries({ queryKey: ['property-preference-ai'] });
    },
    onError: (err: any) => {
      // Don't show toast for auth/session errors – the global AuthSessionSync handler
      // will show a single "session expired" toast and redirect to login.
      const msg = err?.message || '';
      if (msg.includes('Unauthorized') || msg.includes('Session expired')) return;
      error({ message: err?.response?.data?.errors?.[0]?.message || msg || 'Failed to update preference' });
    },
  });

  return { updatePropertyPreference };
};


export const useSavePropertyPreference = () => {
  return useMutation({
    mutationKey: ['update-property-preference'],
    mutationFn: async (
      data: Partial<
        Omit<IPropertyPreference, 'rangeText' | 'onboardingCompleted'>
      >,
    ) => {
      return await handleAsync<AxiosResponse<IProperty>>(
        client.put,
        `${USER_SAVE_PREFERENCE}`,
        removeFalsyValues(data),
      );
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      success({ message: data?.data?.message });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });
};

export const useCompleteUserPreference = () => {
  return useMutation({
    mutationKey: ['complete-property-preference'],
    mutationFn: async (
      data: Omit<IPropertyPreference, 'rangeText' | 'onboardingCompleted'>,
    ) => {
      return await axios.post("");
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      success({ message: data?.data?.message });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });
};

