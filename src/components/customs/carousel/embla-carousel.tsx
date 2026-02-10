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
};


const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
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

      {isHovering && (
        <div className="absolute top-[24%] w-full">
          <div
            className="flex text-white justify-between"
            onMouseLeave={handleMouseLeave}
          >
            <PrevButton
              onClick={handlePrevButtonClick}
              onMouseEnter={handlePrevMouseEnter}
              className="cursor-pointer bg-[#00000090] pl-3.5 w-11 h-11 transition-opacity duration-300 opacity-80 hover:opacity-100"
              disabled={prevBtnDisabled}
            />
            <NextButton
              onClick={handleNextButtonClick}
              onMouseEnter={handleNextMouseEnter}
              className="cursor-pointer bg-[#00000090] pl-3.5 w-11 h-11 transition-opacity duration-300 opacity-80 hover:opacity-100"
              disabled={nextBtnDisabled}
            />
          </div>

          <div className="absolute z-100 flex gap-2 justify-center w-full top-32">
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
