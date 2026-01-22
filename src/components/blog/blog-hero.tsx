'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Home,
  DollarSign,
  TrendingUp,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function BlogHero() {
  const [activeCategory, setActiveCategory] = useState('All Articles');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative w-full bg-[#FFF6EC] overflow-hidden">

      {/* HERO IMAGE */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] md:h-[70vh] lg:h-[90vh]">
        <Image
          src="/assets/images/blog-banner.png"
          alt="Real Estate Insights"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* CONTENT */}
      <div className="w-full py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* FEATURE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start mb-12">

            {/* LEFT FEATURE */}
            <div className="relative max-w-xl">
              <Link href="/blog/featured">
                <ArrowUpRight className="absolute top-0 right-0 w-5 h-5 text-[#1B1B1B]" />
              </Link>

              <span className="text-xs sm:text-sm font-semibold text-[#F07639]">
                Customer Success
              </span>

              <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#1B1B1B] leading-tight">
                5 Ways Technology is Changing How Nigerians Buy Homes
              </h1>

              <p className="mt-4 text-sm sm:text-base text-[#545454] leading-relaxed">
                Real estate isn’t just bricks and land anymore — it’s algorithms,
                virtual tours, and instant connections. Here’s how tech is reshaping
                the home-buying journey.
              </p>

              <Link
                href="/blog/real-estate-insights"
                className="mt-6 flex items-center gap-3"
              >
                <Image
                  src="/assets/images/blog_profile.png"
                  alt="Alec Whitten"
                  width={40}
                  height={40}
                  className="rounded-full object-cover sm:w-12 sm:h-12"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1B1B1B]">
                    Alec Whitten
                  </p>
                  <p className="text-xs sm:text-sm text-[#6B6B6B]">
                    17 Jan 2022
                  </p>
                </div>
              </Link>
            </div>

            {/* RIGHT FEATURE */}
            <Link
              href="/blog/featured"
              className="group rounded-2xl overflow-hidden max-w-xl"
            >
              <div className="relative w-full h-[220px] sm:h-[260px] md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden">
                <Image
                  src="/assets/images/blog_insight.png"
                  alt="Modern Home"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                <span className="text-xs sm:text-sm font-semibold text-[#F07639]">
                  Customer Success
                </span>

                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1B1B1B] leading-snug">
                    Selling in a Slow Market? Here’s What Actually Works
                  </h2>
                  <ArrowUpRight className="w-5 h-5 text-[#1B1B1B] shrink-0" />
                </div>

                <p className="text-sm sm:text-base text-[#575757] leading-relaxed">
                  From smart pricing to better visuals, here’s how to stay ahead
                  when the market cools down.
                </p>
              </div>

              <div className="px-3 sm:px-4 pb-4 flex items-center gap-3">
                <Image
                  src="/assets/images/blog_profile.png"
                  alt="Alec Whitten"
                  width={40}
                  height={40}
                  className="rounded-full object-cover sm:w-12 sm:h-12"
                />
                <div>
                  <p className="text-sm font-semibold text-[#1B1B1B]">
                    Alec Whitten
                  </p>
                  <p className="text-xs sm:text-sm text-[#6B6B6B]">
                    17 Jan 2022
                  </p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
