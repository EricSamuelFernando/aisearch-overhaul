import Image from 'next/image';
import MainNavPages from '../navbars/main-nav-pages';

export default function HeroLayout() {
  return (
    <>
      <MainNavPages />

      <section className="
        relative bg-[#000000] text-white
        min-h-[85vh] sm:min-h-[90vh]
        pt-20 sm:pt-24
        flex items-center justify-center
        overflow-hidden
      ">

        {/* Background */}
        <div className="absolute inset-0 bg-[#000000]" />

        {/* CONTENT */}
        <div className="
          relative z-10
          max-w-4xl mx-auto
          px-4 sm:px-6
          text-center
          flex flex-col justify-center
        ">

          {/* LINE 1 */}
          <div className="flex items-baseline justify-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <h1 className="
              text-3xl
              sm:text-4xl
              md:text-6xl
              font-medium leading-none
            ">
              We
            </h1>

            {/* Image 1 */}
            <div className="
              relative
              w-20 h-14
              sm:w-24 sm:h-16
              rounded-t-full rounded-b-md
              overflow-hidden translate-y-1
            ">
              <Image
                src="/assets/images/company_hero1.jpg"
                alt="Nature"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          {/* LINE 2 */}
          <h2 className="
            text-3xl
            sm:text-4xl
            md:text-6xl
            font-medium
            mb-5 sm:mb-7
            leading-tight
          ">
            Are Redefining
          </h2>

          {/* LINE 3 */}
          <div className="flex items-baseline justify-center gap-3 sm:gap-4 mb-3">

            {/* Image 2 */}
            <div className="
              relative
              w-24 h-14
              sm:w-28 sm:h-16
              rounded-xl
              overflow-hidden translate-y-1
            ">
              <Image
                src="/assets/images/company_hero2.jpg"
                alt="House"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-[#908884] opacity-40" />
            </div>

            <h2 className="
              text-3xl
              sm:text-4xl
              md:text-6xl
              font-medium leading-none
            ">
              Real Estate
            </h2>
          </div>

          {/* LINE 4 */}
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <h2 className="
              text-3xl
              sm:text-4xl
              md:text-6xl
              font-light italic leading-none
            ">
              One Snap
            </h2>

            {/* SVG */}
            <div className="
              relative
              w-24 h-16
              sm:w-28 sm:h-20
              translate-y-1
            ">
              <img
                src="/assets/images/company_hero_hand.svg"
                alt="Snap Hand"
                className="
                  relative z-10
                  w-16 h-16
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
          <h2 className="
            text-3xl
            sm:text-4xl
            md:text-6xl
            font-light italic
            mb-6 sm:mb-10
            leading-tight
          ">
            at a Time
          </h2>

          {/* SUBTEXT */}
          <p className="
            max-w-2xl mx-auto
            text-xs sm:text-sm md:text-base
            text-[#E6D3C2]
            leading-relaxed
            px-2
          ">
            simplifying the process for buyers, sellers, and agents through smart
            design, seamless tech, and a people-first approach
          </p>

        </div>
      </section>
    </>
  );
}
