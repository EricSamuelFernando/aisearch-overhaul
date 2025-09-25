import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthToken } from '../storage';
import { success, error } from '../../components/alert/notify';
import { useAtom } from 'jotai';
import { agentReadWriteAtom } from '../../store/atoms/agent-atom';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/graphql';
const getToken = () =>
  getAuthToken() ||
  (typeof window !== 'undefined' && localStorage.getItem('userAccessToken'));

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
};

export const useRepoManagementApi = (handleCb?: () => void) => {
  const createRepoWithUploadedFile = useMutation({
    mutationKey: ['createRepoManagement'],
    mutationFn: async (payload: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
mutation CreateRepo(
  $uploadedFile: CreateUploadedFileDto!,
  $createRepoManagementInput: CreateRepoDto!
) {
  createRepoManagement(
    uploadedFile: $uploadedFile,
    createRepoManagementInput: $createRepoManagementInput
  ) 
}
          `,
          variables: payload,
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to create repo',
        );
      }

      return response.data.data.createRepoManagement;
    },
    onSuccess: () => {
      success({ message: 'Repo created successfully!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error creating repo' });
    },
  });

  const removeUploadedFile = useMutation({
    mutationKey: ['deleteUploadedFile'],
    mutationFn: async (fileId: string) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation removeUploadedFile($fileId: String!) {
              removeUploadedFile(fileId: $fileId)
            }
          `,
          variables: { fileId },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'File deletion failed',
        );
      }

      return response.data.data.removeUploadedFile;
    },
    onSuccess: () => {
      success({ message: 'File deleted successfully!' }); // Or use your success notification
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error deleting file' }); // Or use your error notification
    },
  });

  // 🔹 Fetch One Repo
  const useGetRepoById = (id: string) =>
    useQuery({
      queryKey: ['getRepoById', id],
      queryFn: async () => {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query GetRepo($id: String!) {
                repoManagement(id: $id) {
                  id
                  name
                  url
                }
              }
            `,
            variables: { id },
          },
          { headers },
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response.data?.errors?.[0]?.message || 'Failed to fetch repo',
          );
        }

        return response.data.data.repoManagement;
      },
    });

  // 🔹 Update Repo
  const updateRepoMutation = useMutation({
    mutationKey: ['updateRepo'],
    mutationFn: async (updateRepoInput: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation UpdateRepo($updateRepoManagementInput: UpdateRepoDto!) {
              updateRepoManagement(updateRepoManagementInput: $updateRepoManagementInput) {
                id
                name
              }
            }
          `,
          variables: { updateRepoManagementInput: updateRepoInput },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to update repo',
        );
      }

      return response.data.data.updateRepoManagement;
    },
    onSuccess: () => {
      success({ message: 'Repo updated successfully!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error updating repo' });
    },
  });

  const useGrantAccess = useMutation({
    mutationKey: ['grantAccess'],
    mutationFn: async (grantAccessInput: {
      repoId: string;
      accessType: string;
    }) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
              mutation GrantAccess( $repoId: String!, $accessType: AccessType!) {
                grantAccess( repoId: $repoId, accessType: $accessType) 
              }
            `,
          variables: grantAccessInput,
        },
        { headers }, // Adjust headers if needed
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to grant access',
        );
      }

      return response.data.data.grantAccess;
    },
    onSuccess: (data) => {
      success({ message: 'Access granted successfully!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error granting access' });
    },
  });

  // 🔹 Delete Repo
  const deleteRepoMutation = useMutation({
    mutationKey: ['deleteRepo'],
    mutationFn: async (id: string) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation DeleteRepo($id: String!) {
              removeRepoManagement(id: $id) {
                id
                name
              }
            }
          `,
          variables: { id },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to delete repo',
        );
      }

      return response.data.data.removeRepoManagement;
    },
    onSuccess: () => {
      success({ message: 'Repo deleted successfully!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error deleting repo' });
    },
  });

  // 🔐 Assign Access
  const assignUserAccessMutation = useMutation({
    mutationKey: ['assignUserAccess'],
    mutationFn: async (assignAccessInput: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation AssignAccess($assignAccessInput: AssignAccessInput!) {
              assignUserAccess(assignAccessInput: $assignAccessInput)
            }
          `,
          variables: { assignAccessInput },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to assign access',
        );
      }

      return response.data.data.assignUserAccess;
    },
    onSuccess: () => {
      success({ message: 'Access assigned successfully!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error assigning access' });
    },
  });

  // 🔍 Check Access
  const requestRepoAccess = useMutation({
    mutationKey: ['requestRepoAccess'],
    mutationFn: async (requestInput: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation RequestRepoAccess($requestInput: CreateAccessRequestInput!) {
              requestRepoAccess(requestInput: $requestInput)
            }
          `,
          variables: { requestInput },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Request failed',
        );
      }

      return response.data.data.requestRepoAccess;
    },
    onSuccess: () => {
      success({ message: 'Access request sent!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error requesting access' });
    },
  });

  const updateAccessRequestStatus = useMutation({
    mutationKey: ['updateAccessRequestStatus'],
    mutationFn: async (input: any) => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation UpdateAccessRequestStatus($input: UpdateAccessRequestInput!) {
              updateAccessRequestStatus(input: $input)
            }
          `,
          variables: { input },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data?.errors?.[0]?.message || 'Update failed');
      }

      return response.data.data.updateAccessRequestStatus;
    },
    onSuccess: () => {
      success({ message: 'Request status updated!' });
      handleCb?.();
    },
    onError: (err: any) => {
      error({ message: err?.message || 'Error updating access status' });
    },
  });

  return {
    createRepoWithUploadedFile,
    updateRepoMutation,
    deleteRepoMutation,
    assignUserAccessMutation,
    useGetRepoById,
    removeUploadedFile,
    useGrantAccess,
    requestRepoAccess,
    updateAccessRequestStatus,
  };
};

// export const useGetAllRepos = (propertyId?: string , folderName?:string, shared?:boolean) =>
//   useQuery({
//     queryKey: ['getAllRepos', propertyId , folderName],
//     queryFn: async ({ queryKey }) => {
//       const [, propId] = queryKey;

//       const response = await axios.post(
//         GRAPHQL_URI,
//         {
//           query: `
//           query GetRepos($propertyId: String, $folderName: String) {
//   repoById(propertyId: $propertyId, folderName: $folderName) {
//     id
//     name
//     url
//     uploadedFiles {
//       fileName
//       fileUrl
//       uploadedAt
//     }
//     repoAccessUsers {
//       accessType
//       userId
//     }
//   }
// }

//           `,
//           variables: {
//             propertyId: propId ,
//             folderName },
//         },
//         { headers }
//       );

//       if (response.status !== 200 || response.data.errors) {
//         throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch repos');
//       }

//       return response.data.data.repoById;
//     },
//     enabled: !!propertyId && !! folderName, // only runs if propertyId is defined
//   })

export const useGetAllRepos = (
  propertyId?: string,
  folderName?: string,
  shared: boolean = false,
) =>
  useQuery({
    queryKey: ['getAllRepos', propertyId, folderName, shared], // Include shared in the query key to ensure cache is updated
    queryFn: async ({ queryKey }) => {
      const [, propId, , sharedFlag] = queryKey;

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetRepos($propertyId: String, $folderName: String, $shared: Boolean) {
              repoById(propertyId: $propertyId, folderName: $folderName, shared: $shared) {
                id
                name
                url
                uploadedFiles {
                  id
                  fileName
                  fileUrl
                  uploadedAt
                }
                repoAccessUsers {
                  accessType
                  userId
                }
              }
            }
          `,
          variables: {
            propertyId: propId,
            folderName,
            shared: sharedFlag,
          },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch repos',
        );
      }

      return response.data.data.repoById;
    },
    enabled: !!propertyId && !!folderName, // Only runs if propertyId and folderName are defined
  });

export const useCheckUserAccess = ({
  repoId,
  requiredAccessType,
  enabled = true,
}: {
  repoId: string;
  requiredAccessType: 'VIEW' | 'EDIT' | 'OWNER';
  enabled?: boolean;
}) => {
  const [agentState] = useAtom(agentReadWriteAtom);
  const userId = agentState?.user?.id;
  return useQuery({
    queryKey: [
      'checkUserAccess',
      repoId,
      agentState?.user?.id,
      requiredAccessType,
    ],
    queryFn: async () => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
              query CheckAccess($repoId: String!, $userId: String!, $requiredAccessType: AccessType!) {
                checkUserAccess(repoId: $repoId, userId: $userId, requiredAccessType: $requiredAccessType)
              }
            `,
          variables: { repoId, userId, requiredAccessType },
        },
        {
          headers,
        },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Access check failed',
        );
      }

      return response.data.data.checkUserAccess;
    },
    enabled: !!repoId && !!userId && !!requiredAccessType,
  });
};

export const useGetAccessRequestsByUserId = (userId: string) =>
  useQuery({
    queryKey: ['getAccessRequestsByUserId', userId],
    queryFn: async () => {
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            query GetAllRequestsByUserId($userId: String!) {
              getAllRequestsByUserId(userId: $userId) {
                id
                status
                createdAt
                repo {
                  id
                  name
                }
                
              }
            }
          `,
          variables: { userId },
        },
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message ||
            'Failed to fetch access requests',
        );
      }

      return response.data.data.getAllRequestsByUserId;
    },
    enabled: !!userId,
  });

export const useViewUploadedFileUrl = (
  fileName: string,
  enabled: boolean = true,
) => {
  return useQuery({
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
        { headers },
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response.data?.errors?.[0]?.message || 'Failed to fetch file URL',
        );
      }
      console.log(response.data.data.viewUplaodedFile);
      return response.data.data.viewUplaodedFile;
    },
    enabled: !!fileName, // query runs only if fileName is provided and enabled is true
  });
};
