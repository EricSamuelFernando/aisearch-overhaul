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
  const { openCollectionModal } = useCollectionModal();
  const { isLoggedIn } = useAuth();
  const userData = useSelector((state: any) => state.auth.user);

  // Comparison Store
  const { isCompareMode, toggleCompareProperty, selectedCompareProperties } = usePropertyStore();

  const isSelectedForCompare = selectedCompareProperties.some((p: any) => {
    // Robust ID check
    const pId = p.data.id || p.data._id || p.data.ListingKey;
    // props might be wrapped (props.data) or unwrapped (props)
    const propData = props.data || props;
    const myId = propData.id || propData._id || propData.listingId || propData.listing?.listingId;
    return pId == myId; // loose equality
  });


  const slides = props?.listing?.media?.photosList?.slice(0, 6)?.map((image: any, idx: number) => {
    if (!image?.lowRes) return null;
    return (
      <div key={idx} className="relative w-full h-full aspect-video min-h-[200px]">
        <NImage
          src={image.lowRes}
          alt="snaphomz-property-image"
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  });

  // Helper to get nested property data if props is wrapped
  const getProp = (path: string[]) => {
    let current = props.data || props;
    for (const key of path) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    return current;
  };

  // NOTE: Existing code uses props.listing directly. 
  // If props is wrapped, this fails. 
  // But we are only fixing Comparison logic here.

  const hasCarousel = Array.isArray(props?.listing?.media?.photosList) && props.listing.media.photosList.length > 0;

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

  const statusInfo = getStatusInfo(props?.listing);
  const propertyId = props?.id ?? props?.propertyId ?? props?.listingId;
  const listing = props?.listing ?? props?.data?.listing ?? {};
  const address = listing?.address ?? {};
  const property = listing?.property ?? {};
  const primaryImage =
    listing?.media?.primaryListingImageUrl ||
    props?.public?.imageUrl ||
    props?.image ||
    '/assets/images/placeholder.svg';
  const priceText = formatCurrency(listing?.listPriceLow || listing?.listPrice || 0, 'USD').replace('$', '$');
  const beds = property?.bedroomsTotal ?? 0;
  const baths = property?.bathroomsTotal ?? 0;
  const sqft = property?.livingArea ?? 0;
  const propertyTypeLabel =
    listing?.propertyType ||
    property?.propertyType ||
    property?.propertySubType ||
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
        const listingIdMatch = favourite?.listingId == props?.listingId;
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
      saveCurrenctProperty(props);
      router.push(`/buy/${props.listingId}/prop/preview`);
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
        className={`relative flex h-full min-h-[260px] w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
          isSelectedForCompare ? 'border-orange-400' : 'border-gray-200'
        }`}
      >
        {isCompareMode && (
          <div className="absolute left-3 top-3 z-50">
            <button
              disabled={selectedCompareProperties.length >= 4 && !isSelectedForCompare}
              onClick={(e) => {
                e.stopPropagation();
                const realData = props.data || props;
                toggleCompareProperty({ data: realData, type: 'property' });
              }}
              className={`rounded-full p-1.5 shadow ${
                isSelectedForCompare
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/90 text-gray-600'
              }`}
            >
              {isSelectedForCompare ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
          </div>
        )}

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          {hasCarousel && slides?.length ? (
            <div className="relative h-full">
              <EmblaCarousel
                slides={slides}
                options={{ loop: true }}
                onScrollButtonClick={handleCarouselButtonClick}
              />
            </div>
          ) : (
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
          )}

          {!isCompareMode && statusInfo ? (
            <div className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${statusInfo.className}`}>
              {statusInfo.label}
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
            {[address?.unparsedAddress, address?.city && `${address.city},`, address?.stateOrProvince, address?.zipCode]
              .filter(Boolean)
              .join(' ')}
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
        {hasCarousel && slides?.length ? (
          <div className="relative h-full">
            <EmblaCarousel
              slides={slides}
              options={{ loop: true }}
              onScrollButtonClick={handleCarouselButtonClick}
            />
          </div>
        ) : (
          <div className="relative h-full w-full">
            <NImage
              className="h-full w-full object-cover object-center rounded-2xl"
              fill
              loader={imageLoader}
              alt="snaphomz-property-image"
              src={
                props?.listing?.media?.primaryListingImageUrl
                  ? props?.listing?.media?.primaryListingImageUrl
                  : '/assets/images/placeholder.svg'
              }
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/images/placeholder.svg';
              }}
            />
          </div>
        )}
      </div>

      {!isCompareMode && statusInfo ? (
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold z-10 ${statusInfo.className}`}
        >
          {statusInfo.label}
        </div>
      ) : null}

      {/* Bottom Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 h-[210px] bg-black/90 p-4 rounded-b-2xl flex flex-col justify-between">
        {/* Price + Snapz icon */}
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300 mb-0">
            {formatCurrency(props?.listing?.listPriceLow || 0, 'USD').replace('$', '$ ')}
          </h3>
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
        </div>

        {/* Address */}
        <div className="text-sm text-white mb-0.5 leading-tight">
          <p>
            {props?.listing?.address?.unparsedAddress}
            {props?.listing?.address?.unparsedAddress ? ', ' : ''}
            {props?.listing?.address?.city}, {props?.listing?.address?.stateOrProvince}{' '}
            {props?.listing?.address?.zipCode}
          </p>
        </div>

        {/* Property Details - Horizontal Layout with Icons */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2.5">
            <BedDouble className="w-6 h-6 text-white/80" />
            <span className="text-white text-lg font-semibold">
              {props?.listing?.property?.bedroomsTotal || 0} Bed
            </span>
          </div>

          <span className="text-white text-xs font-extrabold translate-y-3.5">&bull;</span>

          <div className="flex flex-col items-center gap-2.5">
            <Bath className="w-6 h-6 text-white/80" />
            <span className="text-white text-lg font-semibold">
              {props?.listing?.property?.bathroomsTotal || 0} Bath
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
              {props?.listing?.property?.livingArea || 0} sqft
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCards;
