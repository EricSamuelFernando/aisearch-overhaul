'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function GetReadyForCollege({
  headingClassName,
}: {
  headingClassName?: string;
}) {
  return (
    <section className="home-college-section w-full bg-[#FFF6EC] py-6 sm:py-8 lg:py-10 min-h-[560px]">
      <div className="home-college-container mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-auto lg:min-h-[560px] gap-0">

        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 lg:py-10">
          <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F1F1F]', headingClassName)}>
            Get Ready For <span className="font-light">College</span>
          </h2>

          <p className="mt-3 sm:mt-4 max-w-md xl:max-w-lg text-xs sm:text-sm md:text-base xl:text-[1.125rem] text-[#6F6F6F] leading-relaxed">
            SnapGrad is your personalized guide to the college journey,
            helping students seamlessly transition from high school to
            higher education.
          </p>

          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base text-[#1F1F1F]">
            {/*<p className="underline cursor-pointer w-fit font-unbounded font-weight-600 font-semibold">
              Compare Colleges
            </p>*/}

            <a
              href="https://snapgrad.snaphomz.com/?lat=0&lng=0&label=&source=&updatedAt=&utm_source=nav_bar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Compare High Schools
            </a>
          </div>

        </div>

        {/* RIGHT VISUAL */}
        <div className="relative bg-[#E87033] flex items-center justify-center overflow-hidden py-8 sm:py-10 lg:py-0 px-4 sm:px-6">

          {/* Vertical divider */}
          <div className="absolute left-0 top-0 h-full w-[1px] bg-[#B9B9B9] hidden lg:block" />

          {/* Cards container */}
          <div className="relative w-full max-w-sm lg:max-w-md xl:max-w-xl px-2 sm:px-0">

            {/* BACK CARD (NEW YORK) */}
            <div
              className="
                absolute top-8 sm:top-12 lg:top-16 right-0 z-10 w-full
                bg-white rounded-xl sm:rounded-2xl
                px-4 sm:px-6 py-3 sm:py-4
                shadow-lg
                transform rotate-[2deg]
                min-h-[180px] sm:min-h-[210px] xl:min-h-[240px]
                hidden sm:block
              "
            >
              <CardContent location="New York City Independent High, TX, 254" />
            </div>

            {/* FRONT CARD (TEXAS) */}
            <div
              className="
                relative z-20
                mt-4 sm:mt-8 lg:mt-18
                w-full bg-white rounded-xl sm:rounded-2xl
                px-4 sm:px-6 py-3 sm:py-4
                shadow-xl
                transform sm:rotate-[7deg]
                min-h-[180px] sm:min-h-[210px] xl:min-h-[240px]
              "
            >
              <CardContent withImage />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Card Content ---------------- */

function CardContent({
  withImage = false,
  location = 'Texas City Independent High, TX, 254',
}: {
  withImage?: boolean;
  location?: string;
}) {
  return (
    <div>
      {/* Header */}
      <div className="relative">
        <h2 className="font-bold text-xs sm:text-sm md:text-base text-[#1F1F1F] pr-12 sm:pr-16">
          Noble Charter High School
        </h2>

        {/* Right visuals */}
        {withImage && (
          <>
            {/* Floating round image */}
            <div className="absolute -top-8 sm:-top-10 right-6 sm:right-10 w-16 sm:w-24 h-16 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
              <Image
                src="/assets/images/buyer-get-ready.jpg"
                alt="School"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Heart icon – fixed top right */}
            <button
              aria-label="Save school"
              className="absolute top-0 right-0"
            >
              <Image
                src="/assets/images/icons_heart.png"
                alt="Save"
                width={24}
                height={24}
                className="sm:w-8 sm:h-8"
              />
            </button>
          </>
        )}

      </div>

      {/* Pills */}
      <div className="flex gap-2 mt-2 sm:mt-3 text-[10px] sm:text-xs text-black">
        <span className="px-2 sm:px-3 py-1 border border-black rounded-md">Public</span>
        <span className="px-2 sm:px-3 py-1 border border-black rounded-md">Highschool</span>
      </div>

      {/* Ratings */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4 text-[10px] sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#E8560C] text-white flex items-center justify-center text-[8px] sm:text-xs font-semibold">
            6/10
          </span>
          <span className="text-black font-semibold">
            SnapCollege Rating
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#E8560C] text-white flex items-center justify-center text-[8px] sm:text-xs font-semibold">
            10
          </span>
          <span className="text-black font-semibold">
            College Readiness
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#B9B9B9] my-2 sm:my-3" />

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-[9px] sm:text-xs text-[#555555]">
        <span className="break-words">{location}</span>
        <span className="flex items-center gap-1 text-[#1F1F1F] whitespace-nowrap">
          ⭐ 4.9 <strong>300 Reviews</strong>
        </span>
      </div>
    </div>
  );
}