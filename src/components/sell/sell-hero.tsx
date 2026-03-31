// import { HeroLayout } from '@/components/hero-layout';
// import { HeroSearchForm } from '@/components/main/hero-tab';

// function SellHero() {
//   return (
//     <HeroLayout className='bg-[#F7F2EB] py-0 pr-0 pt-0 md:py-0 md:pl-8 md:pr-0 md:pt-0'>
//       <div className='grid-cols-2 md:grid md:min-h-[80vh]'>
//         <div className='col-span-1 flex flex-col items-start justify-start gap-10 py-8'>
//           <div className='my-8'>
//             <h1 className='py-3 text-4xl font-extrabold leading-[5.93rem] md:text-[4.5rem] 2xl:text-[5.3rem] 2xl:leading-[6.93rem]'>
//             Transparent Selling <br /> Manage. List. Maximize
//             </h1>
//           </div>
//             <h1 className='py-3 text-2xl font-extrabold leading-[3.93rem] md:text-[2.5rem] xl:text-[3.3rem] xl:leading-[4.93rem]'>All in one Tap</h1>
//           <div className='block w-[80%]'>
//             <HeroSearchForm placeholderText='Enter your home or MLS#' />
//           </div>
//         </div>

//         <div className="col-span-1 rounded-tl-full border-b-[1rem] border-l-[1.25rem] border-[#F07639] bg-[url('../../public/assets/images/sell-hero.jpg')] bg-cover bg-center bg-no-repeat" />
//       </div>
//     </HeroLayout>
//   );
// }

// export default SellHero;

import { HeroLayout } from '@/components/hero-layout';
import { HeroSearchForm } from '@/components/main/hero-tab';
import MainNavPages from '../navbars/main-nav-pages';

function SellHero() {
  const heroHeadingSize = 'text-[2.5rem] sm:text-[2.9rem] md:text-[2.35rem] lg:text-[2.7rem] xl:text-[3.1rem] 2xl:text-[3.45rem]';

  return (
    <>
      <div className="fixed w-full z-50 top-0 left-0">
        <MainNavPages />
      </div>
      <div className="text-black h-[380px] md:h-auto md:min-h-[135vh] relative pt-0 mt-0 overflow-hidden">
        <HeroLayout
          style={{ minHeight: '380px' }}
          className="
        relative 
        h-[380px]
        md:h-auto
        md:min-h-[135vh]
        bg-[#F7F2EB]
        md:bg-[url('/assets/images/sell-hero.jpg')] 
        md:bg-[length:100%_auto]
        md:bg-[position:60%_center]
        bg-no-repeat 
      "
        >
          <div
            className="absolute inset-0 z-0 bg-[url('/assets/images/sell-hero.jpg')] bg-no-repeat md:hidden"
            style={{
              backgroundSize: 'auto 136%',
              backgroundPosition: 'center 84%',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.18) 18%, rgba(0, 0, 0, 0.68) 42%, #000 56%, #000 100%)',
              maskImage:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.18) 18%, rgba(0, 0, 0, 0.68) 42%, #000 56%, #000 100%)',
            }}
          ></div>

          {/* Overlay Image */}
          <div className="absolute inset-0 bg-[url('/assets/images/hero-sell-bg.png')] bg-cover bg-center bg-no-repeat z-[1]"></div>

          {/* Bottom Image */}
          <div className="absolute bottom-0 left-0 right-0 bg-[url('/assets/images/hero-sell-bg-bottom.png')] bg-cover bg-center bg-no-repeat z-[2] h-[40px] md:h-[140px]"></div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col items-center justify-start md:justify-center text-center px-4 pt-24 md:pt-0 pb-8 md:pb-0 h-full md:h-auto md:min-h-[135vh] gap-5 md:gap-8">
            {/* Mobile View - "Buying a home should be Very Easy" */}
            <h1 className="block md:hidden text-black text-[2.3rem] font-medium leading-tight mb-3 relative z-20">
              <span className="block">Buying a home</span>
              <span className="block">
                should be <span className="font-semibold">Very</span>{' '}
                <span className="font-normal italic" style={{ fontStyle: 'italic' }}>Easy</span>
              </span>
            </h1>

            {/* Desktop View - Multi Line */}
            <h1 className={`${heroHeadingSize} hidden md:block max-w-[340px] font-medium leading-[1.06] tracking-[-0.03em] text-black sm:max-w-[380px] md:mb-6 md:max-w-none md:leading-snug md:tracking-tight px-4`}>
              <span className="block">Take Control of Your</span>
              <span className="block">Real Estate <span className="font-light italic">Journey</span></span>
            </h1>

            <div className="w-[92vw] max-w-[500px] sm:max-w-[560px] md:mt-8 md:w-[600px] md:max-w-none lg:w-[660px] xl:w-[700px] [&>div]:w-full [&>div>form]:!flex [&>div>form]:items-center [&>div>form]:gap-2 [&>div>form]:w-full [&_button]:!w-auto [&_button]:flex-shrink-0 [&_button]:md:!w-auto [&_input]:flex-1">
              <HeroSearchForm placeholderText="Enter your MLS#" searchType="sell" />
            </div>
          </div>

        </HeroLayout>
      </div>

    </>

  );
}

export default SellHero;
