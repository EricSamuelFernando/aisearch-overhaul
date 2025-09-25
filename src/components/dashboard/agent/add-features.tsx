'use client';
import CustomInput from '@/components/customs/input';
import CustomNativeSelect from '@/components/customs/select';
import CustomTextArea from '@/components/customs/textarea';
import CreateListConatiner from './create-list-container';
import { PROPERTY_TYPE } from '@/constants';
import { removeNonNumericCharacters } from '@/lib/helpers';
import CurrencyInput from 'react-currency-input-field';
import ReactDatePicker from 'react-datepicker';
import { useState } from 'react';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';

const AddFeatures = () => {
  const { filters, setFilter } = useAgentCreatePropertyContext();
  const [value, setValue] = useState<Date | null>(null);

  return (
    <CreateListConatiner
      className='p-[4rem]'
      form={
        <aside className='flex h-[300px] flex-col justify-between'>
          <div>
            <div className='grid grid-cols-5 gap-4'>
              <div className='col-span-3'>
                <CustomNativeSelect
                  className='mt-[0.469rem]'
                  size='lg'
                  data={PROPERTY_TYPE}
                  value={filters.propertyType}
                  label='Property type'
                  leftSectionPointerEvents='none'
                  handleChange={(val: string) => {
                    setFilter({ field: 'propertyType', value: val });
                  }}
                />
              </div>
              <div className=''>
                {/* <CustomInput
                  placeholder="Year Built"
                  value={filters.year}
                  label="Year Built"
                  className=" w-full mt-[0.469rem]"
                  onChange={(e) => {
                    setFilter({ field: 'year', value: e.currentTarget.value });
                  }}
                /> */}
                <label htmlFor='date'>Year Built</label>
                <ReactDatePicker
                  dateFormat='yyyy'
                  id='date'
                  showYearPicker
                  selected={value}
                  className='mt-1 w-full flex-auto rounded-lg border border-grey-210 px-2 py-3'
                  onChange={(val) => {
                    setValue(val);
                    setFilter({
                      field: 'year',
                      value: val?.getFullYear()!,
                    });
                  }}
                />
              </div>
              <div className=''>
                <label className='mb-2 block'>Asking Price</label>
                <CurrencyInput
                  id='input-example'
                  name='price'
                  placeholder='Amount'
                  defaultValue={filters?.price}
                  decimalsLimit={2}
                  value={filters?.price}
                  prefix='$'
                  onValueChange={(value) => {
                    setFilter({
                      field: 'price',
                      value: +value!,
                    });
                  }}
                  className='h-[47px] w-full rounded-md border-[1px] border-grey-210 px-4 py-5 focus:ring-[.6px] focus:ring-black'
                />
              </div>
            </div>
            <div className='my-8 grid grid-cols-10 gap-4'>
              <div className='col-span-6 flex items-center justify-between gap-4'>
                <CustomInput
                  className='mt-[0.469rem]'
                  label='Bedrooms'
                  leftSectionPointerEvents='none'
                  value={filters?.bedroom}
                  onChange={(e) => {
                    setFilter({
                      field: 'bedroom',
                      value: +removeNonNumericCharacters(e.currentTarget.value),
                    });
                  }}
                />
                <CustomInput
                  className='mt-[0.469rem]'
                  label='Bathrooms'
                  leftSectionPointerEvents='none'
                  value={filters?.bathroom}
                  onChange={(e) => {
                    setFilter({
                      field: 'bathroom',
                      value: +removeNonNumericCharacters(e.currentTarget.value),
                    });
                  }}
                />
              </div>
              <div className='col-span-4 flex w-full flex-1 items-center justify-center gap-4'>
                <CustomInput
                  className='mt-[0.469rem]'
                  label='Footage Size'
                  placeholder='Lot Size'
                  leftSectionPointerEvents='none'
                  value={filters.lotSize}
                  onChange={(e) => {
                    setFilter({
                      field: 'lotSize',
                      value: +removeNonNumericCharacters(e.currentTarget.value),
                    });
                  }}
                />
                <CustomNativeSelect
                  label={<span className='block pb-[30px]' />}
                  className='border-grey-210'
                  size='lg'
                  data={[
                    { label: 'Acres', value: 'Acres' },
                    { label: 'Sqft', value: 'Sqft' },
                  ]}
                  handleChange={(val: string) => {
                    setFilter({
                      field: 'sqrFt',
                      value: val,
                    });
                  }}
                  value={filters?.sqrFt}
                  placeholder='Sq. Ft'
                  withAsterisk
                />
              </div>
            </div>
            <div className='mb-4'>
              <CustomTextArea
                handleTextChange={(val: string) => {
                  setFilter({
                    field: 'propertyDescription',
                    value: val,
                  });
                }}
                value={filters?.propertyDescription}
                label='Description'
                defaultValue={filters?.propertyDescription}
                rows={5}
              />
            </div>
          </div>
        </aside>
      }
      heading={'What are the Features?'}
      subHeading={'Details'}
    />
  );
};

export default AddFeatures;
