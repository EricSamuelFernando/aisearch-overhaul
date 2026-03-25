


'use client';

import { useState, useEffect } from 'react';
import { Carousel, Embla } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowNarrowLeft, IconArrowNarrowRight } from '@tabler/icons-react';
import '@mantine/carousel/styles.css';
import { cn } from '@/lib/utils';

type Testimonial = {
  name: string;
  title: string;
  text: string;
  img: string;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: 'MILTON AUSTIN',
    title: 'Sales Manager, San Francisco',
    text: `From browsing to signing, everything just flowed. The listings were clear, the agents responsive, and the process — smooth. I found my home faster than I expected.`,
    img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'ALEX RICHARD',
    title: 'Product Manager, Chicago',
    text: `Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I've closed more deals in less time.`,
    img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

type OurClientsProps = {
  bgColor?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  headingClassName?: string;
};

export default function OurClients({
  bgColor = '#FAF0E6',
  subtitle = "We value our customers' authentic opinion on our products.",
  testimonials = DEFAULT_TESTIMONIALS,
  headingClassName,
}: OurClientsProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [embla, setEmbla] = useState<Embla | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!embla) return;

    const syncButtons = () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };

    syncButtons();
    embla.on('select', syncButtons);
    embla.on('reInit', syncButtons);
    return () => {
      embla.off('select', syncButtons);
      embla.off('reInit', syncButtons);
    };
  }, [embla]);

  const slideSize = isMobile ? '100%' : '50%';
  const slideGap = isMobile ? 'md' : 'lg';
  const needsNavigation = testimonials.length > 1;
  const cardPadding = isMobile ? '24px 20px' : '38px 34px 22px';
  const cardMinHeight = isMobile ? 'auto' : '332px';
  const cardCopyWidthClass = isMobile ? 'max-w-full' : 'max-w-[370px]';

  return (
    <section
      id="testimonials"
      style={{ backgroundColor: bgColor }}
      className="home-clients-section overflow-x-hidden px-4 pt-8 pb-20 sm:px-6 md:pt-16 md:pb-28 lg:px-12"
    >
      <div className="max-w-6xl mx-auto text-start pb-4 sm:pb-12">
        <h2
          className={cn(
            'satoshi whitespace-nowrap text-[1.7rem] leading-tight sm:text-4xl font-medium text-left md:text-center',
            headingClassName
          )}
        >
          What Our Clients <span className="font-light">Say</span>
        </h2>
        <p className="home-clients-subtitle satoshi mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base text-[#8E8B8A] mb-6 md:mb-12 max-w-[640px] mx-auto text-left md:text-center">
          {subtitle}
        </p>
      </div>

      <div
        className="home-clients-container mx-auto"
        style={{ maxWidth: isMobile ? '100%' : '1120px' }}
      >
        <Carousel
          slideSize={slideSize}
          slideGap={slideGap}
          align="start"
          loop={false}
          withIndicators={false}
          withControls={false}
          getEmblaApi={setEmbla}
          styles={{
            root: { padding: 0 },
            viewport: { overflow: 'hidden' },
          }}
        >
          {testimonials.map(({ name, title, text, img }, idx) => (
            <Carousel.Slide key={idx}>
              <div
                className="home-clients-card flex h-full flex-col justify-between rounded-[30px] bg-[#F2E4CF]"
                style={{
                  padding: cardPadding,
                  minHeight: cardMinHeight,
                }}
              >
                <div className={cn('text-left', cardCopyWidthClass)}>
                  <h3
                    className={cn(
                      'font-bold uppercase tracking-[-0.02em] text-[#171310]',
                      isMobile ? 'text-lg leading-[1.2]' : 'text-[0.98rem] leading-[1.2]'
                    )}
                  >
                    {name}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 text-[#6B625A]',
                      isMobile ? 'text-sm leading-5' : 'text-[0.98rem] leading-6'
                    )}
                  >
                    {title}
                  </p>
                  <p
                    className={cn(
                      'mt-8 text-[#595858]',
                      isMobile ? 'text-sm leading-6' : 'text-[0.98rem] leading-[1.22]'
                    )}
                  >
                    {text}
                  </p>
                </div>
                <div className="flex justify-start pt-6">
                  <img
                    src={img}
                    alt={`${name} photo`}
                    className={cn(
                      'block rounded-full object-cover',
                      isMobile ? 'h-14 w-14' : 'h-[66px] w-[66px]'
                    )}
                  />
                </div>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>

        {/* Pagination arrows — only shown when more testimonials exist than visible slides */}
        {needsNavigation && <div
          className="mt-6 md:mt-8 flex items-center justify-end gap-3"
          style={{ paddingRight: isMobile ? 0 : 8 }}
        >
          <button
            type="button"
            aria-label="Previous testimonial"
            disabled={!canScrollPrev}
            onClick={() => embla?.scrollPrev()}
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${isMobile ? 'h-8 w-14' : 'h-10 w-[72px]'
              } ${canScrollPrev
                ? 'bg-[#F5EBDF] text-[#8B7A69] hover:bg-[#EEE1D1]'
                : 'bg-[#F6EDE3] text-[#CDBEAE] cursor-not-allowed'
              }`}
          >
            <IconArrowNarrowLeft size={18} stroke={1.9} />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            disabled={!canScrollNext}
            onClick={() => embla?.scrollNext()}
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${isMobile ? 'h-8 w-14' : 'h-10 w-[72px]'
              } ${canScrollNext
                ? 'bg-[#F5EBDF] text-[#4A3726] hover:bg-[#EADBC8]'
                : 'bg-[#F6EDE3] text-[#CDBEAE] cursor-not-allowed'
              }`}
          >
            <IconArrowNarrowRight size={18} stroke={1.9} />
          </button>
        </div>}
      </div>
    </section>
  );
}
