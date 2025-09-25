import ListingPreview from '@/app/(landing)/sell/listing-preview';
import React from 'react';

const SellerListingPreview: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-screen mt-16 ms-2">
      {/* Page Content */}
      <div className="relative flex-grow">
        <ListingPreview />
      </div>
    </div>
  );
};

export default SellerListingPreview;
