'use client';

import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
        toast.success(data.message || 'Success! The property is now published."');
      } else {
        toast.error(data.message || 'The property could not be published. Please try again.');
      }
    },

    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'An error occurred while publishing the property.';
      console.error('Failed to update property status', error);
      toast.error(errorMessage);
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
    queryFn: async () =>
      client
        .get(`${GET_PROPERTY}/${propertyId}`)
        .then(pickResult, pickErrorMessage),
    enabled: typeof propertyId !== 'undefined',
  });

  useEffect(() => {
    if (getSingleProperty.isSuccess && !getSingleProperty.isFetching) {
      if (getSingleProperty.data !== undefined) {
        const { ...property } = getSingleProperty.data?.property ?? {};
        setCurrenctProperty(property);
      }
    }
  }, [
    setCurrenctProperty,
    getSingleProperty.isSuccess,
    getSingleProperty.isFetching,
    getSingleProperty.data,
  ]);

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

export const useGetPropertyPreference = (email:string) => {
  const getPropertyPreference = useQuery({
    queryKey: ['property-preference', email],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROPERTY_SEARCH_PREFERENCE_AI_URL}/${email}`);
      console.log('API Response:', response.data); // Debugging
      return response.data; // Return the correct part of the response
    },
    enabled: !!email, // Only fetch if email is not empty
  });
  return { getPropertyPreference };
}

export const useUpdatePropertyPreference = (email:string) => {
  const updatePropertyPreference = useMutation({
    mutationKey: ['update-property-preference'],
    mutationFn: async (
      data: any,
    ) => {
      const res = await axios.patch(`${GET_PROPERTY_SEARCH_PREFERENCE_AI_URL}/${email}/field`, data);
      return  res.data
    },
    onSuccess: async (data: AxiosResponse<any>) => {
      console.log(data)
      success({ message: "Preference has been successfully updated" });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });
  return {updatePropertyPreference}
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
