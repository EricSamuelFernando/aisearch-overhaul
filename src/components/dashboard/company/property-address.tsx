'use client';

import RobustComboBox from '@/components/customs/combo-box';
import CustomInput from '@/components/customs/input';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { AddressProperty } from '@/interfaces/address';
import { ImageInterface } from '@/interfaces/property.interface';
import { useEffect, useState } from 'react';
import CreateListConatiner from './create-list-container';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';
import useFetchAddress from '@/hooks/api/user/useFetchAddress';
import { PropertyQuery } from '@/hooks/api/agent/useAddAgentProperty';
import PlacesComponent from '../main/google-place-search';

const libs: any = ['places'];
const PropertyAddress = () => {
  const { filters, setFilter, setQuery } = useAgentCreatePropertyContext();
  const [selectedOption, setSelectedOption] = useState(
    filters?.formattedAddress,
  );
  const { setFilter: setDropdownFilter, addressData } = useFetchAddress();
  const debouncedInput = useDebounce(selectedOption, 300);
  const isLoading = addressData.isLoading || addressData.isFetching;
  const data = addressData.data?.data.result;

  const fetchOptions = () => {
    if (!Boolean(debouncedInput)) return;
    if (Boolean(debouncedInput) === true) {
      setDropdownFilter({
        field: 'search',
        value: debouncedInput!,
      });
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [debouncedInput]);

  const handleSelection = (item: AddressProperty) => {
    setSelectedOption(item.propertyAddressDetails.formattedAddress!);
    console.log(item);
    const fieldsToSet: {
      field: keyof PropertyQuery;
      value: string | number | Partial<ImageInterface>[];
    }[] = [
      {
        field: 'formattedAddress',
        value: item.propertyAddressDetails.formattedAddress!,
      },
      {
        field: 'postalCode',
        value: item?.propertyAddressDetails.postalCode!,
      },
      {
        field: 'city',
        value: item?.propertyAddressDetails.city!,
      },
      {
        field: 'propertyType',
        value: item?.propertyType!,
      },
      {
        field: 'price',
        value: +item?.price.amount!,
      },
      {
        field: 'propertyDescription',
        value: item?.propertyDescription!,
      },
      {
        field: 'images',
        value: item?.images!,
      },
      {
        field: 'year',
        value: item?.yearBuild!,
      },
      {
        field: 'longitude',
        value: item?.longitude!,
      },
      {
        field: 'latitude',
        value: item?.latitude!,
      },
      {
        field: 'propertyName',
        value: item?.propertyName!,
      },
    ];
    fieldsToSet.forEach(({ field, value }) => {
      setFilter({ field, value });
    });
  };

  return (
    <CreateListConatiner
      className='p-[4rem]'
      form={
        <aside className='flex h-[300px] flex-col justify-between'>
          <div>
            <div className='grid grid-cols-4 gap-6'>
              <div className='col-span-3'>
                <PlacesComponent />
                <RobustComboBox
                  showLoading={false}
                  value={selectedOption}
                  label='Street Address'
                  placeholder='Enter Address, MLS#'
                  onChange={(e) => setSelectedOption(e.currentTarget.value)}
                  optionsData={data!}
                  isLoading={isLoading}
                  fetchOptions={fetchOptions}
                  handleListSelection={handleSelection}
                  className='mt-2  w-full rounded-md border border-grey-210'
                />
              </div>
              <div className='mb-3'>
                <CustomInput
                  placeholder='Housing Unit'
                  label='Unit'
                  className='mt-[0.469rem] w-full'
                  value={filters?.unit}
                  onChange={(e) =>
                    setFilter({
                      field: 'unit',
                      value: e.currentTarget.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className='mt-6 grid grid-cols-4 gap-6'>
              <div className='col-span-2'>
                <CustomInput
                  placeholder='City'
                  label='City'
                  className='mt-[0.469rem] w-full'
                  value={filters?.city}
                  onChange={(e) =>
                    setFilter({
                      field: 'city',
                      value: e.currentTarget.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <CustomInput
                  placeholder='State'
                  label='State'
                  className='mt-[0.469rem] w-full'
                  value={filters?.state}
                  onChange={(e) =>
                    setFilter({
                      field: 'state',
                      value: e.currentTarget.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <CustomInput
                  placeholder='Zip'
                  label='Zip code'
                  className=' mt-[0.469rem] w-full'
                  value={filters?.postalCode}
                  onChange={(e) =>
                    setFilter({
                      field: 'postalCode',
                      value: e.currentTarget.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>
        </aside>
      }
      heading={'Where is this Property located?'}
      subHeading={'Address'}
    />
  );
};

export default PropertyAddress;
