import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import Auth from '@/slices/auth/auth.slice';
import Property from '@/slices/property/property-slice';
import AuthModalScreens from '@/slices/auth/auth-modal.slice';
import ChatSlice from '@/slices/chat/chat.slice';

import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from 'redux-persist';
import { WebStorage } from 'redux-persist/lib/types';
import registerSlices from '../slices/auth/register.slices';
import preapprovalSlice from '../slices/pre-approval/preapproval-slice';
import verificationSlice from '../slices/verification/verification-slice';
import { propertyVerificationSlice } from '@/slices/verification/propertyVerification';
import { stepSlice } from '@/slices/onboarding/onboarding-slice';
import { propertyPreferenceSlice } from '@/slices/onboarding/property-preference';
import { encryptTransform } from './redux-persist-encryption';
import { SECURE_STORE } from '@/shared/constants/env';
import { SellerClaimHomeSlice } from '@/slices/verification/seller-agent-flow';
import { questionsSlice } from '@/slices/mortgage/question.slice';
import plaidSlice from '@/slices/mortgage/plaid.slice';



export function createPersistStorage(): WebStorage {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return {
      getItem() {
        return Promise.resolve(null);
      },
      setItem() {
        return Promise.resolve();
      },
      removeItem() {
        return Promise.resolve();
      },
    };
  }

  return createWebStorage('local');
}

const encryptStore = encryptTransform({
  secretKey: SECURE_STORE,
  onError: (err) => {},
});

const persistConfig = {
  key: 'root',
  storage: createPersistStorage(),
  version: 1,
  transforms: [encryptStore] as any,
};

const rootReducer = combineReducers({
  auth: Auth,
  chat: ChatSlice,
  register: registerSlices,
  property: Property,
  authScreen: AuthModalScreens,
  questions: questionsSlice.reducer,
  preApproval: preapprovalSlice,
  plaid:plaidSlice,
  verification: verificationSlice,
  propertyVerification: propertyVerificationSlice.reducer,
  [stepSlice.reducerPath]: stepSlice.reducer,
  [propertyPreferenceSlice.reducerPath]: propertyPreferenceSlice.reducer,
  [SellerClaimHomeSlice.reducerPath]: SellerClaimHomeSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV === 'development',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppState = ReturnType<typeof rootReducer>;
