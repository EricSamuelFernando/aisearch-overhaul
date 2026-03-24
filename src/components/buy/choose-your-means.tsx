'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const yourAgentDescriptionParts = yourAgentDescription.includes(' personal agent')
    ? yourAgentDescription.split(' personal agent')
    : null;
  const ourAgentDescriptionParts = ourAgentDescription.includes(' list of agents')
    ? ourAgentDescription.split(' list of agents')
    : null;

  const handleCtaClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    router.push("/agents");
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

        {/* Mobile carousel, desktop grid */}
        <div className="home-choose-grid flex gap-4 overflow-x-auto pl-4 pr-4 pb-2 snap-x snap-mandatory md:mx-auto md:grid md:max-w-[920px] md:grid-cols-2 md:justify-items-center md:gap-4 md:overflow-visible md:px-0 lg:gap-5">
          {/* Card 1 */}
          <div
            onClick={() => handleCtaClick()}
            className="home-choose-card relative h-[360px] w-[75vw] min-w-[250px] max-w-[330px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[2.5rem] sm:h-[405px] sm:w-[365px] sm:min-w-0 sm:max-w-none"
          >
            <img
              src="/assets/images/landing-means.png"
              alt="Your Agent"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Soft gradient — top is fully clear, darkens only in the bottom 42% */}
            <div
              className="absolute inset-0 rounded-[2.5rem]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(13,17,26,0) 40%, rgba(74,77,82,0.45) 70%, rgba(58,61,67,0.88) 100%)',
              }}
            />
            {/* Text + button */}
            <div className="absolute inset-x-0 bottom-8 text-white px-5 sm:px-6 text-center">
              <p className="font-semibold text-[1.2rem] leading-[1.1] mb-3 sm:text-[1.8rem] sm:mb-2">Your Agent</p>
              <p className="text-[0.92rem] text-white/90 mb-5 leading-[1.35] max-w-[270px] mx-auto sm:text-[0.95rem] sm:mb-4 sm:max-w-[210px]">
                {yourAgentDescriptionParts ? (
                  <>
                    {yourAgentDescriptionParts[0]}
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> </span>
                    personal agent
                  </>
                ) : (
                  yourAgentDescription
                )}
              </p>
              <button
                onClick={(e) => handleCtaClick(e)}
                className="px-6 py-2.5 bg-black text-white text-[0.88rem] font-semibold rounded-full transition duration-200 hover:bg-black/80 min-w-[138px] sm:px-7 sm:text-[0.9rem] sm:min-w-[136px]"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => handleCtaClick()}
            className="home-choose-card relative h-[360px] w-[75vw] min-w-[250px] max-w-[330px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[2.5rem] sm:h-[405px] sm:w-[365px] sm:min-w-0 sm:max-w-none"
          >
            <img
              src="/assets/images/landing-means1.png"
              alt="Our Agent"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Soft gradient — top is fully clear, darkens only in the bottom 42% */}
            <div
              className="absolute inset-0 rounded-[2.5rem]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(198,118,74,0) 36%, rgba(192,118,79,0.44) 68%, rgba(195,121,82,0.82) 100%)',
              }}
            />
            {/* Text + button */}
            <div className="absolute inset-x-0 bottom-8 text-white px-5 sm:px-6 text-center">
              <p className="font-semibold text-[1.2rem] leading-[1.1] mb-3 sm:text-[1.8rem] sm:mb-2">Our Agent</p>
              <p className="text-[0.92rem] text-white/90 mb-5 leading-[1.35] max-w-[250px] mx-auto sm:text-[0.95rem] sm:mb-4 sm:max-w-[220px]">
                {ourAgentDescriptionParts ? (
                  <>
                    {ourAgentDescriptionParts[0]}
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> </span>
                    list of agents
                  </>
                ) : (
                  ourAgentDescription
                )}
              </p>
              <button
                onClick={(e) => handleCtaClick(e)}
                className="px-6 py-2.5 bg-black text-white text-[0.88rem] font-semibold rounded-full transition duration-200 hover:bg-black/80 min-w-[138px] sm:px-7 sm:text-[0.9rem] sm:min-w-[136px]"
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
