// Selects property slice from the global state
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { PropertyView } from '@/types/property.types';
import { useCallback } from 'react';
import { IProperty } from '../../interfaces/property.interface';
import { RootState } from '../../lib/store';
import {
  setMlsProperty,
  setPropertyToEdit,
  setPropertyView,
} from '@/slices/property/property-slice';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';

export const property = (state: RootState) => state.property;

/**
 * @description  Hook providing actions related to property for use in components
 * @returns {Object} An object containing property, current view amongst other things.
 */

export const usePropertyActions = () => {
  const dispatch = useAppDispatch();

  return {
    /**
     * @description Action to perform a set the property view.
     */
    savePropertyView: useCallback(
      (view: PropertyView) => {
        dispatch(setPropertyView(view));
      },

      [dispatch],
    ),

    saveCurrenctProperty: useCallback(
      (property: IProperty) => {
        dispatch(setPropertyToEdit(property));
      },
      [dispatch],
    ),
    saveMlsProperty: useCallback(
      (property: MlsPropertyListing) => {
        dispatch(setMlsProperty(property));
      },
      [dispatch],
    ),
  };
};

export const useProperty = () => {
  return useAppSelector(property);
};

import { usePropertyStore, SUB_CATEGORIES } from '@/store/use-property-store';
import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

