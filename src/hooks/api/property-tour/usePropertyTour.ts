import { success, error } from '@/components/alert/notify';
import { useAppDispatch } from '@/lib/hook';
import { getAuthToken } from '@/lib/storage';
import { addPropertyTourVisit, createPropertyTourEvent, removePropertyTourVisit, updatePropertyTourVisit } from '@/slices/property/property-slice';
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { remove } from 'lodash';

export const useGetToursByProperty = (propertyId: string) =>
  useQuery({
    queryKey: ['getPropertyToursByProperty', propertyId],
    queryFn: async () => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      const GRAPHQL_URI =
        process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query getPropertyToursByPropertyId($propertyId: String!) {
              getPropertyToursByPropertyId(propertyId: $propertyId) {
                id
                fullName
                phoneNumber
                createdAt
                updatedAt
                events {
                  id
                  eventDate
                  tourTime
                }
              }
            }
          `,
          variables: { propertyId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch property tours'
        );
      }

      return response.data.data.getPropertyToursByPropertyId;
    },
    enabled: !!propertyId,
  });

function usePropertyTour() {

  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";

  const dispatch = useAppDispatch();

  const addPropertyTour = useMutation({
    mutationKey: ['add-property-tour'],
    mutationFn: async (tourInput: any) => {
      try {
        console.log(tourInput)
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
                  mutation addPropertyTour($input: CreatePropertyTourInput!) {
  addPropertyTour(tourInput: $input) {
    id
    fullName
    phoneNumber
    createdAt
    updatedAt
    events {
      id
      eventDate
      tourTime
    }
  }
}

                  `,
            variables: {
              input:
              {
                ...tourInput
              }
            },
          },
        );
        // Check if the response is successful
        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to add property tour');
        }
        console.log(response)

        success({ message: "The tour request has been successfully created" })
        dispatch(addPropertyTourVisit(tourInput))
        return response.data.data.addPropertyTour;  // Correctly reference the mutation result
      } catch (err: any) {
        console.log(err?.message)
        error({ message: err?.message })
        throw err;  // Re-throw error for handling in onError
      }
    }
  });

  const removePropertyTour = useMutation({
    mutationKey: ['remove-property-tour'],
    mutationFn: async (id: string) => {
      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
                  mutation RemovePropertyTour($id: String!) {
                    removePropertyTour(id: $id)
                }
                  `,
            variables: {
              id
            }
          },
        );
        // Check if the response is successful
        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to add property tour');
        }
        console.log(response)
        success({ message: "The event has been removed successfully" })
        dispatch(removePropertyTourVisit(id))
        return response.data.data.removePropertyTour;  // Correctly reference the mutation result
      } catch (error) {
        throw error;  // Re-throw error for handling in onError
      }
    }
  });


  const updatePropertyTour = useMutation({
    mutationKey: ['update-property-tour'],
    mutationFn: async (updateTourDto: any) => {
      try {
        console.log("__inside__")
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
                  mutation UpdatePropertyTour($id: String!, $updateTourDto: UpdateTourDto!) {
                    updatePropertyTour(id: $id, updateTourDto: $updateTourDto) {
                        id
                        tourTime,
                        eventDate
                        
                    }
                }
                  `,
            variables: {

              updateTourDto
            }
          },
        );
        // Check if the response is successful
        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to add property tour');
        }
        console.log(response)
        success({ message: "The event has been successfully created" })
        return response.data.data.updatePropertyTour;  // Correctly reference the mutation result
      } catch (error: any) {
        console.log(error?.message)
        throw error;  // Re-throw error for handling in onError
      }
    }
  });

  const updateTourEvent = useMutation({
    mutationKey: ['update-property-tour'],
    mutationFn: async ({ id, eventUpdate }: { id: string; eventUpdate: any }) => {
      try {
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
              id,
              eventUpdate
            }
          }
        );
        // Check for successful response
        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to update event');
        }
        console.log(response?.data?.data?.updatePropertyTourEvents)
        success({ message: "The event has been successfully updated" })
        dispatch(updatePropertyTourVisit(response?.data?.data?.updatePropertyTourEvents))
        return response.data.data.updatePropertyTourEvents; // Return updated event
      } catch (error) {
        throw error;
      }
    }
  });

  const createTourEvent = useMutation({
    mutationKey: ['create-property-tour'],
    mutationFn: async ({ propertyTourId, events }: { propertyTourId: string; events: any[] }) => {
      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
           mutation CreateTourEvent($data: createMultiEventDto!) {
            createTourEvent(data: $data) {
               id
               tourTime,
               eventDate
            }
          }
            `,
            variables: {
              data: {
                propertyTourId,
                events
              }
            }
          }
        );

        // Check for successful response
        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to create event');
        }

        console.log(response?.data?.data?.createTourEvent)

        success({ message: "The tour events has been successfully added" });
        dispatch(createPropertyTourEvent(response?.data?.data?.createTourEvent)); // You may want to handle event creation dispatch differently
        return response.data.data.createTourEvent; // Return created events
      } catch (error) {
        throw error;
      }
    }
  });


  return {
    addPropertyTour,
    removePropertyTour,
    updatePropertyTour,
    updateTourEvent,
    createTourEvent
  }
}

export const useGetLatestFieldsAnswer = (userId?: string, propertyId?: string) =>
  useQuery({
    queryKey: ['getLastestlyFieldsAnswerByUser', userId, propertyId], // Unique key for caching based on userId and propertyId
    queryFn: async () => {
      const GRAPHQL_URI = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL || 'http://localhost:4001/graphql';

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      };

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetLatestlyFieldsAnswerByUser($userId: String!, $propertyId: String!) {
             getLastestlyFieldsAnswerByUser(userId: $userId, propertyId: $propertyId) {
             id
            }
          }
          `,
          variables: {
            userId,
            propertyId,
          },
        },
        { headers }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch latest answer');
      }
      console.log("DATA", response)
      return response.data.data.getLastestlyFieldsAnswerByUser;
    },
    enabled: !!userId && !!propertyId, // Only run the query if both userId and propertyId are provided
  });


export default usePropertyTour




