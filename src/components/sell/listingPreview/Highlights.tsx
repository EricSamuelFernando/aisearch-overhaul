import Image from 'next/image';
import React from 'react';

const Highlights = () => {
  return (
    <section className='w-full rounded-xl bg-grey-390 p-4 px-8'>
      <h2 className='mb-6 text-xl font-medium'>Highlights</h2>
      <section className=''>
        {[
          {
            id: 1,
            name: 'Westlake Middle School',
            icon: '/assets/icons/school.svg',
          },
          {
            id: 2,
            name: 'Wood flooring',
            icon: '/assets/icons/floor.svg',
          },
          {
            id: 3,
            name: 'Newly Remodelled',
            icon: '/assets/icons/hammer.svg',
          },
          {
            id: 4,
            name: 'No HOA',
            icon: '/assets/icons/house.svg',
          },
        ].map(({ name, icon, id }) => (
          <div className='mb-4 flex items-center' key={id}>
            <Image
              src={icon}
              alt={name}
              objectFit='contain'
              height={21}
              width={21}
            />
            <h3 className='ml-6 text-base'>{name}</h3>
          </div>
        ))}
      </section>
      <div className='my-4 h-[0.05rem] bg-grey-850'></div>
      <button className='flex w-full items-center justify-center rounded-sm border border-solid border-grey-850 bg-black px-8 py-4 text-white'>
        Start the process
      </button>
      <button className='mt-2 flex w-full items-center justify-center border-none bg-transparent px-8 py-4 text-black'>
        Take a tour
      </button>
    </section>
  );
};

export { Highlights };
