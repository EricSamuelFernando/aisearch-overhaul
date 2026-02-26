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
import { BuyCustomSearch } from '../buy-custom-search';

type Props = {};

function PropertyBrowseView({ }: Props) {
  const { currentView } = useProperty();
  const divRef = useRef<HTMLDivElement>(null);
  const [divHeight, setDivHeight] = useState<number | null>(null);
  const { allProperties, addProperties, setSearchedQuery, clearProperties } = usePropertyStore();
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { searchCount } = useAppSelector((state: RootState) => state.propertyPreference);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapPinned, setIsMapPinned] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [mapOverlay, setMapOverlay] = useState<'none' | 'schools'>('none');
  const [drawFilteredPropertyIds, setDrawFilteredPropertyIds] = useState<string[] | null>(null);

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
        'relative mb-20 w-full',
        currentView === 'map'
          ? 'grid w-full gap-6 lg:grid-cols-12 lg:items-start'
          : 'mx-auto grid w-full max-w-[1600px] grid-cols-5 gap-x-8',
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
          'px-4 md:px-6',
          currentView === 'map'
            ? 'flex flex-col gap-y-4 lg:col-span-7 xl:col-span-6'
            : 'col-span-5',
        )}
      >
        <BuyPropertyCards selectedProperty={selectedProperty} propertiesOverride={displayedProperties} />
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
            'relative w-full px-4 md:px-6 lg:px-0',
            currentView === 'map' ? 'mt-2 lg:col-span-5 lg:mt-0 xl:col-span-6' : '',
            isMapPinned ? 'lg:sticky lg:top-[88px]' : 'lg:relative',
            'h-[420px] sm:h-[500px] lg:h-[calc(100vh-104px)]'
          )}
        >
          <CustomMap
            width="100%"
            coord={coordinates}
            zoom={13}
            properties={allProperties}
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
