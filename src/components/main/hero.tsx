'use client';

import { HeroLayout } from '@/components/hero-layout';
import HeroTab from './hero-tab';

type Props = {};

function Hero({}: Props) {
  return (
    <HeroLayout>
      <div className='grid-cols-2  md:grid md:min-h-[75vh]'>
        <div className="col-span-1 grid place-content-center  rounded-xl bg-ocOrange/90 bg-[url('../../public/assets/images/leaf-icon.svg')] bg-cover bg-left-bottom px-6 py-8 backdrop-brightness-75  md:rounded-none md:rounded-l-2xl md:px-12">
          <div className='my-14 text-white'>
            <h1 className='py-3 text-4xl font-bold leading-[1.2] md:text-5xl'>
              Transactions with One-Click Ease & Transparency
            </h1>
            <h3 className='text-base'>
              {`Experience buying and selling with a guided platform.
              Transaparency is our Mantra. Let's start now`}
            </h3>
          </div>

          <HeroTab />
        </div>
        <div className="col-span-1  rounded-r-2xl bg-[url('../../public/assets/images/v2/landing-hero.png')] bg-cover bg-center bg-no-repeat" />
      </div>

      <ScrollDown />
    </HeroLayout>
  );
}

export default Hero;

export const ScrollDown = () => {
  const handleScrollDown = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className='flex items-center justify-center'>
      <button
        className='my-4 hidden cursor-pointer text-center md:block'
        onClick={handleScrollDown}
      >
        <span>Scroll down</span>
      </button>
    </div>
  );
};
