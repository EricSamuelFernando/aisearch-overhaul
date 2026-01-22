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

type PropertyCardsProps = IProperty & {
  isWishlisted?: boolean;
};

const FavouritePropertyCards = (props: any) => {
  const { saveCurrenctProperty } = usePropertyActions();
  const router = useRouter();
  const [carouselEvent, setCarouselEvent] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  // Default to true since this is the favourites card, but respect prop if passed
  const isWishlisted = props.isWishlisted !== undefined ? props.isWishlisted : true;

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

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentsModal(true);
  };

  return (
    <div
      onClick={handleClick}
      className="flex w-full min-h-[520px] max-h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl bg-black border border-gray-800 hover:border-ocOrange group relative"
    >
      <div className="relative h-60 w-full overflow-hidden">
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

      <div className="flex flex-1 flex-col justify-between p-5 space-y-3 group-hover:bg-black transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300">
            {formatCurrency(props?.price || 0, 'USD')}
          </h3>
          {isWishlisted && (
            <div onClick={handleCommentClick} className="cursor-pointer hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-[#FF8700]" />
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
            />
          </div>
        )}

        <p className="text-sm text-gray-300">{props?.name || 'Property Name'}</p>

        <div className="text-sm text-white leading-snug">
          <p className="font-medium">{props?.address || 'Address not available'}</p>
          <p>{props?.address || ''}, {props?.zipCode || ''}</p>
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


