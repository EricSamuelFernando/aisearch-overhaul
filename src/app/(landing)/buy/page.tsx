import { Metadata } from 'next';
import Image from 'next/image';

import { Hero } from '@/components/landing-heros';
import Insight from '../../../components/buy/insight';
import { HeroSearchForm } from '@/components/main/hero-tab';
import { ChooseYourMeans } from '@/components/buy/choose-your-means';
import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
import MainTestimonial from '@/components/main-testimonial';
import { OfferStrengthAnalyzer } from '@/components/buy/offer-strength-analyzer';

export const metadata: Metadata = {
  title: 'Snaphomz | Buy',
  description: 'As a buyer searching for your choice home, search Snap Homz',
};

export default function Buy() {
  return (
    <>
      <Hero
        //title={`Take Control of Your \n Real Estate Journey`}
        title={`The First End-to-End Guided \n  Real Estate Platform`}
        className='bg-black pt-0 md:pt-0'
        form={
          <div className='flex flex-col space-y-6'>
            <HeroSearchForm />
            <div className='flex space-x-1 text-sm text-white'>
              <p className='font-medium'>Powered with AI technology</p>
              <p className='font-bold underline'>How it works</p>
            </div>
          </div>
        }
      >
        <Image
          className='h-full w-full'
          src='/assets/images/OC-Real-Animation-final.gif'
          sizes='(max-width: 768px 70vh, (max-width: 992px )100vh'
          alt='Snap Homz | Buyer Anime'
          loading='lazy'
          quality={75}
          width={0}
          height={0}
          layout='responsive'
          style={{ height: '100%' }}
        />
      </Hero>
      <ChooseYourMeans />
      <WeMakeItEasy />
      <OfferStrengthAnalyzer />
      <MainTestimonial />
    </>
  );
}
