'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { articles as allArticles } from '@/data/blogs';

const EXCLUDED_IDS = new Set(['featured', '1', '2', '3', '4']);
const articles = allArticles.filter((a) => !EXCLUDED_IDS.has(a.id));

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

                {/* Divider (DETAILED only) */}
                {variant === 'detailed' && (
                  <div className="w-full h-px bg-[#EAECF0]" />
                )}

              </div>
            </Link>

          ))}
        </div>
      </div>
    </section>
  );
}
