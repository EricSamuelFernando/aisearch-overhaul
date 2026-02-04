// 'use client';

// import { Info } from 'lucide-react';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import React, { useEffect, useState } from 'react';

// import { Button } from '@/components/ui/button';
// import { IProperty } from '@/interfaces/property.interface';
// import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
// import { cn } from '@/lib/utils';
// import AgentCard from '../main/agent-card';
// import PropertyOverview from '../main/property-overview';
// import PropertyDetailLoader from './property-detail-loader';
// import PropertyTabs from './property-tabs';

// import { AddCoBuyer } from '@/components/property/manage/add-cobuyer';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
// import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
// import { useUpdateTitleEscrow } from '@/hooks/api/property/useUpdateTitleEscrow';
// import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
// import { useMortgageServiceAPI } from '@/hooks/api/auth/mortgageAPIs';
// import { useSelector } from 'react-redux';
// import { userData } from '@/slices/auth/auth.slice';
// import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
// import { useQueryClient } from '@tanstack/react-query';
// import CreateUserOffers from './created-user-offers';

// enum OfferStatusEnum {
//   pending = 'pending',
//   submitted = 'submitted',
//   accepted = 'accepted',
//   rejected = 'rejected',
//   titleAndEscrow = 'titleAndEscrow',
//   trackingContingency = 'trackingContingency',
//   signAndClose = 'signAndClose',
// }

// export interface EngagedPropertyInterface {
//   id: string;
//   userId: string;
//   propertyId: string;
//   propertyName: string;
//   propertyImage: string;
//   propertyAddress: string;
//   propertyProgress: number;
//   status: string;
// }

// export interface EngagedPropertyDocumentsInterface {
//   id: string;
//   userId: string;
//   propertyId: string;
//   documentName: string;
//   mimeType: string;
//   uploadedAt: string;
//   viewUrl: string;

// }

// function PropertyDetailLayout() {
//   const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
//   const { userPath } = useCurrentUser();
//   const [loading, setLoading] = useState(true);
//   const [propertyData, setPropertyData] = useState<EngagedPropertyInterface>();
//   const [propertytDocuments, setPropertyDocuments] = useState<EngagedPropertyDocumentsInterface>();
//   const {
//     getSingleProperty: { isFetching, data, isLoading },
//   }: any = useGetSingleProperty(id!);
//   const { getEngagedPropertyByPropertyId } = useAgentConversationApi()
//   const { getEngagedPropertyDocs, uploadNewFile, editDocument } = useMortgageServiceAPI()
//   const { data: offerDataResponse } = useGetPropertyOffer(id!);
//   const { mutate: updateTitleEscrow, isPending: isTitlEscrowLoading } = useUpdateTitleEscrow(id);
//   const property = data?.property as any;
//   const offerData: any = offerDataResponse;
//   const currentStatus = offerData?.currentStatus as OfferStatusEnum;
//   const [fileUploading, setFileUploading] = useState(false);

//   // console.log('DEBUG DASHBOARD:', { id, loading, isLoading, property, propertyData, data });
//   const currentUser = useSelector(userData);
//   const engagedProperty = useSelector((state: any) => state.property?.engagedProperty)
//   const handleTitleEscrow = () => {
//     updateTitleEscrow();
//   };
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [totalItems, setTotalItems] = useState(50);
//   const agentData = engagedProperty?.participants?.filter((item: any) => item?.userId === currentUser?.id);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const agent = agentData?.filter((item: any) => item?.userId === currentUser?.id)
//   const { renameUploadedFile } = useRepoManagementApi();

//   const getEngagedProperty = () => {
//     setPropertyData({} as EngagedPropertyInterface);
//     setLoading(true);
//     getEngagedPropertyByPropertyId.mutate(id, {
//       onSuccess: (response) => {
//         setLoading(false);
//         console.log(response?.data)
//         setPropertyData(response.data?.data?.getUserEngagementsByPropertyId);
//       },
//       onError: (error) => {
//         console.log("Error in mutation: ", error);
//         setLoading(false);
//       }
//     })
//   }

//   const getPropertyDocuments = () => {
//     setPropertyDocuments({} as EngagedPropertyDocumentsInterface);
//     getEngagedPropertyDocs.mutate(id, {
//       onSuccess: (response) => {
//         if (response?.data?.data?.getUploadedDocumentsByPropertyId?.length) {
//           setPropertyDocuments(response.data?.data?.getUploadedDocumentsByPropertyId);
//         }
//       },
//       onError: (error) => {
//         console.log("Error in mutation: ", error);
//       }
//     })
//   }

