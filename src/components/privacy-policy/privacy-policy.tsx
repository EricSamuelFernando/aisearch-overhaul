// import React from 'react'
// import { privacyTerms } from './policy-data'

// function PrivacyPolicy() {
//     return (
//         <div>
//             <div className='py-32 px-6 bg-[#F07639] text-white'>
//                 <p className='text-4xl font-bold text-center'>Privacy Policy for Grealty LLC DBA Snaphomz</p>

//             </div>
//             <div className='p-12'>
//                 <p><strong>Effective Date: </strong>{privacyTerms?.effectiveDate}</p>
//                 <p><strong>Last Updated: </strong>{privacyTerms?.lastUpdated}</p>
//                 <p className='py-12 text-md'>{privacyTerms?.description}</p>
//                 <div>
//                     {
//                         privacyTerms?.terms?.map((term: any, idx) => {
//                             return (
//                                 <div key={idx} className='py-6'>
//                                     <div className='flex gap-4 text-xl font-bold'>
//                                         <p>{idx + 1}.</p>
//                                         <p>{term?.title}</p>
//                                     </div>
//                                     <p className='pt-8 text-md'>{term?.description}</p>
//                                     {term.categories && term?.categories.map((category: any, index: any) => (
//                                         <div key={index}>
//                                             {category.category && <h2 className='font-bold py-8 pb-4'>{category.category}</h2>}
//                                             {category?.items?.map((item: any, idx: any) => (
//                                                 <div key={idx} className='pt-6'>
//                                                     <div className='flex items-center'>
//                                                         <h3 className='font-bold '>{idx + 1}. {item.type}:</h3>
//                                                         {item?.description && <span>{item?.description}</span>}
//                                                     </div>
//                                                     <ul style={{ listStyleType: 'disc', marginLeft: '12px', opacity: '50%', fontSize: '14px' }}>
//                                                         {item?.details?.map((detail: any, detailIdx: any) => (
//                                                             <li key={detailIdx}>{detail}</li>
//                                                         ))}
//                                                     </ul>
//                                                 </div>
//                                             ))
//                                             }
//                                         </div>
//                                     ))}
//                                 </div>
//                             )
//                         })
//                     }
//                 </div>
//             </div>

//         </div>
//     )
// }

// export default PrivacyPolicy


'use client';

import MainNavPages from '@/components/navbars/main-nav-pages';

export default function PrivacyPolicy() {
  return (
    <>
         <MainNavPages />
        {/* === Hero (dark) === */}
      <section className="bg-[#170800] text-white min-h-[600px] relative pt-12 -mt-24 overflow-hidden flex items-center justify-center">
  <div className="max-w-4xl mx-auto text-center mt-12">
            <p className="text-xs md:text-sm text-[#CEB28B] mb-5">Current as of October 2025</p>

            <h1 className="tracking-tight text-[40px] sm:text-[56px] md:text-[68px] font-semibold leading-none mb-5">
              Privacy <span className="font-light italic">Policy</span>
            </h1>

            <p className="text-[13px] sm:text-sm md:text-base text-[#E7E0D6]/90 leading-relaxed max-w-2xl mx-auto">
              Privacy isn&apos;t a checkbox for us; it&apos;s part of the design. This policy explains how we
              collect, use, and protect your information while helping you find your dream home.
              Because trust is the foundation of every great relationship — digital or not.
            </p>
          </div>
        </section>

        {/* Thin brand divider (blue) */}
        {/* <div className="h-[3px] w-full bg-[#2E90FA]" /> */}

        {/* === Body (light) — mirrored from T&C === */}
        <section className="bg-[#FAF0E6] py-20 md:py-28 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto space-y-14 md:space-y-16">
            {/* 1. Our Commitment */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">1. Our Commitment</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>Your privacy is foundational to the trust we build. <br/> At Snaphomz, we collect and process data only to improve your experience, never to
                  exploit it.</p>

              </div>
            </div>

            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />

            {/* 2. Information We Collect */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">2. Information We Collect</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>We collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Personal Information:</strong> Name, email, contact number, and login data.
                  </li>
                  <li>
                    <strong>Usage Information:</strong> Pages views, clicks, searches, and device details.
                  </li>
                  <li>
                    <strong>Transactional Data:</strong> Listing uploads, offers made, and loan integrations.
                  </li>
                  <li>
                    <strong>Communication Data:</strong> Chats, agent messages, and support queries.
                  </li>
                </ul>
              </div>
            </div>

            
            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />

            {/* 3. How We Use Your Data */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">3. How We Use Your Data</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>We use the information for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personalize your homebuying experience.</li>
                  <li>Improve our AI-powered matching and guidance.</li>
                  <li>Communicate updates, recommendations, or alerts.</li>
                  <li>Ensure security, prevent fraud, and maintain system performance.</li>
                </ul>
                <p className="mt-2">We do not sell your data.</p>
              </div>
            </div>


            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />
            {/* 4. Data Retention */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">4. Data Retention</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>
                  We retain your data only as long as necessary to provide our services or comply with
                  legal obligations.
                </p>
              </div>
            </div>

            
            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />

            {/* 5. Data Sharing */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">5. Data Sharing</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>We may share information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verified agents (only when you engage with them).</li>
                  <li>Technology vendors providing hosting, analytics, or payment solutions.</li>
                  <li>Partners allowed by direct confidentiality and data protection agreements.</li>
                </ul>
              </div>
            </div>

            
            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />

            {/* 6. Data Security */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">6. Data Security</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>
                  We use industry-grade encryption, secure controls, and regular audits to protect your data
                  from unauthorized access or misuse.
                </p>
              </div>
            </div>



            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />
            {/* 7. Your Rights */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">7. Your Rights</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>Depending on your region, you may:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access, correction, or deletion of your data.</li>
                  <li>Opt out of marketing communications.</li>
                  <li>Withdraw consent for marketing (does not affect core features).</li>
                </ul>
                <p className="mt-2">
                  Contact{' '}
                  <a href="mailto:privacy@snaphomz.com" className="text-[#373635] underline-offset-2 hover:underline">
                    <strong>privacy@snaphomz.com</strong>
                  </a>{' '}
                  to exercise these rights.
                </p>
              </div>
            </div>



            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />
            {/* 8. International Users */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">8. International Users</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>
                  If you access Snaphomz from outside the U.S., your data may be processed in the U.S.,
                  which may have different privacy laws than your country.
                </p>
              </div>
            </div>


            {/* Thin brand divider (blue) */}
            <div className="h-[1px] w-full bg-[#dadada]" />
            {/* 9. Updates */}
            <div>
              <h2 className="text-[22px] md:text-2xl font-semibold text-[#1F150F] mb-3">9. Updates</h2>
              <div className="text-[#4B4036] leading-relaxed space-y-4">
                <p>
                  We may update this policy to reflect legal, technical, or operational changes. Significant
                  changes will be announced via our website.
                </p>
              </div>
            </div>
          </div>
        </section>
     
    </>
  );
}
