'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';
import { AgentPropertyCard } from '../dashboard/agent/agent-property-card';
import { Button } from '../ui/button';
import {
  truncateName,
  useDocumentHandlers,
} from '@/hooks/utils/useDocumentsHandlers';
import DocumentCard from '../dashboard/main/document-card';
import DocumentUploadModal from '../dashboard/main/document-upload-modal';
import { formatSellerDate, sellerGetInitials } from '@/lib/helpers';
import { fetchAiSummary } from '@/hooks/api/document/useDocument';
import { Loader } from 'lucide-react';
import AISummaryCardOutput from '../modals/AISummaryOutput';
import DocumentCardMenu from '../dashboard/main/document-card-menu';
import PDFViewerModal from '../dashboard/main/pdf-viewer';
import { SellerAPIs } from '@/hooks/api/seller';
import { error } from 'console';
import axios from 'axios';
import { userData } from '@/slices/auth/auth.slice';
import { success } from '../alert/notify';
import { setLabels } from 'react-chartjs-2/dist/utils';

interface DocumentsListProps {
  propertyId?: string;
}
interface SellerDocInterface {
  id: string;
  name: string;
  type: string;
  url: string;
  propertyId: string;
  listingId: string;
  user: {
    id: string;
    email: string;
  }
}
interface FileInterface {
  name: string;
  url: string;
  type: string;
}

const SellerDisclosureDoc: React.FC<DocumentsListProps> = ({ propertyId }) => {
  const router = useRouter();
  const user = useSelector(userData);
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);
  const property_info = useSelector(selectPropertyInformation);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sellerDocuments, setSellerDocuments] = useState<SellerDocInterface[]>([]);
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState<string>('');
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileDetails, setFileDetails] = useState<FileInterface>({
    name: "",
    url: "",
    type: ""
  });
  console.log()
  const {
    getSellPropertyDocuments,
    uploadSellerDocument,
    updateSellerDocument,
    deleteSellerDocument
  } = SellerAPIs()
  const {
    documents,
    selectedDocument,
    // isUploadModalOpen,
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
  } = useDocumentHandlers(propertyId);

  const handleBack = () => router.back();

  const handleSummarizeClick = async () => {
    if (!selectedDocument) return;

    setIsAiSummaryLoading(true);
    try {
      const summary = await fetchAiSummary(selectedDocument.url);
      if (summary?.data?.text) {
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

  console.log(sellerDocuments)

  useEffect(() => {
    getAllDocuments()
  }, [])

  return (
    <div className="min-h-screen bg-white rounded-tl-[3.125rem] rounded-tr-[3.125rem] px-14 pt-8 pb-20">
      {/* Back Button */}
      <div className="flex cursor-pointer items-center gap-5 mb-6" onClick={handleBack}>
        <Image src="/assets/images/arrow-back.svg" alt="Back" height={19} width={18} />
        <p className="text-md font-medium">Back</p>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-x-8 w-3/5">
          <h1 className="text-[2rem] font-bold">Documents</h1>
          <div className="ml-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black">
              {sellerGetInitials(claimedProperty?.selling_agent?.firstname|| 'Alice Downey')}
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {claimedProperty?.selling_agent?.firstname|| 'Alice Downey'}
              </h2>
              <p className="text-sm font-medium text-orange-500">Agent</p>
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <AgentPropertyCard
            moreAddressDetails={claimedProperty?.name}
            imageSource={claimedProperty?.image}
            address={`${claimedProperty?.address}, ${claimedProperty?.city}, ${claimedProperty?.zipCode}`}
          />
        </div>
      </div>

      <div className="my-4 border-t border-gray-300 w-3/5"></div>

      {/* Actions */}
      <div className="mb-6 flex items-center space-x-4">
        <Button
          roundness="full"
          variant="outline"
          className="border border-black px-10 py-1 font-medium text-black"
          onClick={() => {
            setIsUploadModalOpen(true);

          }}
        >
          Upload
        </Button>
        <Button
          roundness="full"
          variant="default"
          className="flex items-center gap-x-3 px-6 py-1 font-medium text-white"
          onClick={handleSummarizeClick}
          disabled={isAiSummaryLoading}
        >
          {isAiSummaryLoading ? (
            <Loader className="animate-spin" />
          ) : (
            <Image src="/assets/images/summaryIcon.png" alt="Summary" width={20} height={20} />
          )}
          Summarize
        </Button>
        <Button
          roundness="full"
          variant="default"
          className="px-10 py-1 font-medium text-white"
        >
          DocuSign
        </Button>
      </div>

      {/* Documents Grid */}
      {/* Documents Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin text-gray-500 w-8 h-8" />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sellerDocuments?.length ? (
            sellerDocuments.map((doc, index) => (
              <div
                key={doc?.id}
                className={`relative flex items-center justify-between rounded-lg p-4 transition-all duration-300 ${selectedDocument?.id === doc?.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
              >
                <DocumentCard
                  documentId={doc?.id}
                  title={truncateName(doc.name, 20)}
                  // description={formatSellerDate(new Date(doc.updatedAt))}
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
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">No documents available.</div>
          )}
        </div>
      )}


      {/* Modals */}
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
          documentName={""}
        />
      )}

      {pdfViewerUrl && (
        <PDFViewerModal
          isOpen={isPdfViewerModalOpen}
          onClose={() => setIsPdfViewerModalOpen(false)}
          documentUrl={pdfViewerUrl}
        />
      )}
    </div>
  );
};

export default SellerDisclosureDoc;
