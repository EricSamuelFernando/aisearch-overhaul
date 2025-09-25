'use client';
import React from 'react';
import Image from 'next/image';

import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { AgentOfferResponse } from '@/interfaces/property.interface';
import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { AgentPropertyCard } from '../dashboard/agent/agent-property-card';
import { Button } from '../ui/button';
import { useDocumentHandlers } from '@/hooks/utils/useDocumentsHandlers';
import DocumentCard from '../dashboard/main/document-card';
import { getInitials, sellerGetInitials } from '@/lib/helpers';
import CustomAvatar from '../customs/avatar';

interface DocumentsListProps {
  propertyId?: string;
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

const SellAgreement: React.FC<DocumentsListProps> = ({ propertyId }) => {
  const router = useRouter();

  const {
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
  } = useDocumentHandlers(propertyId);
  const property_info = useSelector(selectPropertyInformation);
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  const { getOfferDetails } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = getOfferDetails;
  const claimedProperty = useSelector((state:any)=>state?.property?.claimProperty);
  const handleDownloadClick =
    (documentId: string, documentUrl: string) =>
    (event: React.MouseEvent<HTMLImageElement>) => {
      event.preventDefault();
      handleDownload(documentId, documentUrl);
    };

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className='rounded-tl-[3.125rem] rounded-tr-[3.125rem] px-14 pt-8'>
      <div className='mb-4 flex items-center'>
        <Image
          src='/assets/icons/backArrow.svg'
          alt='go back'
          objectFit='contain'
          height={19}
          width={19}
          className='mr-6'
        />
        <p
          className='cursor-pointer text-md font-medium text-black'
          onClick={handleBackClick}
        >
          Back
        </p>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex w-3/5 items-center gap-x-8'>
          <h1 className='mb-2 text-[2rem] font-bold'>Sell Agreement</h1>
          <div className='ml-6 flex items-center space-x-4'>
            {/* <Image
              alt='profile'
              height={80}
              width={80}
              className='object-contain rounded-full object-center'
              src={'/assets/images/Mask Group 43.png'}
            /> */}

            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black'>
              {sellerGetInitials('Alice Downey')}
            </div>

            <div>
              <h2 className='text-base font-semibold'>
                {claimedProperty?.selling_agent?.firstname|| 'Alice Downey'}
              </h2>
              <p className='text-sm font-medium text-orange-500'>
                {claimedProperty?.selling_agent?.firstname|| ' Agent'}
              </p>
            </div>
          </div>
        </div>
        <div className='mt-10 w-1/3'>
          <AgentPropertyCard
            address={property_info.propertyAddressDetails.formattedAddress}
          />
        </div>
      </div>

      <div className='mb-4 w-3/5 border bg-grey-400'></div>

      <div className='mb-6 flex items-center space-x-4'>
        <div className='flex items-center space-x-4'>
          <Button
            roundness='full'
            variant='default'
            className='flex items-center gap-x-3 border-[1px] px-6 py-1 font-medium text-white'
          >
            <Image
              src={'/assets/images/summaryIcon.png'}
              alt='Summary Icon'
              width={20}
              height={20}
              style={{ cursor: 'pointer' }}
            />
            <span>Summarize</span>
          </Button>
          <Button
            roundness='full'
            variant='default'
            className='flex items-center gap-x-3 border-[1px] px-10 py-1 font-medium text-white'
          >
            <span>DocuSign</span>
          </Button>
        </div>
        {documents.length > 0 && (
          <Image
            src={'/assets/images/sell-download.png'}
            alt='Download Icon'
            width={20}
            height={20}
            onClick={() =>
              handleDownloadClick(documents[0]._id, documents[0].url)
            }
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {documents.map((doc, index) => (
          <DocumentCard
            key={doc._id}
            documentId={doc._id}
            title={doc.name}
            description={formatDate(new Date(doc.updatedAt))}
            isSelected={selectedDocument?.id === doc?._id}
            onSelect={() => handleDocumentSelect(doc?._id, doc?.url)}
            draggable
            onDragStart={handleDragStart(index)}
            onDragEnter={handleDragEnter(index)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default SellAgreement;
