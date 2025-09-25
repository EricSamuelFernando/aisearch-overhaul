import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { error, success } from '@/components/alert/notify';
import { ISingleProperty } from '@/interfaces/property.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AxiosResponse } from '@/types/axios.types';
import { FilterType } from '@/types/global.types';
import { CREATE_PROPERTY } from '@/utils/apis';
import { PropertyDetails } from '@/types/property.types';
import { useDispatch } from 'react-redux';
import { setPropertyDetailsAction } from '@/slices/verification/propertyVerification';
import { useAtom } from 'jotai';
import { claimPropertyAtom } from '@/hooks/claim-property-atom';
import axios from 'axios';

const initialState: PropertyDetails = {
  propertyAddressDetails: {
    formattedAddress: '',
    latitude: '',
    longitude: '',
    placeId: '',
    streetNumber: '',
    streetName: '',
    city: '',
    province: '',
    state: '',
    postalCode: '',
    country: '',
  },
  _id: '',
  latitude: '',
  longitude: '',
  placeId: '',
  streetNumber: '',
  streetName: '',
  city: '',
  province: '',
  state: '',
  postalCode: '',
  country: '',
  images: [],
};

// Define actions that can be dispatched to modify the state
type Action =
  | {
      type: 'SET_FILTER';
      payload: {
        field: keyof PropertyDetails;
        value: string | number | object;
      };
    }
  | { type: 'RESET_STATE' };

/**
 * @description Reducer function to handle state modifications based on actions.
 * @param {PropertyDetails} state - The current state of filters.
 * @param {Action} action - The action to be performed on the state.
 * @returns {PropertyDetails} The updated state after applying the action.
 */

function UserReducer(state: PropertyDetails, action: Action): PropertyDetails {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const useAddProperty = () => {
  const [filters, dispatch] = React.useReducer(UserReducer, initialState);

  const [_, setPropertyToStorage] = useAtom(claimPropertyAtom);
  const reduxDispatch = useDispatch();

  const MORTGAGE_FILE_UPLOAD = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_URL || "http://localhost:4001"

  const router = useRouter();

  /**
   * @description Function to set individual filters.
   * @param {UserFilterType} payload - The payload containing filter information.
   */
  const setFilter = React.useCallback(
    (payload: FilterType<PropertyDetails>) => {
      dispatch({ type: 'SET_FILTER', payload });
    },
    [dispatch],
  );

  const resetFilter = React.useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  const _propertyDetails = useMemo(
    () => ({
      propertyAddressDetails: {
        ...filters,
        ...filters.propertyAddressDetails,
      },
    }),
    [filters],
  );

  const uploadNewFile = async (
    file: File,
    userId: string,
    propertyId: string
  ) => {
    try {
      // console.log(file, userId, propertyId ,user?.id );

      // Validate inputs
      if (!file || !userId || !propertyId) {
        throw new Error('File, userId, and propertyId are required.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('propertyId', propertyId)

      // Make API call to upload file
      const response = await axios.post(`${MORTGAGE_FILE_UPLOAD}/file-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // success({ message: "File Uploaded successfully" })
      return response.data
    } catch (error: any) {
      console.error('Error uploading file:', error.message)

      // Handle HTTP errors gracefully
      if (error.response) {
        console.error('Server responded with status:', error.response.status)
        console.error('Response data:', error.response.data)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Request setup error:', error.message)
      }
      console.log("Error : ", error);

      // throw new Error('File upload failed. Please try again.')
    }
  }

  const addPropertyMutation = useMutation({
    mutationKey: ['create-property'],
    mutationFn: async () => {
      console.log({ _propertyDetails });

      const formattedPropertyDetails = {
        propertyAddressDetails: {
          formattedAddress:
            _propertyDetails.propertyAddressDetails.formattedAddress,

          placeId: _propertyDetails.propertyAddressDetails.placeId,
          streetNumber: _propertyDetails.propertyAddressDetails.streetNumber,
          streetName: _propertyDetails.propertyAddressDetails.streetName,
          city: _propertyDetails.propertyAddressDetails.city,
          province: _propertyDetails.propertyAddressDetails.province,
          state: _propertyDetails.propertyAddressDetails.state,
          postalCode: _propertyDetails.propertyAddressDetails.postalCode,
          country: _propertyDetails.propertyAddressDetails.country,
        },
        _id: _propertyDetails.propertyAddressDetails._id,
        images: _propertyDetails.propertyAddressDetails.images ?? [],
        videos: _propertyDetails.propertyAddressDetails.videos ?? [],
        features: _propertyDetails.propertyAddressDetails.features,
        propertyDescription:
          _propertyDetails.propertyAddressDetails.propertyDescription,
        lotSizeValue: `${_propertyDetails.propertyAddressDetails.lotSizeValue}`,
        lotSizeUnit:
          _propertyDetails.propertyAddressDetails.lotSizeUnit ?? 'sqft',
        numBathroom: `${_propertyDetails.propertyAddressDetails.numBathroom}`,
        numBedroom: `${_propertyDetails.propertyAddressDetails.numBedroom}`,
        price: _propertyDetails.propertyAddressDetails.price,
        propertyTaxes:
          _propertyDetails.propertyAddressDetails.propertyTaxes ?? [],
        propertyType: _propertyDetails.propertyAddressDetails.propertyType,
        latitude: `${_propertyDetails.propertyAddressDetails.latitude}`,
        longitude: `${_propertyDetails.propertyAddressDetails.longitude}`,
        propertyDocument:
          _propertyDetails.propertyAddressDetails.propertyDocument,
        brokers: _propertyDetails.propertyAddressDetails.brokers,
        listed: false,
      };

      console.log(formattedPropertyDetails);

      return await handleAsync<AxiosResponse<ISingleProperty>>(
        client.post,
        CREATE_PROPERTY,
        {
          ...formattedPropertyDetails,
        },
      );
    },
    onSuccess: async (data) => {
      console.log(data.data.data.property);

      reduxDispatch(setPropertyDetailsAction(data.data.data.property));
      // Convert yearBuild to number or null for compatibility
      const propertyForStorage = {
        ...data.data.data.property,
        yearBuild:
          typeof data.data.data.property.yearBuild === 'string'
            ? Number(data.data.data.property.yearBuild) || null
            : data.data.data.property.yearBuild ?? null,
      };
      setPropertyToStorage(propertyForStorage);
      router?.push(`/dashboard/seller/listing/listing-empty`);

      success({ message: data?.data?.message });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const AddPropertyActions = {
    addPropertyMutation,
    uploadNewFile,
    setFilter,
    resetFilter,
    filters,
  };

  return AddPropertyActions;
};

export default useAddProperty;
