import AgentsHero from '@/components/agents/agents-hero';
import AgentsWeMakeItEasy from '@/components/agents/agents-we-make-it-easy';
import FindAgent from '@/components/agents/find-agent';
import FindPartner from '@/components/agents/find-partner';
import TimeWorth from '@/components/agents/time-worth';
import OurClients from '@/components/company/our-clients';
import MainTestimonial from '@/components/main-testimonial';

const AgentsPage = () => {
  return (
    <main>
      <AgentsHero />
      <FindAgent />
      <FindPartner />
      <AgentsWeMakeItEasy />
      <TimeWorth />
      {/* <MainTestimonial /> */}
      <OurClients />
    </main>
  );
};

export default AgentsPage;
