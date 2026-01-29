import { useQuery } from '@tanstack/react-query';

import client from '@/lib/client';
import { pickErrorMessage, pickResult } from '@/lib/client';
import axios from 'axios';
import { getAuthToken } from '@/lib/storage';
import { GET_MESSAGE_PROPERTY_MESSAGE_THREADS } from '@/shared/constants/env';
import { useAuth } from '@/shared/hooks/useAuth';

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql"

const getConnectedUserAgents = async () => {
  try {
    const token = getAuthToken()
    const response = await axios.post(
      GRAPHQL_URI,
      {
        query: `
        query GetAllVerifiedUsers {
          getAllVerifiedUsers {
            id
            email
            firstName
            lastName
           
          }
        }`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.getAllVerifiedUsers;
  } catch (error: any) {
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
};

const getConnectedAgentMessageThread = async (userId: string) => {
  try {
    const token = getAuthToken()
    const response = await axios.get(
      `${GET_MESSAGE_PROPERTY_MESSAGE_THREADS}/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // if (response.data.errors) {
    //   throw new Error(response.data.errors[0].message);
    // }

    console.log(response)
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
};

export const useGetConnectedUserAgents = () => {
  return useQuery({
    queryKey: ['get-connected-agents'],
    queryFn: getConnectedUserAgents,
  });
};

export const useGetConnectedAgentMessageThreads = (userId: string) => {
  return useQuery({
    queryKey: ['get-connected-message-thread-agents'],
    queryFn: () => getConnectedAgentMessageThread(userId),
  });
};

const getConnectedAgents = () => {
  return client
    .get(`message/user/connected-agents/messages`)
    .then(pickResult, pickErrorMessage);
};

export const useGetConnectedAgents = () => {
  return useQuery({
    queryKey: ['get-connected-agents'],
    queryFn: getConnectedAgents,
  });
};



