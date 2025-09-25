import PropertyDetailLayout from '@/components/dashboard/agent/property-detail-layout';
import TabSwitch from '@/components/dashboard/main/tab-switch';
import { buyerDashboardRoutes } from '@/utils/data';

function PropertyPage() {
  return (
    <section className='pt-8'>
      <TabSwitch basePath='/dashboard/seller' tabs={buyerDashboardRoutes} />
      <PropertyDetailLayout />
    </section>
  );
}

export default PropertyPage;
