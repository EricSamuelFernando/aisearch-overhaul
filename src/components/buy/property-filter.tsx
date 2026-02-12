'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { useRouter, useSearchParams } from 'next/navigation';

import { ViewSelection } from './buy-dropdowns';
import FilterDrawer from './browse/filter-drawer';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePropertyStore } from '@/store/use-property-store';
import AutoLoginrModal from '../modals/login-auto-modal';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Landmark } from 'lucide-react';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SchoolIcon from '@mui/icons-material/School';
import PoolIcon from '@mui/icons-material/Pool';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VillaIcon from '@mui/icons-material/Villa';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import { Group, Menu, MenuDropdown, MenuItem, MenuTarget, MultiSelect, Select, UnstyledButton } from '@mantine/core';
import Dropdown from '../ui/custom-select-dropdown';
import axios from 'axios';
import { PROPERTY_SEARCH_AI_URL } from '@/shared/constants/env';
import { incrementSearchCount } from '@/slices/onboarding/property-preference';
import { setPropertyQuery, setSearchFilters } from '@/slices/property/property-slice';
import { useDispatch, useSelector } from 'react-redux';
import { Waves, TreePine, Droplets, Building2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { filterAtom } from '@/hooks/atoms';
import { Listbox } from '@headlessui/react';
import { RootState } from '@/lib/store';
import { useProperty } from '@/shared/hooks/useProperty';
import { cn } from '@/lib/utils';


// Dummy property data for testing
const dummyProperties = [
  {
    id: 1,
    title: "Luxury Mountain View Condo",
    price: 850000,
    location: "Beverly Hills, CA",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    property_type: "Condo",
    features: ["has_pool", "is_mountain_view"],
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Waterfront Family Home",
    price: 1200000,
    location: "Malibu, CA",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2500,
    property_type: "Single-Family",
    features: ["is_water_front", "has_pool"],
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Modern City View Apartment",
    price: 650000,
    location: "Downtown LA, CA",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    property_type: "Condo",
    features: ["is_city_view"],
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Park View Duplex",
    price: 950000,
    location: "Santa Monica, CA",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2000,
    property_type: "Duplex",
    features: ["is_park_view"],
    image_url: "https://images.unsplash.com/photo-1564013434775-f71db003097b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    title: "Luxury Villa with Pool",
    price: 2500000,
    location: "Beverly Hills, CA",
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3500,
    property_type: "Single-Family",
    features: ["has_pool", "is_mountain_view"],
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

function PropertyFilter() {
  const { isLoggedIn } = useAuth();
  const { currentView } = useProperty();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchTerm = searchParams.get('q');
  const searchFilters = useSelector((state: RootState) => state.property.filters);
  const dispatch = useDispatch();
  const [sortOption, setSortOption] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const { allProperties, addProperties, setSearchedQuery, clearProperties, isLoading, setIsLoading } = usePropertyStore();

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

  const propertyTypes = [
    { name: 'Select Type', value: '' },
    { name: 'Residential', value: 'Residential' },
    { name: 'Commercial', value: 'Commercial' },
  ];

  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [selectedPropertyType, setSelectedPropertyType] = useState(propertyTypes[0]);

  useEffect(() => {
    if (selectedSort.value || selectedPropertyType.value)
      sendSearchRequest()
  }, [selectedSort, selectedPropertyType]);
  const categories = [
    { title: 'Condo', icon: <SchoolIcon /> },
    { title: 'Duplex', icon: <PoolIcon /> },
    { title: 'Fourplux', icon: <HomeWorkIcon /> },
    { title: 'Garage/Parking Space', icon: <VillaIcon /> },
    { title: 'Multi-Family', icon: <HouseSidingIcon /> },
    { title: 'Single-Family', icon: <HouseSidingIcon /> },
    { title: 'Triplex', icon: <HouseSidingIcon /> },
  ];

  const subCategories = [
    {
      title: 'Pool',
      value: 'has_pool',
      icon: <Waves />
    },
    {
      title: 'Park View',
      value: 'is_park_view',
      icon: <TreePine />
    },
    {
      title: 'Water View',
      value: 'is_water_view',
      icon: <Droplets />
    },
    {
      title: 'City View',
      value: 'is_city_view',
      icon: <Building2 />
    },
    {
      title: 'Waterfront',
      value: 'is_water_front',
      icon: <Landmark />
    },
  ];


  useEffect(() => {
    if (!isLoggedIn && allProperties.length > 0) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isLoggedIn, allProperties.length]);


  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const buildQueryDescription = () => {
    if (!selectedCategories.length) return '';

    // Use the search term as location if available, otherwise use a default value
    const locationText = searchTerm || 'the selected location';
    const base = `I'm looking for a property in ${locationText} having of property sub-type ${selectedCategories.join(', ')}.`;

    if (selectedSubCategories.length > 0) {
      return `${base} Having ${selectedSubCategories.join(', ')}.`;
    }
    return base;
  };

  const sendSearchRequest = async () => {
    try {
      setSearchedQuery("");
      addProperties([]);
      setIsLoading(true);
      const requestBody: any = {
        query: searchTerm,
        // num_records: process.env.SEARCH_RECORDS || 12,
        property_sub_type: selectedCategories?.[0],
        additional_criteria: {},
        bedrooms: +(searchFilters?.bedRooms ?? '') || undefined,
        bathrooms: +(searchFilters?.bathRooms ??'') || undefined,
        listing_price_max: +(searchFilters?.maxPrice ?? "") || undefined,
        listing_price_min: +(searchFilters?.minPrice ?? "") || undefined,
        listing_property_type: selectedSort.value,
        public_land_use: selectedPropertyType.value
      };

      if (selectedSubCategories.length > 0) {
        selectedSubCategories.forEach(subCat => {
          const subcategory = subCategories.find(sub => sub.title === subCat);
          if (subcategory && subcategory.value) {
            requestBody.additional_criteria[subcategory.value] = true;
          }
        });
      }

      const response = await axios.post(
        PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
        requestBody
      );

      clearProperties();
      dispatch(setSearchFilters({
        ...searchFilters,
        propertyType: selectedPropertyType?.value || '',
        subType: selectedSort?.value || ''
      }))
      dispatch(incrementSearchCount());
      dispatch(setPropertyQuery(response.data.search_query));
      setSearchedQuery(response.data.records || response?.data?.result?.records);
      addProperties(response.data.records || response?.data?.result?.records);

    } catch (err: any) {
      console.error("Search request failed:", err);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    sendSearchRequest();
  }, [selectedCategories, selectedSubCategories]);


  const items = categories.map(({ title, icon }) => (
    <Menu.Item
      onClick={() => toggleCategory(title)}
      key={nanoid()}
    >
      <span className="bg-gray-100 p-1 rounded-full">{icon}</span>
      {title}
    </Menu.Item>
  ));
  const [opened, setOpened] = useState(false);

  const toggleCategory = (category: string | null) => {
    if (category === null) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([category]);
    }
  };

  const toggleSubCategory = (subcategory: string | null) => {
    if (subcategory === null) {
      setSelectedSubCategories([]);
      return;
    }

    setSelectedSubCategories(prev => {
      // If already selected, remove it
      if (prev.includes(subcategory)) {
        return prev.filter(item => item !== subcategory);
      }
      // Otherwise add it to the array
      return [...prev, subcategory];
    });
  };

  return (
    <section
      className={cn(
        'w-full px-4 pb-4 md:px-8',
        currentView === 'grid' ? 'max-w-[1440px] mx-auto' : '',
        currentView === 'map' ? 'md:w-1/2 md:mr-auto md:pl-[3.12rem] md:pr-0' : '',
      )}
    >
      <AutoLoginrModal
        currentStage={0}
        isOpen={showModal}
        onOpenChange={setShowModal}
      />
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
        {/* Left Side: Title & Filter Drawer */}
        <div className="flex min-w-0 select-none flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <h2 className="min-w-0 text-lg font-bold leading-6 text-black md:text-xl">
            {allProperties.length > 0
              ? 'Showing homes matched from our AI'
              : 'Explore homes only within the California region'}
          </h2>
          <FilterDrawer
            FeatureSelectorComponent={FeatureSelector}
            FeatureBathroomSelector={FeatureBathroomSelector}
            selectedSubCategories={selectedSubCategories}
            subCategories={subCategories}
          />
          <div className="flex shrink-0 items-start gap-4 whitespace-nowrap">
            <ViewSelection />
          </div>
        </div>
      </div>
      <p className="text-lg font-medium leading-9 text-grey-370">
        You have searched: {searchTerm}
      </p>
      {
        allProperties?.length ? <p className="text-lg select-none font-medium leading-9 text-grey-370">
          {allProperties.length} Results Found
        </p> : <p className="text-lg select-none font-medium leading-9 text-grey-370">
          Snaphomz AI in action
        </p>
      }

      {selectedSubCategories.length > 0 && (
        <p className="text-lg font-medium leading-9 text-grey-370">
          Features selected: {selectedSubCategories.join(', ')}
        </p>
      )}

      {/* Render Filters and Property Results */}
      {/* Dropdown Filters */}
      <br />
      {/* <div className="flex flex-wrap gap-4 mt-4">
      
        <Listbox value={selectedSort} onChange={setSelectedSort}>
          <div className="relative w-44">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white border border-ocOrange py-2 pl-4 pr-10 text-left text-sm font-medium text-gray-700 shadow-sm hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300">
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

      
        <Listbox value={selectedPropertyType} onChange={setSelectedPropertyType}>
          <div className="relative w-44">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white border border-ocOrange py-2 pl-4 pr-10 text-left text-sm font-medium text-gray-700 shadow-sm hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300">
              {searchFilters?.subType || selectedPropertyType.name}
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-ocOrange" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 w-full rounded-xl bg-white shadow-lg z-10 ring-1 ring-black ring-opacity-5 focus:outline-none">
              {propertyTypes.map((option) => (
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
      </div> */}

      <div className="space-y-4">
        {/* Always show filters */}
        <div className="flex flex-wrap gap-2">
          {subCategories.map((sub) => {
            const isSelected = selectedSubCategories.includes(sub.title);
            return (
              <button
                key={nanoid()}
                onClick={() => toggleSubCategory(sub.title)}
                className={`flex items-center gap-1 px-4 py-2 text-sm rounded-full border transition-all duration-300
              ${isSelected
                    ? 'bg-ocOrange text-white border-ocOrange shadow-md transform hover:scale-105'
                    : 'bg-white text-gray-700 hover:text-ocOrange hover:border-ocOrange hover:shadow-sm border-gray-300'
                  }`}
              >
                <span className={`transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  {sub.icon}
                </span>
                <span className="font-medium">{sub.title}</span>
                {isSelected && (
                  <svg className="w-3 h-3 ml-1 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Results or Suggested Locations */}
      {allProperties.length > 0 ? (
        <div className="space-y-4">
          {/* Show Property Listings */}
          {/* Add your property listings UI here */}
        </div>
      ) : !isLoading ? (
        <div className="md:grid-2 grid grid-cols-1 gap-5 py-5 lg:grid-cols-3">
          {/* Show alternative suggestions */}
          {queryDataList.map(({ title, keyword }) => {
            const currentParams = new URLSearchParams(searchParams.toString());
            currentParams.set('q', keyword);
            return (
              <Link
                key={title}
                className='text-sm font-medium leading-6 text-ocOrange'
                href={`?${currentParams.toString()}`}
                rel='noreferrer'
              >
                {title}
              </Link>
            );
          })}
        </div>

      ) : ""}
    </section>

  );
}

const queryDataList = [
  { title: 'Central Valley', keyword: 'Central Valley 93291' },
  { title: 'Los Angeles', keyword: 'Los Angeles 90001' },
  { title: 'Mountain Region', keyword: 'Mountain Region 93546' },
  { title: 'Central Coast', keyword: 'Central Coast 93401' },
  { title: 'San Diego', keyword: 'San Diego 92101' },
  { title: 'Sacramento', keyword: 'Sacramento 95814' },
  { title: 'Deserts', keyword: 'Deserts 92262' },
  { title: 'Sierra Nevada', keyword: 'Sierra Nevada 96150' },
  { title: 'Central Region', keyword: 'Central Region 95340' },
  { title: 'San Francisco Bay Area', keyword: 'San Francisco Bay Area 94103' },
  {
    title: 'Sacramento-San Joaquin Delta',
    keyword: 'Sacramento-San Joaquin Delta 95691',
  },
  { title: 'Coastal', keyword: 'Coastal 93420' },
  { title: 'Inland Empire', keyword: 'Inland Empire 92374' },
  { title: 'Shasta Cascade', keyword: 'Shasta Cascade 96001' },
  { title: 'Southern Region', keyword: 'Southern Region 90011' },
  { title: 'Northern California', keyword: 'Northern California 96002' },
  { title: 'South Coast', keyword: 'South Coast 93001' },
  { title: 'Sierra Foothills', keyword: 'Sierra Foothills 95667' },
  { title: 'North Coast', keyword: 'North Coast 95501' },
  { title: 'Southern California', keyword: 'Southern California 90210' },
  { title: 'Gold Country', keyword: 'Gold Country 95945' },
];

export interface FeatureOption {
  title: string;
  value: number | string;
}

const FeatureSelector: React.FC<{
  bedOptions: FeatureOption[];
  onSelect: (selectedBed: number | string) => void;
}> = ({ bedOptions, onSelect }) => {
  const [filters, setFilters] = useAtom(filterAtom);
  const handleBedSelect = (bedValue: number | string) => {
    if (filters.bedrooms === bedValue) {
      setFilters((prev: any) => ({
        ...prev,
        bedrooms: null
      }));
    } else {
      setFilters((prev: any) => ({
        ...prev,
        bedrooms: bedValue
      }));
      // setSelectedBed(bedValue);
      onSelect(bedValue);
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {bedOptions.map((bedOption) => (
        <button
          key={nanoid()}
          onClick={() => handleBedSelect(bedOption.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${filters.bedrooms === bedOption.value
            ? 'bg-ocOrange text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {bedOption.title}
        </button>
      ))}
    </div>
  );
};

const FeatureBathroomSelector: React.FC<{
  bedOptions: FeatureOption[];
  onSelect: (selectedBed: number | string) => void;
}> = ({ bedOptions, onSelect }) => {
  const [filters, setFilters] = useAtom(filterAtom);
  const handleBedSelect = (bedValue: number | string) => {
    if (filters.bathrooms === bedValue) {
      setFilters((prev: any) => ({
        ...prev,
        bathrooms: null
      }));
    } else {
      setFilters((prev: any) => ({
        ...prev,
        bathrooms: bedValue
      }));
      // setSelectedBed(bedValue);
      onSelect(bedValue);
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {bedOptions.map((bedOption) => (
        <button
          key={nanoid()}
          onClick={() => handleBedSelect(bedOption.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${filters.bathrooms === bedOption.value
            ? 'bg-ocOrange text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {bedOption.title}
        </button>
      ))}
    </div>
  );
};

export { PropertyFilter };
