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
import { isMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';

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
        const bypass = isMlsBypassModeEnabled();
        const detailUrl = bypass
          ? '/api/mls/detail'
          : (PROPERTY_DETAIL_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search/preference');

        const numericId = Number(propertyId);
        const response = await axios.post(detailUrl, bypass
          ? {
            listingId: Number.isFinite(numericId) ? numericId : propertyId,
            propertyId: Number.isFinite(numericId) ? numericId : propertyId,
          }
          : {
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

export const useGetPropertyPreference = (userId?: string) => {
  const getPropertyPreferenceFromAI = useQuery({
    queryKey: ['property-preference-ai', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || 'https://demo-new-ai.snaphomz.com';
        const response = await axios.get(`${AI_BASE_URL}/api/preference/${userId}`);
        return response?.data || null;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null; // Handle 404 as not created yet
        }
        throw err;
      }
    },
    enabled: !!userId,
    refetchOnMount: true,
    staleTime: 0,
  });

  return {
    getPropertyPreferenceFromAI
  };
}

export const useUpdatePropertyPreference = (userId?: string, email?: string) => {
  const queryClientHook = useQueryClient();

  const updatePropertyPreference = useMutation({
    mutationKey: ['update-property-preference'],
    mutationFn: async (data: {
      propertyType?: string;
      preferredPropertyAddress?: string;
      priceMin?: number;
      priceMax?: number;
      province?: string;
      city?: string;
      onboardingCompleted?: boolean
    }) => {
      if (!userId || !email) {
        throw new Error('User ID and email are required to update preferences.');
      }

      const typeStr = data.propertyType || 'property';
      const areaStr = data.preferredPropertyAddress || data.city || 'any area';
      const minPrice = data.priceMin || 0;
      const maxPrice = data.priceMax || 0;
      
      const preferenceText = `Looking for a ${typeStr} in ${areaStr}. Budget is between ${minPrice} and ${maxPrice} USD.`;

      const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || 'https://demo-new-ai.snaphomz.com';
      const response = await axios.post(
        `${AI_BASE_URL}/api/search/preference`,
        {
          user_id: userId,
          email: email,
          preference: preferenceText,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      return response?.data;
    },
    onSuccess: async (data: any) => {
      console.log('Preference updated:', data);
      queryClientHook.invalidateQueries({ queryKey: ['property-preference-ai'] });
    },
    onError: (err: any) => {
      const msg = err?.message || '';
      error({ message: err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || msg || 'Failed to update preference' });
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
