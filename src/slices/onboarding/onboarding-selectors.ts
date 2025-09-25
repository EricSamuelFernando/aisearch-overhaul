import { RootState } from '@/lib/store';

export const savedSearchQuery = (state: RootState) =>
  state.steps.savedSearchQuery;

export const savedUserType = (state: RootState) => state.steps.userType;
export const buyerOnboardProgress = (state: RootState) =>
  state.steps.buyerProgress;

export const buyerPropertyPreference = (state: RootState) =>
  state.steps.buyerPropertyPreferences;
