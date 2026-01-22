'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogRelatedArticles from './blog-related-articles';
import BlogLatestArticles from './blog-latest-articles';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
}

// Mock data - Replace with actual API call
const getArticleById = (id: string): Article | null => {
  const articles: Article[] = [
    {
      id: 'featured',
      title: '5 Ways Technology is Changing How Nigerians Buy Homes',
      excerpt: 'The real estate landscape in Nigeria is undergoing a digital transformation. From virtual property tours to AI-powered market analysis, technology is revolutionizing how Nigerians search for, evaluate, and purchase homes.',
      content: `
        <p class="intro-text">The real estate landscape in Nigeria is undergoing a digital transformation. From virtual property tours to AI-powered market analysis, technology is revolutionizing how Nigerians search for, evaluate, and purchase homes. Discover the five key technological innovations that are making home buying more accessible, transparent, and efficient for Nigerian homebuyers.</p>
        
        <h2>1. Virtual Tours</h2>
        <p class="italic-text"><em>Virtual strantiones emerging to drugr spectarys, everyhings at real estate, along with the sperifus ar nedexz.</em></p>
        <ul>
          <li>Immersive experience; virtual rours provide a realistic feel of at the property.</li>
        </ul>
        
        <h2>2. Real Estate Mobile Apps</h2>
        <p>Apps are ken rc-browse, listings, aranging notificatotifications, and arrangins viewings.</p>
        <ul>
          <li>Personalized recommendations; apps ause data to suggest properties that match the buyer's preferences</li>
        </ul>
        
        <blockquote>
          Technology has made the home buying process more efficient and user-friendly.
        </blockquote>
        
        <p>In conclusion, technology is revolutionizing how Nigerians buy homes. With-dirtual tours, real estate mobile apps; and online platrome; the process has become more convement and accessible. As technological advancements contirue; the Nigerian real estate market is poised for further innovation and growth.</p>
      `,
      image: '/assets/images/blog_insight.png',
      category: 'Market Trends',
      author: 'Alex Whitten',
      authorImage: '/assets/images/blog-hero-img.jpg',
      date: '24 Jan 2024',
      readTime: '8 min read',
    },
    {
      id: '1',
      title: 'The Human Side of Real Estate: Why Agents Still Matter',
      excerpt: 'In an era of digital platforms, discover why human expertise and personal relationships remain crucial in real estate transactions.',
      content: `
        <p>In today's digital age, where technology seems to dominate every aspect of our lives, it's easy to assume that real estate agents might become obsolete. However, the reality is quite different. While technology has certainly transformed the real estate industry, the human element remains irreplaceable.</p>
        
        <h2>The Value of Personal Relationships</h2>
        <p>Real estate transactions are among the most significant financial decisions people make in their lifetimes. These transactions involve not just property, but emotions, dreams, and life-changing moments. A good real estate agent understands this and provides the emotional support and guidance that technology simply cannot offer.</p>
        
        <p>Agents bring years of experience, local market knowledge, and negotiation skills that can make the difference between a successful transaction and a missed opportunity. They understand the nuances of different neighborhoods, school districts, and market trends that can't be captured by algorithms alone.</p>
        
        <h2>Navigating Complex Transactions</h2>
        <p>Real estate transactions involve numerous legal documents, inspections, appraisals, and negotiations. An experienced agent helps navigate these complexities, ensuring that clients understand every step of the process and are protected throughout.</p>
        
        <p>Technology can provide information, but it cannot replace the personalized advice and problem-solving skills that experienced agents bring to the table. When unexpected issues arise during a transaction, an agent's expertise becomes invaluable.</p>
        
        <h2>The Future of Real Estate</h2>
        <p>Rather than replacing agents, technology is actually empowering them to provide better service. Modern agents use technology to streamline processes, provide better market analysis, and communicate more effectively with clients. The combination of human expertise and technological tools creates the best possible experience for buyers and sellers.</p>
      `,
      image: '/assets/images/leftside-blog-img.png',
      category: 'Company Insight',
      author: 'Remy Watson',
      authorImage: '/assets/images/company-hero.jpg',
      date: '24 Jan 2024',
      readTime: '5 min read',
    },
    {
      id: '2',
      title: 'What No One Tells You About Your First Home Purchase',
      excerpt: 'Uncover the hidden costs, unexpected challenges, and essential tips that first-time homebuyers need to know before making their purchase.',
      content: `
        <p>Buying your first home is an exciting milestone, but it can also be overwhelming. There are many aspects of the home-buying process that aren't always discussed upfront. Here's what you need to know.</p>
        
        <h2>Hidden Costs Beyond the Purchase Price</h2>
        <p>When budgeting for your first home, it's crucial to account for costs beyond the purchase price. These include closing costs, which typically range from 2% to 5% of the home's price, home inspections, appraisals, and moving expenses.</p>
        
        <p>Additionally, you'll need to budget for immediate repairs and improvements, property taxes, homeowners insurance, and potentially homeowners association (HOA) fees. These ongoing costs can significantly impact your monthly budget.</p>
        
        <h2>The Importance of Pre-Approval</h2>
        <p>Getting pre-approved for a mortgage before you start house hunting is essential. Not only does it help you understand your budget, but it also makes you a more attractive buyer to sellers. Pre-approval shows that you're serious and financially prepared.</p>
        
        <h2>Location Matters More Than You Think</h2>
        <p>While the house itself is important, the location will have a significant impact on your quality of life and the property's future value. Consider factors like school districts, commute times, neighborhood safety, and future development plans in the area.</p>
      `,
      image: '/assets/images/rightside-blog-img.jpg',
      category: 'Market Trends',
      author: 'Alex Johnson',
      authorImage: '/assets/images/leftside-blog-img.png',
      date: '22 Jan 2024',
      readTime: '7 min read',
    },
    {
      id: '3',
      title: 'Understanding Property Valuation: A Complete Guide',
      excerpt: 'Learn how properties are valued, what factors influence pricing, and how to ensure you get the best deal when buying or selling.',
      content: `
        <p>Property valuation is a complex process that involves multiple factors. Understanding how properties are valued can help you make informed decisions whether you're buying or selling.</p>
        
        <h2>Key Factors in Property Valuation</h2>
        <p>Location is the most significant factor in property valuation. Properties in desirable neighborhoods with good schools, low crime rates, and convenient amenities typically command higher prices.</p>
        
        <p>Property size, condition, age, and features also play crucial roles. Recent renovations, modern amenities, and energy-efficient features can significantly increase a property's value.</p>
        
        <h2>Comparative Market Analysis</h2>
        <p>Real estate professionals use comparative market analysis (CMA) to determine property values by comparing similar properties that have recently sold in the area. This helps establish a fair market value based on current market conditions.</p>
      `,
      image: '/assets/images/rightside-blog-img.jpg',
      category: 'Tips & Advice',
      author: 'Sarah Williams',
      authorImage: '/assets/images/leftside-blog-img.png',
      date: '20 Jan 2024',
      readTime: '8 min read',
    },
    {
      id: '4',
      title: 'The Future of Smart Homes in Nigeria',
      excerpt: 'Explore how smart home technology is reshaping the Nigerian real estate market and what buyers should consider.',
      content: `
        <p>Smart home technology is rapidly transforming the real estate landscape in Nigeria. From automated security systems to energy-efficient appliances, technology is making homes more convenient, secure, and sustainable.</p>
        
        <h2>Popular Smart Home Features</h2>
        <p>Home automation systems that control lighting, temperature, and security are becoming increasingly popular. These systems not only provide convenience but also help reduce energy costs and improve home security.</p>
        
        <h2>Investment Considerations</h2>
        <p>When considering smart home features, it's important to think about both the initial investment and long-term benefits. While smart home technology can increase property values, it's essential to choose systems that are reliable and well-supported.</p>
      `,
      image: '/assets/images/leftside-blog-img.png',
      category: 'Market Trends',
      author: 'Michael Brown',
      authorImage: '/assets/images/rightside-blog-img.jpg',
      date: '18 Jan 2024',
      readTime: '9 min read',
    },
  ];

  return articles.find((article) => article.id === id) || null;
};

