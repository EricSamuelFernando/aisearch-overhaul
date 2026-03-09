import Image from 'next/image';
import MainNavPages from '../navbars/main-nav-pages';

const heroHeadingSize = 'text-[2.35rem] sm:text-[2.75rem] md:text-[3.35rem]';

export default function HeroLayout() {
  return (
    <>
      <MainNavPages />

      <section className="
        relative bg-[#000000] text-white
        min-h-[36rem] md:min-h-[42rem] lg:min-h-[48rem]
        pt-16 sm:pt-20 pb-12 sm:pb-16
        flex items-center justify-center
        overflow-hidden
      ">

        {/* Background */}
        <div className="absolute inset-0 bg-black" />

        {/* CONTENT */}
        <div className="
          relative z-10
          max-w-[420px] sm:max-w-4xl mx-auto
          px-4 sm:px-6
          text-center
          flex flex-col justify-center
        ">

          {/* LINE 1 */}
          <div className="flex items-baseline justify-center gap-3 sm:gap-4 mb-1 sm:mb-2">
            <h1 className={`${heroHeadingSize} font-medium leading-snug tracking-tight`}>
              We
            </h1>

            {/* Image 1 */}
            <div className="
              relative
              w-[76px] h-[56px]
              sm:w-24 sm:h-16
              rounded-t-full rounded-b-md
              overflow-hidden translate-y-1
            ">
              <Image
                src="/assets/images/company_hero1.jpg"
                alt="Nature"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 6rem, 5rem"
                quality={100}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          {/* LINE 2 */}
          <h2 className={`${heroHeadingSize} font-medium leading-snug tracking-tight mb-1.5 sm:mb-2.5`}>
            Are Redefining
          </h2>

          {/* LINE 3 */}
          <div className="flex items-end justify-center gap-3 sm:gap-4 mb-3 sm:mb-3">

            {/* Image 2 */}
            <div className="
              relative
              w-[96px] h-[50px]
              sm:w-28 sm:h-16
              rounded-xl
              overflow-hidden translate-y-1
            ">
              <Image
                src="/assets/images/company_hero2.jpg"
                alt="House"
                fill
                className="object-cover object-top"
                sizes="(min-width: 768px) 7rem, 6rem"
                quality={100}
                unoptimized
              />
              <div className="absolute inset-0 bg-[#908884] opacity-40" />
            </div>

            <h2 className={`${heroHeadingSize} font-medium leading-snug tracking-tight`}>
              Real Estate
            </h2>
          </div>

          {/* LINE 4 */}
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <h2 className={`${heroHeadingSize} font-light italic leading-snug tracking-tight`}>
              One Snap
            </h2>

            {/* SVG */}
            <div className="
              relative
              w-[88px] h-[72px]
              sm:w-28 sm:h-20
              translate-y-1
            ">
              <img
                src="/assets/images/company_hero_hand.svg"
                alt="Snap Hand"
                className="
                  relative z-10
                  w-[74px] h-[74px]
                  sm:w-20 sm:h-20
                  md:w-24 md:h-24
                  scale-110 sm:scale-125 md:scale-150
                  -translate-y-2 sm:-translate-y-3 md:-translate-y-4
                  mx-auto
                "
              />
            </div>
          </div>

          {/* LINE 5 */}
          <h2 className={`${heroHeadingSize} font-light italic leading-snug tracking-tight mb-2.5 sm:mb-4`}>
            at a Time
          </h2>

          {/* SUBTEXT */}
          <p className="
            max-w-2xl mx-auto
            text-[13px] sm:text-sm md:text-base
            text-gray-300
            leading-relaxed
            px-4
          ">
            simplifying the process for buyers, sellers, and agents through smart
            design, seamless tech, and a people-first approach
          </p>

        </div>
      </section>
    </>
  );
}
