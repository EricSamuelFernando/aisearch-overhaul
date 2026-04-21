'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { MLSListing, CommuteResult } from '@/types/ai-assistant';
import {
  BedDouble,
  Bath,
  Maximize2,
  Waves,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface Props {
  listing: MLSListing;
  index: number;
  queryText?: string;
  commuteResult?: CommuteResult;
}

export default function ListingTile({ listing, index, queryText, commuteResult }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPhotoTransitioning, setIsPhotoTransitioning] = useState(false);

  const photos = listing.photos ?? [];
  const hasMultiplePhotos = photos.length > 1;
  const currentPhoto = photos[photoIndex] ?? null;

  const priceFormatted = listing.listing_price
    ? `$${listing.listing_price.toLocaleString()}`
    : 'Price N/A';

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

  const showBestMatchBadge =
    listing.bestScore != null &&
    listing.bestScore >= 0.5 &&
    photoIndex === 0;

  const listingId = String(listing.id ?? '').trim();
  const hasPreviewLink = listingId.length > 0;
  const previewHref = (() => {
    if (!hasPreviewLink) return '#';
    const params = new URLSearchParams();
    params.set('listingId', listingId);
    if (listing.city) params.set('city', listing.city);
    if (listing.state) params.set('province', listing.state);
    if (listing.status) params.set('mostRecentStatus', listing.status);
    return `/buy/${encodeURIComponent(listingId)}/prop/preview?${params.toString()}`;
  })();

  const displayAddress = (() => {
    const full = String(listing.full_address ?? '').trim();
    const noZip = full
      ? full
          .replace(/\s+\d{5}(?:-\d{4})?$/i, '')
          .replace(/,\s*$/, '')
          .trim()
      : '';

    const city = String(listing.city ?? '').trim();
    const state = String(listing.state ?? '').trim();
    const cityState = [city, state].filter(Boolean).join(', ');

    if (!noZip) return cityState || 'Address unavailable';
    if (!cityState) return noZip;

    const lower = noZip.toLowerCase();
    const hasCity = city ? lower.includes(city.toLowerCase()) : false;
    const hasState = state ? lower.includes(state.toLowerCase()) : false;

    return hasCity && hasState ? noZip : `${noZip}, ${cityState}`;
  })();

  const hasPool = Boolean(listing.has_pool);
  const showMoreHighlights = useMemo(() => {
    const q = (queryText ?? '').toLowerCase();

    const builtMention = /\b(year\s*built|built\s*year|built\s+in|constructed\s+in|construction\s+year)\b/i.test(q);
    const domMention = /\b(dom|days?\s+on\s+market)\b/i.test(q);
    const lotMention = /\b(lot\s*size|lot)\b/i.test(q);
    const poolMention = /\b(pool|swimming\s*pool)\b/i.test(q);

    const domRequested = (() => {
      const m = q.match(/(\d+)\s*days?\s*(?:on\s*market|dom)\b/i);
      return m ? Number(m[1]) : null;
    })();

    const builtRequested = (() => {
      const m =
        q.match(/\bbuilt\s*(?:in|year)?\s*(\d{4})\b/i) ||
        q.match(/\byear\s*built\s*(\d{4})\b/i) ||
        q.match(/\bconstructed\s*in\s*(\d{4})\b/i);
      return m ? Number(m[1]) : null;
    })();

    const wantsPoolNo = /\b(no|without)\s+pool\b/i.test(q);
    const wantsPoolYes = poolMention && !wantsPoolNo;

    const built = builtRequested != null
      ? Number(listing.year_built) === builtRequested
      : builtMention;
    const dom = domRequested != null
      ? Number(listing.days_on_market) === domRequested
      : domMention;
    const lot = lotMention;
    const pool = poolMention
      ? wantsPoolYes
        ? hasPool
        : !hasPool
      : false;

    return {
      built,
      dom,
      lot,
      pool,
      any: built || dom || lot || pool,
    };
  }, [queryText, listing.year_built, listing.days_on_market, hasPool]);

  useEffect(() => {
    if (showMoreHighlights.any) {
      setExpanded(true);
    }
  }, [showMoreHighlights.any]);

  const highlightClass =
    'rounded-md bg-[#FFF7ED] ring-1 ring-[#FDBA74] px-1.5 py-0.5';
  return (
    <div className="self-start flex-shrink-0 w-[260px] rounded-2xl bg-white shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <div className="relative h-[150px] bg-gray-100 group">
        {currentPhoto ? (
          <Image
            key={currentPhoto}
            src={currentPhoto}
            alt={`${listing.full_address} photo ${photoIndex + 1}`}
            fill
            className={`object-cover transition-opacity duration-150 ${
              isPhotoTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-xs">No photo</span>
          </div>
        )}

        {hasMultiplePhotos && (
          <button
            onClick={goToPrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {hasMultiplePhotos && (
          <button
            onClick={goToNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="absolute top-2 left-2 z-10">
          <span className="text-[10px] font-semibold bg-gray-900/80 text-white px-2 py-0.5 rounded-md">
            {listing.property_type ?? 'Residential'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <span className="text-[10px] font-bold bg-white text-gray-800 w-6 h-6 rounded-full flex items-center justify-center shadow">
            #{index + 1}
          </span>
        </div>


        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-2 pb-1.5">
          {showBestMatchBadge ? (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold bg-[#e8804c] text-white px-1.5 py-0.5 rounded-md">
              <Sparkles className="w-2.5 h-2.5" />
              Best match
            </span>
          ) : (
            <span />
          )}

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
                <span className="text-[8px] text-white/70 ml-0.5">
                  +{photos.length - 6}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1 text-left">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xl font-bold text-gray-900">{priceFormatted}</p>
        </div>

        {commuteResult && (
          <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold mb-1 ${
            commuteResult.withinLimit
              ? 'bg-[#ECFDF3] text-[#166534] border-[#86EFAC]'
              : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
          }`}>
            🚗 {commuteResult.minutes} min · {commuteResult.distanceMi} mi
          </div>
        )}

        {listing.enrichment && listing.enrichment.neighborhood.score > 0 && (() => {
          const score = listing.enrichment.neighborhood.score;
          const colorClass = score >= 8
            ? 'bg-[#ECFDF3] text-[#166534] border-[#86EFAC]'
            : score >= 5
            ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
            : 'bg-gray-50 text-gray-500 border-gray-200';
          return (
            <div className="flex items-center gap-1.5 -mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${colorClass}`}>
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="currentColor">
                  <path d="M6 1l1.2 2.4L10 3.9l-2 1.95.47 2.75L6 7.4l-2.47 1.2L4 5.85 2 3.9l2.8-.5L6 1z"/>
                </svg>
                Area {score}/10
              </span>
            </div>
          );
        })()}

        <div className="flex items-center gap-1.5 text-xs text-gray-500 leading-snug -mt-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <p className="line-clamp-1">{displayAddress}</p>
        </div>

        <div className="border-t border-[#d7dbe3]" />

        <div className="flex items-center justify-between text-xs text-gray-700">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-[#6f7788]" />
            {listing.bedrooms ?? '--'} Beds
          </span>
          <span className="h-3.5 w-px bg-gray-200" />
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-[#6f7788]" />
            {listing.bathrooms ?? '--'} Baths
          </span>
          <span className="h-3.5 w-px bg-gray-200" />
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-[#6f7788]" />
            {listing.living_area ? listing.living_area.toLocaleString() : '--'} sqft
          </span>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between w-full text-[#e8804c] text-xs font-semibold pt-1 border-t border-gray-100 mt-auto"
        >
          Show More
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {expanded && (
          <div className="pt-1">
            <div className="px-0 py-0">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {listing.year_built && (
                  <div className={`flex items-center gap-1.5 ${showMoreHighlights.built ? highlightClass : ''}`}>
                    <span className="text-gray-500">Built:</span>
                    <span className="text-gray-800 font-semibold">{listing.year_built}</span>
                  </div>
                )}
                {listing.days_on_market != null && (
                  <div className={`flex items-center gap-1.5 ${showMoreHighlights.dom ? highlightClass : ''}`}>
                    <span className="text-gray-500">DOM:</span>
                    <span className="text-gray-800 font-semibold">
                      {listing.days_on_market} Days
                    </span>
                  </div>
                )}
                {listing.lot_size && (
                  <div className={`flex items-center gap-1.5 ${showMoreHighlights.lot ? highlightClass : ''}`}>
                    <span className="text-gray-500">Lot:</span>
                    <span className="text-gray-800 font-semibold">
                      {listing.lot_size.toLocaleString()}sqft
                    </span>
                  </div>
                )}
                <div className={`flex items-center gap-1.5 ${showMoreHighlights.pool ? highlightClass : ''}`}>
                  <Waves className="w-3.5 h-3.5 text-[#6f7788]" />
                  <span className="text-gray-500">Pool:</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-semibold ${
                      hasPool
                        ? 'border-[#86EFAC] bg-[#ECFDF3] text-[#166534]'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]'
                    }`}
                  >
                    {hasPool ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            {listing.enrichment && (listing.enrichment.pois.length > 0 || listing.enrichment.distanceToSearchPOI) && (
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                {listing.enrichment.distanceToSearchPOI && (
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#e8804c]">
                    <span>📍 {listing.enrichment.distanceToSearchPOI.name}</span>
                    <span>{listing.enrichment.distanceToSearchPOI.distanceMi} mi</span>
                  </div>
                )}
                {listing.enrichment.pois.map((poi) => {
                  const icons: Record<string, string> = {
                    hospital: '🏥',
                    school: '🏫',
                    grocery: '🛒',
                    transit: '🚇',
                    park: '🌳',
                    restaurant: '🍽️',
                    gym: '💪',
                    pharmacy: '💊',
                  };
                  return (
                    <div key={poi.type} className="flex items-center justify-between text-[10px] text-gray-600">
                      <span>{icons[poi.type] ?? '📍'} {poi.name}</span>
                      <span className="font-semibold text-gray-700">{poi.distanceMi} mi</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Solar potential — single family only */}
            {listing.enrichment?.solar && listing.property_sub_type === "Single Family" && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span>☀️ Solar potential</span>
                  <span className="font-semibold text-gray-700">{Math.round(listing.enrichment.solar.yearlyEnergyKwh).toLocaleString()} kWh/yr</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>{listing.enrichment.solar.panelCount} panels · {Math.round(listing.enrichment.solar.carbonOffsetKg / 1000 * 10) / 10}t CO₂ offset/yr</span>
                </div>
              </div>
            )}

            {/* Air quality + Pollen */}
            {(listing.enrichment?.airQuality || listing.enrichment?.pollen) && (
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                {listing.enrichment.airQuality && (() => {
                  const aqi = listing.enrichment!.airQuality!.aqi;
                  const colorClass = aqi <= 50
                    ? 'text-green-700'
                    : aqi <= 100
                    ? 'text-yellow-700'
                    : 'text-red-700';
                  return (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-600">💨 Air quality</span>
                      <span className={`font-semibold ${colorClass}`}>AQI {aqi} · {listing.enrichment!.airQuality!.category}</span>
                    </div>
                  );
                })()}
                {listing.enrichment.pollen && (
                  <div className="flex items-center justify-between text-[10px] text-gray-600">
                    <span>🌿 Pollen</span>
                    <span className="font-semibold text-gray-700 text-right">
                      Tree: {listing.enrichment.pollen.tree} · Grass: {listing.enrichment.pollen.grass}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Weather */}
            {listing.enrichment?.weather && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span>🌡️ Weather now</span>
                  <span className="font-semibold text-gray-700">{listing.enrichment.weather.tempF}°F · {listing.enrichment.weather.condition} · {listing.enrichment.weather.humidity}% humidity</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>Summer avg high</span>
                  <span>{listing.enrichment.weather.summerHighF}°F</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>Winter avg low</span>
                  <span>{listing.enrichment.weather.winterLowF}°F</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>Annual rainfall</span>
                  <span>{listing.enrichment.weather.annualRainfallIn} in/yr</span>
                </div>
              </div>
            )}

            {/* Street View */}
            {listing.enrichment?.location && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-500 mb-1">Street view</p>
                <img
                  src={`https://maps.googleapis.com/maps/api/streetview?size=380x160&location=${listing.enrichment.location.lat},${listing.enrichment.location.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                  alt="Street view"
                  className="w-full rounded-md object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            {hasPreviewLink && (
              <a
                href={previewHref}
                className="mx-auto mt-2 flex w-fit items-center gap-1 rounded-full border border-[#e8804c] bg-white px-3 py-1 text-xs font-semibold text-[#e8804c] transition-colors hover:bg-[#FFEBD8]"
              >
                View property <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
