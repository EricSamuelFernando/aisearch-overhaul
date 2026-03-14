'use client';

import MainNavPages from '@/components/navbars/main-nav-pages';
import Footer from '@/components/shared/footer';

export default function TermsAndConditions() {
  return (
    <>
      {/* If you want the nav fixed, uncomment this */}
      {/* <div className="fixed w-full z-50 top-0 left-0">
        <MainNavPages />
      </div> */}
      <MainNavPages />
      {/* === Hero (dark) === */}
      <section className="bg-[#170800] text-white min-h-[600px] relative pt-12 -mt-24 overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-xs md:text-sm text-[#CEB28B] mb-5">Current as of March 2026</p>

          <h1 className="tracking-tight text-[40px] sm:text-[56px] md:text-[68px] font-semibold leading-none mb-5">
            Terms and <span className="font-light italic">conditions</span>
          </h1>

          <p className="text-[13px] sm:text-sm md:text-base text-[#E7E0D6]/90 leading-relaxed max-w-2xl mx-auto">
            We believe transparency builds trust, so here’s everything you need to know about
            using Snaphomz. No surprises, just clarity on how our platform works, what we promise,
            and what we expect in return.
          </p>
        </div>
      </section>


      {/* Thin brand divider (blue) exactly under hero */}
      {/* <div className="h-[3px] w-full bg-[#2E90FA]" /> */}

      {/* === Body (light) === */}
      <section className="bg-[#FAF0E6] py-20 md:py-28 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-14 md:space-y-16">
          {/* 1 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">1. Introduction</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                Welcome to Snaphomz — a digital platform designed to make real estate buying, selling,
                and management seamless through AI-guided experiences.
              </p>
              <p>
                These Terms and Conditions ("Terms") govern your access to and use of Snaphomz&apos;s
                website, mobile applications, and services ("Services").
              </p>
              <p>
                By accessing or using this platform, you confirm that you have read, understood, and agreed to be bound
                by these Terms.
              </p>
              <p>If you do not agree, please do not use our Services.</p>
            </div>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">2. Eligibility</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                You must be at least 18 years old and capable of entering a binding agreement to use our
                Services.
              </p>
              <p>
                If you use Snaphomz on behalf of an organization, you represent that you have authority to
                bind that entity to these Terms.
              </p>
            </div>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">3. Account Creation and Security</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>To access certain features, you may need to create an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>Notify us immediately at support@snaphomz.com if you suspect unauthorized access.</li>
                <li>Snaphomz reserves the right to suspend or terminate accounts for violation of these Terms.</li>
              </ul>
            </div>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">4. Platform Use</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                You agree to use Snaphomz solely for lawful purposes related to real estate discovery,
                communication, and transactions.
              </p>
              <p className="font-semibold text-[#2C211A]">You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copy, modify, or distribute our content without written consent.</li>
                <li>Attempt to hack, scrape, or reverse-engineer our platform or related systems.</li>
                <li>Misrepresent property details, identity, or affiliations.</li>
              </ul>
              <p className="mt-2">
                Snaphomz retains the right to restrict or suspend your access if you misuse the platform.
              </p>
            </div>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">5. Content Ownership</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                All materials — including visuals, algorithms, interfaces, and copy — are protected by
                intellectual property laws and belong to Snaphomz Inc. or our licensors.
              </p>
              <p>
                You retain ownership of any data or content you upload (e.g., listings or photos), but grant
                Snaphomz a license to display and process it for our Services.
              </p>
            </div>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">6. Payments and Transactions</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>If using premium features, subscription plans, agent services, or marketplace integrations:</p>
              <p>
                All payments are made when services are processed via trusted third parties, and Snaphomz does not
                store sensitive payment details.
              </p>
              <p>Transaction outcomes (loan approvals, bids, or offers) are not guaranteed.</p>
            </div>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">7. Third-Party Links</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Snaphomz may contain links to external sites (mortgage partners, agents, or service providers).</p>
              <p>
                We do not control or endorse these sites and are not responsible for their content or data
                handling practices.
              </p>
            </div>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">8. Limitation of Liability</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Snaphomz is provided &quot;as is.&quot;</p>
              <p>We make no guarantees regarding availability, accuracy, or results.</p>
              <p>
                To the fullest extent allowed by law, Snaphomz shall not be liable for indirect, incidental, or
                consequential damages resulting from your use of our platform.
              </p>
            </div>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">9. Termination</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                We may suspend or terminate your access at any time for violation of these Terms or
                misuse of the platform.
              </p>
            </div>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">10. Governing Law</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                These Terms are governed by the laws of the State of Delaware, USA, unless otherwise
                required by local law.
              </p>
            </div>
          </div>

          {/* 11 */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">11. Contact</h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                For any inquiries regarding these Terms, reach us at{' '}
                <a href="mailto:support@snaphomz.com">
                  support@snaphomz.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}