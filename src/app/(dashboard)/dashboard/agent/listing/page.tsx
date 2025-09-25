'use client';

import React from 'react';
import DocumentsList from '@/components/dashboard/agent/documents';
import ImageUploads from '@/components/dashboard/agent/image-uploads';
import PropertyAddress from '@/components/dashboard/agent/property-address';
import AddManagers from '@/components/dashboard/agent/add-managers';
import AddFeatures from '@/components/dashboard/agent/add-features';
import { useSearchParams } from 'next/navigation';

const Listings = () => {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('id') || '';

  propertyId;
  return (
    <section className='my-8'>
      <div>
        <DocumentsList propertyId={propertyId} />
      </div>
      <div className='my-24'>
        <ImageUploads />
      </div>
      <div className='my-24'>
        <PropertyAddress />
      </div>
      <div className='my-24'>
        <AddManagers />
      </div>
      <div className='my-24'>
        <AddFeatures />
      </div>
    </section>
  );
};

export default Listings;
