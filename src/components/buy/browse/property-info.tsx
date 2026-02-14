'use client';

import CustomMap from '@/components/custom-map';
import { cn } from '@/lib/utils';
import { useProperty } from '@/shared/hooks/useProperty';
import { useEffect, useRef, useState, useCallback } from 'react';
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
import { ViewSelection } from '../buy-dropdowns';
import { BuyCustomSearch } from '../buy-custom-search';

type Props = {};

function PropertyBrowseView({ }: Props) {
  const { currentView } = useProperty();
  const divRef = useRef<HTMLDivElement>(null);
  const [divHeight, setDivHeight] = useState<number | null>(null);
  const { allProperties, addProperties, setSearchedQuery, clearProperties } = usePropertyStore();
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [mapWidth, setMapWidth] = useState<number>(0);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { searchCount } = useAppSelector((state: RootState) => state.propertyPreference);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [scrollOffset, setScrollOffset] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapPinned, setIsMapPinned] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [mapOverlay, setMapOverlay] = useState<'none' | 'schools'>('none');

  const coordinates = allProperties?.map((property: any) => ({
    id: property.id,
    price: property?.listing?.listPriceLow,
    lat: property?.public?.latitude,
    lng: property?.public?.longitude,
  })).filter(coord => coord.lat && coord.lng);

  useEffect(() => {
    const updateWidth = () => {
      if (mapRef.current) {
        setMapWidth(mapRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
      if (isSearching) return;

      setIsSearching(true);
      try {
        const response = await axios.post(PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search', {
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
        setIsSearching(false);
      }
    }, 1000),
    [query, isSearching, clearProperties, addProperties, setSearchedQuery, dispatch],
  );

  useEffect(() => {
    const handleScroll = () => {
      // Adjust how much it moves up on scroll (change `min` and `max` values as needed)
      const scrollY = window.scrollY;
      const newOffset = Math.min(scrollY * 0.3, 300); // Moves up to max 80px

      setScrollOffset(newOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePinState = () => {
      if (!searchBarRef.current) return;
      const searchRect = searchBarRef.current.getBoundingClientRect();
      // Keep map sticky until the search bar bottom reaches the viewport bottom.
      setIsMapPinned(searchRect.bottom > window.innerHeight);
    };

    handlePinState();
    window.addEventListener('scroll', handlePinState, { passive: true });
    window.addEventListener('resize', handlePinState);
    return () => {
      window.removeEventListener('scroll', handlePinState);
      window.removeEventListener('resize', handlePinState);
    };
  }, []);

  return (
    <section
      className={cn(
        'relative w-full mb-20 md:grid',
        currentView === 'map'
          ? 'grid-cols-2 gap-x-0'
          : 'grid-cols-5 w-full gap-x-8 max-w-[1450px] mx-auto',
      )}
    >
      {/* Property Cards */}
      <div
        ref={divRef}
        // className={cn(
        //   'px-4 md:px-8',
        //   currentView === 'map' ? 'col-span-3 px-[3.12rem]' : 'col-span-5',
        // )}
        className={cn(
          'px-4 md:px-8',
          currentView === 'map'
            ? 'flex flex-col gap-y-4 md:col-span-1 md:px-[3.12rem]'
            : 'col-span-5',
        )}
      >
        <BuyPropertyCards selectedProperty={selectedProperty} />
        {currentView === 'map' ? (
          <div ref={searchBarRef}>
            <BuyCustomSearch />
          </div>
        ) : null}
      </div>

      {currentView !== 'grid' ? (
        <div
          ref={mapRef}
          className={cn(
            'relative w-full',
            isMapPinned ? 'md:sticky md:top-[80px]' : 'md:relative',
            'md:h-screen md:-mt-[280px]'
          )}
        >
          <CustomMap
            width={`${mapWidth}px`}
            coord={coordinates}
            zoom={13}
            properties={allProperties}
            height="100%"
            searchQuery={query ?? ''}
            showDistricts={mapOverlay === 'schools'}
            overlayValue={mapOverlay}
            onOverlayChange={setMapOverlay}
            onMarkerClick={(id: string) => setSelectedProperty(id)}
            onMapMove={(center) => {
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
