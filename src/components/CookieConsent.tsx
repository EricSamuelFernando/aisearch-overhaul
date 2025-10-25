'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-12 left-4 right-4 md:right-auto w-[604px]  z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl p-6 relative">
        {/* Close button */}
        {/* <button
          onClick={declineCookies}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button> */}

        {/* Cookie illustration */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-gray-800 text-base font-semibold mb-2">
              Hi!
            </h3>
            <h2 className="text-gray-900 text-xl font-bold mb-3">
              We've got cookies
            </h2>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          We use cookies to keep Snaphomz running smoothly and to make your home-finding journey a little smarter.
        </p>

          </div>
          <div className="ml-4 flex-shrink-0">
            {/* Cookie character image */}
            <Image
              src="/assets/images/cookies-character.png"
              alt="Cookie character"
              width={160}
              height={160}
            />
          </div>
        </div>

      
        <div className="mb-4 border-1 border-zinc-500 rounded-xl p-3">
          <p className="text-gray-900 text-sm font-bold mb-3">
            We'd also like to use:
          </p>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="ml-3 text-gray-600 text-sm  leading-relaxed">
                Analytics cookies: to learn what helps you find homes faster
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="ml-3 text-gray-600 text-sm leading-relaxed">
                Experience cookies: to personalize listings and recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={declineCookies}
            className="flex-1 px-4 py-3 text-md font-bold text-orange-600 bg-white border-2 border-orange-500 rounded-xl hover:bg-orange-50 transition-colors duration-200"
          >
            No thanks, I'm on a data diet
          </button>
          <button
            onClick={acceptCookies}
            className="flex-1 px-4 py-3 text-md font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🍪 Yes, bake them all!
          </button>
        </div>
      </div>
    </div>
  );
}
