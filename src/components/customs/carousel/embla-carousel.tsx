import React, { useEffect, useState } from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { DotButton, useDotButton } from './embla-carousel-dot-button';
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from './embla-carousel-arrow-button';
import { nanoid } from 'nanoid';

type PropType = {
  slides: React.ReactNode[];
  options?: EmblaOptionsType;
  onScrollButtonClick?: (e: any) => void;
  controlsVisibility?: 'hover' | 'always';
};


const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options, controlsVisibility = 'hover' } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [carouselEvent, setCarouselEvent] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const handlePrevButtonClick = (e: any) => {
    if (props.onScrollButtonClick) props.onScrollButtonClick(e);
    onPrevButtonClick();
  };

  const handleNextButtonClick = (e: any) => {
    if (props.onScrollButtonClick) props.onScrollButtonClick(e);
    onNextButtonClick();
  };

  const handlePrevMouseEnter = () => {
    setCarouselEvent(true);
  };

  const handleNextMouseEnter = () => {
    setCarouselEvent(true);
  };

  const handleMouseLeave = () => {
    setCarouselEvent(false);
  };

  const startAutoplay = () => {
    if (emblaApi) {
      const id = setInterval(() => {
        emblaApi.scrollNext();
      }, 2000);
      setIntervalId(id);
    }
  };

  const stopAutoplay = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleCarouselMouseEnter = () => {
    startAutoplay();
    setIsHovering(true);
  };

  const handleCarouselMouseLeave = () => {
    stopAutoplay();
    setIsHovering(false);
  };

  useEffect(() => {
    return () => {
      stopAutoplay();
    };
  }, []);

  return (
    <section
      className="embla relative h-full w-full"
      onMouseEnter={handleCarouselMouseEnter}
      onMouseLeave={handleCarouselMouseLeave}
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {slides?.map((slide, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
              {slide}
            </div>
          ))}
        </div>

      </div>

      {(controlsVisibility === 'always' || isHovering) && (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="pointer-events-auto absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-2 md:px-3"
            onMouseLeave={handleMouseLeave}
          >
            <PrevButton
              onClick={handlePrevButtonClick}
              onMouseEnter={handlePrevMouseEnter}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/55 bg-black/30 text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-35 md:h-10 md:w-10"
              disabled={prevBtnDisabled}
              aria-label="Previous image"
            />
            <NextButton
              onClick={handleNextButtonClick}
              onMouseEnter={handleNextMouseEnter}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/55 bg-black/30 text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-35 md:h-10 md:w-10"
              disabled={nextBtnDisabled}
              aria-label="Next image"
            />
          </div>

          <div className="pointer-events-auto absolute bottom-3 z-10 flex w-full justify-center gap-2">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`
                  h-1 bg-white w-1 border-[0.5px] border-black rounded-full ${index === selectedIndex ? '' : 'text-white bg-white '
                  }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default EmblaCarousel;
