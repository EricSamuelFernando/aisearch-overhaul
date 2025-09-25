import { BuyerOnboardingProgress, UserType } from '@/types/user.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createDraft, finishDraft } from 'immer';
import { OnboardingBuyerPropertyPreference } from './types';

export enum OnboardingStep {
  Step1 = 'step1',
  Step2 = 'step2',
  Step3 = 'step3',
  Step4 = 'step4',
  Step5 = 'step5',
  Step6 = 'step6',
  Step7 = 'step7',
}

interface StepState {
  currentStep: OnboardingStep;
  steps: OnboardingStep[];
  savedSearchQuery: string;
  userType: UserType | null;
  buyerProgress: BuyerOnboardingProgress;
  buyerPropertyPreferences: OnboardingBuyerPropertyPreference;
}

const stepList = Object.values(OnboardingStep).map((step) => step);

const initialState: StepState = {
  currentStep: OnboardingStep.Step1,
  steps: stepList,
  savedSearchQuery: '',
  userType: null,
  buyerProgress: BuyerOnboardingProgress.PROPERTY_AREA,
  buyerPropertyPreferences: {
    propertyType: '',
    spendAmount: null,
    financialProcess: '',
    preApprovalAffiliates: false,
    workWithLender: false,
    rangeText: '',
    preferredPropertyAddress: '',
  },
};

type BuyerPropertyPreferencesKey = keyof OnboardingBuyerPropertyPreference;

interface UpdateBuyerPreferencePayload<K extends BuyerPropertyPreferencesKey> {
  key: K;
  value: OnboardingBuyerPropertyPreference[K];
}

export const stepSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    nextStep(state) {
      const currentIndex = state.steps.indexOf(state.currentStep);
      if (currentIndex < state.steps.length - 1) {
        state.currentStep = state.steps[currentIndex + 1];
      }
    },
    agentPreviousStep(state) {
      const currentIndex = state.steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = state.steps[currentIndex - 1];
      }
    },
    nextStepWithCallback(state, action: PayloadAction<() => void>) {
      const currentIndex = state.steps.indexOf(state.currentStep);
      if (currentIndex < state.steps.length - 1) {
        state.currentStep = state.steps[currentIndex + 1];
        action.payload();
      }
    },
    updateSavedSearchQuery: (
      state,
      action: PayloadAction<{ query: string }>,
    ) => {
      state.savedSearchQuery = action.payload.query;
    },
    updateUserType: (
      state,
      action: PayloadAction<{ userType: UserType | null }>,
    ) => {
      state.userType = action.payload.userType;
    },
    updateBuyerOnboardingProgress: (
      state,
      action: PayloadAction<{ progress: BuyerOnboardingProgress }>,
    ) => {
      state.buyerProgress = action.payload.progress;
    },
    updateBuyerOnboardingPreference: <K extends BuyerPropertyPreferencesKey>(
      state: StepState,
      action: PayloadAction<UpdateBuyerPreferencePayload<K>>,
    ) => {
      const draft = createDraft(state);
      const { key, value } = action.payload;
      draft.buyerPropertyPreferences[key] = value;

      return finishDraft(draft);
    },
    resetOnboardingSlice: () => {
      return initialState;
    },
  },
});

export const {
  nextStep,
  agentPreviousStep,
  nextStepWithCallback,
  updateSavedSearchQuery,
  updateUserType,
  updateBuyerOnboardingProgress,
  updateBuyerOnboardingPreference,
  resetOnboardingSlice,
} = stepSlice.actions;

export default stepSlice.reducer;
