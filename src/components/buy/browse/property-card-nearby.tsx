"use client";
import { useState } from "react";
import NImage from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Bath, BedDouble, Ruler } from "lucide-react";
import EmblaCarousel from "@/components/customs/carousel/embla-carousel";

interface PropertyCardProps {
  listing: any;
  isSelected?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: () => void;
}

const PropertyCardHomes: React.FC<PropertyCardProps> = ({
  listing,
  isSelected,
  compareDisabled,
  onToggleCompare,
}) => {
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);

  if (!listing?.listing) return null;
  // console.log("Nearby Listing:", listing);

  // ✅ Click handlers
  const handleClick = (e: React.MouseEvent) => {
    if (carouselEvent) return;
    const targetId =
      listing?.listingId ||
      listing?.listing?.listingId ||
      listing?.listing?.id ||
      listing?.listing?.mlsNumber;
    if (!targetId) return;
    if (typeof window !== "undefined") {
      const fallbackPayload = {
        listingId: String(targetId),
        listing: listing?.listing || listing,
      };
      localStorage.setItem(
        `snaphomz_preview_fallback_${String(targetId)}`,
        JSON.stringify(fallbackPayload)
      );
    }
    router.push(`/buy/${targetId}/prop/preview`);
  };

  const handleCarouselButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselEvent(true);
    setTimeout(() => setCarouselEvent(false), 300);
  };

  const showCompare = typeof onToggleCompare === "function";
  const isSold =
    listing?.listing?.standardStatus === 'Sold' ||
    listing?.listing?.standardStatus === 'Closed';

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-[320px] cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl group"
    >
      {/* Full Image Background */}
      <div className="absolute inset-0 w-full h-full">
        {listing?.listing?.media?.photosList?.[0]?.lowRes ? (
          <NImage
            src={listing.listing.media.photosList[0].lowRes}
            alt="property-image"
            fill
            unoptimized
            className="object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 rounded-2xl flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Property Type Badge */}
      {listing?.listing?.leadTypes?.mlsType?.length ? (
        <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium z-10">
          {listing?.listing?.leadTypes?.mlsType?.join(", ")}
        </div>
      ) : null}

      {showCompare && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare?.();
          }}
          disabled={compareDisabled && !isSelected}
          className={`absolute top-4 right-4 z-20 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${isSelected
            ? 'bg-white text-gray-900'
            : compareDisabled
              ? 'bg-white/60 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
        >
          {isSelected ? 'Selected' : 'Compare'}
        </button>
      )}

      {/* Sold Badge */}
      {isSold && (
        <div className={`absolute ${showCompare ? 'top-14' : 'top-4'} right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium z-10`}>
          Sold
        </div>
      )}

      {/* Bottom Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4 rounded-b-2xl">
        {/* Price */}
        <h3 className="text-xl font-bold text-white mb-1">
          {formatCurrency(listing?.listing?.listPriceLow || 0, "USD")}
        </h3>

        {/* Address */}
        <div className="text-sm text-white/90 mb-3 leading-tight">
          <p className="font-medium">
            {listing?.listing?.address?.unparsedAddress}
          </p>
          <p className="text-white/70">
            {listing?.listing?.address?.city}, {listing?.listing?.address?.stateOrProvince}{" "}
            {listing?.listing?.address?.zipCode}
          </p>
        </div>

        {/* Property Details - Horizontal Layout with Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">
              {listing?.listing?.property?.bedroomsTotal || 0} Bed
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">
              {listing?.listing?.property?.bathroomsTotal || 0} Bath
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Ruler className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">
              {listing?.listing?.property?.livingArea || 0} sqft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardHomes;



