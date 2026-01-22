import { error, success } from "@/components/alert/notify";
import { getAuthToken } from "@/lib/storage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useMortgageServiceAPI = (handleCb?: () => void) => {
    const GRAPHQL_URI = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL || "http://localhost:4001/graphql"
    const MORTGAGE_FILE_UPLOAD = `${process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_URL}/file-upload`
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

    const uploadNewFile = async (file: File, userId: string, propertyId: string) => {
        try {
            // console.log(file, userId, propertyId ,user?.id );

            // Validate inputs
            if (!file || !userId || !propertyId) {
                throw new Error("File, userId, and propertyId are required.");
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
            formData.append('propertyId', propertyId);

            // Make API call to upload file
            const response = await axios.post(MORTGAGE_FILE_UPLOAD, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            success({ message: "Success! Your file is now uploaded" })
            console.log("File uploaded successfully:", response.data);
            return response.data.data;
        } catch (error: any) {
            console.error("Error uploading file:", error.message);

            // Handle HTTP errors gracefully
            if (error.response) {
                console.error("Server responded with status:", error.response.status);
                console.error("Response data:", error.response.data);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Request setup error:", error.message);
            }

            throw new Error("File upload failed. Please try again.");
        }
    };

    const editDocument = useMutation({
        mutationKey: ['editDocuments'],
        mutationFn: async (updateUploadedDocumentInput: any) => {
            const token = getAuthToken() || localStorage.getItem('userAccessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            try {
                const response = await axios.post(
                    GRAPHQL_URI,
                    {
                        query: `
              mutation updateUploadedDocument($updateUploadedDocumentInput: UpdateUploadedDocumentInput!) {
                updateUploadedDocument(updateUploadedDocumentInput: $updateUploadedDocumentInput) {
                  id
                }
              }`,
                        variables: {
                            updateUploadedDocumentInput: updateUploadedDocumentInput
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

    return {
        getEngagedPropertyDocs,
        uploadNewFile,
        editDocument,
    }

}