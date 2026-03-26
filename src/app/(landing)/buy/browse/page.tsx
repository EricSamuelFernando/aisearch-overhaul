 'use client';

import PropertyCardLists from '@/components/buy/browse/property-card-list';
import PropertyBrowseView from '@/components/buy/browse/property-info';
import BrowseAIChat from '@/components/buy/browse/browse-ai-chat';
import {
  BuyBreadCrumb,
  BuyCustomSearch,
} from '@/components/buy/buy-custom-search';
import { PropertyFilter } from '@/components/buy/property-filter';
import Footer from '@/components/shared/footer';
import { useProperty } from '@/shared/hooks/useProperty';

export default function BrowsePage() {
  const { currentView } = useProperty();

  return (
    <section
      className={
        currentView === 'map'
          ? 'visible flex h-[calc(100dvh-90px+env(safe-area-inset-bottom))] min-h-0 md:h-[calc(100dvh-80px)] flex-col space-y-0 overflow-hidden bg-primary-100 transition-all pb-0'
          : 'visible flex min-h-screen flex-col space-y-3 bg-primary-100 transition-all pb-0'
      }
    >
      {currentView !== 'map' ? <BuyBreadCrumb /> : null}
      {currentView !== 'map' ? <PropertyFilter /> : null}
      <PropertyBrowseView />
      {/* <PropertyCardLists /> */}

      {currentView !== 'map' ? <BuyCustomSearch hideInMap /> : null}

      {/* Floating AI Chat Assistant */}
      <BrowseAIChat />

      {/* MAP STOP SENTINEL */}
      <div id="map-stop-sentinel" className="h-px" />
      {currentView !== 'map' ? (
        <div className="relative z-10 pb-0">
          <Footer />
        </div>
      ) : null}
    </section>
  );
}
