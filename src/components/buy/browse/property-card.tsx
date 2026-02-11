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

const PropertyCards = (props: any) => {
  const { saveCurrenctProperty } = usePropertyActions();
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);
  const { openCollectionModal } = useCollectionModal();
  const { isLoggedIn } = useAuth();
  const userData = useSelector((state: any) => state.auth.user);
  const { getAllSnaps } = useUserSnapAPIs();
  const [snaps, setSnaps] = useState<any[]>([]);

  const fetchSnaps = () => {
    if (userData?.id) {
      getAllSnaps.mutate(userData.id, {
        onSuccess: (data) => {
          setSnaps(data);
        },
      });
    }
  };

  useEffect(() => {
    fetchSnaps();
  }, [userData?.id]);

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

  const handleClick = () => {
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

  return (
    <div
      onClick={handleClick}
      className="relative w-full min-h-[380px] cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-800 hover:border-ocOrange group"
    >
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

      {statusInfo ? (
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold z-10 ${statusInfo.className}`}
        >
          {statusInfo.label}
        </div>
      ) : null}

      <div className="absolute top-4 right-4 z-10">
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

      {/* Bottom Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 h-[210px] bg-black/90 p-4 rounded-b-2xl flex flex-col justify-between">
        {/* Price */}
        <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300 mb-0">
          {formatCurrency(props?.listing?.listPriceLow || 0, 'USD').replace('$', '$ ')}
        </h3>

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
