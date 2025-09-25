import { createSlice } from '@reduxjs/toolkit';

interface ChatStates {
  messages?:Object;
  threads?:Object;
  messageUnreadCount?:Number;
  conversationUnreadCount?:Number;
  selectedChannel?:{};
  selectedThreadInfo?:any
}

const initialState: ChatStates = {
  messages:{},
  threads: {},
  selectedChannel:{},
  messageUnreadCount:0,
  conversationUnreadCount:0,
  selectedThreadInfo:{}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state,action)=>{
        state.messages = action.payload;
        state.messageUnreadCount = action.payload.unreadCount
    },
    setConversation: (state,action)=>{
        state.messages = action.payload;
        state.conversationUnreadCount = action.payload.unreadCount
    },
    setSelectedChannel:(state,action)=>{
        state.selectedChannel = action.payload;
    },
    setSelectedThreadInfo:(state,action)=>{
      state.selectedThreadInfo = action.payload;
  },
    setMessageUnReadCount:(state,action)=>{
      state.messageUnreadCount = action.payload
    },
    setConveresationUnReadCount:(state,action)=>{
      state.conversationUnreadCount = action.payload
    },
    setChatSliceEmpty:(state,action)=>{
        state.conversationUnreadCount = 0,
        state.messageUnreadCount = 0,
        state.messages = {},
        state.threads = {}
    },
    setPropertyToEdit: (state, action) => {
      return {
        ...state,
        property: action.payload,
      };
    },
  },
});



export const { 
    setConversation,
    setMessages,
    setChatSliceEmpty,
    setSelectedChannel,
    setMessageUnReadCount,
    setConveresationUnReadCount,
    setSelectedThreadInfo
 } = chatSlice.actions;

export const messageUnreadCount = (state:any)=>state.chat.messageUnreadCount;
export const conversationUnreadCount = (state:any)=>state.chat.conversationUnreadCount;
export default chatSlice.reducer;
