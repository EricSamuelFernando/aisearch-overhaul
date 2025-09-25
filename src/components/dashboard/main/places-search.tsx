import React, { Fragment, useEffect, useState } from 'react';
import { AddressProperty } from '@/interfaces/address';
import RobustComboBox from '@/components/customs/combo-box';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { PropertyDetails } from '../../../types/property.types';
import { FilterType } from '../../../types/global.types';
import useFetchAddress from '../../../hooks/api/user/useFetchAddress';
import useGooglePlacesAutocomplete from '@/hooks/utils/useGooglePlaces';
import { fetchPlaceSuggestions } from '@/hooks/utils/googlePlacesFunction';

interface PlacesProps {
  setFilter: (payload: FilterType<PropertyDetails>) => void;
  setAddress?: any
}

const Places: React.FC<{
  setFilter: (payload: FilterType<PropertyDetails>) => void;
  setAddress?: any
}> = ({ setFilter, setAddress }) => {
  return <PlacesAutocomplete setFilter={setFilter} setAddress={setAddress} />;
};

const PlacesAutocomplete: React.FC<PlacesProps> = ({ setFilter, setAddress }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedVal = useDebounce(selectedOption, 400);
  console.log("selectedOption : ", suggestions);
  const { setFilter: setDropdownFilter, addressData } = useFetchAddress();

  const data = addressData.data?.data?.result;
  const isLoading = addressData.isLoading || addressData.isFetching;
  const handleSuggestionClick = (city:string) => {
    setSelectedOption(city);
    setAddress(city);
    setSuggestions([]);
  }
  const fetchOptions = () => {
    if (debouncedVal) {
      setDropdownFilter({
        field: 'search',
        value: debouncedVal,
      });
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [debouncedVal]);

  const handleSelection = async (item: AddressProperty) => {
    console.log({ item });
    setSelectedOption(item.propertyName);

    Object.entries(item).forEach(([field, value]) => {
      setFilter({
        field: field as keyof PropertyDetails,
        value,
      });
    });
  };

  return (
    <Fragment>
      <RobustComboBox
        optionsData={data!}
        isLoading={isLoading}
        fetchOptions={fetchOptions}
        value={selectedOption}
        suggestions={suggestions}
        handleClick={handleSuggestionClick}
        onChange={(e) => {
          setSelectedOption(e.currentTarget.value)
          setAddress(e.currentTarget.value)
          fetchPlaceSuggestions(e.currentTarget.value, setSuggestions);

          // placeholder='Enter Your Property Address'
        }}
        handleListSelection={handleSelection}
      />
      {/* {suggestions.length > 0 && (
        <div className="mt-2 left-0 absolute w-full border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto bg-white z-10 text-left">
          {suggestions.map((city, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
            >
              {city}
            </div>
          ))}
        </div>
      )} */}
    </Fragment>
  );
};

export default Places;