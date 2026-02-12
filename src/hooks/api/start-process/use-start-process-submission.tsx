import * as React from 'react';
import { error, info, success } from '@/components/alert/notify';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import client from '@/lib/client';
import { BuyerPurchasePropertyPreference } from '@/slices/onboarding/types';
import { UserDocumentsUploadType } from '@/slices/purchase-process';
import { useAgentList } from '@/shared/hooks/useAgentList';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { queryClient } from '@/providers/query-provider';

const useStartProcessSubmission = () => {
  const { combinedProcessState, resetState } = usePurchaseProcessStore();
  const { setAgentIsInvited } = useAgentList();
  const router = useRouter();

  const handleAlreadyActedError = React.useCallback(() => {
    resetState();
    setAgentIsInvited(false);
    router.push('/dashboard/buyer');
    info({
      message:
        'You have already taken action on this property. Redirecting to the dashboard.',
    });
  }, [resetState, setAgentIsInvited, router]);

  const propertyPreferenceMutation = useMutation({
    mutationKey: ['propertyPreference-buyer-process-final'],
    mutationFn: savePropertyPreference,
    onSuccess: (data) => {
      success({ message: data.data.message });
      queryClient.invalidateQueries({
        queryKey: ['fetch-buyer-engaged-properties'],
      });
    },
    onError: (error: unknown) => {
      handleMutationError(error, handleAlreadyActedError);
    },
  });

  const userDocumentsMutation = useMutation({
    mutationKey: ['userDocuments-buyer-process-final'],
    mutationFn: saveUserDocuments,
    onSuccess: (data) => {
      success({ message: data.data.message });
    },
    onError: (error: unknown) => {
      handleMutationError(error, handleAlreadyActedError);
    },
  });

  const handleMutationError = (
    error: unknown,
    alreadyActedHandler: () => void,
  ) => {
    console.error('Mutation error:', error);
    if (error instanceof Error) {
      const axiosError = error as any;
      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred';

      if (errorMessage === 'You have already acted on this') {
        alreadyActedHandler();
      } else {
        error({ message: errorMessage });
      }
    } else {
      error({
        message: 'Oops! Something went wrong unexpectedly. Please try again.',
      });
    }
  };

  const agreeAndProceed = React.useCallback(async () => {
    const propertyPreferenceData: BuyerPurchasePropertyPreference = {
      property: combinedProcessState.property,
      listingId: combinedProcessState.listingId,
      accepted: true,
      termsVersion: 'THE TERMS FOR THIS PROPERTY',
      propertyPreference: {
        propertyType: combinedProcessState.propertyPreference.propertyType,
        // @ts-ignore
        spendAmount: combinedProcessState.propertyPreference
          .spendAmount as number,
        financialProcess:
          combinedProcessState.propertyPreference.financialProcess,
        preApprovalAffiliates:
          combinedProcessState.propertyPreference.preApprovalAffiliates,
        workWithLender: combinedProcessState.propertyPreference.workWithLender,
      },
    };

    const userDocuments: UserDocumentsUploadType[] = [
      ...(combinedProcessState.propertyPreference.preApprovalsDocuments
        ?.approvalDocument
        ? [
            combinedProcessState.propertyPreference.preApprovalsDocuments
              .approvalDocument,
          ]
        : []),
      ...(combinedProcessState.propertyPreference.preApprovalsDocuments
        ?.downPaymentDocument
        ? [
            combinedProcessState.propertyPreference.preApprovalsDocuments
              .downPaymentDocument,
          ]
        : []),
      ...(combinedProcessState.propertyPreference.proofOfFundUpload
        ? [combinedProcessState.propertyPreference.proofOfFundUpload]
        : []),
    ];

    try {
      await Promise.all([
        propertyPreferenceMutation.mutateAsync(propertyPreferenceData),
        userDocumentsMutation.mutateAsync(userDocuments),
      ]);
      resetState();
      setAgentIsInvited(false);
      router.push('/dashboard/buyer');
    } catch (error) {
      console.error('Error in agree and proceed:', error);
      if (error instanceof Error) {
        const axiosError = error as any;
        const errorMessage =
          axiosError.response?.data?.message || 'An error occurred';

        if (errorMessage === 'You have already acted on this') {
          handleAlreadyActedError();
        } else {
          error({ message: errorMessage });
        }
      } else {
        error({
          message: 'Oops! Something went wrong unexpectedly. Please try again.',
        });
      }
    }
  }, [
    combinedProcessState,
    propertyPreferenceMutation,
    userDocumentsMutation,
    resetState,
    setAgentIsInvited,
    router,
    handleAlreadyActedError,
  ]);

  return {
    agreeAndProceed,
    isLoading:
      propertyPreferenceMutation.isPending || userDocumentsMutation.isPending,
  };
};

const savePropertyPreference = async (data: BuyerPurchasePropertyPreference) =>
  client.post('property/buyer/terms-and-agreement', data);

const saveUserDocuments = async (documents: UserDocumentsUploadType[]) =>
  client.post('user/save/user-documents', { documents });

export { useStartProcessSubmission };
