import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SpendAmount = number | null;

type UserDocumentsUploadType = {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
};

type PropertyPreference = {
  propertyType: string;
  spendAmount: SpendAmount;
  financialProcess: string;
  preApprovalAffiliates: boolean | null;
  workWithLender: boolean | null;
  preApprovalsDocuments: {
    approvalDocument: UserDocumentsUploadType | null | undefined;
    downPaymentDocument: UserDocumentsUploadType | null;
  } | null;
  proofOfFundUpload: UserDocumentsUploadType | null;
};

type BuyerPurchasePropertyPreference = {
  accepted: boolean;
  property: string;
  listingId: string;
  propertyPreference: PropertyPreference;
  termsVersion: string;
};

type PurchaseProcessStore = {
  lenderPreviousStep: string;
  combinedProcessState: BuyerPurchasePropertyPreference;
  agentPreviousStep: string;
  updatePropertyPreference: (key: keyof PropertyPreference, value: any) => void;
  updateBuyerPreference: (
    key: keyof BuyerPurchasePropertyPreference,
    value: any,
  ) => void;
  updatePreApprovalDocuments: (documents: {
    approvalDocument?: UserDocumentsUploadType;
    downPaymentDocument?: UserDocumentsUploadType;
  }) => void;
  resetState: () => void;
  setLenderPreviousStep: (step: string) => void;
  setAgentPreviousStep: (step: string) => void;
  initializeFromUser: (
    userPropertyPreference: Partial<PropertyPreference>,
  ) => void;
};

export const initialState: BuyerPurchasePropertyPreference = {
  accepted: false,
  property: '',
  listingId: '',
  propertyPreference: {
    propertyType: '',
    spendAmount: null,
    financialProcess: '',
    preApprovalAffiliates: null,
    workWithLender: null,
    preApprovalsDocuments: null,
    proofOfFundUpload: null,
  },
  termsVersion: '',
};

export const usePurchaseProcessStore = create<PurchaseProcessStore>()(
  persist(
    (set, get): PurchaseProcessStore => ({
      combinedProcessState: initialState,
      agentPreviousStep: '',
      lenderPreviousStep: '',
      updatePropertyPreference: (key, value) =>
        set((state) => ({
          combinedProcessState: {
            ...state.combinedProcessState,
            propertyPreference: {
              ...state.combinedProcessState.propertyPreference,
              [key]: value,
            },
          },
        })),
      updateBuyerPreference: (key, value) =>
        set((state) => ({
          combinedProcessState: {
            ...state.combinedProcessState,
            [key]: value,
          },
        })),
      updatePreApprovalDocuments: (documents) =>
        // @ts-ignore
        set((state) => ({
          combinedProcessState: {
            ...state.combinedProcessState,
            propertyPreference: {
              ...state.combinedProcessState.propertyPreference,
              preApprovalsDocuments: {
                ...state.combinedProcessState.propertyPreference
                  .preApprovalsDocuments,
                ...documents,
              },
            },
          },
        })),
      setAgentPreviousStep: (step) => set({ agentPreviousStep: step }),
      setLenderPreviousStep: (step) => set({ lenderPreviousStep: step }),
      resetState: () =>
        set({ combinedProcessState: initialState, agentPreviousStep: '' }),
      initializeFromUser: (userPropertyPreference) => {
        const { spendAmount, propertyType } = userPropertyPreference;
        const currentPreference = get().combinedProcessState.propertyPreference;
        if (
          spendAmount !== currentPreference.spendAmount ||
          propertyType !== currentPreference.propertyType
        ) {
          set((state) => ({
            combinedProcessState: {
              ...state.combinedProcessState,
              propertyPreference: {
                ...state.combinedProcessState.propertyPreference,
                ...(spendAmount !== undefined && { spendAmount }),
                ...(propertyType !== undefined && { propertyType }),
              },
            },
          }));
        }
      },
    }),
    {
      name: 'purchase-process-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        combinedProcessState: {
          property: state.combinedProcessState.property,
          listingId: state.combinedProcessState.listingId,
          propertyPreference: {
            propertyType:
              state.combinedProcessState.propertyPreference.propertyType,
            spendAmount:
              state.combinedProcessState.propertyPreference.spendAmount,
            financialProcess:
              state.combinedProcessState.propertyPreference.financialProcess,
            proofOfFundUpload:
              state.combinedProcessState.propertyPreference.proofOfFundUpload,
          },
        },
        agentPreviousStep: state.agentPreviousStep,
      }),
    },
  ),
);