//   const queryClient = useQueryClient();

//   const handleEditDocument = (documentId: string, name: string) => {
//     setFileUploading(true)
//     renameUploadedFile.mutate({ fileName: name, id: documentId }, {
//       onSuccess: (response) => {
//         if (response?.data?.data?.updateUploadedDocument?.id) {
//           getPropertyDocuments()
//           queryClient.invalidateQueries({ queryKey: [] })
//         }
//       },
//       onError: (error) => {
//         console.log("Error in mutation: ", error);
//       }
//     })
//     setFileUploading(false)
//   }

//   const handleAwsUploadResponse = async (file: any) => {
//     setFileUploading(true)
//     if (!file) {
//       return
//     }
//     try {
//       const response = await uploadNewFile(file, currentUser.id, id)
//       setFileUploading(false)
//       getPropertyDocuments()
//     }
//     catch (error: any) {
//       console.log(error?.message)
//     }
//     setFileUploading(false)
//   }

//   useEffect(() => {
//     if (id) {
//       getEngagedProperty()
//       getPropertyDocuments()
//     }
//   }, [id])

//   return (
//     <div>
//       {(!loading && !isLoading) ? (
//         <div className='grid h-full min-h-screen grid-cols-5 gap-x-6'>
//           <div className='items-between container flex h-full flex-col md:col-span-3'>
//             <div className='mb-10 flex max-h-[120px] flex-1 items-start justify-between gap-x-4'>
//               <PropertyOverview
//                 className='rounded-lg bg-black p-5 text-white md:w-[65%]'
//                 trailColor='#454545'
//                 textColor='text-white'
//                 pathColor='white'
//                 propertyId={propertyData?.propertyId || id}
//                 streetName={propertyData?.propertyName || property?.address?.unparsedAddress || ""}
//                 progress={propertyData?.propertyProgress || 0}
//                 address={propertyData?.propertyAddress || `${property?.address?.city || ''}, ${property?.address?.stateOrProvince || ''} ${property?.address?.zipCode || ''}` || ""}
//                 image={propertyData?.propertyImage || property?.media?.primaryListingImageUrl || property?.media?.photosList?.[0]?.highRes || ""}
//                 isManage={true}
//               />

//               <div className='flex h-full flex-auto  flex-col items-center justify-between'>
//                 {(agent?.[0]?.is_accepted !== "rejected" && agent?.[0]?.agent?.email) ? (
//                   <AgentCard agent={agent?.[0]} property={propertyData} />
//                 ) : (
//                   <Button
//                     asChild
//                     className='font-bold md:min-w-[150px]'
//                     roundness='full'
//                   >
//                     <Link
//                       //     href={`/start-process/${propertyData?.propertyId || id}/transaction-agreement?dashboard=true&engagementId=${propertyData?.id || ''}`}

//                       href={propertyData?.id
//                         ? `/start-process/${propertyData?.propertyId || id}/transaction-agreement?dashboard=true&engagementId=${propertyData?.id}`
//                         : `/start-process/${id}/transaction-agreement`
//                       }
//                     // href={`${userPath}/property/${propertyData?.propertyId}/add-agent?engagementId=${propertyData?.id}`}
//                     >
//                       Add Agent
//                     </Link>
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div className='space-y-10'>
//               <TransactionStatus currentStatus={currentStatus} />



//               {!offerData && !currentStatus && (
//                 <CreateOffer
//                   agentAdded={engagedProperty?.participants?.some((item: any) => "agent" in item)}
//                   agentDetail={engagedProperty?.participants?.some((item: any) => "agent" in item) && engagedProperty?.participants?.[0].agent}
//                   propertyId={engagedProperty?.propertyId}
//                 />
//               )}
//               <CreateUserOffers limit={2} />


//               {currentStatus === 'pending' && (
//                 <AwaitingAgent
//                   id={property?._id}
//                   buyerAgentAcceptance={offerData?.buyerAgentAcceptance}
//                 />
//               )}
//               {currentStatus === 'submitted' && (
//                 <OfferSubmitted propertyId={offerData?._id} />
//               )}
//               {currentStatus === 'titleAndEscrow' && (
//                 <TitleAndEscrow
//                   handleTitleEscrow={handleTitleEscrow}
//                   isLoading={isTitlEscrowLoading}
//                 />
//               )}
//               {currentStatus === 'trackingContingency' && (
//                 <TimeLine
//                   propertyId={property?._id}
//                   agentAdded={property?.buyerAgentAcceptance}
//                   financeContingency={offerData?.financeContingency}
//                   appraisalContingency={offerData?.apprasalContingency}
//                   inspectionContingency={offerData?.inspectionContingency}
//                 />
//               )}
//               {currentStatus === 'signAndClose' && <CompletedDeal />}
//             </div>
//           </div>

