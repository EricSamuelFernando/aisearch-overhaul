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
import SummarisationModal from '../modals/SummaryModal';
import CustomInput from '../customs/input';
import { Icons } from '../icons';
import AllDocument from '../property/manage/all-document';
import SharedDocument from '../property/manage/shared-document';
import PaymentModal from '../modals/payment-modal/payment-modal';
import { LockIcon } from '@public/assets/icons';

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

const SellerDoc: React.FC<DocumentsListProps> = ({ propertyId }) => {
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

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

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

  console.log(sellerDocuments , claimedProperty)

  useEffect(() => {
    getAllDocuments()
  }, [])

  const [subTab, setSubTab] = useState<any>(null);

  const onSuccess = () => {
    setIsPaymentModalOpen(false)
    success({message:'Payment successful!'})
    setTimeout(() => {
      setIsPaymentSuccessful(true);
    }, 500);
   
}

  return (
    <div className="min-h-screen bg-white rounded-tl-[3.125rem] rounded-tr-[3.125rem] px-14 pt-8 pb-20">
      {/* Back Button */}
      <div className="flex cursor-pointer items-center gap-5 mb-6" onClick={handleBack}>
        <Image src="/assets/images/arrow-back.svg" alt="Back" height={19} width={18} />
        <p className="text-md font-medium">Back</p>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className=' flex flex-col gap-x-8 w-3/5'>
        <div className="flex items-center mb-4">
          <h1 className="text-[2rem] font-bold">Documents</h1>
          <div className="ml-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
              {sellerGetInitials(claimedProperty?.selling_agent?.firstname|| 'Alice Downey')}
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {claimedProperty?.selling_agent?.firstname }    {claimedProperty?.selling_agent?.lastname }
              </h2>
              <p className="text-sm font-medium text-orange-500">Agent</p>
            </div>
          </div>
        </div>
        <div className="flex h-max p-2 items-start justify-between gap-x-8">
            {/* Search Input */}
            <CustomInput
              placeholder="Search Document"
              className="placeholder:text-base"
              labelClass="hidden p-0 m-0"
              leftSection={<Icons.Search className="h-4 w-4 py-2" />}
              containerClass="w-2/3"
            />

            {/* Summarize Button */}
            <div className="w-1/3 py-1" onClick={() => setIsPaymentModalOpen(true)}>
              <button className="flex items-center justify-between gap-x-2 rounded-3xl bg-black px-4 py-2 text-white">
                <span>Summarize</span>
                <span className="h-5 w-5">
                  <Icons.ColoredAi className="h-5 w-5" />
                </span>
              </button>
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


     
     
      <div className='h-full w-full '>
   
          <>
            {/* Sub-tabs for Disclosure */}
           
            <div className='mb-1 flex  gap-2 border-gray-200 p-2 pt-0'>
              <button
                onClick={() => setSubTab('All')}
                className={`flex flex-col gap-1  py-3 px-8 border rounded-lg hover:bg-grey-190 ${
                  subTab === 'All' ? 'border-ocOrange ' : ''
                }`}
                //className=''
              >
                {/* <Image
                  alt={'folder'}
                  src={FolderIcon}
                  width={36}
                  height={36}
                  className='object-contain object-center'
                /> */}
                <p className='text-sm font-bold'> All </p>
              </button>
              <button
                onClick={() => setSubTab('Shared')}
                className={`flex flex-col gap-1  py-3 px-8 border rounded-lg hover:bg-grey-190 ${
                  subTab === 'Shared' ? 'border-ocOrange ' : ''
                }`}
              >
                {/* <Image
                  alt={'folder'}
                  src={FolderIcon}
                  width={36}
                  height={36}
                  className='object-contain object-center'
                /> */}
                <p className='text-sm font-bold'>Shared</p>
              </button>
            </div>
            {!subTab && (
  <div className="flex justify-center items-center h-40 text-grey-500 text-lg font-medium">
    No folder selected
  </div>
)}

{subTab === 'All' && <AllDocument propertyId={propertyId} />}
{subTab === 'Shared' && <SharedDocument propertyId={propertyId}  />}


          </>
        

       {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onProceed={() => console.log('Paid')}
          title="Unlock AI Summary"
          subTitle='Your Shortcut to Clarity'
          icon={LockIcon}
          onSuccess={onSuccess}
          amount={25}
        />
      )}


      {
         isPaymentSuccessful && ( <SummarisationModal  />)
         
      }

     
      </div>


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

export default SellerDoc;
