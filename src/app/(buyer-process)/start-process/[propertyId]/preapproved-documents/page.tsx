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
import { error } from '@/components/alert/notify';
import { useSelector } from 'react-redux';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { userData } from '@/slices/auth/auth.slice';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';

enum PreApprovalFiles {
  PRE_APPROVAL_DOCUMENT = 'Pre Approval Document',
  PROOF_DOWN_PAYMENT = 'Proof of Down Payment',
}

type UserDocumentsUploadType = {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
};

type UploadPreApprovalFilesState = {
  [PreApprovalFiles.PRE_APPROVAL_DOCUMENT]: FileList | null;
  [PreApprovalFiles.PROOF_DOWN_PAYMENT]: FileList | null;
};

const InitialState: UploadPreApprovalFilesState = {
  'Pre Approval Document': null,
  'Proof of Down Payment': null,
};

export default function PreapprovedDocumentsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const {
    files,
    uploadProgress,
    isUploading,
    setFiles,
    handleUpload,
    downloadUrls,
  } = useFileUpload();

  const {
    updatePreApprovalDocuments,
    combinedProcessState,
    setAgentPreviousStep,
  } = usePurchaseProcessStore();

  const [documents, setDocuments] =
    useState<UploadPreApprovalFilesState>(InitialState);
  const [uploaded, setUploadedDocuments] =
    useState<PresignedUrlResponse | null>(null);
  const engagementData = useSelector((state: any) => state.property?.property);
  const currentUser = useSelector(userData);
  const [uploadInitiated, setUploadInitiated] = useState(false);
  const { propertyEngagementMutation } = usePropertyAPI();
  const router = useRouter();
  const { createRepoWithUploadedFile: { mutate, data, status } } = useRepoManagementApi()
  const { uploadNewFile } = usePropertyServiceAPI();
  const [document, setDocument] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const handleNext = () => {
    const meanType = localStorage.getItem("means")
    if (document?.length<2) {
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

      }
    }
    )
  }

  const handleFileUpload = async (e: any) => {
    console.log("Filesss: ",e.target.files);
    
    setLoading(true);
    const file = e.target.files?.[0]
    setDocument((prev)=>([
      ...prev,
      file
    ]));
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

  const handleDocumentPicked = useCallback(
    (file: FileList, type: PreApprovalFiles) => {
      setDocuments((prev) => ({ ...prev, [type]: file }));
    },
    [],
  );

  const checkAll = useMemo(
    () =>
      Object.values(documents)?.every((value) => value !== null) &&
      Object.keys(files)?.length === 2,
    [documents, files],
  );

  useEffect(() => {
    // Only initiate upload if all files are selected and upload hasn't been initiated yet
    if (checkAll && !uploadInitiated) {
      setUploadInitiated(true);
      (async () => {
        const result = await handleUpload();
        if (result) {
          setUploadedDocuments(result);
        }
      })();
    }
  }, [checkAll, handleUpload, uploadInitiated]);

  React.useEffect(() => {
    setAgentPreviousStep(`/start-process/${propertyId}/preapproved-documents`);
  }, [setAgentPreviousStep]);

  const handleSetDocuments = useCallback(() => {
    if (!Object.keys(downloadUrls).length || !uploaded) return;

    const userDocuments = Object.entries(documents).flatMap(
      ([documentType, docFiles]) => {
        if (!docFiles) return [];

        return Array.from(docFiles)
          .map((file: File) => {
            const matchingSuccessFile = uploaded?.data.successfullFiles.find(
              (successFile) => successFile.filename === file.name,
            );

            if (matchingSuccessFile) {
              const downloadURL = downloadUrls[matchingSuccessFile.key];
              return {
                name: documentType,
                url: downloadURL,
                thumbNail: matchingSuccessFile.key,
                documentType: file.type,
              };
            }
            return null;
          })
          .filter((doc): doc is UserDocumentsUploadType => doc !== null);
      },
    );

    const updatedDocuments: {
      approvalDocument?: UserDocumentsUploadType;
      downPaymentDocument?: UserDocumentsUploadType;
    } = {};

    userDocuments.forEach((file) => {
      if (file.name === PreApprovalFiles.PRE_APPROVAL_DOCUMENT) {
        updatedDocuments.approvalDocument = file;
      }
      if (file.name === PreApprovalFiles.PROOF_DOWN_PAYMENT) {
        updatedDocuments.downPaymentDocument = file;
      }
    });

    updatePreApprovalDocuments(updatedDocuments);
  }, [documents, downloadUrls, uploaded, updatePreApprovalDocuments]);

  // useEffect(() => {
  //   handleSetDocuments();
  // }, [handleSetDocuments]);

  const calculateProgress = useCallback(
    (docType: PreApprovalFiles) => {
      const fileList = documents[docType];
      if (fileList && fileList.length > 0) {
        const fileName = fileList[0].name;
        return uploadProgress[fileName] || null;
      }
      return null;
    },
    [documents, uploadProgress],
  );

  const isNextDisabled = useMemo(
    () =>
      !combinedProcessState.propertyPreference.preApprovalsDocuments
        ?.approvalDocument ||
      !combinedProcessState.propertyPreference.preApprovalsDocuments
        ?.downPaymentDocument,
    [combinedProcessState.propertyPreference.preApprovalsDocuments],
  );

  return (
    <>
      <PurchaseProcessStepLayout title='Upload Files'>
        <div className='flex w-[75%] flex-col space-y-6'>
          {Object.values(PreApprovalFiles).map((fileType) => (
            <div key={fileType} className='flex flex-col gap-2'>
              <FileUpload
                accept='.pdf,.doc,.docx,.txt'
                setFile={(file: FileList) => {
                  // handleDocumentPicked(file, fileType);
                  setFiles(fileType, file);
                  console.log("Files : -001 : ",file);
                  
                }}
                disabled={loading}
                onChange={handleFileUpload}
                label={
                  <label className='flex items-center gap-x-1'>
                    <span>{fileType}</span>{' '}
                    {isUploading ? (
                      <Loader2 className='ml-2 animate-spin' />
                    ) : (
                      <Icons.Warning className='h-3 w-3' />
                    )}
                  </label>
                }
              />
              {calculateProgress(fileType) !== null && (
                <UploadProgressBar
                  progress={calculateProgress(fileType) || 0}
                />
              )}
            </div>
          ))}
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
            <Link href={``}
              onClick={handleNext}
            >Next</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
