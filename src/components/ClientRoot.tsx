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
