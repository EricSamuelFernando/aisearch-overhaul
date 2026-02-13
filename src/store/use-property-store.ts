import { create } from 'zustand';
import {
  UnifiedLandingPropertiesType,
  IProperty,
} from '@/interfaces/property.interface';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';

interface PropertyStore {
  allProperties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[];
  isLoading: boolean;

  searchQuery: string;
  allCoordinates: any;
  setAllProperties: (
    properties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[],
  ) => void;
  addProperties: (
    properties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[],
  ) => void;
  setSearchedQuery: (query: string) => void;
  clearProperties: () => void;
  setIsLoading: (isLoading: boolean) => void;

  // Comparison Feature
  isCompareMode: boolean;
  selectedCompareProperties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[];
  setCompareMode: (mode: boolean) => void;
  toggleCompareProperty: (property: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>) => void;
  clearCompareProperties: () => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  allProperties: [],
  isLoading: true,
  searchQuery: "",
  allCoordinates: [],

  // Comparison Feature State
  isCompareMode: false,
  selectedCompareProperties: [],

  setAllProperties: (properties) => set({ allProperties: properties }),

  addProperties: (properties) =>
    set((state) => ({
      allProperties: [...properties],

      allCoordinates: properties
        .filter((obj: any) => typeof obj.latitude === 'string' && typeof obj.longitude === 'string')
        .map((obj: any) => ({
          id: obj.id,
          price: obj.mostRecentPriceAmount,
          lat: parseFloat(obj.latitude)!,
          lng: parseFloat(obj.longitude)!,
        }))
    })),
  setSearchedQuery: (query: string) => set({
    searchQuery: query
  }),
  clearProperties: () => set({ allProperties: [] }),
  setIsLoading: (isLoading) => set({ isLoading }),

  setCompareMode: (isCompareMode: boolean) => set({ isCompareMode }),

  toggleCompareProperty: (property: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>) =>
    set((state) => {
      const exists = state.selectedCompareProperties.some((p) => {
        // Handle different ID structures (id or _id or ListingKey)
        const pId = (p.data as any).id || (p.data as any)._id || (p.data as any).ListingKey;
        const targetId = (property.data as any).id || (property.data as any)._id || (property.data as any).ListingKey;
        return pId === targetId;
      });

      if (exists) {
        return {
          selectedCompareProperties: state.selectedCompareProperties.filter((p) => {
            const pId = (p.data as any).id || (p.data as any)._id || (p.data as any).ListingKey;
            const targetId = (property.data as any).id || (property.data as any)._id || (property.data as any).ListingKey;
            return pId !== targetId;
          }),
        };
      } else {
        if (state.selectedCompareProperties.length >= 4) {
          // Limit reached
          return state;
        }
        return {
          selectedCompareProperties: [...state.selectedCompareProperties, property],
        };
      }
    }),

  clearCompareProperties: () => set({ selectedCompareProperties: [], isCompareMode: false }),
}));
