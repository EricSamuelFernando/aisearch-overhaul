import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MainNavPages from '../navbars/main-nav-pages';

export default function HeroLayout({ className = '' }) {
  return (
    <>
    <MainNavPages />
        <div className="bg-[#000000] text-white h-screen relative pt-24 -mt-24 overflow-hidden " >
      <div className='relative min-h-[100vh] w-full overflow-hidden'>
        <Image
          src='/assets/images/company-hero.jpg'
          alt='Agents Hero'
          layout='fill'
          objectFit='cover'
          className='z-0'
        />
      </div>
    </div>
    </>

  );
}
