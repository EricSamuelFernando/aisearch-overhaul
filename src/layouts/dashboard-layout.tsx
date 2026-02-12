'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardNav from '@/components/navbars/dashboard-nav';
import Footer from '@/components/shared/footer';
import PropertyPreferenceModal from '@/components/modals/property-preference-modal';
import { useAuth } from '@/shared/hooks/useAuth';
import { useGetPropertyPreference, useUpdatePropertyPreference } from '@/hooks/api/property/usePropertyApi';
import { getIsAuthExpired } from '@/lib/api/axios';

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Readonly<Props>) {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();
  const { getPropertyPreferenceFromDB, getPropertyPreferenceFromAI } = useGetPropertyPreference(user?.email);
  const { updatePropertyPreference } = useUpdatePropertyPreference(user?.email);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const hasPromptedRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);
  const syncedAIRef = useRef(false);

  // Reset prompt flag when user changes (logout/login) and refetch preferences
  useEffect(() => {
    if (lastUserIdRef.current !== user?.id) {
      console.log('[PropertyPreferenceModal] User changed, resetting prompt flag');
      hasPromptedRef.current = false;
      syncedAIRef.current = false;
      lastUserIdRef.current = user?.id;
      
      // Refetch preferences when user logs in (only if auth is still valid)
      if (isLoggedIn && !getIsAuthExpired() && user?.account_type?.toLowerCase() === 'buyer' && user?.email) {
        console.log('[PropertyPreferenceModal] Refetching preferences for new user');
        getPropertyPreferenceFromDB.refetch?.();
        getPropertyPreferenceFromAI.refetch?.();
      }
    }
  }, [user?.id, isLoggedIn, user?.account_type, user?.email, getPropertyPreferenceFromDB, getPropertyPreferenceFromAI]);

  const isSpecialPage =
    pathname.includes('/listingprocess') ||
    pathname.includes('/guided-transaction') ||
    pathname.includes('/estimated-cost');

  const navClass = isSpecialPage ? 'bg-[#F7F2EB]' : 'bg-primary-100';
  const isChatPage = pathname === '/dashboard/chat';

  // Sync AI API data to GraphQL DB if GraphQL is empty/incomplete but AI has complete data
  useEffect(() => {
    if (syncedAIRef.current) return;
    if (!isLoggedIn || user?.account_type?.toLowerCase() !== 'buyer') return;
    // If auth is expired, don't attempt any API calls
    if (getIsAuthExpired()) return;
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
      console.log('[PropertyPreferenceModal] GraphQL DB has complete data, skipping AI sync');
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
      console.log('[PropertyPreferenceModal] GraphQL incomplete but AI has complete data, syncing to GraphQL DB:', aiPreference);
      
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
            console.log('[PropertyPreferenceModal] Successfully synced AI data to GraphQL DB');
            // Refetch DB to get updated data
            if (!getIsAuthExpired()) {
              getPropertyPreferenceFromDB.refetch?.();
            }
          },
          onError: (err: any) => {
            console.error('[PropertyPreferenceModal] Failed to sync AI data:', err);
            // Only allow retry for non-auth errors.
            // Auth errors must NOT reset the flag to prevent infinite loop.
            const msg = err?.message || '';
            if (!msg.includes('Unauthorized') && !msg.includes('Session expired')) {
              syncedAIRef.current = false; // Reset so it can retry on next render
            }
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

  useEffect(() => {
    // If auth is expired, skip all preference checks to avoid triggering more errors
    if (getIsAuthExpired()) return;

    // Debug logging
    console.log('[PropertyPreferenceModal] Checking conditions:', {
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
      console.log('[PropertyPreferenceModal] Already prompted, skipping');
      return;
    }
    
    if (!isLoggedIn) {
      console.log('[PropertyPreferenceModal] Not logged in, skipping');
      return;
    }
    
    if (user?.account_type?.toLowerCase() !== 'buyer') {
      console.log('[PropertyPreferenceModal] Not a buyer, skipping');
      return;
    }
    
    // Wait for both queries to finish
    if (getPropertyPreferenceFromDB.isLoading || getPropertyPreferenceFromAI.isLoading) {
      console.log('[PropertyPreferenceModal] Still loading preferences, waiting...');
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
      console.log('[PropertyPreferenceModal] GraphQL DB preferences complete, not showing modal');
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
      console.log('[PropertyPreferenceModal] AI API has complete data, sync in progress - not showing modal');
      hasPromptedRef.current = true;
      return;
    }

    // Check if sync is in progress (mutation is pending)
    if (updatePropertyPreference.isPending) {
      console.log('[PropertyPreferenceModal] Sync in progress, waiting...');
      return;
    }

    // Both sources are incomplete, show modal
    console.log('[PropertyPreferenceModal] Both GraphQL DB and AI API incomplete, showing modal');
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
    updatePropertyPreference.isPending,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <PropertyPreferenceModal
        isOpen={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        onComplete={() => {
          setShowPreferenceModal(false);
          syncedAIRef.current = false; // Reset sync flag so it can sync again if needed
          getPropertyPreferenceFromDB.refetch?.();
          getPropertyPreferenceFromAI.refetch?.();
        }}
      />
      <DashboardNav navClass={navClass} />
      <section className="flex-grow">
        <div className={`${isChatPage ? "" : 'mt-[5.5rem]'}`}>{children}</div>
      </section>
      {/* Footer placed normally at the bottom */}
      {!isChatPage && (
        <footer className="mt-4">
          <Footer />
        </footer>
      )}
    </div>
  );
}

export { DashboardLayout };
