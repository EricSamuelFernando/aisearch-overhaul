'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import SellerDoc from '@/components/sell/seller-doc';


const SellerDisclosureDoc = () => {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('id') || '';

  return <SellerDoc propertyId={propertyId} />;
};

export default SellerDisclosureDoc;
