// src/components/ClientRoot.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import NextTopLoader from 'nextjs-toploader';
import CookieConsent from 'react-cookie-consent';
import { Providers } from '../app/providers';

export function ClientRoot({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // only render after hydration, so cloudinary / maps scripts don’t SSR-crash
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <NextTopLoader
        color="#F07639"
        showSpinner={false}
        showForHashAnchor={false}
      />

      <CookieConsent
        location="bottom"
        buttonText="Accept Cookies"
        declineButtonText="Not Now"
        enableDeclineButton
        disableStyles
        cookieName="user-consent"
        containerClasses="fixed bottom-3 left-1/2 z-[120] w-[calc(100vw-16px)] max-w-5xl -translate-x-1/2 rounded-2xl border border-[#5A2B13] bg-[#170800]/95 px-4 py-3 shadow-2xl backdrop-blur-sm sm:bottom-5 sm:w-[calc(100vw-40px)] sm:px-5 sm:py-4"
        contentClasses="text-[#F7EDE6] text-xs leading-relaxed sm:text-sm"
        buttonWrapperClasses="mt-3 flex w-full flex-col-reverse gap-2 sm:mt-4 sm:w-auto sm:flex-row sm:justify-end"
        buttonClasses="w-full sm:w-auto rounded-full bg-[#F07639] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#de6830]"
        declineButtonClasses="w-full sm:w-auto rounded-full border border-[#7A3A1C] bg-transparent px-5 py-2 text-sm font-semibold text-[#F7EDE6] transition-colors hover:bg-[#2A1208]"
        expires={150}
      >
        <div className="flex flex-col gap-1">
          <p className="font-medium text-[#FFF7F2]">Cookie Preferences</p>
          <p>
            We use cookies to improve your experience and platform performance.
            By continuing, you agree to our{' '}
            <a href="/cookie-policy" className="font-semibold text-[#F8B58E] underline underline-offset-2 hover:text-[#FFD2B7]">
              Cookie Policy
            </a>.
          </p>
        </div>
      </CookieConsent>

      <Providers>{children}</Providers>
    </>
  );
}
