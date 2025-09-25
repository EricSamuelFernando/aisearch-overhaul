import { UserDocumentsUploadType } from '../purchase-process';

type CommonPreferenceType = {
  propertyType: string;
  spendAmount: {
    min: number;
    max: number;
  } | null;
  financialProcess: string;
};

export type OnboardingBuyerPropertyPreference = {
  preApprovalAffiliates: boolean;
  workWithLender: boolean;
  rangeText?: string;
  preferredPropertyAddress: string;
} & CommonPreferenceType;

export type BuyerPurchasePropertyPreference = {
  property: string;
  listingId: string;
  accepted: boolean;
  termsVersion: string;
  propertyPreference: CommonPreferenceType & {
    workWithLender: boolean | null;
    preApprovalAffiliates: boolean | null;
    preApprovalsDocuments?: {
      approvalDocument?: UserDocumentsUploadType;
      downPaymentDocument?: UserDocumentsUploadType;
    } | null;
    proofOfFundUpload?: UserDocumentsUploadType;
  };
};
