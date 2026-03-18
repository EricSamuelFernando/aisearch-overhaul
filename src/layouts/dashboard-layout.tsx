'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardNav from '@/components/navbars/dashboard-nav';
import Footer from '@/components/shared/footer';
import PropertyPreferenceModal from '@/components/modals/property-preference-modal';
import { useAuth } from '@/shared/hooks/useAuth';
import { useGetPropertyPreference } from '@/hooks/api/property/usePropertyApi';

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Readonly<Props>) {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();
  const { getPropertyPreferenceFromAI } = useGetPropertyPreference(user?.id);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const hasPromptedRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  // Reset prompt flag when user changes (logout/login) and refetch AI preferences
  useEffect(() => {
    if (lastUserIdRef.current !== user?.id) {
      console.log('[DashboardLayout] User changed, resetting prompt flag');
      hasPromptedRef.current = false;
      lastUserIdRef.current = user?.id;

      if (isLoggedIn && user?.account_type?.toLowerCase() === 'buyer' && user?.email) {
        console.log('[DashboardLayout] Refetching AI preferences for new user');
        getPropertyPreferenceFromAI.refetch?.();
      }
    }
  }, [user?.id, isLoggedIn, user?.account_type, user?.email, getPropertyPreferenceFromAI]);

  const isSpecialPage =
    pathname.includes('/listingprocess') ||
    pathname.includes('/guided-transaction') ||
    pathname.includes('/estimated-cost');

  const navClass = isSpecialPage ? 'bg-[#F7F2EB]' : 'bg-primary-100';
  const isChatPage = pathname === '/dashboard/chat';

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

    if (aiPref) {
      if (typeof aiPref === 'string' && aiPref.trim().length > 0) {
        console.log('[DashboardLayout] AI preference string exists — not showing modal');
        hasPromptedRef.current = true;
        return;
      } else if (typeof aiPref === 'object') {
        const hasType = !!(aiPref.mls_type || aiPref.propertyType || aiPref.property_sub_type || aiPref.property_type);
        const hasLocation = !!(aiPref.city || aiPref.preferredPropertyAddress || aiPref.location || aiPref.address || aiPref.state);
        const hasPrice = !!(aiPref.listing_price_max || aiPref.spendAmount?.max || aiPref.budget_max || aiPref.price_max || aiPref.listing_price_min);

        if (hasType || hasLocation || hasPrice) {
          console.log('[DashboardLayout] AI preference object exists — not showing modal');
          hasPromptedRef.current = true;
          return;
        }
      }
    }

    // AI has no preference data — show modal
    console.log('[DashboardLayout] No AI preference data found — showing modal');
    setShowPreferenceModal(true);
    hasPromptedRef.current = true;
  }, [
    getPropertyPreferenceFromAI.data,
    getPropertyPreferenceFromAI.isLoading,
    getPropertyPreferenceFromAI.isError,
    isLoggedIn,
    user?.account_type,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <PropertyPreferenceModal
        isOpen={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        onComplete={() => {
          setShowPreferenceModal(false);
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
