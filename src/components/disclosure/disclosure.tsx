'use client';

import MainNavPages from '@/components/navbars/main-nav-pages';
import Footer from '@/components/shared/footer';

export default function Disclosure() {
  return (
    <>

      <MainNavPages />
      <section className="bg-[#170800] text-white min-h-[600px] relative pt-12 -mt-24 overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-xs md:text-sm text-[#CEB28B] mb-5">Current as of March 2026</p>

          <h1 className="tracking-tight text-[40px] sm:text-[56px] md:text-[68px] font-semibold leading-none mb-5">
           Disclosure
          </h1>

          <p className="text-[13px] sm:text-sm md:text-base text-[#E7E0D6]/90 leading-relaxed max-w-2xl mx-auto">
            This disclosure outlines what we earn, how we work with partners, and how that affects (or doesn’t affect) you.
          </p>
        </div>
      </section>

      <section className="bg-[#FAF0E6] py-20 md:py-28 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-14 md:space-y-16">

          {/* 1. What Are Cookies? */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              1. Transparency Promise
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                Snaphomz believes trust begins with honesty. When we feature listings, agents, or services, we disclose partnerships or affiliate relationships clearly.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />


          {/* 2. How Snaphomz Uses Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
             2. Affiliate & Advertising Disclosure
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Some listings or partner tools may generate referral fees or commissions for Snaphomz. This never affects search ranking, user visibility, or neutrality of information.</p>
              
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />

          {/* 3. Types of Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              3. Risk Disclosure
            </h2>

            <div className="text-[#4B4036] leading-relaxed space-y-6">
               <p>Real estate carries risks (market changes, interest rates, or legal disputes). Snaphomz provides tools and guidance, not financial or legal advice.</p>
            </div>
          </div>
          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />


          {/* 4. Managing Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              4. AI & Automation Transparency
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                Snaphomz uses AI to enhance search accuracy and workflow guidance. AI insights are advisory, not definitive — always validate property details with licensed professionals.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />

          {/* 5. Our Promise */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              5. Contact
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>For disclosures or transparency concerns, contact support@snaphomz.com.</p>
            
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}