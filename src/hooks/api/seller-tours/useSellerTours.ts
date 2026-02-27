import { success, error } from '@/components/alert/notify';
import { getAuthToken } from '@/lib/storage';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

const getHeaders = () => {
  const token = getAuthToken() || localStorage.getItem('userAccessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const useGetRequestedToursBySeller = (sellerId: string) =>
  useQuery({
    queryKey: ['getRequestedToursBySeller', sellerId],
    queryFn: async () => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetRequestedToursBySeller($sellerId: String!) {
              getRequestedToursBySeller(sellerId: $sellerId) {
                id
                fullName
                phoneNumber
                status
                propertyId
                listingId
                createdAt
                updated_by_Id
                sellerAgentId
                events {
                  id
                  eventDate
                  tourTime
                }
              }
            }
          `,
          variables: { sellerId },
        },
        { headers: getHeaders() }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch tours');
      }
      return response.data.data.getRequestedToursBySeller;
    },
    enabled: !!sellerId,
  });

export const useRespondToTourRequest = () =>
  useMutation({
    mutationKey: ["respond-to-tour"],
    mutationFn: async (input: {
      tourId: string;
      responderId: string; // seller or sellerAgent id
      action: "ACCEPT" | "REJECT" | "PROPOSE";
      proposedDate?: string;
      proposedTime?: string;
    }) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation RespondToTourRequest($input: RespondTourInput!) {
              respondToTourRequest(input: $input) {
                id
                status
              }
            }
          `,
          variables: { input },
        },
        { headers: getHeaders() }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ||
          "Failed to update tour request"
        );
      }

      success({ message: "Tour request updated successfully ✅" });
      return response.data.data.respondToTourRequest;
    },
  });



export const useRescheduleTour = () =>
  useMutation({
    mutationKey: ['updatePropertyTourEvents'],
    mutationFn: async ({
      eventId,
      eventDate,
      tourTime,
    }: {
      eventId: string;
      eventDate: string;
      tourTime: string;
    }) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation UpdatePropertyTourEvents($id: String!, $eventUpdate: UpdateEventDto!) {
              updatePropertyTourEvents(id: $id, eventUpdate: $eventUpdate) {
                id
                eventDate
                tourTime
              }
            }
          `,
          variables: {
            id: eventId,
            eventUpdate: {
              eventDate,
              tourTime
            },
          },
        },
        { headers: getHeaders() }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to reschedule tour'
        );
      }

      success({ message: 'Tour rescheduled successfully ✅' });
      return response.data.data.updatePropertyTourEvents;
    },
  });


export const useBuyerRespondToProposal = () =>
  useMutation({
    mutationKey: ['buyer-respond'],
    mutationFn: async (input: { tourId: string; action: 'ACCEPT' | 'REJECT' }) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation BuyerRespondToProposal($input: BuyerRespondInput!) {
              buyerRespondToProposal(input: $input) {
                id
                status
                events { id eventDate tourTime }
              }
            }
          `,
          variables: { input },
        },
        { headers: getHeaders() }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data?.errors?.[0]?.message || 'Failed to respond to proposal');
      }

      success({ message: 'Buyer responded ✅' });
      return response.data.data.buyerRespondToProposal;
    },
  });


export const useGetToursByBuyer = (buyerId: string | undefined) =>
  useQuery({
    queryKey: ["buyer-tours", buyerId],
    queryFn: async () => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetToursByBuyer($buyerId: String!) {
              getRequestedToursByBuyer(buyerId: $buyerId) {
                id
                status
                propertyId
                sellerId
                createdAt
                updated_by_Id
                sellerAgentId
                events {
                  id
                  eventDate
                  tourTime
                }
              }
            }
          `,
          variables: { buyerId },
        },
        { headers: getHeaders() }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || "Failed to fetch buyer tours"
        );
      }

      return response.data.data.getRequestedToursByBuyer;
    },
    enabled: !!buyerId,
  });



