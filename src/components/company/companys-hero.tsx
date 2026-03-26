import Image from 'next/image';
import MainNavPages from '../navbars/main-nav-pages';

export default function HeroLayout() {
  return (
    <>
      <MainNavPages />

      <section className="company-page-hero relative overflow-hidden bg-[#1A0700] text-white">
        <div className="absolute inset-0 bg-[#1A0700]" />

        <div className="company-page-hero__mobile relative z-10 mx-auto sm:hidden">
          <div className="company-page-hero__mobile-inner">
            <div className="company-page-hero__mobile-top-row">
              <h1 className="company-page-hero__mobile-display">We</h1>
              <div className="company-page-hero__mobile-image company-page-hero__mobile-image--tall">
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

            <h2 className="company-page-hero__mobile-display company-page-hero__mobile-line">
              Are Redefining
            </h2>

            <div className="company-page-hero__mobile-mid-row">
              <div className="company-page-hero__mobile-image company-page-hero__mobile-image--wide">
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

              <h2 className="company-page-hero__mobile-display">
                Real Estate
              </h2>
            </div>

            <div className="company-page-hero__mobile-script-wrap">
              <h2 className="company-page-hero__mobile-script">
                One Snap
              </h2>
              <div className="company-page-hero__mobile-hand">
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

            <h2 className="company-page-hero__mobile-script company-page-hero__mobile-script--second">
              at a Time
            </h2>

            <p className="company-page-hero__mobile-copy">
              <span className="company-page-hero__mobile-copy-line">
                simplifying the process for buyers, sellers, and agents
              </span>
              <span className="company-page-hero__mobile-copy-line">
                through smart design, seamless tech, and a people-first approach
              </span>
            </p>
          </div>
        </div>

        <div className="company-page-hero__desktop relative z-10 hidden sm:flex">
          <div className="company-page-hero__desktop-inner">
            <div className="company-page-hero__desktop-top-row">
              <h1 className="company-page-hero__desktop-display company-page-hero__desktop-display--we">
                We
              </h1>

              <div className="company-page-hero__desktop-image company-page-hero__desktop-image--tall">
                <Image
                  src="/assets/images/company_hero1.jpg"
                  alt="Nature"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 6rem, 5rem"
                  quality={100}
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/12" />
              </div>
            </div>

            <h2 className="company-page-hero__desktop-display company-page-hero__desktop-line">
              Are Redefining
            </h2>

            <div className="company-page-hero__desktop-mid-row">
              <div className="company-page-hero__desktop-image company-page-hero__desktop-image--wide">
                <Image
                  src="/assets/images/company_hero2.jpg"
                  alt="House"
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 768px) 7rem, 6rem"
                  quality={100}
                  unoptimized
                />
                <div className="absolute inset-0 bg-[#908884]/28" />
              </div>

              <h2 className="company-page-hero__desktop-display">
                Real Estate
              </h2>
            </div>

            <div className="company-page-hero__desktop-script-wrap">
              <h2 className="company-page-hero__desktop-script">
                One Snap
              </h2>

              <div className="company-page-hero__desktop-hand">
                <Image
                  src="/assets/images/company_hero_hand.svg"
                  alt="Snap Hand"
                  fill
                  className="object-contain"
                  sizes="(min-width: 768px) 7rem, 5.5rem"
                  unoptimized
                />
              </div>
            </div>

            <h2 className="company-page-hero__desktop-script company-page-hero__desktop-script--second">
              at a Time
            </h2>

            <p className="company-page-hero__desktop-copy">
              <span className="company-page-hero__desktop-copy-line">
                simplifying the process for buyers, sellers, and agents through smart
              </span>
              <span className="company-page-hero__desktop-copy-line">
                design, seamless tech, and a people-first approach
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
