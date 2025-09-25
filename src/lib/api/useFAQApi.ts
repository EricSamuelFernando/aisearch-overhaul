import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { success, error } from '../../components/alert/notify';
import { getAuthToken } from '../../lib/storage';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/graphql';

export const useFAQApi = (handleCb?: () => void) => {
  const token = getAuthToken() || localStorage.getItem('userAccessToken');

  const createFaqMutation = useMutation({
    mutationKey: ['createFaq'],
    mutationFn: async (createFaqInput: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation CreateFaq($createFaqInput: CreateFaqInput!) {
              createFaq(createFaqInput: $createFaqInput) {
                id
                question
                answer
                agentType
                engagement {
                  id
                }
              }
            }
          `,
          variables: { createFaqInput },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to create FAQ',
        );
      }

      return response.data.data.createFaq;
    },
    onSuccess: () => {
      success({ message: 'FAQ created successfully!' });
      if (handleCb) handleCb();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  const createMultipleFaqsMutation = useMutation({
    mutationKey: ['createMultipleFaqs'],
    mutationFn: async (createMultipleFaqInput: { faqs: any[] }) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation CreateMultipleFaqs($createMultipleFaqInput: CreateMultipleFaqInput!) {
              createMultipleFaqs(createMultipleFaqInput: $createMultipleFaqInput) {
                id
                question
                answer
                agentType
             
              }
            }
          `,
          variables: { createMultipleFaqInput },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ||
            'Failed to create multiple FAQs',
        );
      }

      return response.data.data.createMultipleFaqs;
    },
    onSuccess: () => {
      success({ message: 'FAQs submitted successfully!' });
      if (handleCb) handleCb();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  const getAllFaqsMutation = useMutation({
    mutationKey: ['getAllFaqs'],
    mutationFn: async () => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetAllFaqs {
              getAllFaqs {
                id
                question
                answer
                agentType
                engagement {
                  id
                }
              }
            }
          `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch FAQs',
        );
      }

      return response.data.data.getAllFaqs;
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  const getFaqByIdMutation = useMutation({
    mutationKey: ['getFaqById'],
    mutationFn: async (id: string) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetFaqById($id: String!) {
              getFaqById(id: $id) {
                id
                question
                answer
                agentType
              }
            }
          `,
          variables: { id },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch FAQ',
        );
      }

      return response.data.data.getFaqById;
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  const updateFaqMutation = useMutation({
    mutationKey: ['updateFaq'],
    mutationFn: async (updateFaqInput: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation UpdateFaq($updateFaqInput: UpdateFaqInput!) {
              updateFaq(updateFaqInput: $updateFaqInput) {
                id
                question
                answer
              }
            }
          `,
          variables: { updateFaqInput },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to update FAQ',
        );
      }

      return response.data.data.updateFaq;
    },
    onSuccess: () => {
      success({ message: 'FAQ updated successfully!' });
      if (handleCb) handleCb();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  const removeFaqMutation = useMutation({
    mutationKey: ['removeFaq'],
    mutationFn: async (id: string) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation RemoveFaq($id: String!) {
              removeFaq(id: $id) {
                id
              }
            }
          `,
          variables: { id },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to delete FAQ',
        );
      }

      return response.data.data.removeFaq;
    },
    onSuccess: () => {
      success({ message: 'FAQ deleted successfully!' });
      if (handleCb) handleCb();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  const getAllFaqsByUserMutation = useMutation({
    mutationKey: ['getAllFaqsByUser'],
    mutationFn: async (data: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
          query getAllFaqs($userId: String!,$agentType: String!) {
            getAllFaqs(userId: $userId,agentType: $agentType) {
              id
              question
              answer
              user{
                id,
                firstName
                lastName
                email
                phone
              }
            }
          }
        `,
          variables: { userId: data?.userId, agentType: data?.agentType },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Make sure token is in scope
          },
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch FAQs',
        );
      }

      return response.data.data.getAllFaqs;
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err.message;
      error({ message: errorMessage });
    },
  });

  return {
    createFaqMutation,
    getAllFaqsMutation,
    getFaqByIdMutation,
    updateFaqMutation,
    removeFaqMutation,
    createMultipleFaqsMutation,
    getAllFaqsByUserMutation,
  };
};

export const useIsFaqFilled = (
  engagementId: string,
  agentType: string,
  userId: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['isFaqFilled', engagementId, userId, agentType],
    queryFn: async () => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          query IsFaqFilled($engagementId: String!, $userId: String!, $agentType: faqUserType!) {
            isFaqAlreadyFilled(engagementId: $engagementId, userId: $userId, agentType: $agentType)
          }
        `,
        variables: { engagementId, userId, agentType },
      });

      return response.data.data.isFaqAlreadyFilled;
    },
    enabled,
  });
};
