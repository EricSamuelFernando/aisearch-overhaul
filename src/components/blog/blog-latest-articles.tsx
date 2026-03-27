'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';


interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  readTime?: string;
  tags?: string[];
}


const articles: Article[] = [
  {
    id: '1',
    title: 'The Human Side of Real Estate: Why Agents Still Matter',
    excerpt: 'Even in a tech-driven world, people remain at the heart of every great deal.',
    image: '/assets/images/blog_agentedge1.jpg',
    category: 'Customer Success',
    author: 'Remy Watson',
    authorImage: '/assets/images/blog_profile.png',
    date: '24 Jan 2024',
    readTime: '8 min read',
    tags: ['This is a Tag', 'This is a Tag', 'This is a Tag'],
  },
  {
    id: '2',
    title: 'What No One Tells You About Your First Home Purchase',
    excerpt: 'Tips, lessons, and red flags every first-time buyer should know before signing that dotted line.',
    image: '/assets/images/blog_agentedge2.jpg',
    category: 'Customer Success',
    author: 'Alex Johnson',
    authorImage: '/assets/images/blog_profile.png',
    date: '22 Jan 2024',
    readTime: '8 min read',
    tags: ['This is a Tag', 'This is a Tag', 'This is a Tag'],
  },
  {
    id: '10-quick-curb-appeal-ideas-you-can-do-in-a-weekend-or-less',
    title: '10 Quick Curb Appeal Ideas You Can Do in a Weekend or Less',
    excerpt: 'Boost curb appeal fast with 10 easy weekend upgrades that improve first impressions, increase home value, and attract more buyers instantly.',
    image: '/assets/images/Blogs/Blog 3/281-1.jpeg',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '27 Mar 2026',
    readTime: '10 min read',
    tags: ['Curb Appeal', 'Home Improvement', 'Weekend Project', 'Selling Tips'],
  },
  {
    id: 'curb-appeal-on-autopilot-smart-sprinkler-systems-and-property-value',
    title: 'Curb Appeal on Autopilot: Smart Sprinkler Systems and Property Value',
    excerpt: 'Boost curb appeal with smart sprinklers. Compare Rachio, Orbit, and more. Learn how lawn care impacts property value in top school districts in 2026.',
    image: '/assets/images/Blogs/Blog 5/279-2.jpeg',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '26 Mar 2026',
    readTime: '10 min read',
    tags: ['Smart Sprinklers', 'Curb Appeal', 'Property Value', 'Water Conservation'],
  },
  {
    id: 'hvac-strategy-investing-in-air-quality-and-cooling-efficiency-for-2026',
    title: 'HVAC Strategy: Investing in Air Quality and Cooling Efficiency for 2026',
    excerpt: 'Is your HVAC ready for 2026? Compare Carrier, Trane, and Mitsubishi. Learn about SEER2 ratings and how HVAC history affects home value today.',
    image: '/assets/images/Blogs/Blog 4/280-3.jpeg',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '25 Mar 2026',
    readTime: '10 min read',
    tags: ['HVAC', 'Air Quality', 'Energy Efficiency', 'Home Value'],
  },
  {
    id: 'the-2026-bbq-strategy-gas-pellet-or-charcoal-which-grill-wins-the-tco-game',
    title: 'The 2026 BBQ Strategy: Gas, Pellet, or Charcoal — Which Grill Wins the TCO Game?',
    excerpt: 'Which grill wins the Total Cost of Ownership? Compare Weber, Traeger, and Big Green Egg to find the best BBQ investment for your 2026 outdoor kitchen.',
    image: '/assets/images/Blogs/Blog 2/283-1.png',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '24 Mar 2026',
    readTime: '10 min read',
    tags: ['BBQ', 'Outdoor Kitchen', 'Home Upgrades', 'TCO'],
  },
  {
    id: 'refrigerators-in-2026-more-than-cooling-predicting-your-food-and-energy-burn',
    title: 'Refrigerators in 2026: More Than Cooling — Predicting Your Food & Energy Burn',
    excerpt: 'Compare Samsung, Sub-Zero, and more in our 2026 refrigerator guide. Learn how energy efficiency and smart tech affect home value and total cost of ownership.',
    image: '/assets/images/Blogs/Blog 8/T3.jpeg',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '23 Mar 2026',
    readTime: '10 min read',
    tags: ['Refrigerators', 'Smart Kitchen', 'Energy Efficiency', 'Home Value'],
  },
  {
    id: 'standalone-freezers-the-secret-weapon-for-lowering-your-monthly-food-overhead',
    title: 'Standalone Freezers: The Secret Weapon for Lowering Your Monthly Food Overhead',
    excerpt: 'Discover how a standalone freezer lowers your monthly food overhead. We compare Danby, GE, and more, analyzing energy costs vs. bulk buying savings.',
    image: '/assets/images/Blogs/Blog 7/277-1.jpeg',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '22 Mar 2026',
    readTime: '10 min read',
    tags: ['Standalone Freezers', 'Bulk Buying', 'Food Savings', 'Home Efficiency'],
  },
  {
    id: 'water-heater-tco-why-tankless-is-the-2026-standard-for-smart-buyers',
    title: 'Water Heater TCO: Why Tankless is the 2026 Standard for Smart Buyers',
    excerpt: 'Is a tankless water heater right for you? Compare Rheem, Rinnai, and others. Learn how gas lines, heat pumps, and efficiency affect TCO in 2026 now!',
    image: '/assets/images/Blogs/Blog 6/278-2.jpeg',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '21 Mar 2026',
    readTime: '10 min read',
    tags: ['Water Heater', 'Tankless', 'Home Efficiency', 'TCO'],
  },
  {
    id: 'speed-ovens-vs-microwaves-the-professional-kitchen-upgrade-you-didnt-know-you-needed',
    title: 'Speed Ovens vs. Microwaves: The Professional Kitchen Upgrade You Didn\'t Know You Needed',
    excerpt: 'Is a speed oven worth it? Compare Bosch, Monogram, and more to standard microwaves to see if the $1,500 upgrade pays off in 2026 kitchens.',
    image: '/assets/images/Blogs/Blog 1/73-3.png',
    category: 'Tips & Advice',
    author: 'Nrupen Mandava',
    authorImage: '/assets/images/Blogs/Profile/ChatGPT Image Mar 25, 2026, 10_58_30 AM.png',
    date: '20 Mar 2026',
    readTime: '10 min read',
    tags: ['Kitchen Upgrades', 'Speed Oven', 'Home Value', 'Smart Appliances'],
  },
];

