import React, { useCallback } from 'react';
import useFileUpload from '@/hooks/api/UseFileUpload';
import { useDocumentApi } from '@/hooks/api/document/useDocument';
import { useRouter } from 'next/navigation';
import { DocumentResponse } from '@/interfaces/property.interface';

interface SelectedDocument {
  id: string;
  url: string;
}

export const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export const useDocumentHandlers = (propertyId: string | undefined) => {
  const router = useRouter();
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const [documentName, setDocumentName] = React.useState<string | null>(null);

  const {
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
  } = useFileUpload();
  const { propertyDocuments, addPropertyMutation, deletePropertyMutation } =
    useDocumentApi(propertyId!);

  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] =
    React.useState<SelectedDocument | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [documents, setDocuments] = React.useState<DocumentResponse[]>([]);

  React.useEffect(() => {
    if (propertyDocuments.data) {
      setDocuments(propertyDocuments.data.data.data.result || []);
    }
  }, [propertyDocuments.data]);

  React.useEffect(() => {
    if (fileKeys.length > 0) {
      fetchDownloadUrls(fileKeys);
    }
  }, [propertyId, fileKeys]);

  const openRemoveAccess = () => {
    router.push(`/dashboard/seller/remove-access?id=${propertyId}`);
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = (
    filename: string,
    fileKey: string,
    uploadUrl: string,
  ) => {
    addPropertyMutation.mutate(
      {
        name: filename,
        url: uploadUrl,
        thumbNail: uploadUrl,
        documentType: 'pdf',
      },
      {
        onSuccess: () => {
          const newDocument = {
            _id: fileKey,
            name: filename,
            url: uploadUrl,
            thumbNail: uploadUrl,
            documentType: 'pdf',
          } as DocumentResponse;

          const updatedDocuments = [...documents, newDocument];
          setDocuments(updatedDocuments);
          fetchDownloadUrls([...fileKeys, fileKey]);
        },
      },
    );
  };

  // const handleDocumentSelect = (documentUrl: string) => {
  //   setSelectedDocument((prevUrl) =>
  //     prevUrl === documentUrl ? null : documentUrl
  //   )
  // }
  // const handleDocumentSelect = (documentId: string, documentUrl: string) => {
  //   setSelectedDocument((prev) =>
  //     prev && prev.id === documentId
  //       ? null
  //       : { id: documentId, url: documentUrl }
  //   )
  // }

  const handleDocumentSelect = useCallback(
    (documentId: string, documentUrl: string) => {
      const selectedDoc = documents.find((doc) => doc._id === documentId);
      console.log({ documentId, documentUrl, selectedDoc });
      if (selectedDoc) {
        setDocumentName(selectedDoc.name);
      }
      setSelectedDocument((prev) =>
        prev && prev.id === documentId
          ? null
          : { id: documentId, url: documentUrl },
      );
    },
    [documents],
  );

  // const handleDelete = async () => {
  //   if (!selectedDocument) {
  //     console.error('No document selected.');
  //     return;
  //   }

  //   try {
  //     await deletePropertyMutation.mutateAsync(selectedDocument.id);
  //   } catch (error) {
  //     console.error('Error deleting document:', error);
  //   }
  // };
  const handleDelete = async (documentId: string) => {
    if (!documentId) {
      console.error('No document ID provided.');
      return;
    }

    try {
      await deletePropertyMutation.mutateAsync(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const download = (filename: string, content: string) => {
    let element = document.createElement('a');
    element.setAttribute('href', content);
    element.setAttribute('download', filename);

    document.body.appendChild(element);
    element.click();

    document.body.removeChild(element);
  };

  // const handleDownload = async () => {
  //   if (!selectedDocument) {
  //     console.error('No document selected.');
  //     return;
  //   }

  //   const { id, url } = selectedDocument;

  //   setIsDownloading(true);

  //   try {
  //     const result = await fetch(url);
  //     const blob = await result.blob();
  //     const downloadUrl = URL.createObjectURL(blob);

  //     download(id, downloadUrl);

  //     URL.revokeObjectURL(downloadUrl);
  //   } catch (error) {
  //     console.error('Error downloading file:', error);
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };
  const handleDownload = async (documentId: string, documentUrl: string) => {
    if (!documentId || !documentUrl) {
      console.error('Document ID or URL not provided.');
      return;
    }

    setIsDownloading(true);

    try {
      const result = await fetch(documentUrl);
      const blob = await result.blob();
      const downloadUrl = URL.createObjectURL(blob);

      download(documentId, downloadUrl);

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDragStart =
    (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      dragItem.current = index;
      e.currentTarget.style.opacity = '0.5';
    };

  const handleDragEnter =
    (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragOverItem.current = index;
      e.currentTarget.style.border = '2px dashed gray';
    };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.border = 'none';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dragIndex = dragItem.current;
    const dropIndex = dragOverItem.current;

    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      const updatedDocuments = [...documents];
      const [draggedItem] = updatedDocuments.splice(dragIndex, 1);
      updatedDocuments.splice(dropIndex, 0, draggedItem);
      setDocuments(updatedDocuments);
    }
    e.currentTarget.style.border = 'none';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  return {
    documents,
    selectedDocument,
    isUploadModalOpen,
    isDownloading,
    openRemoveAccess,
    openUploadModal,
    handleUploadSuccess,
    handleDocumentSelect,
    handleDelete,
    handleDownload,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    setIsUploadModalOpen,
  };
};
