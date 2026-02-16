import React, { useMemo, useState } from "react";
import PropertyCardHomes from "../browse/property-card-nearby";
import { useRouter } from "next/navigation";

const MAX_COMPARE = 3;
const STORAGE_KEY = "snaphomz_compare_selection";

const getListingKey = (home: any, fallbackIndex: number) => {
  const listing = home?.listing || home;
  return String(
    home?.listingId ||
    listing?.listingId ||
    listing?.mlsNumber ||
    listing?.address?.unparsedAddress ||
    fallbackIndex
  );
};

const NearbyHomesSection = ({ nearbyHomes, currentProperty, currentListingId }: any) => {
  // console.log("Nearby Homes:", nearbyHomes);
  if (!nearbyHomes?.length) return null;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'For Sale' | 'Sold'>('For Sale');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  // Filter properties based on active tab
  const normalizeStatus = (raw: string) => raw.replace(/[\s_-]/g, '').toLowerCase();
  const getListingStatus = (home: any) => {
    const listing = home?.listing || home;
    const status =
      listing?.standardStatus ||
      listing?.customStatus ||
      listing?.status ||
      listing?.mlsStatus ||
      listing?.listingStatus ||
      listing?.statusCode ||
      '';
    return normalizeStatus(String(status || ''));
  };
  const isExplicitlyListed = (home: any) => {
    const listing = home?.listing || home;
    if (listing?.isListed === false) return false;
    if (listing?.isListed === true) return true;
    return undefined;
  };

  const forSaleStatuses = new Set([
    'active',
    'activeundercontract',
    'comingsoon',
    'pending',
    'new',
  ]);
  const soldStatuses = new Set(['sold', 'closed']);
  const offMarketStatuses = new Set([
    'offmarket',
    'withdrawn',
    'expired',
    'canceled',
    'cancelled',
    'inactive',
    'removed',
    'hold',
  ]);

  const filteredHomes = nearbyHomes.filter((home: any) => {
    const status = getListingStatus(home);
    const listedFlag = isExplicitlyListed(home);

    if (activeTab === 'For Sale') {
      if (offMarketStatuses.has(status)) return false;
      if (listedFlag === false) return false;
      return forSaleStatuses.has(status);
    }

    if (soldStatuses.has(status)) return true;
    return false;
  });

  const selectedHomes = useMemo(() => {
    const selected = new Map<string, any>();
    nearbyHomes.forEach((home: any, index: number) => {
      const key = getListingKey(home, index);
      if (selectedIds.includes(key)) selected.set(key, home);
    });
    return Array.from(selected.values());
  }, [nearbyHomes, selectedIds]);

  const handleToggleCompare = (home: any, index: number) => {
    const key = getListingKey(home, index);
    setSelectedIds((prev) => {
      if (prev.includes(key)) {
        setLimitReached(false);
        return prev.filter((id) => id !== key);
      }
      if (prev.length >= MAX_COMPARE) {
        setLimitReached(true);
        return prev;
      }
      setLimitReached(false);
      return [...prev, key];
    });
  };

  const handleGoToCompare = () => {
    if (selectedIds.length === 0) return;
    const payload = {
      createdAt: new Date().toISOString(),
      base: currentProperty || null,
      selected: selectedHomes,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    const targetId =
      currentListingId ||
      currentProperty?.listingId ||
      currentProperty?.listing?.listingId ||
      currentProperty?.mlsNumber ||
      "compare";
    router.push(`/buy/${targetId}/compare`);
  };

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
        <div className="flex flex-col items-end gap-2">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg"
            aria-live="polite"
          >
            ({selectedIds.length}) Selected to Compare
          </button>
          <button
            type="button"
            onClick={handleGoToCompare}
            disabled={selectedIds.length === 0}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${selectedIds.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-900'
              }`}
          >
            Compare selected
          </button>
          {limitReached && (
            <span className="text-xs text-orange-600">
              You can compare up to {MAX_COMPARE} homes.
            </span>
          )}
          {selectedIds.length > 0 && selectedIds.length < MAX_COMPARE && (
            <span className="text-xs text-gray-500">
              You can add {MAX_COMPARE - selectedIds.length} more.
            </span>
          )}
        </div>
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
              <PropertyCardHomes
                listing={home}
                isSelected={selectedIds.includes(getListingKey(home, index))}
                compareDisabled={selectedIds.length >= MAX_COMPARE}
                onToggleCompare={() => handleToggleCompare(home, index)}
              />
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
