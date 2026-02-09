import AgentsHero from '@/components/agents/agents-hero';
import AgentsWeMakeItEasy from '@/components/agents/agents-we-make-it-easy';
import FindAgent from '@/components/agents/find-agent';
import FindPartner from '@/components/agents/find-partner';
import TimeWorth from '@/components/agents/time-worth';
import OurClients from '@/components/company/our-clients';
import MainTestimonial from '@/components/main-testimonial';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/auth/graphql';

async function fetchAgents() {
  const response = await fetch(GRAPHQL_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    body: JSON.stringify({
      query: `
        query ExternalAgents($limit: Int, $offset: Int) {
          externalAgents(limit: $limit, offset: $offset) {
            data {
              id
              full_name
              email
              phone
              brokerage
              locationRaw
              profile_image_url
              avgRating
              avgRatingForCustomerDisplay
              homesSoldLastYear
            }
          }
        }
      `,
      variables: {
        limit: 1000,
        offset: 0,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const json = await response.json();
  const data = json?.data?.externalAgents?.data || [];
  return data.map((agent: any) => ({
    ...agent,
    Name: agent.full_name || '',
    agentEmail: agent.email || undefined,
    Location: agent.locationRaw || undefined,
    Brokerage: agent.brokerage || undefined,
  }));
}

const AgentsPage = async () => {
  const agents = await fetchAgents();

  return (
    <main>
      <AgentsHero agents={agents} />
     {/* <FindAgent />*/}
      {/* <FindPartner /> */}
      <AgentsWeMakeItEasy />
      <TimeWorth />
      {/* <MainTestimonial /> */}
      <OurClients bgColor="#FFF6EC" />
    </main>
  );
};

export default AgentsPage;

