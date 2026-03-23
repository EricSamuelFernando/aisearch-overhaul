'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, ExternalLink, Loader2, Pause, Play, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { useAuth } from '@/shared/hooks/useAuth';
import API from '@/lib/api/axios';

// ─── Interaction recording (fire-and-forget) ──────────────────────────────────

async function recordInteraction(
  userId: string,
  snapId: string,
  listingId: string,
  action: 'liked' | 'dismissed',
): Promise<void> {
  try {
    await API.graphql({
      query: `
        mutation RecordSnapAIInteraction($input: RecordSnapAIInteractionInput!) {
          recordSnapAIInteraction(input: $input)
        }
      `,
      variables: { input: { userId, snapId, listingId, action } },
    });
  } catch (e) {
    console.warn('[SnapzAIReel] recordInteraction failed silently:', e);
  }
}

// ─── CSS ───────────────────────────────────────────────────────────────────────

const REEL_CSS = `
  /* ── Viewport ── */
  .reel-viewport {
    overflow: hidden;
    position: relative;
  }

  /* ── Auto-scrolling track ── */
  .reel-track {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    width: max-content;
    padding-bottom: 12px;
    animation: marqueeScroll var(--reel-duration, 60s) linear infinite;
    will-change: transform;
  }
  .reel-track.is-paused {
    animation-play-state: paused;
  }
  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* ── Reel cards ── */
  .reel-card {
    animation: reelEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: box-shadow 0.25s ease, transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease;
  }
  .reel-card:hover:not(.is-dimmed) {
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
    transform: translateY(-5px) scale(1.02);
  }
  .reel-card.is-dimmed {
    opacity: 0.48;
    transform: scale(0.97);
    filter: brightness(0.92);
  }
  .reel-card.reel-clone { animation: none; }
  .reel-card-exit-up {
    animation: reelExitUp 0.5s cubic-bezier(0.4, 0, 1, 1) both !important;
    pointer-events: none;
  }
  .reel-card-exit-left {
    animation: reelExitLeft 0.38s cubic-bezier(0.4, 0, 1, 1) both !important;
    pointer-events: none;
  }
  @keyframes reelEnter {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0)     scale(1);    }
  }
  @keyframes reelExitUp {
    from { opacity: 1; transform: translateY(0)     scale(1);    }
    to   { opacity: 0; transform: translateY(-28px) scale(0.92); }
  }
  @keyframes reelExitLeft {
    from { opacity: 1; transform: translateX(0)     rotate(0deg);  }
    to   { opacity: 0; transform: translateX(-56px) rotate(-6deg); }
  }

  /* ── Card image hover progress bar ── */
  .card-img-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 0 2px 2px 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;
  }
  .reel-card:hover .card-img-bar {
    opacity: 1;
    animation: cardBarFill 2.8s linear forwards;
  }
  @keyframes cardBarFill {
    from { width: 0%; }
    to   { width: 100%; }
  }

  /* ── Quick Look preview panel ── */
  .ql-preview {
    position: fixed;
    z-index: 9999;
    width: 320px;
    /* overflow: visible so carets can peek outside */
    overflow: visible;
    pointer-events: all;
  }
  .ql-preview-body {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    /* max-height is set via inline style — dynamically computed per placement */
    display: flex;
    flex-direction: column;
  }
  .ql-preview-scroll {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    scrollbar-width: none;
  }
  .ql-preview-scroll::-webkit-scrollbar { display: none; }
  .ql-preview.ql-enter .ql-preview-body {
    animation: qlEnter 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes qlEnter {
    from { opacity: 0; transform: scale(0.92) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }

  /* ── Crossfade carousel layers ── */
  .ql-photo-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.65s ease;
  }
  .ql-photo-layer.is-active { opacity: 1; }
  .ql-photo-layer.is-hidden { opacity: 0; }

  /* ── Ken Burns (single photo) ── */
  @keyframes kenBurns {
    0%   { transform: scale(1)    translate(0%,    0%);   }
    50%  { transform: scale(1.07) translate(-1.5%, -1%);  }
    100% { transform: scale(1.04) translate(1%,    0.5%); }
  }
  .ken-burns {
    animation: kenBurns 7s ease-in-out infinite alternate;
    transform-origin: center center;
  }

  /* ── Per-image progress bar (key resets animation on photo change) ── */
  .ql-img-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.18);
    z-index: 15;
    pointer-events: none;
  }
  .ql-img-progress-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
    animation: qlProgressFill 2.5s linear forwards;
  }
  @keyframes qlProgressFill {
    from { width: 0%; }
    to   { width: 100%; }
  }

  /* ── Sparks ── */
  .spark-particle {
    position: absolute;
    top: 50%; left: 50%;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #f97316;
    pointer-events: none;
    animation: sparkFly 0.6s ease-out forwards;
  }
  .spark-particle:nth-child(2) { background: #E84C85; animation-delay: 0.04s; }
  .spark-particle:nth-child(3) { background: #f59e0b; animation-delay: 0.02s; }
  .spark-particle:nth-child(4) { background: #f97316; animation-delay: 0.06s; }
  .spark-particle:nth-child(5) { background: #A64EBA; animation-delay: 0.03s; }
  .spark-particle:nth-child(6) { background: #E84C85; animation-delay: 0.05s; }
  @keyframes sparkFly {
    0%   { transform: translate(-50%,-50%) rotate(var(--spark-angle)) translateY(0px)   scale(1); opacity: 1; }
    100% { transform: translate(-50%,-50%) rotate(var(--spark-angle)) translateY(-36px) scale(0); opacity: 0; }
  }

  @keyframes addedBadgeIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0)     scale(1);   }
  }
  .added-badge { animation: addedBadgeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }

  .reel-section-enter { animation: reelSectionFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes reelSectionFadeIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price?: number) => {
  if (!price) return '—';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
};

const getPropertyImage = (p: any): string => {
  // Try all possible root-level image fields first (common in AI/search responses)
  const rootImg = p?.primaryListingImageUrl || p?.primaryImage || p?.image || p?.photo || p?.primaryPhoto;
  if (rootImg && typeof rootImg === 'string') return rootImg;

  // Then try nested structures (common in MLS data)
  return p?.listing?.media?.primaryListingImageUrl ||
    p?.listing?.media?.photosList?.[0]?.highRes ||
    p?.listing?.media?.photosList?.[0]?.lowRes ||
    p?.listing?.media?.photos?.[0]?.uri ||
    p?.listing?.media?.photos?.[0]?.url ||
    p?.listing?.photos?.[0]?.uri ||
    p?.listing?.photos?.[0]?.url ||
    p?.media?.primaryListingImageUrl ||
    p?.media?.photosList?.[0]?.highRes ||
    p?.media?.photosList?.[0]?.lowRes ||
    p?.media?.photos?.[0]?.uri ||
    '';
};

const getListingId = (p: any): string =>
  String(p?.listingId || p?.listing?.listingId || p?.listing?.mlsNumber || p?.id || '');

const getPropertyId = (p: any): string =>
  String(p?.propertyId || p?.id || p?.listingId || '');

const getAddress = (p: any): string => {
  const unparsed = p?.listing?.address?.unparsedAddress || 
                   p?.address?.unparsedAddress || 
                   p?.unparsedAddress;
  if (typeof unparsed === 'string' && unparsed.length > 0) return unparsed;

  const simpleAddress = p?.listing?.address || p?.address;
  if (typeof simpleAddress === 'string' && simpleAddress.length > 0) return simpleAddress;

  const formatted = p?.propertyAddressDetails?.formattedAddress || p?.formattedAddress;
  if (typeof formatted === 'string' && formatted.length > 0) return formatted;

  return 'Address unavailable';
};

const getCity = (p: any): string => {
  const a = p?.listing?.address;
  if (!a) return '';
  return [a.city, a.stateOrProvince, a.zipCode].filter(Boolean).join(', ');
};

const getPrice = (p: any): number =>
  p?.listing?.listPriceLow || p?.price || p?.listing?.price || 0;

const getBeds = (p: any): number =>
  p?.listing?.property?.bedroomsTotal || p?.listing?.bedrooms || p?.bedRooms || 0;

const getBaths = (p: any): number | string =>
  p?.listing?.property?.bathroomsTotal || p?.listing?.bathrooms || p?.bathRooms || 0;

const getPhotos = (p: any): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (url: string) => {
    if (url && typeof url === 'string' && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  };

  const media = p?.listing?.media ?? p?.media;

  // Primary image first
  const primary = p?.primaryListingImageUrl || p?.primaryImage || media?.primaryListingImageUrl || p?.image || p?.photo || p?.primaryPhoto;
  if (primary) push(primary);

  // photoListJson or photoList (often stringified arrays in AI responses)
  const rawList = p?.photoListJson || p?.photoList;
  if (rawList) {
    try {
      const parsed = typeof rawList === 'string' ? JSON.parse(rawList) : rawList;
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (typeof item === 'string') push(item);
          else if (item?.highRes || item?.lowRes) push(item.highRes || item.lowRes);
          else if (item?.uri || item?.url) push(item.uri || item.url);
        });
      }
    } catch (e) {
      console.warn('[SnapzAIReel] Failed to parse photoList:', e);
    }
  }

  // photos array (could be strings or objects)
  const photosArr = p?.photos || media?.photos || p?.listing?.photos || [];
  if (Array.isArray(photosArr)) {
    photosArr.forEach((ph: any) => {
      if (typeof ph === 'string') push(ph);
      else push(ph?.uri || ph?.url || ph?.href || '');
    });
  }

  // photosList is the real field used by the MLS data ({ highRes, lowRes })
  (media?.photosList || []).forEach((ph: any) => {
    push(ph?.highRes || ph?.lowRes || '');
  });

  // Last resort: single primary image if we still have nothing
  if (out.length === 0) push(getPropertyImage(p));

  return out.slice(0, 12);
};

const getRemarks = (p: any): string =>
  p?.listing?.publicRemarks || p?.publicRemarks || p?.propertyDescription || '';

const getYearBuilt = (p: any): string | number =>
  p?.listing?.property?.yearBuilt || p?.yearBuilt || '';

const getLivingArea = (p: any): string | number =>
  p?.listing?.property?.livingArea || p?.sqft || '';

const getPropType = (p: any): string =>
  p?.listing?.property?.propertyType?.[0] || p?.propertyType || '';

const getHOA = (p: any): string | number =>
  p?.listing?.property?.association?.fee || p?.hoa || '';

const getPropertyUrl = (p: any): string => {
  const id = getListingId(p) || getPropertyId(p);
  return id ? `/buy/${id}/prop/preview` : '#';
};

// ─── Types ────────────────────────────────────────────────────────────────────

type CardStatus = 'visible' | 'adding' | 'added' | 'dismissed';

interface PreviewData {
  property: any;
  rect: DOMRect;
}

interface Props {
  properties: any[];
  snapId: string;
  onPropertyAdded: () => void;
}

// ─── Positioning constants ────────────────────────────────────────────────────

const PREVIEW_W = 320;
const GAP       = 12;
const EDGE      = 8;
const EST_H     = 430; // estimated preview height for position math

// ─── Quick Look Preview ───────────────────────────────────────────────────────

function HoverPreview({
  data,
  status,
  onMouseEnter,
  onMouseLeave,
  onThumbsUp,
  onThumbsDown,
}: {
  data: PreviewData;
  status: CardStatus;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [sparkActive, setSparkActive] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { property, rect } = data;
  const photos    = getPhotos(property);
  const address   = getAddress(property);
  const city      = getCity(property);
  const price     = getPrice(property);
  const beds      = getBeds(property);
  const baths     = getBaths(property);
  const sqft      = getLivingArea(property);
  const yearBuilt = getYearBuilt(property);
  const propType  = getPropType(property);
  const hoa       = getHOA(property);
  const remarks   = getRemarks(property);
  const url       = getPropertyUrl(property);

  // ── Auto-advancing slideshow ──────────────────────────────────────────────
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (photos.length <= 1) return;
    autoRef.current = setInterval(() => {
      setPhotoIdx((i) => (i + 1) % photos.length);
    }, 2500);
  }, [photos.length]);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  const goToPhoto = useCallback((idx: number) => {
    setPhotoIdx(idx);
    startAuto(); // reset timer on manual nav
  }, [startAuto]);

  // ── Smart positioning: above → right → left → below ──────────────────────
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const canAbove = rect.top  - EST_H    - GAP >= EDGE;
  const canRight = rect.right + GAP + PREVIEW_W <= vw - EDGE;
  const canLeft  = rect.left  - GAP - PREVIEW_W >= EDGE;

  type Placement = 'above' | 'right' | 'left' | 'below';
  let x: number, y: number, placement: Placement, maxHeight: number;

  if (canAbove) {
    placement = 'above';
    const rawX = rect.left + rect.width / 2 - PREVIEW_W / 2;
    x = Math.max(EDGE, Math.min(rawX, vw - PREVIEW_W - EDGE));
    // Start as close to the card as possible; content grows upward from this y
    maxHeight = rect.top - GAP - EDGE;
    y = rect.top - maxHeight - GAP;
  } else if (canRight) {
    placement = 'right';
    x = rect.right + GAP;
    y = Math.max(EDGE, Math.min(rect.top - 20, vh - EST_H - EDGE));
    maxHeight = vh - y - EDGE;
  } else if (canLeft) {
    placement = 'left';
    x = rect.left - PREVIEW_W - GAP;
    y = Math.max(EDGE, Math.min(rect.top - 20, vh - EST_H - EDGE));
    maxHeight = vh - y - EDGE;
  } else {
    placement = 'below';
    const rawX = rect.left + rect.width / 2 - PREVIEW_W / 2;
    x = Math.max(EDGE, Math.min(rawX, vw - PREVIEW_W - EDGE));
    y = rect.bottom + GAP;
    maxHeight = vh - y - EDGE;
  }

  // Hard floor so it's always usable
  maxHeight = Math.max(maxHeight, 280);

  // Caret positions relative to preview box
  const cardCenterX  = rect.left + rect.width  / 2;
  const cardCenterY  = rect.top  + rect.height / 2;
  const caretOffsetX = Math.max(16, Math.min(cardCenterX - x - 7, PREVIEW_W - 30));
  const caretOffsetY = Math.max(16, Math.min(cardCenterY - y - 7, EST_H - 30));

  const handleThumbsUp = () => {
    setSparkActive(true);
    setTimeout(() => setSparkActive(false), 700);
    onThumbsUp();
  };

  return (
    <div
      className="ql-preview ql-enter"
      style={{ left: x, top: y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Directional carets ── */}
      {placement === 'above' && (
        <div style={{ position: 'absolute', bottom: -8, left: caretOffsetX, pointerEvents: 'none', zIndex: 1 }}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M0 0 L7 8 L14 0Z" fill="white" />
            <path d="M-0.5 0 L7 8.5 L14.5 0" stroke="rgba(0,0,0,0.07)" strokeWidth="1" fill="none" />
          </svg>
        </div>
      )}
      {placement === 'below' && (
        <div style={{ position: 'absolute', top: -8, left: caretOffsetX, pointerEvents: 'none', zIndex: 1 }}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M0 8 L7 0 L14 8Z" fill="white" />
            <path d="M-0.5 8 L7 -0.5 L14.5 8" stroke="rgba(0,0,0,0.07)" strokeWidth="1" fill="none" />
          </svg>
        </div>
      )}
      {placement === 'right' && (
        <div style={{ position: 'absolute', left: -8, top: caretOffsetY, pointerEvents: 'none', zIndex: 1 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M8 0 L0 7 L8 14Z" fill="white" />
          </svg>
        </div>
      )}
      {placement === 'left' && (
        <div style={{ position: 'absolute', right: -8, top: caretOffsetY, pointerEvents: 'none', zIndex: 1 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M0 0 L8 7 L0 14Z" fill="white" />
          </svg>
        </div>
      )}

      {/* ── Preview body: max-height is exact available space so it never overflows ── */}
      <div className="ql-preview-body" style={{ maxHeight }}>

        {/* ── Image zone: crossfade carousel ── */}
        <div className="relative h-[200px] bg-gray-200 flex-shrink-0 overflow-hidden">

          {/* Stacked crossfade layers */}
          {photos.length > 0 ? (
            photos.map((src, i) =>
              imgErrors[i] ? null : (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`ql-photo-layer ${photos.length === 1 ? 'ken-burns' : ''} ${i === photoIdx ? 'is-active' : 'is-hidden'}`}
                  onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                />
              )
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
          )}

          {/* Per-image progress bar — key forces DOM remount on every photo change, resetting animation */}
          {photos.length > 1 && (
            <div className="ql-img-progress">
              <div key={`prog-${photoIdx}`} className="ql-img-progress-fill" />
            </div>
          )}

          {/* Left arrow */}
          {photoIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPhoto(photoIdx - 1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 backdrop-blur-sm
                flex items-center justify-center hover:bg-black/55 transition-colors z-20"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          )}
          {/* Right arrow */}
          {photoIdx < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPhoto(photoIdx + 1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 backdrop-blur-sm
                flex items-center justify-center hover:bg-black/55 transition-colors z-20"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          )}

          {/* Dot indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
              {photos.slice(0, 7).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goToPhoto(i); }}
                  className={`rounded-full transition-all duration-200 ${
                    i === photoIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Photo count badge */}
          {photos.length > 1 && (
            <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-black/35 backdrop-blur-sm z-20">
              <span className="text-white text-[10px] font-semibold tabular-nums">
                {photoIdx + 1} / {photos.length}
              </span>
            </div>
          )}
        </div>

        {/* ── Scrollable content zone ── */}
        <div className="ql-preview-scroll">
          <div className="p-4">

            {/* Price */}
            <p className="text-[22px] font-bold text-gray-900 leading-none mb-1.5 tracking-tight">
              {formatPrice(price)}
            </p>

            {/* Address */}
            <p className="text-[13px] font-semibold text-gray-800 leading-snug">{address}</p>
            <p className="text-[12px] text-gray-400 mt-0.5 mb-3">{city}</p>

            {/* Specs row with icons */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {Number(beds) > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-gray-700">
                  <span>🛏</span>{beds} <span className="text-gray-400">bd</span>
                </span>
              )}
              {Number(beds) > 0 && Number(baths) > 0 && (
                <span className="text-gray-200 text-[10px]">·</span>
              )}
              {Number(baths) > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-gray-700">
                  <span>🛁</span>{baths} <span className="text-gray-400">ba</span>
                </span>
              )}
              {sqft && (
                <>
                  <span className="text-gray-200 text-[10px]">·</span>
                  <span className="flex items-center gap-1 text-[12px] text-gray-700">
                    <span>📐</span>{Number(sqft).toLocaleString()} <span className="text-gray-400">sqft</span>
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            {(propType || hoa || yearBuilt) && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {propType && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-500">
                    {propType}
                  </span>
                )}
                {yearBuilt && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-500">
                    Built {yearBuilt}
                  </span>
                )}
                {hoa && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-500">
                    HOA ${hoa}/mo
                  </span>
                )}
              </div>
            )}

            {/* Remarks */}
            {remarks && (
              <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {remarks}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Save to Snapz */}
              <div className="relative flex-1">
                {sparkActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <span
                        key={i}
                        className="spark-particle"
                        style={{ '--spark-angle': `${angle}deg` } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={handleThumbsUp}
                  disabled={status !== 'visible'}
                  className={`w-full h-10 rounded-xl flex items-center justify-center gap-2
                    text-[13px] font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40
                    ${status === 'added'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                    }`}
                >
                  {status === 'adding' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === 'added' ? (
                    <><Check className="w-4 h-4" /> Added</>
                  ) : (
                    <><ThumbsUp className="w-4 h-4" /> Save to Snapz</>
                  )}
                </button>
              </div>

              {/* Not for me */}
              <button
                onClick={onThumbsDown}
                disabled={status !== 'visible'}
                className="w-10 h-10 flex-shrink-0 rounded-xl bg-red-50 border border-red-100
                  flex items-center justify-center hover:bg-red-100 hover:border-red-200
                  transition-all duration-150 active:scale-95 disabled:opacity-30"
                title="Not for me"
              >
                <ThumbsDown className="w-4 h-4 text-red-400" />
              </button>
            </div>

            {/* View full listing */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-gray-400
                hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View full listing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual reel card ─────────────────────────────────────────────────────

function ReelCard({
  property,
  status,
  enterDelay,
  isClone = false,
  isDimmed = false,
  onThumbsUp,
  onThumbsDown,
  onHoverStart,
  onHoverEnd,
  onCardHover,
}: {
  property: any;
  status: CardStatus;
  enterDelay: number;
  isClone?: boolean;
  isDimmed?: boolean;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onHoverStart: (property: any, rect: DOMRect) => void;
  onHoverEnd: () => void;
  onCardHover: (hovered: boolean) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [sparkActive, setSparkActive] = useState(false);
  const cardRef             = useRef<HTMLDivElement>(null);
  const hoverTimerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOverActionsRef    = useRef(false);
  // Set to true when the 250ms timer fires while mouse is still on action buttons
  // so we can open the preview later if the mouse moves up to the content zone
  const previewSuppressedRef = useRef(false);

  const image   = getPropertyImage(property);
  const price   = getPrice(property);
  const address = getAddress(property);
  const city    = getCity(property);
  const beds    = getBeds(property);
  const baths   = getBaths(property);
  const showImg = image && !imgFailed;

  const specLine = [
    Number(beds)  > 0 ? `${beds} bd`  : null,
    Number(baths) > 0 ? `${baths} ba` : null,
  ].filter(Boolean).join(' · ');

  const handleThumbsUp = () => {
    setSparkActive(true);
    setTimeout(() => setSparkActive(false), 700);
    onThumbsUp();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Pause the reel immediately — regardless of which part of the card is hovered
    onCardHover(true);
    previewSuppressedRef.current = false;
    if (status !== 'visible') return;
    const el = e.currentTarget;
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null; // mark timer as fired
      if (!isOverActionsRef.current) {
        onHoverStart(property, el.getBoundingClientRect());
      } else {
        // Mouse is on actions buttons — remember that we suppressed the preview
        // so we can open it if the mouse later moves up to the content zone
        previewSuppressedRef.current = true;
      }
    }, 250);
  };

  const handleMouseLeave = () => {
    onCardHover(false);
    previewSuppressedRef.current = false;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    onHoverEnd();
  };

  const exitClass = status === 'added' ? 'reel-card-exit-up' : status === 'dismissed' ? 'reel-card-exit-left' : '';
  const dimClass  = isDimmed && status === 'visible' ? 'is-dimmed' : '';

  return (
    <div
      ref={cardRef}
      className={`reel-card ${isClone ? 'reel-clone' : ''} ${exitClass} ${dimClass} relative flex-shrink-0 w-[220px] rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 flex flex-col cursor-pointer`}
      style={{ animationDelay: isClone ? '0ms' : `${enterDelay}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Image ── */}
      <div className="relative h-[155px] bg-gray-200 flex-shrink-0 overflow-hidden">
        {showImg ? (
          <img
            src={image}
            alt={address}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent" />
        <p className="absolute bottom-2.5 left-3 text-white font-bold text-[17px] leading-none drop-shadow-sm">
          {formatPrice(price)}
        </p>
        {/* Hover progress bar — signals more images on hover */}
        <div className="card-img-bar" />
      </div>

      {/* ── Content ── */}
      <div className="px-3 pt-2.5 pb-1 flex-1">
        <p className="text-[12px] font-semibold text-gray-900 truncate leading-tight">{address}</p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{city}</p>
        {specLine && <p className="text-[11px] text-gray-400 mt-1">{specLine}</p>}
      </div>

      {/* ── Actions ── */}
      <div
        className="flex items-center justify-between px-4 pb-4 pt-2.5 border-t border-gray-100 mt-1"
        onMouseEnter={() => { isOverActionsRef.current = true; }}
        onMouseLeave={() => {
          isOverActionsRef.current = false;
          // Mouse moved from actions zone up to content/image — if the timer already
          // fired and was suppressed, open the preview now
          if (previewSuppressedRef.current && status === 'visible' && cardRef.current) {
            previewSuppressedRef.current = false;
            onHoverStart(property, cardRef.current.getBoundingClientRect());
          }
        }}
      >
        {/* 👍 */}
        <div className="relative">
          {sparkActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <span
                  key={i}
                  className="spark-particle"
                  style={{ '--spark-angle': `${angle}deg` } as React.CSSProperties}
                />
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleThumbsUp(); }}
            disabled={status !== 'visible'}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm
              active:scale-90 transition-all duration-150 disabled:opacity-40
              ${status === 'added'
                ? 'bg-green-500'
                : 'bg-gray-900 hover:bg-gray-700 hover:scale-105'
              }`}
            title="Save to Snapz"
          >
            {status === 'adding' ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : status === 'added' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <ThumbsUp className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* 👎 */}
        <button
          onClick={(e) => { e.stopPropagation(); onThumbsDown(); }}
          disabled={status !== 'visible'}
          className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center
            hover:bg-red-100 hover:border-red-200 hover:scale-105
            active:scale-90 transition-all duration-150 disabled:opacity-30"
          title="Not for me"
        >
          <ThumbsDown className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* ── Success overlay ── */}
      {status === 'added' && (
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 rounded-2xl">
          <div className="added-badge flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-[13px] font-semibold text-gray-800">Added to Snapz!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main reel component ──────────────────────────────────────────────────────

export default function SnapzAIReel({ properties, snapId, onPropertyAdded }: Props) {
  const [statusMap, setStatusMap] = useState<Record<string, CardStatus>>(() => {
    const m: Record<string, CardStatus> = {};
    if (Array.isArray(properties)) {
      properties.forEach((p) => {
        const id = getListingId(p);
        if (id) m[id] = 'visible';
      });
    }
    return m;
  });

  const [visibleIds, setVisibleIds] = useState<string[]>(() =>
    Array.isArray(properties) ? properties.map((p) => getListingId(p)).filter(Boolean) : [],
  );

  const [previewData,       setPreviewData]       = useState<PreviewData | null>(null);
  const [hoveredId,         setHoveredId]         = useState<string | null>(null);
  const [isAnyCardHovered,  setIsAnyCardHovered]  = useState(false);
  const [isManuallyPaused,  setIsManuallyPaused]  = useState(false);

  // Close timer — bridges the gap between card and preview so it doesn't flicker closed
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseDuration = Math.max(15, (Array.isArray(properties) ? properties.length : 0) * 6);

  const openPreview = useCallback((property: any, rect: DOMRect) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setPreviewData({ property, rect });
    setHoveredId(getListingId(property));
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setPreviewData(null);
      setHoveredId(null);
    }, 80);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const { toggleFavourite } = useUserSnapAPIs();
  const { user } = useAuth();

  const handleThumbsUp = useCallback((property: any) => {
    const listingId  = getListingId(property);
    const propertyId = getPropertyId(property);
    if (!listingId) return;

    setStatusMap((prev) => ({ ...prev, [listingId]: 'adding' }));
    if (user?.id) recordInteraction(user.id, snapId, listingId, 'liked');

    toggleFavourite.mutate(
      {
        snapId,
        propertyId: propertyId || listingId,
        listingId,
        createFavouritesInput: {
          name:       getAddress(property),
          address:    getAddress(property),
          city:       getCity(property).split(',')[0]?.trim() || '',
          price:      getPrice(property),
          image:      getPropertyImage(property),
          bedRooms:   getBeds(property),
          bathRooms:  String(getBaths(property)),
          sqft:       String(property?.listing?.property?.livingArea || ''),
          listingId,
          propertyId: propertyId || listingId,
          snapId,
        },
      },
      {
        onSuccess: (wasAdded: boolean) => {
          setStatusMap((prev) => ({ ...prev, [listingId]: 'added' }));
          setTimeout(() => {
            setVisibleIds((prev) => prev.filter((id) => id !== listingId));
            setPreviewData((prev) =>
              prev && getListingId(prev.property) === listingId ? null : prev,
            );
            setHoveredId((prev) => (prev === listingId ? null : prev));
          }, 950);
          if (wasAdded) onPropertyAdded();
        },
        onError: () => setStatusMap((prev) => ({ ...prev, [listingId]: 'visible' })),
      },
    );
  }, [user, snapId, toggleFavourite, onPropertyAdded]);

  const handleThumbsDown = useCallback((property: any) => {
    const listingId = getListingId(property);
    if (user?.id) recordInteraction(user.id, snapId, listingId, 'dismissed');

    setStatusMap((prev) => ({ ...prev, [listingId]: 'dismissed' }));
    setTimeout(() => {
      setVisibleIds((prev) => prev.filter((id) => id !== listingId));
      setPreviewData((prev) =>
        prev && getListingId(prev.property) === listingId ? null : prev,
      );
      setHoveredId((prev) => (prev === listingId ? null : prev));
    }, 420);
  }, [user, snapId]);

  const visibleProperties = properties.filter((p) =>
    visibleIds.includes(getListingId(p)),
  );

  // Only autoscroll when there are more than 8 recommendations — fewer cards just sit still
  const shouldMarquee = visibleProperties.length > 8;
  // Pause when: preview is open OR any card is hovered (including over action buttons)
  const isPaused      = !shouldMarquee || previewData !== null || isAnyCardHovered || isManuallyPaused;

  const renderCard = (property: any, idx: number, isClone: boolean) => {
    const listingId = getListingId(property);
    const isDimmed  = hoveredId !== null && hoveredId !== listingId;
    return (
      <ReelCard
        key={isClone ? `clone-${listingId || idx}` : (listingId || idx)}
        property={property}
        status={statusMap[listingId] || 'visible'}
        enterDelay={isClone ? 0 : idx * 75}
        isClone={isClone}
        isDimmed={isDimmed}
        onThumbsUp={() => handleThumbsUp(property)}
        onThumbsDown={() => handleThumbsDown(property)}
        onHoverStart={openPreview}
        onHoverEnd={scheduleClose}
        onCardHover={setIsAnyCardHovered}
      />
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: REEL_CSS }} />

      {shouldMarquee ? (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsManuallyPaused((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              isManuallyPaused
                ? 'border-orange-200 bg-orange-50 text-[#F58634] hover:bg-orange-100'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={isManuallyPaused ? 'Resume carousel autoplay' : 'Pause carousel autoplay'}
            title={isManuallyPaused ? 'Resume carousel' : 'Pause carousel'}
          >
            {isManuallyPaused ? (
              <>
                <Play className="h-3.5 w-3.5" />
                Play
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                Stop
              </>
            )}
          </button>
        </div>
      ) : null}

      {visibleProperties.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-gray-400">You&apos;ve reviewed all AI picks — great job!</p>
        </div>
      ) : shouldMarquee ? (
        /* ── Marquee mode: > 8 homes ── */
        <div className="reel-viewport">
          <div
            className={`reel-track ${isPaused ? 'is-paused' : ''}`}
            style={{ '--reel-duration': `${baseDuration}s` } as React.CSSProperties}
          >
            {visibleProperties.map((p, i) => renderCard(p, i, false))}
            {visibleProperties.map((p, i) => renderCard(p, i, true))}
          </div>
        </div>
      ) : (
        /* ── Static mode: ≤ 8 homes — plain scrollable row, no animation ── */
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {visibleProperties.map((p, i) => renderCard(p, i, false))}
          </div>
        </div>
      )}

      {/* Quick Look — rendered outside viewport so it's never clipped by overflow:hidden */}
      {previewData && (
        <HoverPreview
          data={previewData}
          status={statusMap[getListingId(previewData.property)] || 'visible'}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onThumbsUp={() => handleThumbsUp(previewData.property)}
          onThumbsDown={() => handleThumbsDown(previewData.property)}
        />
      )}
    </>
  );
}
