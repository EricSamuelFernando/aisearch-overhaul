'use client';
import Link from "next/link";

type ChooseYourMeansProps = {
  heading?: string;
  subheading?: string;
  yourAgentDescription?: string;
  ourAgentDescription?: string;
  ctaLabel?: string;
};

const ChooseYourMeans = ({
  heading = 'Choose Your Means',
  subheading = 'Gain unprecedented control with guided transactions, approval',
  yourAgentDescription = 'Onboard or invite your personal agent',
  ourAgentDescription = 'Choose from our vetted list of agents',
  ctaLabel = 'Get Started',
}: ChooseYourMeansProps) => {
  return (
    <section className="bg-[#FFF6EC] pt-24 px-4 sm:px-8 lg:px-12 text-center">
      {/* Choose Your Means Section */}
      <div className="max-w-6xl mx-auto text-center">
        <h2 className=" satoshi text-3xl sm:text-4xl font-semibold ">
          {heading}
        </h2>
        <p
          className="
    satoshi
    text-xs sm:text-sm
    text-[#8E8B8A]
    mb-10 sm:mb-20
    max-w-[600px]
    mx-auto
  "
        >
          {subheading}
        </p>


        {/* Card Grid Layout */}
        <div
          className="flex flex-nowrap gap-6 overflow-x-auto pb-4 bg-transparent scrollbar-hide snap-x snap-mandatory sm:flex-wrap sm:justify-center sm:overflow-visible sm:snap-none"
        >
          {/* Team member 1 */}
          <div className="min-w-[260px] sm:min-w-0 rounded-2xl overflow-hidden relative cursor-pointer scale-[0.9] origin-top">
            <img
              src="/assets/images/landing-means.png"
              alt="Proper Name"
              className="relative w-full h-full object-cover "
            />
            <div className="absolute rounded-2xl bottom-0 left-0 right-0   text-white p-6 text-center">
              <p className="font-bold text-md text-center">Your Agent</p>
              <p className="text-xs">{yourAgentDescription}</p>
              <button onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"} className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
                {ctaLabel}
              </button>
            </div>
          </div>


          {/* Team member 2 */}
          <div className="min-w-[260px] sm:min-w-0 rounded-2xl overflow-hidden relative cursor-pointer scale-[0.9] origin-top">
            <img
              src="/assets/images/landing-means1.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 text-white p-6 text-center">
              <p className="font-bold text-md text-center">Our Agent</p>
              <p className="text-xs">{ourAgentDescription}</p>
              <button onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"} className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
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
              <p className="text-xs">We’ll guide you in every step</p>
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
