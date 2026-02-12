import PropertyCardLists from '@/components/buy/browse/property-card-list';
import PropertyBrowseView from '@/components/buy/browse/property-info';
import {
  BuyBreadCrumb,
  BuyCustomSearch,
} from '@/components/buy/buy-custom-search';
import { PropertyFilter } from '@/components/buy/property-filter';
import Footer from '@/components/shared/footer';

export default function BrowsePage() {
  return (
    <section className='visible flex min-h-screen flex-col space-y-3 bg-primary-100 transition-all pb-0'>
      <BuyBreadCrumb />
      <PropertyFilter />
      <PropertyBrowseView/>
      {/* <PropertyCardLists /> */}

      <BuyCustomSearch hideInMap />

{/* MAP STOP SENTINEL */}
<div id="map-stop-sentinel" className="h-px" />
      <Footer />
    </section>
  );
}
