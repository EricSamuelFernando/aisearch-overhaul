import { error, success } from "@/components/alert/notify";
import { useAppDispatch } from "@/lib/hook";
import { getAuthToken } from "@/lib/storage";
import { setSelectedThreadInfo } from "@/slices/chat/chat.slice";
import { useMutation, useQuery } from "@tanstack/react-query";
import API from "@/lib/api/axios";
import { useDispatch } from "react-redux";
import { setEngagedProperty } from "@/slices/property/property-slice";

const MORTGAGE_GRAPHQL_URI = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL || "http://localhost:4001/graphql";

export const useAgentConversationApi = (handleCb?: () => void) => {
  const dispatch = useAppDispatch();
  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/graphql';



  const createThreadMutation = useMutation({
    mutationKey: ['create-thread'],
    mutationFn: async (createThreadInput: any) => {
      try {
        // Sending a POST request to the GraphQL endpoint
        const response = await API.post(
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
          }
        );

        // Check if the response is successful
        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to create thread',
          );
        }

        return response.data.data.creat_thread; // Return the created thread
      } catch (error) {
        throw error; // Re-throw error for handling in onError
      }
    },
    onSuccess: (data) => {
      // Handle success response
      success({ message: 'Great! The thread has been created' });
      if (handleCb) handleCb(); // Optional callback after success
    },
    onError: (error: any) => {
      console.error('Error creating thread:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllThreadsMutation = useMutation({
    mutationKey: ['get-all-threads'],
    mutationFn: async (data: any) => {
      try {
        const response = await API.post(
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
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllThreadsByUserMutation = useMutation({
    mutationKey: ['get_threads_by_user'],
    mutationFn: async (data: any) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              query GetThreadsByUser($userId: String!) {
                get_threads_by_user(userId: $userId) {
                  id
                  visibleForOthersUsers
                  threadName
                  propertyId
                  roomId
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
              userId: data.userId,
              threadName: data.threadName,
              isRead: data.isRead,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllThreadsByBuyerAgentsMutation = useMutation({
    mutationKey: ['get_threads_by_buyer_agents'],
    mutationFn: async (data: any) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              query GetThreadsByBuyerAgents($agentIds:  [String!]!) {
                get_threads_by_buyer_agents(agentIds: $agentIds) {
                  id
                  visibleForOthersUsers
                  threadName
                  propertyId
                  listingId
                  roomId
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
              agentIds: data.agentIds,
              threadName: data.threadName,
              isRead: data.isRead,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllConversationMessagesMutation = useMutation({
    mutationKey: ['conversationsByThread'],
    mutationFn: async (threadId: string) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              query threadId($threadId: String!) {
                conversationsByThread(threadId: $threadId) {
                  id
                  isRead
                  receiverId
                  message
                  senderId
                  createdAt
                }
              }`,
            variables: {
              threadId: threadId,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllEngagedProperties = useMutation({
    mutationKey: ['getAllEngagedProperties'],
    mutationFn: async (userId: string) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              query getUserEngagements($userId: String!) {
                getUserEngagements(userId: $userId) {
                  id
                  propertyId,
                  propertyImage,
                  propertyAddress,
                  propertyName,
                  city
                  userId,
                  listingId
                  propertyProgress,
                  status,
                  tours{
                    id
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
                participants{
                  id
                  userId
                  bra_id
                  is_accepted
                  agent{
                  email
                  id
                  firstName
                  lastName
                  phone
                }
                  }
                }
                  
              }`,
            variables: {
              userId: userId,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => { },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getEngagedPropertyByPropertyId = useMutation({
    mutationKey: ['getAllEngagedPropertyByPropertyId'],
    mutationFn: async (propertyId: string) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              query getUserEngagementsByPropertyId($propertyId: String!) {
                getUserEngagementsByPropertyId(propertyId: $propertyId) {
                  id
                  propertyId,
                  propertyImage,
                  propertyAddress,
                  propertyName,
                  city,
                  listingId,
                  userId,
                  propertyProgress,
                  status,
                  tours{
                    id
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
                  participants{
                    id
                    userId
                    bra_id
                    is_accepted
                    agent{
                      email
                      id
                      firstName
                      lastName
                      phone
                    }
                  }
                }
              }`,
            variables: {
              propertyId: propertyId,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
      const engagement = data?.data?.data?.getUserEngagementsByPropertyId;
      if (engagement) {
        dispatch(setEngagedProperty(engagement));
      }
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const deleteEngagedPropertyById = useMutation({
    mutationKey: ['deleteEngagedPropertyById'],
    mutationFn: async (propertyId: string) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              query deleteEngagement($propertyId: String!) {
                deleteEngagement(propertyId: $propertyId) {
                  id
                }
              }`,
            variables: {
              propertyId: propertyId,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
        }
        if (response.status === 200) {
          success({ message: 'The property has been removed successfull' });
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const searchEngagedProperty = useMutation({
    mutationKey: ['searchUserPropertyEngagements'],
    mutationFn: async (searchData: any) => {
      try {
        const response = await API.post(
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
                  propertyName,
                  city
                  userId,
                  listingId
                  propertyProgress,
                  status,
                  tours{
                    id
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
                  },
                  user {
                  id
                  firstName
                  lastName
                  email
                  phone
                }
                participants{
                  id
                  userId
                  bra_id
                  is_accepted
                  agent{
                  email
                  id
                  firstName
                  lastName
                  phone
                }
                  }
                  }
                }
              `,
            variables: {
              ...searchData,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      // error({ message: errorMessage });
    },
  });

  const getThreadById = useMutation({
    mutationKey: ['thread'],
    mutationFn: async (id: string) => {
      const normalizedId = String(id || '').trim();
      if (!normalizedId) {
        throw new Error('threadId is required');
      }
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
            query GetUserThreadById($id: String!) {
              getUserThreadById(id: $id) {
                id
                  threadName
                  propertyId
                  roomId
                  propertyName
                  listingId
                  propertyAddress
                  messages{
                    threadId
                    isRead
                    message
                  }
                  unreadCount
                  participants{
                    user 
                    { 
                     id
                    firstName
                    lastName
                    email
                    }
                  }
                  user{
                    id
                    firstName
                    lastName
                    email
                  }
                  parentMessage
                  status
                  buyerAgent {
                    id
                    firstName
                    lastName
                    email
                  }
                }
        }`,
            variables: { id: normalizedId },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response.data?.errors?.[0]?.message || 'Failed to fetch thread',
          );
        }

        return response.data.data.getUserThreadById;
      } catch (error) {
        console.error('Error fetching thread:', error);
        throw error;
      }
    },
  });

  const getAgentTiersForThreadMutation = useMutation({
    mutationKey: ['getAgentTiersForThread'],
    mutationFn: async (threadId: string) => {
      const normalizedThreadId = String(threadId || '').trim();
      if (!normalizedThreadId) {
        throw new Error('threadId is required');
      }
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
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
            variables: { threadId: normalizedThreadId },
          },
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response.data?.errors?.[0]?.message || 'Failed to fetch agent tiers',
          );
        }

        return response.data?.data?.getAgentTiersForThread;
      } catch (error) {
        console.error('Error fetching agent tiers:', error);
        throw error;
      }
    },
  });

  const getConversationMessagesMutation = useMutation({
    mutationKey: ['conversationsByThread'],
    mutationFn: async (threadId: string) => {
      try {
        const response = await API.post(
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
              threadId: threadId,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getAllSnapzRequest = useMutation({
    mutationKey: ['get_snapz_request'],
    mutationFn: async (snapData: any) => {
      const response = await API.post(
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
                  favourites {
                    id
                    image
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
        }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ||
          'Failed to fetch Snapz requests',
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
      const response = await API.post(
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
        }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ||
          'Failed to update Snapz participant',
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

  const removeAgentInvitation = useMutation({
    mutationKey: ['remove-agent-invitation'],
    mutationFn: async (data: any) => {
      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
              mutation deleteInvitation(
                $id: String!
                $userId: String!
                $agentId: String!
                $status: String!
              ) {
                deleteInvitation(
                  id: $id
                  userId: $userId
                  agentId: $agentId
                  status: $status
                ) {
                  id
                  message
                  success
                }
              }
            `,
            variables: {
              ...data,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch threads',
          );
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
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      // error({ message: errorMessage });
    },
  });

  return {
    createThreadMutation,
    getAllThreadsMutation,
    getAllThreadsByUserMutation,
    getAllThreadsByBuyerAgentsMutation,
    getAllConversationMessagesMutation,
    getAllEngagedProperties,
    getEngagedPropertyByPropertyId,
    deleteEngagedPropertyById,
    searchEngagedProperty,
    getThreadById,
    getAgentTiersForThreadMutation,
    getConversationMessagesMutation,
    removeAgentInvitation,
    getAllSnapzRequest,
    updateSnapzById,
  };
};
const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/graphql';

export const useGetExternalAgentDetails = (userId?: string) =>
  useQuery({
    queryKey: ['getExternalAgentDetails', userId],
    queryFn: async ({ queryKey }) => {
      const [, uid] = queryKey;

      const response = await API.post(
        GRAPHQL_URI,
        {
          query: `
            query GetExternalAgentDetails($userId: String!) {
              getExternalAgentDetails(userId: $userId) {
                 
                email
               
              }
            }
          `,
          variables: { userId: uid },
        }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch user details',
        );
      }

      return response.data.data.getExternalAgentDetails;
    },
    enabled: !!userId, // Only runs if userId is provided
  });


export const useGetUserThreadByProperty = (propertyId?: string) =>
  useQuery({
    queryKey: ['getUserThreadByPropertyId', propertyId],
    queryFn: async ({ queryKey }) => {
      const [, propId] = queryKey;

      //const dispatch = useAppDispatch();

      try {
        const response = await API.post(
          GRAPHQL_URI,
          {
            query: `
                query GetUserThreadByPropertyId($propertyId: String!) {
                  getUserThreadByPropertyId(propertyId: $propertyId) {
                    id
                    roomId
                    threadName
                    createdAt
                    updatedAt
                  }
                }
              `,
            variables: { propertyId: propId },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch thread');
        }

        console.log()

        const thread = response.data.data.getUserThreadByPropertyId;
        //dispatch(setSelectedThreadInfo(thread));

        return thread;
      } catch (error: any) {
        console.error('Error fetching user thread:', error.message || error);
        throw error;
      }
    },
    enabled: !!propertyId,
  });


interface Answer {
  stepId: string;
  questionId: string;
  response: string;
}

export const useGetAnswersByUser = (userId?: string, propertyId?: string) =>
  useQuery({
    queryKey: ['getAnswersByUser', userId, propertyId],
    queryFn: async ({ queryKey }) => {
      const [, uid, pid] = queryKey;

      try {
        const response = await API.post(
          MORTGAGE_GRAPHQL_URI,
          {
            query: `
                  query GetAnswersByUser($userId: String!, $propertyId: String!) {
                    getAnswersByUser(userId: $userId, propertyId: $propertyId) {
                      stepId
                      questionId
                      response
                    }
                  }
                `,
            variables: {
              userId: uid,
              propertyId: pid,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch answers');
        }

        return response.data.data.getAnswersByUser as Answer[];
      } catch (error: any) {
        console.error('Error fetching answers:', error.message || error);
        throw error;
      }
    },
    enabled: !!userId && !!propertyId,
  });
