'use client';

import Link from 'next/link';
import { RefObject, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { useInView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils';
import { useProperty } from '@/shared/hooks/useProperty';
import { PropCardLoader } from './buy-property-card-loader';
import PropertyCards from './browse/property-card';
import { usePropertyStore } from '@/store/use-property-store';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';

type MyComponentRef = RefObject<HTMLDivElement>;

type Props = {
  forwardedRef?: MyComponentRef;
  selectedProperty: string;
  propertiesOverride?: any[] | null;
  overlayMode?: boolean;
};

const ITEMS_PER_PAGE = 10;

function BuyPropertyCards({
  forwardedRef,
  selectedProperty,
  propertiesOverride,
  overlayMode = false,
}: Props) {
  const { currentView } = useProperty();
  const { ref } = useInView();
  const { allProperties, isLoading } = usePropertyStore();
  const sourceProperties = Array.isArray(propertiesOverride)
    ? propertiesOverride
    : allProperties;

  const userData = useSelector((state: any) => state.auth.user);
  const { getAllSnaps } = useUserSnapAPIs();
  const [snaps, setSnaps] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [sourceProperties?.length]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((sourceProperties?.length || 0) / ITEMS_PER_PAGE)),
    [sourceProperties],
  );

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return Array.isArray(sourceProperties) ? sourceProperties.slice(start, end) : [];
  }, [sourceProperties, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (!selectedProperty || !Array.isArray(sourceProperties)) return;
    const idx = sourceProperties.findIndex((p: any) => String(p?.id) === String(selectedProperty));
    if (idx === -1) return;
    const targetPage = Math.floor(idx / ITEMS_PER_PAGE) + 1;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [selectedProperty, sourceProperties, currentPage]);

  useEffect(() => {
    if (!selectedProperty) return;
    const raf = requestAnimationFrame(() => {
      const element = document.getElementById(String(selectedProperty));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedProperty, currentPage]);

  return (
    <div
      ref={forwardedRef}
      className={cn(
        'flex h-full flex-col',
        overlayMode ? 'min-h-0' : '',
      )}
    >
      <div className={cn('flex-auto', overlayMode ? 'min-h-0 overflow-y-auto overscroll-contain pr-1' : '')}>
        <div
          className={cn(
            currentView === 'grid' ? 'max-w-[1450px] mx-auto w-full' : 'w-full',
            overlayMode ? 'max-w-none' : '',
          )}
        >
          <div
            className={cn(
              'w-full',
              overlayMode
                ? 'grid grid-cols-1 gap-3 xl:grid-cols-2'
                : currentView === 'map'
                  ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'
                  : 'grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-[repeat(4,360px)] lg:gap-x-8 lg:justify-center xl:grid-cols-[repeat(4,380px)]',
            )}
          >
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map(() => (
                  <PropCardLoader key={nanoid()} />
                ))}
              </>
            ) : (
              <>
                {Array.isArray(sourceProperties) && sourceProperties.length > 0
                  ? paginatedProperties.map((prop: any) => {
                      const isSelected = String(prop?.id) === String(selectedProperty);
                      return (
                        <div
                          ref={ref}
                          key={prop.id}
                          id={String(prop.id)}
                          className={cn(
                            isSelected
                              ? overlayMode
                                ? "relative rounded-xl shadow-md before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:ring-2 before:ring-inset before:ring-orange-400 before:content-[''] before:z-20"
                                : 'bg-white p-1 bg-orange-500 rounded-2xl shadow-xl'
                              : '',
                            'transition duration-300 ease-in-out',
                            currentView === 'grid' && !overlayMode ? 'w-[320px]' : '',
                          )}
                        >
                          <PropertyCards
                            {...prop}
                            snaps={snaps}
                            fetchSnaps={fetchSnaps}
                            overlayMode={overlayMode}
                          />
                        </div>
                      );
                    })
                  : null}
              </>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 ? (
        <div
          className={cn(
            'flex flex-col items-center gap-3',
            overlayMode
              ? 'mt-1 shrink-0 border-t border-gray-200 bg-white px-2 pt-2 pb-2'
              : 'mt-6',
          )}
        >
          <div className="flex items-center gap-3">
            <button
              className={cn(
                'h-10 w-10 rounded-full border text-base font-medium transition',
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-200 shadow hover:shadow-md',
              )}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              {'<'}
            </button>

            <div className="flex items-center gap-3">
              {pageNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={cn(
                    'h-10 w-10 rounded-full text-sm font-medium transition',
                    num === currentPage
                      ? 'bg-black text-white shadow'
                      : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md',
                  )}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              className={cn(
                'h-10 w-10 rounded-full border text-base font-medium transition',
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-200 shadow hover:shadow-md',
              )}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              {'>'}
            </button>
          </div>

          <div className={cn('text-sm text-gray-600', overlayMode ? 'text-center text-xs font-medium' : '')}>
            {`${sourceProperties?.length || 0} homes found (showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(sourceProperties?.length || 0, currentPage * ITEMS_PER_PAGE)})`}
          </div>
        </div>
      ) : null}

      {overlayMode ? (
        <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2 text-[10px] leading-5 text-gray-600">
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
  );
}

export { BuyPropertyCards };
