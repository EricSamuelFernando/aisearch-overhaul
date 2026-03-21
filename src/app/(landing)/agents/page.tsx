import AgentsHero from '@/components/agents/agents-hero';
import AgentsWeMakeItEasy from '@/components/agents/agents-we-make-it-easy';
import FindAgent from '@/components/agents/find-agent';
import FindPartner from '@/components/agents/find-partner';
import OurClients from '@/components/company/our-clients';
import MainTestimonial from '@/components/main-testimonial';

const AGENTS_REVALIDATE_SECONDS = 300;

export const revalidate = AGENTS_REVALIDATE_SECONDS;

const AGENTS_TESTIMONIALS = [
  {
    name: 'MILTON AUSTIN',
    title: 'First-time Buyer Specialist, San Diego',
    text: 'Snaphomz cuts the time I spend on offers and disclosures each week. The workflows keep everything organized so I can focus on advising clients instead of chasing paperwork.',
    img: '/assets/images/what-our-clients/img1.png',
  },
  {
    name: 'ALEX RICHARD',
    title: 'Broker Associate, Austin',
    text: 'The analytics and AI summaries give me clear talking points for every client meeting. I walk in prepared, and my clients feel confident in each decision we make together.',
    img: '/assets/images/what-our-clients/img2.png',
  },
];

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
  'http://localhost:4000/auth/graphql';

const sectionHeadingSize = 'text-[2.35rem] sm:text-[2.75rem] md:text-[3.35rem]';

async function fetchAgents() {
  if (!GRAPHQL_URI) {
    return [];
  }

  try {
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
      next: { revalidate: AGENTS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error('Failed to fetch agents', response.status, response.statusText);
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
  } catch (error) {
    console.error('Failed to fetch agents', error);
    return [];
  }
}

const AgentsPage = async () => {
  const agents = await fetchAgents();

  return (
    <main>
      <AgentsHero agents={agents} />
      {/* <FindAgent />*/}
      {/* <FindPartner /> */}
      <AgentsWeMakeItEasy />
      {/* <MainTestimonial /> */}
      <div className="home-section-gap">
        <OurClients
          bgColor="#FFF6EC"
          headingClassName={sectionHeadingSize}
          subtitle="We value our agents' honest feedback on how Snaphomz supports their business."
          testimonials={AGENTS_TESTIMONIALS}
        />
      </div>
    </main>
  );
};

export default AgentsPage;
