// import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import { RootState } from '@/lib/store'

// interface VerificationState {
//   startTime: number | null
//   isVerified: boolean
// }

// const initialState: VerificationState = {
//   startTime: null,
//   isVerified: false,
// }

// const verificationSlice = createSlice({
//   name: 'verification',
//   initialState,
//   reducers: {
//     setStartTime: (state, action: PayloadAction<number | null>) => {
//       state.startTime = action.payload
//     },
//     setIsVerified: (state, action: PayloadAction<boolean>) => {
//       state.isVerified = action.payload
//       if (!action.payload) {
//         state.startTime = null
//       }
//     },
//     setVerificationStatus: (state, action: PayloadAction<string>) => {
//       // Implement your logic to handle verification status change
//       // For example:
//       // state.isVerified = action.payload === 'verified';
//     },
//   },
// })

// export const { setStartTime, setIsVerified, setVerificationStatus } =
//   verificationSlice.actions

// export const selectVerification = (state: RootState) => state.verification

// export default verificationSlice.reducer

// import { createSlice } from '@reduxjs/toolkit'
// import { RootState } from '@/lib/store'

// interface VerificationState {
//   startTime: number
//   isVerified: boolean
//   verificationMessage: string | null
// }

// const initialState: VerificationState = {
//   startTime: 120,
//   isVerified: false,
//   verificationMessage: null,
// }

// const verificationSlice = createSlice({
//   name: 'verification',
//   initialState,
//   reducers: {
//     setStartTime: (state) => {
//       setInterval(() => {
//         if (state.startTime === 0) {
//           console.log('timer finished')
//         } else {
//           return { ...state, startTime: state.startTime - 1 }
//         }
//       }, 1000)
//     },
//   },
// })

// export const { setStartTime } = verificationSlice.actions

// export const selectVerification = (state: RootState) => state.verification

// export default verificationSlice.reducer

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';

interface VerificationState {
  startTime: number;
  isVerified: boolean;
  verificationMessage: string | null;
}

const initialState: VerificationState = {
  startTime: 120,
  isVerified: false,
  verificationMessage: null,
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    decrementStartTime: (state) => {
      state.startTime -= 1;
    },
    setIsVerified: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    },
    setVerificationMessage: (state, action: PayloadAction<string | null>) => {
      state.verificationMessage = action.payload;
    },
    resetStartTime: (state) => {
      state.startTime = 120;
    },
  },
});

export const {
  decrementStartTime,
  setIsVerified,
  setVerificationMessage,
  resetStartTime,
} = verificationSlice.actions;

export const selectVerification = (state: RootState) => state.verification;

export default verificationSlice.reducer;
