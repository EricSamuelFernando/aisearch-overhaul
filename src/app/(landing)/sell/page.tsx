import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
import OurClients from '@/components/company/our-clients';
import MainTestimonial from '@/components/main-testimonial';
import ChooseYourMeans from '@/components/sell/choose-your-means';
import EstimatedRent from '@/components/sell/estimated-rent';
import SellHero from '@/components/sell/sell-hero';
import SellWeMakeItEasy from '@/components/sell/sell-we-make-it-easy';

const sectionHeadingSize = 'text-[2.2rem] sm:text-[2.55rem] md:text-[2.05rem] lg:text-[2.2rem] xl:text-[2.55rem] 2xl:text-[3.05rem]';

function Sell() {
  return (
    <main suppressHydrationWarning className='bg-[#FFF6EC]'>
      <SellHero />
      <div className="sell-sections mt-16">
        <ChooseYourMeans headingClassName={sectionHeadingSize} />
        {/* <SellWeMakeItEasy /> */}
        <WeMakeItEasy
          headingClassName={sectionHeadingSize}
          heading={<>We Make It <span className="font-light">Easy</span></>}
          subtitle="Tailor your homebuying experience - your way, with the guidance you need."
          contentPreset="home"
          disableCarousel
        />
       {/* <EstimatedRent />*/}
        {/* <MainTestimonial /> */}
        <OurClients bgColor="#FFF6EC" headingClassName={sectionHeadingSize} />
      </div>
    </main>
  );
}

export default Sell;