export default function BlogLatestArticles({
  variant = 'default',
}: {
  variant?: 'default' | 'detailed';
}) {
  return (
    <section className="py-16 px-4 md:px-10 bg-[#FFF6EC]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
              className={`group rounded-2xl overflow-hidden max-w-xl ${article.id === '1' || article.id === '2' ? 'hidden' : ''}`}
            >
              {/* Image */}
              <div className="relative w-full h-[360px] rounded-2xl overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4 space-y-4">

                {/* Capsules (DETAILED only) */}
                {variant === 'detailed' && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full bg-[#FFEAD5] text-[#F07639]">
                    <span className="items-center gap-2 px-3 py-1 rounded-full bg-[#FFF6EC] ">{article.category}</span>
                    {article.readTime && (
                      <span className="opacity-80 bg-transparent">{article.readTime}</span>
                    )}
                  </span>
                )}

                {/* Category label (DEFAULT only) */}
                {variant === 'default' && (
                  <span className="text-sm font-semibold text-[#F07639]">
                    {article.category}
                  </span>
                )}

                {/* Title + Arrow */}
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-[#1B1B1B] leading-snug">
                    {article.title}
                  </h2>
                  <ArrowUpRight className="w-6 h-6 shrink-0 text-[#1B1B1B]" />
                </div>

                {/* Excerpt */}
                <p className="text-base text-[#575757] leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Profile */}
                <div className="flex items-center gap-3 pt-2">
                  <Image
                    src={article.authorImage}
                    alt={article.author}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1B1B1B]">
                      {article.author}
                    </p>
                    <p className="text-sm text-[#6B6B6B]">
                      {article.date}
                    </p>
                  </div>
                </div>

                {/* Divider + Tags (DETAILED only) */}
                {variant === 'detailed' && (
                  <>
                    <div className="w-full h-px bg-[#EAECF0]" />

                    {article.tags && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs rounded-full border border-[#D0D5DD] text-[#1B1B1B]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

              </div>
            </Link>

          ))}
        </div>
      </div>
    </section>
  );
}
