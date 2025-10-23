// src/components/ClientRoot.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NextTopLoader from 'nextjs-toploader';
import { Providers } from '../app/providers';

// dynamically import so it only runs in the browser
const CookieConsent = dynamic(
  () => import('react-cookie-consent'),
  { ssr: false }
);

export function ClientRoot({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a spinner until the client has mounted
  if (!mounted)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );

  return (
    <>
      <NextTopLoader
        color="#F07639"
        showSpinner={false}
        showForHashAnchor={false}
      />

      <CookieConsent
        location="bottom"
        buttonText="Got it!"
        cookieName="user-consent"
        style={{
          background: '#2B373B',
          color: '#fff',
          textAlign: 'center',
          fontSize: '14px',
        }}
        buttonStyle={{
          background: '#4e8eff',
          color: '#fff',
          fontSize: '13px',
          padding: '10px 20px',
          borderRadius: '5px',
        }}
        expires={150}
      >
        This website uses cookies to enhance the user experience. By using this site,
        you agree to our cookie policy.
      </CookieConsent>

      <Providers>{children}</Providers>
    </>
  );
}
