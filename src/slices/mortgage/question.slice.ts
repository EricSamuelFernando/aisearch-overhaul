import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Question {
  id: number;
  order: number;
  content: string;
  completed: boolean;
  required: boolean;
}

interface StepperData {
  id: number;
  order: number;
  title: string;
  description: string;
  questions: Question[];
  completed: boolean;
  activeQuestionIndex?: number;  
}
interface ProcessData {
  id: number | string;
  name: string;
  steps: StepperData[];
}
type InitialStateType = {
  processData: ProcessData;
  loading: boolean;
  currentStep: number;
};

const initialState: InitialStateType = {
  currentStep: 0,
  processData: { id: "", name: "", steps: [] },
  loading: true,
};
export const questionsSlice = createSlice({
  name: "questions",
  initialState: initialState,
  reducers: {
    setProcessList: (state, action: PayloadAction<ProcessData>) => {
      console.log(state)
      const steps = action.payload.steps.map((step) => {
        const questions = step.questions.sort((a, b) => a.order - b.order);
        console.log(questions)
        return { ...step, questions };
      });

      state.processData = { ...action.payload, steps };
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload; // Set the currentStep to the selected index
    },
    completeCurrentStep: (
      state,
      action: PayloadAction<{
        currentStep: number;
        questionSlNo: number;
        questionIndex: number;
      }>
    ) => {
      const { currentStep, questionIndex, questionSlNo } = action.payload;
      const currentStepper = state.processData.steps[currentStep];
      currentStepper.questions.forEach((content: Question) => {
        if (content.order === questionSlNo) {
          content.completed = true;
        }
      });

      if (questionIndex === currentStepper.questions.length - 1) {
        currentStepper.completed = true;
        state.currentStep = currentStep + 1;
      }
    },
    moveBackToPreviousQuestion: (
      state,
      action: PayloadAction<{
        questionSlNo: number;
        questionIndex: number;
      }>
    ) => {
      const { questionIndex, questionSlNo } = action.payload;
      const currentStepper = state.processData.steps[state.currentStep];
      currentStepper.questions.forEach((content: Question) => {
        if (content.order === questionSlNo) {
          content.completed = false;
        }
      });

      if (questionIndex === currentStepper.questions.length - 1) {
        currentStepper.completed = false;
        state.currentStep = state.currentStep - 1;
      }
    },
    moveBackToPreviousStep: (state) => {
      if (state.currentStep > 0) {
        state.processData.steps[state.currentStep - 1].questions =
          state.processData.steps[state.currentStep - 1].questions.map(
            (content) => ({
              ...content,
              completed: false,
            })
          );
        state.processData.steps[state.currentStep - 1].completed = false;
        state.currentStep = state.currentStep - 1;
      }
    },
    moveToLastStep: (state) => {
      state.currentStep = 3; // Move to Credit History Step (4th Step)
      const creditHistoryStep = state.processData.steps[3];
      const activeQuestion = creditHistoryStep.questions.find(q => q.order === 5);
      
      if (activeQuestion) {
          creditHistoryStep.activeQuestionIndex = creditHistoryStep.questions.indexOf(activeQuestion);
      }
    },
    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
  },
});

export const {
  completeCurrentStep,
  moveBackToPreviousStep,
  moveBackToPreviousQuestion,
  startLoading,
  stopLoading,
  setProcessList,
  setCurrentStep,  // Ensure setCurrentStep is exported here
  moveToLastStep,
} = questionsSlice.actions;

export default questionsSlice.reducer;
