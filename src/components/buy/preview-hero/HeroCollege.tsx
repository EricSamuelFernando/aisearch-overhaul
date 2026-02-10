'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, LayoutGridIcon } from 'lucide-react';
import Image from 'next/image';

// NOTE: Placeholder for external utilities if you don't have them
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
const imageLoader = ({ src }: { src: string }) => src;
// End of placeholders

interface CarouselProps {
  className?: any;
  imageURLs: Array<{ highRes: string }>;
  onImageClick?: (index: number) => void;
  onShowAllPhotos?: () => void;
}

const HeroCollege: React.FC<React.PropsWithChildren<CarouselProps>> = ({
  className,
  children,
  imageURLs = [],
  onImageClick,
  onShowAllPhotos,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToSlide = React.useCallback(
    (index: number) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (index % imageURLs.length + imageURLs.length) % imageURLs.length;
        return newIndex;
      });
    },
    [imageURLs.length],
  );

  const getCircularIndex = React.useCallback(
    (index: number) => (index % imageURLs.length + imageURLs.length) % imageURLs.length,
    [imageURLs.length],
  );

  const renderImage = (imgUrl: string, index: number, className: string, isPriority: boolean = false) => (
    <div
      key={imgUrl + index.toString()}
      className={cn('h-full w-full flex-shrink-0 cursor-pointer', className)}
    // Removed onClick here to rely on the parent div click, preventing double triggers.
    >
      <Image
        loader={imageLoader}
        alt='snaphomz-property-image'
        className='h-full w-full object-cover object-center'
        src={imgUrl}
        fill
        priority={isPriority}
        draggable={false}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/assets/images/placeholder.svg';
        }}
      />
    </div>
  );

  if (imageURLs.length === 0) {
    return (
      <div className={cn('relative h-96 w-full rounded-lg overflow-hidden', className)}>
        <div className='flex h-full w-full items-center justify-center bg-gray-100'>
          <p className='text-lg font-semibold leading-8 text-gray-800'>
            No Image Found
          </p>
        </div>
      </div>
    );
  }

  const secondImageIndex = getCircularIndex(currentIndex + 1);
  const thirdImageIndex = getCircularIndex(currentIndex + 2);

  return (
    <div
      // GRID FIX: Start with a single column on mobile, switch to 12-column grid on md screens
      className={cn(
        'relative h-[300px] md:h-[500px] w-full select-none rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-2',
        className,
      )}
    >
      {children}

      {/* --- 1. Main Image (Always 12 columns on mobile, 9 on desktop) --- */}
      <div
        // COL-SPAN FIX: Use col-span-12 for mobile, then md:col-span-9 for desktop
        className='relative col-span-12 md:col-span-9 h-full w-full'
        onClick={() => onImageClick && onImageClick(currentIndex)} // Click handler on the main image container
      >
        {renderImage(
          imageURLs[currentIndex]?.highRes,
          currentIndex,
          // ROUNDING FIX: Only round the right edge on desktop if it's the 9-column layout
          'rounded-lg md:rounded-r-none',
          true
        )}

        {/* Navigation Overlays (positioned on the main image) */}
        <div className='absolute bottom-4 sm:bottom-8 w-full px-4 sm:px-7 z-10'>
          <div className='flex w-full items-center justify-between'>

            {/* Counter */}
            <div className='rounded bg-black/40 p-1 px-2 text-white'>
              <h2 className='text-sm font-medium leading-6'>
                {currentIndex + 1}/{imageURLs.length}
              </h2>
            </div>

            {/* Chevrons (Navigation) */}
            <div className='inline-flex items-center space-x-2 sm:space-x-5'>
              <div
                className='flex h-8 w-8 sm:h-11 sm:w-11 cursor-pointer items-center justify-center rounded-full bg-white transition-all hover:bg-gray-100'
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(currentIndex - 1);
                }}
              >
                <ChevronLeftIcon size={24} className="sm:size-32" />
              </div>
              <div
                className='flex h-8 w-8 sm:h-11 sm:w-11 cursor-pointer items-center justify-center rounded-full bg-white transition-all hover:bg-gray-100'
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(currentIndex + 1);
                }}
              >
                <ChevronRightIcon size={24} className="sm:size-32" />
              </div>
            </div>
          </div>
        </div>

        {/* --- MOBILE ONLY: Show all photos button (Overlay) --- */}
        <div className='absolute top-4 right-4 z-10 md:hidden'>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent main image click handler from firing
              if (onShowAllPhotos) {
                onShowAllPhotos();
              } else {
                onImageClick && onImageClick(currentIndex);
              }
            }}
            className='flex items-center space-x-2 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-xl border border-gray-200 hover:bg-white transition-colors'
          >
            <LayoutGridIcon className='h-3 w-3' />
            <span>Show all photos</span>
          </button>
        </div>
      </div>

      {/* --- 2. Side Images & Button (Hidden on mobile, visible on desktop) --- */}
      <div className='hidden md:col-span-3 md:grid grid-rows-2 gap-2 h-full w-full'>

        {/* Top side image */}
        <div
          className='relative row-span-1'
          onClick={() => imageURLs.length > 1 && onImageClick && onImageClick(secondImageIndex)}
        >
          {imageURLs.length > 1 && renderImage(
            imageURLs[secondImageIndex]?.highRes,
            secondImageIndex,
            'rounded-lg',
          )}
        </div>

        {/* Bottom side image with 'Show all photos' button */}
        <div
          className='relative row-span-1'
          onClick={() => imageURLs.length > 2 && onImageClick && onImageClick(thirdImageIndex)}
        >
          {imageURLs.length > 2 && renderImage(
            imageURLs[thirdImageIndex]?.highRes,
            thirdImageIndex,
            'rounded-lg',
          )}

          {/* 'Show all photos' button overlay (Desktop) */}
          <div className='absolute inset-x-0 bottom-4 flex justify-center z-10'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onShowAllPhotos) {
                  onShowAllPhotos();
                } else {
                  onImageClick && onImageClick(currentIndex);
                }
              }}
              className='flex items-center space-x-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-xl border border-gray-200 hover:bg-white transition-colors'
            >
              <LayoutGridIcon className='h-4 w-4' />
              <span>Show all photos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { HeroCollege };
