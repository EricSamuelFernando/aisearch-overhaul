'use client';

import Link from 'next/link';
import { RefObject, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedProperty) {
      const element = document.getElementById(selectedProperty);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProperty]);
  
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
              {Array.from({ length: currentView === 'map' ? 10 : 10 }).map(() => (
                <PropCardLoader key={nanoid()} />
              ))}
            </>
          ) : (
            <>
              {Array.isArray(allProperties) && allProperties.length > 0 ? (
                allProperties.map((prop: any) => {
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
    </div>
  );
}

export { BuyPropertyCards };
