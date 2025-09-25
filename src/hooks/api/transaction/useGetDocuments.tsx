'use client';

import {
  AgentOfferResponse,
  ApiResponse,
  DocumentResponse,
} from '@/interfaces/property.interface';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import {
  GET_PROPERTY_OFFERS,
  GET_SINGLE_OFFER_DETAIL,
  AGENT_SUBMIT_OFFER,
  GET_PROPERTY_DOCUMENT_REPO,
  ADD_PROPERTY_DOCUMENT,
  DELETE_PROPERTY_DOCUMENT,
} from '@/utils/apis';
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { error, success } from '@/components/alert/notify';
import { AxiosResponse } from '@/types/axios.types';
import { queryClient } from '@/providers/query-provider';

// export const useAgentOfferApi = (id: string) => {
//   const submitOffer = useMutation({
//     mutationKey: ['agent-submit-offer', id],
//     mutationFn: () => {
//       return handleAsync<AxiosResponse<AgentOfferResponse>>(
//         client.get,
//         `${AGENT_SUBMIT_OFFER}/${id}`
//       )
//     },
//     onSuccess: (data) => {
//       if ((data as any).status === 200) {
//         success({ message: data?.data?.message })
//         queryClient.invalidateQueries({
//           queryKey: ['single-offer-details', id],
//         })
//         queryClient.invalidateQueries({
//           queryKey: ['single-propert-offers'],
//         })
//       }
//     },
//     onError: (err: any) => {
//       error({ message: err?.response?.data?.message })
//     },
//   })

//   const getOfferDetails = useQuery({
//     queryKey: ['single-offer-details', id],
//     queryFn: () => {
//       return handleAsync<AxiosResponse<AgentOfferResponse>>(
//         client.get,
//         `${GET_SINGLE_OFFER_DETAIL}/${id}`
//       )
//     },
//   })

//   const propertyOffers = useQuery({
//     queryKey: ['single-propert-offers', id],
//     queryFn: () => {
//       return handleAsync<AxiosResponse<ApiResponse<AgentOfferResponse>>>(
//         client.get,
//         `${GET_PROPERTY_OFFERS}/${id}`
//       )
//     },
//   })

//   return { submitOffer, getOfferDetails, propertyOffers }
// }
