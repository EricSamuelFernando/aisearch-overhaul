import { IProperty, ISingleProperty } from '@/interfaces/property.interface';
import {
  PropertyAddressDetails,
  PropertyDetails,
} from '@/types/property.types';
import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialPropertyDetails: PropertyDetails = {
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

const updatePropertyAddressDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<PropertyAddressDetails>
> = (state, action) => {
  state.propertyAddressDetails = action.payload;
};
export type UpdatePropertyDetailsPayload = {
  field: keyof PropertyDetails;
  value: any;
};

const updatePropertyDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<UpdatePropertyDetailsPayload>
> = (state, action) => {
  state[action.payload.field] = action.payload.value;
};

const setPropertyDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<IProperty, 'property'>
> = (state, { payload }) => {
  console.log({ payload });
  return {
    ...state,
    ...payload,
  };
};
const setPropertyDetails: CaseReducer<
  PropertyDetails,
  PayloadAction<IProperty, 'property'>
> = (state, { payload }) => {
  console.log({ payload });
  return {
    ...state,
    ...payload,
  };
};

const resetPropertyDetails: CaseReducer<PropertyDetails> = () => ({
  ...initialPropertyDetails,
});

export const propertyVerificationSlice = createSlice({
  name: 'propertyVerification',
  initialState: initialPropertyDetails,
  reducers: {
    setPropertyDetailsAction: setPropertyDetails,
    resetPropertyDetailsAction: resetPropertyDetails,
  },
});

export const { setPropertyDetailsAction } = propertyVerificationSlice.actions;

// import { IProperty } from '@/interfaces/property.interface'
// import { PropertyAddressDetails, PropertyDetails } from '@/types/property.types'
// import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
// import { WritableDraft } from 'immer'

// // Define initial states
// const initialPropertyAddressDetails: PropertyAddressDetails = {
//   formattedAddress: '',
//   latitude: '',
//   longitude: '',
//   placeId: '',
//   streetNumber: '',
//   streetName: '',
//   city: '',
//   province: '',
//   state: '',
//   postalCode: '',
//   country: '',
//   lotSizeValue: '',
//   lotSizeUnit: '',
//   numBathroom: '',
//   numBedroom: '',
//   propertyType: '',
//   propertyDescription: '',
//   images: [],
//   videos: [],
//   features: [],
//   propertyTaxes: [],
// }

// const initialPropertyDetails: PropertyDetails = {
//   propertyAddressDetails: initialPropertyAddressDetails,
//   latitude: '',
//   longitude: '',
//   placeId: '',
//   streetNumber: '',
//   streetName: '',
//   city: '',
//   province: '',
//   state: '',
//   postalCode: '',
//   country: '',
//   lotSizeValue: '',
//   lotSizeUnit: '',
//   numBathroom: '',
//   numBedroom: '',
//   price: {
//     amount: 0,
//     currency: '',
//   },
//   propertyTaxes: [],
//   propertyType: '',
//   propertyDescription: '',
//   images: [],
//   videos: [],
//   features: [],
// }

// const setPropertyDetails: CaseReducer<
//   WritableDraft<PropertyDetails>,
//   PayloadAction<Partial<IProperty>>
// > = (state, { payload }) => {
//   const {
//     propertyAddressDetails,
//     latitude,
//     longitude,
//     placeId,
//     streetNumber,
//     streetName,
//     city,
//     province,
//     state: propertyState,
//     postalCode,
//     country,
//     lotSizeValue,
//     lotSizeUnit,
//     numBathroom,
//     numBedroom,
//     price,
//     propertyTaxes,
//     propertyType,
//     propertyDescription,
//     images,
//     videos,
//     features,
//   } = payload

//   // Ensure immutability by creating a new state object
//   return {
//     ...state,
//     propertyAddressDetails: {
//       ...state.propertyAddressDetails,
//       ...propertyAddressDetails,
//     },
//     latitude: latitude || state.latitude,
//     longitude: longitude || state.longitude,
//     placeId: placeId || state.placeId,
//     streetNumber: streetNumber || state.streetNumber,
//     streetName: streetName || state.streetName,
//     city: city || state.city,
//     province: province || state.province,
//     state: propertyState || state.state,
//     postalCode: postalCode || state.postalCode,
//     country: country || state.country,
//     lotSizeValue: lotSizeValue || state.lotSizeValue,
//     lotSizeUnit: lotSizeUnit || state.lotSizeUnit,
//     numBathroom: numBathroom || state.numBathroom,
//     numBedroom: numBedroom || state.numBedroom,
//     price: {
//       ...state?.price,
//       ...(price || {}), // Spread existing price properties and update with new ones from payload
//     },
//     propertyTaxes: propertyTaxes || state.propertyTaxes,
//     propertyType: propertyType || state.propertyType,
//     propertyDescription: propertyDescription || state.propertyDescription,
//     images: images || state.images,
//     videos: videos || state.videos,
//     features: features || state.features,
//   }
// }

// // Define the resetPropertyDetails case reducer
// const resetPropertyDetails: CaseReducer<PropertyDetails> = () => ({
//   ...initialPropertyDetails,
// })

// // Create the propertyVerificationSlice
// export const propertyVerificationSlice = createSlice({
//   name: 'propertyVerification',
//   initialState: initialPropertyDetails,
//   reducers: {
//     setPropertyDetailsAction: setPropertyDetails,
//     resetPropertyDetailsAction: resetPropertyDetails,
//   },
// })

// // Export actions and reducer
// export const { setPropertyDetailsAction, resetPropertyDetailsAction } =
//   propertyVerificationSlice.actions
// export default propertyVerificationSlice.reducer
