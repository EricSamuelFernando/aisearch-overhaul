 'use client';

import PropertyCardLists from '@/components/buy/browse/property-card-list';
import PropertyBrowseView from '@/components/buy/browse/property-info';
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
          ? 'visible flex h-[calc(100vh-90px)] min-h-0 md:h-[calc(100vh-80px)] flex-col space-y-0 overflow-hidden bg-primary-100 transition-all pb-0'
          : 'visible flex min-h-screen flex-col space-y-3 bg-primary-100 transition-all pb-0'
      }
    >
      {currentView !== 'map' ? <BuyBreadCrumb /> : null}
      <PropertyFilter />
      <PropertyBrowseView />
      {/* <PropertyCardLists /> */}

      <BuyCustomSearch hideInMap={false} />

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
