import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SnaphomzLogo from '@public/assets/images/snaphomz-logo.svg';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Onboarding Email Verification | Snaphomz',
  description: 'Snap Homz | User onboarding Verification',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='h-screen w-screen overflow-hidden bg-primary-100 px-6 pt-4 md:px-12'>
      <div className='flex justify-between w-full'>
      <Link href='/'>
        <Image src={SnaphomzLogo} alt='logo' className='h-[3.75rem] w-44' />
      </Link>
      {/* <Link rel='no-refferer no-openner' href='/complete-onboarding'>
        <Button
          roundness='full'
          variant='ghost'
          className='px-8 py-2 text-ocOrange'
        >
          Skip
        </Button>
      </Link> */}
      </div>
      <section className='grid h-full items-center justify-between md:grid-cols-2'>
        <div className='col-span-1'>{children}</div>
        <section className='hidden h-full items-center justify-center pr-20 pt-6 lg:flex'>
          <div className='relative h-full w-[65%] overflow-hidden rounded-b-xl rounded-t-full'>
            <Image
              src='/assets/images/v2/dome.png'
              alt='Snap Homz home'
              objectFit='contain'
              fill
            />
          </div>
        </section>
      </section>
    </section>
  );
}
