'use client';

import MainNavPages from '@/components/navbars/main-nav-pages';
import Footer from '@/components/shared/footer';

export default function CookiePolicy() {
  return (
    <>

      <MainNavPages />
      <section className="bg-[#170800] text-white min-h-[600px] relative pt-12 -mt-24 overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <p className="text-xs md:text-sm text-[#CEB28B] mb-5">Current as of October 2025</p>

          <h1 className="tracking-tight text-[40px] sm:text-[56px] md:text-[68px] font-semibold leading-none mb-5">
           🍪 Cookie <span className="font-light italic">Policy</span>
          </h1>

          <p className="text-[13px] sm:text-sm md:text-base text-[#E7E0D6]/90 leading-relaxed max-w-2xl mx-auto">
            Our cookies don&apos;t crumble — they help the site remember you, improve performance,
            and keep your experience smooth.
          </p>
        </div>
      </section>

      {/* Thin brand divider */}
      {/* <div className="h-[3px] w-full bg-[#2E90FA]" /> */}

      {/* === Body (light) — identical rhythm/colors to Terms/Privacy === */}
      <section className="bg-[#FAF0E6] py-20 md:py-28 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-14 md:space-y-16">

          {/* 1. What Are Cookies? */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              1. What Are Cookies?
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                Cookies are small text files stored on your device to help websites remember your preferences
                and improve performance.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />


          {/* 2. How Snaphomz Uses Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              2. How Snaphomz Uses Cookies
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you logged in securely.</li>
                <li>Save your preferences and progress.</li>
                <li>Analyze performance to make our AI smarter.</li>
                <li>Personalize recommendations and search results (with your consent).</li>
              </ul>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />

          {/* 3. Types of Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              3. Types of Cookies
            </h2>

            <div className="text-[#4B4036] leading-relaxed space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="text-left text-[13px] md:text-sm font-semibold text-[#2C211A] pb-3">
                        Type
                      </th>
                      <th className="text-left text-[13px] md:text-sm font-semibold text-[#2C211A] pb-3">
                        Purpose
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-[#4B4036]">
                    {/* Row 1 */}
                    <tr className="border-t border-[#E8DCCB]">
                      <td className="py-4 pr-6 align-top font-semibold text-[#2C211A]">
                        Essential
                      </td>
                      <td className="py-4 align-top max-w-[60ch]">
                        Enable core functions like login and
                        navigation.
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="border-t border-[#E8DCCB]">
                      <td className="py-4 pr-6 align-top font-semibold text-[#2C211A]">
                        Performance
                      </td>
                      <td className="py-4 align-top max-w-[60ch]">
                        Measure usage, load times, and errors.
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="border-t border-[#E8DCCB]">
                      <td className="py-4 pr-6 align-top font-semibold text-[#2C211A]">
                        Functional
                      </td>
                      <td className="py-4 align-top max-w-[60ch]">
                        Remember preferences like search filters or
                        location.
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="border-t border-[#E8DCCB]">
                      <td className="py-4 pr-6 align-top font-semibold text-[#2C211A]">
                        Analytics
                      </td>
                      <td className="py-4 align-top max-w-[60ch]">
                        Help our AI learn what matters most to users.
                      </td>
                    </tr>

                    {/* Row 5 */}
                    <tr className="border-t border-b border-[#E8DCCB]">
                      <td className="py-4 pr-6 align-top font-semibold text-[#2C211A]">
                        Marketing
                      </td>
                      <td className="py-4 align-top max-w-[60ch]">
                        Display relevant offers based on your journey
                        (opt-in only).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />


          {/* 4. Managing Cookies */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              4. Managing Cookies
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>
                You can control cookie preferences in your browser or use our Cookie Settings panel to
                enable or disable non-essential cookies.
              </p>
            </div>
          </div>

          {/* Thin brand divider (blue) */}
          <div className="h-[1px] w-full bg-[#dadada]" />

          {/* 5. Our Promise */}
          <div>
            <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">
              5. Our Promise
            </h2>
            <div className="text-[#4B4036] leading-relaxed space-y-4">
              <p>Our favorite cookies help people find homes — not follow them around.</p>
              <p>
                For questions, contact{' '}
                <a
                  href="mailto:cookies@snaphomz.com"
                  className="text-[#373635] underline-offset-2 hover:underline"
                >
                  <strong>cookies@snaphomz.com</strong>
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