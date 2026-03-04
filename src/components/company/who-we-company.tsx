const WhoWeCompany = () => {
  return (
    <>
      {/* ================= WHO WE ARE ================= */}
      <section
        className="relative flex w-full items-center justify-center px-4 py-20 sm:px-6 md:py-28 lg:py-36"
        style={{
          backgroundImage: `url('/assets/images/company-whoare.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#f7e9d5a5] opacity-50" />

        <div className="relative max-w-4xl text-center text-[#1B1B1B]">
          <h2 className="mb-5 text-[2.35rem] font-semibold sm:mb-6 sm:text-[2.75rem] md:text-[3.35rem]">
            Who We <span className="font-normal">Are</span>
          </h2>

          <p className="mx-auto mb-5 w-full max-w-[90%] text-base text-[#595858] sm:mb-6 sm:max-w-[85%] md:max-w-[80%] md:text-lg">
            We're not just another real estate company - we're a movement. At
            Snaphomz, we're a united community who combine deep market knowledge
            with technological innovation to transform the way you find and
            secure your dream home.
          </p>

          <p className="mx-auto mb-5 w-full max-w-[90%] text-base text-[#595858] sm:mb-6 sm:max-w-[85%] md:max-w-[80%] md:text-lg">
            Setting foundation first, we build lasting relationships on trust
            and expertise, with transparency in every transaction through
            simplified technology.
          </p>

          <p className="mx-auto w-full max-w-[90%] text-base text-[#595858] sm:max-w-[85%] md:max-w-[80%] md:text-lg">
            Community growth starts with individual success
          </p>
        </div>
      </section>

      {/* ================= CARDS SECTION ================= */}
      <section
        className="relative flex w-full justify-center px-4 pb-20 pt-16 sm:px-6 lg:px-6 lg:pb-56 lg:pt-20"
        style={{
          backgroundImage: `url('/assets/images/company-whowe.jpg')`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative w-full max-w-6xl">
          <div className="h-[180px] sm:h-[220px] lg:h-[520px]" />

          <div className="w-full lg:hidden">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth px-1 pb-2 sm:gap-6 sm:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="snap-center min-w-[85%] rounded-2xl bg-[#F7E9D7] px-5 py-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:min-w-[300px] sm:px-6 sm:py-8">
                <h3 className="mb-2 text-lg font-semibold">People Driven</h3>
                <p className="text-sm leading-relaxed text-[#777675]">
                  Human connections at the heart of every interaction and
                  decision.
                </p>
              </div>

              <div className="snap-center min-w-[85%] rounded-2xl bg-[#F7E9D7] px-5 py-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:min-w-[300px] sm:px-6 sm:py-8">
                <h3 className="mb-2 text-lg font-semibold">
                  Open House. Open Mind
                </h3>
                <p className="text-sm leading-relaxed text-[#777675]">
                  Breaking barriers to create accessible opportunities in every
                  market.
                </p>
              </div>

              <div className="snap-center min-w-[85%] rounded-2xl bg-[#F7E9D7] px-5 py-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:min-w-[300px] sm:px-6 sm:py-8">
                <h3 className="mb-2 text-lg font-semibold">Digital Edge</h3>
                <p className="text-sm leading-relaxed text-[#777675]">
                  We build revolutionary digital solutions to disrupt
                  traditional real estate.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 hidden w-full -translate-x-1/2 grid-cols-3 gap-8 px-4 lg:-bottom-40 lg:grid">
            <div className="rounded-2xl bg-[#F7E9D7] px-8 py-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.3)]">
              <h3 className="mb-3 text-xl font-semibold">People Driven</h3>
              <p className="text-sm leading-relaxed text-[#777675]">
                Human connections at the heart of every interaction and
                decision.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7E9D7] px-8 py-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.3)]">
              <h3 className="mb-3 text-xl font-semibold">
                Open House. Open Mind
              </h3>
              <p className="text-sm leading-relaxed text-[#777675]">
                Breaking barriers to create accessible opportunities in every
                market.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7E9D7] px-8 py-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.3)]">
              <h3 className="mb-3 text-xl font-semibold">Digital Edge</h3>
              <p className="text-sm leading-relaxed text-[#777675]">
                We build revolutionary digital solutions to disrupt traditional
                real estate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhoWeCompany;

