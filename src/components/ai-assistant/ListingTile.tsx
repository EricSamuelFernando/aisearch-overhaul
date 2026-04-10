'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MLSListing } from '@/types/ai-assistant';
import { BedDouble, Bath, Maximize2, Waves, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Props {
  listing: MLSListing;
  index: number;
}

export default function ListingTile({ listing, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const primaryPhoto = listing.photos?.[0];
  const priceFormatted = listing.listing_price
    ? `$${listing.listing_price.toLocaleString()}`
    : 'Price N/A';

  return (
    <div className="flex-shrink-0 w-[260px] rounded-2xl bg-white shadow-md overflow-hidden border border-gray-100 flex flex-col">
      {/* Photo */}
      <div className="relative h-[150px] bg-gray-100">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={listing.full_address}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-xs">No photo</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-semibold bg-gray-900/80 text-white px-2 py-0.5 rounded-md">
            {listing.property_type ?? 'Residential'}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-bold bg-white text-gray-800 w-6 h-6 rounded-full flex items-center justify-center shadow">
            #{index + 1}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Price */}
        <p className="text-xl font-bold text-gray-900">{priceFormatted}</p>

        {/* Address */}
        <p className="text-xs text-gray-500 leading-snug line-clamp-2">
          {listing.full_address}
          {listing.city ? `, ${listing.city}` : ''}
          {listing.state ? `, ${listing.state}` : ''}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-700">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-gray-400" />
            {listing.bedrooms ?? '–'} Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-gray-400" />
            {listing.bathrooms ?? '–'} Baths
          </span>
          {listing.living_area ? (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
              {listing.living_area.toLocaleString()} sqft
            </span>
          ) : null}
        </div>

        {/* Pool + days on market */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Waves className="w-3.5 h-3.5 text-gray-400" />
            Pool
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              listing.has_pool
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {listing.has_pool ? 'Yes' : 'No'}
          </span>
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between w-full text-[#e8804c] text-xs font-semibold pt-1 border-t border-gray-100 mt-auto"
        >
          Show More
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="text-xs text-gray-500 space-y-1 pt-1">
            {listing.year_built && <p>Built: {listing.year_built}</p>}
            {listing.days_on_market != null && (
              <p>{listing.days_on_market} days on market</p>
            )}
            {listing.lot_size && (
              <p>Lot: {listing.lot_size.toLocaleString()} sqft</p>
            )}
            {listing.status && <p>Status: {listing.status}</p>}
            {listing.description && (
              <p className="line-clamp-3">{listing.description}</p>
            )}
            {listing.listing_url && (
              <a
                href={listing.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#e8804c] font-medium mt-1"
              >
                View listing <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
