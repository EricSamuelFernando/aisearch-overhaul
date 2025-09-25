import { SendVerificationCode } from '@/intferfaces/form';
import { UserType } from '@/types/user.types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: SendVerificationCode & { token?: string } = {
  account_type: '',
  email: '',
  token: '',
};

const registerSlice = createSlice({
  name: 'sendVerificationCode',
  initialState,
  reducers: {
    selectAccountType: (state, action: PayloadAction<UserType>) => {
      state.account_type = action.payload;
    },
    selectEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { selectAccountType, selectEmail, setAuthToken } =
  registerSlice.actions;

export default registerSlice.reducer;
