'use client';

import Image from 'next/image';

export default function GetReadyForCollege() {
  return (
    <section className="w-full bg-[#FFF6EC] py-8 sm:py-10 lg:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">

        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center border border-[#B3B1B0] px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1F1F1F]">
            Get Ready For <span className="font-light">College</span>
          </h2>

          <p className="mt-4 max-w-md text-sm sm:text-base text-[#6F6F6F]">
            SnapGrad is your personalized guide to the college journey,
            helping students seamlessly transition from high school to
            higher education.
          </p>

          <div className="mt-8 space-y-4 text-sm font-bold text-[#1F1F1F]">
            <p className="underline cursor-pointer w-fit">Compare Colleges</p>
            <a 
              href="https://snapgrad.snaphomz.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline cursor-pointer w-fit block"
            >
              Compare High Schools
            </a>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="relative bg-[#E87033] flex items-center justify-center overflow-hidden">

          {/* Vertical divider */}
          <div className="absolute left-0 top-0 h-full w-[1px] bg-[#B9B9B9] hidden lg:block" />

          {/* Cards container */}
          <div className="relative w-full max-w-md px-4 sm:px-0">

            {/* BACK CARD (NEW YORK) */}
            <div
              className="
                absolute top-16 right-0 z-10 w-full
                bg-white rounded-2xl
                px-6 py-4
                shadow-lg
                transform rotate-[2deg]
                min-h-[210px]
                hidden sm:block
              "
            >
              <CardContent location="New York City Independent High, TX, 254" />
            </div>

            {/* FRONT CARD (TEXAS) */}
            <div
              className="
                relative z-20
                mt-8 sm:mt-18
                w-full bg-white rounded-2xl
                px-6 py-4
                shadow-xl
                transform sm:rotate-[7deg]
                min-h-[210px]
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
        <h2 className="font-bold text-sm text-[#1F1F1F] pr-16">
          Noble Charter High School
        </h2>

        {/* Right visuals */}
        {withImage && (
          <>
            {/* Floating round image */}
            <div className="absolute -top-10 right-10 w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg">
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
                width={32}
                height={32}
              />
            </button>
          </>
        )}

      </div>

      {/* Pills */}
      <div className="flex gap-2 mt-3 text-xs text-black">
        <span className="px-3 py-1 border border-black rounded-md">Public</span>
        <span className="px-3 py-1 border border-black rounded-md">Highschool</span>
      </div>

      {/* Ratings */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#E8560C] text-white flex items-center justify-center text-xs font-semibold">
            6/10
          </span>
          <span className="text-black font-semibold">
            SnapCollege Rating
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#E8560C] text-white flex items-center justify-center text-xs font-semibold">
            10
          </span>
          <span className="text-black font-semibold">
            College Readiness
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#B9B9B9] my-3" />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[#555555]">
        <span>{location}</span>
        <span className="flex items-center gap-1 text-[#1F1F1F]">
          ⭐ 4.9 <strong>300 Reviews</strong>
        </span>
      </div>
    </div>
  );
}
