'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import useFileUpload, { PresignedUrlResponse } from '@/hooks/api/UseFileUpload';
import { Icons } from '@/components/icons';
import { FileUpload } from '@/components/file-upload';
import UploadProgressBar from '@/components/start-process/upload-progress-bar';
import { PurchaseProcessStepLayout } from '@/components/buy/property-purchase-process/StepLayout';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { Button } from '@/components/ui/button';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { error } from '@/components/alert/notify';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';

enum UploadPOFFilesType {
  PROOF_OF_FUNDS = 'Proof of Funds',
}

type UserDocumentsUploadType = {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
};

export default function BuyWithCashPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const {
    files,
    uploadProgress,
    isUploading,
    setFiles,
    handleUpload,
    downloadUrls,
  } = useFileUpload();
  const router = useRouter();
  const currentUser = useSelector(userData);
  const engagementData = useSelector((state: any) => state.property?.property);
  const { updatePropertyPreference, combinedProcessState, setAgentPreviousStep } =
    usePurchaseProcessStore();
  const { propertyEngagementMutation } = usePropertyAPI();
  const [uploaded, setUploadedDocuments] =
    useState<PresignedUrlResponse | null>(null);
  const [uploadInitiated, setUploadInitiated] = useState(false);
  const checkAll = useMemo(() => Object.keys(files)?.length === 1, [files]);
  const { createRepoWithUploadedFile: { mutate, data, status } } = useRepoManagementApi()
  const { uploadNewFile } = usePropertyServiceAPI();
  const [document,setDocument] = useState([]);
  const [loading,setLoading] = useState(false);
  const handleNext = async () => {
    const meanType = localStorage.getItem("means")    
    if (!document?.length) {
      error({ message: "Please provide documentation confirming your available funds" });
      return
    }
    propertyEngagementMutation.mutate(
      {
        propertyName: engagementData?.listing?.courtesyOf,
        price: engagementData?.listing?.listPriceLow,
        listingId: +engagementData?.listingId,
        propertyId: engagementData?.id,
        city: engagementData?.address?.city || "Los angeles",
        zipCode: engagementData?.listing?.address?.zipCode,
        // province: engagementData?.listing?.address?.stateOrProvince,
        propertyAddress: engagementData?.listing?.address?.unparsedAddress,
        propertyImage: engagementData?.listing?.media?.primaryListingImageUrl,
        userId: currentUser?.id,
        answers: undefined,
        propertyProgress: 10,
        fullAddress:`${engagementData?.public?.address?.label}, USA`
      }, {
      onSuccess: (response: any) => {
        console.log("Response   ", response);
        const engagementId = response?.data?.createEngagement?.id;
        router.push(`/dashboard/buyer/property/${propertyId}/add-agent?engagementId=${engagementId}&mean_type=${meanType}`)
        // router.push('/dashboard/buyer')
      }
    }
    )
  }

  const handleFileUpload = async (e: any) => {
    setLoading(true);
    const file = e.target.files?.[0]
    setDocument(e.target.files);
    const { key } = await uploadNewFile(file, currentUser.id, engagementData?.id);
    const payload = {
      uploadedFile: {
        fileName: file?.name,
        fileSize: file?.size,
        fileUrl: key,
        fileType: file?.type
      },
      createRepoManagementInput: {
        name: 'proof-document',
        url: '/proof-document',
        propertyId: engagementData?.id,
        createdBy: currentUser.id,
        parentFolderName: 'proof-document',
        isArchived: false
      }
    };
    mutate(payload, {
      onSuccess: (data) => {
        console.log(data)
        setLoading(false)
      },
      onError: (err) => {
        error({ message: err?.message || 'Upload failed' });
        setLoading(false);
      },
    });
  }
  // useEffect(() => {
  //   if (checkAll && !uploadInitiated) {
  //     setUploadInitiated(true);
  //     (async () => {
  //       const result = await handleUpload();
  //       if (result) {
  //         setUploadedDocuments(result);
  //       }
  //     })();
  //   }
  // }, [checkAll, handleUpload, uploadInitiated]);

  // React.useEffect(() => {
  //   setAgentPreviousStep(`/start-process/${propertyId}/buy-with-cash`);
  // }, [setAgentPreviousStep]);
  React.useEffect(() => {
    setAgentPreviousStep(`/start-process/${propertyId}/buy-with-cash`);
  }, [setAgentPreviousStep, propertyId]);

  // const handleSetDocuments = useCallback(() => {
  //   if (!Object.keys(downloadUrls).length || !uploaded) return;

  //   const userDocuments = Object.entries(files).flatMap(
  //     ([documentType, docFiles]) => {
  //       if (!docFiles) return [];

  //       return Array.from(docFiles)
  //         .map((file: File) => {
  //           const matchingSuccessFile = uploaded?.data.successfullFiles.find(
  //             (successFile) => successFile.filename === file.name,
  //           );

  //           if (matchingSuccessFile) {
  //             const downloadURL = downloadUrls[matchingSuccessFile.key];
  //             return {
  //               name: documentType,
  //               url: downloadURL,
  //               thumbNail: matchingSuccessFile.key,
  //               documentType: file.type,
  //             };
  //           }
  //           return null;
  //         })
  //         .filter((doc): doc is UserDocumentsUploadType => doc !== null);
  //     },
  //   );

  //   if (userDocuments.length > 0) {
  //     updatePropertyPreference('proofOfFundUpload', userDocuments[0]);
  //   }
  // }, [files, downloadUrls, uploaded, updatePropertyPreference]);

  // useEffect(() => {
  //   handleSetDocuments();
  // }, [handleSetDocuments]);

  const calculateProgress = useCallback(() => {
    const fileList = files[UploadPOFFilesType.PROOF_OF_FUNDS];
    if (fileList && fileList.length > 0) {
      const fileName = fileList[0].name;
      return uploadProgress[fileName] || null;
    }
    return null;
  }, [uploadProgress, files]);

  const isNextDisabled = useMemo(
    () => !combinedProcessState.propertyPreference.proofOfFundUpload,
    [combinedProcessState.propertyPreference.proofOfFundUpload],
  );

  return (
    <>
      <PurchaseProcessStepLayout title='Upload Proof of Funds'>
        <div className='w-[75%]'>
          <FileUpload
            accept='.pdf,.doc,.docx,.txt'
            setFile={(file: FileList) => {
              console.log("Files : 01 ",file);
              
              setFiles(UploadPOFFilesType.PROOF_OF_FUNDS, file);
            }}
            onChange={handleFileUpload}
            label={
              <label className='flex items-center gap-x-1'>
                <span>Proof of Funds</span>{' '}
                {isUploading ? (
                  <Loader2 className='ml-2 animate-spin' />
                ) : (
                  <Icons.Warning className='h-3 w-3' />
                )}
              </label>
            }
          />
          {calculateProgress() !== null && (
            <UploadProgressBar progress={calculateProgress() || 0} />
          )}
        </div>
      </PurchaseProcessStepLayout>

      <div className='mt-auto flex w-full flex-nowrap items-center justify-between px-0 pb-5 md:px-5'>
        <div className='flex flex-row flex-nowrap items-center gap-3'>
          <Link
            href={`/start-process/${propertyId}/finance-process`}
            className='flex h-8 w-28 items-center justify-center rounded-full border-2 border-black bg-transparent px-12 py-2 text-center text-black'
          >
            Back
          </Link>
          <Link
            href={`/buy/${propertyId}/prop/preview`}
            className='px-8 py-2 font-bold text-ocOrange'
          >
            Cancel
          </Link>
        </div>

        <div className='flex flex-nowrap items-center gap-5'>
          <Button
            disabled={loading}
            className='flex items-center justify-center rounded-full bg-black px-8 py-2 text-center text-white'
          >
            <Link href=""
              onClick={handleNext}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
