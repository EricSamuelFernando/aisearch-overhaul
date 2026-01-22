'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';


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
  // {
  //   id: '3',
  //   title: 'Understanding Property Valuation: A Complete Guide',
  //   excerpt: 'Learn how properties are valued, what factors influence pricing, and how to ensure you get the best deal when buying or selling.',
  //   image: '/assets/images/rightside-blog-img.jpg',
  //   category: 'Tips & Advice',
  //   author: 'Sarah Williams',
  //   authorImage: '/assets/images/leftside-blog-img.png',
  //   date: '20 Jan 2024',
  // },
  // {
  //   id: '4',
  //   title: 'The Future of Smart Homes in Nigeria',
  //   excerpt: 'Explore how smart home technology is reshaping the Nigerian real estate market and what buyers should consider.',
  //   image: '/assets/images/leftside-blog-img.png',
  //   category: 'Market Trends',
  //   author: 'Michael Brown',
  //   authorImage: '/assets/images/rightside-blog-img.jpg',
  //   date: '18 Jan 2024',
  // },
];

export default function BlogLatestArticles({
  variant = 'default',
}: {
  variant?: 'default' | 'detailed';
}) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleArticles = articles.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section className="py-16 px-4 md:px-10 bg-[#FFF6EC]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="mt-3 text-2xl md:text-4xl lg:text-4xl font-semibold text-[#1B1B1B] leading-tight">
            Agent Edge
          </h2>
          {/* <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleArticles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
              className="group rounded-2xl overflow-hidden max-w-xl"
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
                  <ArrowUpRight className="w-5 h-5 text-[#1B1B1B]" />
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


