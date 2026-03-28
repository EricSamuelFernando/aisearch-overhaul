'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function BlogHero() {

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
      <div className="w-full py- sm:py-">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* FEATURE GRID */}
          <div className="flex justify-center mb-12">

            {/* RIGHT FEATURE */}
            <Link
              href="/blog/featured"
              className="group rounded-2xl overflow-hidden max-w-xl hidden"
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
