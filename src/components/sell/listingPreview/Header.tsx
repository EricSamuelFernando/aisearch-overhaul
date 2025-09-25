import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

const Header: React.FC = () => (
  <section className='pt-16'>
    <Link href='/' className='flex items-center'>
      <Image
        src='/assets/icons/backArrow.svg'
        alt='go back'
        objectFit='contain'
        height={13}
        width={13}
      />
      <p className='ml-3 text-lg font-medium text-black'>Back</p>
    </Link>
  </section>
);

export { Header };
