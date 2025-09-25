import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CarouselProps {
    images: string[];
    autoPlayInterval?: number;
}

export function Carousel({ images, autoPlayInterval = 5000 }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((current) => (current + 1) % images.length);
    };

    const previous = () => {
        setCurrentIndex((current) => (current - 1 + images.length) % images.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(next, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlayInterval]);

    return (
        <div className="relative">
            {/* Images */}
            <div
                className="absolute transition-transform duration-500 ease-out"
                // style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                <div className="absolute flex w-40 h-40">
                    {images.map((image, index: number) => (
                        <div
                            key={index}
                            className="relative w-300 h-300 flex-shrink-0"
                        >
                            <Image
                                src={image}
                                // height={40}
                                // width={40}
                                layout="fill"
                                className="object-cover"
                                priority
                                alt="Property"
                                // className="absolute w-300 h-300 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            {/* <button
        onClick={previous}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button> */}

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white scale-125'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}