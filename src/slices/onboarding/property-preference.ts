import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPropertyPreference } from '@/interfaces/property-preference';
import { generateTempUserId } from '@/utils/math-utilities';

const initialPropertyPreferenceState: Omit<
  IPropertyPreference,
  'onboardingCompleted'
> = {
  propertyType: '',
  spendAmount: null,
  financialProcess: '',
  preApprovalAffiliates: false,
  workWithLender: false,
  rangeText: '',
  tempUserId: '',
  searchCount: 0,
};

export const propertyPreferenceSlice = createSlice({
  name: 'propertyPreference',
  initialState: initialPropertyPreferenceState,
  reducers: {
    setPropertyType(state, action: PayloadAction<string>) {
      state.propertyType = action.payload;
    },
    setSpendAmount(
      state,
      action: PayloadAction<{ min: number; max: number; rangeText: string }>,
    ) {
      state.spendAmount = {
        min: action.payload.min,
        max: action.payload.max,
      };
      state.rangeText = action.payload.rangeText;
    },
    setFinancialProcess(state, action: PayloadAction<string>) {
      state.financialProcess = action.payload;
    },
    initializeTempUserId: (state) => {
      if (!state.tempUserId) {
        state.tempUserId = generateTempUserId();
        state.searchCount = 0; // Reset search count
      }
    },
    incrementSearchCount: (state) => {
      state.searchCount += 1;
    },
    resetSearchCount: (state) => {
      state.searchCount = 0;
    },
    setPreApprovalAffiliates(state, action: PayloadAction<boolean>) {
      state.preApprovalAffiliates = action.payload;
    },
    setWorkWithLender(state, action: PayloadAction<boolean>) {
      state.workWithLender = action.payload;
    },
  },
});

export const {
  setPropertyType,
  incrementSearchCount,
  resetSearchCount,
  setSpendAmount,
  setFinancialProcess,
  setPreApprovalAffiliates,
  setWorkWithLender,
  initializeTempUserId
} = propertyPreferenceSlice.actions;

export default propertyPreferenceSlice.reducer;
