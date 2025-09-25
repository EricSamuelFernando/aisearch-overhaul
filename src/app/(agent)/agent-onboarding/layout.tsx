import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';

export const metadata: Metadata = {
  title: 'Agent signup',
  description: 'Agent Signup | Snap Homz',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='h-screen w-screen overflow-hidden bg-[#FAF9F5] pt-6'>
      <section className='px-6 md:px-12'>
        <Link href={'/'}>
          <Image src={SnapHomz} alt='logo' className='h-[3.75rem] w-44' />
        </Link>
      </section>
      <section className='grid h-full justify-between md:grid-cols-2'>
        <section className='hidden h-full items-center md:flex'>
          <div className='relative h-full w-[580px] overflow-hidden'>
            <Image
              src='/assets/images/v2/onboarding-hero.png'
              alt='Snap Homz home'
              objectFit='contain'
              fill
            />
          </div>
        </section>
        <div className='w-[80%]'>{children}</div>
      </section>
    </section>
  );
}