export const useFilteredProperties = (propertiesOverride?: any[] | null) => {
  const { allProperties, selectedSubCategories, drawFilteredPropertyIds } = usePropertyStore();
  const searchParams = useSearchParams();

  // Extract characteristic filters from URL
  const filters = useMemo(() => ({
    priceMin: Number(searchParams.get('priceMin')) || null,
    priceMax: Number(searchParams.get('priceMax')) || null,
    beds: Number(searchParams.get('bedRooms')) || null,
    baths: Number(searchParams.get('bathRooms')) || null,
  }), [searchParams]);
  
  const baseProperties = propertiesOverride !== undefined && propertiesOverride !== null 
    ? propertiesOverride 
    : allProperties;

  // 1. Initial filter based on map draw area if active
  const displayedProperties = useMemo(() => {
    if (!Array.isArray(drawFilteredPropertyIds) || drawFilteredPropertyIds.length === 0) {
      return baseProperties;
    }

    // Reuse identify function or logic
    const resolveId = (item: any): string | undefined => {
      const raw =
        item?.id ??
        item?.listingId ??
        item?.listing_id ??
        item?.listing?.id ??
        item?.listing?.listingId ??
        item?.mlsId ??
        item?.mls_id ??
        item?.propertyId;
      return raw ? String(raw) : undefined;
    };

    return (baseProperties || []).filter((p: any) => {
      const id = resolveId(p);
      return !!id && drawFilteredPropertyIds.includes(id);
    });
  }, [baseProperties, drawFilteredPropertyIds]);

  // 1.5. Filter based on price, beds, and baths from URL
  const characteristicFiltered = useMemo(() => {
    return (displayedProperties || []).filter((p: any) => {
      // Robust resolution matching the store and component logic
      const listing = p?.listing || p?.data?.listing || p;
      const props = listing?.property || listing?.data || p?.data?.property || {};
      
      const price = Number(listing?.listPriceLow ?? listing?.ListPrice ?? listing?.listPrice ?? p?.price ?? 0);
      const beds = Number(props?.BedroomsTotal ?? props?.bedroomsTotal ?? props?.bedroomTotal ?? p?.beds ?? p?.bedrooms ?? 0);
      const baths = Number(props?.BathroomsTotalInteger ?? props?.bathroomsTotal ?? props?.bathroomTotal ?? p?.baths ?? p?.bathrooms ?? 0);

      if (filters.priceMin !== null && price < filters.priceMin) return false;
      if (filters.priceMax !== null && price > filters.priceMax) return false;
      if (filters.beds !== null && beds < filters.beds) return false;
      if (filters.baths !== null && baths < filters.baths) return false;

      return true;
    });
  }, [displayedProperties, filters]);

  // 2. Further filter based on features (selectedSubCategories)
  return useMemo(() => {
    const source = characteristicFiltered;
    if (selectedSubCategories.length === 0) return source;
    
    return (source || []).filter((p: any) => {
      const listing = p?.listing || p?.data?.listing || p;
      const props = listing?.property || listing?.data || p?.data?.property || {};
      const remarks = String(listing?.publicRemarks || '').toLowerCase();
      const views = Array.isArray(listing?.View) ? listing.View : (Array.isArray(props?.View) ? props.View : []);
      const viewStr = views.join(' ').toLowerCase();

      return selectedSubCategories.every((subCat) => {
        const sub = SUB_CATEGORIES.find((s) => s.title === subCat || s.value === subCat);
        if (!sub) return true;

        // 1. Specialized checks for MLS standard fields (Highest Priority)
        if (sub.title === 'Pool') {
          const poolYN = listing.PoolPrivateYN ?? props.PoolPrivateYN;
          if (poolYN === true || poolYN === 'true' || poolYN === 'Y') return true;
          if (poolYN === false || poolYN === 'false' || poolYN === 'N') return false;
        }
        if (sub.title === 'Waterfront') {
          const waterYN = listing.WaterfrontYN ?? props.WaterfrontYN;
          if (waterYN === true || waterYN === 'true' || waterYN === 'Y') return true;
          if (waterYN === false || waterYN === 'false' || waterYN === 'N') return false;
        }

        // 2. Check strict boolean/flag fields from candidates (Source of Truth)
        // If these are explicitly FALSE, we stop here and exclude (ignoring remarks)
        const flagValue = props[sub.propertyKey] ?? listing[sub.propertyKey];
        if (flagValue === true || flagValue === 'true' || flagValue === 'Y') return true;
        if (flagValue === false || flagValue === 'false' || flagValue === 'N') return false;

        // 3. Check View array for specific indicators
        if (sub.title === 'Park View' && viewStr.includes('park')) return true;
        if (sub.title === 'City View' && viewStr.includes('city')) return true;
        if (sub.title === 'Water View' && (viewStr.includes('water') || viewStr.includes('lake') || viewStr.includes('ocean') || viewStr.includes('river'))) return true;

        // 4. Fallback to keywords in remarks (ONLY if flags were missing/null)
        if (remarks && sub.keywords && sub.keywords.length > 0) {
          return sub.keywords.some((k) => remarks.includes(k.toLowerCase()));
        }

        return false;
      });
    });
  }, [characteristicFiltered, selectedSubCategories]);
};

/**
 * @description Centralized helper to resolve coordinates from a property object
 */
export const resolvePropertyCoordinates = (allProperties: any[]) => {
  const resolveId = (item: any): string | undefined => {
    const raw =
      item?.id ??
      item?.listingId ??
      item?.listing_id ??
      item?.listing?.id ??
      item?.listing?.listingId ??
      item?.mlsId ??
      item?.mls_id ??
      item?.propertyId;
    return raw ? String(raw) : undefined;
  };

  return (allProperties || []).map((property: any) => {
    const lat = property?.public?.latitude ?? property?._raw_public?.latitude ?? property?._raw_listing?.property?.latitude ?? property?.latitude ?? property?.lat;
    const lng = property?.public?.longitude ?? property?._raw_public?.longitude ?? property?._raw_listing?.property?.longitude ?? property?.longitude ?? property?.lon;
    return {
      id: resolveId(property),
      price: property?.listing?.listPriceLow ?? property?._raw_listing?.listPriceLow ?? property?.price,
      lat: typeof lat === 'number' ? lat : parseFloat(lat),
      lng: typeof lng === 'number' ? lng : parseFloat(lng),
    };
  }).filter(coord => Number.isFinite(coord.lat) && Number.isFinite(coord.lng));
};
