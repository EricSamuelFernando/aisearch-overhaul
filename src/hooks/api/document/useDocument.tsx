import {
  ApiResponse,
  DocumentResponse,
  IProperty,
} from '@/interfaces/property.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { extractKeyFromUrl } from '@/lib/helpers';
import { AxiosResponse } from '@/types/axios.types';
import {
  ADD_PROPERTY_DOCUMENT,
  DELETE_PROPERTY_DOCUMENT,
  GET_PROPERTY_DOCUMENT_REPO,
  GET_PROPERTY_LIST,
  REVOKE_ACCESS,
} from '@/utils/apis';
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

export const useDocumentApi = (id: string) => {
  const queryClient = useQueryClient();

  const propertyDocuments = useQuery({
    queryKey: ['property-document', id],
    queryFn: () => {
      return handleAsync<AxiosResponse<ApiResponse<DocumentResponse>>>(
        client.get,
        `${GET_PROPERTY_DOCUMENT_REPO}/${id}`,
      );
    },
  });

  const addPropertyMutation = useMutation({
    mutationKey: ['property-document'],
    mutationFn: (data: {
      name: string;
      url: string;
      thumbNail: string;
      documentType: string;
    }) => {
      return handleAsync<AxiosResponse<ApiResponse<DocumentResponse>>>(
        client.post,
        `${ADD_PROPERTY_DOCUMENT}/${id}`,
        data,
      );
    },
    onError: (err: any) => {
      console.error(err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        'property-document',
        id,
      ] as InvalidateQueryFilters);
    },
  });

  const deletePropertyMutation = useMutation({
    mutationKey: ['property-document-id'],
    mutationFn: (propertyDocumentId: string) => {
      return handleAsync<AxiosResponse<ApiResponse<DocumentResponse>>>(
        client.delete,
        `${DELETE_PROPERTY_DOCUMENT}/${propertyDocumentId}`,
      );
    },
    onError: (err: any) => {
      console.error(err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        'property-document',
        id,
      ] as InvalidateQueryFilters);
    },
  });

  return {
    propertyDocuments,
    addPropertyMutation,
    deletePropertyMutation,
  };
};

export const fetchAiSummary = async (documentUrl: string) => {
  try {
    const documentKey = extractKeyFromUrl(documentUrl);

    if (!documentKey) {
      console.error('Failed to extract key from URL:', documentUrl);
      return;
    }

    const { data } = await axios.post(
      'https://dev.ai.api.ocreal.online/docSummary',
      {
        key: documentKey,
        summary_version: 'brief',
        summary_type: 'paragraph',
      },
    );

    console.log('AI Summary:', data);
    return data;
  } catch (err) {
    const error = err as Error & { response?: { data?: { message?: string } } };
    console.error(
      'Error fetching AI summary:',
      error.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const useGetPropertyListApi = (id: string) => {
  const queryClient = useQueryClient();

  const propertyList = useQuery({
    queryKey: ['property-list', id],
    queryFn: async () =>
      await client
        .get(`${GET_PROPERTY_LIST}/${id}`)
        .then(pickResult, pickErrorMessage),

    enabled: typeof id !== 'undefined',
  });

  const deletePropertyMutation = useMutation({
    mutationKey: ['property-list-id'],
    mutationFn: (userId: string) => {
      return handleAsync<AxiosResponse<ApiResponse<DocumentResponse>>>(
        client.delete,
        `${REVOKE_ACCESS}/${userId}`,
      );
    },
    onError: (err: any) => {
      console.error('Failed to delete property:', err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-list', id] });
    },
  });

  return {
    propertyList,
    deletePropertyMutation,
  };
};
