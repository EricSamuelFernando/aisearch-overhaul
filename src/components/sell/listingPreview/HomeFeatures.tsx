import { FeatureItem } from '@/components/FeatureItem';
import React from 'react';
const HomeFeatures: React.FC = () => (
  <section>
    <h2 className='mb-6 text-xl font-bold text-black'>Home Features</h2>
    <section className='mb-6 flex items-center rounded-sm bg-grey-390 py-3 pl-6'>
      <h3 className='text-lg font-medium text-black'>Interior</h3>
    </section>
    <section className='grid grid-cols-3'>
      <section>
        <FeatureItem items={['Hardwood floors']} title='Flooring' />
        <FeatureItem items={['Hardwood floors']} title='Cooling' />
        <FeatureItem items={['Hardwood floors']} title='Heating' />
      </section>
      <section>
        <FeatureItem
          items={['4 Bedroom', '3 Bathroom', 'Hot tub', 'Shower in tub']}
          title='Bedroom & Bathroom'
        />
        <FeatureItem
          items={['Double pane windows', 'High Ceilings']}
          title='Interior Features'
        />
      </section>
      <section>
        <FeatureItem items={['4 Bedroom', '3 Bathroom']} title='Kitchen' />
        <FeatureItem
          items={['Double pane windows', 'High Ceilings']}
          title='Appliances'
        />
      </section>
    </section>
    <section className='mb-6 flex items-center rounded-sm bg-grey-390 py-3 pl-6'>
      <h3 className='text-lg font-medium text-black'>Exterior</h3>
    </section>
    <section className='grid grid-cols-3'>
      <section>
        <FeatureItem items={['Hardwood floors']} title='Roofing' />
      </section>
      <section>
        <FeatureItem items={['3 Car lot']} title='Parking' />
      </section>
      <section>
        <FeatureItem items={['Swimming Pool']} title='Yard' />
      </section>
    </section>
  </section>
);

export { HomeFeatures };
