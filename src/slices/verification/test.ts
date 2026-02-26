import { PropertyAddressDetails, PropertyDetails } from '@/types/property.types';
import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialPropertyDetails: PropertyDetails = {
  _id: '',
  propertyAddressDetails: {
    formattedAddress: '',
    latitude: '',
    longitude: '',
    placeId: '',
    streetNumber: '',
    streetName: '',
    city: '',
    province: '',
    state: '',
    postalCode: '',
    country: '',
  },
  latitude: '',
  longitude: '',
  placeId: '',
  streetNumber: '',
  streetName: '',
  city: '',
  province: '',
  state: '',
  postalCode: '',
  country: '',
  images: [],
};

type UpdatePropertyDetailsPayload = {
  field: keyof PropertyDetails;
  value: PropertyDetails[keyof PropertyDetails];
};

const updatePropertyAddressDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<PropertyAddressDetails>
> = (state, action) => {
  state.propertyAddressDetails = action.payload;
};

const updatePropertyDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<UpdatePropertyDetailsPayload>
> = (state, action) => {
  // Dynamic key updates are fine for this scratch slice.
  (state as any)[action.payload.field] = action.payload.value;
};

const setPropertyDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<Partial<PropertyDetails>>
> = (state, { payload }) => ({
  ...state,
  ...payload,
});

const resetPropertyDetails: CaseReducer<PropertyDetails> = () => ({
  ...initialPropertyDetails,
});

export const propertyVerificationTestSlice = createSlice({
  name: 'propertyVerificationTest',
  initialState: initialPropertyDetails,
  reducers: {
    updatePropertyAddressDetailsAction: updatePropertyAddressDetails,
    updatePropertyDetailsAction: updatePropertyDetails,
    setPropertyDetailsAction: setPropertyDetails,
    resetPropertyDetailsAction: resetPropertyDetails,
  },
});

export const {
  updatePropertyAddressDetailsAction,
  updatePropertyDetailsAction,
  setPropertyDetailsAction,
  resetPropertyDetailsAction,
} = propertyVerificationTestSlice.actions;

export default propertyVerificationTestSlice.reducer;
