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
  return (
    <>
      <div className="fixed w-full z-50 top-0 left-0">
        <MainNavPages />
      </div>
      <div className="text-black min-h-screen relative pt-28 -mt-28 overflow-hidden">
        <HeroLayout
          className="
        relative 
        bg-[url('/assets/images/sell-hero.jpg')] 
        bg-cover 
        bg-center 
        bg-no-repeat 
        before:absolute 
        before:inset-0 
        before:bg-black/40
      "
        >

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-32 md:py-48">
            <h1 className="
    text-white 
    font-extrabold 
    text-4xl 
    md:text-5xl 
    lg:text-6xl 
    leading-tight 
    max-w-3xl
  ">
              Take Control of Your Real Estate <em>Journey</em>
            </h1>

            <div className="w-full max-w-2xl mt-8">
              <HeroSearchForm placeholderText="Describe Your Dream Home" />
            </div>
          </div>

        </HeroLayout>
      </div>

    </>

  );
}

export default SellHero;
