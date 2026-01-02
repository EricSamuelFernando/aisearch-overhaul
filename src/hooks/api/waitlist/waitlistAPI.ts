import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
export const WaitlistAPIs = (handleCb?: () => void) => {
  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'https://zqnraeibbc.execute-api.us-east-1.amazonaws.com/prod/graphql';
  const waitlistResponse = useMutation({
    mutationKey: ['create_waitlist'],
    mutationFn: async (createWaitlistData: any) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
                mutation CreateWaitlist($createWaitlistData: CreateWaitlistDto!) {
                  createWaitlist(createWaitlistData: $createWaitlistData) {
                    id
                    name
                    email
                  }
                }
              `,
          variables: {
            createWaitlistData,
          },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to create waitlist',
          );
        }

        return response.data.data.createWaitlist;
      } catch (error) {
        console.error('Error creating waitlist:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Successfully added to waitlist:', data);
    },
    onError: (error: any) => {
      console.error('Error creating waitlist:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getWaitlistQuery = useQuery({
    queryKey: ['get_all_waitlist'],
    queryFn: async () => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            query {
              getAllWaitlist {
                total
                data {
                  id
                  name
                  email
                  roles
                }
              }
            }
          `,
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch waitlist',
          );
        }

        return response.data.data.getAllWaitlist;
      } catch (error) {
        console.error('Error fetching waitlist:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  return {
    waitlistResponse,
    getWaitlistQuery,
  };
};
