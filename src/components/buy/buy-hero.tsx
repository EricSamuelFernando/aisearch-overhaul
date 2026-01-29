import { HeroLayout } from '@/components/hero-layout';
import { HeroSearchForm } from '../main/hero-tab';

function BuyHero() {
  return (
    <HeroLayout>
      <div className='grid-cols-2  md:grid md:min-h-[80vh]'>
        <div className="col-span-1 grid place-content-center  rounded-xl bg-ocOrange/90 bg-[url('../../public/assets/images/leaf-icon.svg')] bg-cover bg-left-bottom px-6 py-8 backdrop-brightness-75  md:rounded-none md:rounded-l-2xl md:px-12">
          <div className='my-14 text-white'>
            <h1 className='py-3 text-4xl font-bold leading-[1.2] md:text-5xl'>
              Streamline Transactions with One-Click Ease & Transparency
            </h1>

            <h3 className='text-base'>
              {`Experience buying and selling with a guided platform.
              Transaparency is our Mantra. Let's start now not tomorrow
              `}
            </h3>
          </div>
          <div>
            <div className='block overflow-visible'>
              <HeroSearchForm />
            </div>
          </div>
        </div>
        <div className="col-span-1  rounded-r-2xl bg-[url('/assets/images/buy-header.jpg')] bg-cover bg-center bg-no-repeat"></div>
      </div>
    </HeroLayout>
  );
}

export default BuyHero;
