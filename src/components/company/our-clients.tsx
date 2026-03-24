


'use client';

import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
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

  return (
    <section
      id="testimonials"
      style={{ backgroundColor: bgColor }}
      className="home-clients-section pt-8 md:pt-16 pb-20 md:pb-28 px-4 sm:px-6 lg:px-12 overflow-x-hidden"
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

      <div className="home-clients-container max-w-7xl mx-auto">
        {isMobile ? (
          <Carousel
            slideSize="100%"
            slideGap="md"
            align="center"
            loop={false}
            withIndicators={false}
            withControls={false}
            styles={{
              root: { padding: 0 },
              viewport: { overflow: 'hidden' },
            }}
          >
            {testimonials.map(({ name, title, text, img }, idx) => (
              <Carousel.Slide key={idx}>
                <div
                  className="home-clients-card mx-auto w-full bg-[#EEDFC9] rounded-2xl flex flex-col justify-between"
                  style={{
                    padding: '20px',
                    height: 'auto',
                  }}
                >
                  <div className="text-left mb-4">
                    <h3 className="mb-1 text-sm font-bold">{name}</h3>
                    <p className="text-xs text-[#606060]">{title}</p>
                    <p className="mt-4 text-xs leading-relaxed text-[#595858]">{text}</p>
                  </div>
                  <img
                    src={img}
                    alt={`${name} photo`}
                    className="h-[72px] w-[72px] self-start rounded-full object-cover"
                  />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-2 justify-items-center gap-2 lg:gap-3">
            {testimonials.map(({ name, title, text, img }, idx) => (
              <div
                key={idx}
                className="home-clients-card mx-auto w-full bg-[#EEDFC9] rounded-2xl flex flex-col justify-between lg:w-[96%] lg:max-w-none"
                style={{
                  padding: '52px',
                  height: '292px',
                }}
              >
                <div className="text-left mb-4">
                  <h3 className="mb-1 text-[1.5rem] font-bold">{name}</h3>
                  <p className="text-[1.05rem] text-[#606060]">{title}</p>
                  <p className="mt-4 text-[1.05rem] leading-relaxed text-[#595858]">{text}</p>
                </div>
                <img
                  src={img}
                  alt={`${name} photo`}
                  className="h-[72px] w-[72px] self-start rounded-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
