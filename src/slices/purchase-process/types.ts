import { BuyerPurchasePropertyPreference } from '../onboarding/types';

export type BuyerPropertyPreferencesKey = keyof BuyerPurchasePropertyPreference;

export interface UpdateBuyerPreferencePayload<
  K extends BuyerPropertyPreferencesKey,
> {
  key: K;
  value: BuyerPurchasePropertyPreference[K];
}

export type UserDocumentsUploadType = {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
  expirydate?: string;
};
