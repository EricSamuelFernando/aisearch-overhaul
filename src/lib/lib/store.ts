// import { configureStore } from "@reduxjs/toolkit";
// import questionsReducer from "./slices/questionsSlice";

// export const makeStore = () => {
//   return configureStore({
//     reducer: {
//       questions: questionsReducer,
//     },
//   });
// };

// // Infer the type of makeStore
// export type AppStore = ReturnType<typeof makeStore>;
// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<AppStore["getState"]>;
// export type AppDispatch = AppStore["dispatch"];

import { configureStore } from "@reduxjs/toolkit";
import questionsReducer from "./slices/questionsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      questions: questionsReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
