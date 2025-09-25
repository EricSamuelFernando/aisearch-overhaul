import { create } from 'zustand';
import {
  UnifiedLandingPropertiesType,
  IProperty,
} from '@/interfaces/property.interface';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';

interface PropertyStore {
  allProperties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[];
  isLoading: boolean;

  searchQuery:string;
  allCoordinates:any;
  setAllProperties: (
    properties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[],
  ) => void;
  addProperties: (
    properties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[],
  ) => void;
  setSearchedQuery:(query:string) => void;
  clearProperties: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  allProperties: [],
  isLoading: true,
  searchQuery:"",
  allCoordinates:[],
  setAllProperties: (properties) => set({ allProperties: properties }),

  addProperties: (properties) =>
    set((state) => ({
      allProperties: [...properties],
    
      allCoordinates: properties
      .filter((obj:any) => typeof obj.latitude === 'string' && typeof obj.longitude === 'string')
      .map((obj:any) => ({
        id:obj.id,
        price:obj.mostRecentPriceAmount,
        lat: parseFloat(obj.latitude)!,
        lng: parseFloat(obj.longitude)!,
      }))
    })),
  setSearchedQuery:(query:string) => set({
    searchQuery:query
  }),
  clearProperties: () => set({ allProperties: [] }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
