import AgentsHero from '@/components/company/companys-hero';
import AgentsWeMakeItEasy from '@/components/company/companys-we-make-it-easy';
import OurClients from '@/components/company/our-clients';
import TimeWorth from '@/components/company/time-worth';
import WeBelive from '@/components/company/we-belive';
import WhoWeCompany from '@/components/company/who-we-company';
import MainTestimonial from '@/components/main-testimonial';

const sectionHeadingSize = 'text-[2.35rem] sm:text-[2.75rem] md:text-[3.35rem]';

const CompanysPage = () => {
  return (
    <main className="overflow-x-hidden">
      <AgentsHero />
      <WhoWeCompany />
      <WeBelive />
      {/* <OurClients bgColor="#FFF6EC" /> */}
      <OurClients bgColor="#FFF6EC" headingClassName={sectionHeadingSize} />
      {/* <AgentsWeMakeItEasy /> */}
      {/* <TimeWorth /> */}
      {/* <MainTestimonial /> */}
    </main>
  );
};

export default CompanysPage;