//           <div className='col-span-2 h-screen w-full overflow-auto h-[calc(106vh-10rem)] bg-grey-690'>
//             <PropertyTabs
//               propertyDocs={propertytDocuments}
//               handleAwsUploadResponse={handleAwsUploadResponse}
//               loading={fileUploading}
//               handleEditDocument={handleEditDocument}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className='mx-auto grid min-h-[600px] grid-cols-5 gap-x-6 px-14 py-10'>
//           <PropertyDetailLoader />
//         </div>
//       )}
//     </div>
//   );
// }

// export default PropertyDetailLayout;

// type CreateOfferProp = {
//   agentAdded: boolean;
//   propertyId: string;
//   agentDetail: any
// };

// const CreateOffer = ({ agentAdded, propertyId, agentDetail }: CreateOfferProp) => {
//   const { userPath } = useCurrentUser();
//   return (
//     <div className='mt-10 flex w-full flex-col gap-6 text-center'>
//       <h2 className='text-3xl font-[500]'>Start by creating an offer</h2>

//       <TooltipProvider>
//         <Tooltip>
//           <TooltipTrigger>
//             <Button
//               className='w-[12.5rem] px-8'
//               disabled={!agentAdded}
//               roundness='full'
//             >
//               <Link
//                 href={
//                   !agentAdded
//                     ? ''
//                     : `${userPath}/property/${propertyId}/offer/create`
//                 }
//                 onClick={(e) => {
//                   if (!agentAdded) {
//                     e.preventDefault();
//                   }
//                 }}
//               >
//                 Make Offer
//               </Link>
//             </Button>
//           </TooltipTrigger>
//           {!agentAdded && (
//             <TooltipContent
//               sideOffset={5}
//               className='w-68 rounded-lg border-none px-0 py-0'
//             >
//               <div className='relative'>
//                 <p className='rounded-lg bg-grey-880 px-8 py-3 text-center text-[0.563rem] text-black'>
//                   Add an agent to this property to activate button
//                 </p>
//               </div>
//             </TooltipContent>
//           )}
//         </Tooltip>
//       </TooltipProvider>
//     </div>
//   );
// };

// const TitleAndEscrow = ({
//   handleTitleEscrow,
//   isLoading,
// }: {
//   handleTitleEscrow: () => void;
//   isLoading: boolean;
// }) => {
//   return (
//     <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>
//         A Title Company will be in touch
//       </h2>

//       <div className='flex items-center justify-center gap-x-8'>
//         <AddCoBuyer variant='outline' btnText='Add Co-buyer' />

//         <Button
//           className='w-[12.5rem] px-8'
//           disabled={isLoading}
//           onClick={handleTitleEscrow}
//           roundness='full'
//         >
//           Proceed
//         </Button>
//       </div>
//     </div>
//   );
// };

// const OfferSubmitted = ({ propertyId }: { propertyId: string }) => {
//   const { userPath } = useCurrentUser();

//   return (
//     <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>
//         Offer has been submitted to seller
//       </h2>

//       <div className='flex items-center justify-center gap-x-8'>
//         <Button asChild className={cn('w-[12.5rem] px-8')} roundness='full'>
//           <Link href={`${userPath}/property/${propertyId}/offer/preview`}>
//             View Offer
//           </Link>
//         </Button>
//       </div>
//     </div>
//   );
// };

// const CompletedDeal = () => {
//   return (
//     <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>Almost time to Celebrate!</h2>

//       <div className='flex items-center justify-center gap-x-8'>
//         <Button roundness='full' className='w-[12.5rem] px-8'>
//           Confirm
//         </Button>
//       </div>
//     </div>
//   );
// };

// const AwaitingAgent = ({
//   buyerAgentAcceptance,
//   id,
// }: {
//   buyerAgentAcceptance: string;
//   id: string;
// }) => {
//   const { userPath } = useCurrentUser();

//   return (
//     <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>
//         Waiting for your agent to submit
//       </h2>
//       <Button
//         disabled={!buyerAgentAcceptance}
//         className='w-[12.5rem] px-8'
//         asChild
//         roundness='full'
//       >
//         <Link href={`${userPath}/property/${id}/offer/preview`}>
//           View Offer
//         </Link>
//       </Button>
//     </div>
//   );
// };

