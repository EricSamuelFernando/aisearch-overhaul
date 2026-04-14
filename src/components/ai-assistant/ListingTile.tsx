'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MLSListing } from '@/types/ai-assistant';
import { BedDouble, Bath, Maximize2, Waves, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  listing: MLSListing;
  index: number;
}

export default function ListingTile({ listing, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPhotoTransitioning, setIsPhotoTransitioning] = useState(false);

  const photos = listing.photos ?? [];
  const hasMultiplePhotos = photos.length > 1;
  const currentPhoto = photos[photoIndex] ?? null;

  const priceFormatted = listing.listing_price
    ? `$${listing.listing_price.toLocaleString()}`
    : 'Price N/A';

  // When photos array changes (after photo_rank SSE reorders them),
  // reset to index 0 so the best-match photo is shown immediately
  useEffect(() => {
    setPhotoIndex(0);
    setIsPhotoTransitioning(false);
  }, [photos[0]]);

  const goToPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasMultiplePhotos || isPhotoTransitioning) return;
      setIsPhotoTransitioning(true);
      setTimeout(() => {
        setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        setIsPhotoTransitioning(false);
      }, 150);
    },
    [hasMultiplePhotos, isPhotoTransitioning, photos.length],
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasMultiplePhotos || isPhotoTransitioning) return;
      setIsPhotoTransitioning(true);
      setTimeout(() => {
        setPhotoIndex((prev) => (prev + 1) % photos.length);
        setIsPhotoTransitioning(false);
      }, 150);
    },
    [hasMultiplePhotos, isPhotoTransitioning, photos.length],
  );

  const goToIndex = useCallback(
    (e: React.MouseEvent, i: number) => {
      e.stopPropagation();
      if (isPhotoTransitioning || i === photoIndex) return;
      setIsPhotoTransitioning(true);
      setTimeout(() => {
        setPhotoIndex(i);
        setIsPhotoTransitioning(false);
      }, 150);
    },
    [isPhotoTransitioning, photoIndex],
  );

  // Show "Best match" badge when vision ranked this listing and the
  // best-match photo is currently visible (index 0 after reorder)
  const showBestMatchBadge =
    listing.bestScore != null &&
    listing.bestScore >= 0.5 &&
    photoIndex === 0;

  return (
    <div className="flex-shrink-0 w-[260px] rounded-2xl bg-white shadow-md overflow-hidden border border-gray-100 flex flex-col">

      {/* ── Photo area ── */}
      <div className="relative h-[150px] bg-gray-100 group">
        {currentPhoto ? (
          <Image
            key={currentPhoto}
            src={currentPhoto}
            alt={`${listing.full_address} photo ${photoIndex + 1}`}
            fill
            className={`object-cover transition-opacity duration-150 ${isPhotoTransitioning ? 'opacity-0' : 'opacity-100'}`}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-xs">No photo</span>
          </div>
        )}

        {/* Prev button */}
        {hasMultiplePhotos && (
          <button
            onClick={goToPrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Next button */}
        {hasMultiplePhotos && (
          <button
            onClick={goToNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Top-left: property type badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[10px] font-semibold bg-gray-900/80 text-white px-2 py-0.5 rounded-md">
            {listing.property_type ?? 'Residential'}
          </span>
        </div>

        {/* Top-right: listing number badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[10px] font-bold bg-white text-gray-800 w-6 h-6 rounded-full flex items-center justify-center shadow">
            #{index + 1}
          </span>
        </div>

        {/* Bottom: Best match badge + dot indicators */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-2 pb-1.5">
          {/* Best match badge — only when vision-ranked photo is active */}
          {showBestMatchBadge ? (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold bg-[#e8804c] text-white px-1.5 py-0.5 rounded-md">
              <Sparkles className="w-2.5 h-2.5" />
              Best match
            </span>
          ) : (
            <span />
          )}

          {/* Dot indicators */}
          {hasMultiplePhotos && (
            <div className="flex gap-1 items-center">
              {photos.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goToIndex(e, i)}
                  className={`rounded-full transition-all duration-150 ${
                    i === photoIndex
                      ? 'w-3 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
              {photos.length > 6 && (
                <span className="text-[8px] text-white/70 ml-0.5">+{photos.length - 6}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
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

        {/* Photo counter */}
        {hasMultiplePhotos && (
          <p className="text-[10px] text-gray-400">
            {photoIndex + 1} / {photos.length} photos
          </p>
        )}

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
