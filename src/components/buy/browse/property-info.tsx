'use client';

import CustomMap from '@/components/custom-map';
import { cn } from '@/lib/utils';
import { useProperty, usePropertyActions } from '@/shared/hooks/useProperty';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { BuyPropertyCards } from '../buy-property-cards';
import { usePropertyStore } from '@/store/use-property-store';
import { incrementSearchCount } from '@/slices/onboarding/property-preference';
import { setPropertyQuery } from '@/slices/property/property-slice';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { error } from '@/components/alert/notify';
import { RootState } from '@/lib/store';
import axios from 'axios';
import { PROPERTY_SEARCH_AI_URL } from '@/shared/constants/env';
import { useAuth } from '@/shared/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import { isMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';
import { Grid2X2, Map, MapPinned, SlidersHorizontal } from 'lucide-react';
import FilterDrawer from './filter-drawer';
import { FeatureBathroomSelector, FeatureSelector } from '../property-filter';

type Props = {};

function PropertyBrowseView({ }: Props) {
  const { currentView } = useProperty();
  const { savePropertyView } = usePropertyActions();
  const divRef = useRef<HTMLDivElement>(null);
  const isSearchingRef = useRef(false);
  const lastSearchFingerprintRef = useRef<string>('');
  const lastSearchSentAtRef = useRef<number>(0);
  const [divHeight, setDivHeight] = useState<number | null>(null);
  const {
    allProperties,
    addProperties,
    setSearchedQuery,
    clearProperties,
    isCompareMode,
    setCompareMode,
    selectedCompareProperties,
    clearCompareProperties,
  } = usePropertyStore();
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { searchCount } = useAppSelector((state: RootState) => state.propertyPreference);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const activeSearchFilters = useMemo(() => ({
    bedrooms: Number(searchParams.get('bedRooms') || '') || undefined,
    bathrooms: Number(searchParams.get('bathRooms') || '') || undefined,
    listing_price_min: Number(searchParams.get('priceMin') || '') || undefined,
    listing_price_max: Number(searchParams.get('priceMax') || '') || undefined,
    listing_property_type: searchParams.get('propertyType') || undefined,
    public_land_use: searchParams.get('subType') || undefined,
  }), [searchParams]);
  const activeSearchFiltersKey = useMemo(
    () => JSON.stringify(activeSearchFilters),
    [activeSearchFilters],
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapPinned, setIsMapPinned] = useState(true);
  const [mapOverlay, setMapOverlay] = useState<'none' | 'schools'>('none');
  const [drawFilteredPropertyIds, setDrawFilteredPropertyIds] = useState<string[] | null>(null);
  const [clearDrawSignal, setClearDrawSignal] = useState(0);
  const overlayFilterSubCategories: any[] = [];
  const overlaySelectedSubCategories: any[] = [];

  const displayedProperties = Array.isArray(drawFilteredPropertyIds)
    ? (Array.isArray(allProperties)
      ? allProperties.filter((p: any) => drawFilteredPropertyIds.includes(String(p?.id)))
      : [])
    : allProperties;

  const coordinates = allProperties?.map((property: any) => ({
    id: property.id,
    price: property?.listing?.listPriceLow,
    lat: property?.public?.latitude,
    lng: property?.public?.longitude,
  })).filter(coord => coord.lat && coord.lng);

  const resultCount = Array.isArray(displayedProperties) ? displayedProperties.length : 0;
  const hasDrawFilter = Array.isArray(drawFilteredPropertyIds);

  useEffect(() => {
    if (divRef.current) {
      setDivHeight(divRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    sessionStorage.removeItem('search');
    return () => sessionStorage.removeItem('search');
  }, []);

  const sendSearchRequest = useCallback(
    debounce(async (body: Record<string, any>) => {
      if (isSearchingRef.current) return;

      const fingerprint = JSON.stringify({
        mode: isMlsBypassModeEnabled() ? 'mls' : 'ai',
        query: query ?? '',
        ...activeSearchFilters,
        ...body,
        latitude:
          typeof body?.latitude === 'number' ? Number(body.latitude.toFixed(3)) : body?.latitude,
        longitude:
          typeof body?.longitude === 'number' ? Number(body.longitude.toFixed(3)) : body?.longitude,
      });
      const isMapRefresh = body?.latitude !== undefined && body?.longitude !== undefined;
      const duplicateCooldownMs = isMapRefresh ? 6000 : 1500;
      const now = Date.now();
      if (
        lastSearchFingerprintRef.current === fingerprint &&
        now - lastSearchSentAtRef.current < duplicateCooldownMs
      ) {
        return;
      }
      lastSearchFingerprintRef.current = fingerprint;
      lastSearchSentAtRef.current = now;

      isSearchingRef.current = true;
      setIsSearching(true);
      try {
        const searchUrl = isMlsBypassModeEnabled()
          ? '/api/mls/search'
          : (PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search');

        const response = await axios.post(searchUrl, {
          ...activeSearchFilters,
          ...body,
          query,
          radius: 20
        });

        const newProperties = response?.data?.records || response?.data?.result?.records;

        if (Array.isArray(newProperties) && newProperties.length > 0) {
          if (body.latitude && body.longitude) {
            clearProperties();
          }

          setSearchedQuery(JSON.stringify(newProperties));
          addProperties(newProperties);
          dispatch(incrementSearchCount());
          dispatch(setPropertyQuery(response.data.search_query));
        } else {
          console.log("No properties found for the current map view");
        }
      } catch (err: any) {
        console.error('Search request failed:', err);
        error({
          message: err?.response?.data?.error || 'An unexpected error occurred.',
        });
      } finally {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    }, 1000),
    [query, activeSearchFiltersKey, clearProperties, addProperties, setSearchedQuery, dispatch],
  );

  useEffect(() => {
    const handlePinState = () => setIsMapPinned(true);
    handlePinState();
    window.addEventListener('resize', handlePinState);
    return () => {
      window.removeEventListener('resize', handlePinState);
    };
  }, []);

  if (currentView === 'map') {
    return (
      <section className="relative mb-0 flex-1 min-h-0 w-full px-4 pb-0 md:px-6">
        <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div ref={mapRef} className="absolute inset-0">
            <CustomMap
              width="100%"
              coord={coordinates}
              zoom={13}
              properties={displayedProperties}
              height="100%"
              searchQuery={query ?? ''}
              showDistricts={mapOverlay === 'schools'}
              overlayValue={mapOverlay}
              onOverlayChange={setMapOverlay}
              onMarkerClick={(id: string) => setSelectedProperty(id)}
              onDrawFilterChange={(ids) => {
                setDrawFilteredPropertyIds(ids);
                if (!ids || ids.length === 0) return;
                if (selectedProperty && !ids.includes(String(selectedProperty))) {
                  setSelectedProperty('');
                }
              }}
              clearDrawSignal={clearDrawSignal}
              useOverlayResultsRail
              onMapMove={(center) => {
                if (isMlsBypassModeEnabled()) return;
                sendSearchRequest({ latitude: center.lat, longitude: center.lng });
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[620px] max-w-[44vw] lg:block">
            <div className="pointer-events-auto flex h-full flex-col border-r border-gray-200 bg-[#f7f7f7]">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-[15px] font-bold text-gray-900">
                      Real Estate & Homes For Sale
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-gray-600">
                      {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Sort: Homes for You
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <MapPinned className="h-3.5 w-3.5" />
                  {query ? `Results for ${query}` : 'Search Results'}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <FilterDrawer
                    FeatureSelectorComponent={FeatureSelector}
                    FeatureBathroomSelector={FeatureBathroomSelector}
                    subCategories={overlayFilterSubCategories}
                    selectedSubCategories={overlaySelectedSubCategories}
                  />
                  <button
                    type="button"
                    onClick={() => savePropertyView('map')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                      currentView === 'map'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    )}
                  >
                    <Map className="h-3.5 w-3.5" />
                    Map
                  </button>
                  <button
                    type="button"
                    onClick={() => savePropertyView('grid')}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    <Grid2X2 className="h-3.5 w-3.5" />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompareMode(!isCompareMode);
                      if (isCompareMode) clearCompareProperties();
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                      isCompareMode
                        ? 'bg-ocOrange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {isCompareMode ? 'Cancel Compare' : 'Compare'}
                  </button>
                  {isCompareMode ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                      {selectedCompareProperties.length} selected
                    </span>
                  ) : null}
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                    {resultCount} listing{resultCount === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapOverlay((prev) => (prev === 'schools' ? 'none' : 'schools'))}
                    className={cn(
                      'rounded-full px-2.5 py-1',
                      mapOverlay === 'schools'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    )}
                  >
                    {mapOverlay === 'schools' ? 'Schools Layer On' : 'Schools'}
                  </button>
                  {hasDrawFilter ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawFilteredPropertyIds(null);
                        setClearDrawSignal((prev) => prev + 1);
                      }}
                      className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700 hover:bg-orange-100"
                    >
                      Draw Area: {drawFilteredPropertyIds?.length ?? 0} (Clear)
                    </button>
                  ) : null}
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                    {isMlsBypassModeEnabled() ? 'MLS Direct' : 'AI Search'}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden p-3">
                <BuyPropertyCards
                  selectedProperty={selectedProperty}
                  propertiesOverride={displayedProperties}
                  overlayMode
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 lg:hidden">
          <div className="mb-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <div className="text-sm font-semibold text-gray-900">
              {query ? `Results for ${query}` : 'Listings'}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {resultCount} listing{resultCount === 1 ? '' : 's'}
              {hasDrawFilter ? ` • Draw Area: ${drawFilteredPropertyIds?.length ?? 0}` : ''}
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            <BuyPropertyCards
              selectedProperty={selectedProperty}
              propertiesOverride={displayedProperties}
              overlayMode
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative mb-20 mx-auto grid w-full max-w-[1600px] grid-cols-5 gap-x-8"
    >
      {/* Property Cards */}
      <div
        ref={divRef}
        // className={cn(
        //   'px-4 md:px-8',
        //   currentView === 'map' ? 'col-span-3 px-[3.12rem]' : 'col-span-5',
        // )}
        className={cn(
          'px-4 md:px-6',
          'col-span-5',
        )}
      >
        <BuyPropertyCards selectedProperty={selectedProperty} propertiesOverride={displayedProperties} />
      </div>

      {currentView !== 'grid' ? (
        <div
          ref={mapRef}
        className={cn(
          'relative w-full px-4 md:px-6 lg:px-0',
          isMapPinned ? 'lg:sticky lg:top-[88px]' : 'lg:relative',
          'h-[420px] sm:h-[500px] lg:h-[calc(100vh-230px)]'
          )}
        >
          <CustomMap
            width="100%"
            coord={coordinates}
            zoom={13}
            properties={displayedProperties}
            height="100%"
            searchQuery={query ?? ''}
            showDistricts={mapOverlay === 'schools'}
            overlayValue={mapOverlay}
            onOverlayChange={setMapOverlay}
            onMarkerClick={(id: string) => setSelectedProperty(id)}
            onDrawFilterChange={(ids) => {
              setDrawFilteredPropertyIds(ids);
              if (!ids || ids.length === 0) return;
              if (selectedProperty && !ids.includes(String(selectedProperty))) {
                setSelectedProperty('');
              }
            }}
            clearDrawSignal={clearDrawSignal}
            onMapMove={(center) => {
              if (isMlsBypassModeEnabled()) return;
              sendSearchRequest({ latitude: center.lat, longitude: center.lng });
            }}
          />
        </div>
      ) : null}

      {/* Fixed Map on Right */}
    </section>

  );
}

export default PropertyBrowseView;
