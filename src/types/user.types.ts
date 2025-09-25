interface SpendAmount {
  min: number;
  max: number;
}

export interface PropertyPreference {
  propertyType: string;
  onboardingCompleted: boolean;
  spendAmount: SpendAmount;
  financialProcess: string;
  preApprovalAffiliates: boolean;
  workWithLender: boolean;
  preferredPropertyAddress: string;
}

export interface User {
  id: string;
  status?: string;
  email?: string;
  firstname: string;
  profile?:string;
  lastname?: string;
  fullname?: string;
  account_type?: string;
  preApproval?: boolean;
  propertyPreference?: PropertyPreference;
}

export type UserType = 'buyer' | 'seller' | 'agent';

export interface IAuthUser {
  user: User;
  token: string;
}

export interface IPasswordReset {
  token: string;
}

export interface IUploadUserPayload {
  firstname?: string;
  lastname?: string;
  email?: string;
  preApproval?: boolean;
  preApprovalDocument?: {
    url?: string;
    expiryDate?: string;
  };
}

export enum BuyerOnboardingProgress {
  PROPERTY_AREA = 'property-area',
  PROPERTY_SELECTION = 'property-select',
  PROPERTY_SPEND_RANGE = 'property-spend',
}
