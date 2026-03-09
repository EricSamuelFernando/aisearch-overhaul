'use client';
import Link from "next/link";
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChooseYourMeansProps = {
  heading?: ReactNode;
  headingClassName?: string;
  subheading?: string;
  yourAgentDescription?: string;
  ourAgentDescription?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

const ChooseYourMeans = ({
  heading,
  headingClassName,
  subheading = 'Gain unprecedented control with guided transactions, approval',
  yourAgentDescription = 'Onboard or invite your personal agent',
  ourAgentDescription = 'Choose from our vetted list of agents',
  ctaLabel = 'Get Started',
  onCtaClick,
}: ChooseYourMeansProps) => {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    window.location.href = "https://preprod.snaphomz.com/agents";
  };

  return (
    <section className="bg-[#FFF6EC] pt-16 pb-12 sm:pt-20 sm:pb-14 px-4 sm:px-8 lg:px-12 text-center">
      {/* Choose Your Means Section */}
      <div className="max-w-6xl mx-auto text-center">
        <h2 className={cn('satoshi text-3xl sm:text-4xl font-medium', headingClassName)}>
          {heading ?? (
            <>
              Choose How You <span className="font-light">Buy</span>
            </>
          )}
        </h2>
        <p className="home-choose-subtitle satoshi text-xs sm:text-sm text-[#8E8B8A] mb-6 sm:mb-8 max-w-[600px] mx-auto">
          Take control of your home purchase with guided transactions, approval workflows, and transparent tracking, no matter how you like to work.
        </p>

        {/* Card Grid Layout */}
        <div className="home-choose-grid grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-[1120px] mx-auto">
          {/* Card 1 */}
          <div className="home-choose-card rounded-[3.25rem] overflow-hidden relative cursor-pointer h-[380px] sm:h-[440px] lg:h-[520px]">
            <img
              src="/assets/images/landing-means.png"
              alt="Your Agent"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Soft gradient — top is fully clear, darkens only in the bottom 42% */}
            <div
              className="absolute inset-0 rounded-[3.25rem]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(13,17,26,0) 40%, rgba(74,77,82,0.45) 70%, rgba(58,61,67,0.88) 100%)',
              }}
            />
            {/* Text + button */}
            <div className="absolute inset-x-0 bottom-10 text-white px-6 sm:px-8 text-center">
              <p className="font-bold text-[2.35rem] leading-none mb-3">Your Agent</p>
              <p className="text-[1.1rem] sm:text-[1.2rem] text-white/90 mb-7 leading-snug max-w-[280px] mx-auto">{yourAgentDescription}</p>
              <button
                onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"}
                className="px-9 sm:px-10 py-3.5 bg-black text-white text-[1.1rem] font-semibold rounded-full transition duration-200 hover:bg-black/80 min-w-[170px]"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="home-choose-card rounded-[3.25rem] overflow-hidden relative cursor-pointer h-[380px] sm:h-[440px] lg:h-[520px]">
            <img
              src="/assets/images/landing-means1.png"
              alt="Our Agent"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Soft gradient — top is fully clear, darkens only in the bottom 42% */}
            <div
              className="absolute inset-0 rounded-[3.25rem]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(198,118,74,0) 36%, rgba(192,118,79,0.44) 68%, rgba(195,121,82,0.82) 100%)',
              }}
            />
            {/* Text + button */}
            <div className="absolute inset-x-0 bottom-10 text-white px-6 sm:px-8 text-center">
              <p className="font-bold text-[2.35rem] leading-none mb-3">Our Agent</p>
              <p className="text-[1.1rem] sm:text-[1.2rem] text-white/90 mb-7 leading-snug max-w-[300px] mx-auto">{ourAgentDescription}</p>
              <button
                onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"}
                className="px-9 sm:px-10 py-3.5 bg-black text-white text-[1.1rem] font-semibold rounded-full transition duration-200 hover:bg-black/80 min-w-[170px]"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          {/* Team member 3 */}
          {/*
          <div className="min-w-[260px] sm:min-w-0 rounded-2xl overflow-hidden relative cursor-pointer">
            <img
              src="/assets/images/landing-means2.png"
              alt="Proper Name"
              className="w-full h-full object-cover "
            />
            <div className="absolute bottom-0 left-0 right-0  text-white p-6 text-center">
              <p className="font-bold text-md text-center">Do It Yourself</p>
              <p className="text-xs">We'll guide you in every step</p>
              <button onClick={() => window.location.href = "https://preprod.snaphomz.com/home"} className="mt-4 px-6 py-2 rounded-full text-sm text-opacity-60 text-gray-300 bg-black/60 border border-white/20 cursor-not-allowed backdrop-blur-md">
                Coming Soon
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export { ChooseYourMeans };
