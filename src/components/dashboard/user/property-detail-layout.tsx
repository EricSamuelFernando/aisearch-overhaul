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
//         <div className='grid h-full min-h-screen grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-5'>
//           <div className='items-between w-full flex h-full px-4 flex-col lg:col-span-3'>
//             <div className='mb-8 flex flex-col lg:flex-row items-start justify-between gap-x-4'>
//               <PropertyOverview
//                 className='rounded-lg bg-black p-5 text-white'
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

//               <div className='flex h-full flex-auto flex-col items-center justify-between mt-4 w-full lg:mx-auto lg:w-auto'>
//                 {(agent?.[0]?.is_accepted !== "rejected" && agent?.[0]?.agent?.email) ? (
//                   <AgentCard agent={agent?.[0]} property={propertyData} />
//                 ) : (
//                   <Button
//                     asChild
//                     className='font-bold lg:min-w-[150px]'
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

//           <div className='w-full bg-grey-690 overflow-auto lg:col-span-2 lg:sticky lg:top-24'>
//             <PropertyTabs
//               propertyDocs={propertytDocuments}
//               handleAwsUploadResponse={handleAwsUploadResponse}
//               loading={fileUploading}
//               handleEditDocument={handleEditDocument}
//             />
//           </div>
//         </div>
//       ) : (
//         <div className='mx-auto grid min-h-[600px] grid-cols-1 gap-x-6 px-4 py-10 lg:grid-cols-5 lg:px-14'>
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
//               className='w-full sm:w-[12.5rem] px-4 sm:px-8'
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
//         <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>
//         A Title Company will be in touch
//       </h2>

//       <div className='flex items-center justify-center gap-x-8'>
//         <AddCoBuyer variant='outline' btnText='Add Co-buyer' />

//         <Button
//           className='w-full sm:w-[12.5rem] px-4 sm:px-8'
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
//       <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>
//         Offer has been submitted to seller
//       </h2>

//       <div className='flex items-center justify-center gap-x-8'>
//         <Button asChild className={cn('w-full sm:w-[12.5rem] px-4 sm:px-8')} roundness='full'>
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
//       <div className='my-6 flex-1 text-center'>
//       <h2 className='mb-8 text-3xl font-[500]'>Almost time to Celebrate!</h2>

//       <div className='flex items-center justify-center gap-x-8'>
//         <Button roundness='full' className='w-full sm:w-[12.5rem] px-4 sm:px-8'>
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

//       <div className='flex flex-col sm:flex-row items-center justify-center gap-4 py-6'>
//         <Button className='w-full sm:w-[12.5rem] px-4 sm:px-8' variant='outline' roundness='full'>
//           <Link href={`${userPath}/property/${propertyId}/offer/create`}>
//             Edit Offer
//           </Link>
//         </Button>

//         <Button className='w-full sm:w-[12.5rem] px-4 sm:px-8' roundness='full'>
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
//     <div className='relative my-6 w-full text-grey-610'>
//       <div className='absolute -top-[1px] z-10 h-[4px] bg-black' style={{ width: setWidth() }} />

//         <div className='relative w-full border-t-[2px] border-[#EBF2F7] py-2'>
//         <span className='absolute -top-2 h-6 w-6 rounded-full bg-black' style={{ left: setWidth() }} />

