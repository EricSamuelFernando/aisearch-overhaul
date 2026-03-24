import Image from 'next/image';
import MainNavPages from '../navbars/main-nav-pages';

const desktopHeroHeadingSize = 'text-[2.35rem] sm:text-[2.75rem] md:text-[3.35rem]';

export default function HeroLayout() {
  return (
    <>
      <MainNavPages />

      <section className="relative overflow-hidden bg-[#1A0700] text-white sm:bg-black">
        <div className="absolute inset-0 bg-[#1A0700] sm:bg-black" />

        <div className="relative z-10 mx-auto min-h-[52rem] max-w-[393px] px-4 pt-[7.25rem] pb-12 sm:hidden">
          <div className="mx-auto flex max-w-[366px] flex-col items-center text-center">
            <div className="mt-14 flex items-end justify-center gap-4">
              <h1 className="text-[3.35rem] font-medium leading-[0.88] tracking-[-0.065em]">We</h1>
              <div className="relative h-[70px] w-[96px] translate-y-[-0.1rem] overflow-hidden rounded-t-[48px] rounded-b-[10px]">
                <Image
                  src="/assets/images/company_hero1.jpg"
                  alt="Nature"
                  fill
                  className="object-cover"
                  sizes="96px"
                  quality={100}
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/12" />
              </div>
            </div>

            <h2 className="mt-2 text-[3.35rem] font-medium leading-[0.9] tracking-[-0.065em]">
              Are Redefining
            </h2>

            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="relative h-[58px] w-[112px] translate-y-1 overflow-hidden rounded-[1.6rem]">
                <Image
                  src="/assets/images/company_hero2.jpg"
                  alt="House"
                  fill
                  className="object-cover object-top"
                  sizes="112px"
                  quality={100}
                  unoptimized
                />
                <div className="absolute inset-0 bg-[#908884]/28" />
              </div>

              <h2 className="text-[3.35rem] font-medium leading-[0.9] tracking-[-0.065em]">
                Real Estate
              </h2>
            </div>

            <div className="relative mt-5 inline-block w-fit self-center">
              <h2 className="pr-[4.8rem] text-[3rem] font-light italic leading-[0.93] tracking-[-0.05em]">
                One Snap
              </h2>
              <div className="absolute -right-[15px] top-[-2.4rem] h-[98px] w-[98px]">
                <Image
                  src="/assets/images/company_hero_hand.svg"
                  alt="Snap Hand"
                  fill
                  className="object-contain"
                  sizes="96px"
                  unoptimized
                />
              </div>
            </div>

            <h2 className="mt-1 text-[3rem] font-light italic leading-[0.93] tracking-[-0.05em]">
              at a Time
            </h2>

            <p className="mt-14 max-w-[352px] px-1 text-[0.95rem] leading-[1.48] text-[#D9C7B8]">
              simplifying the process for buyers, sellers, and agents through smart
              design, seamless tech, and a people-first approach
            </p>
          </div>
        </div>

        <div
          className="
            relative z-10 hidden
            min-h-[36rem] md:min-h-[42rem] lg:min-h-[48rem]
            items-center justify-center
            px-4 pt-16 pb-12 sm:flex sm:px-6 sm:pt-20 sm:pb-16
          "
        >
          <div
            className="
              mx-auto flex max-w-[420px] flex-col justify-center text-center
              sm:max-w-4xl
            "
          >
            <div className="mb-1 flex items-baseline justify-center gap-3 sm:mb-2 sm:gap-4">
              <h1 className={`${desktopHeroHeadingSize} font-medium leading-snug tracking-tight`}>
                We
              </h1>

              <div className="relative h-[56px] w-[76px] translate-y-1 overflow-hidden rounded-t-full rounded-b-md sm:h-16 sm:w-24">
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

            <h2
              className={`${desktopHeroHeadingSize} mb-1.5 font-medium leading-snug tracking-tight sm:mb-2.5`}
            >
              Are Redefining
            </h2>

            <div className="mb-3 flex items-end justify-center gap-3 sm:gap-4">
              <div className="relative h-[50px] w-[96px] translate-y-1 overflow-hidden rounded-xl sm:h-16 sm:w-28">
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

              <h2 className={`${desktopHeroHeadingSize} font-medium leading-snug tracking-tight`}>
                Real Estate
              </h2>
            </div>

            <div className="mb-1 flex items-baseline justify-center gap-1">
              <h2 className={`${desktopHeroHeadingSize} font-light italic leading-snug tracking-tight`}>
                One Snap
              </h2>

              <div className="relative h-[72px] w-[88px] translate-y-1 sm:h-20 sm:w-28">
                <Image
                  src="/assets/images/company_hero_hand.svg"
                  alt="Snap Hand"
                  fill
                  className="mx-auto scale-110 object-contain sm:scale-125 md:scale-150"
                  sizes="(min-width: 768px) 7rem, 5.5rem"
                  unoptimized
                />
              </div>
            </div>

            <h2 className={`${desktopHeroHeadingSize} mb-2.5 font-light italic leading-snug tracking-tight sm:mb-4`}>
              at a Time
            </h2>

            <p className="mx-auto max-w-2xl px-4 text-[13px] leading-relaxed text-gray-300 sm:text-sm md:text-base">
              simplifying the process for buyers, sellers, and agents through smart
              design, seamless tech, and a people-first approach
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
