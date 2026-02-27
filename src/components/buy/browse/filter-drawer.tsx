'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeatureOption } from '../property-filter';
import CustomInput from '@/components/customs/input';
import { removeNonNumericCharacters } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { PROPERTY_SEARCH_AI_URL } from '@/shared/constants/env';
import axios from 'axios';
import { incrementSearchCount } from '@/slices/onboarding/property-preference';
import { setPropertyQuery, setSearchFilters } from '@/slices/property/property-slice';
import { usePropertyStore } from '@/store/use-property-store';
import { useDispatch, useSelector } from 'react-redux';
import { error, success } from '@/components/alert/notify';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { useAtom } from 'jotai';
import { filterAtom } from '@/hooks/atoms';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

interface FilterDrawerProps {
  FeatureSelectorComponent: React.FC<{
    bedOptions: FeatureOption[];
    onSelect: (selectedBed: number | string) => void;
  }>;
  FeatureBathroomSelector: React.FC<{
    bedOptions: FeatureOption[];
    onSelect: (selectedBed: number | string) => void;
  }>;
  subCategories?: any;
  selectedSubCategories?: any;
}

const FilterDrawer = ({ FeatureSelectorComponent, FeatureBathroomSelector, subCategories, selectedSubCategories }: FilterDrawerProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth()
  const [filters, setFilters] = useAtom(filterAtom);
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tempUserId } = useAppSelector((state: RootState) => state.propertyPreference);
  const userId = user?.id || tempUserId
  const sortOptions = [
    { name: 'Select type', value: '' },
    { name: 'Residential', value: 'RESIDENTIAL' },
    { name: 'Residential income', value: 'RESIDENTIAL_INCOME' },
    { name: 'Commercial', value: 'COMMERCIAL' },
    { name: 'Land', value: 'LAND' },
    { name: 'Rental', value: 'RENTAL' },
    { name: 'Business', value: 'BUSINESS_OPPORTUNITY' },
    { name: 'Commercial for lease', value: 'COMMERCIAL_FOR_LEASE' }
  ]
  // const [selectedSort, setSelectedSort] = useState(sortOptions[0])
  // const sortOptions = [
  //   { name: 'Price: Low to High', value: 'price_low_high' },
  //   { name: 'Price: High to Low', value: 'price_high_low' },
  //   { name: 'Newest', value: 'newest' }
  // ];

  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  const searchQuery = searchParams.get("q") || ""
  const searchFilters = useSelector((state: RootState) => state.property.filters);
  const [localFilters, setLocalFilters] = useState({
    priceMin: +(filters.minPrice ?? "") || '',
    priceMax: +(filters.maxPrice ?? "") || '',
    bedRooms: filters.bedrooms || '',
    bathRooms: filters.bathrooms || '',
    sqTfMin: searchParams.get('sqTfMin') || '',
    sqTfMax: searchParams.get('sqTfMax') || '',
    propertyType: searchParams.get('propertyType') || '',
    listing_property_type: selectedSort.value,
  });

  const {
    allProperties,
    addProperties,
    clearProperties,
    setIsLoading,
    setSearchedQuery,
    isLoading,
  } = usePropertyStore();

  const bedOptions: FeatureOption[] = [
    { title: 'All', value: 'All' },
    { title: '1+', value: 1 },
    { title: '2+', value: 2 },
    { title: '3+', value: 3 },
    { title: '4+', value: 4 },
    { title: '5+', value: 5 },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Pre-select filters from query string (q, bedRooms, bathRooms) so the UI matches the applied search.
  useEffect(() => {
    const bedParam = searchParams.get('bedRooms');
    const bathParam = searchParams.get('bathRooms');

    const extractNumber = (pattern: RegExp) => {
      const match = searchQuery.match(pattern);
      return match ? Number(match[1]) : undefined;
    };

    const inferredBeds = bedParam ? Number(bedParam) : extractNumber(/(\d+)\s*[- ]*bed/i);
    const inferredBaths = bathParam ? Number(bathParam) : extractNumber(/(\d+)\s*[- ]*bath/i);

    setLocalFilters((prev) => ({
      ...prev,
      bedRooms: prev.bedRooms || (inferredBeds ? inferredBeds.toString() : ''),
      bathRooms: prev.bathRooms || (inferredBaths ? inferredBaths.toString() : ''),
    }));

    setFilters((prev: any) => ({
      ...prev,
      bedrooms: prev.bedrooms ?? inferredBeds ?? prev.bedrooms,
      bathrooms: prev.bathrooms ?? inferredBaths ?? prev.bathrooms,
    }));
  }, [searchQuery, searchParams, setFilters]);

  const handleBedSelection = (selectedBed: number | string) => {
    setLocalFilters((prev) => ({ ...prev, bedRooms: selectedBed.toString() }));
  };

  const handleBathSelection = (selectedBath: number | string) => {
    setLocalFilters((prev) => ({
      ...prev,
      bathRooms: selectedBath.toString(),
    }));
  };

  const handlePriceSwapAndSet = (min: number, max: number) => {
    if (min > max) {
      [min, max] = [max, min];
    }
    setLocalFilters((prev) => ({
      ...prev,
      priceMin: min.toString(),
      priceMax: max.toString(),
    }));
  };

  const handleAreaSwapAndSet = (min: number, max: number) => {
    if (min > max) {
      [min, max] = [max, min];
    }
    setLocalFilters((prev) => ({
      ...prev,
      sqTfMin: min.toString(),
      sqTfMax: max.toString(),
    }));
  };

  const applyFilters = async () => {
    setLoading(true);
    setSearchedQuery("");
    addProperties([]);
    const data: any = {
      bedrooms: +localFilters?.bedRooms || undefined,
      bathrooms: +localFilters?.bathRooms || undefined,
      listing_price_max: +(filters?.maxPrice ?? "") || undefined,
      listing_price_min: +(filters?.minPrice ?? "") || undefined,
      additional_criteria: {}
    }
    dispatch(setSearchFilters({
      ...searchFilters,
      minPrice: +localFilters?.priceMin || undefined,
      maxPrice: +localFilters?.priceMax || undefined,
      bedRooms: +localFilters?.bedRooms || undefined,
      bathRooms: +localFilters?.bathRooms || undefined,

    }))
    setFilters((prev: any) => ({
      ...prev,
      bedrooms: +localFilters?.bedRooms,
      bathrooms: +localFilters?.bathRooms,
    }));
    if (selectedSubCategories.length > 0) {
      selectedSubCategories.forEach((subCat: any) => {
        const subcategory = subCategories.find((sub: any) => sub.title === subCat);
        if (subcategory && subcategory.value) {
          data.additional_criteria[subcategory.value] = true;
        }
      });
    }
    try {
      const response = await axios.post(
        PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
        {
          ...data,
          user: userId,
          query: searchQuery,
          // num_records: process.env.SEARCH_RECORDS || 10,
          listing_property_type: searchFilters.propertyType || undefined,
          public_land_use: searchFilters.subType || undefined,
        }
      );
      clearProperties();
      dispatch(incrementSearchCount());
      dispatch(setPropertyQuery(response.data?.result.search_query));
      setSearchedQuery(response.data?.result.records);
      addProperties(response.data?.result.records);
      setLoading(false)
      if (!user?.email) {
        error({ message: 'You have reached the search limit for non-logged-in users. Please create an account to continue.' });
        router.replace("/login")
      } else {
        console.log("No properties found for the current map view");
      }
    } catch (err: any) {
      console.error('Search request failed:', err);
      error({
        message: err?.response?.data?.error || 'An unexpected error occurred.',
      });
      setLoading(false)
    }
    setLoading(false)
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({
      priceMin: '',
      priceMax: '',
      bedRooms: '',
      bathRooms: '',
      sqTfMin: '',
      sqTfMax: '',
      propertyType: '',
      listing_property_type: '',
    });
  };
  console.log("filters", filters);


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className='z-20 flex h-full cursor-pointer items-center gap-x-2 px-4 font-semibold'
          onClick={() => setIsOpen(true)}
        >
          <span>
            <Image
              src='/assets/images/v2/filter.svg'
              height={30}
              width={30}
              alt='filter'
            />
          </span>
          <span>Filter</span>
        </button>
      </SheetTrigger>
      <SheetContent
        className='flex w-full flex-col rounded-r-lg p-0 sm:max-w-xl'
        side={'left'}
      >
        <ScrollArea className='h-full w-full'>
          <div className='p-6'>
            <article className='relative'>
              <div className='w-full flex-auto'>
                <article className='space-y-8'>
                  <section>
                    <p className='mb-2 text-3xl font-bold'>Price</p>
                    <div className='mb-4 flex items-center justify-center'>
                      <CustomInput
                        min={10}
                        value={filters.minPrice || ''}
                        placeholder='Min Price'
                        onChange={(e) =>
                          handleInputChange('minPrice', e.target.value)
                        }
                        // onBlur={(e) => {
                        //   handlePriceSwapAndSet(
                        //     Number(
                        //       removeNonNumericCharacters(e.currentTarget.value),
                        //     ),
                        //     Number(localFilters.priceMax),
                        //   );
                        // }}
                        type='number'
                        className='flex-auto'
                      />
                      <div className='mb-5 flex w-[40px] items-center justify-center text-2xl'>
                        -
                      </div>
                      <CustomInput
                        value={filters.maxPrice || ''}
                        onChange={(e) =>
                          handleInputChange('maxPrice', e.target.value)
                        }
                        // onBlur={(e) => {
                        //   handlePriceSwapAndSet(
                        //     Number(localFilters.priceMin),
                        //     Number(
                        //       removeNonNumericCharacters(e.currentTarget.value),
                        //     ),
                        //   );
                        // }}
                        type='number'
                        placeholder='Max Price'
                        className='flex-auto'
                      />
                    </div>
                  </section>
                  {/* <section>
                    <p className='mb-2 text-3xl font-bold'>Square Footage</p>
                    <div className='mb-4 flex items-center justify-center'>
                      <CustomInput
                        min={10}
                        value={localFilters.sqTfMin || ''}
                        onChange={(e) =>
                          handleInputChange('sqTfMin', e.target.value)
                        }
                        // onBlur={(e) => {
                        //   handleAreaSwapAndSet(
                        //     Number(
                        //       removeNonNumericCharacters(e.currentTarget.value),
                        //     ),
                        //     Number(localFilters.sqTfMax),
                        //   );
                        // }}
                        type='number'
                        placeholder='Min Sqft'
                        className='flex-auto'
                      />
                      <div className='mb-5 flex w-[40px] items-center justify-center text-2xl'>
                        -
                      </div>
                      <CustomInput
                        value={localFilters.sqTfMax || ''}
                        onChange={(e) =>
                          handleInputChange('sqTfMax', e.target.value)
                        }
                        // onBlur={(e) => {
                        //   handleAreaSwapAndSet(
                        //     Number(localFilters.sqTfMin),
                        //     Number(
                        //       removeNonNumericCharacters(e.currentTarget.value),
                        //     ),
                        //   );
                        // }}
                        type='number'
                        placeholder='Max Sqft'
                        className='flex-auto'
                      />
                    </div>
                  </section> */}
                  <section>
                    <p className='mb-2 text-3xl font-bold'>Bedrooms</p>
                    <FeatureSelectorComponent
                      bedOptions={bedOptions}
                      onSelect={handleBedSelection}
                    />
                  </section>

                  <section>
                    <p className='mb-2 text-3xl font-bold'>Bathrooms</p>
                    <FeatureBathroomSelector
                      bedOptions={bedOptions}
                      onSelect={handleBathSelection}
                    />
                  </section>
                </article>
              </div>

              <div className='w-full flex-auto flex py-4 gap-4'>

                <Listbox value={selectedSort} onChange={setSelectedSort}>
                  <div className="relative w-full">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-slate-100  py-4 pl-4 pr-10 text-left text-sm font-medium text-gray-700 shadow-sm hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300">
                      {searchFilters?.propertyType || selectedSort.name}
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-ocOrange" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 w-full rounded-xl bg-white shadow-lg z-10 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {sortOptions.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 text-sm ${active ? 'bg-orange-100 text-orange-700' : 'text-gray-900'
                            }`
                          }
                          value={option}
                        >
                          {({ selected }) => (
                            <span className="flex items-center justify-between">
                              {option.name}
                              {selected && <Check className="w-4 h-4 text-orange-600" />}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>

              </div>
              <article className='flex flex-1 items-center justify-end gap-x-6 pt-10'>
                <button onClick={handleReset}>Cancel</button>
                <button
                  className='min-w-[150px] rounded-3xl !bg-black p-3 text-white flex items-center justify-center'
                  onClick={applyFilters}
                  disabled={loading}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    'Apply'
                  )}
                </button>

              </article>
            </article>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;
