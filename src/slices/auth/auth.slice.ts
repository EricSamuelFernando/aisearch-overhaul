import { User, UserType, PropertyPreference } from '@/types/user.types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { clearAllAuthStorage, storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { createPersistStorage } from '@/lib/store';
import { generateTempUserId } from '@/utils/math-utilities';
import CognitoAuth from '@/lib/cognito';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  contextId: null
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  contextId:null

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    updateContextId :(state,action)=>{
      state.contextId = action.payload;
    },
    setPropertyPreference: (
      state,
      action: PayloadAction<PropertyPreference>,
    ) => {
      state.user!.propertyPreference = action.payload;
    },
   
    switchUser: (state, action: PayloadAction<UserType>) => {
      state.user!.account_type = action.payload;
      storeCookie({ key: USER_ROLE, value: action.payload });
    },
    logout: () => {
      // Sign out from Cognito (clears local Cognito session)
      try {
        CognitoAuth.logout();
      } catch (error) {
        console.error('Error signing out from Cognito:', error);
        // Continue with logout even if Cognito logout fails
      }

      // Nuclear cleanup: wipe ALL auth data from cookies, localStorage,
      // sessionStorage, Redux Persist, and Cognito SDK storage.
      clearAllAuthStorage();

      return initialState;
    },
  },
});

export const { login, logout, switchUser,updateContextId  } = authSlice.actions;
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;

export const userData = (state:any)=>state.auth.user;
export const isUserLoggedIn = (state:any)=>state.auth.isLoggedIn;
export const accessToken = (state:any)=>state.auth.user?.access_token;

export default authSlice.reducer;
