'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { imageLoader } from '@/utils/image-loader';

interface CarouselProps {
  className?: string;
  imageURLs: Array<{ highRes: string }>;
  onImageClick?: (index: number) => void;
}

const HeroCarousel: React.FC<React.PropsWithChildren<CarouselProps>> = ({
  className,
  children,
  imageURLs = [],
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startX = React.useRef<number | null>(null);
  const draggedX = React.useRef<number | null>(null);
  const currentX = React.useRef<number | null>(null);
  const slideWidth = React.useRef(0);

  React.useEffect(() => {
    if (containerRef.current) {
      slideWidth.current = containerRef.current.offsetWidth;
    }
  }, []);

  const goToSlide = React.useCallback(
    (index: number) => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (index + imageURLs.length) % imageURLs.length;
        return newIndex;
      });
    },
    [imageURLs.length],
  );

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    currentX.current = startX.current;
    draggedX.current = 0;
  };

  const handleDragMove = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    if (startX.current) {
      draggedX.current = clientX - startX.current;
      currentX.current = clientX;
    }
  };

  const getCircularIndex = React.useCallback(
    (index: number) => (index + imageURLs.length) % imageURLs.length,
    [imageURLs.length],
  );

  const handleDragEnd = React.useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const dragThreshold = slideWidth.current / 4;
    if (draggedX.current) {
      if (Math.abs(draggedX.current) > dragThreshold) {
        if (draggedX.current > 0) {
          goToSlide(currentIndex - 1);
        } else {
          goToSlide(currentIndex + 1);
        }
      }
    }
    draggedX.current = 0;
  }, [isDragging, goToSlide, currentIndex]);

  const getSlideStyle = React.useCallback(
    (index: number) => {
      if (draggedX.current) {
        const offset =
          (index - currentIndex) * 100 +
          (draggedX.current / slideWidth.current) * 100;
        return {
          transform: `translateX(${offset}%)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        };
      }
    },
    [currentIndex, isDragging],
  );

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!isDragging && onImageClick) {
      onImageClick(index);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full select-none overflow-hidden rounded-lg',
        className,
      )}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {children}
      {imageURLs.length > 0 ? (
        <div className='absolute inset-0 flex'>
          {[-1, 0, 1].map((offset) => {
            const index = getCircularIndex(currentIndex + offset);
            return (
              <div
                key={imageURLs[index] + index.toString()}
                className='h-full w-full flex-shrink-0 cursor-pointer'
                style={getSlideStyle(index)}
                onClick={(e) => handleImageClick(e, index)}
              >
                <Image
                  loader={imageLoader}
                  alt='snaphomz-propert-image'
                  className='h-full w-full object-cover object-center'
                  src={imageURLs[index]?.highRes}
                  fill
                  priority={index === currentIndex}
                  draggable={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/placeholder.svg';
                  }}
                />
              </div>
            );
          })}
          <div className='absolute bottom-8 w-full px-7'>
            <div className='flex w-full items-center justify-between'>
              <div className='rounded bg-black/40 p-1 px-2 text-white'>
                <h2 className='text-sm font-medium leading-6'>
                  {currentIndex + 1}/{imageURLs.length}
                </h2>
              </div>
              <div className='inline-flex items-center space-x-5'>
                <div className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white'>
                  <ChevronLeftIcon
                    onClick={() => goToSlide(currentIndex - 1)}
                    size={38}
                  />
                </div>
                <div className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white'>
                  <ChevronRightIcon
                    onClick={() => goToSlide(currentIndex + 1)}
                    size={38}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-primary-100'>
          <p className='text-lg font-semibold leading-8 text-black'>
            No Image Found
          </p>
        </div>
      )}
    </div>
  );
};

export { HeroCarousel };