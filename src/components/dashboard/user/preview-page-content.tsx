'use client';

import { useParams } from 'next/navigation';
import { CheckIcon } from 'lucide-react';
import parse from 'html-react-parser';

import { cn, formatCurrency } from '@/lib/utils';
import { HeadingLevelTwo } from '../../heading';

import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { GeneralBackButton } from '@/components/dashboard/user/back-button';
import { Button, buttonVariants } from '@/components/ui/button';
import ContactCard from './contact-card';
import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
import Link from 'next/link';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import DocumentCard from '../main/document-card';
import {
  truncateName,
  useDocumentHandlers,
} from '@/hooks/utils/useDocumentsHandlers';
import { formatSellerDate, sellerGetInitials } from '@/lib/helpers';
import DocumentCardMenu from '../main/document-card-menu';
import { useState } from 'react';
import PDFViewerModal from '../main/pdf-viewer';
import DocumentCardPreview from '../main/buyer-dashboard/document-card-preview';
import { useSelector } from 'react-redux';
import { useAppSelector } from '@/lib/hook';

interface OfferDataDocuments {
  _id: string;
  name: string;
  url: string;
  dateAdded: string;
}

export function PreviewPageContent() {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const {selectedOffer} = useAppSelector(state =>  state.property)
  console.log(selectedOffer)

  const { handleDownload } = useDocumentHandlers(id);


  const offerData:any = selectedOffer
  const currentStatus = offerData?.currentStatus as OfferStatusEnum;

  const documents: OfferDataDocuments[] = offerData?.documents;

  // console.log(documents);

  const handleOpenPdfViewer = (url: string) => {
    setPdfViewerUrl(url);
    setIsPdfViewerModalOpen(true);
  };

  return (
    <div className='overflow-hidden'>
      <div className='border-b border-[#707070] px-10 py-4'>
        <GeneralBackButton />
      </div>
      <section className='grid grid-cols-6 gap-x-10 px-[3.219rem] py-8'>
        <aside className='col-span-4 space-y-10'>
          <div className='grid grid-cols-2'>
            <div className='col-span-1'>
              <h3 className='my-4 mb-8 font-semibold'>
                This Offer is being made by
              </h3>

              <ContactCard
                name={offerData?.createdBy?.firstName + " "  + offerData?.createdBy?.lastName }
                email={offerData?.createdBy?.email}
                phone={offerData?.createdBy?.mobile?.number_body}
                license={offerData?.createdBy?.licence_number}
                // profilePlaceholder='SA'
                profilePlaceholder={`${offerData?.createdBy?.firstName[0]}/${offerData?.buyerAgent?.lastName[0]}`}
              />
            </div>
          </div>

          <div>
            <h2 className='mt-8 text-3xl font-medium'>
              {offerData?.propertyEngagement?.propertyAddress}
            </h2>
          </div>

          <section>
            <HeadingLevelTwo className='my-6'>Cover Letter</HeadingLevelTwo>

            <p className='py-8'>
              {' '}
              {offerData?.coverLetter
                ? parse(offerData.coverLetter)
                : 'No cover letter available'}
            </p>
          </section>

          <section>
            <HeadingLevelTwo className='my-6'>Summary of Terms</HeadingLevelTwo>

            <div className='grid grid-cols-3 justify-between gap-x-4 gap-y-10 capitalize'>
              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Offer Price</p>
                <p className='text-base font-medium'>
                  {formatCurrency(
                    offerData?.price
                    
                  )}
                </p>
              </div>

              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Finance Type</p>
                <p className='text-base font-medium'>
                  {offerData?.financeType}
                </p>
              </div>

              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Down Payment</p>
                <p className='text-base font-medium'>
                  {formatCurrency(
                    offerData?.downPayment
                    
                  )}
                </p>
              </div>

              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Finance Contingency</p>
                <p className='text-base font-medium'>
                  { `${offerData?.financeContingencyDays} Days`
                   }
                </p>
              </div>

              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Appraisal Contingency</p>
                <p className='text-base font-medium'>
                  { `${offerData?.appraisalContingencyDays} Days `
                    }
                </p>
              </div>

              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Inspection Contingency</p>
                <p className='text-base font-medium'>
                  
                    {`${offerData?.inspectionContingencyDays} Days `
                    }
                </p>
              </div>

              <div className='cols-span-1 flex-1 space-y-3'>
                <p className='text-[#848484]'>Close Escrow</p>
                <p className='text-base font-medium'>
                  {offerData?.closeEscrowDays + " " +'Days'
                    }
                </p>
              </div>
            </div>
          </section>

          <section>
            <HeadingLevelTwo className='my-6'>Special terms</HeadingLevelTwo>
            <p className='py-8'>
              {' '}
              {offerData?.coverLetter
                ? parse(offerData?.specialTerms)
                : 'No special terms available'}
            </p>
          </section>

          <section>
            <HeadingLevelTwo className='my-6'>
              Uploaded Documents
            </HeadingLevelTwo>
            <div className='grid grid-cols-3 gap-4 py-10'>
              {document &&
                documents?.map((doc, index) => (
                  <DocumentCardPreview
                    key={doc._id}
                    documentId={doc._id}
                    title={truncateName(doc.name, 20)}
                    description={formatSellerDate(new Date(doc.dateAdded))}
                    onOpen={() => handleOpenPdfViewer(doc.url)}
                    onDownload={() => handleDownload(doc._id, doc.url)}
                  />
                ))}

              {pdfViewerUrl && (
                <PDFViewerModal
                  isOpen={isPdfViewerModalOpen}
                  onClose={() => setIsPdfViewerModalOpen(false)}
                  documentUrl={pdfViewerUrl}
                />
              )}
            </div>
          </section>
        </aside>
        <aside className='col-span-2 flex justify-between'>
          <OfferStatusCard currentStatus={currentStatus} propertyId={id} />
        </aside>
      </section>
    </div>
  );
}

