'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CustomNativeSelect from '../../customs/select';

function PurchaseMeans() {
  const [searchValue, setSearchValue] = useState('');

  const list = [
    {
      label: 'Cash',
      value: 'Cash',
    },
    {
      label: 'Non Contingent',
      value: 'Non Contingent',
    },
    {
      label: 'Loan',
      value: 'Loan',
    },
    {
      label: 'FHA-VA Loan',
      value: 'FHA-VA Loan',
    },
  ];
  return (
    <section className='mx-auto my-10 px-[3.219rem]'>
      <div className='grid place-content-center'>
        <h2 className='py-10 text-3xl font-bold'>
          What is your means of purchase?
        </h2>

        <div className='flex items-center justify-between gap-2'>
          <CustomNativeSelect
            className='h-12 w-full'
            label=''
            placeholder='Pick value'
            data={list}
            defaultValue='Loan'
            handleChange={setSearchValue}
          />

          {/* <CustomButton
            label="Save"
            className="bg-black text-white rounded-full px-16 w-max"
          /> */}

          <Button roundness='full' className='px-16'>
            Save{' '}
          </Button>
        </div>
      </div>
    </section>
  );
}

export { PurchaseMeans };
