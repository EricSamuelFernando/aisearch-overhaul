import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { success } from '../../components/alert/notify';
import { getAuthToken } from '../storage';
import { useRouter } from 'next/navigation';

export const usePropertyServiceAPI = (handleCb?: () => void) => {
  const router = useRouter();
  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/graphql';
  const MORTGAGE_FILE_UPLOAD =
    process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_URL || 'http://localhost:4001';

  const getEngagedPropertyDocs = useMutation({
    mutationKey: ['getUploadedDocumentsByPropertyId'],
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
              query getUploadedDocumentsByPropertyId($propertyId: String!) {
                getUploadedDocumentsByPropertyId(propertyId: $propertyId) {
                  id
                  userId,
                  propertyId,
                  documentName,
                  mimeType,
                  uploadedAt,
                  viewUrl,
                }
              }`,
            variables: {
              propertyId: propertyId,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response?.status !== 200) {
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
      error({ message: errorMessage });
    },
  });

  const uploadNewFile = async (
    file: File,
    userId: string,
    propertyId: string,
  ) => {
    try {
      console.log(file, userId, propertyId);

      // Validate inputs
      if (!file || !userId || !propertyId) {
        throw new Error('File, userId, and propertyId are required.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('propertyId', propertyId);

      // Make API call to upload file
      const response = await axios.post(
        `${MORTGAGE_FILE_UPLOAD}/file-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      // success({ message: "File Uploaded successfully" })
      return response.data.data;
    } catch (error: any) {
      console.error('Error uploading file:', error.message);

      // Handle HTTP errors gracefully
      if (error.response) {
        console.error('Server responded with status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      console.log('Error : ', error);

      // throw new Error('File upload failed. Please try again.')
    }
  };

  const getEngagedPropertyByAgentId = useMutation({
    mutationKey: ['getParticipantsByAgent'],
    mutationFn: async (agentId: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query getParticipantsByAgent($agentId: String!) {
                getParticipantsByAgent(agentId: $agentId) {
                  id
                  agentId
                  agentType
                  engagementId
                  is_accepted
                  userId
                  bra_id
                  user{
                    id,
                    firstName,
                    lastName,
                    email,
                    phone
                  }
                  engagement{
                    id,
                    userId,
                    propertyId,
                    listingId,
                    price,
                    city,
                    zipCode,
                    propertyImage,
                    propertyName,
                    propertyAddress,
                    propertyProgress,
                    status,
                    createdAt,
                    updatedAt
                  }
                }
              }
            `,
            variables: {
              agentId,
            },
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
            response.data.errors?.[0]?.message ||
            'Failed to fetch participants',
          );
        }

        return response.data.data.getParticipantsByAgent;
      } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched participants:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching participants:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An unexpected error occurred';
      error({ message: errorMessage });
    },
  });

  type CreatePropertyOfferDto = {
    propertyId: string;
    buyerId: string;
    agentId: string;
    price: number;
    downPayment: number;
    financeType: string;
    cashAmount: number;
    contingencies: {
      financeContingency?: { type?: string; days?: number };
      appraisalContingency?: { type?: string; days?: number };
      inspectionContingency?: { type?: string; days?: number };
      closeEscrow?: { type?: string; days?: number };
    };
    specialTerms?: string;
    messageToAgent?: string;
    documents?: string[];
  };

  const useCreatePropertyOffer = () => {
    return useMutation({
      mutationKey: ['createPropertyOffer'],
      mutationFn: async ({ input, id }: { input: any; id: string }) => {
        const token = getAuthToken() || localStorage.getItem('userAccessToken');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
            mutation CreatePropertyOffer($input: CreatePropertyOfferDto!) {
              createPropertyOffer(input: $input) {
                id
              }
            }
          `,
            variables: { input },
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
            response?.data?.errors?.[0]?.message || 'Failed to create offer',
          );
        }

        return {
          id: response.data.data.createPropertyOffer.id,
          engagementId: id,
        };
      },
    });
  };

  const createPropertyCounterOffer = useMutation({
    mutationKey: ['createPropertyCounterOffer'],
    mutationFn: async (input: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
           mutation CreatePropertyCounterOffer($input: CreatePropertyCounterOfferInput!) {
           createPropertyCounterOffer(input: $input) {
            id
            }
            }
          `,
            variables: {
              input,
            },
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
            response?.data?.errors?.[0]?.message || 'Failed to create offer',
          );
        }
        success({ message: 'Counter Offer Created Successfully' });

        return response.data.data.createPropertyOffer;
      } catch (error) {
        console.error('Error creating offer:', error);
        success({ message: (error as Error)?.message || 'An error occurred' });
        throw error;
      }
    },
  });

  const useUpdatePropertyOffer = useMutation({
    mutationKey: ['acceptPropertyOffer'],
    mutationFn: async (input: { offerId: string; status: string }) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
                mutation AcceptPropertyOffer($input: UpdateOfferStatusDto!) {
                  updatePropertyOfferStatus(input: $input) {
                    id
                    status
                  }
                }
              `,
            variables: {
              input,
            },
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
            response?.data?.errors?.[0]?.message || 'Failed to accept offer',
          );
        }

        return response.data.data.updatePropertyOfferStatus;
      } catch (error) {
        console.error('Error accepting offer:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log(data);
      if (data?.id) {
        success({ message: 'Offer status updated successfully.' });
        router.push('/dashboard/buy'); // Redirect after successful acceptance
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      console.error('Offer acceptance failed:', errorMessage);
    },
  });

  const useUpdatePropertyCounterOffer = useMutation({
    mutationKey: ['acceptPropertyCounterOffer'],
    mutationFn: async (input: { offerId: string; status: string }) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
                mutation AcceptPropertyCounterOffer($input: UpdateCounterOfferStatusDto!) {
                  updatePropertyCounterOffer(input: $input) {
                    id
                    status
                  }
                }
              `,
            variables: {
              input,
            },
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
            response?.data?.errors?.[0]?.message || 'Failed to accept offer',
          );
        }
        success({ message: 'Offer Status Updated Successfully' });
        return response.data.data.updatePropertyCounterOfferStatus;
      } catch (error) {
        console.error('Error accepting offer:', error);
        throw error;
      }
    },
  });

  const getOffersPropertyByEngagementId = useMutation({
    mutationKey: ['getPropertyOfferByEngagementId'],
    mutationFn: async (id: string) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      try {
        const response = await axios.post(
          GRAPHQL_URI,

          {
            query: `
                  query getPropertyOfferByEngagementId($id: String!) {
                    getPropertyOfferByEngagementId(id: $id) {
                      id
                      price,
                      financeType
                      downPayment
                      coverLetter
                      specialTerms
                      expiryDate
                      status
                      financeContingencyDays
                      appraisalContingencyDays
                      inspectionContingencyDays
                      closeEscrowDays
                      cashAmount
                      isBuyer
                      isSeller
                      createdAt
                      updatedAt
                      documentsIds
                      propertyEngagement{
                      propertyAddress
                     
                      user{
                        id
                        email
                        phone
                      }
               
                     }
                      createdBy{
                        id
                        email
                        firstName
                        lastName
                        phone
                      }
                    }
                  }`,
            variables: {
              id: id,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
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
      error({ message: errorMessage });
    },
  });

  const updateParticipantsBRA = useMutation({
    mutationKey: ['updateParticipantsBRA'],
    mutationFn: async ({ id, bra_id }: { id: string; bra_id: string }) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const query = `
        mutation UpdateParticipantsBRA($id: String!, $bra_id: String!) {
          updateParticipantsBRA(id: $id, braId: $bra_id) {
            id
            bra_id
          }
        }
      `;

      try {
        const { data, status } = await axios.post(
          GRAPHQL_URI,
          { query, variables: { id, bra_id } },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (status !== 200 || data.errors) {
          throw new Error(
            data?.errors?.[0]?.message || 'Failed to update participants',
          );
        }

        return data.data.updateParticipantsBRA;
      } catch (error: any) {
        console.error('Error updating participants:', error);
        throw new Error(
          error?.response?.data?.errors?.[0]?.message ||
          error.message ||
          'An error occurred',
        );
      }
    },
    onSuccess: (data) => {
      console.log('✅ Successfully updated participants:', data);
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
    },
  });

  const getAgentInvitations = useMutation({
    mutationKey: ['getInvitationRequests'],
    mutationFn: async (invitationData: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query getInvitationRequests($invitationData: GetInvitationDTO!) {
                getInvitationRequests(invitationData: $invitationData) {
                  id
                  agentId
                  agentType
                  engagementId
                  is_accepted
                  userId
                  bra_id
                  user{
                    id,
                    firstName,
                    lastName,
                    email,
                    phone
                  }
                  engagement{
                    id,
                    userId,
                    propertyId,
                    listingId,
                    price,
                    city,
                    zipCode,
                    propertyImage,
                    propertyName,
                    propertyAddress,
                    propertyProgress,
                    status,
                    createdAt,
                    updatedAt
                  }
                }
              }
            `,
            variables: {
              invitationData,
            },
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
            response.data.errors?.[0]?.message ||
            'Failed to fetch participants',
          );
        }
        console.log('Response data ', response);

        return response.data.data.getInvitationRequests;
      } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched participants:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching participants:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An unexpected error occurred';
      error({ message: errorMessage });
    },
  });

  const updateAgentInvitations = useMutation({
    mutationKey: ['updateInvitationRequests'],
    mutationFn: async (updateInvitationData: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation updateInvitationRequests($updateInvitationData: UpdateInvitationDTO!) {
                updateInvitationRequests(updateInvitationData: $updateInvitationData) {
                  id
                  is_accepted
                }
              }
            `,
            variables: {
              updateInvitationData,
            },
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
            response.data.errors?.[0]?.message ||
            'Failed to fetch participants',
          );
        }
        return response.data.data.updateInvitationRequests;
      } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched participants:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching participants:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An unexpected error occurred';
      error({ message: errorMessage });
    },
  });

  const finalizeOffer = useMutation({
    mutationKey: ['Finalize-offer'],
    mutationFn: async ({
      id,
      finalizeType,
    }: {
      id: string;
      finalizeType: 'isBuyer' | 'isSeller';
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
              mutation finalizeOffer($id: String!, $finalizeType: String!) {
                finalizeOffer(id: $id, finalizeType: $finalizeType)
              }
            `,
            variables: {
              id: id,
              finalizeType,
            },
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
            response?.data?.errors?.[0]?.message || 'Failed to finalize offer',
          );
        }

        return response.data.data.finalizeOffer; // boolean value
      } catch (error) {
        console.error('Error finalizing offer:', error);
        throw error;
      }
    },
    onSuccess: (isSuccess: boolean) => {
      if (isSuccess) {
        success({ message: 'Offer status updated successfully.' });
        router.push('/dashboard/buy');
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        'An error occurred';
      console.error('Offer finalization failed:', errorMessage);
    },
  });

  return {
    getEngagedPropertyByAgentId,
    getEngagedPropertyDocs,
    uploadNewFile,
    useCreatePropertyOffer,
    createPropertyCounterOffer,
    useUpdatePropertyOffer,
    useUpdatePropertyCounterOffer,
    getOffersPropertyByEngagementId,
    updateParticipantsBRA,
    getAgentInvitations,
    updateAgentInvitations,
    finalizeOffer,
  };
};

