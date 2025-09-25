import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type PropertyAgentCard = {};

const PropertyAgentCard = ({}: PropertyAgentCard) => {
  return (
    <section className='mt-4 flex items-center justify-between rounded-xl  bg-primary-main p-4'>
      <section className='flex items-center '>
        <div className='mr-4 h-12  w-12 overflow-hidden rounded-full' />
        <section>
          <h3 className='text-base font-bold text-black'>Daniel Smith</h3>
          <p className='text-sm font-medium text-white'>Listing Agent</p>
        </section>
      </section>
      <Link href='/' className='mr-6 flex items-center'>
        <Image
          src='/assets/icons/messageEnvelope.svg'
          alt='send message'
          objectFit='contain'
          height={16}
          width={28}
        />
      </Link>
    </section>
  );
};

export { PropertyAgentCard };
