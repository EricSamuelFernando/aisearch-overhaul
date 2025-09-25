import { buyerDashboardRoutes } from '@/utils/data';
import TabSwitch from '@/components/dashboard/main/tab-switch';
import PropertyDetailLayout from '@/components/dashboard/user/property-detail-layout';

function PropertyPage({ params }: { params: { slug: string } }) {
  return (
    <section className='pt-8'>
      <TabSwitch
        className='container'
        basePath='/dashboard/seller'
        tabs={buyerDashboardRoutes}
      />
      <PropertyDetailLayout />
    </section>
  );
}

export default PropertyPage;