//         <div className='flex w-full'>
//           {transactionStates.map((status) => (
//             <p
//               key={status}
//               className={cn(
//                 'cursor-pointer text-sm sm:text-base text-center flex-1 min-w-0',
//                 currentStatus === status ? 'font-semibold text-black' : 'text-grey-610',
//               )}
//             >
//               {status}
//             </p>
//           ))}
//         </div>
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
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
import { useUpdateTitleEscrow } from '@/hooks/api/property/useUpdateTitleEscrow';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { useMortgageServiceAPI } from '@/hooks/api/auth/mortgageAPIs';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
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
  const { propertyId: id } = useParams<{ propertyId: string }>();
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<EngagedPropertyInterface>();
  const [propertytDocuments, setPropertyDocuments] =
    useState<EngagedPropertyDocumentsInterface>();
  const [fileUploading, setFileUploading] = useState(false);

  const currentUser = useSelector(userData);
  const engagedProperty = useSelector(
    (state: any) => state.property?.engagedProperty,
  );

  const {
    getSingleProperty: { data, isLoading },
  }: any = useGetSingleProperty(id!);

  const { getEngagedPropertyByPropertyId } = useAgentConversationApi();
  const { getEngagedPropertyDocs, uploadNewFile } =
    useMortgageServiceAPI();
  const { data: offerDataResponse } = useGetPropertyOffer(id!);
  const { mutate: updateTitleEscrow, isPending } =
    useUpdateTitleEscrow(id);
  const { renameUploadedFile } = useRepoManagementApi();
  const queryClient = useQueryClient();

  const property = data?.property as any;
  const offerData: any = offerDataResponse;
  const currentStatus = offerData?.currentStatus as OfferStatusEnum;

  const agent = engagedProperty?.participants?.filter(
    (item: any) => item?.userId === currentUser?.id,
  );

  const getEngagedProperty = () => {
    setLoading(true);
    getEngagedPropertyByPropertyId.mutate(id, {
      onSuccess: (res) => {
        setPropertyData(res.data?.data?.getUserEngagementsByPropertyId);
        setLoading(false);
      },
      onError: () => setLoading(false),
    });
  };

  const getPropertyDocuments = () => {
    getEngagedPropertyDocs.mutate(id, {
      onSuccess: (res) => {
        setPropertyDocuments(
          res?.data?.data?.getUploadedDocumentsByPropertyId,
        );
      },
    });
  };

  const handleEditDocument = (documentId: string, name: string) => {
    setFileUploading(true);
    renameUploadedFile.mutate(
      { fileName: name, id: documentId },
      {
        onSuccess: () => {
          getPropertyDocuments();
          queryClient.invalidateQueries({ queryKey: [] });
          setFileUploading(false);
        },
      },
    );
  };

  const handleAwsUploadResponse = async (file: any) => {
    if (!file) return;
    setFileUploading(true);
    await uploadNewFile(file, currentUser.id, id);
    getPropertyDocuments();
    setFileUploading(false);
  };

  useEffect(() => {
    if (id) {
      getEngagedProperty();
      getPropertyDocuments();
    }
  }, [id]);

  return (
    <div>
      {!loading && !isLoading ? (
        <div className="grid min-h-screen grid-cols-1 gap-6 lg:grid-cols-5">
          {/* LEFT */}
          <div className="flex flex-col px-4 lg:col-span-3">
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:justify-between">
              <PropertyOverview
                className="rounded-lg bg-black p-5 text-white"
                trailColor="#454545"
                textColor="text-white"
                pathColor="white"
                propertyId={propertyData?.propertyId || id}
                streetName={
                  propertyData?.propertyName ||
                  property?.address?.unparsedAddress ||
                  ''
                }
                progress={propertyData?.propertyProgress || 0}
                address={`${property?.address?.city || ''}, ${property?.address?.stateOrProvince || ''
                  } ${property?.address?.zipCode || ''}`}
                image={
                  propertyData?.propertyImage ||
                  property?.media?.primaryListingImageUrl ||
                  property?.media?.photosList?.[0]?.highRes ||
                  ''
                }
                isManage
              />

              <div className="flex w-full flex-col items-center justify-center lg:w-auto">
                {agent?.[0]?.agent?.email ? (
                  <AgentCard agent={agent?.[0]} property={propertyData} />
                ) : (
                  <Button roundness="full">
                    <Link href={`/start-process/${id}/transaction-agreement`}>
                      Add Agent
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-10">
              <TransactionStatus currentStatus={currentStatus} />

              {!offerData && !currentStatus && (
                <CreateOffer
                  agentAdded={!!agent?.length}
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
                  handleTitleEscrow={updateTitleEscrow}
                  isLoading={isPending}
                />
              )}

              {currentStatus === 'trackingContingency' && (
                <TimeLine
                  propertyId={property?._id}
                  financeContingency={offerData?.financeContingency}
                  appraisalContingency={offerData?.apprasalContingency}
                  inspectionContingency={offerData?.inspectionContingency}
                />
              )}

              {currentStatus === 'signAndClose' && <CompletedDeal />}
            </div>
          </div>

          {/* RIGHT – TABS (COLUMN ON MOBILE & TABLET) */}
          <div className="flex flex-col bg-grey-690 lg:col-span-2 lg:sticky lg:top-24">
            <PropertyTabs
              propertyDocs={propertytDocuments}
              handleAwsUploadResponse={handleAwsUploadResponse}
              loading={fileUploading}
              handleEditDocument={handleEditDocument}
            />
          </div>
        </div>
      ) : (
        <div className="px-4 py-10">
          <PropertyDetailLoader />
        </div>
      )}
    </div>
  );
}

export default PropertyDetailLayout;

/* ---------------- SUB COMPONENTS ---------------- */

const CreateOffer = ({
  agentAdded,
  propertyId,
}: {
  agentAdded: boolean;
  propertyId: string;
}) => {
  const { userPath } = useCurrentUser();
  return (
    <div className="mt-10 text-center">
      <h2 className="mb-6 text-3xl font-medium">Start by creating an offer</h2>
      <Button
        disabled={!agentAdded}
        className="w-full sm:w-[12.5rem]"
        roundness="full"
      >
        <Link href={`${userPath}/property/${propertyId}/offer/create`}>
          Make Offer
        </Link>
      </Button>
    </div>
  );
};

const TitleAndEscrow = ({ handleTitleEscrow, isLoading }: any) => (
  <div className="my-6 text-center">
    <h2 className="mb-8 text-3xl font-medium">
      A Title Company will be in touch
    </h2>
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <AddCoBuyer variant="outline" btnText="Add Co-buyer" />
      <Button
        onClick={handleTitleEscrow}
        disabled={isLoading}
        className="w-full sm:w-[12.5rem]"
        roundness="full"
      >
        Proceed
      </Button>
    </div>
  </div>
);

const OfferSubmitted = ({ propertyId }: { propertyId: string }) => {
  const { userPath } = useCurrentUser();
  return (
    <div className="text-center">
      <h2 className="mb-8 text-3xl font-medium">
        Offer has been submitted to seller
      </h2>
      <Button className="w-full sm:w-[12.5rem]" roundness="full">
        <Link href={`${userPath}/property/${propertyId}/offer/preview`}>
          View Offer
        </Link>
      </Button>
    </div>
  );
};

const AwaitingAgent = ({ id, buyerAgentAcceptance }: any) => {
  const { userPath } = useCurrentUser();
  return (
    <div className="text-center">
      <h2 className="mb-8 text-3xl font-medium">
        Waiting for your agent to submit
      </h2>
      <Button
        disabled={!buyerAgentAcceptance}
        className="w-full sm:w-[12.5rem]"
        roundness="full"
      >
        <Link href={`${userPath}/property/${id}/offer/preview`}>
          View Offer
        </Link>
      </Button>
    </div>
  );
};

const CompletedDeal = () => (
  <div className="text-center">
    <h2 className="mb-8 text-3xl font-medium">Almost time to Celebrate!</h2>
    <Button className="w-full sm:w-[12.5rem]" roundness="full">
      Confirm
    </Button>
  </div>
);

/* -------- PROGRESS BAR (UNCHANGED LOGIC) -------- */

const TimeLine = ({ propertyId, financeContingency, appraisalContingency, inspectionContingency }: any) => {
  const { userPath } = useCurrentUser();
  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-2xl font-semibold sm:text-3xl">
            {financeContingency?.unit === 'days'
              ? `${financeContingency?.amount} days left`
              : financeContingency?.unit || 'waived'}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-grey-670">
            Finance
            <Info height={16} width={16} color="#e8804c" />
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold sm:text-3xl">
            {appraisalContingency?.unit === 'days'
              ? `${appraisalContingency?.amount} days left`
              : appraisalContingency?.unit || 'waived'}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-grey-670">
            Appraisal
            <Info height={16} width={16} color="#e8804c" />
          </p>
        </div>
        <div>
          <p className="text-2xl font-semibold sm:text-3xl">
            {inspectionContingency?.unit === 'days'
              ? `${inspectionContingency?.amount} days left`
              : inspectionContingency?.unit || 'waived'}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-grey-670">
            Inspection
            <Info height={16} width={16} color="#e8804c" />
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:justify-center">
        <Button className="w-full sm:w-[12.5rem]" variant="outline" roundness="full">
          <Link href={`${userPath}/property/${propertyId}/offer/create`}>
            Edit Offer
          </Link>
        </Button>
        <Button className="w-full sm:w-[12.5rem]" roundness="full">
          Complete
        </Button>
      </div>
    </section>
  );
};

const TransactionStatus = ({ currentStatus }: any) => {
  const transactionStates = [
    'Send Offer',
    'Title and Escrow',
    'Track Contingencies',
    'Sign and Close',
  ];

  const setWidth = () => {
    switch (currentStatus) {
      case 'titleAndEscrow':
        return '32%';
      case 'trackingContingency':
        return '64%';
      case 'signAndClose':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <div className="relative my-6 w-full">
      <div
        className="absolute -top-[1px] h-[4px] bg-black"
        style={{ width: setWidth() }}
      />
      <div className="relative border-t-2 border-[#EBF2F7] py-3">
        <span
          className="absolute -top-2 h-6 w-6 rounded-full bg-black"
          style={{ left: setWidth() }}
        />
        <div className="flex text-sm sm:text-base">
          {transactionStates.map((s) => (
            <p key={s} className="flex-1 text-center">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};