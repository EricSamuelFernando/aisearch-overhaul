'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, LayoutGridIcon } from 'lucide-react'; // Added LayoutGridIcon for the button
import Image from 'next/image';

//  import { cn } from '@/lib/utils';// Assuming imageLoader and cn are defined elsewhere
// import { imageLoader } from '@/utils/image-loader'; 

interface CarouselProps {
  className?: any;
  imageURLs: Array<{ highRes: string }>;
  // onImageClick is now used to trigger the "Show all photos" action
  onImageClick?: (index: number) => void; 
}

// NOTE: Placeholder for external utilities if you don't have them
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
const imageLoader = ({ src }: { src: string }) => src;
// End of placeholders

const HeroCollege: React.FC<React.PropsWithChildren<CarouselProps>> = ({
  className,
  children,
  imageURLs = [],
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // This function remains to handle navigation via chevrons
  const goToSlide = React.useCallback(
    (index: number) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (index + imageURLs.length) % imageURLs.length;
        // Handle negative index correctly for circular array
        return newIndex < 0 ? newIndex + imageURLs.length : newIndex;
      });
    },
    [imageURLs.length],
  );

  // Helper to get a circular index
  const getCircularIndex = React.useCallback(
    (index: number) => (index % imageURLs.length + imageURLs.length) % imageURLs.length,
    [imageURLs.length],
  );

  // Function to render an image container
  const renderImage = (imgUrl: string, index: number, className: string, isPriority: boolean = false) => (
    <div
      key={imgUrl + index.toString()}
      className={cn('h-full w-full flex-shrink-0 cursor-pointer', className)}
      onClick={() => onImageClick && onImageClick(index)}
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
      <div className={cn('relative h-full w-full rounded-lg overflow-hidden', className)}>
        <div className='flex h-full w-full items-center justify-center bg-primary-100'>
          <p className='text-lg font-semibold leading-8 text-black'>
            No Image Found
          </p>
        </div>
      </div>
    );
  }

  // Determine the indices for the side images
  const secondImageIndex = getCircularIndex(currentIndex + 1);
  const thirdImageIndex = getCircularIndex(currentIndex + 2);

  return (
    <div
      // Container class adjusted for the grid layout
      className={cn(
        'relative h-full w-full select-none rounded-lg overflow-hidden grid grid-cols-12 gap-2', 
        className,
      )}
    >
      {children}
      
      {/* --- 1. Main Image (9 columns) --- */}
      <div className='relative col-span-12 md:col-span-9 h-full w-full'>
        {renderImage(
          imageURLs[currentIndex]?.highRes, 
          currentIndex, 
          'rounded-lg md:rounded-r-none', 
          true
        )}

        {/* Navigation Overlays (positioned on the main image) */}
        <div className='absolute bottom-8 w-full px-7 z-10'>
          <div className='flex w-full items-center justify-between'>
            {/* Counter */}
            <div className='rounded bg-black/40 p-1 px-2 text-white'>
              <h2 className='text-sm font-medium leading-6'>
                {currentIndex + 1}/{imageURLs.length}
              </h2>
            </div>
            {/* Chevrons */}
            <div className='inline-flex items-center space-x-5'>
              <div className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white transition-all hover:bg-gray-100'>
                <ChevronLeftIcon
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent main image click
                    goToSlide(currentIndex - 1);
                  }}
                  size={32} // Adjusted size for better fit
                />
              </div>
              <div className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white transition-all hover:bg-gray-100'>
                <ChevronRightIcon
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent main image click
                    goToSlide(currentIndex + 1);
                  }}
                  size={32} // Adjusted size for better fit
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Side Images & Button (3 columns - Hidden on small screens) --- */}
      <div className='hidden md:col-span-3 md:grid grid-rows-2 gap-2 h-full w-full'>
        {/* Top side image */}
        <div className='relative row-span-1'>
          {imageURLs.length > 1 && renderImage(
            imageURLs[secondImageIndex]?.highRes,
            secondImageIndex,
            'rounded-lg',
          )}
        </div>

        {/* Bottom side image with 'Show all photos' overlay */}
        <div className='relative row-span-1'>
          {imageURLs.length > 2 && renderImage(
            imageURLs[thirdImageIndex]?.highRes,
            thirdImageIndex,
            'rounded-lg',
          )}
          
          {/* 'Show all photos' button overlay */}
          <div className='absolute inset-0 flex items-center justify-center z-10'>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent image click handler from firing
                // Call onImageClick to trigger the full gallery view
                onImageClick && onImageClick(currentIndex); 
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