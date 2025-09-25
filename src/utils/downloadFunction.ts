import { getAuthToken } from "@/lib/storage";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const downloadDocument = async (url: string, filename = 'document.pdf') => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl); // cleanup
};

const queryClient = useQueryClient();

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

export const fetchPresignedUrl = async (fileName: string): Promise<string | null> => {
  try {
    const result = await queryClient.fetchQuery({
      queryKey: ['viewUploadedFile', fileName],
      queryFn: async () => {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `query ViewUplaodedFile($fileName: String!) {
              viewUplaodedFile(fileName: $fileName)
            }`,
            variables: { fileName },
          },
          { headers:{
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          
          } }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch file URL');
        }

        return response.data.data.viewUplaodedFile;
      },
    });

    return result;
  } catch (error) {
    console.error('Failed to get presigned URL', error);
    return null;
  }
};
