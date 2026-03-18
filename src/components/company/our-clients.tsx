


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
  const needsNavigation = testimonials.length > 1;
  const controlsEnabled = testimonials.length > 1;

  return (
    <section
      id="testimonials"
      style={{ backgroundColor: bgColor }}
      className="home-clients-section pt-8 md:pt-16 pb-8 md:pb-10 px-4 sm:px-6 lg:px-12 overflow-x-hidden"
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
        <p className="home-clients-subtitle satoshi text-xs sm:text-sm text-[#8E8B8A] mb-5 md:mb-12 max-w-[600px] mx-auto text-left md:text-center">
          {subtitle}
        </p>
      </div>

      <div className="home-clients-container max-w-7xl mx-auto">
        <Carousel
          slideSize={slideSize}
          slideGap={isMobile ? 'md' : 'xl'}
          align="start"
          loop={needsNavigation}
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
                className="home-clients-card bg-[#EEDFC9] rounded-2xl flex flex-col justify-between"
                style={{
                  padding: isMobile ? '20px' : '44px',
                  minHeight: isMobile ? 'auto' : '320px',
                }}
              >
                <div className="text-left mb-4">
                  <h3 className={`font-bold mb-1 ${isMobile ? 'text-sm' : 'text-xl'}`}>{name}</h3>
                  <p className={`text-[#606060] ${isMobile ? 'text-xs' : 'text-md'}`}>{title}</p>
                  <p className={`mt-4 text-[#595858] leading-relaxed ${isMobile ? 'text-xs' : 'text-md'}`}>{text}</p>
                </div>
                <img
                  src={img}
                  alt={`${name} photo`}
                  className="w-14 h-14 rounded-full object-cover self-start"
                />
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>

        {/* Pagination arrows — only shown when more testimonials exist than visible slides */}
        {needsNavigation && <div
          className="mt-6 flex items-center justify-end gap-2"
          style={{ paddingRight: isMobile ? 0 : 8 }}
        >
          <button
            type="button"
            aria-label="Previous testimonial"
            disabled={!controlsEnabled}
            onClick={() => embla?.scrollPrev()}
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${isMobile ? 'h-8 w-16' : 'h-10 w-16'
              } ${controlsEnabled
                ? 'bg-[#F5EBDF] text-[#4A3A2B] hover:bg-[#EFE2D2]'
                : 'bg-[#F1E7DC] text-[#CFC3B5] cursor-not-allowed'
              }`}
          >
            <IconArrowNarrowLeft size={20} stroke={2.2} />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            disabled={!controlsEnabled}
            onClick={() => embla?.scrollNext()}
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${isMobile ? 'h-8 w-16' : 'h-10 w-16'
              } ${controlsEnabled
                ? 'bg-[#F5EBDF] text-[#4A3A2B] hover:bg-[#EFE2D2]'
                : 'bg-[#F1E7DC] text-[#CFC3B5] cursor-not-allowed'
              }`}
          >
            <IconArrowNarrowRight size={20} stroke={2.2} />
          </button>
        </div>}
      </div>
    </section>
  );
}