export default PreviewPageContent;

export enum OfferStatusEnum {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  rejected = 'rejected',
  titleAndEscrow = 'titleAndEscrow',
  trackingContingency = 'trackingContingency',
  signAndClose = 'signAndClose',
}

interface OfferStatusCardProps {
  currentStatus: OfferStatusEnum;
  propertyId: string;
}

const OfferStatusCard: React.FC<OfferStatusCardProps> = ({
  currentStatus,
  propertyId,
}) => {
  const { userPath } = useCurrentUser();

  const isSubmitted = currentStatus !== OfferStatusEnum.pending;
  const isViewed =
    currentStatus !== OfferStatusEnum.pending &&
    currentStatus !== OfferStatusEnum.submitted;
  const isAccepted = currentStatus === OfferStatusEnum.accepted;

  return (
    <aside className='col-span-2 flex justify-between'>
      <div className='h-[350px] w-[400px] rounded-3xl bg-[#F7F2EB] p-8'>
        <h3 className='my-4 font-semibold'>Status:</h3>

        <div className='space-y-4'>
          <StatusItem isChecked={isSubmitted} text='Submitted' />
          <StatusItem isChecked={isViewed} text='Seller Viewed Offer' />
          <StatusItem isChecked={isAccepted} text='Acceptance' />
        </div>

        <div className='flex items-center gap-x-4 pt-20'>
          <Link
            className={`flex-1 rounded-full bg-black px-4  py-2 text-center text-white`}
            href={`${userPath}/property/${propertyId}/offer/edit?type=edit`}
          >
            Edit
          </Link>

          <Button roundness='full' className='flex-1'>
            Download
          </Button>
          
        </div>
      </div>
    </aside>
  );
};

interface StatusItemProps {
  isChecked: boolean;
  text: string;
  icon?: React.ReactNode;
}

const StatusItem: React.FC<StatusItemProps> = ({ isChecked, text, icon }) => {
  return (
    <div className='flex items-center gap-x-3'>
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-sm',
          isChecked ? 'bg-ocGreen-150' : 'border border-gray-300',
        )}
      >
        {isChecked && <CheckIcon className='h-4 w-4 text-white' />}
      </span>
      {icon}
      <span className='text-sm text-grey-850'>{text}</span>
    </div>
  );
};
