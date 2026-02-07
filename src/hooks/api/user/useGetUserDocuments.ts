import { useQuery } from '@tanstack/react-query';
import API from '@/lib/api/axios'; // Import configured Axios instance

export interface UserDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  repoId: string;
}

export interface UserDocumentResponse {
  message: string;
  result: UserDocument[];
}

const getUserDocuments = async (): Promise<UserDocumentResponse> => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

  // API instance already handles Authorization header and token refresh
  const response = await API.post(
    GRAPHQL_URI,
    {
      query: `
        query GetUserDocuments {
          getUserDocuments {
            id
            fileName
            fileType
            fileSize
            fileUrl
            uploadedBy
            uploadedAt
            updatedAt
            repoId
          }
        }
      `,
    }
  );

  if (response.status !== 200 || response.data.errors) {
    throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch user documents');
  }

  return {
    message: 'Documents fetched successfully',
    result: response.data.data.getUserDocuments
  };
};

export const useGetUserDocuments = () => {
  return useQuery<UserDocumentResponse>({
    queryKey: ['getUserDocuments'],
    queryFn: getUserDocuments,
  });
};
