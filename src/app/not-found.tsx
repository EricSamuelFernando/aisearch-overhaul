import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import SnapHomz from '@public/assets/images/snaphomz-logo.svg';

export const metadata: Metadata = {
  title: 'Snaphomz',
  description: 'Home | Snap Homz',
};

export default function NotFoundPage() {
  return (
    <div className='flex h-screen w-full flex-col bg-primary-100 px-4 md:px-8'>
      <div className='py-2.5'>
        <Link href='/'>
          <Image src={SnapHomz} alt='logo' className='h-[3.75rem] w-44' />
        </Link>
      </div>

      <div className='flex h-full w-full flex-col items-center justify-center'>
        <div className='mb-20'>
          <h2 className='text-center text-xl font-medium leading-7 text-black'>
            Page probably got lost and we&apos;re trying to ship in new one
          </h2>
        </div>
        <div className='flex items-center justify-center space-x-5'>
          <h3 className='text-[10rem] font-bold leading-10 text-ocOrange'>4</h3>
          <Image src={SnapHomz} alt='logo' height={50} width={150} />
          <h3 className='text-[10rem] font-bold leading-10 text-ocOrange'>4</h3>
        </div>
        <div className='mt-20'>
          <Link
            className='flex-grow text-center text-lg font-bold text-black'
            href='/'
          >
            Go to HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
