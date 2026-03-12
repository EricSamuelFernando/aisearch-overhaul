'use client';

import Link from 'next/link';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
// import { useInView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils';
import { useProperty } from '@/shared/hooks/useProperty';
import { PropCardLoader } from './buy-property-card-loader';
import PropertyCards from './browse/property-card';
import { usePropertyStore } from '@/store/use-property-store';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import PropertyComponents from './browse/property-components';

type MyComponentRef = RefObject<HTMLDivElement>;

type Props = {
  forwardedRef?: MyComponentRef;
  selectedProperty: string;
  propertiesOverride?: any[] | null;
  overlayMode?: boolean;
  onOpenCompareModal?: () => void;
};

// How many cards to show initially and how many to reveal per scroll trigger
const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 12;

const resolveListingId = (item: any): string | undefined => {
  const data = item?.data || item;
  const raw =
    data?.id ??
    data?.listingId ??
    data?.listing_id ??
    data?.listing?.id ??
    data?.listing?.listingId ??
    data?.ListingKey ??
    data?.ListingId ??
    data?.mlsId ??
    data?.mls_id ??
    data?.propertyId;
  if (raw === undefined || raw === null || raw === '') return undefined;
  return String(raw);
};

function BuyPropertyCards({
  forwardedRef,
  selectedProperty,
  propertiesOverride,
  overlayMode = false,
  onOpenCompareModal,
}: Props) {
  const { currentView } = useProperty();
  // const { ref } = useInView();
  const { allProperties, isLoading, isCompareMode, selectedCompareProperties } = usePropertyStore();
  const sourceProperties = Array.isArray(propertiesOverride) ? propertiesOverride : allProperties;
  const normalizedProperties = useMemo(
    () =>
      Array.isArray(sourceProperties)
        ? sourceProperties.filter((prop) => prop !== null && prop !== undefined)
        : [],
    [sourceProperties],
  );
  const userData = useSelector((state: any) => state.auth.user);
  const { getAllSnaps } = useUserSnapAPIs();
  const [snaps, setSnaps] = useState<any[]>([]);
  // How many cards are currently revealed (grows as user scrolls)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // Sentinel div at bottom of list — when it enters viewport, reveal next batch
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Scroll container ref for overlayMode (overflow-y-auto div is the scroll root)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchSnaps = () => {
    if (userData?.id) {
      getAllSnaps.mutate(userData.id, {
        onSuccess: (data) => {
          setSnaps(data);
        },
      });
    }
  };

  useEffect(() => {
    fetchSnaps();
  }, [userData?.id]);

  // const itemsPerPage = useMemo(() => {
  //   if (overlayMode) return MAP_ITEMS_PER_PAGE;
  //   if (currentView === 'map') return MAP_ITEMS_PER_PAGE;
  //   return GRID_ITEMS_PER_PAGE;
  // }, [currentView, overlayMode]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [normalizedProperties.length]);

  // const totalPages = useMemo(
  //   () => Math.max(1, Math.ceil(normalizedProperties.length / itemsPerPage)),
  //   [normalizedProperties.length, itemsPerPage],
  // );

  // IntersectionObserver on sentinel — reveals next LOAD_MORE_STEP cards when near bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // In overlay mode the scroll container is the inner div, not the window
    const root = overlayMode ? scrollContainerRef.current : null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            const next = Math.min(prev + LOAD_MORE_STEP, normalizedProperties.length);
            return next > prev ? next : prev;
          });
        }
      },
      { root, rootMargin: '400px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [overlayMode, normalizedProperties.length]);

  useEffect(() => {
    if (!selectedProperty || !normalizedProperties.length) return;
    const idx = normalizedProperties.findIndex(
      (p: any) => resolveListingId(p) === String(selectedProperty),
    );
    if (idx !== -1 && idx >= visibleCount) {
      setVisibleCount(idx + 1);
    }
  }, [selectedProperty, normalizedProperties, visibleCount]);
  useEffect(() => {
    if (!selectedProperty) return;
    const raf = requestAnimationFrame(() => {
      const element = document.getElementById(String(selectedProperty));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedProperty, visibleCount]);

  const visibleProperties = useMemo(
    () => normalizedProperties.slice(0, visibleCount),
    [normalizedProperties, visibleCount],
  );

  const totalCount = normalizedProperties.length;
  const hasMore = visibleCount < totalCount;

  const gridClass = overlayMode
    ? 'grid grid-cols-1 gap-3 xl:grid-cols-2'
    : currentView === 'map'
      ? 'grid grid-cols-1 gap-y-4 gap-x-8 md:grid-cols-2 md:gap-x-6 md:gap-y-6 lg:grid-cols-2'
      : 'grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 xl:gap-x-8';

  return (
    <div
      ref={forwardedRef}
      className={cn('flex h-full flex-col', overlayMode ? 'min-h-0' : '')}
    >
      {/* Scrollable card area */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex-auto',
          overlayMode ? 'min-h-0 overflow-y-auto overscroll-contain px-2 pb-0' : '',
        )}
        style={overlayMode ? { touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' } : undefined}
      >
        <div className={cn('w-full', overlayMode ? 'max-w-none' : '')}>
          <div className={cn('w-full', gridClass)}>
            {isLoading ? (
              <>
                {Array.from({ length: 8 }).map(() => (
                  <PropCardLoader key={nanoid()} />
                ))}
              </>
            ) : (
              <>
                {visibleProperties.map((prop: any, index: number) => {
                  const listingId = resolveListingId(prop) ?? `listing-${index}`;
                  const isSelected = String(listingId) === String(selectedProperty);
                  return (
                    <div
                      key={listingId}
                      id={String(listingId)}
                      className={cn(
                        isSelected
                          ? overlayMode
                            ? "relative rounded-xl shadow-md before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:ring-2 before:ring-inset before:ring-orange-400 before:content-[''] before:z-20"
                            : 'bg-white p-1 bg-orange-500 rounded-2xl shadow-xl'
                          : '',
                        'transition duration-300 ease-in-out',
                      )}
                    >
                      <PropertyComponents
                        {...prop}
                        snaps={snaps}
                        fetchSnaps={fetchSnaps}
                        overlayMode={overlayMode}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {/* Sentinel — sits below the last rendered card; observer fires ~400px before it */}
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
          {overlayMode && !isLoading && totalCount > 0 && !hasMore ? (
            <div className="mt-3 border-t border-gray-200 bg-white px-3 py-2 text-[10px] leading-5 text-gray-600">
              <div className="mb-1 font-semibold text-gray-800">Snaphomz</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/terms-and-conditions" className="hover:text-gray-900">
                  Terms
                </Link>
                <Link href="/privacy-policy" className="hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="/cookie-policy" className="hover:text-gray-900">
                  Cookies
                </Link>
                <Link href="/disclosure" className="hover:text-gray-900">
                  Disclosure
                </Link>
              </div>
              <div className="mt-2 text-[10px] text-gray-500">
                Results and tools are for informational purposes only.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer: compare button (when active) + homes count */}
      {!isLoading && totalCount > 0 && (!overlayMode || isCompareMode) ? (
        <div
          className={cn(
            'relative flex flex-col items-center gap-2',
            overlayMode
              ? 'mt-1 shrink-0 border-t border-gray-200 bg-white px-2 pt-14 pb-2'
              : 'mt-6',
          )}
        >
          {overlayMode && isCompareMode ? (
            <button
              type="button"
              onClick={onOpenCompareModal}
              disabled={selectedCompareProperties.length < 2}
              className={cn(
                'absolute left-1/2 top-2 z-[80] -translate-x-1/2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition',
                selectedCompareProperties.length >= 2
                  ? 'bg-ocOrange text-white hover:brightness-95'
                  : 'cursor-not-allowed bg-white text-gray-400 ring-1 ring-gray-200'
              )}
            >
              Compare
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  selectedCompareProperties.length >= 2
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500',
                )}
              >
                {selectedCompareProperties.length}
              </span>
            </button>
          ) : null}

          {!overlayMode ? (
            <p className="text-sm text-gray-500">
              {hasMore
                ? `Showing ${visibleCount} of ${totalCount} homes`
                : `${totalCount} home${totalCount === 1 ? '' : 's'} found`}
            </p>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}

export { BuyPropertyCards };