// interface TimeLineProps {
//   financeContingency: Contingency;
//   appraisalContingency: Contingency;
//   inspectionContingency: Contingency;
//   agentAdded: boolean;
//   propertyId: string;
// }
// const TimeLine = ({
//   financeContingency,
//   appraisalContingency,
//   inspectionContingency,

//   propertyId,
// }: TimeLineProps) => {
//   const { userPath } = useCurrentUser();

//   return (
//     <section className='space-y-8'>
//       <div className='flex items-center justify-between'>
//         <div>
//           <p className='text-3xl font-semibold capitalize'>
//             {financeContingency?.unit === 'days'
//               ? `${financeContingency?.amount} days left`
//               : financeContingency?.unit || 'waived'}
//           </p>
//           <p className='flex items-center justify-center gap-x-2 text-center text-sm'>
//             <span className='text-grey-670'>Finance</span>
//             <span className='text-sm'>
//               <Info height={16} width={16} color='#e8804c' />
//             </span>
//           </p>
//         </div>

//         <div>
//           <p className='text-3xl font-semibold capitalize'>
//             {appraisalContingency?.unit === 'days'
//               ? `${appraisalContingency.amount} days left`
//               : appraisalContingency?.unit || 'waived'}
//           </p>
//           <p className='flex items-center justify-center gap-x-2 text-center text-sm'>
//             <span className='text-grey-670'>Appraisal</span>
//             <span className='text-sm'>
//               <Info height={16} width={16} color='#e8804c' />
//             </span>
//           </p>
//         </div>

//         <div>
//           <p className='text-3xl font-semibold capitalize'>
//             {' '}
//             {inspectionContingency?.unit === 'days'
//               ? `${inspectionContingency?.amount} days left`
//               : inspectionContingency?.unit || 'waived'}
//           </p>
//           <p className='flex items-center justify-center gap-x-2 text-center text-sm'>
//             <span className='text-grey-670'>Inspection </span>
//             <span className='text-sm'>
//               <Info height={16} width={16} color='#e8804c' />
//             </span>
//           </p>
//         </div>
//       </div>

//       <div className='flex items-center justify-center gap-x-8 py-6'>
//         <Button className='w-[12.5rem] px-8' variant='outline' roundness='full'>
//           <Link href={`${userPath}/property/${propertyId}/offer/create`}>
//             Edit Offer
//           </Link>
//         </Button>

//         <Button className='w-[12.5rem] px-8' roundness='full'>
//           Complete
//         </Button>
//       </div>
//     </section>
//   );
// };

// const TransactionStatus: React.FC<{ currentStatus: OfferStatusEnum }> = ({
//   currentStatus,
// }) => {
//   const transactionStates = [
//     'Send Offer',
//     'Title and Escrow',
//     'Track Contingencies',
//     'Sign and Close',
//   ];

//   const setWidth = () => {
//     switch (currentStatus) {
//       case OfferStatusEnum.pending:
//       case OfferStatusEnum.submitted:
//         return '0%';
//       case OfferStatusEnum.titleAndEscrow:
//         return '32%';
//       case OfferStatusEnum.trackingContingency:
//         return '64%';
//       case OfferStatusEnum.signAndClose:
//         return '100%';
//       default:
//         return '0%';
//     }
//   };

//   return (
//     <div className='relative my-10 flex-1 text-grey-610'>
//       <div
//         className='absolute -top-[1px] z-10 h-[4px] bg-black'
//         style={{
//           width: setWidth(),
//         }}
//       />
//       <div
//         className={cn(
//           'relative flex  items-center justify-between border-t-[2px] border-[#EBF2F7] py-5  before:absolute before:-top-[3px] before:border-black',
//           `before:w-${setWidth()}`,
//         )}
//       >
//         <span
//           className='absolute -top-3 h-6 w-6 rounded-full bg-black'
//           style={{
//             left: setWidth(),
//           }}
//         ></span>

//         {transactionStates.map((status) => (
//           <p
//             key={status}
//             className={cn(
//               'cursor-pointer',
//               currentStatus === status
//                 ? 'font-semibold text-black'
//                 : 'text-grey-610',
//             )}
//           >
//             {status}
//           </p>
//         ))}
//       </div>
//     </div>
//   );
// };


'use client';

