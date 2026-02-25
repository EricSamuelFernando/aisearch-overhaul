import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { success, error } from "../../components/alert/notify";
import { getAuthToken } from "../../lib/storage";

export const useAgentConversationApi = (handleCb?: () => void) => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";
  const isLocalhostRuntime =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const getTierFetchEndpoints = () => {
    const primaryEndpoint = String(GRAPHQL_URI || '').trim();
    const endpointCandidates = [primaryEndpoint];

    if (isLocalhostRuntime) {
      endpointCandidates.push(
        'http://localhost:4000/auth/graphql',
        'http://localhost:4000/graphql',
      );
    }

    return Array.from(new Set(endpointCandidates.filter(Boolean)));
  };

  const createThreadMutation = useMutation({
    mutationKey: ['create-thread'],
    mutationFn: async (createThreadInput: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken')
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Sending a POST request to the GraphQL endpoint
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
              mutation createThread($createThreadInput: CreateThreadInput!) {
                creat_thread(createThreadInput: $createThreadInput) {
                  id
                }
              }
            `,
          variables: {
            createThreadInput,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response is successful
      if (response.status !== 200) {
        throw new Error(response?.data?.errors?.[0]?.message || 'Failed to create thread');
      }

      return response.data.data.creat_thread;  // Return the created thread
    },
    onSuccess: (data) => {
      // Handle success response
      success({ message: "Thread created successfully!" });
      if (handleCb) handleCb(); // Optional callback after success
    },
    onError: (error: any) => {
      console.error('Error creating thread:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllThreadsMutation = useMutation({
    mutationKey: ['get-all-threads'],
    mutationFn: async (data: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query getAllThreads {
                get_all_threads {
                  id
                  threadName
                  propertyId
                  message
                  createdAt
                  updatedAt
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

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }

        return response.data.data.get_all_threads;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllThreadsByUserMutation = useMutation({
    mutationKey: ['get_threads_by_user'],
    mutationFn: async (data: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query GetThreadsByUser($userId: String!) {
                get_threads_by_user(userId: $userId) {
                  id
                  threadName
                  roomId
                  propertyId
                  listingId
                  propertyName
                  unreadCount
                  message
                  propertyOwnerId
                  buyerAgent {
                    id
                    firstName
                    lastName
                    email
                  }
                  sellerAgent {
                    id
                    firstName
                    lastName
                    email
                  }

                }
              }`,
            variables: {
              userId: data.userId,
              threadName: data.threadName,
              isRead: data.isRead
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllConversationMessagesMutation = useMutation({
    mutationKey: ['conversationsByThread'],
    mutationFn: async (threadId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query threadId($threadId: String!) {
                conversationsByThread(threadId: $threadId) {
                  id
                  isRead
                  receiverId
                  messageType
                  fileType
                  message
                  senderId
                  createdAt
                }
              }`,
            variables: {
              threadId: threadId
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllEngagedProperties = useMutation({
    mutationKey: ['getAllEngagedProperties'],
    mutationFn: async (userId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query getUserEngagements($userId: String!) {
                getUserEngagements(userId: $userId) {
                  id
                  propertyId,
                  propertyImage,
                  propertyAddress,
                  userId,
                  propertyProgress,
                  status,
                  tours{
                    id,
                    fullName,
                    phoneNumber,
                    events
                    {
                      eventDate,
                      tourTime,
                      id
                    }
                  }
                  coBuyers {
                    id
                    firstName
                    lastName
                    email
                    phone
                  }
                  user {
                  id
                  firstName
                  lastName
                  email
                  phone
                }
                buyerAgent{
                  id
                  userId
                  user{
                   id
                   firstName
                   lastName
                   email
                   phone
                  }
                  }
                }
                  
              }`,
            variables: {
              userId: userId
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getEngagedPropertyByPropertyId = useMutation({
    mutationKey: ['getAllEngagedPropertyByPropertyId'],
    mutationFn: async (propertyId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query getUserEngagementsByPropertyId($propertyId: String!) {
                getUserEngagementsByPropertyId(propertyId: $propertyId) {
                  id
                  propertyId,
                  propertyImage,
                  propertyAddress,
                  userId,
                  propertyProgress,
                  status,
                }
              }`,
            variables: {
              propertyId: propertyId
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const deleteEngagedPropertyById = useMutation({
    mutationKey: ['deleteEngagedPropertyById'],
    mutationFn: async (propertyId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query deleteEngagement($propertyId: String!) {
                deleteEngagement(propertyId: $propertyId) {
                  id
                }
              }`,
            variables: {
              propertyId: propertyId
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }
        if (response.status === 200) {
          success({ message: "Property removed successfully" })
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const searchEngagedProperty = useMutation({
    mutationKey: ['searchUserPropertyEngagements'],
    mutationFn: async (searchData: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query SearchUserPropertyEngagements(
                  $userId: String
                  $propertyId: String
                  $status: EngagementStatus
                  $buyerAgentId: String
                  $search: String
                ) {
                  searchUserPropertyEngagements(
                    userId: $userId
                    propertyId: $propertyId
                    status: $status
                    buyerAgentId: $buyerAgentId
                    search: $search
                  ) {
                      id
                    propertyId,
                    propertyImage,
                    propertyAddress,
                    userId,
                    propertyProgress,
                    status,
                    coBuyers {
                      id
                      firstName
                      lastName
                      email
                      phone
                    }
                    user {
                    id
                    firstName
                    lastName
                    email
                    phone
                  }
                  }
                }
              `,
            variables: {
              ...searchData
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      // error({ message: errorMessage });
    },
  });

  const addParticipant = useMutation({
    mutationKey: ['addParticipant'],
    mutationFn: async ({ threadId, email }: { threadId: string; email: string }) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation AddParticipantToConversationThread($threadId: String!, $email: String!) {
              addParticipantToConversationThread(threadId: $threadId, email: $email) {
                message
                success
              }
            }
          `,
          variables: {
            threadId,
            email,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200 || response.data.errors) {
        const errorMsg = response.data?.errors?.[0]?.message || 'Failed to add participant';
        // throw new Error(errorMsg);
        error({ message: errorMsg });
      }
      return response.data?.data?.addParticipantToConversationThread;
    },
  });

  const getAllThreadByIdMutation = useMutation({
    mutationKey: ['get_threads_by_id'],
    mutationFn: async (threadId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query getThreadsById($id: String!) {
                get_threads_by_id(id: $id) {
                  id
                  threadName
                  propertyId
                  listingId
                  propertyName
                  unreadCount
                  message
                  buyerAgent {
                    id
                    firstName
                    lastName
                    email
                  }
                  sellerAgent {
                    id
                    firstName
                    lastName
                    email
                  }

                }
              }`,
            variables: {
              id: threadId
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAgentTiersForThreadMutation = useMutation({
    mutationKey: ['getAgentTiersForThread'],
    mutationFn: async (threadId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const requestBody = {
          query: `
            query GetAgentTiersForThread($threadId: String!) {
              getAgentTiersForThread(threadId: $threadId) {
                threadId
                agentId
                agentEmail
                tiers
              }
            }
          `,
          variables: { threadId },
        };
        const requestConfig = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        const endpointCandidates = getTierFetchEndpoints();
        let lastError: any = null;

        for (let index = 0; index < endpointCandidates.length; index += 1) {
          const endpoint = endpointCandidates[index];
          try {
            const response = await axios.post(endpoint, requestBody, requestConfig);

            if (response.status !== 200 || response.data.errors) {
              throw new Error(
                response.data?.errors?.[0]?.message || 'Failed to fetch agent tiers',
              );
            }

            return response.data?.data?.getAgentTiersForThread;
          } catch (endpointError: any) {
            lastError = endpointError;
            const hasFallbackEndpoint = index < endpointCandidates.length - 1;
            if (hasFallbackEndpoint) {
              console.warn(
                `[getAgentTiersForThread] Failed at ${endpoint}. Retrying with fallback endpoint.`,
                endpointError?.response?.data?.errors?.[0]?.message ||
                  endpointError?.message ||
                  endpointError,
              );
            }
          }
        }

        throw lastError || new Error('Failed to fetch agent tiers');
      } catch (error) {
        console.error('Error fetching agent tiers:', error);
        throw error;
      }
    },
  });

  const getAllSnapzRequest = useMutation({
    mutationKey: ['get_snapz_request'],
    mutationFn: async (snapData: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query findAllSnapsParticipants($snapData: SearchParticipentDTO!) {
              findAllSnapsParticipants(snapData: $snapData) {
                id
                status
                snap {
                  id
                  name
                  link
                  user{
                    id
                    email
                    firstName
                    lastName
                  }
                }
                participant {
                  id
                  email
                  firstName
                  lastName
                }
              }
            }
          `,
          variables: {
            snapData,
          },
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
          response.data?.errors?.[0]?.message || 'Failed to fetch Snapz requests'
        );
      }

      return response.data.data.findAllSnapsParticipants;
    },
    onSuccess: (data) => {
      console.log('Fetched Snapz requests:', data);
    },
    onError: (err: any) => {
      console.error('Error fetching Snapz requests:', err);
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err.message ||
        'An error occurred';
      console.error(errorMessage);
    },
  });

  const updateSnapzById = useMutation({
    mutationKey: ['update_snapz_participant'],
    mutationFn: async (input: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation updateSnapsParticipant($updateSnapsParticipantsInput: UpdateSnapsParticipantsInput!) {
              updateSnapsParticipant(updateSnapsParticipantsInput: $updateSnapsParticipantsInput) {
                id
                status
              }
            }
          `,
          variables: {
            updateSnapsParticipantsInput: input,
          },
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
          response.data?.errors?.[0]?.message || 'Failed to update Snapz participant'
        );
      }

      return response.data.data.updateSnapsParticipant;
    },
    onSuccess: (data) => {
      console.log('Updated Snapz participant:', data);
    },
    onError: (err: any) => {
      console.error('Error updating Snapz participant:', err);
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err.message ||
        'An error occurred';
      console.error(errorMessage);
    },
  });

  const getAllSnapzProperties = useMutation({
    mutationKey: ['get_snapz_request'],
    mutationFn: async (snapId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query findAllBySnap($snapId: String!) {
              favourites(snapId: $snapId) {
                id
                name
                address
                city
                zipCode
                price
                image
                bedRooms
                bathRooms
                sqft
                listingId
                propertyId
                snapId
              }
            }
          `,
          variables: {
            snapId,
          },
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
          response.data?.errors?.[0]?.message || 'Failed to fetch Snapz properties'
        );
      }

      return response.data.data.favourites; // ✅ return correct data path
    },
    onSuccess: (data) => {
      console.log('Fetched Snapz properties:', data);
      // setState or do something with the data here
    },
    onError: (err: any) => {
      console.error('Error fetching Snapz properties:', err);
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err.message ||
        'An error occurred';
      console.error(errorMessage);
    },
  });

  const searchMessages = useMutation({
    mutationKey: ['conversationsByThread'],
    mutationFn: async ({
      threadId,
      searchText,
    }: {
      threadId: string;
      searchText: string;
    }) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
            query SearchMessages($threadId: String!, $searchText: String!) {
              conversationsByThreadAndSearch(threadId: $threadId, searchText: $searchText) {
                id
                isRead
                receiverId
                messageType
                fileType
                message
                senderId
                createdAt
              }
            }
          `,
            variables: {
              threadId,
              searchText,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch messages'
          );
        }

        return response.data.data.conversationsByThreadAndSearch;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fuzzy matched messages:', data);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  return {
    createThreadMutation,
    getAllThreadsMutation,
    getAllThreadsByUserMutation,
    getAllConversationMessagesMutation,
    getAllEngagedProperties,
    getEngagedPropertyByPropertyId,
    deleteEngagedPropertyById,
    searchEngagedProperty,
    addParticipant,
    getAllThreadByIdMutation,
    getAgentTiersForThreadMutation,
    getAllSnapzRequest,
    updateSnapzById,
    getAllSnapzProperties,
    searchMessages
  };
};

