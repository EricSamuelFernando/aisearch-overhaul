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
  /** Identifies the query+mode+filters that produced the current allProperties.
   *  Used to skip redundant API calls on back-navigation. */
  lastSearchKey: string | null;
  setAllProperties: (
    properties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[],
  ) => void;
  addProperties: (
    properties: UnifiedLandingPropertiesType<IProperty | MlsPropertyListing>[],
  ) => void;
  setSearchedQuery: (query: string) => void;
  setLastSearchKey: (key: string | null) => void;
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
  lastSearchKey: null,

  // Comparison Feature State
  isCompareMode: false,
  selectedCompareProperties: [],

  setAllProperties: (properties) => set({ allProperties: properties }),

  addProperties: (properties) =>
    set((state) => {
      const existingIds = new Set(
        state.allProperties.map((p: any) => {
          const d = p.data || p;
          return d.id || d._id || d.ListingKey || d.listingId || d.ListingId;
        }).filter(Boolean)
      );

      const newUniqueProperties = properties.filter((p: any) => {
        const d = p.data || p;
        const id = d.id || d._id || d.ListingKey || d.listingId || d.ListingId;
        return !id || !existingIds.has(id);
      });

      const updatedProperties = [...state.allProperties, ...newUniqueProperties];

      return {
        allProperties: updatedProperties,
        allCoordinates: updatedProperties
          .filter((obj: any) => {
            const d = obj.data || obj;
            return typeof d.latitude === 'string' && typeof d.longitude === 'string';
          })
          .map((obj: any) => {
            const d = obj.data || obj;
            return {
              id: d.id || d.listingId || d.ListingKey || d.ListingId,
              price: d.mostRecentPriceAmount || d.ListPrice || d.price,
              lat: parseFloat(d.latitude)!,
              lng: parseFloat(d.longitude)!,
            };
          }),
      };
    }),
  setSearchedQuery: (query: string) => set({
    searchQuery: query
  }),
  setLastSearchKey: (key) => set({ lastSearchKey: key }),
  clearProperties: () => set({ allProperties: [], lastSearchKey: null }),
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