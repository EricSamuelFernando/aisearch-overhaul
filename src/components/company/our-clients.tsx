



'use client';

import { useState, useEffect } from 'react';
import { Carousel, Embla } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import '@mantine/carousel/styles.css';

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
    text: `Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I’ve closed more deals in less time.`,
    img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

type OurClientsProps = {
  bgColor?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
};

export default function OurClients({
  bgColor = '#FAF0E6',
  subtitle = "We value our customers' authentic opinion on our products.",
  testimonials = DEFAULT_TESTIMONIALS,
}: OurClientsProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [embla, setEmbla] = useState<Embla | null>(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  useEffect(() => {
    if (!embla) return;

    setCanScrollPrev(embla.canScrollPrev());
    setCanScrollNext(embla.canScrollNext());

    const onSelect = () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };

    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onSelect);
    };
  }, [embla]);
  return (
    <section
      id="testimonials"
      style={{ backgroundColor: bgColor }}
      className="pt-12 md:pt-16 pb-10 px-4 sm:px-6 lg:px-12 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto text-start pb-6 sm:pb-12">
        <h2 className="satoshi text-3xl sm:text-4xl font-semibold text-left md:text-center">
          What Our Clients <span className="font-light">Say</span>
        </h2>

        <p className="satoshi text-xs sm:text-sm text-[#8E8B8A] mb-10 md:mb-12 max-w-[600px] mx-auto text-left md:text-center">
          {subtitle}
        </p>
      </div>
      <div className="max-w-7xl mx-auto">
        {isMobile ? (
          <div>
            <div className="mb-4 flex items-center justify-end gap-2">
              <button
                onClick={() => embla?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Previous testimonial"
                className={`flex h-8 w-16 items-center justify-center rounded-full transition-all duration-200 ${canScrollPrev
                  ? 'bg-[#F5EBDF] text-[#4A3A2B] hover:bg-[#EFE2D2]'
                  : 'bg-[#F1E7DC] text-[#CFC3B5] cursor-not-allowed'
                  }`}
              >
                <IconChevronLeft size={20} stroke={2} />
              </button>
              <button
                onClick={() => embla?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Next testimonial"
                className={`flex h-8 w-16 items-center justify-center rounded-full transition-all duration-200 ${canScrollNext
                  ? 'bg-[#F5EBDF] text-[#4A3A2B] hover:bg-[#EFE2D2]'
                  : 'bg-[#F1E7DC] text-[#CFC3B5] cursor-not-allowed'
                  }`}
              >
                <IconChevronRight size={20} stroke={2} />
              </button>
            </div>

            <Carousel
              slideSize="100%"
              slideGap="lg"
              align="start"
              loop
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
                  <div className="bg-[#F4E5D0] rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between shadow">
                    <div className="text-left mb-6">
                      <h3 className="font-bold font-outfit text-sm mb-1">{name}</h3>
                      <p className="text-xs text-[#606060]">{title}</p>
                      <p className="text-xs mt-4 text-[#595858] leading-relaxed">{text}</p>
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
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-12 px-12">
            {testimonials.map(({ name, title, text, img }, idx) => (
              <div
                key={idx}
                className="bg-[#EEDFC9] rounded-2xl p-11 flex flex-col justify-between "
              >
                <div className="text-left mb-6">
                  <h3 className="font-bold text-xl mb-1">{name}</h3>
                  <p className="text-md text-[#606060]">{title}</p>
                  <p className="text-md mt-4 text-[#595858] leading-relaxed">{text}</p>
                </div>
                <img
                  src={img}
                  alt={`${name} photo`}
                  className="w-14 h-14 rounded-full object-cover self-start"
                />
              </div>
            ))}
          </div>
        )}
        <div className="hidden md:flex justify-end mt-8 gap-2">
          {/* Left Arrow */}
          <button
            onClick={() => embla?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`flex h-10 w-16 items-center justify-center rounded-full transition-all duration-200 ${canScrollPrev
              ? 'bg-[#F5EBDF] text-[#4A3A2B] hover:bg-[#EFE2D2]'
              : 'bg-[#F1E7DC] text-[#CFC3B5] cursor-not-allowed'
              }`}
          >
            <IconChevronLeft size={20} stroke={2} />
          </button>

          <button
            onClick={() => embla?.scrollNext()}
            disabled={!canScrollNext}
            className={`flex h-10 w-16 items-center justify-center rounded-full transition-all duration-200 ${canScrollNext
              ? 'bg-[#F5EBDF] text-[#4A3A2B] hover:bg-[#EFE2D2]'
              : 'bg-[#F1E7DC] text-[#CFC3B5] cursor-not-allowed'
              }`}
          >
            <IconChevronRight size={20} stroke={2} />
          </button>
        </div>

      </div>
    </section>
  );
}
