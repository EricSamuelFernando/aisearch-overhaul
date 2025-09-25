import { createSlice } from '@reduxjs/toolkit';

export type Screens =
  | 'user-selection'
  | 'auth-type'
  | 'email'
  | 'password'
  | 'signup'
  | 'login';

export type Mode = 'normal' | 'modal';
interface AuthModalState {
  currentScreen: Screens;
  navBtn: 'login' | 'signup';
  mode: Mode;
}

const initialState: AuthModalState = {
  currentScreen: 'login',
  navBtn: 'login',
  mode: 'normal',
};

const authScreenSlice = createSlice({
  name: 'modal-screen',
  initialState,
  reducers: {
    setModalScreen: (state, action) => {
      state.currentScreen = action.payload;
    },
    setNavBtnClick: (state, action) => {
      state.navBtn = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { setModalScreen, setNavBtnClick, setMode } =
  authScreenSlice.actions;

export default authScreenSlice.reducer;
