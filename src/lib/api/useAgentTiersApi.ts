import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthToken } from '@/lib/storage';

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

export const useAgentTiersApi = () => {
    const updateAgentTiersMutation = useMutation({
        mutationKey: ['updateAgentTiers'],
        mutationFn: async (tiers: string) => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken');
            const response = await axios.post(
                GRAPHQL_URI,
                {
                    query: `
            mutation UpdateAgentTiers($input: UpdateAgentInput!) {
              updateAgentTiers(input: $input) {
                id
                tiers
              }
            }
          `,
                    variables: {
                        input: { tiers },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data?.data?.updateAgentTiers;
        },
    });

    return { updateAgentTiersMutation };
};

export const fetchAgentTiers = async (agentId: string) => {
    const token = getAuthToken() || localStorage.getItem('userAccessToken');
    const response = await axios.post(
        GRAPHQL_URI,
        {
            query: `
        query GetAgentDetails {
          getAgentDetails {
            id
            tiers
          }
        }
      `,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data?.data?.getAgentDetails?.tiers;
};
