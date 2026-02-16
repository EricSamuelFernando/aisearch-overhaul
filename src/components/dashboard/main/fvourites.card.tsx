'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { IProperty } from '@/interfaces/property.interface';
import { formatCurrency } from '@/lib/utils';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import NImage from 'next/image';
import { imageLoader } from '@/utils/image-loader';
import { Icons } from '@/components/icons';
import { useAppSelector } from '@/lib/hook';
import EmblaCarousel from '@/components/customs/carousel/embla-carousel';
import { useRouter } from 'next/navigation';
import { Bath, BedDouble, Ruler, Heart, MessageCircle } from 'lucide-react';
import CommentsModal from '@/components/modals/comments-modal';
import { parseAddressComponents, getStateFromZip } from '@/utils/addressParser';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';

type PropertyCardsProps = IProperty & {
  isWishlisted?: boolean;
  compareMode?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onSelect?: (id: string) => void;
};

const FavouritePropertyCards = (props: any) => {
  const { saveCurrenctProperty } = usePropertyActions();
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  // Default to true since this is the favourites card, but respect prop if passed
  const isWishlisted = props.isWishlisted !== undefined ? props.isWishlisted : true;
  const { compareMode, isSelected, isDisabled, onSelect } = props;

  // Get state from zip code since old favorites don't have city/state in database
  const displayCity = props?.city; // Will be null for old favorites
  const displayState = getStateFromZip(props?.zipCode);

  const { markPropertyAsRead } = useUserSnapAPIs();

  const slides = props?.listing?.media?.photosList?.slice(0, 4)?.map((image: any, idx: number) => {
    if (!image?.lowRes) return (
      <div key={idx} className="relative w-full h-full aspect-video bg-gray-200 flex items-center justify-center text-gray-500">
        No Image
      </div>
    );
    return (
      <div key={idx} className="relative w-full h-full aspect-video">
        <NImage
          src={image.lowRes}
          alt={props?.name || "Property Image"}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  });

  const handleClick = (e: React.MouseEvent) => {
    if (compareMode) {
      if (!isDisabled || isSelected) {
        onSelect?.(props.listingId || props.id);
      }
      return;
    }
    if (!carouselEvent) {
      // Destructure to remove non-serializable function before saving to Redux
      const { onCommentAdded, ...serializableProps } = props;
      saveCurrenctProperty(serializableProps);
      router.push(`/buy/${props.listingId}/prop/preview`);
    }
  };

  const handleCarouselButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselEvent(true);
    setTimeout(() => setCarouselEvent(false), 300);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentsModal(true);
    if (props.unreadCommentCount > 0 && props.snapId && props.propertyId) {
      markPropertyAsRead.mutate(
        { snapId: props.snapId, propertyId: props.propertyId },
        {
          onSuccess: () => {
            if (props.onRead) props.onRead();
          }
        }
      );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex w-full min-h-[380px] sm:min-h-[420px] max-h-[420px] cursor-pointer flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl bg-black border group relative transition-all duration-200
        ${compareMode
          ? isSelected
            ? 'border-[#FF8700] border-2 shadow-[0_0_0_3px_rgba(255,135,0,0.25)]'
            : isDisabled
              ? 'border-gray-800 opacity-40 cursor-not-allowed'
              : 'border-gray-800 hover:border-[#FF8700]'
          : 'border-gray-800 hover:border-ocOrange'
        }`}
    >
      {/* Compare Mode Selection Overlay */}
      {compareMode && (
        <div className="absolute top-3 right-12 z-30 pointer-events-none">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected
              ? 'bg-[#FF8700] border-[#FF8700]'
              : 'bg-white/80 border-gray-300'
            }`}
          >
            {isSelected && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      )}
      {compareMode && isDisabled && (
        <div className="absolute inset-0 z-20 bg-black/30 rounded-xl pointer-events-none" />
      )}
      <div className="relative h-48 w-full overflow-hidden">
        {isWishlisted && (
          <div className="absolute top-3 right-3 z-20">
            <Heart className="w-6 h-6 text-[#FF8700] fill-[#FF8700]" />
          </div>
        )}
        {props?.listing?.media?.photosList?.length ? (
          <div className="relative h-full">
            <EmblaCarousel
              slides={slides}
              options={{ loop: true }}
              onScrollButtonClick={handleCarouselButtonClick}
            />
            <div className="absolute top-3 left-3 bg-ocOrange px-2 py-1 rounded-md shadow-sm z-10">
              <span className="text-white text-xs font-bold">
                {props?.listing?.standardStatus || 'FOR SALE'}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <NImage
              className="h-full w-full object-cover object-center"
              fill
              loader={imageLoader}
              alt={props?.name || 'Property Image'}
              src={props?.image || '/assets/images/placeholder.svg'}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/images/placeholder.svg';
              }}
            />
            <div className="absolute top-3 left-3 bg-ocOrange px-2 py-1 rounded-md">
              <span className="text-white text-xs font-bold">{props?.status || 'Opened'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-start p-4 gap-2 group-hover:bg-black transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300">
            {formatCurrency(props?.price || 0, 'USD')}
          </h3>
          {isWishlisted && (
            <div onClick={handleCommentClick} className="relative cursor-pointer hover:scale-110 transition-transform flex items-center justify-center w-8 h-8 bg-[#FF8700] rounded-full shadow-sm">
              <MessageCircle className="w-5 h-5 text-white fill-white" />
              {props.unreadCommentCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                  {props.unreadCommentCount > 9 ? '9+' : props.unreadCommentCount}
                </div>
              )}
            </div>
          )}
        </div>

        {showCommentsModal && (
          <div onClick={(e) => e.stopPropagation()}>
            <CommentsModal
              isOpen={showCommentsModal}
              onClose={() => setShowCommentsModal(false)}
              property={props}
              snapId={props.snapId} // Pass snapId prop
              onCommentAdded={props.onCommentAdded}
              userSnapRole={props.userSnapRole}
            />
          </div>
        )}

        {/* <p className="text-sm text-gray-300">{props?.name || 'Property Name'}</p> */}

        <div className="text-sm text-white leading-snug">
          <p className="font-medium">{props?.address || 'Address not available'}</p>
          <p>
            {displayCity && `${displayCity}, `}
            {displayState && `${displayState} `}
            {props?.zipCode}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
          {[
            { icon: <BedDouble className="w-4 h-4 text-ocOrange" />, value: props?.bedRooms || 0, unit: 'Bed' },
            { icon: <Bath className="w-4 h-4 text-ocOrange" />, value: props?.bathRooms || 0, unit: 'Bath' },
            { icon: <Ruler className="w-4 h-4 text-ocOrange" />, value: props?.livingArea || props?.sqft || 0, unit: 'sqft' },
          ].map((item, index) => (
            <div key={index} className="flex flex-col text-center w-1/3">
              {item.icon}
              <div className="flex items-center gap-1 mt-1 text-white text-base font-semibold">
                <span>{item.value}</span>
                <span className="text-xs text-gray-400">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavouritePropertyCards;


