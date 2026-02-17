// 'use client';

// import React, { useEffect, useState } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';

// import MainNav from '@/components/navbars/main-nav';
// import Footer from '@/components/shared/footer';
// import { useTokenLoginMutation } from '@/hooks/api/auth/useUserAuthApi';

// type Props = {
//   children: React.ReactNode;
// };

// function MainLayout({ children }: Readonly<Props>) {
//   const pathname = usePathname();
//   const searchParams = useSearchParams()
//   const { mutate: loginWithToken } = useTokenLoginMutation();
//   const [location, setLocation] = useState({
//     latitude:0,
//     longitude:0
//   });

//   useEffect(() => {
//     const token = searchParams.get('token');
//     if (token) {
//       loginWithToken();
//     }
//   }, []);
 
// // useEffect(() => {
// //   if('geolocation' in navigator) {
// //     // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
// //     navigator.geolocation.getCurrentPosition(({ coords }) => {
// //         const { latitude, longitude } = coords;
// //         console.log(coords)
// //         setLocation({ latitude, longitude });
// //     })
// // }
// // },[])
// // console.log(location)
//   return (
//     <>
//       <MainNav />
//       <main>{children}</main>
//       {typeof pathname === 'string' &&
//       ['browse', 'preview'].some((path) => pathname.includes(path)) ? null : (
//         <Footer />
//       )}
//     </>
//   );
// }

// export { MainLayout };


'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import MainNav from '@/components/navbars/main-nav';
import Footer from '@/components/shared/footer';
import { useTokenLoginMutation } from '@/hooks/api/auth/useUserAuthApi';
import PropertyPreferenceModal from '@/components/modals/property-preference-modal';
import { useAuth } from '@/shared/hooks/useAuth';
import { useGetPropertyPreference } from '@/hooks/api/property/usePropertyApi';

type Props = {
  children: React.ReactNode;
};

function MainLayout({ children }: Readonly<Props>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate: loginWithToken } = useTokenLoginMutation();
  const { user, isLoggedIn } = useAuth();
  const { getPropertyPreferenceFromAI } = useGetPropertyPreference(user?.email);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const hasPromptedRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken();
    }
  }, []);

  // Reset prompt flag when user changes (logout/login) and refetch AI preferences
  useEffect(() => {
    if (lastUserIdRef.current !== user?.id) {
      console.log('[MainLayout] User changed, resetting prompt flag');
      hasPromptedRef.current = false;
      lastUserIdRef.current = user?.id;

      if (isLoggedIn && user?.account_type?.toLowerCase() === 'buyer' && user?.email) {
        console.log('[MainLayout] Refetching AI preferences for new user');
        getPropertyPreferenceFromAI.refetch?.();
      }
    }
  }, [user?.id, isLoggedIn, user?.account_type, user?.email, getPropertyPreferenceFromAI]);

  // Check if modal should show — ONLY using AI API
  useEffect(() => {
    if (hasPromptedRef.current) return;
    if (!isLoggedIn) return;
    if (user?.account_type?.toLowerCase() !== 'buyer') return;

    // Wait for AI query to finish loading
    if (getPropertyPreferenceFromAI.isLoading) return;

    // Check AI API data
    const aiResponse = getPropertyPreferenceFromAI.data;
    const aiPref = aiResponse?.preference;

    if (aiPref && typeof aiPref === 'object') {
      const hasType = !!(aiPref.mls_type || aiPref.propertyType || aiPref.property_sub_type || aiPref.property_type);
      const hasLocation = !!(aiPref.city || aiPref.preferredPropertyAddress || aiPref.location || aiPref.address || aiPref.state);
      const hasPrice = !!(aiPref.listing_price_max || aiPref.spendAmount?.max || aiPref.budget_max || aiPref.price_max || aiPref.listing_price_min);

      if (hasType || hasLocation || hasPrice) {
        console.log('[MainLayout] AI preference data exists — not showing modal');
        hasPromptedRef.current = true;
        return;
      }
    }

    // AI has no preference data — show modal
    console.log('[MainLayout] No AI preference data found — showing modal');
    setShowPreferenceModal(true);
    hasPromptedRef.current = true;
  }, [
    getPropertyPreferenceFromAI.data,
    getPropertyPreferenceFromAI.isLoading,
    getPropertyPreferenceFromAI.isError,
    isLoggedIn,
    user?.account_type,
    pathname,
  ]);

  // Check if the pathname includes any routes where you want to hide the header and footer
  const shouldHideHeaderFooter = ['sell', 'agents', 'company', 'home'].some(
    (path) => pathname.includes(path),
  );

  return (
    <>
      <PropertyPreferenceModal
        isOpen={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        onComplete={() => {
          setShowPreferenceModal(false);
          getPropertyPreferenceFromAI.refetch?.();
        }}
      />
      {/* Conditionally render MainNav (Header) based on the route */}
      {!shouldHideHeaderFooter && <MainNav />}

      <main>{children}</main>

      {/* Conditionally render Footer based on the route */}
      {typeof pathname === 'string' &&
      ['browse', 'preview'].some((path) => pathname.includes(path)) ? null : (
        <Footer />
      )}
    </>
  );
}

export { MainLayout };
