'use client';

import { nanoid } from 'nanoid';
import * as React from 'react';
import Link from 'next/link';

import CustomInput from '@/components/customs/input';
import DashboardSkeleton from '@/components/dashboard/Skeleton';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/hooks/useAuth';
import SkeletonLoader from '@/components/skeleton-loader';
import { useBuyerPropertiesContext } from '@/providers/buyer-porperty-context';
import { homeEmpty } from '@public/assets/images';
import Agents from './agents';
import { ExpandedEmptyState } from './empty-state';
import { NotificationList } from './notification-list';
import BuyerListingItem from './property-card';
import ToursList from './tours-list';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import useDebounce from "@/hooks/utils/debounce";
import { error } from '@/components/alert/notify';
import { HeroSearchForm } from '@/components/main/hero-tab';
import { fetchPlaceSuggestions } from '@/hooks/utils/googlePlacesFunction';

import { Pagination } from '@mantine/core';

interface EngagedPropertyInterface {
  id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyAddress: string;
  propertyProgress: number;
  listingId: number | string;
  status: string;
}

const BuyerPropertyListingSkeleton = () => {
  return (
    <div className='grid grid-cols-3 items-start justify-between gap-8'>
      <div className='col-span-2 grid grid-cols-2 place-content-center gap-12'>
        {Array.from({ length: 4 }).map(() => (
          <DashboardSkeleton key={nanoid()} />
        ))}
      </div>
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map(() => (
          <SkeletonLoader className='w-[400px]' key={nanoid()} />
        ))}
      </div>
    </div>
  );
};

