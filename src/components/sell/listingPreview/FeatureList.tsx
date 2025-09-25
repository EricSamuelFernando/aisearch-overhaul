import Image from 'next/image';
import React from 'react';
const features = [
  { id: 1, name: 'Residential', icon: '/assets/icons/bed.svg' },
  { id: 2, name: 'Built in 2005', icon: '/assets/icons/calender.svg' },
  { id: 3, name: '$471 Price/sqft', icon: '/assets/icons/size.svg' },
];

const FeatureList: React.FC = () => (
  <section className='mt-8 grid grid-cols-3 gap-4'>
    {features.map(({ name, icon, id }) => (
      <div
        className='flex w-full items-center rounded-sm bg-grey-390 py-4 pl-4'
        key={id}
      >
        <Image
          src={icon}
          alt={name}
          objectFit='contain'
          height={35}
          width={20}
        />
        <h3 className='ml-6 text-base'>{name}</h3>
      </div>
    ))}
  </section>
);

export { FeatureList };
