'use client';

import MainNavPages from '@/components/navbars/main-nav-pages';

export default function OfferTerms() {
  return (
    <>

      <MainNavPages />
      <section className="bg-[#170800] text-white min-h-[600px] relative pt-12 -mt-24 overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-xs md:text-sm text-[#CEB28B] mb-5">Current as of October 2025</p>

          <h1 className="tracking-tight text-[40px] sm:text-[56px] md:text-[68px] font-semibold leading-none mb-5">
            Offer <span className="font-light italic">Terms</span>
          </h1>

          <p className="text-[13px] sm:text-sm md:text-base text-[#E7E0D6]/90 leading-relaxed max-w-2xl mx-auto">
            These terms explain how offers, bids, and promotions work on Snaphomz — so you can make confident decisions at every step of your journey.
          </p>
        </div>
      </section>
      <section className="bg-[#FAF0E6] py-20 md:py-28 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-14 md:space-y-16" >
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              1. Eligibility
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
               Participation requires a verified Snaphomz account. Offers may be restricted by region, transaction type, or time frame.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />


          {/* 2. How Snaphomz Uses Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
             2. Redemption
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                Each Offer has specific instructions for eligibility, deadlines, and redemption methods. Snaphomz is not responsible for incomplete or late submissions.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />

          {/* 3. Types of Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              3. Non-Transferability
            </h2>

            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Offers cannot be sold, transferred, exchanged, or converted to cash.              </p>
            </div>
          </div>
          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
             4. Modification or Termination
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                Snaphomz may modify, suspend, or terminate Offers at any time. Updated terms will always be visible on the Offer page.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />

          {/* 5. Our Promise */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              5. Disclaimers
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Participation in any Offer does not guarantee approval, success, or property acquisition. Offers are intended for promotional engagement only.</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
