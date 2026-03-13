import { create } from 'zustand';
import {
  UnifiedLandingPropertiesType,
  IProperty,
} from '@/interfaces/property.interface';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';

const toMetricNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const shouldExcludeZeroBedZeroBath = (listing: any, data: any): boolean => {
  const props = listing?.property || listing?.data || data?.property || {};
  const beds = toMetricNumber(
    props?.BedroomsTotal ??
    props?.bedroomsTotal ??
    props?.bedroomTotal ??
    data?.bedroomTotal ??
    data?.beds ??
    data?.bedrooms
  );
  const baths = toMetricNumber(
    props?.BathroomsTotalInteger ??
    props?.bathroomsTotal ??
    props?.bathroomTotal ??
    data?.bathroomTotal ??
    data?.baths ??
    data?.bathrooms
  );

  // Keep listings where either metric is unknown; only block explicit 0/0.
  return beds === 0 && baths === 0;
};

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

  setAllProperties: (properties) => set({
    allProperties: (() => {
      const uniqueBatch: any[] = [];
      const seenSignatures = new Set<string>();

      properties.forEach((p: any) => {
        const d = p.data || p;
        const listing = p?.listing || p?.data?.listing || d?.listing || d;
        if (shouldExcludeZeroBedZeroBath(listing, d)) return;

        // Deduplication signature: Address + Price + City (normalized)
        const addr = (listing?.address?.unparsedAddress ?? d?.UnparsedAddress ?? d?.unparsedAddress ?? d?.address ?? "").toString().toLowerCase().trim();
        const city = (listing?.address?.city ?? d?.City ?? d?.city ?? "").toString().toLowerCase().trim();
        const price = listing?.listPriceLow ?? listing?.ListPrice ?? listing?.listPrice ?? d?.price ?? 0;
        const signature = `${addr}|${city}|${price}`;

        if (signature && !seenSignatures.has(signature)) {
          uniqueBatch.push(p);
          seenSignatures.add(signature);
        }
      });
      return uniqueBatch;
    })()
  }),

  addProperties: (properties) =>
    set((state) => {
      const existingSignatures = new Set(
        state.allProperties.map((p: any) => {
          const d = p.data || p;
          const listing = p?.listing || p?.data?.listing || d?.listing || d;
          const addr = (listing?.address?.unparsedAddress ?? d?.UnparsedAddress ?? d?.unparsedAddress ?? d?.address ?? "").toString().toLowerCase().trim();
          const city = (listing?.address?.city ?? d?.City ?? d?.city ?? "").toString().toLowerCase().trim();
          const price = listing?.listPriceLow ?? listing?.ListPrice ?? listing?.listPrice ?? d?.price ?? 0;
          return `${addr}|${city}|${price}`;
        })
      );

      const newUniqueProperties: any[] = [];
      const seenInBatch = new Set<string>();

      properties.forEach((p: any) => {
        const d = p.data || p;
        const listing = p?.listing || p?.data?.listing || d?.listing || d;
        if (shouldExcludeZeroBedZeroBath(listing, d)) return;

        const addr = (listing?.address?.unparsedAddress ?? d?.UnparsedAddress ?? d?.unparsedAddress ?? d?.address ?? "").toString().toLowerCase().trim();
        const city = (listing?.address?.city ?? d?.City ?? d?.city ?? "").toString().toLowerCase().trim();
        const price = listing?.listPriceLow ?? listing?.ListPrice ?? listing?.listPrice ?? d?.price ?? 0;
        const signature = `${addr}|${city}|${price}`;

        if (signature && !existingSignatures.has(signature) && !seenInBatch.has(signature)) {
          newUniqueProperties.push(p);
          seenInBatch.add(signature);
        }
      });

      const updatedProperties = [...state.allProperties, ...newUniqueProperties];

      return {
        allProperties: updatedProperties,
        allCoordinates: updatedProperties
          .filter((obj: any) => {
            const d = obj.data || obj;
            const lat = d.latitude ?? d.lat;
            const lng = d.longitude ?? d.lon;
            return (typeof lat === 'number' || typeof lat === 'string') && (typeof lng === 'number' || typeof lng === 'string');
          })
          .map((obj: any) => {
            const d = obj.data || obj;
            const lat = d.latitude ?? d.lat;
            const lng = d.longitude ?? d.lon;
            return {
              id: d.id || d.listingId || d.ListingKey || d.ListingId,
              price: d.mostRecentPriceAmount || d.ListPrice || d.price,
              lat: typeof lat === 'number' ? lat : parseFloat(lat)!,
              lng: typeof lng === 'number' ? lng : parseFloat(lng)!,
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
