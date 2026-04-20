'use client';

import CustomMap from '@/components/custom-map';
import type { MLSSearchParams } from '@/types/ai-assistant';
import { cn } from '@/lib/utils';
import { setPropertyQuery } from '@/slices/property/property-slice';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { incrementSearchCount } from '@/slices/onboarding/property-preference';
import { useProperty, usePropertyActions, useFilteredProperties, resolvePropertyCoordinates } from '@/shared/hooks/useProperty';
import { SUB_CATEGORIES, usePropertyStore } from '@/store/use-property-store';
import { error, warning } from '@/components/alert/notify';
import SpeechInput from '@/components/speech-input';
import axios from 'axios';
import { PROPERTY_SEARCH_AI_URL, MLS_SEARCH_LIVE_URL } from '@/shared/constants/env';
import { isMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import { ArrowLeft, Building2, Droplets, Grid2X2, List, Map, MapPinned, Search, ShipWheel, SlidersHorizontal, TreePine, Waves, X } from 'lucide-react';
import PropertyComparisonModal from '../property-comparison-modal';
import { BuyPropertyCards } from '../buy-property-cards';
import { storeSearchHistory } from '@/lib/api';

type Props = {};
type MobileSheetMode = 'collapsed' | 'default' | 'full';
type ActiveFilterChip = { id: string; label: string };

type ParsedQueryFilters = {
  bedRooms?: number;
  bathRooms?: number;
  priceMin?: number;
  priceMax?: number;
};

const parseQueryFilters = (query: string): ParsedQueryFilters => {
  const text = query.toLowerCase();
  if (!text) return {};

  const toNumber = (raw: string): number | undefined => {
    const clean = raw.toLowerCase().replace(/,/g, '').trim();
    let value: number;
    if (clean.endsWith('m')) value = parseFloat(clean) * 1_000_000;
    else if (clean.endsWith('k')) value = parseFloat(clean) * 1_000;
    else if (clean.endsWith('b') || clean.endsWith('bn')) value = parseFloat(clean) * 1_000_000_000;
    else if (clean.includes('billion')) value = parseFloat(clean) * 1_000_000_000;
    else if (clean.includes('million')) value = parseFloat(clean) * 1_000_000;
    else value = parseFloat(clean.replace(/[^\d.]/g, ''));
    return Number.isFinite(value) ? Math.round(value) : undefined;
  };

  const bedMatch = text.match(/(\d+)\s*[- ]*(?:bed|bedroom)s?\b/i);
  const bathMatch = text.match(/(\d+)\s*[- ]*(?:bath|bathroom)s?\b/i);

  const base = {
    bedRooms: bedMatch ? Number(bedMatch[1]) : undefined,
    bathRooms: bathMatch ? Number(bathMatch[1]) : undefined,
  };

  const between = text.match(
    /between\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)\s+and\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  if (between) {
    const a = toNumber(between[1]);
    const b = toNumber(between[2]);
    if (a !== undefined && b !== undefined) {
      return { ...base, priceMin: Math.min(a, b), priceMax: Math.max(a, b) };
    }
    return base;
  }

  const dash = text.match(
    /\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)\s*-\s*\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  if (dash) {
    const a = toNumber(dash[1]);
    const b = toNumber(dash[2]);
    if (a !== undefined && b !== undefined) {
      return { ...base, priceMin: Math.min(a, b), priceMax: Math.max(a, b) };
    }
    return base;
  }

  const fromTo = text.match(
    /from\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)\s+(?:to|through|until|till)\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  if (fromTo) {
    const a = toNumber(fromTo[1]);
    const b = toNumber(fromTo[2]);
    if (a !== undefined && b !== undefined) {
      return { ...base, priceMin: Math.min(a, b), priceMax: Math.max(a, b) };
    }
  }

  const maxCue = text.match(
    /\b(at\s*most|atmost|under|below|less than|up to|max(?:imum)?|no more than|not more than|not exceeding|<=|<)\b[^$\d]*\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const minCue = text.match(
    /\b(at\s*least|atleast|over|above|more than|no less than|min(?:imum)?|starting\s*(?:at|from)|from|>=|>)\b[^$\d]*\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const aroundCue = text.match(
    /\baround\b[^$\d]{0,24}\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const budgetCue = text.match(
    /\b(budget|approximately|about|roughly|circa)\b[^$\d]{0,24}\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );

  const minValue = minCue ? toNumber(minCue[2]) : undefined;
  const maxValue = maxCue ? toNumber(maxCue[2]) : budgetCue ? toNumber(budgetCue[2]) : undefined;

  const aroundValue = aroundCue ? toNumber(aroundCue[1]) : undefined;
  if (aroundValue !== undefined) {
    return {
      ...base,
      priceMin: Math.max(0, aroundValue - 50_000),
      priceMax: aroundValue + 50_000,
    };
  }

  if (minValue !== undefined || maxValue !== undefined) {
    return { ...base, priceMin: minValue, priceMax: maxValue };
  }

  const singlePriceKeyword = text.match(
    /\b(for|at|priced(?:\s+at)?|price(?:d)?(?:\s+at)?|costing|listed(?:\s+at)?)\b[^$\d]{0,12}\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const singlePriceKeywordPlain = text.match(
    /\b(for|at|priced(?:\s+at)?|price(?:d)?(?:\s+at)?|costing|listed(?:\s+at)?)\b[^$\d]{0,12}(\d{5,})(?:\b|$)/i,
  );
  const singlePriceDollar = text.match(
    /\$\s*([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const singlePriceComma = text.match(
    /\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?)(?:\s*(?:m|k|b|bn|million|billion))?\b/i,
  );

  const singleRaw = singlePriceKeyword?.[2] ?? singlePriceKeywordPlain?.[2] ?? singlePriceDollar?.[1] ?? singlePriceComma?.[1];
  const singleValue = singleRaw ? toNumber(singleRaw) : undefined;

  return { ...base, priceMax: singleValue };
};

const resolveListingId = (item: any): string | undefined => {
  const raw =
    item?.id ??
    item?.listingId ??
    item?.listing_id ??
    item?.listing?.id ??
    item?.listing?.listingId ??
    item?.mlsId ??
    item?.mls_id ??
    item?.propertyId;
  if (raw === undefined || raw === null || raw === '') return undefined;
  return String(raw);
};

const isLikelyAddressQuery = (input: string): boolean => {
  const text = input.trim().toLowerCase();
  if (!text) return false;

  const aiPattern =
    /\b(bed|bedroom|bath|bathroom|home|homes|house|houses|condo|townhome|under|over|between|with|without|near|around|budget|price|prices|\$|million|billion)\b/;
  if (aiPattern.test(text)) return false;

  if (/\d{5}(?:-\d{4})?\b/.test(text)) return true;
  if (/^\d+\s+\w+/.test(text)) return true;
  if (text.includes(',')) return true;

  return /^[a-z\s.'-]{2,}$/i.test(text);
};

const LOCATION_TRAILING_CUES =
  /\b(with|under|over|between|from|to|for|priced?|budget|max|min|bed|beds|bedroom|bedrooms|bath|baths|bathroom|bathrooms|sqft|sq\.?\s*ft|school|schools)\b.*$/i;

const deriveBrowseLocationQuery = (rawQuery: string | null): string => {
  const cleaned = (rawQuery ?? '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (isLikelyAddressQuery(cleaned)) return cleaned;

  const cueRegex = /\b(?:in|near|around|at|on)\s+([^!?;]+)/gi;
  let candidate = '';
  let match: RegExpExecArray | null;
  while ((match = cueRegex.exec(cleaned)) !== null) {
    candidate = match[1]?.trim() || '';
  }

  if (!candidate && cleaned.includes(',')) {
    const parts = cleaned
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    candidate = parts.slice(-2).join(', ');
  }

  candidate = candidate
    .replace(LOCATION_TRAILING_CUES, '')
    .replace(/[.,;:\s]+$/g, '')
    .trim();

  if (candidate && isLikelyAddressQuery(candidate)) return candidate;
  return '';
};

const parseBooleanQueryParam = (value: string | null): boolean | undefined => {
  if (value === null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return false;
  return undefined;
};

const parseAiParams = (raw: string | null): Record<string, any> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, any>;
  } catch {
    return {};
  }
};

const MAX_VISIBLE_FILTER_CHIPS = 6;

const formatCurrencyLabel = (value: number) => {
  if (!Number.isFinite(value)) return `$${value}`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `$${value}`;
};

function PropertyBrowseView({ }: Props) {
  const { currentView } = useProperty();
  const { savePropertyView } = usePropertyActions();
  const divRef = useRef<HTMLDivElement>(null);
  const isSearchingRef = useRef(false);
  const lastSearchFingerprintRef = useRef<string>('');
  const lastSearchSentAtRef = useRef<number>(0);
  const searchRequestVersionRef = useRef(0);
  const lastInvalidMlsQueryWarnedRef = useRef<string>('');
  const {
    allProperties,
    addProperties,
    setSearchedQuery,
    clearProperties,
    isLoading,
    setIsLoading,
    setLastSearchKey,
    isCompareMode,
    setCompareMode,
    selectedCompareProperties,
    clearCompareProperties,
    isComparisonModalOpen,
    setComparisonModalOpen,
    selectedSubCategories,
    toggleSubCategory,
    drawFilteredPropertyIds,
    setDrawFilteredPropertyIds,
    mapOverlay,
    setMapOverlay,
    activePOICategories,
    clearDrawSignal,
    incrementClearDrawSignal,
    sessionId,
  } = usePropertyStore();

  const [selectedProperty, setSelectedProperty] = useState<string>('');

  const featureFilteredProperties = useFilteredProperties();
  const [totalResultsCount, setTotalResultsCount] = useState<number | null>(null);
  const resultCount = totalResultsCount !== null ? totalResultsCount : featureFilteredProperties.length;

  const dispatch = useAppDispatch();
  const { tempUserId } = useAppSelector((state: RootState) => state.propertyPreference);
  const { user } = useAuth();
  const [, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawQuery = searchParams.get('q');
  const query = useMemo(() => deriveBrowseLocationQuery(rawQuery), [rawQuery]);
  const aiSearchParams = useMemo(() => parseAiParams(searchParams.get('aiParams')), [searchParams]);
  const isMlsMode = true;
  const isSearchModeReady = true;
  const PAGE_SIZE = 20;

  const activeSearchFilters = useMemo((): Partial<MLSSearchParams> & Record<string, any> => {
    const bedRooms = Number(searchParams.get('bedRooms') || '') || undefined;
    const bathRooms = Number(searchParams.get('bathRooms') || '') || undefined;
    const priceMin = Number(searchParams.get('priceMin') || '') || undefined;
    const priceMax = Number(searchParams.get('priceMax') || '') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const subType = searchParams.get('subType') || undefined;
    const hasPool = parseBooleanQueryParam(searchParams.get('hasPool'));
    const latestOnly = parseBooleanQueryParam(searchParams.get('latestOnly'));

    return {
      ...aiSearchParams,
      bedrooms: bedRooms ?? aiSearchParams?.bedrooms,
      bedrooms_min: bedRooms ?? aiSearchParams?.bedrooms_min ?? aiSearchParams?.bedrooms,
      bathrooms: bathRooms ?? aiSearchParams?.bathrooms,
      bathrooms_min: bathRooms ?? aiSearchParams?.bathrooms_min ?? aiSearchParams?.bathrooms,
      listing_price_min: priceMin ?? aiSearchParams?.listing_price_min,
      listing_price_max: priceMax ?? aiSearchParams?.listing_price_max,
      listing_property_type: propertyType ?? aiSearchParams?.listing_property_type,
      property_sub_type: propertyType ?? aiSearchParams?.property_sub_type,
      property_type: aiSearchParams?.property_type,
      has_pool: hasPool ?? aiSearchParams?.has_pool,
      latest_only: latestOnly ?? aiSearchParams?.latest_only,
      public_land_use: subType ?? aiSearchParams?.public_land_use,
    };
  }, [searchParams, aiSearchParams]);
  const activeSearchFiltersKey = useMemo(
    () => JSON.stringify(activeSearchFilters),
    [activeSearchFilters],
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapPinned, setIsMapPinned] = useState(true);
  const [showCompactFilters, setShowCompactFilters] = useState(false);
  const [searchSubmitNonce, setSearchSubmitNonce] = useState(0);
  const [topSearchValue, setTopSearchValue] = useState(query);
  const [draftPriceMin, setDraftPriceMin] = useState<string>(searchParams.get('priceMin') || '');
  const [draftPriceMax, setDraftPriceMax] = useState<string>(searchParams.get('priceMax') || '');
  const [draftBeds, setDraftBeds] = useState<string>(searchParams.get('bedRooms') || '');
  const [draftBaths, setDraftBaths] = useState<string>(searchParams.get('bathRooms') || '');
  const [areFilterChipsExpanded, setAreFilterChipsExpanded] = useState(false);
  const [topSearchAnimatedPlaceholder, setTopSearchAnimatedPlaceholder] = useState('');
  const [topSearchPromptIndex, setTopSearchPromptIndex] = useState(0);
  const [topSearchCharIndex, setTopSearchCharIndex] = useState(0);
  const [topSearchDeleting, setTopSearchDeleting] = useState(false);
  const [nextResultIndex, setNextResultIndex] = useState<number | null>(null);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchResetKey = useMemo(
    () => `mls||${query.trim()}||${activeSearchFiltersKey}||${searchSubmitNonce}`,
    [query, activeSearchFiltersKey, searchSubmitNonce],
  );
  useEffect(() => {
    setTotalResultsCount(null);
  }, [query, activeSearchFiltersKey, searchSubmitNonce]);
  const isLoadingMoreRef = useRef(false);

  const [mobileSheetMode, setMobileSheetMode] = useState<MobileSheetMode>('default');
  const [mobileMeasureState, setMobileMeasureState] = useState<{
    active: boolean;
    duration: string | null;
    distance: string | null;
    error: string | null;
  }>({
    active: false,
    duration: null,
    distance: null,
    error: null,
  });
  const [isMobileFilterMenuOpen, setIsMobileFilterMenuOpen] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const dragStartModeRef = useRef<MobileSheetMode>('default');
  const dragDeltaYRef = useRef(0);
  const ignoreNextHandleClickRef = useRef(false);
  const lastHandledSearchSubmitNonceRef = useRef(0);
  const cancelDebouncedSearchRef = useRef<(() => void) | null>(null);


  const subCategoryAvailability = useMemo(() => {
    const availability: Record<string, boolean> = {};
    if (!allProperties || allProperties.length === 0) {
      SUB_CATEGORIES.forEach((sub) => {
        availability[sub.title] = false;
      });
      return availability;
    }

    SUB_CATEGORIES.forEach((sub) => {
      const hasFeature = allProperties.some((p: any) => {
        const listing = p?.listing || p?.data?.listing || p;
        const props = listing?.property || listing?.data || {};
        const remarks = listing?.publicRemarks;

        if (props[sub.propertyKey]) return true;

        if (remarks && sub.keywords && sub.keywords.length > 0) {
          const lowerRemarks = remarks.toLowerCase();
          return sub.keywords.some(k => lowerRemarks.includes(k));
        }

        return false;
      });

      availability[sub.title] = hasFeature;
    });

    return availability;
  }, [allProperties]);


  const coordinates = useMemo(
    () => resolvePropertyCoordinates(featureFilteredProperties),
    [featureFilteredProperties]
  );

  const hasDrawFilter = Array.isArray(drawFilteredPropertyIds) && drawFilteredPropertyIds.length > 0;

  useEffect(() => {
    const inferred = parseQueryFilters(rawQuery ?? '');
    setTopSearchValue(query);
    setDraftPriceMin(searchParams.get('priceMin') || (inferred.priceMin ? String(inferred.priceMin) : ''));
    setDraftPriceMax(searchParams.get('priceMax') || (inferred.priceMax ? String(inferred.priceMax) : ''));
    setDraftBeds(searchParams.get('bedRooms') || (inferred.bedRooms ? String(inferred.bedRooms) : ''));
    setDraftBaths(searchParams.get('bathRooms') || (inferred.bathRooms ? String(inferred.bathRooms) : ''));
  }, [query, rawQuery, searchParams]);

  useEffect(() => {
    if (topSearchValue.trim().length > 0) {
      setTopSearchAnimatedPlaceholder('');
      return;
    }

    const prompts = [
      'Enter an address, city, neighborhood, or ZIP',
      'Try: Manhattan Beach, CA',
      'Try: Los Angeles, CA 90049',
    ];

    // Keep mobile/map interactions smooth by avoiding a high-frequency
    // typewriter re-render loop while users pan/scroll results.
    if (currentView === 'map') {
      setTopSearchAnimatedPlaceholder(prompts[0]);
      return;
    }

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
  }, [topSearchValue, topSearchPromptIndex, topSearchCharIndex, topSearchDeleting, currentView]);

  const pushBrowseParams = useCallback((
    mutator: (params: URLSearchParams) => void,
    options?: { replace?: boolean },
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;

    const href = next ? `${pathname}?${next}` : pathname;
    if (options?.replace) {
      router.replace(href, { scroll: false });
      return;
    }
    router.push(href, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleClearSearchQuery = useCallback(() => {
    // Cancel any pending debounced request from the previous query so it
    // cannot repopulate stale cards after the user starts a new search.
    cancelDebouncedSearchRef.current?.();
    searchRequestVersionRef.current += 1;
    lastSearchFingerprintRef.current = '';
    lastSearchSentAtRef.current = 0;
    setTopSearchValue('');
    setIsLoading(false);
    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
  }, [setIsLoading]);

  const handleTopSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
    const nextQuery = topSearchValue.trim();
    const currentQuery = query.trim();

    // Cancel pending old-query debounce and invalidate in-flight responses.
    cancelDebouncedSearchRef.current?.();
    searchRequestVersionRef.current += 1;
    lastSearchFingerprintRef.current = '';
    lastSearchSentAtRef.current = 0;

    if (nextQuery !== currentQuery) {
      // Prevent stale cards from remaining visible while the new query loads.
      clearProperties();
      setSelectedProperty('');
      if (nextQuery) setIsLoading(true);
    }

    if (nextQuery && nextQuery === currentQuery) {
      // Allow explicit "Search" on the same query to re-run MLS fetch.
      setSearchSubmitNonce((n) => n + 1);
      return;
    }
    pushBrowseParams((params) => {
      if (nextQuery) params.set('q', nextQuery);
      else params.delete('q');
    });
  }, [clearProperties, pushBrowseParams, query, setIsLoading, topSearchValue]);

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
    setIsMobileFilterMenuOpen(false);
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

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    const addChip = (id: string, label: string) => chips.push({ id, label });

    const beds = Number(activeSearchFilters?.bedrooms_min ?? activeSearchFilters?.bedrooms);
    if (Number.isFinite(beds) && beds > 0) addChip('beds', `${beds}+ Beds`);

    const baths = Number(activeSearchFilters?.bathrooms_min ?? activeSearchFilters?.bathrooms);
    if (Number.isFinite(baths) && baths > 0) addChip('baths', `${baths}+ Baths`);

    const minPrice = Number(activeSearchFilters?.listing_price_min);
    const maxPrice = Number(activeSearchFilters?.listing_price_max);
    if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
      addChip('price', `${formatCurrencyLabel(minPrice)} - ${formatCurrencyLabel(maxPrice)}`);
    } else if (Number.isFinite(minPrice)) {
      addChip('price', `Min ${formatCurrencyLabel(minPrice)}`);
    } else if (Number.isFinite(maxPrice)) {
      addChip('price', `Up to ${formatCurrencyLabel(maxPrice)}`);
    }

    const propertyType = String(
      activeSearchFilters?.property_sub_type ??
      activeSearchFilters?.listing_property_type ??
      activeSearchFilters?.property_type ??
      '',
    ).trim();
    if (propertyType) addChip('propertyType', propertyType);

    if (activeSearchFilters?.has_pool === true) addChip('has_pool', 'Pool');
    if (activeSearchFilters?.latest_only === true) addChip('latest_only', 'Latest Only');
    if (activeSearchFilters?.is_water_front === true) addChip('is_water_front', 'Waterfront');
    if (activeSearchFilters?.is_water_view === true) addChip('is_water_view', 'Water View');
    if (activeSearchFilters?.is_mountain_view === true) addChip('is_mountain_view', 'Mountain View');
    if (activeSearchFilters?.is_city_view === true) addChip('is_city_view', 'City View');
    if (activeSearchFilters?.is_park_view === true) addChip('is_park_view', 'Park View');

    const yearBuiltMin = Number(activeSearchFilters?.year_built_min);
    if (Number.isFinite(yearBuiltMin) && yearBuiltMin > 0) addChip('year_built_min', `Built ${yearBuiltMin}+`);
    const yearBuiltMax = Number(activeSearchFilters?.year_built_max);
    if (Number.isFinite(yearBuiltMax) && yearBuiltMax > 0) addChip('year_built_max', `Built up to ${yearBuiltMax}`);

    const domMin = Number(activeSearchFilters?.days_on_market_min);
    if (Number.isFinite(domMin) && domMin > 0) addChip('days_on_market_min', `DOM ${domMin}+`);
    const domMax = Number(activeSearchFilters?.days_on_market_max);
    if (Number.isFinite(domMax) && domMax > 0) addChip('days_on_market_max', `DOM up to ${domMax}`);

    const hoaMax = Number(activeSearchFilters?.listing_association_fee_max);
    if (Number.isFinite(hoaMax) && hoaMax >= 0) addChip('listing_association_fee_max', `HOA up to ${formatCurrencyLabel(hoaMax)}`);

    const lotSizeMin = Number(activeSearchFilters?.lot_size_min);
    if (Number.isFinite(lotSizeMin) && lotSizeMin > 0) addChip('lot_size_min', `Lot ${lotSizeMin.toLocaleString()}+ sqft`);
    const lotSizeMax = Number(activeSearchFilters?.lot_size_max);
    if (Number.isFinite(lotSizeMax) && lotSizeMax > 0) addChip('lot_size_max', `Lot up to ${lotSizeMax.toLocaleString()} sqft`);

    const livingAreaMin = Number(activeSearchFilters?.living_area_min);
    if (Number.isFinite(livingAreaMin) && livingAreaMin > 0) addChip('living_area_min', `${livingAreaMin.toLocaleString()}+ sqft`);
    const livingAreaMax = Number(activeSearchFilters?.living_area_max);
    if (Number.isFinite(livingAreaMax) && livingAreaMax > 0) addChip('living_area_max', `Up to ${livingAreaMax.toLocaleString()} sqft`);

    const stories = Number(activeSearchFilters?.stories);
    if (Number.isFinite(stories) && stories > 0) addChip('stories', `${stories}-Story`);
    if (activeSearchFilters?.has_basement === true) addChip('has_basement', 'Basement');

    const combinedIntentText = [
      String(activeSearchFilters?.description_keywords ?? ''),
      String(activeSearchFilters?.visual_query ?? ''),
      String(activeSearchFilters?.room_hint ?? ''),
    ]
      .join(', ')
      .toLowerCase();

    const hasGardenIntent =
      /\bgarden\b|\byard\b|\bbackyard\b|\blandscap/.test(combinedIntentText);
    const hasDiningIntent =
      /\bdining\b|\bdining room\b|\bdining table\b/.test(combinedIntentText);
    const hasHardwoodIntent = /\bhardwood\b/.test(combinedIntentText);
    const hasNaturalLightIntent =
      /\bnatural light\b|\bbright\b|\blarge windows?\b|\bbig windows?\b|\bwell lit\b/.test(combinedIntentText);

    if (hasGardenIntent) addChip('intent_garden', 'Garden/Yard');
    if (hasDiningIntent) addChip('intent_dining', 'Dining Space');
    if (hasHardwoodIntent) addChip('intent_hardwood', 'Hardwood Floors');
    if (hasNaturalLightIntent) addChip('intent_natural_light', 'Natural Light');

    return chips;
  }, [activeSearchFilters]);

  const visibleFilterChips = useMemo(
    () =>
      areFilterChipsExpanded
        ? activeFilterChips
        : activeFilterChips.slice(0, MAX_VISIBLE_FILTER_CHIPS),
    [activeFilterChips, areFilterChipsExpanded],
  );
  const hiddenFilterChipCount = Math.max(0, activeFilterChips.length - visibleFilterChips.length);

  const handleRemoveFilterChip = useCallback((chipId: string) => {
    pushBrowseParams((params) => {
      const ai = parseAiParams(params.get('aiParams'));
      const removeAiKeys = (keys: string[]) => keys.forEach((k) => delete ai[k]);

      const removeIntentTerms = (patterns: RegExp[]) => {
        const normalizeList = (raw: string) =>
          raw
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean);
        const filterTerms = (terms: string[]) =>
          terms.filter((term) => !patterns.some((p) => p.test(term.toLowerCase())));

        const keywordTerms = filterTerms(normalizeList(String(ai.description_keywords ?? '')));
        if (keywordTerms.length > 0) ai.description_keywords = keywordTerms.join(', ');
        else delete ai.description_keywords;

        const visualTerms = filterTerms(normalizeList(String(ai.visual_query ?? '')));
        if (visualTerms.length > 0) ai.visual_query = visualTerms.join(', ');
        else delete ai.visual_query;
      };

      if (chipId === 'intent_garden') {
        removeIntentTerms([/\bgarden\b/, /\byard\b/, /\bbackyard\b/, /\blandscap/]);
      } else if (chipId === 'intent_dining') {
        removeIntentTerms([/\bdining\b/, /\bdining room\b/, /\bdining table\b/]);
        if (String(ai.room_hint ?? '').toLowerCase() === 'dining_room') delete ai.room_hint;
      } else if (chipId === 'intent_hardwood') {
        removeIntentTerms([/\bhardwood\b/]);
      } else if (chipId === 'intent_natural_light') {
        removeIntentTerms([/\bnatural light\b/, /\bbright\b/, /\blarge windows?\b/, /\bbig windows?\b/, /\bwell lit\b/]);
      } else {
        switch (chipId) {
          case 'beds':
            params.delete('bedRooms');
            removeAiKeys(['bedrooms', 'bedrooms_min', 'bedrooms_max']);
            break;
          case 'baths':
            params.delete('bathRooms');
            removeAiKeys(['bathrooms', 'bathrooms_min', 'bathrooms_max']);
            break;
          case 'price':
            params.delete('priceMin');
            params.delete('priceMax');
            removeAiKeys(['listing_price_min', 'listing_price_max']);
            break;
          case 'propertyType':
            params.delete('propertyType');
            removeAiKeys(['property_sub_type', 'listing_property_type', 'property_type']);
            break;
          default:
            removeAiKeys([chipId]);
        }
      }

      if (chipId === 'has_pool') params.delete('hasPool');
      if (chipId === 'latest_only') params.delete('latestOnly');

      if (Object.keys(ai).length > 0) {
        params.set('aiParams', encodeURIComponent(JSON.stringify(ai)));
      } else {
        params.delete('aiParams');
      }
    });
  }, [pushBrowseParams]);

  const handleClearAllActiveChips = useCallback(() => {
    pushBrowseParams((params) => {
      [
        'bedRooms',
        'bathRooms',
        'priceMin',
        'priceMax',
        'propertyType',
        'subType',
        'hasPool',
        'latestOnly',
        'aiParams',
      ].forEach((key) => params.delete(key));
    });
  }, [pushBrowseParams]);

  const resolveSheetModeAfterDrag = useCallback((startMode: MobileSheetMode, deltaY: number): MobileSheetMode => {
    const dragUp = deltaY < 0;
    const distance = Math.abs(deltaY);

    if (startMode === 'collapsed') {
      if (!dragUp || distance < 24) return 'collapsed';
      if (distance > 140) return 'full';
      return 'default';
    }

    if (startMode === 'default') {
      if (distance < 36) return 'default';
      return dragUp ? 'full' : 'collapsed';
    }

    if (dragUp || distance < 36) return 'full';
    if (distance > 160) return 'collapsed';
    return 'default';
  }, []);

  const handleMobileSheetPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragStartYRef.current = event.clientY;
      dragStartModeRef.current = mobileSheetMode;
      dragDeltaYRef.current = 0;
      ignoreNextHandleClickRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [mobileSheetMode],
  );

  const handleMobileSheetPointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartYRef.current === null) return;
    dragDeltaYRef.current = event.clientY - dragStartYRef.current;
  }, []);

  const finalizeMobileSheetDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (dragStartYRef.current === null) return;
      const startMode = dragStartModeRef.current;
      const deltaY = dragDeltaYRef.current;
      dragStartYRef.current = null;
      dragDeltaYRef.current = 0;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture might already be released.
      }

      if (Math.abs(deltaY) < 10) return;
      ignoreNextHandleClickRef.current = true;
      setMobileSheetMode(resolveSheetModeAfterDrag(startMode, deltaY));
    },
    [resolveSheetModeAfterDrag],
  );

  const handleMobileSheetHandleClick = useCallback(() => {
    if (ignoreNextHandleClickRef.current) {
      ignoreNextHandleClickRef.current = false;
      return;
    }
    setMobileSheetMode((prev) => (prev === 'collapsed' ? 'default' : prev === 'full' ? 'default' : 'collapsed'));
  }, []);

  useEffect(() => {
    sessionStorage.removeItem('search');
    return () => sessionStorage.removeItem('search');
  }, []);

  const sendSearchRequest = useCallback(
    debounce(async (body: Record<string, any>) => {
      const queryText = query.trim();
      if (isMlsMode && !queryText) return;
      if (isMlsMode && !isLikelyAddressQuery(queryText)) {
        const normalized = queryText.toLowerCase();
        if (lastInvalidMlsQueryWarnedRef.current !== normalized) {
          warning({
            message: 'Enter an address to search',
            subtitle: 'Use a street address, city, neighborhood, or ZIP.',
            duration: 7000,
          });
          lastInvalidMlsQueryWarnedRef.current = normalized;
        }
        setIsLoading(false);
        return;
      }
      const requestVersion = ++searchRequestVersionRef.current;
      // Stable key that identifies the location query + active filters.
      const querySearchKey = `mls||${queryText}||${JSON.stringify(activeSearchFilters)}`;
      const fingerprint = JSON.stringify({
        mode: 'mls',
        query: queryText,
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
      setIsLoadingMore(false);
      setHasMoreResults(false);
      setNextResultIndex(null);
      try {
        const searchUrl = MLS_SEARCH_LIVE_URL;

        const response = await axios.post(
          searchUrl,
          {
            ...body,
            ...activeSearchFilters,
            ai_params: aiSearchParams,
            query: queryText,
            radius: 20,
            from_browse: true,
            debug_source: 'browse_maps_page',
            user: user?.id,
            page_size: PAGE_SIZE,
            result_index: 0,
            pagination: true,
          });

        // Store search history
        if ((user?.id || tempUserId) && queryText) {
          storeSearchHistory({
            user_id: user?.id || tempUserId || 'anonymous',
            query: queryText,
            session_id: sessionId || undefined
          });
        }

        if (requestVersion !== searchRequestVersionRef.current) {
          return;
        }

        const newProperties = response?.data?.properties || response?.data?.records || response?.data?.result?.records;

        if (Array.isArray(newProperties) && newProperties.length > 0) {
          // Always replace the current result set for each completed MLS request.
          // Appending across searches causes stale out-of-area cards to leak into
          // the next query (e.g. SF address showing old Iowa listings).
          clearProperties();

          setSearchedQuery(JSON.stringify(newProperties));
          addProperties(newProperties);
          setLastSearchKey(querySearchKey);
          dispatch(incrementSearchCount());
          dispatch(setPropertyQuery(response.data?.final_response || response.data?.search_query));
          const pagination = response?.data?.pagination;
          const countHintRaw =
            pagination?.result_count_hint ??
            response?.data?.result_count_hint ??
            response?.data?.total ??
            response?.data?.result_count ??
            response?.data?.count;
          const countHint = Number(countHintRaw);
          if (Number.isFinite(countHint)) {
            setTotalResultsCount(countHint);
          }
          const nextIndex =
            typeof pagination?.next_result_index === 'number'
              ? pagination.next_result_index
              : newProperties.length;
          const hasMore =
            typeof pagination?.has_more === 'boolean'
              ? pagination.has_more
              : newProperties.length >= PAGE_SIZE;
          setNextResultIndex(hasMore ? nextIndex : null);
          setHasMoreResults(hasMore);
        } else {
          clearProperties();
          warning({
            message: 'No properties found',
            subtitle: 'Try a city, neighborhood, or ZIP, e.g. "Folsom, CA" or "Morgan Hill, CA".',
            duration: 8000,
          });
        }
      } catch (err: any) {
        if (requestVersion !== searchRequestVersionRef.current) return;
        const apiMessage = String(err?.response?.data?.error || err?.response?.data?.message || '');
        if (apiMessage.toLowerCase().includes('query is required') && !queryText) return;
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
    [
      query,
      activeSearchFilters,
      clearProperties,
      addProperties,
      setSearchedQuery,
      setLastSearchKey,
      setIsLoading,
      dispatch,
      user?.id,
      PAGE_SIZE,
    ],
  );

  const fetchMoreResults = useCallback(async () => {
    const queryText = query.trim();
    if (!queryText) return;
    if (!hasMoreResults || nextResultIndex === null) return;
    if (isLoadingMoreRef.current) return;
    const requestVersion = searchRequestVersionRef.current;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const response = await axios.post(MLS_SEARCH_LIVE_URL, {
        ...activeSearchFilters,
        ai_params: aiSearchParams,
        query: queryText,
        radius: 20,
        from_browse: true,
        debug_source: 'browse_maps_page_infinite',
        user: user?.id,
        page_size: PAGE_SIZE,
        result_index: nextResultIndex,
        pagination: true,
      });
      if (requestVersion !== searchRequestVersionRef.current) return;
      const newProperties = response?.data?.properties || response?.data?.records || response?.data?.result?.records;
      if (Array.isArray(newProperties) && newProperties.length > 0) {
        addProperties(newProperties);
      }
      const pagination = response?.data?.pagination;
      const countHintRaw =
        pagination?.result_count_hint ??
        response?.data?.result_count_hint ??
        response?.data?.total ??
        response?.data?.result_count ??
        response?.data?.count;
      const countHint = Number(countHintRaw);
      if (Number.isFinite(countHint)) {
        setTotalResultsCount(countHint);
      }
      const nextIndex =
        typeof pagination?.next_result_index === 'number'
          ? pagination.next_result_index
          : (nextResultIndex + (Array.isArray(newProperties) ? newProperties.length : 0));
      const hasMore =
        typeof pagination?.has_more === 'boolean'
          ? pagination.has_more
          : Array.isArray(newProperties) && newProperties.length >= PAGE_SIZE;
      setNextResultIndex(hasMore ? nextIndex : null);
      setHasMoreResults(hasMore);
    } catch (err) {
      console.error('Fetch more results failed:', err);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [
    query,
    activeSearchFilters,
    addProperties,
    aiSearchParams,
    hasMoreResults,
    nextResultIndex,
    user?.id,
    PAGE_SIZE,
  ]);

  useEffect(() => {
    cancelDebouncedSearchRef.current = () => {
      (sendSearchRequest as unknown as { cancel?: () => void }).cancel?.();
    };
    return () => {
      cancelDebouncedSearchRef.current = null;
      (sendSearchRequest as unknown as { cancel?: () => void }).cancel?.();
    };
  }, [sendSearchRequest]);

  useEffect(() => {
    const handlePinState = () => setIsMapPinned(true);
    handlePinState();
    window.addEventListener('resize', handlePinState);
    return () => {
      window.removeEventListener('resize', handlePinState);
    };
  }, []);

  useEffect(() => {
    if (!isSearchModeReady) return;
    if (!query.trim()) return;

    const isManualResubmit = searchSubmitNonce !== lastHandledSearchSubmitNonceRef.current;
    if (isManualResubmit) {
      lastHandledSearchSubmitNonceRef.current = searchSubmitNonce;
    }

    // Back-navigation cache check: if we already have results for this exact
    // query in the Zustand store, show them instantly.
    const querySearchKey = `mls||${query.trim()}||${activeSearchFiltersKey}`;
    const { lastSearchKey, allProperties: cachedProps } = usePropertyStore.getState();
    if (!isManualResubmit && cachedProps.length > 0 && lastSearchKey === querySearchKey) {
      setIsLoading(false); // clear the store's initial isLoading:true
      setHasMoreResults(true);
      setNextResultIndex(Math.max(cachedProps.length, PAGE_SIZE));
      return;
    }

    sendSearchRequest({});
  }, [isSearchModeReady, query, activeSearchFiltersKey, sendSearchRequest, isMlsMode, setIsLoading, searchSubmitNonce, PAGE_SIZE]);

  if (currentView === 'map') {
    return (
      <>
        <section className="relative mb-0 flex-1 min-h-0 w-full px-0 pb-0 md:px-6">
          <div className="relative h-full min-h-0 w-full overflow-hidden bg-white md:rounded-2xl md:border md:border-gray-200 md:shadow-sm">
            <div ref={mapRef} className="absolute inset-0">
              <CustomMap
                width="100%"
                coord={coordinates}
                zoom={13}
                properties={featureFilteredProperties}
                height="100%"
                searchQuery={query}
                showDistricts={mapOverlay === 'schools'}
                overlayValue={mapOverlay}
                onOverlayChange={setMapOverlay}
                onMarkerClick={(id: string) => {
                  setSelectedProperty(id);
                  if (!id) return;
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setMobileSheetMode((prev) => (prev === 'collapsed' ? 'default' : prev));
                  }
                }}
                onDrawFilterChange={(ids) => {
                  setDrawFilteredPropertyIds(ids && ids.length > 0 ? ids : null);
                  if (!ids || ids.length === 0) return;
                  if (selectedProperty && !ids.includes(String(selectedProperty))) {
                    setSelectedProperty('');
                  }
                }}
                onMeasureStateChange={setMobileMeasureState}
                clearDrawSignal={clearDrawSignal}
                externalActivePOICategories={activePOICategories}
                useOverlayResultsRail
                hideControls={mobileSheetMode !== 'collapsed'}
                onMapMove={(center) => {
                  // Only re-search while panning in MLS mode if WE DON'T have properties.
                  // Broad queries like "Florida" return a set that shouldn't be cleared by panning.
                  if (!isMlsMode) return;
                  if (!query.trim()) return;
                  if (allProperties.length > 0) return;
                  sendSearchRequest({ latitude: center.lat, longitude: center.lng });
                }}
              />
            </div>

            {!mobileMeasureState.active ? (
              <div className="absolute inset-x-0 top-0 z-40 px-3 pt-3 lg:hidden">
                <div className="overflow-visible rounded-2xl border border-gray-200 bg-white/95 shadow-md backdrop-blur">
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-semibold text-gray-900">Search</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClearSearchQuery}
                        className="text-sm font-medium text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* <form onSubmit={handleTopSearchSubmit} className="px-3 pb-2 pt-2">
                    <div className="relative min-w-0 rounded-full bg-[#efebe6]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <SpeechInput
                        value={topSearchValue}
                        setValue={setTopSearchValue}
                        searchType="address"
                        placeholderText={topSearchAnimatedPlaceholder}
                        className="w-full"
                        inputClassName="h-10 w-full rounded-full border-0 bg-transparent pl-10 pr-3 text-sm text-gray-900 shadow-none outline-none ring-0 placeholder:text-gray-500 focus-visible:ring-0"
                      />
                    </div>
                  </form> */}

                  <div className="flex items-center justify-between px-3 pb-3 pt-0.5">
                    <p className="text-[11px] text-gray-500">
                      {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                      <button
                        type="button"
                        onClick={() => setIsMobileFilterMenuOpen(true)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Filter
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileSheetMode('full')}
                        className="inline-flex items-center gap-1.5"
                      >
                        <List className="h-3.5 w-3.5" />
                        List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-x-0 top-0 z-40 px-3 pt-3 lg:hidden">
                <div className="flex min-h-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 px-3 text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur">
                  {mobileMeasureState.duration && mobileMeasureState.distance
                    ? `${mobileMeasureState.duration} • ${mobileMeasureState.distance}`
                    : mobileMeasureState.error || 'Measure: tap listing pill, then destination.'}
                </div>
              </div>
            )}

            {isMobileFilterMenuOpen ? (
              <div className="absolute inset-0 z-50 lg:hidden">
                <button
                  type="button"
                  aria-label="Close filter panel"
                  className="absolute inset-0 bg-black/30"
                  onClick={() => setIsMobileFilterMenuOpen(false)}
                />
                <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-3xl bg-[#f5f2ee] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterMenuOpen(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600"
                      aria-label="Close filters"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-base font-semibold text-gray-900">Filter</p>
                    <button
                      type="button"
                      onClick={clearCompactFilters}
                      className="text-sm font-medium text-gray-700"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-5 overflow-y-auto px-4 pb-4 pt-4">
                    <section className="space-y-3">
                      <p className="text-base font-semibold text-gray-900">Price range</p>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1">
                          <span className="px-1 text-xs font-medium text-gray-500">Min</span>
                          <input
                            inputMode="numeric"
                            value={draftPriceMin}
                            onChange={(e) => setDraftPriceMin(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="$ Min"
                            className="block h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="px-1 text-xs font-medium text-gray-500">Max</span>
                          <input
                            inputMode="numeric"
                            value={draftPriceMax}
                            onChange={(e) => setDraftPriceMax(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="$ Max"
                            className="block h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                          />
                        </label>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <p className="text-base font-semibold text-gray-900">Rooms</p>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1">
                          <span className="px-1 text-xs font-medium text-gray-500">Bedrooms</span>
                          <select
                            value={draftBeds}
                            onChange={(e) => setDraftBeds(e.target.value)}
                            className="block h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400"
                          >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                          </select>
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="px-1 text-xs font-medium text-gray-500">Bathrooms</span>
                          <select
                            value={draftBaths}
                            onChange={(e) => setDraftBaths(e.target.value)}
                            className="block h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400"
                          >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                          </select>
                        </label>
                      </div>
                    </section>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-black/10 bg-white px-4 py-3">
                    <button
                      type="button"
                      onClick={clearCompactFilters}
                      className="h-10 rounded-full border border-gray-300 text-sm font-medium text-gray-700"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={applyCompactFilters}
                      className="h-10 rounded-full bg-gray-900 text-sm font-semibold text-white"
                    >
                      Show results
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div
              className={cn(
                'absolute z-40 transition-transform duration-300 lg:hidden',
                mobileSheetMode === 'full'
                  ? 'inset-0'
                  : mobileSheetMode === 'collapsed'
                    ? 'inset-x-0 bottom-0 flex justify-center pointer-events-none'
                    : 'inset-x-0 bottom-0',
                mobileSheetMode === 'collapsed' ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
              )}
            >
              <div
                className={cn(
                  'transition-all duration-300',
                  mobileSheetMode === 'full'
                    ? 'h-full flex flex-col overflow-hidden border-t border-gray-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.12)]'
                    : mobileSheetMode === 'default'
                      ? 'overflow-hidden border-t border-gray-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.12)]'
                      : 'w-fit overflow-visible border-0 bg-transparent shadow-none pointer-events-auto'
                )}
              >
                <button
                  type="button"
                  onClick={handleMobileSheetHandleClick}
                  onPointerDown={handleMobileSheetPointerDown}
                  onPointerMove={handleMobileSheetPointerMove}
                  onPointerUp={finalizeMobileSheetDrag}
                  onPointerCancel={finalizeMobileSheetDrag}
                  className={cn(
                    'touch-none flex items-center justify-center transition-all',
                    mobileSheetMode !== 'collapsed'
                      ? 'w-full flex-col gap-0.5 px-4 py-1.5'
                      : 'mx-auto h-7 w-28 rounded-t-[16px] rounded-b-none border border-b-0 border-gray-200 bg-white'
                  )}
                >
                  <span className={cn('h-1.5 w-16 rounded-full', mobileSheetMode !== 'collapsed' ? 'bg-gray-300' : 'bg-gray-500')} />
                  {mobileSheetMode !== 'collapsed' ? (
                    <span className="text-xs font-semibold leading-tight text-gray-900">
                      {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </button>

                {mobileSheetMode !== 'collapsed' ? (
                  <div
                    className={cn(
                      'min-h-0',
                      mobileSheetMode === 'full' ? 'flex-1' : 'h-[46vh]',
                    )}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <BuyPropertyCards
                      selectedProperty={selectedProperty}
                      propertiesOverride={featureFilteredProperties}
                      overlayMode
                      onOpenCompareModal={() => setComparisonModalOpen(true)}
                      onRequestMore={fetchMoreResults}
                      hasMoreResults={hasMoreResults}
                      isLoadingMore={isLoadingMore}
                      resetKey={searchResetKey}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[620px] max-w-[44vw] lg:block">
              <div className="pointer-events-auto relative flex h-full flex-col border-r border-gray-200 bg-[#f7f7f7]">
                <div className="border-b border-gray-200 bg-white px-4 py-3">
                  {/* <form onSubmit={handleTopSearchSubmit} className="relative z-30 flex items-center gap-2">
                    <div className="relative min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white shadow-sm ring-1 ring-black/5 transition focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-orange-200">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <SpeechInput
                        value={topSearchValue}
                        setValue={setTopSearchValue}
                        searchType="address"
                        placeholderText={topSearchAnimatedPlaceholder}
                        className="w-full"
                        inputClassName="h-11 w-full rounded-2xl border-0 bg-transparent pl-10 pr-10 text-sm text-gray-900 shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
                      />
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
                  </form> */}

                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    <MapPinned className="h-3.5 w-3.5" />
                    {query ? `Results for ${query}` : 'Search Results'}
                    <span className="normal-case tracking-normal text-gray-400">•</span>
                    <span className="normal-case tracking-normal text-gray-600">
                      {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  {activeFilterChips.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {visibleFilterChips.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => handleRemoveFilterChip(chip.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800 hover:bg-orange-100"
                          title={`Remove ${chip.label}`}
                        >
                          <span>{chip.label}</span>
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                      {hiddenFilterChipCount > 0 && !areFilterChipsExpanded ? (
                        <button
                          type="button"
                          onClick={() => setAreFilterChipsExpanded(true)}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          +{hiddenFilterChipCount} more
                        </button>
                      ) : null}
                      {areFilterChipsExpanded && activeFilterChips.length > MAX_VISIBLE_FILTER_CHIPS ? (
                        <button
                          type="button"
                          onClick={() => setAreFilterChipsExpanded(false)}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Show less
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleClearAllActiveChips}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Clear all
                      </button>
                    </div>
                  ) : null}

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
                          incrementClearDrawSignal();
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
                    propertiesOverride={featureFilteredProperties}
                    overlayMode
                    onOpenCompareModal={() => setComparisonModalOpen(true)}
                    onRequestMore={fetchMoreResults}
                    hasMoreResults={hasMoreResults}
                    isLoadingMore={isLoadingMore}
                    resetKey={searchResetKey}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <PropertyComparisonModal
          isOpen={isComparisonModalOpen}
          closeModal={() => setComparisonModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <section
        className="relative mb-20 mx-auto w-full md:grid grid-cols-5 max-w-[1600px] gap-x-8 pl-12 pr-8 md:pl-16 md:pr-12"
      >
        {/* Property Cards */}
        <div
          ref={divRef}
          // className={cn(
          //   'px-4 md:px-8',
          //   currentView === 'map' ? 'col-span-3 px-[3.12rem]' : 'col-span-5',
          // )}
          className={cn(
            currentView === 'grid' ? 'px-0' : 'px-4 md:px-6',
            'col-span-5',
          )}
        >
          <BuyPropertyCards
            selectedProperty={selectedProperty}
            propertiesOverride={featureFilteredProperties}
            onRequestMore={fetchMoreResults}
            hasMoreResults={hasMoreResults}
            isLoadingMore={isLoadingMore}
            resetKey={searchResetKey}
          />
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
              properties={featureFilteredProperties}
              height="100%"
              searchQuery={query}
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
              externalActivePOICategories={activePOICategories}
              onMapMove={(center) => {
                // AI search is query-based — map panning should not re-fetch (properties already loaded)
                // Only MLS mode is geo-based and needs map-move re-requests
                if (!isMlsMode) return;
                if (!query.trim()) return;
                if (allProperties.length > 0) return;
                sendSearchRequest({ latitude: center.lat, longitude: center.lng });
              }}
            />
          </div>
        ) : null}

      </section>
      <PropertyComparisonModal
        isOpen={isComparisonModalOpen}
        closeModal={() => setComparisonModalOpen(false)}
      />
    </>
  );
}

export default PropertyBrowseView;
