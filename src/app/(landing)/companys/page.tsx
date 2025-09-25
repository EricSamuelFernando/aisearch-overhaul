import AgentsHero from '@/components/company/companys-hero';
import AgentsWeMakeItEasy from '@/components/company/companys-we-make-it-easy';
import OurClients from '@/components/company/our-clients';
import TimeWorth from '@/components/company/time-worth';
import WeBelive from '@/components/company/we-belive';
import WhoWeCompany from '@/components/company/who-we-company';
import MainTestimonial from '@/components/main-testimonial';

const CompanysPage = () => {
  return (
    <main>
      <AgentsHero />
      <WhoWeCompany />
      <WeBelive />
      <OurClients />
      {/* <AgentsWeMakeItEasy /> */}
      {/* <TimeWorth /> */}
      {/* <MainTestimonial /> */}
    </main>
  );
};

export default CompanysPage;
