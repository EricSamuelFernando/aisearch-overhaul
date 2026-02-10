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
import { useGetPropertyPreference, useUpdatePropertyPreference } from '@/hooks/api/property/usePropertyApi';

type Props = {
  children: React.ReactNode;
};

function MainLayout({ children }: Readonly<Props>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate: loginWithToken } = useTokenLoginMutation();
  const { user, isLoggedIn } = useAuth();
  const { getPropertyPreferenceFromDB, getPropertyPreferenceFromAI } = useGetPropertyPreference(user?.email);
  const { updatePropertyPreference } = useUpdatePropertyPreference(user?.email);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const hasPromptedRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);
  const syncedAIRef = useRef(false);
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

  // Reset prompt flag when user changes (logout/login) and refetch preferences
  useEffect(() => {
    if (lastUserIdRef.current !== user?.id) {
      console.log('[MainLayout PropertyPreferenceModal] User changed, resetting prompt flag');
      hasPromptedRef.current = false;
      syncedAIRef.current = false;
      lastUserIdRef.current = user?.id;
      
      // Refetch preferences when user logs in
      if (isLoggedIn && user?.account_type?.toLowerCase() === 'buyer' && user?.email) {
        console.log('[MainLayout PropertyPreferenceModal] Refetching preferences for new user');
        getPropertyPreferenceFromDB.refetch?.();
        getPropertyPreferenceFromAI.refetch?.();
      }
    }
  }, [user?.id, isLoggedIn, user?.account_type, user?.email, getPropertyPreferenceFromDB, getPropertyPreferenceFromAI]);

  // Sync AI API data to GraphQL DB if GraphQL is empty/incomplete but AI has complete data
  useEffect(() => {
    if (syncedAIRef.current) return;
    if (!isLoggedIn || user?.account_type?.toLowerCase() !== 'buyer') return;
    if (getPropertyPreferenceFromDB.isLoading || getPropertyPreferenceFromAI.isLoading) return;
    // Don't block sync on DB error - if AI has data, we should sync it
    if (getPropertyPreferenceFromAI.isError) return;

    const dbPreference = getPropertyPreferenceFromDB.data;
    const aiResponse = getPropertyPreferenceFromAI.data;
    
    // Check if GraphQL DB has complete data
    const dbIsComplete = Boolean(
      dbPreference &&
        dbPreference.onboardingCompleted &&
        dbPreference.propertyType &&
        dbPreference.preferredPropertyAddress &&
        dbPreference.spendAmount?.max,
    );

    if (dbIsComplete) {
      console.log('[MainLayout PropertyPreferenceModal] GraphQL DB has complete data, skipping AI sync');
      syncedAIRef.current = true;
      return;
    }

    // Check if AI has complete data
    const aiPreference = aiResponse?.preference;
    const aiIsComplete = Boolean(
      aiPreference &&
        (aiPreference.mls_type || aiPreference.propertyType || aiPreference.property_sub_type) &&
        (aiPreference.city || aiPreference.preferredPropertyAddress) &&
        (aiPreference.listing_price_max || aiPreference.spendAmount?.max),
    );

    // If GraphQL is incomplete/null but AI has complete data, sync it
    if (!dbIsComplete && aiIsComplete) {
      console.log('[MainLayout PropertyPreferenceModal] GraphQL incomplete but AI has complete data, syncing to GraphQL DB:', aiPreference);
      
      // Extract data from AI API response
      let propertyType = '';
      if (aiPreference?.property_sub_type === 'Condo') {
        propertyType = 'Condomium';
      } else {
        propertyType = aiPreference?.mls_type || aiPreference?.propertyType || '';
      }
      if (propertyType === 'Single Family') {
        propertyType = 'Single Family Home';
      }

      const priceMax = Number(aiPreference?.listing_price_max) || Number(aiPreference?.spendAmount?.max) || 0;
      const priceMin = Number(aiPreference?.listing_price_min) || Number(aiPreference?.spendAmount?.min) || 0;
      
      let areaPreference = '';
      if (aiPreference?.city) {
        areaPreference = `${aiPreference.city}${aiPreference.state ? `, ${aiPreference.state}` : ''}`;
      } else {
        areaPreference = aiPreference?.preferredPropertyAddress || '';
      }

      // Only sync if we have meaningful data
      if (propertyType && areaPreference && priceMax > 0) {
        syncedAIRef.current = true;
        updatePropertyPreference.mutate({
          propertyType,
          preferredPropertyAddress: areaPreference,
          priceMin,
          priceMax,
          onboardingCompleted: true, // Mark as completed since AI has complete data
        }, {
          onSuccess: () => {
            console.log('[MainLayout PropertyPreferenceModal] Successfully synced AI data to GraphQL DB');
            // Refetch DB to get updated data
            getPropertyPreferenceFromDB.refetch?.();
          },
          onError: (error) => {
            console.error('[MainLayout PropertyPreferenceModal] Failed to sync AI data:', error);
            syncedAIRef.current = false; // Reset so it can retry
          },
        });
      }
    }
  }, [
    getPropertyPreferenceFromDB.data,
    getPropertyPreferenceFromDB.isLoading,
    getPropertyPreferenceFromDB.isError,
    getPropertyPreferenceFromAI.data,
    getPropertyPreferenceFromAI.isLoading,
    getPropertyPreferenceFromAI.isError,
    isLoggedIn,
    user?.account_type,
    updatePropertyPreference,
    getPropertyPreferenceFromDB,
  ]);

  // Check if modal should show (same logic as DashboardLayout)
  useEffect(() => {
    console.log('[MainLayout PropertyPreferenceModal] Checking conditions:', {
      pathname,
      hasPrompted: hasPromptedRef.current,
      isLoggedIn,
      accountType: user?.account_type?.toLowerCase(),
      dbLoading: getPropertyPreferenceFromDB.isLoading,
      dbError: getPropertyPreferenceFromDB.isError,
      dbData: getPropertyPreferenceFromDB.data,
      aiLoading: getPropertyPreferenceFromAI.isLoading,
      aiError: getPropertyPreferenceFromAI.isError,
      aiData: getPropertyPreferenceFromAI.data,
    });

    if (hasPromptedRef.current) {
      console.log('[MainLayout PropertyPreferenceModal] Already prompted, skipping');
      return;
    }
    
    if (!isLoggedIn) {
      console.log('[MainLayout PropertyPreferenceModal] Not logged in, skipping');
      return;
    }
    
    if (user?.account_type?.toLowerCase() !== 'buyer') {
      console.log('[MainLayout PropertyPreferenceModal] Not a buyer, skipping');
      return;
    }
    
    // Wait for both queries to finish
    if (getPropertyPreferenceFromDB.isLoading || getPropertyPreferenceFromAI.isLoading) {
      console.log('[MainLayout PropertyPreferenceModal] Still loading preferences, waiting...');
      return;
    }
    
    // Check GraphQL DB first (primary source)
    const dbPreference = getPropertyPreferenceFromDB.data;
    const dbIsComplete = Boolean(
      dbPreference &&
        dbPreference.onboardingCompleted &&
        dbPreference.propertyType &&
        dbPreference.preferredPropertyAddress &&
        dbPreference.spendAmount?.max,
    );

    // If GraphQL DB is complete, don't show modal
    if (dbIsComplete) {
      console.log('[MainLayout PropertyPreferenceModal] GraphQL DB preferences complete, not showing modal');
      hasPromptedRef.current = true;
      return;
    }

    // Check AI API as fallback (even if DB has error or is incomplete)
    const aiResponse = getPropertyPreferenceFromAI.data;
    const aiPreference = aiResponse?.preference;
    
    const aiIsComplete = Boolean(
      aiPreference &&
        (aiPreference.mls_type || aiPreference.propertyType || aiPreference.property_sub_type) &&
        (aiPreference.city || aiPreference.preferredPropertyAddress) &&
        (aiPreference.listing_price_max || aiPreference.spendAmount?.max),
    );

    // If AI API has complete data, don't show modal (sync will happen automatically)
    if (aiIsComplete) {
      console.log('[MainLayout PropertyPreferenceModal] AI API has complete data, sync in progress - not showing modal');
      hasPromptedRef.current = true;
      return;
    }

    // Check if sync is in progress (mutation is pending)
    if (updatePropertyPreference.isPending) {
      console.log('[MainLayout PropertyPreferenceModal] Sync in progress, waiting...');
      return;
    }

    // Both sources are incomplete, show modal
    console.log('[MainLayout PropertyPreferenceModal] Both GraphQL DB and AI API incomplete, showing modal');
    setShowPreferenceModal(true);
    hasPromptedRef.current = true;
  }, [
    getPropertyPreferenceFromDB.data,
    getPropertyPreferenceFromDB.isError,
    getPropertyPreferenceFromDB.isLoading,
    getPropertyPreferenceFromAI.data,
    getPropertyPreferenceFromAI.isError,
    getPropertyPreferenceFromAI.isLoading,
    isLoggedIn,
    user?.account_type,
    pathname,
    updatePropertyPreference.isPending,
  ]);

  // Optionally, you can add geolocation code if required
  // useEffect(() => {
  //   if('geolocation' in navigator) {
  //     navigator.geolocation.getCurrentPosition(({ coords }) => {
  //       const { latitude, longitude } = coords;
  //       setLocation({ latitude, longitude });
  //     });
  //   }
  // }, []);

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
          syncedAIRef.current = false;
          getPropertyPreferenceFromDB.refetch?.();
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