export default function BlogArticleDetail({ articleId }: { articleId: string }) {
  const router = useRouter();
  const article = getArticleById(articleId);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-[#FFF6EC]">
  <div className="w-full py-10">
    <div className="max-w-7xl mx-auto px-4 md:px-6">

      {/* FEATURE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12">

        {/* IMAGE — FIRST ON MOBILE */}
        <div
          className="
            order-1 lg:order-2
            w-full
            lg:max-w-xl
            mx-auto lg:mx-0
            lg:pl-10
          "
        >
          <div
            className="
              relative
              w-full
              h-[240px]
              sm:h-[300px]
              md:h-[360px]
              lg:h-[560px]
              xl:h-[620px]
              rounded-2xl
              overflow-hidden
            "
          >
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        </div>

        {/* TEXT — SECOND ON MOBILE */}
        <div
          className="
            order-2 lg:order-1
            w-full
            lg:max-w-xl
            mx-auto lg:mx-0
            flex flex-col justify-center
            text-start
          "
        >
          <h1 className="satoshi mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1B1B1B] leading-tight">
            {article.title}
          </h1>

          <p className="mt-4 text-base text-[#545454] leading-relaxed">
            {article.excerpt}
          </p>
        </div>

      </div>
    </div>
  </div>
</section>



      {/* Article Content */}
      <article className="w-full bg-[#FFF6EC] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-24 w-[280px] space-y-8">

                {/* Table of contents */}
                <div>
                  <p className="text-sm font-semibold text-[#F07639] mb-4">
                    Table of contents
                  </p>
                  <ul className="space-y-3 text-sm text-[#1B1B1B]">
                    <li className="font-medium">Introduction</li>
                    <li>Software and tools</li>
                    <li>Other Resources</li>
                    <li>Conclusion</li>
                  </ul>
                </div>

                {/* Divider */}
                <div className="w-[280px] h-px bg-[#EAECF0]" />

                {/* Contributors */}
                <div>
                  <p className="text-sm font-semibold text-[#F07639] mb-4">
                    Contributors
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src="/assets/images/blog-hero-img.jpg"
                          alt="Alec Whitten"
                          width={48}
                          height={48}
                          className="rounded-full object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm font-medium text-[#1B1B1B]">
                        Alec Whitten
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src="/assets/images/company-hero.jpg"
                          alt="Remy Watson"
                          width={48}
                          height={48}
                          className="rounded-full object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm font-medium text-[#1B1B1B]">
                        Remy Watson
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[280px] h-px bg-[#EAECF0]" />

                {/* Subscribe */}
                <div>
                  <p className="text-sm font-semibold text-[#F07639] mb-3">
                    Subscribe to our newsletter
                  </p>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full mb-3 px-4 py-2.5 text-sm text-[#565453] bg-transparent border border-[#170800] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C26100]"
                  />

                  <Button className="w-full rounded-full bg-[#1B1B1B] text-white">
                    Subscribe
                  </Button>
                </div>

              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-9 space-y-12">

              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-[#1B1B1B] mb-4">
                  Introduction
                </h2>
                <p className="text-base text-[#545454] leading-relaxed mb-6">
                  Buying a home in Nigeria used to mean endless agent calls, confusing paperwork,
                  and physically touring countless properties. But the landscape is changing rapidly.
                  Technology has completely reshaped how people search for, evaluate, and purchase homes.
                </p>

                <div className="relative w-full h-[360px] rounded-2xl overflow-hidden">
                  <Image
                    src="/assets/images/blog_insightRead1.jpg"
                    alt="Interior"
                    fill
                    className="object-cover"
                  />
                </div>
              </section>

              {/* Section 1 */}
              <section>
                <h3 className="text-xl font-semibold text-[#170800] mb-3">
                  1. Virtual Tours Are Replacing Physical Visits
                </h3>
                <p className="text-base text-[#565453] leading-relaxed">
                  No more rushing across town for every property inspection. Virtual tours and 3D walkthroughs now let buyers explore homes from anywhere — on their phone, tablet, or laptop.
                  You can move through rooms, zoom in on finishes, and even check out the view — all before stepping foot inside. This means you can shortlist properties faster and only visit the ones that truly match your needs.
                  💡 Snaphomz Pro Tip: Look for listings that offer high-quality virtual tours and detailed floor plans. They save you time and give you a realistic feel for the space.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h3 className="text-xl font-semibold text-[#170800] mb-3">
                  2. AI-Powered Recommendations Are Personalizing Your Search
                </h3>
                <p className="text-base text-[#565453] leading-relaxed">
                  Remember scrolling endlessly through listings that didn’t fit your taste or budget? Artificial Intelligence is fixing that.
                  With AI-powered search, platforms like Snaphomz learn your preferences — location, budget, style — and recommend homes that actually match what you’re looking for. It’s like having a digital home-hunting assistant that understands your needs before you do.
                  This not only simplifies your search but also opens up options you might not have found on your own.
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <h3 className="text-xl font-semibold text-[#170800] mb-3">
                  3. Instant Messaging Is Speeding Up Communication
                </h3>
                <p className="text-base text-[#565453] leading-relaxed">
                  In the past, reaching an agent could take hours or even days. Now, with integrated chat tools, you can connect instantly. Whether it’s scheduling a tour, asking for more photos, or negotiating a price — everything happens in real time.
                  Snaphomz’s built-in chat makes it easier for buyers and agents to communicate quickly, making deals move faster and more transparently.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h3 className="text-xl font-semibold text-[#170800] mb-3">
                  4. Secure Digital Payments Are Making Closings Safer
                </h3>
                <p className="text-base text-[#565453] leading-relaxed">
                  Carrying cash or making large transfers used to be stressful. Today, secure digital payment systems ensure your transactions are fast, transparent, and traceable.
                  Through Snaphomz’s verified payment partners, buyers can make deposits, confirm transfers, and receive receipts — all within a few clicks. This reduces fraud and builds trust between buyers, sellers, and agents.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h3 className="text-xl font-semibold text-[#170800] mb-3">
                  5. Data Is Giving Buyers More Confidence
                </h3>
                <p className="text-base text-[#565453] leading-relaxed">
                  The best decisions are made with data. Platforms like Snaphomz use data analytics to provide insights on property trends, pricing history, and neighborhood growth.
                  Buyers can now see whether a property is underpriced, track demand in specific areas, and make informed choices — not emotional guesses.
                  That’s a huge leap from the old days when real estate decisions were based mostly on word-of-mouth.
                </p>
              </section>

              {/* Bottom Image */}
              <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
                <Image
                  src="/assets/images/blog_insightRead.jpg"
                  alt="Living room"
                  fill
                  className="object-cover"
                />
              </div>

            </div>
          </div>
        </div>
      </article>

      <BlogLatestArticles variant="detailed" />

      {/* Related Articles Section */}
      {/* <BlogRelatedArticles currentArticleId={article.id} /> */}
    </main>
  );
}

