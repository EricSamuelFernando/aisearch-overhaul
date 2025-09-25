import { AppState } from '@/lib/store';

export const selectPropertyInformation = (state: AppState) =>
  state.propertyVerification;
export const selectPropertyInfo = (state: AppState) => state.property;

export const agentIsInvited = (state: AppState) =>
  state.sellerClaimHome.agentsInvited;
