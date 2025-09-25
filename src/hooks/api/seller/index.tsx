import { error, success } from "@/components/alert/notify";
import { getAuthToken } from "@/lib/storage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
export const SellerAPIs = (handleCb?: () => void) => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";
  const claimPropertyAPI = useMutation({
    mutationKey: ['claim_property'],
    mutationFn: async (propertyData: any) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
                mutation createSellerProperty($input: CreateSellerPropertyInput!) {
                  createSellerProperty(input: $input) {
                    id
                  }
                }
              `,
          variables: {
            input: propertyData,
          },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to create waitlist'
          );
        }

        return response.data.data
      } catch (error) {
        console.error('Error creating waitlist:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('Error creating waitlist:', error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      error({ message: errorMessage });
    },
  });

  const getClaimedPropertyAPI = useMutation({
    mutationKey: ['sellerProperties'],
    mutationFn: async (userId: string) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            query sellerProperties($userId: String!) {
              sellerProperties(userId: $userId) {
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
                status
              }
            }
          `,
          variables: { userId },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch seller properties'
          );
        }

        return response.data.data.sellerProperties;
      } catch (error) {
        console.error('Error fetching seller properties:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('Error:', errorMessage);
      error({ message: errorMessage }); // Assuming this is a toast/notification function
    },
  });

  const getClaimedPropertyByIdAPI = useMutation({
    mutationKey: ['sellerProperty'],
    mutationFn: async (id: string) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            query sellerProperty($id: String!) {
              sellerProperty(id: $id) {
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
                status
              }
            }
          `,
          variables: { id },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch seller properties'
          );
        }

        return response.data.data.sellerProperty;
      } catch (error) {
        console.error('Error fetching seller properties:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('Error:', errorMessage);
      error({ message: errorMessage });
    },
  });

  const getSellPropertyDocuments = useMutation({
    mutationKey: ['get_documents'],
    mutationFn: async ({ listingId, propertyId }: { listingId: string; propertyId: string }) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            query getSellerDocuments($propertyId: String!, $listingId: String!) {
              getSellerDocuments(propertyId: $propertyId, listingId: $listingId) {
                id
                name
                type
                url
                user {
                  id
                  email
                  firstName
                  lastName
                  phone
                }
                listingId
                propertyId
              }
            }
          `,
          variables: { propertyId, listingId },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch seller documents'
          );
        }

        return response.data.data.getSellerDocuments;
      } catch (error: any) {
        console.error('Error fetching seller documents:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // Optional: replace `error` below with your toast/notification function
      // e.g., toast.error(errorMessage)
    },
  });

  const uploadSellerDocument = useMutation({
    mutationKey: ['upload_documents'],
    mutationFn: async (inputData:any) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            mutation createSellerDocument($input: CreateSellerDocumentInput!) {
              createSellerDocument(input: $input) {
                id
                name
                propertyId
                listingId
              }
            }
          `,
          variables: {
            input: {
              ...inputData
            }
          },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to upload seller document'
          );
        }

        return response.data.data.createSellerDocument;
      } catch (error: any) {
        console.error('Error uploading seller document:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // You can optionally show a toast here
    },
  });

  const updateSellerDocument = useMutation({
    mutationKey: ['update_documents'],
    mutationFn: async ({
      id,
      name,
      fileKey,
      propertyId,
      listingId,
    }: {
      id: string;
      name?: string;
      fileKey?: string;
      propertyId: string;
      listingId: string;
    }) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            mutation updateSellerDocument($input: UpdateSellerDocumentInput!) {
              updateSellerDocument(input: $input) {
                id
                name
                propertyId
                listingId
                fileKey
              }
            }
          `,
          variables: {
            input: { id, name, fileKey, propertyId, listingId },
          },
        });
  
        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to update seller document'
          );
        }
  
        return response.data.data.updateSellerDocument;
      } catch (error: any) {
        console.error('Error updating seller document:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // Optional: Add a toast here
    },
  });

  const deleteSellerDocument = useMutation({
    mutationKey: ['delete_documents'],
    mutationFn: async (id: string) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            mutation deleteSellerDocument($id: String!) {
              deleteSellerDocument(id: $id)
            }
          `,
          variables: {
            id,
          },
        });
  
        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to delete seller document'
          );
        }
  
        return response.data.data.deleteSellerDocument;
      } catch (error: any) {
        console.error('Error deleting seller document:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // Optional: Add toast/notification here
    },
  });

  const getClaimedPropertyOffersAPI = useMutation({
    mutationKey: ['getPropertyOfferByProperty'],
    mutationFn: async ({propertyId,listingId}:{
      propertyId:string,
      listingId:string
    }) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            query getPropertyOfferByProperty($propertyId: String!, $listingId: String!) {
              getPropertyOfferByProperty(propertyId: $propertyId, listingId: $listingId) {
                id
                propertyId
                listingId
                price
                financeType
                downPayment
                inspectionContingencyPrice
                appraisalContingencyPrice
                createdBy {
                  id,
                  firstName,
                  lastName,
                  email,
                  phone
                }
              }
            }
          `,
          variables: { propertyId, listingId },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch property offers'
          );
        }

        return response.data.data.getPropertyOfferByProperty;
      } catch (error) {
        console.error('Error fetching seller properties:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('Error:', errorMessage);
      error({ message: errorMessage }); // Assuming this is a toast/notification function
    },
  });

  return {
    claimPropertyAPI,
    getClaimedPropertyAPI,
    getClaimedPropertyByIdAPI,
    getSellPropertyDocuments,
    uploadSellerDocument,
    updateSellerDocument,
    deleteSellerDocument,
    getClaimedPropertyOffersAPI,

  }

}