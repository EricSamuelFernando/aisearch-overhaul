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
import SpeechInput from '@/components/speech-input';
import { RootState } from '@/lib/store';
import axios from 'axios';
import { PROPERTY_SEARCH_AI_URL } from '@/shared/constants/env';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import { isMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';
import { Grid2X2, Map, MapPinned, Search, X } from 'lucide-react';
import PropertyComparisonModal from '../property-comparison-model';

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
    setIsLoading,
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
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q');
  const isMlsMode = isMlsBypassModeEnabled();
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
  const [showCompactFilters, setShowCompactFilters] = useState(false);
  const [topSearchValue, setTopSearchValue] = useState(query ?? '');
  const [draftPriceMin, setDraftPriceMin] = useState<string>(searchParams.get('priceMin') || '');
  const [draftPriceMax, setDraftPriceMax] = useState<string>(searchParams.get('priceMax') || '');
  const [draftBeds, setDraftBeds] = useState<string>(searchParams.get('bedRooms') || '');
  const [draftBaths, setDraftBaths] = useState<string>(searchParams.get('bathRooms') || '');
  const [topSearchAnimatedPlaceholder, setTopSearchAnimatedPlaceholder] = useState('');
  const [topSearchPromptIndex, setTopSearchPromptIndex] = useState(0);
  const [topSearchCharIndex, setTopSearchCharIndex] = useState(0);
  const [topSearchDeleting, setTopSearchDeleting] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

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
    setTopSearchValue(query ?? '');
    setDraftPriceMin(searchParams.get('priceMin') || '');
    setDraftPriceMax(searchParams.get('priceMax') || '');
    setDraftBeds(searchParams.get('bedRooms') || '');
    setDraftBaths(searchParams.get('bathRooms') || '');
  }, [query, searchParams]);

  useEffect(() => {
    if (topSearchValue.trim().length > 0) {
      setTopSearchAnimatedPlaceholder('');
      return;
    }

    const prompts = isMlsMode
      ? [
          'Enter an address, city, neighborhood, or ZIP',
          'Try: Manhattan Beach, CA',
          'Try: Los Angeles, CA 90049',
        ]
      : [
          'Show me homes in Los Angeles under 2M',
          'Find 3-bedroom homes in Manhattan Beach',
          'Homes near top-rated schools in Irvine',
        ];

    const prompt = prompts[topSearchPromptIndex % prompts.length];
    const doneTyping = topSearchCharIndex >= prompt.length;
    const doneDeleting = topSearchCharIndex <= 0;

    const delay = topSearchDeleting
      ? 45
      : doneTyping
        ? 900
        : 70;

    const timer = setTimeout(() => {
      if (!topSearchDeleting && !doneTyping) {
        setTopSearchCharIndex((n) => n + 1);
        return;
      }

      if (!topSearchDeleting && doneTyping) {
        setTopSearchDeleting(true);
        return;
      }

      if (topSearchDeleting && !doneDeleting) {
        setTopSearchCharIndex((n) => Math.max(0, n - 1));
        return;
      }

      setTopSearchDeleting(false);
      setTopSearchPromptIndex((n) => (n + 1) % prompts.length);
    }, delay);

    setTopSearchAnimatedPlaceholder(prompt.slice(0, topSearchCharIndex));

    return () => clearTimeout(timer);
  }, [topSearchValue, topSearchPromptIndex, topSearchCharIndex, topSearchDeleting, isMlsMode]);

  useEffect(() => {
    if (divRef.current) {
      setDivHeight(divRef.current.clientHeight);
    }
  }, []);

  const pushBrowseParams = useCallback((mutator: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  }, [pathname, router, searchParams]);

  const handleTopSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const nextQuery = topSearchValue.trim();
    pushBrowseParams((params) => {
      if (nextQuery) params.set('q', nextQuery);
      else params.delete('q');
    });
  }, [pushBrowseParams, topSearchValue]);

  const applyCompactFilters = useCallback(() => {
    pushBrowseParams((params) => {
      const setOrDelete = (key: string, value: string) => {
        const trimmed = value.trim();
        if (trimmed) params.set(key, trimmed);
        else params.delete(key);
      };

      setOrDelete('priceMin', draftPriceMin);
      setOrDelete('priceMax', draftPriceMax);
      setOrDelete('bedRooms', draftBeds);
      setOrDelete('bathRooms', draftBaths);
    });
    setShowCompactFilters(false);
  }, [draftBaths, draftBeds, draftPriceMax, draftPriceMin, pushBrowseParams]);

  const clearCompactFilters = useCallback(() => {
    setDraftPriceMin('');
    setDraftPriceMax('');
    setDraftBeds('');
    setDraftBaths('');
    pushBrowseParams((params) => {
      ['priceMin', 'priceMax', 'bedRooms', 'bathRooms'].forEach((key) => params.delete(key));
    });
    setShowCompactFilters(false);
  }, [pushBrowseParams]);

  useEffect(() => {
    sessionStorage.removeItem('search');
    return () => sessionStorage.removeItem('search');
  }, []);

  const sendSearchRequest = useCallback(
    debounce(async (body: Record<string, any>) => {
      if (isSearchingRef.current) return;
      const fingerprint = JSON.stringify({
        mode: isMlsMode ? 'mls' : 'ai',
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
      setIsLoading(true);
      try {
        const searchUrl = isMlsMode
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
          // Only clear if we are not moving the map (i.e. no latitude/longitude in body) 
          // or if we really want a fresh set. For map moves, we usually want to append or replace smoothly.
          // For now, let's keep the logic but ensure we don't trigger unnecessary re-renders.
          if (body.latitude && body.longitude) {
            clearProperties();
          }

          setSearchedQuery(JSON.stringify(newProperties));
          addProperties(newProperties);
          dispatch(incrementSearchCount());
          dispatch(setPropertyQuery(response.data.search_query));
        } else {
          clearProperties();
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
        setIsLoading(false);
      }
    }, 1000),
    [query, activeSearchFiltersKey, clearProperties, addProperties, setSearchedQuery, setIsLoading, dispatch],
  );

  useEffect(() => {
    const handlePinState = () => setIsMapPinned(true);
    handlePinState();
    window.addEventListener('resize', handlePinState);
    return () => {
      window.removeEventListener('resize', handlePinState);
    };
  }, []);

  useEffect(() => {
    if (currentView !== 'map') return;
    if (!query?.trim()) return;

    sendSearchRequest({});
  }, [currentView, query, activeSearchFiltersKey, sendSearchRequest]);

  if (currentView === 'map') {
    return (
      <>
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
              if (isMlsMode) return;
                sendSearchRequest({ latitude: center.lat, longitude: center.lng });
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[620px] max-w-[44vw] lg:block">
            <div className="pointer-events-auto relative flex h-full flex-col border-r border-gray-200 bg-[#f7f7f7]">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <form onSubmit={handleTopSearchSubmit} className="relative z-30 flex items-center gap-2">
                  <div className="relative min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white shadow-sm ring-1 ring-black/5 transition focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-orange-200">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <SpeechInput
                      value={topSearchValue}
                      setValue={setTopSearchValue}
                      searchType={isMlsMode ? 'address' : 'nlp'}
                      placeholderText={topSearchAnimatedPlaceholder}
                      className="w-full"
                      inputClassName="h-11 w-full rounded-2xl border-0 bg-transparent pl-10 pr-28 text-sm text-gray-900 shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
                    />
                    <span
                      className={cn(
                        'pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        isMlsMode
                          ? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                          : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                      )}
                    >
                      {isMlsMode ? 'AI Off' : 'AI On'}
                    </span>
                    {topSearchValue ? (
                      <button
                        type="button"
                        onClick={() => setTopSearchValue('')}
                        className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="h-11 shrink-0 rounded-2xl bg-ocOrange px-4 text-sm font-semibold text-white shadow-sm hover:brightness-95"
                  >
                    Search
                  </button>
                </form>

                <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <MapPinned className="h-3.5 w-3.5" />
                  {query ? `Results for ${query}` : 'Search Results'}
                  <span className="normal-case tracking-normal text-gray-400">•</span>
                  <span className="normal-case tracking-normal text-gray-600">
                    {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowCompactFilters((prev) => !prev)}
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition',
                      showCompactFilters
                        ? 'border-gray-300 bg-gray-900 text-white'
                        : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200',
                    )}
                  >
                    Filter
                  </button>
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
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                      isCompareMode
                        ? 'bg-ocOrange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    )}
                  >
                    {isCompareMode ? 'Cancel Compare' : 'Compare'}
                  </button>
                  {isCompareMode ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                      {selectedCompareProperties.length} selected
                    </span>
                  ) : null}
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
                </div>

                {showCompactFilters ? (
                  <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="px-1 text-[11px] font-medium text-gray-500">Min price</span>
                        <input
                          inputMode="numeric"
                          value={draftPriceMin}
                          onChange={(e) => setDraftPriceMin(e.target.value.replace(/[^\d]/g, ''))}
                          placeholder="$ Min"
                          className="block w-full appearance-none rounded-full border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                          style={{ height: 40, minHeight: 40, lineHeight: '40px' }}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="px-1 text-[11px] font-medium text-gray-500">Max price</span>
                        <input
                          inputMode="numeric"
                          value={draftPriceMax}
                          onChange={(e) => setDraftPriceMax(e.target.value.replace(/[^\d]/g, ''))}
                          placeholder="$ Max"
                          className="block w-full appearance-none rounded-full border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                          style={{ height: 40, minHeight: 40, lineHeight: '40px' }}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="px-1 text-[11px] font-medium text-gray-500">Beds (min)</span>
                        <select
                          value={draftBeds}
                          onChange={(e) => setDraftBeds(e.target.value)}
                          className="block w-full appearance-none rounded-full border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400"
                          style={{ height: 40, minHeight: 40 }}
                        >
                          <option value="">Beds+</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                          <option value="5">5+</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="px-1 text-[11px] font-medium text-gray-500">Baths (min)</span>
                        <select
                          value={draftBaths}
                          onChange={(e) => setDraftBaths(e.target.value)}
                          className="block w-full appearance-none rounded-full border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400"
                          style={{ height: 40, minHeight: 40 }}
                        >
                          <option value="">Baths+</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                          <option value="5">5+</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={clearCompactFilters}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCompactFilters(false)}
                          className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={applyCompactFilters}
                          className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden p-3">
                <BuyPropertyCards
                  selectedProperty={selectedProperty}
                  propertiesOverride={displayedProperties}
                  overlayMode
                />
              </div>

              {isCompareMode ? (
                <div className="pointer-events-none absolute bottom-52 left-1/2 z-40 -translate-x-1/2">
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(true)}
                    disabled={selectedCompareProperties.length < 2}
                    className={cn(
                      'pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition',
                      selectedCompareProperties.length >= 2
                        ? 'bg-ocOrange text-white hover:brightness-95'
                        : 'cursor-not-allowed bg-white/95 text-gray-400 ring-1 ring-gray-200'
                    )}
                  >
                    Compare
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      selectedCompareProperties.length >= 2
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {selectedCompareProperties.length}
                    </span>
                  </button>
                </div>
              ) : null}
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
        <PropertyComparisonModal
          isOpen={showCompareModal}
          closeModal={() => setShowCompareModal(false)}
        />
      </>
    );
  }

  return (
    <>
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
              if (isMlsMode) return;
              sendSearchRequest({ latitude: center.lat, longitude: center.lng });
            }}
          />
        </div>
      ) : null}

      {/* Fixed Map on Right */}
      </section>
      <PropertyComparisonModal
        isOpen={showCompareModal}
        closeModal={() => setShowCompareModal(false)}
      />
    </>
  );
}

export default PropertyBrowseView;

