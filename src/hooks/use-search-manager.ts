'use client';

import { useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { useSearchParams } from 'next/navigation';
import { usePropertyStore } from '@/store/use-property-store';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppDispatch } from '@/lib/hook';
import { incrementSearchCount } from '@/slices/onboarding/property-preference';
import { setPropertyQuery } from '@/slices/property/property-slice';
import { PROPERTY_SEARCH_AI_URL } from '@/shared/constants/env';
import { error, warning } from '@/components/alert/notify';
import { isMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';

export const useSearchManager = () => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { user } = useAuth();

    const {
        addProperties,
        setSearchedQuery,
        clearProperties,
        setIsLoading,
        setLastSearchKey,
    } = usePropertyStore();

    const isSearchingRef = useRef(false);
    const lastSearchFingerprintRef = useRef<string>('');
    const lastSearchSentAtRef = useRef<number>(0);

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

    const triggerSearch = useCallback(
        debounce(async (options: {
            body?: Record<string, any>;
            forceRefresh?: boolean;
        } = {}) => {
            const { body = {}, forceRefresh = false } = options;

            const query = searchParams.get('q') || '';
            const isMlsMode = isMlsBypassModeEnabled();

            if (isSearchingRef.current && !forceRefresh) return;

            // Stable key that identifies query + mode + filters (no lat/lng — those are map-move only)
            const querySearchKey = `${isMlsMode ? 'mls' : 'ai'}||${query.trim()}||${activeSearchFiltersKey}`;

            const fingerprint = JSON.stringify({
                mode: isMlsMode ? 'mls' : 'ai',
                query: query,
                ...activeSearchFilters,
                ...body,
                latitude: typeof body?.latitude === 'number' ? Number(body.latitude.toFixed(3)) : body?.latitude,
                longitude: typeof body?.longitude === 'number' ? Number(body.longitude.toFixed(3)) : body?.longitude,
            });

            const isMapRefresh = body?.latitude !== undefined && body?.longitude !== undefined;
            const duplicateCooldownMs = isMapRefresh ? 6000 : 1500;
            const now = Date.now();

            if (
                !forceRefresh &&
                lastSearchFingerprintRef.current === fingerprint &&
                now - lastSearchSentAtRef.current < duplicateCooldownMs
            ) {
                return;
            }

            lastSearchFingerprintRef.current = fingerprint;
            lastSearchSentAtRef.current = now;
            isSearchingRef.current = true;
            setIsLoading(true);

            try {
                const searchUrl = isMlsMode
                    ? '/api/mls/search'
                    : (PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search');

                const response = await axios.post(searchUrl, {
                    ...activeSearchFilters,
                    ...body,
                    query,
                    radius: 20,
                    from_browse: true,
                    user: user?.id
                });

                const newProperties = response?.data?.properties || response?.data?.records || response?.data?.result?.records;

                if (Array.isArray(newProperties) && newProperties.length > 0) {
                    // If it's a fresh search (no lat/lng) or forceRefresh, clear old results
                    if (!isMapRefresh || forceRefresh) {
                        clearProperties();
                    }

                    setSearchedQuery(JSON.stringify(newProperties));
                    addProperties(newProperties);
                    setLastSearchKey(querySearchKey);
                    dispatch(incrementSearchCount());
                    dispatch(setPropertyQuery(response.data?.final_response || response.data?.search_query));
                } else {
                    clearProperties();
                    if (!isMapRefresh) {
                        warning({
                            message: 'No properties found',
                            subtitle: 'Try a city, neighborhood, or ZIP, e.g. "Folsom, CA" or "Morgan Hill, CA".',
                            duration: 8000,
                        });
                    }
                }
            } catch (err: any) {
                console.error('Search request failed:', err);
                error({
                    message: err?.response?.data?.error || 'An unexpected error occurred.',
                });
            } finally {
                isSearchingRef.current = false;
                setIsLoading(false);
            }
        }, 1000),
        [searchParams, activeSearchFilters, activeSearchFiltersKey, clearProperties, addProperties, setSearchedQuery, setLastSearchKey, setIsLoading, dispatch, user?.id]
    );

    return {
        triggerSearch,
        isSearching: isSearchingRef.current,
        activeSearchFilters,
    };
};
