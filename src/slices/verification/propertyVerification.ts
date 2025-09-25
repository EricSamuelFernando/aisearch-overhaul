import { IProperty } from '@/interfaces/property.interface';
import { PropertyAddressDetails } from '@/types/property.types';
import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialPropertyAddressDetails: PropertyAddressDetails = {
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
};

const initialPropertyDetails: IProperty = {
  percentageCompleted: 0,
  public: null,
  propertyAddressDetails: initialPropertyAddressDetails,
  propertyStatus: '',
  images: [],
  _id: '',
  videos: [],
  listed: false,
  propertyName: '',
  currentStatus: '',
  seller: {
    _id: '',
    email: '',
    emailVerified: false,
    createdAt: '',
    updatedAt: '',
    __v: 0,
    account_type: '',
    firstname: '',
    fullname: '',
    lastname: '',
    mobile: {
      number_body: '',
      mobile_extension: '',
      raw_mobile: '',
      _id: '',
    },
    token_expiry_time: '',
    verification_code: '',
    stripe_customer_id: '',
    preApproval: true,
    preApprovalDocument: {
      url: '',
      expiryDate: '',
    },
  },
  sellerAgentAcceptance: false,
  buyerAgentAcceptance: false,
  propertyDocument: [],
  brokers: [],
  features: [],
  propertyTaxes: [],
  status: [],
  createdAt: '',
  updatedAt: '',
  lotSizeUnit: '',
  lotSizeValue: '',
  numBathroom: '',
  numBedroom: '',
  longitude: '',
  latitude: '',
  yearBuild: '',
  price: {
    amount: 0,
    currency: '',
  },
  propertyType: '',
  propertyDescription: '',
  buyerAgent: {
    _id: '',
    firstname: '',
    lastname: '',
  },
  sellerAgent: {
    _id: '',
    firstname: '',
    lastname: '',
  },
  listingid: '',
  listingId: '',
  mls_data: {
    data: {
      property: {
        bathroomsTotal: '',
        bedroomsTotal: '',
        livingArea: '',
        lotSizeSquareFeet: '',
        hoa: '',
      },
      publicRemarks: '',
    },
  },
};

const setPropertyDetails: CaseReducer<IProperty, PayloadAction<IProperty>> = (
  state,
  { payload },
) => ({
  ...state,
  ...payload,
});

const resetPropertyDetails: CaseReducer<IProperty> = () => ({
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
