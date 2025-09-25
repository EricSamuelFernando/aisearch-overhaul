import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
import OurClients from '@/components/company/our-clients';
import MainTestimonial from '@/components/main-testimonial';
import ChooseYourMeans from '@/components/sell/choose-your-means';
import EstimatedRent from '@/components/sell/estimated-rent';
import SellHero from '@/components/sell/sell-hero';
import SellWeMakeItEasy from '@/components/sell/sell-we-make-it-easy';

function Sell() {
  return (
    <main suppressHydrationWarning className='bg-[#FAF0E6]'>
      <SellHero />
      <ChooseYourMeans />
      {/* <SellWeMakeItEasy /> */}
      <WeMakeItEasy/>
      <EstimatedRent />
      {/* <MainTestimonial /> */}
      <OurClients />
    </main>
  );
}

export default Sell;
