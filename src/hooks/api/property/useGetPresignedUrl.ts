import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { atom, useAtom } from 'jotai';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';

export const urlAtom = atom(['']);

const presignedUrlAtom = atomWithQuery((get) => ({
  queryKey: ['presigned-image-url', get(urlAtom) as string[]],
  queryFn: async ({ queryKey: [, fileNames] }) => {
    const fileNamesArray = fileNames as string[];
    return await client
      .get(`file/upload-url?files=${fileNamesArray.toString()}`)
      .then(pickResult, pickErrorMessage);
  },
  enabled: false,
}));

const uploadToPresignedUrlAtom = atomWithMutation(() => ({
  mutationKey: ['upload-presigned-url'],
  mutationFn: async ({
    file,
    presignedUrl,
  }: {
    file: File;
    presignedUrl: string;
  }) => {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return response.data;
  },
}));

export const useGetPresignedUrl = () => {
  const [
    { data: presignedUrls, status: presignedUrlStatus, refetch: getURLs },
  ] = useAtom(presignedUrlAtom);

  const [
    {
      data: uploadedUrls,
      status: uploadUrlStatus,
      isPending: isUploadPending,
      mutateAsync: uploadToPresignedUrl,
    },
  ] = useAtom(uploadToPresignedUrlAtom);

  return {
    presignedUrls,
    presignedUrlStatus,
    uploadUrlStatus,
    uploadedUrls,
    getURLs,
    uploadToPresignedUrl,
    loading: isUploadPending,
  };
};
