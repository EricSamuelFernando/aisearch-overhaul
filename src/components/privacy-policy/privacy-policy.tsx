import MainNavPages from '@/components/navbars/main-nav-pages';
import Footer from '@/components/shared/footer';
import React from 'react';
import { privacyTerms } from './policy-data';

function PrivacyPolicy() {
  return (
    <>
      {/* <MainNavPages /> */}

      {/* Hero */}
      <section className="bg-[#170800] text-white min-h-[600px] relative pt-12 -mt-24 overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-xs md:text-sm text-[#CEB28B] mb-5">Current as of March 2026</p>

          <h1 className="tracking-tight text-[40px] sm:text-[56px] md:text-[68px] font-semibold leading-none mb-5">
            Privacy <span className="font-light italic">Policy</span>
          </h1>

          <p className="text-[13px] sm:text-sm md:text-base text-[#E7E0D6]/90 leading-relaxed max-w-2xl mx-auto">
            Privacy isn&apos;t a checkbox for us it&apos;s part of the design. This policy explains how we
            collect, use, and protect your information while helping you find your dream home.
            Because trust is the foundation of every great relationship — digital or not.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#FAF0E6] py-20 md:py-28 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-14 md:space-y-16">
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              1. Our Commitment
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Your privacy is foundational to the trust we build.</p>
              <p>
                At Snaphomz, we collect and process data only to improve your experience, never to
                exploit it.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              2. Information We Collect
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>We collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold text-[#2C211A]">Personal Information:</span> Name,
                  email, contact, location, and login data.
                </li>
                <li>
                  <span className="font-semibold text-[#2C211A]">Usage Information:</span> Pages
                  visited, clicks, searches, and device details.
                </li>
                <li>
                  <span className="font-semibold text-[#2C211A]">Transactional Data:</span> Listings
                  viewed, offers made, and loan interactions.
                </li>
                <li>
                  <span className="font-semibold text-[#2C211A]">Communication Data:</span> Chats,
                  agent messages, and support requests.
                </li>
              </ul>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              3. How We Use Your Data
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>We use this information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personalize your homebuying experience.</li>
                <li>Improve our AI-powered matching and guidance.</li>
                <li>Communicate updates, recommendations, or alerts.</li>
                <li>Ensure security, prevent fraud, and maintain system performance.</li>
              </ul>
              <p>We do not sell your data.</p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              4. Data Retention
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                We retain your data only for as long as necessary to provide our services or comply
                with legal obligations.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              5. Data Sharing
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>We may share information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verified partners (agents, loan officers, concierge providers).</li>
                <li>Technology vendors providing hosting, analytics, or payment solutions.</li>
              </ul>
              <p>
                All partners adhere to strict confidentiality and data protection agreements.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              6. Data Security
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                We use industry-grade encryption, access controls, and regular audits to protect your
                data from unauthorized access or misuse.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              7. Your Rights
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Depending on your region, you may:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access, correction, or deletion of your data.</li>
                <li>Withdraw consent for marketing communications.</li>
                <li>Request a copy of your data (portability).</li>
              </ul>
              <p>
                Contact <span className="font-semibold text-[#2C211A]">support@snaphomz.com</span> to
                exercise these rights.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              8. International Users
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                If you access Snaphomz from outside the U.S., your data may be processed in the U.S.,
                which may have different privacy laws than your country.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#dadada]" />

          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              9. Updates
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                We may update this policy to reflect legal, technical, or operational changes.
                Significant updates will be announced on our website.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer /> */}
    </>
  );
}

export default PrivacyPolicy;
