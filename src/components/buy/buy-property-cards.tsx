'use client';

import Link from 'next/link';
import { RefObject, useEffect, useState, useMemo } from 'react';
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
import Pagination, { calculateTotalPages } from '@/components/card-pagination/pagination';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { useSelector } from 'react-redux';

type MyComponentRef = RefObject<HTMLDivElement>;

type Props = {
  forwardedRef?: MyComponentRef;
  selectedProperty: string;
};

const ITEMS_PER_PAGE = 14;

function BuyPropertyCards({ forwardedRef, selectedProperty }: Props) {
  const router = useRouter();
  const { currentView } = useProperty();
  const { ref } = useInView();
  const { saveMlsProperty } = usePropertyActions();
  const { aiData } = usePropertiesContext();
  const { allProperties, isLoading } = usePropertyStore();
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

  // Reset to page 1 when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [allProperties?.length]);

  useEffect(() => {
    if (selectedProperty) {
      const element = document.getElementById(selectedProperty);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProperty]);

  const paginatedProperties = useMemo(() => {
    if (!Array.isArray(allProperties)) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allProperties, currentPage]);

  const totalPages = useMemo(() => {
    return calculateTotalPages(allProperties?.length || 0, ITEMS_PER_PAGE);
  }, [allProperties?.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    if (forwardedRef?.current) {
      forwardedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
                : 'grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-[repeat(4,320px)] lg:justify-between',
            )}
          >
            {/* Show loader while fetching properties */}
            {isLoading ? (
              <>
                {Array.from({ length: 8 }).map(() => (
                  <PropCardLoader key={nanoid()} />
                ))}
              </>
            ) : (
              <>
                {Array.isArray(paginatedProperties) && paginatedProperties.length > 0 ? (
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
                        <PropertyCards
                          {...prop}
                          snaps={snaps}
                          fetchSnaps={fetchSnaps}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-10 col-span-full">
                    <div className="h-40 w-40 rounded-md text-gray-300 flex items-center justify-center border-2 border-dashed border-gray-200">
                      No Property Found
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {!isLoading && allProperties?.length > ITEMS_PER_PAGE && (
        <div className="mt-10 mb-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allProperties.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export { BuyPropertyCards };
