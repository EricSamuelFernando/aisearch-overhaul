import { IProperty } from '@/interfaces/property.interface';
import { PropertyView } from '@/types/property.types';
import { createSlice } from '@reduxjs/toolkit';
import {
  NullablePropertyListing,
  MlsPropertyListing,
} from '@/interfaces/mls-data.interface';

interface PropertyFilters {
  bedRooms: number | null;
  bathRooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  query: string;
  viewType: string;
  propertyType: string;
  subType: string;
}

interface PropertyState {
  currentView: PropertyView;
  property: Partial<IProperty>;
  propertyQuery: string;
  mlsProperty: Partial<MlsPropertyListing>;
  engagedProperty: any;
  claimProperty: any;
  selectedOffer:any;
  filters: PropertyFilters;
}


const initialState: PropertyState = {
  currentView: 'map',
  property: {},
  propertyQuery: "",
  mlsProperty: {},
  engagedProperty: {},
  claimProperty:{},
  selectedOffer:{},
  filters: {
    bedRooms: null,
    bathRooms: null,
    minPrice: null,
    maxPrice: null,
    query: '',
    viewType: '',
    propertyType: '',
    subType: '',
  },
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setPropertyView: (state, action) => {
      state.currentView = action.payload;
    },
    setPropertyQuery: (state, action) => {
      state.propertyQuery = action.payload
    },
    setPropertyToEdit: (state, action) => {
      return {
        ...state,
        property: action.payload,
      };
    },
    setOffer: (state, action) => {
      console.log(action.payload)
      state.selectedOffer = action.payload || {}
    },
    setMlsProperty: (state, action) => {
      state.mlsProperty = action.payload;
    },
    setEngagedProperty: (state, action) => {
      state.engagedProperty = action.payload;
    },
    setClaimProperty: (state, action) => {
      state.claimProperty = action.payload;
    },
    updateEngagedPropertyCoBuyer: (state, action) => {
      state.engagedProperty.coBuyers = [
        ...(state.engagedProperty.coBuyers || []),
        action.payload
      ];
    },
    addPropertyTourVisit: (state, action) => {
      state.engagedProperty.tours =  action.payload;
    },
    updatePropertyTourVisit: (state, action) => {
      const updatedTour = action.payload;
      const updatedList = state.engagedProperty.tours.events.map((tour: any) =>
        tour.id === updatedTour.id ? { ...tour, ...updatedTour } : tour
      );
      console.log(updatedList)
      state.engagedProperty.tours.events = updatedList
    },
    createPropertyTourEvent: (state, action) => {
      const newEvents = action.payload;
      state.engagedProperty.tours.events = [
        ...state.engagedProperty.tours.events,
        ...newEvents
      ];
    },
    removePropertyTourVisit: (state, action) => {
      const tourId = action.payload;
      const updatedList = state.engagedProperty.tours.events.filter(
        (tour: any) => tour.id !== tourId
      );
      console.log(updatedList)
      state.engagedProperty.tours.events = updatedList
    },

    setSearchFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        bedRooms: null,
        bathRooms: null,
        minPrice: null,
        maxPrice: null,
        query: '',
        viewType: '',
        propertyType: '',
        subType: '',
      };
    },

  },
});

export const {
  setPropertyView,
  updateEngagedPropertyCoBuyer,
  setPropertyToEdit,
  setMlsProperty,
  setPropertyQuery,
  setEngagedProperty,
  setClaimProperty,
  addPropertyTourVisit,
  updatePropertyTourVisit,
  removePropertyTourVisit,
  createPropertyTourEvent,
  setOffer,
  setSearchFilters,
  resetFilters
} =
  propertySlice.actions;
export default propertySlice.reducer;