import { Info } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { IProperty } from '@/interfaces/property.interface';
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { cn } from '@/lib/utils';
import AgentCard from '../main/agent-card';
import PropertyOverview from '../main/property-overview';
import PropertyDetailLoader from './property-detail-loader';
import PropertyTabs from './property-tabs';

import { AddCoBuyer } from '@/components/property/manage/add-cobuyer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
import { useUpdateTitleEscrow } from '@/hooks/api/property/useUpdateTitleEscrow';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { useMortgageServiceAPI } from '@/hooks/api/auth/mortgageAPIs';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { useQueryClient } from '@tanstack/react-query';
import CreateUserOffers from './created-user-offers';

enum OfferStatusEnum {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  rejected = 'rejected',
  titleAndEscrow = 'titleAndEscrow',
  trackingContingency = 'trackingContingency',
  signAndClose = 'signAndClose',
}

export interface EngagedPropertyInterface {
  id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  propertyProgress: number;
  status: string;
}

export interface EngagedPropertyDocumentsInterface {
  id: string;
  userId: string;
  propertyId: string;
  documentName: string;
  mimeType: string;
  uploadedAt: string;
  viewUrl: string;

}

function PropertyDetailLayout() {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  const { userPath } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>();
  const [propertytDocuments, setPropertyDocuments] =
    useState<EngagedPropertyDocumentsInterface>();
  // const [fileUploading, setFileUploading] = useState(false);

  // const currentUser = useSelector(userData);
  // const engagedProperty = useSelector(
  //   (state: any) => state.property?.engagedProperty,
  // );

  const {
    getSingleProperty: { isFetching, data, isLoading },
  }: any = useGetSingleProperty(id!);
  const { getEngagedPropertyByPropertyId } = useAgentConversationApi()
  const { getEngagedPropertyDocs, uploadNewFile, editDocument } = useMortgageServiceAPI()
  const { data: offerDataResponse } = useGetPropertyOffer(id!);
  const { mutate: updateTitleEscrow, isPending: isTitlEscrowLoading } = useUpdateTitleEscrow(id);
  const property = data?.property as any;
  const offerData: any = offerDataResponse;
  const currentStatus = offerData?.currentStatus as OfferStatusEnum;
  const [fileUploading, setFileUploading] = useState(false);

  // console.log('DEBUG DASHBOARD:', { id, loading, isLoading, property, propertyData, data });
  const currentUser = useSelector(userData);
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty)
  const handleTitleEscrow = () => {
    updateTitleEscrow();
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(50);
  const agentData = engagedProperty?.participants?.filter((item: any) => item?.userId === currentUser?.id);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const agent = agentData?.filter((item: any) => item?.userId === currentUser?.id)
  const { renameUploadedFile } = useRepoManagementApi();

  const getEngagedProperty = () => {
    setPropertyData({} as EngagedPropertyInterface);
    setLoading(true);
    getEngagedPropertyByPropertyId.mutate(id, {
      onSuccess: (response) => {
        setLoading(false);
        console.log(response?.data)
        setPropertyData(response.data?.data?.getUserEngagementsByPropertyId);
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
        setLoading(false);
      }
    })
  }

  const getPropertyDocuments = () => {
    setPropertyDocuments({} as EngagedPropertyDocumentsInterface);
    getEngagedPropertyDocs.mutate(id, {
      onSuccess: (response) => {
        if (response?.data?.data?.getUploadedDocumentsByPropertyId?.length) {
          setPropertyDocuments(response.data?.data?.getUploadedDocumentsByPropertyId);
        }
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
      }
    })
  }

  const queryClient = useQueryClient();

  const handleEditDocument = (documentId: string, name: string) => {
    setFileUploading(true)
    renameUploadedFile.mutate({ fileName: name, id: documentId }, {
      onSuccess: (response) => {
        if (response?.data?.data?.updateUploadedDocument?.id) {
          getPropertyDocuments()
          queryClient.invalidateQueries({ queryKey: [] })
        }
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
      }
    })
    setFileUploading(false)
  }

  const handleAwsUploadResponse = async (file: any) => {
    setFileUploading(true)
    if (!file) {
      return
    }
    try {
      const response = await uploadNewFile(file, currentUser.id, id)
      setFileUploading(false)
      getPropertyDocuments()
    }
    catch (error: any) {
      console.log(error?.message)
    }
    setFileUploading(false)
  }

  useEffect(() => {
    if (id) {
      getEngagedProperty()
      getPropertyDocuments()
    }
  }, [id])

  return (
    <div>
      {(!loading && !isLoading) ? (
        <div className='grid h-full min-h-screen grid-cols-1 md:grid-cols-5 gap-4 md:gap-x-6'>
          <div className='items-between container flex h-full flex-col md:col-span-3 px-2 sm:px-3 md:px-4 lg:px-6'>
            <div className='mb-6 md:mb-10 flex flex-col md:flex-row items-start md:items-start justify-between gap-4 md:gap-x-4'>
              <PropertyOverview
                className='rounded-lg bg-black p-3 sm:p-5 text-white md:w-[65%] w-full'
                trailColor='#454545'
                textColor='text-white'
                pathColor='white'
                propertyId={propertyData?.propertyId || id}
                streetName={propertyData?.propertyName || property?.address?.unparsedAddress || ""}
                progress={propertyData?.propertyProgress || 0}
                address={propertyData?.propertyAddress || `${property?.address?.city || ''}, ${property?.address?.stateOrProvince || ''} ${property?.address?.zipCode || ''}` || ""}
                image={propertyData?.propertyImage || property?.media?.primaryListingImageUrl || property?.media?.photosList?.[0]?.highRes || ""}
                isManage={true}
              />

              <div className='flex h-full flex-auto flex-col md:items-center md:justify-between items-start justify-start w-full md:w-auto'>
                {(agent?.[0]?.is_accepted !== "rejected" && agent?.[0]?.agent?.email) ? (
                  <AgentCard agent={agent?.[0]} property={propertyData} />
                ) : (
                  <div className='flex w-full flex-col gap-2 sm:gap-3'>
                    <Button
                      asChild
                      className='w-full font-bold text-xs sm:text-sm'
                      roundness='full'
                    >
                      <Link
                        href={propertyData?.id
                          ? `/start-process/${propertyData?.propertyId || id}/transaction-agreement?dashboard=true&engagementId=${propertyData?.id}`
                          : `/start-process/${id}/transaction-agreement`
                        }
                      >
                        Add Agent
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant='ocreal'
                      className={cn('w-full text-xs sm:text-sm')}
                      roundness='full'
                    >
                      <Link
                        href={{
                          pathname: `/buy/${propertyData?.propertyId}/prop/preview`,
                          query: { listingId: propertyData?.listingId, propertyId: propertyData?.propertyId },
                        }}
                      >
                        Visit Property
                      </Link>
                    </Button>
                  </div>

                )}
              </div>
            </div>

            <div className='space-y-6 md:space-y-10'>
              <TransactionStatus currentStatus={currentStatus} />



              {!offerData && !currentStatus && (
                <CreateOffer
                  agentAdded={engagedProperty?.participants?.some((item: any) => "agent" in item)}
                  agentDetail={engagedProperty?.participants?.some((item: any) => "agent" in item) && engagedProperty?.participants?.[0].agent}
                  propertyId={engagedProperty?.propertyId}
                />
              )}
              <CreateUserOffers limit={2} />


              {currentStatus === 'pending' && (
                <AwaitingAgent
                  id={property?._id}
                  buyerAgentAcceptance={offerData?.buyerAgentAcceptance}
                />
              )}
              {currentStatus === 'submitted' && (
                <OfferSubmitted propertyId={offerData?._id} />
              )}
              {currentStatus === 'titleAndEscrow' && (
                <TitleAndEscrow
                  handleTitleEscrow={handleTitleEscrow}
                  isLoading={isTitlEscrowLoading}
                />
              )}
              {currentStatus === 'trackingContingency' && (
                <TimeLine
                  propertyId={property?._id}
                  agentAdded={property?.buyerAgentAcceptance}
                  financeContingency={offerData?.financeContingency}
                  appraisalContingency={offerData?.apprasalContingency}
                  inspectionContingency={offerData?.inspectionContingency}
                />
              )}
              {currentStatus === 'signAndClose' && <CompletedDeal />}
            </div>
          </div>

          <div className='col-span-1 md:col-span-2 h-auto md:h-screen w-full md:overflow-auto md:h-[calc(106vh-10rem)] bg-grey-690'>
            <PropertyTabs
              propertyDocs={propertytDocuments}
              handleAwsUploadResponse={handleAwsUploadResponse}
              loading={fileUploading}
              handleEditDocument={handleEditDocument}
            />
          </div>
        </div>
      ) : (
        <div className='mx-auto grid min-h-[600px] grid-cols-1 md:grid-cols-5 gap-4 md:gap-x-6 px-4 sm:px-6 md:px-0 py-6 md:py-10'>
          <PropertyDetailLoader />
        </div>
      )}
    </div>
  );
}

