'use client';

import { usePrevNextButtons } from '@/components/customs/carousel/embla-carousel-arrow-button';
import { ImageInterface } from '@/interfaces/property.interface';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';
import { MlsMedia } from '../../interfaces/mls-data.interface';
import Image from 'next/image';


type Props = {
  images: MlsMedia[];
};

const options: EmblaOptionsType = { dragFree: true, loop: true };

function BuyCarousel({ images }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className='embla relative   h-[450px]'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          {[...images, ...images].map((item) => (
            <div className='embla__slide h-full' key={item.MediaKey}>
              <div className='embla__slide__number h-[450px] rounded-md'>
                {/* <img src={item.MediaURL} alt='' /> */}
                <Image src={item.MediaURL} alt='' width={500} height={500} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='absolute bottom-10 right-4 flex gap-0'>
        <ChevronLeftIcon
          onClick={onPrevButtonClick}
          size={32}
          className={cn(
            'text-black ',
            prevBtnDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        />
        <ChevronRightIcon
          onClick={onNextButtonClick}
          size={32}
          className={cn(
            'cursor-pointer text-black',
            nextBtnDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        />
      </div>
    </section>
  );
}

export default BuyCarousel;
