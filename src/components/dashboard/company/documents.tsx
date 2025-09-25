'use client';

import React, { useEffect, useState } from 'react';
import Divider from '@/components/divider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import DocumentCard from '../main/document-card';
import DocumentUploadModal from '../main/document-upload-modal';
import TransactionSidebar from '../main/transaction-sidebar';
import CustomInput from '@/components/customs/input';
import {
  truncateName,
  useDocumentHandlers,
} from '@/hooks/utils/useDocumentsHandlers';
import AISummaryCardOutput from '@/components/modals/AISummaryOutput';
import { fetchAiSummary } from '@/hooks/api/document/useDocument';
import { Loader } from 'lucide-react';
import PDFViewerModal from '../main/pdf-viewer';
import DocumentCardMenu from '../main/document-card-menu';
import RemoveAccess from '../main/remove-access';
import { SellerAPIs } from '@/hooks/api/seller';
import { success } from '@/components/alert/notify';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { TransactionPropertyCard } from '../main/transaction-property-card';
import { useRouter } from 'next/navigation';
import ToursList from '../main/tours-list';

interface DocumentsListProps {
  propertyId?: string;
}
interface FileInterface {
  name: string;
  url: string;
  type: string;
}

const formatDate = (date: Date): string => {
  return `Updated ${date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
};



const DocumentsList: React.FC<DocumentsListProps> = ({ propertyId }) => {
  const [isSummaryModalOpen, setIsSummaryModalOpen] = React.useState(false);
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = React.useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = React.useState<string | null>(null);
  const user = useSelector(userData);
  const [documentName, setDocumentName] = React.useState<string | null>(null);
  const [viewRemoveAccess, setviewRemoveAccess] = React.useState(false);
  const [fileDetails, setFileDetails] = useState<FileInterface>({
    name: "",
    url: "",
    type: ""
  });
  const {
    documents,
    selectedDocument,
    isUploadModalOpen,
    isDownloading,
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
  } = useDocumentHandlers(propertyId);
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);
  const [aiSummaryData, setAiSummaryData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sellerDocuments, setSellerDocuments] = useState<any[]>([]);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState<boolean>(false);
  const {
    getSellPropertyDocuments,
    uploadSellerDocument,
    deleteSellerDocument
  } = SellerAPIs();
  const handleSummarizeClick = async () => {
    if (!selectedDocument) {
      console.error('No document selected.');
      return;
    }

    setIsAiSummaryLoading(true);

    try {
      const summary = await fetchAiSummary(selectedDocument.url);
      if (summary) {
        setAiSummaryData(summary.data.text);
        setIsSummaryModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching AI summary:', error);
    } finally {
      setIsAiSummaryLoading(false);
    }
  };

  const handleOpenPdfViewer = (url: string) => {
    setPdfViewerUrl(url);
    setIsPdfViewerModalOpen(true);
  };

  const getAllDocuments = async () => {
    setIsLoading(true);
    getSellPropertyDocuments.mutateAsync({
      listingId: "400251560",
      propertyId: "34935378"
    }, {
      onSuccess: (response: any) => {
        console.log("Data : ", response);
        setIsLoading(false);
        setSellerDocuments(response);
      },
      onError: (error: any) => {
        setIsLoading(false);
        console.log("Error : ", error);
      }
    })
  }

  const handleUpload = (name: string, type: string, url: string) => {
    uploadSellerDocument.mutateAsync({
      listingId: "400251560",
      propertyId: "34935378",
      name,
      url,
      type,
      uploadedBy: user?.id,
    }, {
      onSuccess: (response: any) => {
        console.log("Response : ", response);
        success({ message: "Document has been uploaded successfully" })
        getAllDocuments();
      },
      onError: (error: any) => {
        console.log("Error : ", error);
      }
    })
  }

  const handleDeleteDocument = (id: string) => {
    console.log("Delete ID : ", id);

    deleteSellerDocument.mutateAsync(id, {
      onSuccess: (response: any) => {
        console.log("Response : ", response);
        success({ message: "Document has been deleted successfully" })
        getAllDocuments();
      },
      onError: (error: any) => {
        console.log("Error : ", error);
      }
    })
  }

  const openRemoveAccess = () => setviewRemoveAccess((s) => !s);

  useEffect(() => {
    getAllDocuments()
  }, []);
  return (
    <section className='mt-6 flex w-full gap-x-10'>
      <div className='flex-1 pl-8'>
        <aside className='flex items-center justify-between'>
          {viewRemoveAccess ? (
            <button
              className='text-lg font-semibold text-black'
              onClick={openRemoveAccess}
            >
              &larr; Back
            </button>
          ) : (
            <div className='flex items-center'>
              <div>
                <Button
                  roundness='full'
                  variant='outline'
                  className='border-[1px] border-black px-8 py-1 font-medium text-black'
                  onClick={openUploadModal}
                >
                  <span>Upload</span>
                </Button>
              </div>
              <div className='ml-6 flex items-center gap-x-4'>
                {/* <Image
                src={'/assets/images/sell-download.png'}
                alt='Download Icon'
                width={20}
                height={20}
                onClick={handleDownload}
                style={{ cursor: 'pointer' }}
              />
              <figure className='ml-2'>
                <Image
                  src={'/assets/images/delete.png'}
                  alt='Delete Icon'
                  width={20}
                  height={20}
                  onClick={handleDelete}
                  style={{ cursor: 'pointer' }}
                />
              </figure> */}
                <Button
                  roundness='md'
                  variant='default'
                  className='flex items-center gap-x-2 border-[1px] py-1 font-medium text-white'
                  onClick={handleSummarizeClick}
                  disabled={isAiSummaryLoading}
                >
                  {isAiSummaryLoading ? (
                    <Loader className='animate-spin' />
                  ) : (
                    <Image
                      src={'/assets/images/summaryIcon.png'}
                      alt='Summary Icon'
                      width={20}
                      height={20}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  <span>Summarize</span>
                </Button>
              </div>
            </div>
          )}
          {viewRemoveAccess ? null : (
            <Button
              size='lg'
              roundness='md'
              className='ml-40 p-3'
              onClick={openRemoveAccess}
            >
              <Image
                src='/assets/images/ShareIcon.png'
                alt='Share Icon'
                width={25}
                height={25}
                style={{ cursor: 'pointer' }}
              />
            </Button>
          )}
          <div className='flex items-center gap-x-4'>
            <CustomInput
              leftSection={
                <Image
                  src='/assets/icons/search-p.svg'
                  alt='Search'
                  height={18}
                  width={18}
                  className='mt-4'
                />
              }
              placeholder={`Search ${viewRemoveAccess ? 'viewers' : 'file'}`}
              className='mt-4 rounded-xl font-normal text-grey-710 md:w-[36.688rem]'
              style={{ width: '20rem' }}
            />
          </div>
        </aside>
        <Divider className='my-8 w-full' />

        {viewRemoveAccess ? (
          <RemoveAccess
            id={propertyId ?? ''}
            openRemoveAccess={openRemoveAccess}
          />
        ) : (
          <aside className='grid grid-cols-2 gap-4'>
            {sellerDocuments.map((doc, index) => (
              <div
                key={doc?.id}
                className={`relative flex items-center justify-between rounded-lg p-4 transition-all duration-500 ease-in-out ${selectedDocument?.id === doc?.id
                    ? 'bg-grey-880'
                    : 'hover:bg-grey-880'
                  }`}
              >
                <DocumentCard
                  key={doc?.id}
                  documentId={doc?.id}
                  title={truncateName(doc.name, 20)}
                  description={formatDate(new Date(doc.updatedAt))}
                  isSelected={selectedDocument?.id === doc?.id}
                  onSelect={() => handleDocumentSelect(doc?.id, doc?.url)}
                  draggable
                  onDragStart={handleDragStart(index)}
                  onDragEnter={handleDragEnter(index)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
                <DocumentCardMenu
                  onOpen={() => handleOpenPdfViewer(doc.url)}
                  onDownload={() => handleDownload(doc.id, doc.url)}
                  onDelete={() => handleDeleteDocument(doc.id)}
                />
              </div>
            ))}
          </aside>
        )}

        {isDownloading && <p>Downloading...</p>}
      </div>
      <aside className='w-1/3'>
            <TransactionPropertyCard
                  imageSource={claimedProperty?.image}
                  address={claimedProperty?.address}
                  moreAddressDetails={claimedProperty?.name}
                  
                />
                <div className='my-6'>
                  <ToursList />
                </div>
      </aside>
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(name, type, url) => {
          // const uploadUrl = `https://ocrealstoragebucket.s3.eu-north-1.amazonaws.com/${fileKey}`;
          // handleUploadSuccess(filename, fileKey, uploadUrl);
          console.log("Data : ", name, type, url);

          handleUpload(name, type, url);
        }}
        setFileDetails={setFileDetails}
      />
      {selectedDocument && (
        <AISummaryCardOutput
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          isLoading={isAiSummaryLoading}
          summary={aiSummaryData}
          documentName={documentName}
        />
      )}
      {pdfViewerUrl && (
        <PDFViewerModal
          isOpen={isPdfViewerModalOpen}
          onClose={() => setIsPdfViewerModalOpen(false)}
          documentUrl={pdfViewerUrl}
        />
      )}
    </section>
  );
};

export default DocumentsList;
