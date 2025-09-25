import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SellerClaimHomeFlowType = {
  agentsInvited: boolean;
};

const initialSellerAgentFlowState: SellerClaimHomeFlowType = {
  agentsInvited: false,
};

export const SellerClaimHomeSlice = createSlice({
  name: 'sellerClaimHome',
  initialState: initialSellerAgentFlowState,
  reducers: {
    setAgentInvited: (state, action: PayloadAction<boolean>) => {
      state.agentsInvited = action.payload;
    },
  },
});

export const { setAgentInvited } = SellerClaimHomeSlice.actions;