export const useGetPropertyOffersByProperty = (
  propertyId: string,
  listingId: string,
) =>
  useQuery({
    queryKey: ['getPropertyOfferByProperty', propertyId, listingId],
    queryFn: async () => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      const GRAPHQL_URI =
        process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
        'http://localhost:4000/graphql';

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query getPropertyOfferByProperty($propertyId: String!, $listingId: String!) {
              getPropertyOfferByProperty(propertyId: $propertyId, listingId: $listingId) {
                id
                      price,
                      financeType
                      downPayment
                      coverLetter
                      specialTerms
                      expiryDate
                      status
                      financeContingencyDays
                      appraisalContingencyDays
                      inspectionContingencyDays
                      closeEscrowDays
                      cashAmount
                      createdAt
                      updatedAt
                      documentsIds
                 createdBy{
                    profile
                    id
                    firstName
                    lastName
                    email
                    phone
                  }
                  
                }
              }
          `,
          variables: { propertyId, listingId },
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
          'Failed to fetch property offers',
        );
      }

      return response.data.data.getPropertyOfferByProperty;
    },
    enabled: !!propertyId && !!listingId,
  });

export const useFetchPropertyCounterOffers = (
  propertyId: string | undefined,
  listingId: string | undefined,
) =>
  useQuery({
    /* ⚡️  The IDs are part of the cache key */
    queryKey: ['propertyCounterOffers', propertyId, listingId],

    /* 🔒  Only run when both IDs are present */
    enabled: !!propertyId && !!listingId,

    queryFn: async () => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      const GRAPHQL_URI =
        process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ??
        'http://localhost:4000/graphql';

      if (!token) throw new Error('No authentication token found');

      const { data, status } = await axios.post(
        GRAPHQL_URI,
        {
          query: `
                query PropertyCounterOffers($propertyId: String!, $listingId: String!) {
                  propertyCounterOffers(propertyId: $propertyId, listingId: $listingId) {
                    id
                    price
                    financeType
                    downPayment
                    specialTerms
                    expiryDate
                    offer{
                     id
                    price
                    financeType
                    downPayment
                    specialTerms
                    expiryDate
                    status
                    financeContingencyDays
                    appraisalContingencyDays
                    inspectionContingencyDays
                    closeEscrowDays
                    cashAmount
                    createdAt
                    updatedAt
                    documentsIds
                    createdBy{
                     profile
                     id
                     firstName
                     lastName
                     email
                     phone
                }
                    }
                    status
                    financeContingencyDays
                    appraisalContingencyDays
                    inspectionContingencyDays
                    closeEscrowDays
                    cashAmount
                    createdAt
                    updatedAt
                    documentsIds
                     createdBy{
                  profile
                  id
                  firstName
                  lastName
                  email
                  phone
                }
                 
                  }
                }
              `,
          /* 🆕  Pass the variables! */
          variables: { propertyId, listingId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (status !== 200 || data.errors) {
        throw new Error(
          data?.errors?.[0]?.message ??
          'Failed to fetch property counter-offers',
        );
      }

      return data.data.propertyCounterOffers;
    },
  });

export const useGetPropertyOfferById = (id: any) =>
  useQuery({
    queryKey: ['getPropertyOfferById', id],
    enabled: !!id, // don’t run until an id is supplied
    queryFn: async () => {
      // 1. Auth token
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) throw new Error('No authentication token found');

      // 2. GraphQL endpoint
      const GRAPHQL_URI =
        process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ??
        'http://localhost:4000/graphql';

      // 3. Perform request
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
                      query getPropertyOfferById($id: String!) {
                        getPropertyOfferById(id: $id) {
                          id
                          price
                          financeType
                          downPayment
                          coverLetter
                          specialTerms
                          expiryDate
                          status
                          financeContingencyDays
                          appraisalContingencyDays
                          inspectionContingencyDays
                          closeEscrowDays
                          cashAmount
                          createdAt
                          updatedAt
                          documentsIds
                          createdBy {
                            profile
                            id
                            firstName
                            lastName
                            email
                            phone
                          }
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

      // 4. Error handling
      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ??
          'Failed to fetch property offer',
        );
      }

      // 5. Return result
      return response.data.data.getPropertyOfferById;
    },
  });

export const useGetPropertyCounterOfferById = (id: any) =>
  useQuery({
    queryKey: ['getPropertyCounterOfferById', id],
    enabled: !!id, // don’t run until an id is supplied
    queryFn: async () => {
      // 1. Auth token
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) throw new Error('No authentication token found');

      // 2. GraphQL endpoint
      const GRAPHQL_URI =
        process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ??
        'http://localhost:4000/graphql';

      // 3. Perform request
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
                        query getPropertyCoutnerOfferById($id: String!) {
                          getPropertyCounterOfferById(id: $id) {
                            id
                            price
                            financeType
                            downPayment
                         
                            specialTerms
                            expiryDate
                            status
                            financeContingencyDays
                            appraisalContingencyDays
                            inspectionContingencyDays
                            closeEscrowDays
                            cashAmount
                            createdAt
                            updatedAt
                            documentsIds
                            createdBy {
                              profile
                              id
                              firstName
                              lastName
                              email
                              phone
                            }
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

      // 4. Error handling
      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ??
          'Failed to fetch property offer',
        );
      }

      // 5. Return result
      return response.data.data.getPropertyCounterOfferById;
    },
  });
