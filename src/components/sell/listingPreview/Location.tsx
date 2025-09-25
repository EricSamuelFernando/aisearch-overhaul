import Image from 'next/image';
import CustomMap from '@/components/custom-map';
import React from 'react';
const Location: React.FC = () => (
  <section>
    <h2 className='mb-6 text-xl font-bold text-black'>Location</h2>
    <section className='mb-6 flex items-center gap-4'>
      <p className='text-xs font-medium text-black'>California</p>
      <Image
        src='/assets/icons/trail.svg'
        alt='go back'
        objectFit='contain'
        height={8}
        width={4}
      />
      <p className='text-xs font-medium text-black'>Mountain View</p>
      <Image
        src='/assets/icons/trail.svg'
        alt='go back'
        objectFit='contain'
        height={8}
        width={4}
      />
      <p className='text-xs font-medium text-black'>94043</p>
      <Image
        src='/assets/icons/trail.svg'
        alt='go back'
        objectFit='contain'
        height={8}
        width={4}
      />
      <p className='text-xs font-medium text-black'>Sterling Estates</p>
    </section>
    <section className='mb-12 w-full overflow-hidden'>
      <CustomMap
        coord={[{ lat: -3.745, lng: -38.523 }]}
        height='278px'
        width='100%'
      />
    </section>
  </section>
);

export { Location };
