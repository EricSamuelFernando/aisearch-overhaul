import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
import StartProcessProgress from '@/components/start-process/start-process-progress';

export const metadata: Metadata = {
  title: 'Snaphomz | Property Purchase Process',
  description: 'Snaphomz Property',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex w-full flex-col overflow-hidden bg-primary-100 pb-3'>
      <header className='fixed top-0 z-20 w-full bg-primary-100 px-6 py-3 pb-3 md:px-12'>
        <Link href='/dashboard' className='w-max bg-red-500'>
          <Image src={SnapHomz} alt='logo' className='h-[3.75rem] w-44' />
        </Link>
      </header>
 
      <StartProcessProgress />

      <main className='h-full w-full'>
        <section className='h-full w-full px-6 md:px-12'>{children}</section>
      </main>
    </div>
  );
}
