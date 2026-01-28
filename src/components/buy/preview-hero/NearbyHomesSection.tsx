import React, { useEffect, useState } from "react";
import NImage from "next/image";
import PropertyCardHomes from "../browse/property-card-nearby";

const NearbyHomesSection = ({ nearbyHomes }: any) => {
  console.log("Nearby Homes:", nearbyHomes);
  if (!nearbyHomes?.length) return null;
  
  const [activeTab, setActiveTab] = useState<'For Sale' | 'Sold'>('For Sale');
  
  // Filter properties based on active tab
  const filteredHomes = nearbyHomes.filter((home: any) => {
    if (activeTab === 'For Sale') {
      // Show properties that are currently for sale
      return home?.listing?.standardStatus === 'Active' || 
             home?.listing?.standardStatus === 'ActiveUnderContract' ||
             !home?.listing?.standardStatus; // Default to showing if status is unclear
    } else {
      // Show sold properties
      return home?.listing?.standardStatus === 'Sold' || 
             home?.listing?.standardStatus === 'Closed';
    }
  });

  return (
    <div className="mt-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Similar homes
          </h2>
          <p className="text-base text-gray-600">
            Similar homes comparable in price and location to this property.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          aria-live="polite"
        >
          (0) Selected to Compare
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('For Sale')}
          className={`px-4 pb-2 text-lg font-medium transition-colors ${activeTab === 'For Sale'
              ? 'text-gray-900 border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          For Sale
        </button>

        <button
          onClick={() => setActiveTab('Sold')}
          className={`px-4 pb-2 text-lg font-medium transition-colors ml-4 ${activeTab === 'Sold'
              ? 'text-gray-900 border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Sold
        </button>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyHomes.slice(0, 6).map((home: any, index: number) => (
          <PropertyCardBrows key={index} listing={home.listing} />
        ))}
      </div> */}

      <div
        className="flex overflow-x-auto md:overflow-visible scrollbar-hide flex-nowrap md:flex-wrap
             snap-x snap-mandatory md:snap-none
             md:grid md:grid-cols-3 sm:grid-cols-2 gap-6"
      >
        {filteredHomes.length > 0 ? (
          filteredHomes.slice(0, 6).map((home: any, index: number) => (
            <div
              key={index}
              className="min-w-[90%] sm:min-w-[45%] md:min-w-0 w-full 
                   snap-start"
            >
              <PropertyCardHomes listing={home} />
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-12 px-4">
            <p className="text-gray-500 text-base">
              No {activeTab.toLowerCase()} properties available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyHomesSection;
