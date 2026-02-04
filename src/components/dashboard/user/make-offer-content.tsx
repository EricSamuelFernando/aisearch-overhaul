'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { FileWithPath } from '@/interfaces/file.interface';
import { IProperty } from '@/interfaces/property.interface';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { error, success } from '@/components/alert/notify';
import {
  useGetSingleProperty,
  usePropertyApi,
} from '@/hooks/api/property/usePropertyApi';
import { storeCookie } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/shared/constants/env';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
import { Button } from '@/components/ui/button';
import { useClaimsFormContext } from '../../../providers/claim-context';
import { Skeleton } from '../../ui/skeleton';
import SummarySection from './summary';
import { Checkbox } from '@/components/ui/checkbox';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import DocumentsUpload from '@/components/customs/documents-preview';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useAppSelector } from '@/lib/hook';
import { useDispatch, useSelector } from 'react-redux';
import { property } from 'lodash';
import { userData } from '@/slices/auth/auth.slice';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { Loader } from '@mantine/core';
import { SocketContext } from '@/providers/socket.context';
import { message } from '@public/assets/icons';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';

const Editor = dynamic(() => import('@/components/custom-editor'), {
  ssr: true,
});

function MakeOfferContent() {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();

  const [isUploading, setIsUploading] = useState(false);
  const { socket, state, setState } = useContext(SocketContext)
  const currentUser = useSelector(userData);
  const params = useSearchParams()
  const { engagedProperty } = useAppSelector(state => state.property)
  const { form, isFormInitialized } = useClaimsFormContext();
  const { createOfferMutation } = usePropertyApi();
  const dispatch = useDispatch();
  const { selectedThreadInfo } = useAppSelector((state) => state.chat)

  console.log("Offer", selectedThreadInfo)

  const [documents, setDocuments] = useState<FileWithPath[]>([]);

  const { useCreatePropertyOffer, uploadNewFile } = usePropertyServiceAPI()
  const { createRepoWithUploadedFile } = useRepoManagementApi();

  const handleFileUpload = async () => {
    if (!documents.length) return;

    const uploadPromises = documents.map(async (file) => {
      try {
        const { key } = await uploadNewFile(file, currentUser.id, engagedProperty?.propertyId);

        const payload = {
          uploadedFile: {
            fileName: file.name,
            fileSize: file.size,
            fileUrl: key,
            fileType: file.type
          },
          createRepoManagementInput: {
            name: 'proof-document',
            url: '/proof-document',
            propertyId: engagedProperty?.propertyId,
            createdBy: currentUser.id,
            parentFolderName: 'proof-document',
            isArchived: false
          }
        };

        return new Promise<void>((resolve, reject) => {
          mutate(payload, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });

      } catch (err) {
        console.error('File upload failed:', file.name, err);
        throw err;
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        error({ message: `Failed to upload ${documents[index].name}` });
      }
    });
  };

  const { mutate: createOffer, isPending: offerPending } = useCreatePropertyOffer()

  const { propertyProgressMutation } = usePropertyAPI()

  const requestType = params?.get('type')

  const { data: offerDataResponse } = useGetPropertyOffer(id!);

  const { selectedOffer } = useAppSelector(state => state.property)

  const offerData: any = requestType === "edit" ? selectedOffer : "";

  const router = useRouter();
  const [offers, setOffers] = useState([])

  const { getOffersPropertyByEngagementId } = usePropertyServiceAPI();

  const { mutate, isPending, isError } = propertyProgressMutation()

  const addFileToDocuments = (file: File) => {
    setDocuments((prevDocuments) => [...prevDocuments, file]);
  };

  const getEngagedProperty = () => {

    getOffersPropertyByEngagementId.mutate(engagedProperty?.id, {
      onSuccess: (response) => {

        setOffers(response?.data?.data?.getPropertyOfferByEngagementId);
      },
      onError: (error) => {
        console.log('Error in mutation: ', error);

      }
    });
  };

  console.log("Documents", documents)

  const offerDataDocuments = offerData?.documents;

  useEffect(() => {
    if (offerData?.documentsIds) {
      setDocuments(offerData.documentsIds);
    }
  }, [offerData]);

  useEffect(() => {
    getEngagedProperty()
  }, [])

  const buttonLabel = 'Submit';

  const filesNames = documents.map((document) => document.name);

  // const handleSubmit = async () => {
  //   const date = new Date();

  //   date.setDate(date.getDate() + 30);
  //   const expiryNewDate = date.toLocaleString()
  //   const mapToDto = (): any => ({
  //     userId: currentUser?.id,
  //     propertyEngagementId: engagedProperty?.id || '5697c782-127b-494a-a07b-c9e713cd0d11',
  //     price: form.values.offerPrice?.amount || offerData?.price,
  //     financeType: form.values.financeType || offerData?.financeType,
  //     downPayment: form.values.downPayment?.amount || offerData?.downPayment,
  //     cashAmount: form.values.loanAmount?.amount || offerData?.cashAmount ,
  //     coverLetter: form.values.coverLetter || offerData?.coverLetter,
  //     specialTerms: form.values.specialTerms || offerData?.specialTerms,
  //     financeContingency: form.values.financeContingency?.unit || '',
  //     financeContingencyDays: form.values.financeContingency?.amount || offerData?.financeContingencyDays,
  //     appraisalContingency: form.values.apprasalContingency?.unit || '',
  //     appraisalContingencyDays: form.values.apprasalContingency?.amount || offerData?.appraisalContingencyDays,
  //     inspectionContingency: form.values.inspectionContingency?.unit || '',
  //     inspectionContingencyDays: form.values.inspectionContingency?.amount || offerData?.inspectionContingencyDays,
  //     closeEscrow: form.values.closeEscrow?.unit || '',
  //     propertyId: engagedProperty?.propertyId,
  //     listingId: "" + engagedProperty?.listingId,
  //     closeEscrowDays: form.values.closeEscrow?.amount || offerData?.closeEscrowDays ,
  //     expiryDate: expiryNewDate || new Date() || '',
  //     documentIds: [],
  //     isSeller: false,
  //     isBuyer: false
  //   })
  //   const data = mapToDto()
  //   createOffer(data, {
  //     onSuccess: (data: any) => {
  //       // mutate({
  //       //   progress: parseInt(engagedProperty?.propertyProgress) + 10,
  //       //   id: engagedProperty?.id
  //       // })
  //       success({message:'Offer Created Succesfully'})

  //      let notificationMessage =  requestType === "edit" ?  `Offer is editted by ${currentUser?.firstname} ${currentUser?.lastname}`    : `New Offer is created by ${currentUser?.firstname} ${currentUser?.lastname}`

  //       if (socket) {
  //         const payload = {
  //           message: notificationMessage,
  //           createdAt: new Date().toISOString(),
  //           threadId: selectedThreadInfo?.id || "",
  //           senderId: currentUser?.id,
  //           messageType:"notification",
  //           receiverId:'851524d2-7a93-4d06-b5d4-088a847f3f4a',
  //           roomId: selectedThreadInfo?.roomId
  //         }

  //         console.log(payload)
  //        // socket.emit('sendThreadNotification', payload)

  //         socket?.emit(
  //           "sendThreadNotification",
  //           payload,
  //           {
  //             reciepent: '851524d2-7a93-4d06-b5d4-088a847f3f4a',
  //             userName: currentUser?.firstName + " " + currentUser?.lastName,
  //           },
  //           null,
  //         )
  //       }
  //       // dispatch(setEngagedProperty({
  //       //   ...engagedProperty,
  //       //   propertyProgress: parseInt(engagedProperty?.propertyProgress) + 10
  //       // }))

  //       router.push(`/property/${id}/pre-approval`)
  //     }
  //   })
  // }


  // const handleSubmit = async () => {
  //   console.log(socket , currentUser)
  //   if (socket) {
  //     const payload = {
  //       message: `New Offer is created by ${currentUser?.firstname} ${currentUser?.lastname}`,
  //       createdAt: new Date().toISOString(),
  //       threadId: selectedThreadInfo?.id || "",
  //       senderId: currentUser?.id,
  //       messageType:"notification",
  //       receiverId:'851524d2-7a93-4d06-b5d4-088a847f3f4a',
  //       roomId: selectedThreadInfo?.roomId
  //     }

  //     console.log(payload)
  //    // socket.emit('sendThreadNotification', payload)

  //     socket?.emit(
  //       "sendThreadNotification",
  //       payload,
  //       {
  //         reciepent: '851524d2-7a93-4d06-b5d4-088a847f3f4a',
  //         userName: currentUser?.firstName + " " + currentUser?.lastName,
  //       },
  //       null,
  //     )
  //   }
  // }

  // if (loading || !isFormInitialized) {
  //   return <MakePropertyLoader />;
  // }

  console.log(engagedProperty?.participants?.[0]?.agent?.id)


  const handleSubmit = async () => {
    if (!documents.length) {
      error({ message: "Please upload at least one document." });
      return;
    }
    try {
      setIsUploading(true)
      const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Define allowed file types

      const documentUploadResults = await Promise.all(
        documents.map(async file => {
          if (allowedFileTypes.includes(file.type) || true) { // Relaxed validation
            const uploadResult = await uploadNewFile(file, currentUser.id, engagedProperty?.propertyId);

            if (uploadResult?.key) {
              // Create Repo Entry for "Other Docs"
              const payload = {
                uploadedFile: {
                  fileName: file.name,
                  fileSize: file.size,
                  fileUrl: uploadResult.key,
                  fileType: file.type
                },
                createRepoManagementInput: {
                  name: 'proof-document',
                  url: '/proof-document',
                  propertyId: engagedProperty?.propertyId,
                  createdBy: currentUser.id,
                  parentFolderName: 'proof-document',
                  isArchived: false
                }
              };

              try {
                await createRepoWithUploadedFile.mutateAsync(payload);
              } catch (repoError) {
                console.error("Failed to create repo entry", repoError);
              }

              return uploadResult;
            }
            return null;
          } else {
            console.log(`File type ${file.type} is not supported. Skipping upload.`);
            return null;
          }
        })
      );

      const documentIds = documentUploadResults.filter((result): result is { key: string } => result !== null && result !== undefined).map(result => result.key);

      setIsUploading(false)
      // Step 2: Build offer payload
      const date = new Date();
      date.setDate(date.getDate() + 30);
      const expiryNewDate = date.toLocaleString();

      const mapToDto = (): any => ({
        userId: currentUser?.id,
        propertyEngagementId: engagedProperty?.id || '5697c782-127b-494a-a07b-c9e713cd0d11',
        price: form.values.offerPrice?.amount || offerData?.price,
        financeType: form.values.financeType || offerData?.financeType,
        downPayment: form.values.downPayment?.amount || offerData?.downPayment,
        cashAmount: form.values.loanAmount?.amount || offerData?.cashAmount,
        coverLetter: form.values.coverLetter || offerData?.coverLetter,
        specialTerms: form.values.specialTerms || offerData?.specialTerms,
        financeContingency: form.values.financeContingency?.unit || '',
        financeContingencyDays: form.values.financeContingency?.amount || offerData?.financeContingencyDays,
        appraisalContingency: form.values.apprasalContingency?.unit || '',
        appraisalContingencyDays: form.values.apprasalContingency?.amount || offerData?.appraisalContingencyDays,
        inspectionContingency: form.values.inspectionContingency?.unit || '',
        inspectionContingencyDays: form.values.inspectionContingency?.amount || offerData?.inspectionContingencyDays,
        closeEscrow: form.values.closeEscrow?.unit || '',
        propertyId: engagedProperty?.propertyId,
        listingId: "" + engagedProperty?.listingId,
        closeEscrowDays: form.values.closeEscrow?.amount || offerData?.closeEscrowDays,
        expiryDate: expiryNewDate || new Date() || '',
        documentsIds: [
          ...(
            Array.isArray(offerData?.documentsIds)
              ? offerData.documentsIds.filter(
                (v: any): v is string => typeof v === "string" && v.trim().length > 0
              )
              : []
          ),
          ...(
            Array.isArray(documentIds)
              ? documentIds.filter(
                (v: any): v is string => typeof v === "string" && v.trim().length > 0
              )
              : []
          ),
        ],

        isSeller: false,
        isBuyer: false
      });

      const data = mapToDto();

      // Step 3: Create Offer
      createOffer(data, {
        onSuccess: (data: any) => {
          success({ message: 'Offer Created Successfully' });

          const notificationMessage = requestType === "edit"
            ? `Offer is edited by ${currentUser?.firstname} ${currentUser?.lastname}`
            : `New Offer is created by ${currentUser?.firstname} ${currentUser?.lastname}`;

          if (socket) {
            const payload = {
              message: notificationMessage,
              createdAt: new Date().toISOString(),
              threadId: selectedThreadInfo?.id || "",
              senderId: currentUser?.id,
              messageType: "notification",
              receiverId: engagedProperty?.participants?.[0]?.agent?.id,
              roomId: selectedThreadInfo?.roomId
            };

            socket?.emit("sendThreadNotification", {
              ...payload,
              reciepent: engagedProperty?.participants?.[0]?.agent?.id,
              userName: currentUser?.firstName + " " + currentUser?.lastName,
            });
          }

          if (!offers?.length) {
            mutate({
              progress: parseInt(engagedProperty?.propertyProgress) + 10,
              id: engagedProperty?.id
            })
          }

          if (requestType != "edit") {
            router.push(`/property/${id}/pre-approval`);
          }
          else {
            router.push(`/dashboard/buyer/property/${id}`);
          }

        }
      });

    } catch (err: any) {
      console.error("Error uploading documents or creating offer:", err);
      error({ message: err?.message || "Failed to submit offer. Please try again." });
      setIsUploading(false); // Ensure loading state is reset
    }


  };

  console.log(offers?.length)


  return (
    <section className='relative min-h-screen mx-0 sm:mx-0 sm:px-4 lg:px-8 max-w-full overflow-x-hidden'>
      <div className='my-2 sm:my-4 lg:my-8 grid gap-3 sm:gap-4 lg:gap-x-10 lg:grid-cols-6 w-full px-0 sm:px-4 lg:px-0'>
        <div className='lg:col-span-4 min-w-0 w-full order-2 lg:order-1'>
          <div>
            {/* <h2 className='text-2xl font-bold'>
              Drafting Offer :{' '}
              {property?.propertyAddressDetails?.formattedAddress}{' '}
              <span className='text-grey-100'>
                ${property?.price?.amount?.toString()}
              </span>
            </h2> */}
            <div className='my-1 sm:my-4 lg:my-8'>
              <p className='py-0 sm:py-2 lg:py-4 font-bold text-sm sm:text-base mb-1'>Cover Letter</p>
              <div className='w-full overflow-hidden'>
                <Editor
                  onChange={(val) => form.setFieldValue('coverLetter', val)}
                  value={form.values.coverLetter || ""}
                />
              </div>
              {form.errors.coverLetter && (
                <p className='mt-1 text-sm text-red-500'>
                  {form.errors.coverLetter}
                </p>
              )}
            </div>
          </div>

          <SummarySection />

          <div className='my-1 sm:my-4 lg:my-8'>
            <p className='py-0 sm:py-2 lg:py-4 font-bold text-sm sm:text-base mb-1'>Special Terms</p>
            <div className='w-full overflow-hidden'>
              <Editor
                onChange={(val) => form.setFieldValue('specialTerms', val)}
                value={form.values.specialTerms || ""}
              />
            </div>
            {form.errors.specialTerms && (
              <p className='mt-1 text-sm text-red-500'>
                {form.errors.specialTerms}
              </p>
            )}
          </div>

          <section className='my-2 sm:my-6 lg:my-10'>
            <div className='py-0 sm:py-4 lg:py-8 text-black'>
              <h2 className='font-bold text-sm sm:text-base mb-0.5'>Upload Document</h2>
              <p className='text-xs sm:text-sm text-grey-970'>
                Optional ( As your agent will be required to upload before final
                submission )
              </p>
            </div>

            <DocumentsUpload
              documents={documents}
              addFileToDocuments={addFileToDocuments}
            />
          </section>
        </div>
        
        <div className="lg:col-span-2 order-1 lg:order-2 min-w-0 w-full mb-4 lg:mb-0">
          <div className="w-full">
            <OfferBuyerCard
              loading={offerPending || isUploading}
              handleSubmit={handleSubmit}
              submitWithOutAgentApproval={form.values.submitWithOutAgentApproval}
              label={buttonLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default MakeOfferContent;





// 'use client';

// import { useCallback, useContext, useEffect, useState } from 'react';
// import { FileWithPath } from '@/interfaces/file.interface';
// import { IProperty } from '@/interfaces/property.interface';
// import axios from 'axios';
// import Link from 'next/link';
// import Image from 'next/image';
// import dynamic from 'next/dynamic';
// import { useParams, useRouter, useSearchParams } from 'next/navigation';

// import { error, success } from '@/components/alert/notify';
// import {
//   useGetSingleProperty,
//   usePropertyApi,
// } from '@/hooks/api/property/usePropertyApi';
// import { storeCookie } from '@/lib/storage';
// import { cn } from '@/lib/utils';
// import { USER_ROLE } from '@/shared/constants/env';
// import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
// import { useGetPropertyOffer } from '@/hooks/api/property/useGetPropertyOffer';
// import { Button } from '@/components/ui/button';
// import { useClaimsFormContext } from '../../../providers/claim-context';
// import { Skeleton } from '../../ui/skeleton';
// import SummarySection from './summary';
// import { Checkbox } from '@/components/ui/checkbox';
// import client, { pickErrorMessage, pickResult } from '@/lib/client';
// import DocumentsUpload from '@/components/customs/documents-preview';
// import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
// import { useAppSelector } from '@/lib/hook';
// import { useDispatch, useSelector } from 'react-redux';
// import { property } from 'lodash';
// import { userData } from '@/slices/auth/auth.slice';
// import { setEngagedProperty } from '@/slices/property/property-slice';
// import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
// import { Loader } from '@mantine/core';
// import { SocketContext } from '@/providers/socket.context';
// import { message } from '@public/assets/icons';

// const Editor = dynamic(() => import('@/components/custom-editor'), {
//   ssr: true,
// });

// function MakeOfferContent() {
//   const { propertyId: id } = useParams<{ propertyId: string; item: string }>();

//   const [isUploading, setIsUploading] = useState(false);
//   const { socket, state, setState } = useContext(SocketContext)
//   const currentUser = useSelector(userData);
//   const params = useSearchParams()
//   const { engagedProperty } = useAppSelector(state => state.property)
//   const { form, isFormInitialized } = useClaimsFormContext();
//   const { createOfferMutation } = usePropertyApi();
//   const dispatch = useDispatch();
//   const { selectedThreadInfo } = useAppSelector((state) => state.chat)

//   console.log("Offer", selectedThreadInfo)



//   const [documents, setDocuments] = useState<FileWithPath[]>([]);

//   const { useCreatePropertyOffer, uploadNewFile } = usePropertyServiceAPI()

//   const handleFileUpload = async () => {
//     if (!documents.length) return;

//     const uploadPromises = documents.map(async (file) => {
//       try {
//         const { key } = await uploadNewFile(file, currentUser.id, engagedProperty?.propertyId);

//         const payload = {
//           uploadedFile: {
//             fileName: file.name,
//             fileSize: file.size,
//             fileUrl: key,
//             fileType: file.type
//           },
//           createRepoManagementInput: {
//             name: 'proof-document',
//             url: '/proof-document',
//             propertyId: engagedProperty?.propertyId,
//             createdBy: currentUser.id,
//             parentFolderName: 'proof-document',
//             isArchived: false
//           }
//         };

//         return new Promise<void>((resolve, reject) => {
//           mutate(payload, {
//             onSuccess: () => resolve(),
//             onError: (err) => reject(err),
//           });
//         });

//       } catch (err) {
//         console.error('File upload failed:', file.name, err);
//         throw err;
//       }
//     });

//     const results = await Promise.allSettled(uploadPromises);

//     results.forEach((result, index) => {
//       if (result.status === 'rejected') {
//         error({ message: `Failed to upload ${documents[index].name}` });
//       }
//     });
//   };



//   const { mutate: createOffer, isPending: offerPending } = useCreatePropertyOffer()

//   const { propertyProgressMutation } = usePropertyAPI()

//   const requestType = params?.get('type')



//   const { data: offerDataResponse } = useGetPropertyOffer(id!);

//   const { selectedOffer } = useAppSelector(state => state.property)



//   const offerData: any = requestType === "edit" ? selectedOffer : {};

//   console.log("OFFER" , offerData, currentUser, selectedThreadInfo)


//   const router = useRouter();

//   const { mutate, isPending, isError } = propertyProgressMutation()

//   const addFileToDocuments = (file: File) => {
//     setDocuments((prevDocuments) => [...prevDocuments, file]);
//   };


//   console.log("Documents" , documents)

//   const offerDataDocuments = offerData?.documents;

//   useEffect(() => {
//     if (offerData?.documentsIds) {
//       setDocuments(offerData.documentsIds);
//     }
//   }, [offerData]);

//   const buttonLabel =  'Submit';

//   const filesNames = documents.map((document) => document.name);

//   // const handleSubmit = async () => {
//   //   const date = new Date();

//   //   date.setDate(date.getDate() + 30);
//   //   const expiryNewDate = date.toLocaleString()
//   //   const mapToDto = (): any => ({
//   //     userId: currentUser?.id,
//   //     propertyEngagementId: engagedProperty?.id || '5697c782-127b-494a-a07b-c9e713cd0d11',
//   //     price: form.values.offerPrice?.amount || offerData?.price,
//   //     financeType: form.values.financeType || offerData?.financeType,
//   //     downPayment: form.values.downPayment?.amount || offerData?.downPayment,
//   //     cashAmount: form.values.loanAmount?.amount || offerData?.cashAmount ,
//   //     coverLetter: form.values.coverLetter || offerData?.coverLetter,
//   //     specialTerms: form.values.specialTerms || offerData?.specialTerms,
//   //     financeContingency: form.values.financeContingency?.unit || '',
//   //     financeContingencyDays: form.values.financeContingency?.amount || offerData?.financeContingencyDays,
//   //     appraisalContingency: form.values.apprasalContingency?.unit || '',
//   //     appraisalContingencyDays: form.values.apprasalContingency?.amount || offerData?.appraisalContingencyDays,
//   //     inspectionContingency: form.values.inspectionContingency?.unit || '',
//   //     inspectionContingencyDays: form.values.inspectionContingency?.amount || offerData?.inspectionContingencyDays,
//   //     closeEscrow: form.values.closeEscrow?.unit || '',
//   //     propertyId: engagedProperty?.propertyId,
//   //     listingId: "" + engagedProperty?.listingId,
//   //     closeEscrowDays: form.values.closeEscrow?.amount || offerData?.closeEscrowDays ,
//   //     expiryDate: expiryNewDate || new Date() || '',
//   //     documentIds: [],
//   //     isSeller: false,
//   //     isBuyer: false
//   //   })
//   //   const data = mapToDto()
//   //   createOffer(data, {
//   //     onSuccess: (data: any) => {
//   //       // mutate({
//   //       //   progress: parseInt(engagedProperty?.propertyProgress) + 10,
//   //       //   id: engagedProperty?.id
//   //       // })
//   //       success({message:'Offer Created Succesfully'})

//   //      let notificationMessage =  requestType === "edit" ?  `Offer is editted by ${currentUser?.firstname} ${currentUser?.lastname}`    : `New Offer is created by ${currentUser?.firstname} ${currentUser?.lastname}`

//   //       if (socket) {
//   //         const payload = {
//   //           message: notificationMessage,
//   //           createdAt: new Date().toISOString(),
//   //           threadId: selectedThreadInfo?.id || "",
//   //           senderId: currentUser?.id,
//   //           messageType:"notification",
//   //           receiverId:'851524d2-7a93-4d06-b5d4-088a847f3f4a',
//   //           roomId: selectedThreadInfo?.roomId
//   //         }

//   //         console.log(payload)
//   //        // socket.emit('sendThreadNotification', payload)

//   //         socket?.emit(
//   //           "sendThreadNotification",
//   //           payload,
//   //           {
//   //             reciepent: '851524d2-7a93-4d06-b5d4-088a847f3f4a',
//   //             userName: currentUser?.firstName + " " + currentUser?.lastName,
//   //           },
//   //           null,
//   //         )
//   //       }
//   //       // dispatch(setEngagedProperty({
//   //       //   ...engagedProperty,
//   //       //   propertyProgress: parseInt(engagedProperty?.propertyProgress) + 10
//   //       // }))

//   //       router.push(`/property/${id}/pre-approval`)
//   //     }
//   //   })
//   // }


//   // const handleSubmit = async () => {
//   //   console.log(socket , currentUser)
//   //   if (socket) {
//   //     const payload = {
//   //       message: `New Offer is created by ${currentUser?.firstname} ${currentUser?.lastname}`,
//   //       createdAt: new Date().toISOString(),
//   //       threadId: selectedThreadInfo?.id || "",
//   //       senderId: currentUser?.id,
//   //       messageType:"notification",
//   //       receiverId:'851524d2-7a93-4d06-b5d4-088a847f3f4a',
//   //       roomId: selectedThreadInfo?.roomId
//   //     }

//   //     console.log(payload)
//   //    // socket.emit('sendThreadNotification', payload)

//   //     socket?.emit(
//   //       "sendThreadNotification",
//   //       payload,
//   //       {
//   //         reciepent: '851524d2-7a93-4d06-b5d4-088a847f3f4a',
//   //         userName: currentUser?.firstName + " " + currentUser?.lastName,
//   //       },
//   //       null,
//   //     )
//   //   }
//   // }

//   // if (loading || !isFormInitialized) {
//   //   return <MakePropertyLoader />;
//   // }


//   const handleSubmit = async () => {
//     if (!documents.length) {
//       error({ message: "Please upload at least one document." });
//       return;
//     }

//     try {
//       // Step 1: Upload all documents and collect keys
//       const documentUploadResults = await Promise.all(
//         documents.map(file => uploadNewFile(file, currentUser.id, engagedProperty?.propertyId))
//       );

//       const documentIds = documentUploadResults.map(result => result.key); // assuming result = { key: 'some-key' }

//       // Step 2: Build offer payload
//       const date = new Date();
//       date.setDate(date.getDate() + 30);
//       const expiryNewDate = date.toLocaleString();

//       const mapToDto = (): any => ({
//         userId: currentUser?.id,
//         propertyEngagementId: engagedProperty?.id || '5697c782-127b-494a-a07b-c9e713cd0d11',
//         price: form.values.offerPrice?.amount || offerData?.price,
//         financeType: form.values.financeType || offerData?.financeType,
//         downPayment: form.values.downPayment?.amount || offerData?.downPayment,
//         cashAmount: form.values.loanAmount?.amount || offerData?.cashAmount,
//         coverLetter: form.values.coverLetter || offerData?.coverLetter,
//         specialTerms: form.values.specialTerms || offerData?.specialTerms,
//         financeContingency: form.values.financeContingency?.unit || '',
//         financeContingencyDays: form.values.financeContingency?.amount || offerData?.financeContingencyDays,
//         appraisalContingency: form.values.apprasalContingency?.unit || '',
//         appraisalContingencyDays: form.values.apprasalContingency?.amount || offerData?.appraisalContingencyDays,
//         inspectionContingency: form.values.inspectionContingency?.unit || '',
//         inspectionContingencyDays: form.values.inspectionContingency?.amount || offerData?.inspectionContingencyDays,
//         closeEscrow: form.values.closeEscrow?.unit || '',
//         propertyId: engagedProperty?.propertyId,
//         listingId: "" + engagedProperty?.listingId,
//         closeEscrowDays: form.values.closeEscrow?.amount || offerData?.closeEscrowDays,
//         expiryDate: expiryNewDate || new Date() || '',
//         documentsIds: documentIds, // ✅ Attach uploaded document keys here
//         isSeller: false,
//         isBuyer: false
//       });

//       const data = mapToDto();

//       // Step 3: Create Offer
//       createOffer(data, {
//         onSuccess: (data: any) => {
//           success({ message: 'Offer Created Successfully' });

//           const notificationMessage = requestType === "edit"
//             ? `Offer is edited by ${currentUser?.firstname} ${currentUser?.lastname}`
//             : `New Offer is created by ${currentUser?.firstname} ${currentUser?.lastname}`;

//           if (socket) {
//             const payload = {
//               message: notificationMessage,
//               createdAt: new Date().toISOString(),
//               threadId: selectedThreadInfo?.id || "",
//               senderId: currentUser?.id,
//               messageType: "notification",
//               receiverId: '851524d2-7a93-4d06-b5d4-088a847f3f4a',
//               roomId: selectedThreadInfo?.roomId
//             };

//             socket?.emit("sendThreadNotification", payload, {
//               reciepent: '851524d2-7a93-4d06-b5d4-088a847f3f4a',
//               userName: currentUser?.firstName + " " + currentUser?.lastName,
//             }, null);
//           }

//           router.push(`/property/${id}/pre-approval`);
//         }
//       });

//     } catch (err) {
//       console.error("Error uploading documents or creating offer:", err);
//       error({ message: "Failed to submit offer. Please try again." });
//     }
//   };

//   useEffect(() => {
//     mutate({
//       progress: parseInt(engagedProperty?.propertyProgress) + 10,
//       id: engagedProperty?.id
//     })
//   }, [engagedProperty])

//   return (
//     <section className='relative  min-h-screen'>
//       <div className='my-8  grid gap-x-10 md:grid-cols-6'>
//         <div className='col-span-4'>
//           <div>
//             {/* <h2 className='text-2xl font-bold'>
//               Drafting Offer :{' '}
//               {property?.propertyAddressDetails?.formattedAddress}{' '}
//               <span className='text-grey-100'>
//                 ${property?.price?.amount?.toString()}
//               </span>
//             </h2> */}
//             <div className='my-8'>
//               <p className='py-4 font-bold'>Cover Letter</p>
//               <Editor

//                 onChange={(val) => form.setFieldValue('coverLetter', val)}
//                 value={  form.values.coverLetter || offerData?.coverLetter}
//               />
//               {form.errors.coverLetter && (
//                 <p className='mt-1 text-sm text-red-500'>
//                   {form.errors.coverLetter}
//                 </p>
//               )}
//             </div>
//           </div>

//           <SummarySection />

//           <div className='my-8'>
//             <p className='py-4 font-bold'>Special Terms</p>
//             <Editor
//               onChange={(val) => form.setFieldValue('specialTerms', val)}
//               value={form.values.specialTerms || offerData?.specialTerms}
//             />
//             {form.errors.specialTerms && (
//               <p className='mt-1 text-sm text-red-500'>
//                 {form.errors.specialTerms}
//               </p>
//             )}
//           </div>

//             <section className='my-10'>
//               <div className='py-8 text-black'>
//                 <h2 className='font-bold'>Upload Document</h2>
//                 <p className='text-sm text-grey-970'>
//                   Optional ( As your agent will be required to upload before final
//                   submission )
//                 </p>
//               </div>


//               <DocumentsUpload
//                 documents={documents}
//                 addFileToDocuments={addFileToDocuments}
//               />
//             </section>




//         </div>
//         <div className="col-span-2">
//           <div className=" top-[calc(100vh-100px)] right-12">
//             <OfferBuyerCard
//               loading={offerPending || isUploading}
//               handleSubmit={handleSubmit}

//               submitWithOutAgentApproval={form.values.submitWithOutAgentApproval}
//               label={buttonLabel}
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default MakeOfferContent;

const MakePropertyLoader = () => {
  return (
    <section className='grid lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-x-10 py-2 sm:py-4 lg:py-6 xl:py-8 px-2 sm:px-4 lg:px-6 xl:px-8'>
      <div className='lg:col-span-4'>
        <Skeleton className='my-2 sm:my-3 lg:my-4 xl:my-8 h-[60px] sm:h-[80px] lg:h-[100px] xl:h-[125px] w-full rounded-xl' />
        <Skeleton className='my-2 sm:my-3 lg:my-4 xl:my-8 h-[60px] sm:h-[80px] lg:h-[100px] xl:h-[125px] w-full rounded-xl' />
        <Skeleton className='my-2 sm:my-3 lg:my-4 xl:my-8 h-[60px] sm:h-[80px] lg:h-[100px] xl:h-[125px] w-full rounded-xl' />
        <Skeleton className='my-2 sm:my-3 lg:my-4 xl:my-8 h-[60px] sm:h-[80px] lg:h-[100px] xl:h-[125px] w-full rounded-xl' />
      </div>
      <div className='lg:col-span-2'>
        <div className='h-max w-full max-w-sm mx-auto lg:max-w-none lg:w-[400px] rounded-lg sm:rounded-xl lg:rounded-2xl xl:rounded-3xl p-2 sm:p-3 lg:p-4 xl:p-6'>
          <div className='flex items-center space-x-2 sm:space-x-3 lg:space-x-4'>
            <Skeleton className='h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 rounded-full flex-shrink-0' />
            <div className='space-y-1 sm:space-y-2 flex-1 min-w-0'>
              <Skeleton className='h-2 sm:h-3 lg:h-4 w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[250px]' />
              <Skeleton className='h-2 sm:h-3 lg:h-4 w-full max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]' />
            </div>
          </div>
          <Skeleton className='my-3 sm:my-4 lg:my-6 xl:my-8 h-[60px] sm:h-[80px] lg:h-[100px] xl:h-[125px] w-full rounded-xl' />
        </div>
      </div>
    </section>
  );
};

const OfferBuyerCard = ({
  loading = false,
  handleSubmit,
  submitWithOutAgentApproval,
  label,
}: {
  loading: boolean;
  handleSubmit: () => Promise<void>;
  submitWithOutAgentApproval: boolean;
  label: string;
}) => {
  const { propertyId: id } = useParams();
  const router = useRouter();
  const { userPath } = useCurrentUser();
  const engagedProperty = useAppSelector((state) => state?.property?.engagedProperty)
  const agent = engagedProperty?.participants?.[0]?.agent
  console.log("AGENT CARD ", engagedProperty?.participants?.[0]?.agent)
  const { form } = useClaimsFormContext();

  const handlePreviewOffer = () => {
    router.push(`${userPath}/property/${id}/offer/preview`);
  };

  return (
    <aside className='h-max w-full mx-2 sm:mx-auto lg:mx-0 max-w-none sm:max-w-sm lg:max-w-none lg:w-[400px] rounded-lg sm:rounded-xl lg:rounded-2xl bg-[#F7F2EB] p-3 sm:p-4 lg:p-5 xl:p-6'>
      <h3 className='font-bold text-sm sm:text-base lg:text-lg mb-2'>Presented by</h3>
      <div className='item-start mt-2 sm:mt-3 lg:mt-4 flex gap-x-2 sm:gap-x-3 lg:gap-x-4'>
        <div className='flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 uppercase font-bold items-center justify-center rounded-full bg-black text-xs sm:text-sm lg:text-base xl:text-lg text-white flex-shrink-0'>
          <h3>{`${agent?.firstName?.charAt(0).toUpperCase()}${agent?.lastName?.charAt(0).toUpperCase()}` || `RS`}</h3>
        </div>
        <div className='space-y-0.5 sm:space-y-1 min-w-0 flex-1'>
          <p className='text-sm sm:text-base lg:text-lg font-[600] truncate leading-tight'> {`${agent?.firstName?.charAt(0).toUpperCase() + agent?.firstName?.slice(1)} ${agent?.lastName?.charAt(0).toUpperCase() + agent?.lastName?.slice(1)}` || `Daniel Smith`}</p>
          <p className='text-xs sm:text-sm lg:text-base font-[400] truncate leading-tight'>{agent?.email || `Daniel.smith@ocreal.com`}</p>
          <p className='text-xs sm:text-sm font-light leading-tight'>{agent?.phone || `616 -2342-3245`}</p>
          <p className='text-xs sm:text-sm text-grey-990 leading-tight'>Licence# 2312324</p>
        </div>
      </div>
      <div className='mt-4 sm:mt-5 lg:mt-6'>
        {/* <div className='flex items-center space-x-2'>
          <Checkbox
            id='terms'
            checked={submitWithOutAgentApproval}
            onCheckedChange={(checked) => {
              form.setFieldValue(
                'submitWithOutAgentApproval',
                checked === true,
              );
            }}
          />

          <label
            htmlFor='terms'
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Submit without an agent approval
          </label>
        </div> */}

        <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 pt-2 sm:pt-3 lg:pt-4'>
          <Button
            className='w-full flex-1 border border-black bg-transparent font-semibold hover:no-underline text-xs sm:text-sm h-8 sm:h-9 lg:h-10'
            roundness='full'
            variant={'link'}
          >
            <Link href={`${userPath}/property/${id}`}>Cancel</Link>
          </Button>

          <Button
            className={cn('w-full flex-1 font-semibold text-xs sm:text-sm h-8 sm:h-9 lg:h-10')}
            roundness='full'
            onClick={handleSubmit}
            disabled={loading || !agent}
          >
            {loading && <Loader size={14} className="sm:hidden" />}
            {loading && <Loader size={16} className="hidden sm:block lg:hidden" />}
            {loading && <Loader size={18} className="hidden lg:block" />}
            {label}
          </Button>
        </div>

        {/* <div>
          <Button
            variant='outline'
            className={cn('w-full font-semibold')}
            roundness='full'
            onClick={handlePreviewOffer}
            disabled={loading}
          >
            Preview Offer
          </Button>
        </div> */}
      </div>
    </aside>
  );
};
