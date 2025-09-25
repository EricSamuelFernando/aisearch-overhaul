import React from 'react';

const SchoolsNearby: React.FC = () => (
  <section>
    <h2 className='my-6 text-xl font-bold text-black'>Schools nearby</h2>
    <section className='boder-solid grid grid-cols-6 border-b-[0.015rem] border-[#707070] pb-4'>
      <h3 className='col-span-2 text-sm font-bold text-black'>School name</h3>
      <h3 className='text-sm font-bold text-black'>Type</h3>
      <h3 className='text-sm font-bold text-black'>Grades</h3>
      <h3 className='text-sm font-bold text-black'>Distance</h3>
      <h3 className='text-sm font-bold text-black'>Ratings</h3>
    </section>
    <section className='boder-solid grid grid-cols-6 border-b-[0.015rem] border-[#707070] py-5'>
      <h3 className='col-span-2 text-sm font-bold text-grey-750'>
        Hidden Valley Elementary
      </h3>
      <h3 className='text-sm font-bold text-grey-750'>Public</h3>
      <h3 className='text-sm font-bold text-grey-750'>KG - 5</h3>
      <h3 className='text-sm font-bold text-grey-750'>1.7 mi</h3>
      <h3 className='text-sm font-bold text-grey-750'>8/10</h3>
    </section>
    <section className='boder-solid grid grid-cols-6 border-b-[0.015rem] border-[#707070] py-5'>
      <h3 className='col-span-2 text-sm font-bold text-grey-750'>
        White Hill Middle School
      </h3>
      <h3 className='text-sm font-bold text-grey-750'>Public</h3>
      <h3 className='text-sm font-bold text-grey-750'>KG - 5</h3>
      <h3 className='text-sm font-bold text-grey-750'>1.7 mi</h3>
      <h3 className='text-sm font-bold text-grey-750'>8/10</h3>
    </section>
    <section className='boder-solid grid grid-cols-6 border-b-[0.015rem] border-[#707070] py-5'>
      <h3 className='col-span-2 text-sm font-bold text-grey-750'>
        Richie Williams High School
      </h3>
      <h3 className='text-sm font-bold text-grey-750'>Public</h3>
      <h3 className='text-sm font-bold text-grey-750'>KG - 5</h3>
      <h3 className='text-sm font-bold text-grey-750'>1.7 mi</h3>
      <h3 className='text-sm font-bold text-grey-750'>8/10</h3>
    </section>
  </section>
);

export { SchoolsNearby };
