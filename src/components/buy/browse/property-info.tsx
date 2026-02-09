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
  const elementRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState<number>(0);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { searchCount } = useAppSelector((state: RootState) => state.propertyPreference);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isMapPinned, setIsMapPinned] = useState(true);
  const [mapAbsoluteTop, setMapAbsoluteTop] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const coordinates = allProperties?.map((property: any) => ({
    id: property.id,
    price: property?.listing?.listPriceLow,
    lat: property?.public?.latitude,
    lng: property?.public?.longitude,
  })).filter(coord => coord.lat && coord.lng);

  useEffect(() => {
    const updateWidth = () => {
      if (elementRef.current) {
        setMapWidth(elementRef.current.offsetWidth);
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
    if (currentView !== 'map') return;

    const updateMapPosition = () => {
      if (!elementRef.current || !divRef.current || !sectionRef.current) return;

      const topOffset = 64;
      const mapHeight = elementRef.current.offsetHeight;
      const footerEl = document.querySelector('footer');

      const leftBottom = divRef.current.getBoundingClientRect().bottom + window.scrollY;
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;

      // Stop right before footer to avoid overlap.
      const footerTop = footerEl
        ? footerEl.getBoundingClientRect().top + window.scrollY
        : leftBottom;
      const stopPoint = Math.min(footerTop, leftBottom);
      const stopBuffer = 24;
      const maxScrollY = stopPoint - mapHeight - topOffset - stopBuffer;

      setIsMapPinned(window.scrollY < maxScrollY);
      setMapAbsoluteTop(
        Math.max(0, (stopPoint - sectionTop) - mapHeight - topOffset - stopBuffer),
      );
    };

    updateMapPosition();
    window.addEventListener('scroll', updateMapPosition, { passive: true });
    window.addEventListener('resize', updateMapPosition);

    return () => {
      window.removeEventListener('scroll', updateMapPosition);
      window.removeEventListener('resize', updateMapPosition);
    };
  }, [currentView]);

  return (
    <section
      ref={sectionRef}
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
        {currentView === 'map' ? <BuyCustomSearch /> : null}
      </div>

      {currentView !== 'grid' ? (
        <div
          ref={elementRef}
          style={!isMapPinned ? { top: mapAbsoluteTop } : undefined}
          className={cn(
            'transition-all duration-300',
            // MOBILE: in-flow full-width, 60vh tall, scrollable
            'relative w-full h-[60vh] overflow-auto' +
              // MD+: fixed at top, then released before footer
              (isMapPinned
                ? ' md:fixed md:top-[64px] md:right-0 md:w-[50%] lg:md:w-[50%] md:h-[calc(100vh-64px)] md:overflow-hidden'
                : ' md:absolute md:right-0 md:w-[50%] lg:md:w-[50%] md:h-[calc(100vh-64px)] md:overflow-hidden')
          )}
        >
          <div className="absolute inset-0 rounded-l-lg overflow-hidden shadow-lg">
            {/* <div className='h-16'>

            </div> */}
            <CustomMap
              width={`${mapWidth}px`}
              coord={coordinates}
              zoom={13}
              properties={allProperties}
              height={`calc(100vh - 100px)`}
              onMarkerClick={(id: string) => setSelectedProperty(id)}
              onMapMove={(center, bounds) => {
                sendSearchRequest({ latitude: center.lat, longitude: center.lng });
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Fixed Map on Right */}
    </section>

  );
}

export default PropertyBrowseView;
