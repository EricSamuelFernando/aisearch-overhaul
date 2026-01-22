import { success } from '@/components/alert/notify';
import { getAuthToken } from '@/lib/storage';
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export const usePropertyServiceAPI = (handleCb?: () => void) => {
    const router = useRouter();
    const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql'
    const MORTGAGE_FILE_UPLOAD = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_URL || "http://localhost:4001"


    const getAgentDetail = useMutation({
        mutationKey: ['getAgentDetails'],
        mutationFn: async (agentId: string) => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken')
            if (!token) {
                throw new Error('No authentication token found')
            }
            try {
                const response = await axios.post(
                    GRAPHQL_URI,
                    {
                        query: `
              query GetUserDetailById($userId: String!) {
               getUserDetailById(userId: $userId) {
                 id
                 email
                firstName
                lastName
                  email
                  phone
                licenseNumber
                  zipCode
                   profile
                   bio
               
                }
               }`,
                        variables: {
                            userId: agentId
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response?.status !== 200) {
                    throw new Error(
                        response?.data?.errors?.[0]?.message || 'Failed to fetch threads'
                    )
                }
                return response
            } catch (error) {
                console.error('Error fetching threads:', error)
                throw error
            }
        },
        onSuccess: (data) => {
            console.log('Fetched threads:', data)
        },
        onError: (error: any) => {
            console.error('Error fetching threads:', error)
            const errorMessage =
                error?.response?.data?.errors?.[0]?.message ||
                error.message ||
                'An error occurred'
            error({ message: errorMessage })
        }
    })

    const getEngagedPropertyDocs = useMutation({
        mutationKey: ['getUploadedDocumentsByPropertyId'],
        mutationFn: async (propertyId: string) => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken')
            if (!token) {
                throw new Error('No authentication token found')
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
                            propertyId: propertyId
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response?.status !== 200) {
                    throw new Error(
                        response?.data?.errors?.[0]?.message || 'Failed to fetch threads'
                    )
                }
                return response
            } catch (error) {
                console.error('Error fetching threads:', error)
                throw error
            }
        },
        onSuccess: (data) => {
            console.log('Fetched threads:', data)
        },
        onError: (error: any) => {
            console.error('Error fetching threads:', error)
            const errorMessage =
                error?.response?.data?.errors?.[0]?.message ||
                error.message ||
                'An error occurred'
            error({ message: errorMessage })
        }
    })

    const uploadNewFile = async (
        file: File,
        userId: string,
        propertyId: string
    ) => {
        try {
            // console.log(file, userId, propertyId ,user?.id );

            // Validate inputs
            if (!file || !userId || !propertyId) {
                throw new Error('File, userId, and propertyId are required.')
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId)
            formData.append('propertyId', propertyId)

            // Make API call to upload file
            const response = await axios.post(`${MORTGAGE_FILE_UPLOAD}/file-upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            // success({ message: "File Uploaded successfully" })
            return response.data.data
        } catch (error: any) {
            console.error('Error uploading file:', error.message)

            // Handle HTTP errors gracefully
            if (error.response) {
                console.error('Server responded with status:', error.response.status)
                console.error('Response data:', error.response.data)
            } else if (error.request) {
                console.error('No response received:', error.request)
            } else {
                console.error('Request setup error:', error.message)
            }
            console.log("Error : ", error);

            // throw new Error('File upload failed. Please try again.')
        }
    }

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
                    }
                );

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(
                        response.data.errors?.[0]?.message || 'Failed to fetch participants'
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
        propertyId: string
        buyerId: string
        agentId: string
        price: number
        downPayment: number
        financeType: string
        cashAmount: number
        contingencies: {
            financeContingency?: { type?: string; days?: number }
            appraisalContingency?: { type?: string; days?: number }
            inspectionContingency?: { type?: string; days?: number }
            closeEscrow?: { type?: string; days?: number }
        }
        specialTerms?: string
        messageToAgent?: string
        documents?: string[]
    }

    const useCreatePropertyOffer = () => {
        return useMutation({
            mutationKey: ['createPropertyOffer'],
            mutationFn: async (input: any) => {
                const token = getAuthToken() || localStorage.getItem('userAccessToken')
                if (!token) {
                    throw new Error('No authentication token found')
                }

                try {
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
                            variables: {
                                input
                            }
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    if (response.status !== 200 || response.data.errors) {
                        throw new Error(
                            response?.data?.errors?.[0]?.message || 'Failed to create offer'
                        )
                    }

                    return response.data.data.createPropertyOffer
                } catch (error) {
                    console.error('Error creating offer:', error)
                    throw error
                }
            }

        })
    }
    const createPropertyCounterOffer = useMutation({
        mutationKey: ['createPropertyCounterOffer'],
        mutationFn: async (input: any) => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken')
            if (!token) {
                throw new Error('No authentication token found')
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
                            input
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(
                        response?.data?.errors?.[0]?.message || 'Failed to create offer'
                    )
                }

                return response.data.data.createPropertyOffer
            } catch (error) {
                console.error('Error creating offer:', error)
                throw error
            }
        },
        onSuccess: (data) => {
            if (data?.id) {
                success({ message: "Offer created succeffully." })
                router.push("/dashboard/buyer")
            }
            // Optionally: toast.success('Offer created successfully')
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.errors?.[0]?.message ||
                error.message ||
                'An error occurred'
            console.error('Offer creation failed:', errorMessage)
            // Optionally: toast.error(errorMessage)
        }
    })

    const useAcceptPropertyOffer = useMutation({
        mutationKey: ['acceptPropertyOffer'],
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
                    mutation AcceptPropertyOffer($input: UpdateOfferStatusDto!) {
                      updatePropertyOfferStatus(input: $input) {
                        id
                        status
                      }
                    }
                  `,
                        variables: {
                            input
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(response?.data?.errors?.[0]?.message || 'Failed to accept offer');
                }

                return response.data.data.updatePropertyOfferStatus;
            } catch (error) {
                console.error('Error accepting offer:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log(data)
            if (data?.id) {
                success({ message: 'Offer status updated successfully.' });
                router.back(); // Redirect after successful acceptance
            }
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.errors?.[0]?.message ||
                error.message ||
                'An error occurred';
            console.error('Offer acceptance failed:', errorMessage);
        }
    });


    const getOffersPropertyByEngagementId = useMutation({
        mutationKey: ['getPropertyOfferByEngagementId'],
        mutationFn: async (id: string) => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken')
            if (!token) {
                throw new Error('No authentication token found')
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
                      isBuyer
                      cashAmount
                      createdAt
                      updatedAt
                      documentsIds
                      propertyEngagement{
                      propertyAddress
                      
                      user{
                        id
                        email
                        phone
                        profile
                      }
               
                     }
                      createdBy{
                        id
                        email
                        firstName
                        lastName
                        phone
                        profile
                      }
                    }
                  }`,
                        variables: {
                            id: id
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                if (response.status !== 200) {
                    throw new Error(
                        response?.data?.errors?.[0]?.message || 'Failed to fetch threads'
                    )
                }
                return response
            } catch (error) {
                console.error('Error fetching threads:', error)
                throw error
            }
        },
        onSuccess: (data) => {
            console.log('Fetched threads:', data)
        },
        onError: (error: any) => {
            console.error('Error fetching threads:', error)
            const errorMessage =
                error?.response?.data?.errors?.[0]?.message ||
                error.message ||
                'An error occurred'
            error({ message: errorMessage })
        }
    })

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
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (status !== 200 || data.errors) {
                    throw new Error(data?.errors?.[0]?.message || 'Failed to update participants');
                }

                return data.data.updateParticipantsBRA;
            } catch (error: any) {
                console.error('Error updating participants:', error);
                throw new Error(error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred');
            }
        },
        onSuccess: (data) => {
            console.log('✅ Successfully updated participants:', data);
        },
        onError: (error: any) => {
            console.error('❌ Mutation error:', error);
        }
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
                    }
                );

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(
                        response.data.errors?.[0]?.message || 'Failed to fetch participants'
                    );
                }
                console.log("Response data ", response);

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
                    }
                );

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(
                        response.data.errors?.[0]?.message || 'Failed to fetch participants'
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
        mutationFn: async ({ id, finalizeType }: { id: string; finalizeType: 'isBuyer' | 'isSeller' }) => {
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
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(response?.data?.errors?.[0]?.message || 'Failed to finalize offer');
                }

                return response.data.data.finalizeOffer; // boolean value
            } catch (error) {
                console.error('Error finalizing offer:', error);
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
                            input
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status !== 200 || response.data.errors) {
                    throw new Error(response?.data?.errors?.[0]?.message || 'Failed to accept offer');
                }

                return response.data.data.updatePropertyOfferStatus;
            } catch (error) {
                console.error('Error accepting offer:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log(data)
            if (data?.id) {
                success({ message: 'Offer status updated successfully.' });
                // router.push('/dashboard/buy'); // Redirect after successful acceptance
            }
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.errors?.[0]?.message ||
                error.message ||
                'An error occurred';
            console.error('Offer acceptance failed:', errorMessage);
        }
    });

    return {
        getAgentDetail,
        getEngagedPropertyByAgentId,
        getEngagedPropertyDocs,
        uploadNewFile,
        useCreatePropertyOffer,
        useAcceptPropertyOffer,
        useUpdatePropertyOffer,
        getOffersPropertyByEngagementId,
        updateParticipantsBRA,
        getAgentInvitations,
        updateAgentInvitations,
        createPropertyCounterOffer,
        finalizeOffer
    }
}


export const useGetPropertyOffersByProperty = (
    propertyId: string,
    listingId: string
) =>
    useQuery({
        queryKey: ['getPropertyOfferByProperty', propertyId, listingId],
        queryFn: async () => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken');
            const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

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
                }
            );

            if (response.status !== 200 || response.data.errors) {
                throw new Error(
                    response.data?.errors?.[0]?.message || 'Failed to fetch property offers'
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
            const token =
                getAuthToken() || localStorage.getItem('userAccessToken');
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
                          id,
                          firstName,
                          lastName,
                          email,
                          phone,
                          profile
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



export const useGetPropertyOfferById = (id: string) =>
    useQuery({
        queryKey: ['getPropertyOfferById', id],
        enabled: !!id, // don’t run until an id is supplied
        queryFn: async () => {
            // 1. Auth token
            const token =
                getAuthToken() || localStorage.getItem('userAccessToken');
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
                }
            );

            // 4. Error handling
            if (response.status !== 200 || response.data.errors) {
                throw new Error(
                    response.data?.errors?.[0]?.message ??
                    'Failed to fetch property offer'
                );
            }

            // 5. Return result
            return response.data.data.getPropertyOfferById;
        },
    });

export const useGetUserEngagementsAgents = () =>
    useQuery({
        queryKey: ['getUserEngagementsAgents'],
        enabled: !!getAuthToken(),
        queryFn: async () => {

            const token = getAuthToken() || localStorage.getItem('userAccessToken');
            if (!token) throw new Error('No authentication token found');

            const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ??
                'http://localhost:4000/graphql';

            const response = await axios.post(
                GRAPHQL_URI,
                {
                    query: `
                  query getUserEngagementsAgents {
                    getUserEngagementsAgents {
                      id
                      firstName
                      lastName
                    
                
                    }
                  }
                `
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
                    response.data?.errors?.[0]?.message ?? 'Failed to fetch agents'
                );
            }

            return response.data.data.getUserEngagementsAgents;
        }
    });



export const useGetAllUserPropertyOffers = (propertyId: string) => {
    return useQuery({
        queryKey: ['getAllUserPropertyOffers', propertyId],
        enabled: !!propertyId,
        queryFn: async () => {

            const token = getAuthToken() || localStorage.getItem('userAccessToken');
            if (!token) throw new Error('No authentication token found');

            const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

            const response = await axios.post(
                GRAPHQL_URI,
                {
                    query: `
                                query getAllUserPropertyOffers($propertyId: String!)  {
                                    getAllUserPropertyOffers(propertyId:$propertyId) {
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

            // 4. Error handling
            if (response.status !== 200 || response.data.errors) {
                throw new Error(
                    response.data?.errors?.[0]?.message ??
                    'Failed to fetch user property offers'
                );
            }

            // 5. Return result
            return response.data.data.getAllUserPropertyOffers;
        },
    });
};