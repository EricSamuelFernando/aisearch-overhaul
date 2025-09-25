
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
    linkToken : ""
}

export const PlaidSlice = createSlice({
    name:"plaidSlice",
    initialState,
    reducers:{
        setLinkToken :(state,action:PayloadAction<any>) =>{
          state.linkToken=action.payload
        }
    }
})

export const { setLinkToken } = PlaidSlice.actions;

export default PlaidSlice.reducer;
