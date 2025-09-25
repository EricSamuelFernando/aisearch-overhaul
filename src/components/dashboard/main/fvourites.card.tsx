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
import { Bath, BedDouble, Ruler } from 'lucide-react';

type PropertyCardsProps = IProperty;

const FavouritePropertyCards = (props: any) => {
  const { saveCurrenctProperty } = usePropertyActions();
  const router = useRouter();
  const { propertyQuery } = useAppSelector((state) => state.property);
  const [carouselEvent, setCarouselEvent] = useState(false);

  const slides = props?.listing?.media?.photosList?.slice(0, 4)?.map((image: any, idx: number) => {
    if (!image?.lowRes) return null;
    return (
      <div key={idx} className="relative w-full h-full aspect-video">
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

  return (
    <div
      onClick={handleClick}
      className="flex w-full min-h-[520px] max-h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-black border border-gray-800 hover:border-ocOrange hover:scale-[1.02] group"
    >
      <div className="relative h-60 w-full overflow-hidden">
        {props?.listing?.media?.photosList?.length ? (
          <div className="relative h-full">
            <EmblaCarousel
              slides={slides}
              options={{ loop: true }}
              onScrollButtonClick={handleCarouselButtonClick}
            />
            <div className="absolute top-3 left-3 bg-ocOrange px-2 py-1 rounded-md shadow-sm">
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
              alt="snaphomz-property-image"
              src={props?.image}
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

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3 group-hover:bg-black transition-colors duration-300">
        {/* Price */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300">
            {formatCurrency(props?.price || 0, 'USD')}
          </h3>
        </div>

        {/* Courtesy */}
        <p className="text-sm text-gray-300">{props?.name}</p>

        {/* Address */}
        <div className="text-sm text-white leading-snug">
          <p className="font-medium">{props?.address}</p>
          <p>
            {props?.address}, {props?.zipCode}
          </p>
        </div>

        {/* Features */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
          {[
            {
              icon: <BedDouble className="w-4 h-4 text-ocOrange" />,
              value: props?.bedRooms || 0,
              unit: 'Bed',
            },
            {
              icon: <Bath className="w-4 h-4 text-ocOrange" />,
              value: props?.bathRooms || 0,
              unit: 'Bath',
            },
            {
              icon: <Ruler className="w-4 h-4 text-ocOrange" />,
              value: props?.livingArea || props?.sqft,
              unit: 'sqft',
            },
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
