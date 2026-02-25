'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

type ParsedQueryFilters = {
  bedRooms?: number;
  bathRooms?: number;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
};

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const parseQueryFilters = (
  query: string,
  typeOptions: Array<{ name: string; value: string }>,
): ParsedQueryFilters => {
  const text = query.toLowerCase();
  if (!text) return {};

  const toNumber = (raw: string): number | undefined => {
    const clean = raw.toLowerCase().replace(/,/g, '').trim();
    let value: number;
    if (clean.endsWith('m')) value = parseFloat(clean) * 1_000_000;
    else if (clean.endsWith('k')) value = parseFloat(clean) * 1_000;
    else if (clean.endsWith('b') || clean.endsWith('bn')) value = parseFloat(clean) * 1_000_000_000;
    else if (clean.includes('billion')) value = parseFloat(clean) * 1_000_000_000;
    else if (clean.includes('million')) value = parseFloat(clean) * 1_000_000;
    else value = parseFloat(clean.replace(/[^\d.]/g, ''));
    return Number.isFinite(value) ? Math.round(value) : undefined;
  };

  const bedMatch = text.match(/(\d+)\s*[- ]*(?:bed|bedroom)s?\b/i);
  const bathMatch = text.match(/(\d+)\s*[- ]*(?:bath|bathroom)s?\b/i);

  const normalizedQuery = normalizeText(query);
  let inferredType: string | undefined;
  if (normalizedQuery && typeOptions?.length) {
    let bestScore = 0;
    typeOptions.forEach((opt) => {
      if (!opt.value) return;
      const nameNorm = normalizeText(opt.name);
      const valueNorm = normalizeText(opt.value);
      const matched =
        (nameNorm && normalizedQuery.includes(nameNorm)) ||
        (valueNorm && normalizedQuery.includes(valueNorm));
      if (!matched) return;
      const score = Math.max(nameNorm.length, valueNorm.length);
      if (score > bestScore) {
        bestScore = score;
        inferredType = opt.value;
      }
    });
  }

  const base = {
    bedRooms: bedMatch ? Number(bedMatch[1]) : undefined,
    bathRooms: bathMatch ? Number(bathMatch[1]) : undefined,
    propertyType: inferredType,
  };

  const between = text.match(
    /between\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)\s+and\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  if (between) {
    const a = toNumber(between[1]);
    const b = toNumber(between[2]);
    if (a !== undefined && b !== undefined) {
      return { ...base, priceMin: Math.min(a, b), priceMax: Math.max(a, b) };
    }
    return base;
  }

  const dash = text.match(
    /\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)\s*-\s*\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  if (dash) {
    const a = toNumber(dash[1]);
    const b = toNumber(dash[2]);
    if (a !== undefined && b !== undefined) {
      return { ...base, priceMin: Math.min(a, b), priceMax: Math.max(a, b) };
    }
    return base;
  }

  const fromTo = text.match(
    /from\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)\s+(?:to|through|until|till)\s+\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  if (fromTo) {
    const a = toNumber(fromTo[1]);
    const b = toNumber(fromTo[2]);
    if (a !== undefined && b !== undefined) {
      return { ...base, priceMin: Math.min(a, b), priceMax: Math.max(a, b) };
    }
  }

  const maxCue = text.match(
    /\b(at\s*most|atmost|under|below|less than|up to|max(?:imum)?|no more than|not more than|not exceeding|<=|<)\b[^$\d]*\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const minCue = text.match(
    /\b(at\s*least|atleast|over|above|more than|no less than|min(?:imum)?|starting\s*(?:at|from)|from|>=|>)\b[^$\d]*\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );
  const budgetCue = text.match(
    /\b(budget|around|approximately|about|roughly|circa)\b[^$\d]{0,24}\$?([\d.,]+(?:\.\d+)?\s*(?:m|k|b|bn|million|billion)?)/i,
  );

  const minValue = minCue ? toNumber(minCue[2]) : undefined;
  const maxValue = maxCue ? toNumber(maxCue[2]) : budgetCue ? toNumber(budgetCue[2]) : undefined;

  return { ...base, priceMin: minValue, priceMax: maxValue };
};

const FilterDrawer = ({ FeatureSelectorComponent, FeatureBathroomSelector, subCategories, selectedSubCategories }: FilterDrawerProps) => {
  const pathname = usePathname();
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
  const [localFilters, setLocalFilters] = useState(() => {
    const inferred = parseQueryFilters(searchQuery, sortOptions);
    const bedParam = searchParams.get('bedRooms') || '';
    const bathParam = searchParams.get('bathRooms') || '';
    const priceMinParam = searchParams.get('priceMin') || '';
    const priceMaxParam = searchParams.get('priceMax') || '';
    const propertyTypeParam = searchParams.get('propertyType') || '';
    return {
      priceMin: priceMinParam || (filters.minPrice ? String(filters.minPrice) : inferred.priceMin ? String(inferred.priceMin) : ''),
      priceMax: priceMaxParam || (filters.maxPrice ? String(filters.maxPrice) : inferred.priceMax ? String(inferred.priceMax) : ''),
      bedRooms: bedParam || (filters.bedrooms ? String(filters.bedrooms) : inferred.bedRooms ? String(inferred.bedRooms) : ''),
      bathRooms: bathParam || (filters.bathrooms ? String(filters.bathrooms) : inferred.bathRooms ? String(inferred.bathRooms) : ''),
      sqTfMin: searchParams.get('sqTfMin') || '',
      sqTfMax: searchParams.get('sqTfMax') || '',
      propertyType: propertyTypeParam || inferred.propertyType || '',
      listing_property_type: selectedSort.value,
    };
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
    if (field === 'minPrice') {
      setLocalFilters((prev) => ({ ...prev, priceMin: value }));
    } else if (field === 'maxPrice') {
      setLocalFilters((prev) => ({ ...prev, priceMax: value }));
    } else if (field === 'sqTfMin') {
      setLocalFilters((prev) => ({ ...prev, sqTfMin: value }));
    } else if (field === 'sqTfMax') {
      setLocalFilters((prev) => ({ ...prev, sqTfMax: value }));
    }
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Pre-select filters from query string so the UI matches the applied search.
  useEffect(() => {
    const inferred = parseQueryFilters(searchQuery, sortOptions);
    const bedParam = searchParams.get('bedRooms') || '';
    const bathParam = searchParams.get('bathRooms') || '';
    const priceMinParam = searchParams.get('priceMin') || '';
    const priceMaxParam = searchParams.get('priceMax') || '';
    const propertyTypeParam = searchParams.get('propertyType') || '';

    const nextLocal = {
      priceMin: priceMinParam || (inferred.priceMin ? String(inferred.priceMin) : ''),
      priceMax: priceMaxParam || (inferred.priceMax ? String(inferred.priceMax) : ''),
      bedRooms: bedParam || (inferred.bedRooms ? String(inferred.bedRooms) : ''),
      bathRooms: bathParam || (inferred.bathRooms ? String(inferred.bathRooms) : ''),
      sqTfMin: searchParams.get('sqTfMin') || '',
      sqTfMax: searchParams.get('sqTfMax') || '',
      propertyType: propertyTypeParam || inferred.propertyType || '',
      listing_property_type: selectedSort.value,
    };

    setLocalFilters(nextLocal);

    setFilters((prev: any) => ({
      ...prev,
      bedrooms: nextLocal.bedRooms ? Number(nextLocal.bedRooms) : undefined,
      bathrooms: nextLocal.bathRooms ? Number(nextLocal.bathRooms) : undefined,
      minPrice: nextLocal.priceMin ? Number(nextLocal.priceMin) : undefined,
      maxPrice: nextLocal.priceMax ? Number(nextLocal.priceMax) : undefined,
      propertyType: nextLocal.propertyType || prev.propertyType,
    }));

    if (nextLocal.propertyType) {
      const matched = sortOptions.find((opt) => opt.value === nextLocal.propertyType);
      if (matched && matched.value !== selectedSort.value) {
        setSelectedSort(matched);
      }
    }
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
      propertyType: selectedSort.value || undefined,
    }))
    setFilters((prev: any) => ({
      ...prev,
      bedrooms: +localFilters?.bedRooms || undefined,
      bathrooms: +localFilters?.bathRooms || undefined,
      minPrice: +localFilters?.priceMin || undefined,
      maxPrice: +localFilters?.priceMax || undefined,
      propertyType: selectedSort.value || undefined,
    }));
    if (selectedSubCategories.length > 0) {
      selectedSubCategories.forEach((subCat: any) => {
        const subcategory = subCategories.find((sub: any) => sub.title === subCat);
        if (subcategory && subcategory.value) {
          data.additional_criteria[subcategory.value] = true;
        }
      });
    }
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value?: string | number) => {
      if (value === undefined || value === null || value === '' || value === 'All') params.delete(key);
      else params.set(key, String(value));
    };
    if (searchQuery) params.set('q', searchQuery);
    setOrDelete('bedRooms', localFilters.bedRooms);
    setOrDelete('bathRooms', localFilters.bathRooms);
    setOrDelete('priceMin', localFilters.priceMin);
    setOrDelete('priceMax', localFilters.priceMax);
    setOrDelete('propertyType', selectedSort.value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);

    try {
      const response = await axios.post(
        PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
        {
          ...data,
          user: userId,
          query: searchQuery,
          // num_records: process.env.SEARCH_RECORDS || 10,
          listing_property_type: selectedSort.value || searchFilters.propertyType || undefined,
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
    setSelectedSort(sortOptions[0]);
    setFilters((prev: any) => ({
      ...prev,
      bedrooms: undefined,
      bathrooms: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      propertyType: undefined,
    }));
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
