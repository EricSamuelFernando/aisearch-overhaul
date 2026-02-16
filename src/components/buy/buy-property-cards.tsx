'use client';

import Link from 'next/link';
import { RefObject, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/lib/utils';
import { usePropertiesContext } from '@/providers/property-provider';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';
import { MLSPropertyCard } from '@/components/mls-property-card';
import { useProperty, usePropertyActions } from '@/shared/hooks/useProperty';
import { PropCardLoader } from './buy-property-card-loader';
import PropertyCards from './browse/property-card';
import { usePropertyStore } from '@/store/use-property-store';

type MyComponentRef = RefObject<HTMLDivElement>;

type Props = {
  forwardedRef?: MyComponentRef;
  selectedProperty: string;
};

function BuyPropertyCards({ forwardedRef, selectedProperty }: Props) {
  const router = useRouter();
  const { currentView } = useProperty();
  const { ref } = useInView();
  const { saveMlsProperty } = usePropertyActions();
  const { aiData } = usePropertiesContext();
  const { allProperties,isLoading } = usePropertyStore();

  // Pagination: 5 rows x 2 columns = 10 cards per page for map view.
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((allProperties?.length || 0) / ITEMS_PER_PAGE)),
    [allProperties],
  );

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return Array.isArray(allProperties) ? allProperties.slice(start, end) : [];
  }, [allProperties, currentPage]);

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

  // If a selected property is outside the current page, jump to the correct page first.
  useEffect(() => {
    if (!selectedProperty || !Array.isArray(allProperties)) return;
    const idx = allProperties.findIndex((p: any) => p.id === selectedProperty);
    if (idx === -1) return;
    const targetPage = Math.floor(idx / ITEMS_PER_PAGE) + 1;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [selectedProperty, allProperties, currentPage]);

  useEffect(() => {
    if (selectedProperty) {
      const element = document.getElementById(selectedProperty);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProperty, currentPage]);
  
  return (
    <div ref={forwardedRef} className="flex h-full flex-col">
      <div className="flex-auto">
        <div
          className={cn(
            currentView === 'grid' ? 'max-w-[1450px] mx-auto w-full' : 'w-full',
          )}
        >
          <div
            className={cn(
              'w-full',
              currentView === 'map'
                ? 'grid grid-cols-1 gap-y-4 gap-x-8 md:grid-cols-2 md:gap-x-6 md:gap-y-6 lg:grid-cols-2'
                : 'grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-[repeat(4,360px)] lg:gap-x-8 lg:justify-center xl:grid-cols-[repeat(4,380px)]',
            )}
          >
          {/* Show loader while fetching properties */}
          {isLoading ? (
            <>
              {Array.from({ length: currentView === 'map' ? 10 : 10 }).map(() => (
                <PropCardLoader key={nanoid()} />
              ))}
            </>
          ) : (
            <>
              {Array.isArray(allProperties) && allProperties.length > 0 ? (
                paginatedProperties.map((prop: any) => {
                  const isSelected = prop.id === selectedProperty;
                  return (
                    <div
                      ref={ref}
                      key={prop.id}
                      id={prop.id}
                      className={cn(
                        isSelected
                          ? 'bg-white p-1 bg-orange-500 rounded-2xl shadow-xl'
                          : '',
                        'transition duration-300 ease-in-out',
                        currentView === 'grid' ? 'w-[320px]' : '',
                      )}
                    >
                      <PropertyCards {...prop} />
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="h-40 w-40 rounded-md text-gray-300">
                    No Property Found
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              className={cn(
                'h-10 w-10 rounded-full border text-base font-medium transition',
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-200 shadow hover:shadow-md'
              )}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ←
            </button>

            <div className="flex items-center gap-3">
              {pageNumbers.map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={cn(
                    'h-10 w-10 rounded-full text-sm font-medium transition',
                    num === currentPage
                      ? 'bg-black text-white shadow'
                      : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'
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
                  : 'bg-white text-gray-700 border-gray-200 shadow hover:shadow-md'
              )}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              →
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {`${allProperties?.length || 0} homes found (showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(allProperties?.length || 0, currentPage * ITEMS_PER_PAGE)})`}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { BuyPropertyCards };
