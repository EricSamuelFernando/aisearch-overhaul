'use client';

import { useState } from 'react';
import { IProperty } from '@/interfaces/property.interface';
import { formatCurrency } from '@/lib/utils';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import NImage from 'next/image';
import { imageLoader } from '@/utils/image-loader';
import { useRouter } from 'next/navigation';
import {
  Home,
  Bed,
  Bath,
  ChevronRight,
  Calendar,
  MapPin,
  Maximize2
} from 'lucide-react';

type PropertyCardsProps = IProperty;

const MapPropertyCards = (props: any) => {
  const { saveCurrenctProperty } = usePropertyActions();
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!carouselEvent) {
      saveCurrenctProperty(props);
      router.push(`/buy/${props.listingId}/prop/preview`);
    }
  };

  const streetAddress = props?.address?.line1 || props?.listing?.address?.unparsedAddress || '';
  const city = props?.address?.city || props?.listing?.address?.city || '';
  const state = props?.address?.state || props?.listing?.address?.stateOrProvince || '';
  const zip = props?.address?.postalCode || props?.listing?.address?.zipCode || '';
  const fullAddress = `${streetAddress}, ${city}, ${state} ${zip}`;

  const propertyType = props?.listing?.property?.propertyType || 'Residential';
  const yearBuilt = props?.listing?.property?.yearBuilt || 'N/A';
  const lotSize = props?.listing?.property?.lotSizeAcres
    ? `${(props?.listing?.property?.lotSizeAcres).toFixed(2)} acres`
    : props?.listing?.property?.lotSizeSqFt
      ? `${props?.listing?.property?.lotSizeSqFt} sq ft`
      : 'N/A';

  const status = props?.listing?.status || 'Active';
  const daysOnMarket = props?.listing?.daysOnMarket || 'New';

  return (
    <div
      onClick={handleClick}
      className="relative w-80 rounded-2xl overflow-hidden bg-black/70 backdrop-blur-lg border border-white/10 shadow-lg transition hover:scale-[1.015] hover:shadow-2xl cursor-pointer"
    >
      {props.onClose ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            props.onClose();
          }}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/60 text-white/90 flex items-center justify-center hover:bg-black/80"
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
      {/* Image */}
      <div className="relative h-48 w-full">
        <NImage
          fill
          loader={imageLoader}
          alt="property"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          src={
            props?.listing?.media?.photosList?.[0]?.lowRes ||
            props?.listing?.media?.primaryListingImageUrl ||
            '/assets/images/placeholder.svg'
          }
        />
        <div className="absolute top-0 w-full flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent px-4 py-2">
          <span className="text-sm font-medium text-black bg-[#78de2a] px-3 py-1 rounded-full">
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-4 py-4 text-white">
        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-zinc-200">
          <MapPin className="h-4 w-4 text-ocOrange mt-1" />
          <p className="font-semibold leading-snug line-clamp-2">{fullAddress}</p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-ocOrange" />
            {props?.listing?.property?.bedroomsTotal || 0} Beds
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-ocOrange" />
            {props?.listing?.property?.bathroomsTotal || 0} Baths
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="h-4 w-4 text-ocOrange" />
            {props?.listing?.property?.livingArea || 0} sqft
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Home className="h-4 w-4 text-ocOrange" />
            {propertyType}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-ocOrange" />
            Built {yearBuilt}
          </div>
          <div className="col-span-2 flex items-center gap-1">
            <Maximize2 className="h-4 w-4 text-ocOrange" />
            Lot Size: {lotSize}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
          className="mt-3 w-full flex items-center justify-center bg-ocOrange/10 hover:bg-ocOrange/20 text-ocOrange text-sm font-medium py-2 rounded-xl transition"
        >
          View Property Details
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default MapPropertyCards;
