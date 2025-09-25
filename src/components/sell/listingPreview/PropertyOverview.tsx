import React from 'react';

const PropertyOverview: React.FC = () => (
  <section className='grid grid-cols-2'>
    <section>
      <section className='flex items-center'>
        <h1 className='text-3xl font-bold text-[#030303]'>$110 000</h1>
        <section className='ml-6 flex items-center justify-center rounded-full bg-[#E9FFCC] px-8 py-1'>
          <p className='text-center text-xs font-bold text-[#2CB049]'>Active</p>
        </section>
      </section>
      <p className='w4/5 mt-3 text-lg font-bold text-black'>
        Attractive Ranch Style Home
      </p>
      <p className='w4/5 text-base text-black'>Mountain View, CA 94043</p>
      <p className='w4/5 mt-5 text-lg text-[#030303]'>
        Estimated payment: $6,607/month
      </p>
    </section>
    <section className='flex h-1/2 justify-between gap-4 border-y border-solid py-4'>
      <section className='flex w-1/3 flex-col items-center'>
        <h3 className='text-xl font-medium text-[#030303]'>4</h3>
        <p className='text-xs text-grey-370'>Bedrooms</p>
      </section>
      <section className='flex flex-col items-center border-x border-solid border-[#EAEAEA] px-8'>
        <h3 className='text-xl font-medium text-[#030303]'>3</h3>
        <p className='text-xs text-grey-370'>Bathrooms</p>
      </section>
      <section className='flex w-1/3 flex-col items-center'>
        <h3 className='text-xl font-medium text-[#030303]'>1,345</h3>
        <p className='text-xs text-grey-370'>Sqft</p>
      </section>
    </section>
  </section>
);

export { PropertyOverview };