function BuyerPropertyListing() {
  const [searchValue, setSearchValue] = React.useState('');
  const [engagedProperties, setEngagedProperties] = React.useState<EngagedPropertyInterface[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);  // Ref for the input field to preserve focus

  const { user } = useAuth();

  const {
    getAllEngagedProperties,
    deleteEngagedPropertyById,
    searchEngagedProperty,
  } = useAgentConversationApi()
  const currentUserData = useSelector(userData)
  const [loading, setLoading] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const suggestionsRef = React.useRef<HTMLDivElement | null>(null);
  const propertyCount = engagedProperties?.length;
  const properties = engagedProperties;
  const total = engagedProperties?.length;
  const debounce = useDebounce()
  const [page, setPage] = React.useState<number>(1)
  const propertiesPerPage = 6
  const getBrowseHomesLink = React.useCallback(() => {
    const { preferredPropertyAddress, spendAmount, propertyType } =
      user?.propertyPreference ?? {};
    const params = new URLSearchParams();

    if (preferredPropertyAddress) {
      params.append('q', preferredPropertyAddress);
    } else if (searchValue) {
      params.append('q', searchValue);
    }

    if (spendAmount?.max) {
      params.append('priceMax', spendAmount.max.toString());
    }

    if (propertyType) {
      params.append('features', propertyType);
    }

    // return `/buy/browse?${params.toString()}`;
    return `/buy/browse`;
  }, [user?.propertyPreference, searchValue]);

  const searchEnagagedProperties = async (value: string) => {
    try {
      setLoading(true)
      setEngagedProperties([]);
      setPage(1)
      searchEngagedProperty.mutateAsync({ search: value, userId: user?.id }, {
        onSuccess: (response) => {
          setEngagedProperties(response?.data?.data?.searchUserPropertyEngagements)
          if (!response?.data?.data?.searchUserPropertyEngagements?.length) {
            error({ message: "No property found" })
          }
          setLoading(false)
        },
        onError: (error) => {
          console.log(error);
          setLoading(false)

        }
      })
    } catch (error) {
      console.log("error ", error);
    }
  }

  const handleSearch = React.useCallback(
    debounce((value: string) => {
      searchEnagagedProperties(value)
    }, 1000),
    [],
  )

  const getEngagedProperties = async () => {
    try {
      setEngagedProperties([]);
      setLoading(true)
      getAllEngagedProperties.mutate(currentUserData?.id, {
        onSuccess: (data) => {
          setEngagedProperties(data?.data?.data?.getUserEngagements)
        }
      })
    } catch (error) {
      console.log("error ", error);
    }
    setLoading(false)
  }

  const handleDeleteEngagement = (id: string) => {
    deleteEngagedPropertyById.mutate(id, {
      onSuccess: (data) => {
        getEngagedProperties()
      }
    })
  }

  React.useEffect(() => {
    getEngagedProperties()
  }, []);

  const ButtonComponent = React.useMemo(
    () => (
      <ExpandedEmptyState
        img={homeEmpty}
        description={'You have not engaged in any property'}
      >
        {/* <Button asChild roundness='full'
          disabled={!searchValue.length}
          onClick={(e) => {
            e.preventDefault();
            if (searchValue)
              searchEnagagedProperties(searchValue)
          }}
        >
          <Link href="">Browse Homes</Link>
        </Button> */}
      </ExpandedEmptyState>
    ),
    [getBrowseHomesLink],
  );
  const indexOfLastProperty = page * propertiesPerPage
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
  const currentProperties = engagedProperties?.slice(indexOfFirstProperty, indexOfLastProperty)

  console.log("Current properties being displayed:", currentProperties); // Log to verify correct properties


  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();  // Ensure input is focused after the page loads or after search
    }
  }, [searchValue]);  // Keep input focused when searchValue changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setSearchValue(value);
    fetchPlaceSuggestions(value, setSuggestions);  // Get suggestions while typing
    handleSearch(value);  // Trigger search as user types
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <section className="w-full px-4 sm:px-6 md:px-8">
      {loading ? (
        <BuyerPropertyListingSkeleton />
      ) : (
        <section className='grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3'>
          {/* Main Content Area */}
          <div className='col-span-1 md:col-span-2'>
            {!propertyCount && total && total < 1 ? (
              <div className='flex items-center justify-center col-span-1 md:col-span-2'>
                {ButtonComponent}
              </div>
            ) : (
              <>
                {true ? (
                  <>
                    {/* Search and Browse Section */}
                    <div className="relative mb-6 sm:mb-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 sm:gap-x-10">
                        <div className="flex w-full max-w-4xl items-center gap-x-4">
                          <CustomInput
                            autoFocus
                            value={searchValue}
                            className="h-12 w-full sm:max-w-md rounded-lg border border-[#707070]"
                            containerClass="mb-0 flex-1"
                            placeholder="Search property"
                            leftSection={<Icons.Search className="h-4 w-4" />}
                            leftSectionProps={{ className: 'pl-6' }}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              setSearchValue(value);
                              fetchPlaceSuggestions(value, setSuggestions);
                              searchEnagagedProperties(value);  // Trigger search as soon as the user types
                            }}
                          />

                          {/* <Button
                            roundness="full"
                            // disabled={!searchValue.length}
                            onClick={(e) => {
                              e.preventDefault();                              
                                searchEnagagedProperties(searchValue);
                            }}
                          >
                            Browse Homes
                          </Button> */}
                        </div>
                      </div>

                      {suggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute z-10 mt-2 w-full sm:max-w-md border border-gray-300 bg-white shadow-lg rounded-md max-h-60 overflow-y-auto text-left left-0"
                        >
                          {suggestions.map((city: string, index: number) => (
                            <div
                              key={index}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                              onClick={() => {
                                setSearchValue(city);
                                setSuggestions([]);
                                // Optional: searchEnagagedProperties(city);
                              }}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Properties Grid */}
                    {
                      loading ?
                        <div className="col-span-1 grid place-content-center py-10">
                          <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div> : <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                          {propertyCount ? (
                            currentProperties?.map((item) => (

                              <BuyerListingItem key={item.id}
                                id={item.id}
                                propertyId={item.propertyId}
                                listingId={item.listingId}
                                propertyName={item.propertyName}
                                propertyImage={item.propertyImage}
                                propertyAddress={item.propertyAddress}
                                propertyProgress={item.propertyProgress}
                                handleRemoveProperty={handleDeleteEngagement}
                                selectedProperty={item}
                              />
                            ))
                          ) : (
                            <div className='col-span-1 sm:col-span-2 grid place-content-center'>
                              {ButtonComponent}
                            </div>
                          )}
                        </div>}

                    {/* Pagination */}
                    {engagedProperties?.length > propertiesPerPage && (
                      <div className='mt-6 sm:mt-8 flex justify-center col-span-1 sm:col-span-2'>
                        <Pagination
                          value={page}
                          onChange={setPage}
                          total={Math.ceil(engagedProperties.length / propertiesPerPage)}
                          color="orange"
                          size='lg'
                          boundaries={0}
                          radius={'xl'}
                          mb={24}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className='mt-6 sm:mt-8 grid gap-6 grid-cols-1 sm:col-span-2'>
                    <div className='grid place-content-center md:col-span-2'>
                      {ButtonComponent}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Search Input at Bottom */}
            <div className='mt-12 sm:mt-16 md:mt-24'>
              <HeroSearchForm showOutline searchType="buy" disableAutoExpand />
            </div>
          </div>

          {/* Sidebar - Tours, Notifications, and Agents */}
          <section className="col-span-1 space-y-4 sm:space-y-6 min-w-0">
            <div className="bg-white rounded-lg overflow-visible min-w-0">
              <ToursList properties={properties} />
            </div>

            <div className="bg-white rounded-lg min-w-0">
              <NotificationList />
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              <Agents />
            </div>
          </section>
        </section>
      )}
    </section>
  );
}

export default BuyerPropertyListing;
