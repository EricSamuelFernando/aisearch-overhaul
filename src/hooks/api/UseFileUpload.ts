import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import client from '@/lib/client';
import { DocumentResponse } from '@/interfaces/property.interface';
import { error } from '@/components/alert/notify';
import { logout } from '@/slices/auth/auth.slice';
import { useAppDispatch } from '@/lib/hook';

interface UseFileUpload {
  files: { [key: string]: File[] | null };
  uploadProgress: { [key: string]: number };
  uploadResults: { [key: string]: string };
  isUploading: boolean;
  setFiles: (key: string, fileList: FileList) => void;
  handleUpload: () => Promise<PresignedUrlResponse | void>;
  fileKeys: string[];
  thumbnails: { [key: string]: string };
  downloadUrls: { [key: string]: string };
  fetchDownloadUrls: (fileKeys: string[]) => Promise<void>;
}

export interface PresignedUrlResponse {
  message: string;
  data: {
    successfullFiles: { uploadUrl: string; filename: string; key: string }[];
    failedFiles: { uploadUrl: null; filename: string }[];
  };
}

export interface DownloadUrlResponse {
  message: string;
  data: {
    successfullFiles: { download: string; key: string }[];
  };
}

const useFileUpload = (): UseFileUpload => {
  const [files, setFilesState] = useState<{ [key: string]: File[] | null }>({});
  const dispatch = useAppDispatch();

  const [uploadedFileKeys, setUploadedFileKeys] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadResults, setUploadResults] = useState<{ [key: string]: string }>(
    {},
  );
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const [downloadUrls, setDownloadUrls] = useState<{ [key: string]: string }>(
    {},
  );
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);

  const setFiles = (key: string, fileList: FileList) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const validFiles = Array.from(fileList).filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        error({
          message:
            'The file you uploaded is not supported. Please upload a document in one of the following formats: .pdf, .doc, .docx, or .txt. If you believe this is an error, please try again or contact support.',
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setFilesState((prev) => ({ ...prev, [key]: validFiles }));
      generateThumbnails(validFiles);
    } else {
      console.error('No valid files selected.');
    }
  };

  const generateThumbnails = (fileArray: File[]) => {
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 100;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
          setThumbnails((prev) => ({ ...prev, [file.name]: thumbnailDataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const getPresignedUrls = async (
    fileNames: string[],
  ): Promise<PresignedUrlResponse> => {
    try {
      const response = await client.get<PresignedUrlResponse>(
        `/file/upload-url?files=${fileNames.toString()}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          error({ message: 'Your session has expired.' });
          dispatch(logout());
          return {
            message: 'Unauthorized',
            data: { successfullFiles: [], failedFiles: [] },
          };
        }
      }
      console.error('Error fetching presigned URLs:', error);
      error({
        message:
          'We ran into an issue preparing your file for upload. Please try again.',
      });
      return {
        message: 'Error',
        data: { successfullFiles: [], failedFiles: [] },
      };
    }
  };

  const uploadToPresignedUrl = async (
    file: File,
    presignedUrl: string,
    key: string,
  ) => {
    try {
      const data = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!,
          );
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: percentCompleted,
          }));
        },
      });

      if (data.status === 200) {
        setFileKeys((prev) => [...prev, key]);
        setUploadResults((prev) => ({ ...prev, [file.name]: 'Success' }));
      }
    } catch (error: any) {
      setUploadResults((prev) => ({
        ...prev,
        [file.name]: `Failed: ${error.message}`,
      }));
    }
  };

  const handleUpload = async (): Promise<PresignedUrlResponse | void> => {
    const allFiles = Object.values(files).flatMap((fileList) =>
      fileList ? Array.from(fileList) : [],
    );

    if (allFiles.length === 0) {
      console.error('No files selected.');
      return;
    }

    const fileNames = allFiles.map((file) => file.name);
    setIsUploading(true);

    try {
      const response = await getPresignedUrls(fileNames);
      const { successfullFiles, failedFiles } = response.data;

      for (const file of allFiles) {
        const presignedFile = successfullFiles.find(
          (f) => f.filename === file.name,
        );
        if (presignedFile && presignedFile.uploadUrl) {
          await uploadToPresignedUrl(
            file,
            presignedFile.uploadUrl,
            presignedFile.key,
          );
        } else {
          setUploadResults((prev) => ({
            ...prev,
            [file.name]: 'Failed: No presigned URL',
          }));
        }
      }

      failedFiles.forEach((failedFile) => {
        setUploadResults((prev) => ({
          ...prev,
          [failedFile.filename]: 'Failed to generate URL',
        }));
      });

      const uploadedFileKeys = successfullFiles.map((file) => file.key);
      setUploadedFileKeys(uploadedFileKeys);
      await fetchDownloadUrls(uploadedFileKeys);

      return response;
    } catch (error: any) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchDownloadUrls = async (fileKeys: string[]): Promise<void> => {
    try {
      const response = await client.get(
        `/file/download-url?files=${fileKeys.toString()}`,
      );
      const { successfullFiles } = response.data.data;

      const urls: { [key: string]: string } = {};
      successfullFiles.forEach((file: { key: string; download: string }) => {
        urls[file.key] = file.download;
      });

      setDownloadUrls(urls);
    } catch (error) {
      error({ message: 'Unable to fetch download URLs. Please try again.' });
      console.error('Error fetching download URLs:', error);
    }
  };

  return {
    files,
    uploadProgress,
    uploadResults,
    isUploading,
    setFiles,
    handleUpload,
    fileKeys,
    thumbnails,
    downloadUrls,
    fetchDownloadUrls,
  };
};

export default useFileUpload;
