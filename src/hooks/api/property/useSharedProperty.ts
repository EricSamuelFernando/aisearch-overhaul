import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { error } from '@/components/alert/notify';
import { getAuthToken } from '@/lib/storage';
import { useAuth } from '@/shared/hooks/useAuth';

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

export const useSharedPropertyAPI = () => {
  const {user} = useAuth()
  const headers = {
    headers:{
      'Authorization':getAuthToken()
    }
  }
  const createSharedProperty = useMutation({
    mutationKey: ['createSharedProperty'],
    mutationFn: async (inputData: any) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation createSharedProperty($createSharedPropertyInput: CreateSharedPropertyInput! ) {
            createSharedProperty(createSharedPropertyInput: $createSharedPropertyInput) {
              id
              propertyId
              propertyAddress
            }
          }
        `,
        variables: {...inputData  },
        
      }, { headers:{
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      
      } });

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data.errors?.[0]?.message || 'Failed to create shared property');
      }

      return response.data.data.createSharedProperty;
    },
    onError: (err: any) => {
      error({ message: err.message });
    },
  });

  // const getSharedProperties = useMutation({
  //   mutationKey: ['sharedProperties'],
  //   mutationFn: async () => {
  //     const response = await axios.post(GRAPHQL_URI, {
  //       query: `
  //         query {
  //           sharedProperties {
  //             id
  //             propertyId
  //             propertyUrl
  //             propertyAddress
  //             createdAt
  //           }
  //         }
  //       `,
  //     });

  //     if (response.status !== 200 || response.data.errors) {
  //       throw new Error(response.data.errors?.[0]?.message || 'Failed to fetch shared properties');
  //     }

  //     return response.data.data.sharedProperties;
  //   },
  //   onError: (err: any) => {
  //     error({ message: err.message });
  //   },
  // });

  const updateSharedProperty = useMutation({
    mutationKey: ['updateSharedProperty'],
    mutationFn: async (inputData: any) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation updateSharedProperty($updateSharedPropertyInput: UpdateSharedPropertyInput!) {
            updateSharedProperty(updateSharedPropertyInput: $updateSharedPropertyInput) {
              id
              updatedAt
            }
          }
        `,
        variables: { updateSharedPropertyInput: inputData },
      });

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data.errors?.[0]?.message || 'Failed to update shared property');
      }

      return response.data.data.updateSharedProperty;
    },
    onError: (err: any) => {
      error({ message: err.message });
    },
  });

  return {
    createSharedProperty,
    // getSharedProperties,
    updateSharedProperty,
  };
};


export const useSharedProperties = ()=> useQuery({
    queryKey: ['sharedProperties'],
    queryFn: async () => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query {
              sharedProperties {
                id
                propertyId
                propertyUrl
                propertyImage
                propertyAddress
                createdAt
                
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

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data.errors?.[0]?.message || 'Failed to fetch shared properties');
      }

      return response.data.data.sharedProperties;
    },
    enabled:true,

  });
