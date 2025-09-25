'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';

import { PropCardLoader } from '../buy-property-card-loader';
import PropertyComponents from './property-components';
import { useGetAllPropertiesListings } from '@/hooks/api/useFetchAllProperty';
import { useGetAllMLSSearchData } from '@/hooks/api/useFetchAIData';
import { IProperty } from '@/interfaces/property.interface';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';
import { usePropertyStore } from '@/store/use-property-store';

const ITEMS_PER_PAGE = 12;

function transform<T extends IProperty | MlsPropertyListing>(
  items: T[],
  type: T extends IProperty ? 'property' : 'mls',
) {
  return items?.map((item) => ({
    data: item,
    type,
  }));
}

export default function PropertyCardLists() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { allProperties, addProperties, clearProperties, setIsLoading } =
    usePropertyStore();

  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const bedRooms = searchParams.get('bedRooms') || '';
  const bathRooms = searchParams.get('bathRooms') || '';
  const sqTfMin = searchParams.get('sqTfMin') || '';
  const sqTfMax = searchParams.get('sqTfMax') || '';
  const propertyType = searchParams.get('propertyType') || '';

  const {
    data: propertyData,
    isLoading: propertyLoading,
    isFetching: propertyFetching,
    isError: propertyError,
  } = useGetAllPropertiesListings(page, ITEMS_PER_PAGE);

  const {
    data: mlsData,
    isLoading: mlsLoading,
    isFetching: mlsFetching,
    isError: mlsError,
  } = useGetAllMLSSearchData(query, page, ITEMS_PER_PAGE, {
    priceMin,
    priceMax,
    bedRooms,
    bathRooms,
    sqTfMin,
    sqTfMax,
    propertyType,
  });

  const isLoading = query ? mlsLoading : propertyLoading;
  const isFetching = query ? mlsFetching : propertyFetching;
  const isError = query ? mlsError : propertyError;

  // useEffect(() => {
  //   setIsLoading(isLoading);
  // }, [isLoading, setIsLoading]);

  useEffect(() => {
    if (query && mlsData) {
      if (mlsData.success) {
        const newProperties = transform(mlsData.value, 'mls');
        addProperties(newProperties);
        setHasMore(
          mlsData.value.length === ITEMS_PER_PAGE && page < mlsData.page_count,
        );
        setLoadingMore(false);
      } else {
        console.error('Error fetching MLS data:', mlsData.error);
       // clearProperties();
        setHasMore(false);
        setLoadingMore(false);
      }
      // @ts-ignore
    } else if (!query && propertyData?.result) {
      // @ts-ignore
      const newProperties = transform(propertyData.result, 'property');
      addProperties(newProperties);
      setHasMore(newProperties.length === ITEMS_PER_PAGE);
      setLoadingMore(false);
    }
  }, [mlsData, propertyData, query, page, addProperties, clearProperties]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore && !loadingMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [isFetching, hasMore, loadingMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  useEffect(() => {
    setPage(1);
    // clearProperties();
    setHasMore(true);
    setLoadingMore(false);
    
  }, [
    query,
    priceMin,
    priceMax,
    bedRooms,
    bathRooms,
    sqTfMin,
    sqTfMax,
    propertyType,
    // clearProperties,
  ]);

  // if (isError) {
  //   return (
  //     <div className='text-center text-red-500'>
  //       Error loading properties. Please try again later.
  //     </div>
  //   );
  // }
  console.log(allProperties )

  return (
    <div className='flex h-full w-full flex-col pb-4 pt-4'>
      <div className='px-4 md:px-8'>
        {allProperties.length > 0 ? (
          <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {allProperties.map((property) => (
              // @ts-ignore
              <PropertyComponents key={nanoid()} {...property} />
            ))}
          </div>
        ) : (
          !isLoading &&
          query && (
            <div className='flex h-full items-center justify-center py-20 text-center'>
              No properties match your search criteria.
            </div>
          )
        )}
        {/* {(isLoading || loadingMore) && (
          <div className='mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map(() => (
              <PropCardLoader key={nanoid()} />
            ))}
          </div>
        )}
        {!isLoading && !loadingMore && !hasMore && allProperties.length > 0 && (
          <div className='py-20 text-center'>No more properties to load</div>
        )} */}
      </div>
    </div>
  );
}
