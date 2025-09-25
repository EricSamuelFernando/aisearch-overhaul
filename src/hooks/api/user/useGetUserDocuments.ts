import { useQuery } from '@tanstack/react-query';

import client, { pickErrorMessage, pickResult } from '@/lib/client';

export interface UserDocument {
  _id: string;
  user: string;
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
  expirydate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserDocumentResponse {
  message: string;
  result: UserDocument[];
  total: number;
  page: number;
  limit: number;
}

const getUserDocument = async (): Promise<UserDocumentResponse> => {
  return await client
    .get('user/get/user-documents')
    .then(pickResult, pickErrorMessage);
};

export const useGetUserDocument = () => {
  return useQuery<UserDocumentResponse>({
    queryKey: ['userDocument'],
    queryFn: getUserDocument,
  });
};