export default PropertyDetailLayout;

type CreateOfferProp = {
  agentAdded: boolean;
  propertyId: string;
  agentDetail: any
};

const CreateOffer = ({ agentAdded, propertyId, agentDetail }: CreateOfferProp) => {
  const { userPath } = useCurrentUser();
  return (
    <div className='mt-6 md:mt-10 flex w-full flex-col gap-4 md:gap-6 text-center'>
      <h2 className='text-xl sm:text-2xl md:text-3xl font-[500]'>Start by creating an offer</h2>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              className='w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm'
              disabled={!agentAdded}
              roundness='full'
            >
              <Link
                href={
                  !agentAdded
                    ? ''
                    : `${userPath}/property/${propertyId}/offer/create`
                }
                onClick={(e) => {
                  if (!agentAdded) {
                    e.preventDefault();
                  }
                }}
              >
                Make Offer
              </Link>
            </Button>
          </TooltipTrigger>
          {!agentAdded && (
            <TooltipContent
              sideOffset={5}
              className='w-68 rounded-lg border-none px-0 py-0'
            >
              <div className='relative'>
                <p className='rounded-lg bg-grey-880 px-8 py-3 text-center text-[0.563rem] text-black'>
                  Add an agent to this property to activate button
                </p>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const TitleAndEscrow = ({
  handleTitleEscrow,
  isLoading,
}: {
  handleTitleEscrow: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className='my-3 md:my-6 flex-1 text-center'>
      <h2 className='mb-4 md:mb-8 text-xl sm:text-2xl md:text-3xl font-[500]'>
        A Title Company will be in touch
      </h2>

      <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-x-8'>
        <AddCoBuyer variant='outline' btnText='Add Co-buyer' />

        <Button
          className='w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm'
          disabled={isLoading}
          onClick={handleTitleEscrow}
          roundness='full'
        >
          Proceed
        </Button>
      </div>
    </div>
  );
};

const OfferSubmitted = ({ propertyId }: { propertyId: string }) => {
  const { userPath } = useCurrentUser();

  return (
    <div className='my-3 md:my-6 flex-1 text-center'>
      <h2 className='mb-4 md:mb-8 text-xl sm:text-2xl md:text-3xl font-[500]'>
        Offer has been submitted to seller
      </h2>

      <div className='flex items-center justify-center gap-2 md:gap-x-8'>
        <Button asChild className={cn('w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm')} roundness='full'>
          <Link href={`${userPath}/property/${propertyId}/offer/preview`}>
            View Offer
          </Link>
        </Button>
      </div>
    </div>
  );
};

const CompletedDeal = () => {
  return (
    <div className='my-3 md:my-6 flex-1 text-center'>
      <h2 className='mb-4 md:mb-8 text-xl sm:text-2xl md:text-3xl font-[500]'>Almost time to Celebrate!</h2>

      <div className='flex items-center justify-center gap-2 md:gap-x-8'>
        <Button roundness='full' className='w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm'>
          Confirm
        </Button>
      </div>
    </div>
  );
};

const AwaitingAgent = ({
  buyerAgentAcceptance,
  id,
}: {
  buyerAgentAcceptance: string;
  id: string;
}) => {
  const { userPath } = useCurrentUser();

  return (
    <div className='my-3 md:my-6 flex-1 text-center'>
      <h2 className='mb-4 md:mb-8 text-xl sm:text-2xl md:text-3xl font-[500]'>
        Waiting for your agent to submit
      </h2>
      <Button
        disabled={!buyerAgentAcceptance}
        className='w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm'
        asChild
        roundness='full'
      >
        <Link href={`${userPath}/property/${id}/offer/preview`}>
          View Offer
        </Link>
      </Button>
    </div>
  );
};

interface TimeLineProps {
  financeContingency: Contingency;
  appraisalContingency: Contingency;
  inspectionContingency: Contingency;
  agentAdded: boolean;
  propertyId: string;
}
const TimeLine = ({
  financeContingency,
  appraisalContingency,
  inspectionContingency,

  propertyId,
}: TimeLineProps) => {
  const { userPath } = useCurrentUser();

  return (
    <section className='space-y-4 md:space-y-8'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-8'>
        <div className='text-center sm:text-left'>
          <p className='text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold capitalize'>
            {financeContingency?.unit === 'days'
              ? `${financeContingency?.amount} days left`
              : financeContingency?.unit || 'waived'}
          </p>
          <p className='flex items-center justify-center sm:justify-start gap-x-1 sm:gap-x-2 text-center text-xs sm:text-sm'>
            <span className='text-grey-670'>Finance</span>
            <span className='text-sm'>
              <Info height={14} width={14} className='sm:h-4 sm:w-4' color='#e8804c' />
            </span>
          </p>
        </div>

        <div className='text-center sm:text-left'>
          <p className='text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold capitalize'>
            {appraisalContingency?.unit === 'days'
              ? `${appraisalContingency.amount} days left`
              : appraisalContingency?.unit || 'waived'}
          </p>
          <p className='flex items-center justify-center sm:justify-start gap-x-1 sm:gap-x-2 text-center text-xs sm:text-sm'>
            <span className='text-grey-670'>Appraisal</span>
            <span className='text-sm'>
              <Info height={14} width={14} className='sm:h-4 sm:w-4' color='#e8804c' />
            </span>
          </p>
        </div>

        <div className='text-center sm:text-left'>
          <p className='text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold capitalize'>
            {' '}
            {inspectionContingency?.unit === 'days'
              ? `${inspectionContingency?.amount} days left`
              : inspectionContingency?.unit || 'waived'}
          </p>
          <p className='flex items-center justify-center sm:justify-start gap-x-1 sm:gap-x-2 text-center text-xs sm:text-sm'>
            <span className='text-grey-670'>Inspection </span>
            <span className='text-sm'>
              <Info height={14} width={14} className='sm:h-4 sm:w-4' color='#e8804c' />
            </span>
          </p>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-x-8 py-3 md:py-6'>
        <Button className='w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm' variant='outline' roundness='full'>
          <Link href={`${userPath}/property/${propertyId}/offer/create`}>
            Edit Offer
          </Link>
        </Button>

        <Button className='w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2 text-xs sm:text-sm' roundness='full'>
          Complete
        </Button>
      </div>
    </section>
  );
};

const TransactionStatus: React.FC<{ currentStatus: OfferStatusEnum }> = ({
  currentStatus,
}) => {
  const transactionStates = [
    'Send Offer',
    'Title and Escrow',
    'Track Contingencies',
    'Sign and Close',
  ];

  const setWidth = () => {
    switch (currentStatus) {
      case OfferStatusEnum.pending:
      case OfferStatusEnum.submitted:
        return '0%';
      case OfferStatusEnum.titleAndEscrow:
        return '32%';
      case OfferStatusEnum.trackingContingency:
        return '64%';
      case OfferStatusEnum.signAndClose:
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <div className='relative my-6 md:my-10 flex-1 text-grey-610'>
      {/* Mobile Layout */}
      <div className='md:hidden flex gap-4'>
        {/* Vertical Progress Bar - Left */}
        <div className='relative w-1 bg-[#EBF2F7] h-24 sm:h-32 flex-shrink-0'>
          <div
            className='absolute -left-[2px] top-0 z-10 w-[4px] bg-black transition-all'
            style={{
              height: setWidth(),
            }}
          />
          <span
            className='absolute -left-3 top-0 h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-black'
            style={{
              transform: 'translateY(-50%)',
            }}
          ></span>
        </div>

        {/* Text Items - Right */}
        <div className='flex flex-col justify-between py-1 sm:py-2 gap-1 sm:gap-2'>
          {transactionStates.map((status) => (
            <p
              key={status}
              className={cn(
                'cursor-pointer text-xs sm:text-sm whitespace-nowrap',
                currentStatus === status
                  ? 'font-semibold text-black'
                  : 'text-grey-610',
              )}
            >
              {status}
            </p>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className='hidden md:block'>
        <div
          className='absolute -top-[1px] z-10 h-[4px] bg-black'
          style={{
            width: setWidth(),
          }}
        />
        <div
          className={cn(
            'relative flex items-center justify-between border-t-[2px] border-[#EBF2F7] py-5 before:absolute before:-top-[3px] before:border-black',
            `before:w-${setWidth()}`,
          )}
        >
          <span
            className='absolute -top-3 h-6 w-6 rounded-full bg-black'
            style={{
              left: setWidth(),
            }}
          ></span>

          {transactionStates.map((status) => (
            <p
              key={status}
              className={cn(
                'cursor-pointer text-base',
                currentStatus === status
                  ? 'font-semibold text-black'
                  : 'text-grey-610',
              )}
            >
              {status}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
