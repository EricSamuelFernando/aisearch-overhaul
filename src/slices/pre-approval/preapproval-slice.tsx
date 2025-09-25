import { createSlice } from '@reduxjs/toolkit';
import { Agent } from '@/interfaces/agent.interface';
import { FileWithPath } from '@/interfaces/file.interface';

interface PreApprovalState {
  currentStep: number;
  agent: Agent | undefined;
  fileUrl?: string;
  uploadedFiles: File[] | FileWithPath[];
  date: Date | null;
}

const initialState: PreApprovalState = {
  currentStep: 1,
  agent: undefined,
  fileUrl: '',
  date: null,
  uploadedFiles: [],
};

const agentAddingSlice = createSlice({
  name: 'preapproval-document',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setSelectedAgent: (state, action) => {
      state.agent = action.payload;
    },
    setUploadedFile: (state, action) => {
      state.uploadedFiles = action.payload;
    },
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setFileUrl: (state, action) => {
      state.fileUrl = action.payload;
    },
    resetState: () => initialState,
  },
});

export const {
  setCurrentStep,
  setSelectedAgent,
  resetState,
  setUploadedFile,
  setDate,
  setFileUrl,
} = agentAddingSlice.actions;
export default agentAddingSlice.reducer;
