'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import NImage from 'next/image';
import { imageLoader } from '@/utils/image-loader';
import EmblaCarousel from '@/components/customs/carousel/embla-carousel';
import { useRouter } from 'next/navigation';
import { Bath, BedDouble, Ruler } from 'lucide-react';
import { useCollectionModal } from '@/providers/collection-modal-provider';
import { useAuth } from '@/shared/hooks/useAuth';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { SnapzHeartButton } from '@/components/ui/snapz-heart';
import { useSelector } from 'react-redux';

import { usePropertyStore } from '@/store/use-property-store';
import { CheckSquare, Square } from 'lucide-react';

const PropertyCards = (props: any) => {
  const { snaps, fetchSnaps } = props;
  const isOverlayMode = !!props.overlayMode;
  const { saveCurrenctProperty } = usePropertyActions();
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openCollectionModal } = useCollectionModal();
  const { isLoggedIn } = useAuth();
  const userData = useSelector((state: any) => state.auth.user);

  // Comparison Store
  const { isCompareMode, toggleCompareProperty, selectedCompareProperties } = usePropertyStore();

  // Unified prop unwrap
  const d = props.data || props;

  const isSelectedForCompare = selectedCompareProperties.some((p: any) => {
    // Robust ID check
    const pId = p.data?.id || p.data?._id || p.data?.ListingKey || p.data?.listingId || p.data?.ListingId;
    const myId = d.id || d._id || d.listingId || d.listing?.listingId || d.ListingKey || d.ListingId;
    return pId == myId; // loose equality
  });

  // Parse Neo4j photoList (stored as a JSON string in Neo4j, or already an array from MLS)
  const _rawPhotoList = d?.photoList;
  const _parsedPhotoList: any[] | null = (() => {
    if (Array.isArray(_rawPhotoList)) return _rawPhotoList;
    if (typeof _rawPhotoList === 'string') {
      try { return JSON.parse(_rawPhotoList); } catch { return null; }
    }
    return null;
  })();

  // Unified photo list: MLS nested → MLS flat → Neo4j parsed string
  const _photosList =
    d?.listing?.media?.photosList ??
    d?._raw_listing?.media?.photosList ??
    d?.photos ??
    _parsedPhotoList;
  const slides = _photosList?.slice(0, 6)?.map((image: any, idx: number) => {
    // Support both {lowRes: "url"} objects (Neo4j) and plain URL strings (MLS flat)
    const src = typeof image === 'string' ? image : image?.lowRes;
    if (!src) return null;
    return (
      <div key={idx} className="relative w-full h-full aspect-video min-h-[200px]">
        <NImage
          src={src}
          alt="snaphomz-property-image"
          fill
          loader={imageLoader}
          className="object-cover"
        />
      </div>
    );
  });

  // // Helper to get nested property data if props is wrapped
  // const getProp = (path: string[]) => {
  //   let current = props.data || props;
  //   for (const key of path) {
  //     if (current === undefined || current === null) return undefined;
  //     current = current[key];
  //   }
  //   return current;
  // };

  // // NOTE: Existing code uses props.listing directly. 
  // // If props is wrapped, this fails. 
  // // But we are only fixing Comparison logic here.

  // const hasCarousel = Array.isArray(props?.listing?.media?.photosList) && props.listing.media.photosList.length > 0;

  const hasCarousel = Array.isArray(slides) && slides.some(s => s !== null);
  const showCarousel = hasCarousel && !!slides?.length && isHovered;

  const getStatusInfo = (listing: any) => {
    const rawStatus =
      listing?.standardStatus ??
      listing?.StandardStatus ??
      listing?.mlsStatus ??
      listing?.MlsStatus ??
      listing?.mostRecentStatus ??
      listing?.currentStatus ??
      listing?.status ??
      '';

    const status = typeof rawStatus === 'string' ? rawStatus.trim() : '';
    const normalized = status.replace(/[_-]/g, ' ').toLowerCase();
    const compact = normalized.replace(/\s+/g, '');

    const openHouse =
      listing?.openHouse ??
      listing?.OpenHouse ??
      listing?.openHouses ??
      listing?.open_houses ??
      null;

    const hasOpenHouse =
      (typeof openHouse === 'string' && openHouse.trim().length > 0) ||
      (Array.isArray(openHouse) && openHouse.length > 0) ||
      (!!openHouse && typeof openHouse === 'object');

    if (normalized.includes('sold') || normalized.includes('closed')) {
      return { label: 'Sold', className: 'bg-red-600 text-white' };
    }
    if (
      normalized.includes('contingent') ||
      normalized.includes('pending') ||
      normalized.includes('under contract') ||
      compact.includes('undercontract')
    ) {
      return { label: 'In Contingent', className: 'bg-amber-500 text-white' };
    }
    if (hasOpenHouse) {
      return { label: 'Open for tour', className: 'bg-ocOrange text-white' };
    }
    if (normalized.includes('active')) {
      return { label: 'Active', className: 'bg-[#78de2a] text-black' };
    }
    if (status) {
      return { label: status, className: 'bg-gray-700 text-white' };
    }
    return null;
  };

  const listing = d?.listing ?? d?._raw_listing ?? d;
  // Merge Neo4j top-level homeStatus / status into statusObj so getStatusInfo can read it
  const statusObj = {
    ...listing,
    standardStatus: listing?.standardStatus ?? listing?.status ?? d?.homeStatus ?? d?.status,
  };
  const statusInfo = getStatusInfo(statusObj);
  const isActiveStatusBadge = (statusInfo?.label ?? '').toLowerCase() === 'active';
  const statusBadgeBaseClass = statusInfo?.className ?? 'bg-gray-700 text-white';
  const propertyId = d?.id ?? d?.propertyId ?? d?.listingId ?? d?.ListingKey ?? d?.ListingId;

  const address = listing?.address ?? {};
  const property = listing?.property ?? {};
  const primaryImage =
    listing?.media?.primaryListingImageUrl ||
    d?.primaryListingImageUrl ||
    d?.primaryImage ||
    d?.public?.imageUrl ||
    d?._raw_public?.imageUrl ||
    d?.image_url ||
    d?.image ||
    '/assets/images/placeholder.svg';

  const priceText = formatCurrency(listing?.listPriceLow || listing?.listPrice || d?.price || 0, 'USD').replace('$', '$');
  // Flat-format fallbacks: d.beds / d.baths from MLS; bedroomTotal / bathroomTotal from Neo4j
  const beds = property?.bedroomsTotal ?? d?.bedroomTotal ?? d?.beds ?? d?.bedrooms ?? 0;
  const baths = property?.bathroomsTotal ?? d?.bathroomTotal ?? d?.baths ?? d?.bathrooms ?? 0;
  const sqft = property?.livingArea ?? d?.sqft ?? d?.livingArea ?? 0;
  const propertyTypeLabel =
    listing?.propertyType ||
    property?.propertyType ||
    property?.propertySubType ||
    d?.homeType ||
    d?.property_type ||
    d?.home_type ||
    'House';
  const compactStatusLabel =
    statusInfo?.label === 'Active'
      ? 'House for sale'
      : statusInfo?.label
        ? `${statusInfo.label}`
        : 'For sale';
  const brokerageLabel =
    listing?.attribution?.brokerName ||
    listing?.attribution?.officeName ||
    listing?.office?.name ||
    listing?.listingOfficeName ||
    listing?.listOfficeName ||
    '';

  const isPropertyInFavourite = (snapsList: any[]) => {
    if (!Array.isArray(snapsList)) {
      return false;
    }
    const isAvailable = snapsList.some((snap: any) =>
      snap?.favourites?.some((favourite: any) => {
        const propertyIdMatch = favourite?.propertyId == propertyId;
        const listingIdMatch = favourite?.listingId == d?.listingId || favourite?.listingId == d?.ListingKey;
        return propertyIdMatch || listingIdMatch;
      })
    );
    return isAvailable;
  };

  const isFavored = isPropertyInFavourite(snaps);

  const handleClick = (e: React.MouseEvent) => {
    // If in compare mode, toggle selection instead of navigating
    if (isCompareMode) {
      e.preventDefault();
      e.stopPropagation();

      // Unwrap data if necessary
      const realData = props.data || props;

      toggleCompareProperty({
        data: realData,
        type: 'property'
      });
      return;
    }

    if (!carouselEvent) {
      saveCurrenctProperty(d);
      const targetId = d?.listingId || d?.id || d?.ListingKey || d?._id;
      router.push(`/buy/${targetId}/prop/preview`);
    }
  };

  const handleCarouselButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselEvent(true);
    setTimeout(() => setCarouselEvent(false), 300);
  };

  if (isOverlayMode) {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex h-full min-h-[260px] w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${isSelectedForCompare ? 'border-orange-400' : 'border-gray-200'
          }`}
      >
        {isCompareMode && (
          <div className="absolute left-3 top-3 z-50 flex items-center gap-2">
            <button
              disabled={selectedCompareProperties.length >= 4 && !isSelectedForCompare}
              onClick={(e) => {
                e.stopPropagation();
                const realData = props.data || props;
                toggleCompareProperty({ data: realData, type: 'property' });
              }}
              className={`rounded-full p-1.5 shadow transition-all duration-200 ${isSelectedForCompare
                ? 'bg-orange-500 text-white'
                : 'bg-white/90 text-gray-600'
                }`}
            >
              {isSelectedForCompare ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm transition-all duration-200 ${isSelectedForCompare
                ? 'bg-orange-500 text-white'
                : selectedCompareProperties.length >= 4
                  ? 'bg-white/80 text-gray-400'
                  : 'bg-white/90 text-black'
                }`}
            >
              {isSelectedForCompare ? 'Selected' : selectedCompareProperties.length >= 4 ? 'Limit Reached' : 'Compare'}
            </span>
          </div>
        )}

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <NImage
            className="object-cover object-center"
            fill
            loader={imageLoader}
            alt="snaphomz-property-image"
            src={primaryImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/images/placeholder.svg';
            }}
          />

          {showCarousel ? (
            <div className="absolute inset-0">
              <EmblaCarousel
                slides={slides}
                options={{ loop: true }}
                onScrollButtonClick={handleCarouselButtonClick}
                controlsVisibility="always"
              />
            </div>
          ) : null}

          {!isCompareMode && statusInfo ? (
            <div
              className={`absolute left-2 top-2 z-10 text-[10px] font-semibold ${isActiveStatusBadge ? 'pointer-events-none' : `rounded-full px-2 py-0.5 shadow-sm ${statusBadgeBaseClass}`
                }`}
            >
              {isActiveStatusBadge ? (
                <NImage
                  src="/assets/images/sale_1441375.svg"
                  alt="For sale"
                  width={192}
                  height={192}
                  className="sale-sign-badge h-11 w-11 md:h-12 md:w-12"
                />
              ) : statusInfo.label}
            </div>
          ) : null}

          {!isCompareMode && (
            <div className="absolute right-2 top-2 z-10">
              <SnapzHeartButton
                isActive={isFavored}
                size={16}
                onClick={(event) => {
                  event.stopPropagation();
                  if (isLoggedIn) {
                    saveCurrenctProperty(props);
                    const propertyImage =
                      listing?.media?.primaryListingImageUrl ||
                      props?.public?.imageUrl ||
                      props?.image ||
                      '/assets/images/property-placeholder.jpg';
                    openCollectionModal(propertyId?.toString(), propertyImage, fetchSnaps);
                  } else {
                    router.push('/login');
                  }
                }}
                className="rounded-full bg-white/95 p-1 text-gray-800 shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-2.5">
          <div className="text-[15px] font-bold leading-none text-gray-900">
            {priceText}
          </div>

          <div className="mt-1.5 text-[11px] leading-4 text-gray-600">
            <span>{beds} bds</span>
            <span className="mx-1 text-gray-400">|</span>
            <span>{baths} ba</span>
            <span className="mx-1 text-gray-400">|</span>
            <span>{sqft?.toString() || 0} sqft</span>
            <span className="mx-1 text-gray-400">|</span>
            <span>{compactStatusLabel}</span>
          </div>

          <div className="mt-1.5 min-h-[2rem] line-clamp-2 text-[12px] leading-4 text-gray-800">
            {/* {[address?.unparsedAddress, address?.city && `${address.city},`, address?.stateOrProvince, address?.zipCode]
              .filter(Boolean)
              .join(' ')} */}
            {[
              address?.unparsedAddress ?? props?.unparsedAddress,
              (address?.city ?? props?.city) ? `${address?.city ?? props?.city},` : null,
              address?.stateOrProvince ?? props?.state,
              address?.zipCode ?? props?.zipCode,
            ].filter(Boolean).join(' ')}
          </div>

          <div className="mt-1.5 truncate text-[10px] uppercase tracking-wide text-gray-400">
            {brokerageLabel || propertyTypeLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full min-h-[380px] cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border 
      ${isSelectedForCompare ? 'border-4 border-ocOrange' : 'border-gray-800 hover:border-ocOrange'} group`}
    >
      {/* Compare Mode Checkbox Overlay */}
      {isCompareMode && (
        <div className="absolute top-4 left-4 z-50">
          <button
            disabled={selectedCompareProperties.length >= 4 && !isSelectedForCompare}
            onClick={(e) => {
              e.stopPropagation();
              // Unwrap if necessary
              const realData = props.data || props;
              toggleCompareProperty({
                data: realData,
                type: 'property'
              });
            }}
            className={`p-2 rounded-full transition-all duration-200 ${isSelectedForCompare
              ? 'bg-ocOrange text-white'
              : selectedCompareProperties.length >= 4
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white/80 text-gray-500 hover:bg-white hover:text-ocOrange'
              }`}
          >
            {isSelectedForCompare ? <CheckSquare size={24} /> : <Square size={24} />}
            {isSelectedForCompare && <span className="sr-only">Selected</span>}
          </button>
          <span
            className={`ml-2 px-2 py-1 rounded-md text-sm font-bold shadow-sm transition-all duration-200 ${isSelectedForCompare
              ? 'bg-ocOrange text-white'
              : selectedCompareProperties.length >= 4
                ? 'bg-gray-100 text-gray-400 opacity-50'
                : 'bg-white/80 text-black'
              }`}
          >
            {isSelectedForCompare ? 'Selected' : selectedCompareProperties.length >= 4 ? 'Limit Reached' : 'Compare'}
          </span>
        </div>
      )}

      {/* Full Image Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative h-full w-full">
          <NImage
            className="h-full w-full object-cover object-center rounded-2xl"
            fill
            loader={imageLoader}
            alt="snaphomz-property-image"
            src={primaryImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/images/placeholder.svg';
            }}
          />
        </div>

        {showCarousel ? (
          <div className="absolute inset-0">
            <EmblaCarousel
              slides={slides}
              options={{ loop: true }}
              onScrollButtonClick={handleCarouselButtonClick}
              controlsVisibility="always"
            />
          </div>
        ) : null}
      </div>

      {!isCompareMode && statusInfo ? (
        <div
          className={`absolute top-3 left-3 text-sm font-semibold z-10 ${isActiveStatusBadge ? 'pointer-events-none' : `rounded-full px-3 py-1 ${statusBadgeBaseClass}`
            }`}
        >
          {isActiveStatusBadge ? (
            <NImage
              src="/assets/images/sale_1441375.svg"
              alt="For sale"
              width={224}
              height={224}
              className="sale-sign-badge h-12 w-12 md:h-14 md:w-14"
            />
          ) : statusInfo.label}
        </div>
      ) : null}

      {/* Bottom Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 h-[210px] bg-black/90 p-4 rounded-b-2xl flex flex-col justify-between">
        {/* Price + Snapz icon */}
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300 mb-0">
            {formatCurrency(listing?.listPriceLow ?? listing?.listPrice ?? props?.price ?? 0, 'USD').replace('$', '$ ')}
          </h3>
          {!isCompareMode && (
            <SnapzHeartButton
              isActive={isFavored}
              size={20}
              onClick={(event) => {
                event.stopPropagation();
                if (isLoggedIn) {
                  saveCurrenctProperty(props);
                  const propertyImage =
                    props?.listing?.media?.primaryListingImageUrl ||
                    props?.public?.imageUrl ||
                    props?.image ||
                    '/assets/images/property-placeholder.jpg';
                  openCollectionModal(propertyId?.toString(), propertyImage, fetchSnaps);
                } else {
                  router.push('/login');
                }
              }}
              className="text-white"
            />
          )}
        </div>

        {/* Address */}
        <div className="text-sm text-white mb-0.5 leading-tight">
          <p>
            {address?.unparsedAddress ?? props?.unparsedAddress}
            {(address?.unparsedAddress ?? props?.unparsedAddress) ? ', ' : ''}
            {address?.city ?? props?.city}, {address?.stateOrProvince ?? props?.state}{' '}
            {address?.zipCode ?? props?.zipCode}
          </p>
        </div>

        {/* Property Details - Horizontal Layout with Icons */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2.5">
            <BedDouble className="w-6 h-6 text-white/80" />
            <span className="text-white text-lg font-semibold">
              {beds} Bed
            </span>
          </div>

          <span className="text-white text-xs font-extrabold translate-y-3.5">&bull;</span>

          <div className="flex flex-col items-center gap-2.5">
            <Bath className="w-6 h-6 text-white/80" />
            <span className="text-white text-lg font-semibold">
              {baths} Bath
            </span>
          </div>

          <span className="text-white text-xs font-extrabold translate-y-3.5">&bull;</span>

          <div className="flex flex-col items-center gap-2.5">
            <NImage
              src="/assets/images/area-white.svg"
              alt="sqft"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-white text-lg font-semibold">
              {sqft} sqft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCards;
