      <section
        ref={heroSectionRef}
        className="home-hero relative -mt-24 min-h-[610px] bg-[#170800] pt-28 text-white sm:min-h-[650px] md:min-h-[620px] md:h-[620px] md:max-h-[620px] md:pt-24 lg:min-h-[680px] lg:h-[680px] lg:max-h-[680px] xl:min-h-[740px] xl:h-[740px] xl:max-h-[740px]"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* ================= DESKTOP ARC ================= */}

          <div className="hidden md:flex w-full justify-center items-center overflow-visible">
            <div
              className="home-hero-arc absolute left-1/2 top-28 md:h-[700px] md:w-[880px] lg:top-32 lg:h-[780px] lg:w-[1040px] xl:top-36 xl:h-[850px] xl:w-[1200px] -translate-x-1/2 md:translate-y-20 lg:translate-y-24 xl:translate-y-24"
              style={
                isHomeSearchActive
                  ? ({
                    ['--home-hero-arc-radius' as any]: 'clamp(430px, 40vw, 680px)',
                    ['--home-hero-card-size' as any]: 'clamp(122px, 10.4vw, 162px)'
                  } as React.CSSProperties)
                  : undefined
              }
            >
              {/* Image 1 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(0) }}
              >
                <Image
                  src="/assets/images/home-landing8.png"
                  alt="home-landing-1"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(0) }}
                />
              </div>

              {/* Image 2 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(25.71) }}
              >
                <Image
                  src="/assets/images/home-landing1.png"
                  alt="home-landing-2"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(25.71) }}
                />
              </div>

              {/* Image 3 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(51.43) }}
              >
                <Image
                  src="/assets/images/home-landing6.png"
                  alt="home-landing-3"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(51.43) }}
                />
              </div>

              {/* Image 4 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(77.14) }}
              >
                <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-4"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(77.14) }}
                />
              </div>

              {/* Image 5 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(102.86) }}
              >
                <Image
                  src="/assets/images/home-landing4.png"
                  alt="home-landing-5"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(102.86) }}
                />
              </div>

              {/* Image 6 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(128.57) }}
              >
                <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-6"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(128.57) }}
                />
              </div>

              {/* Image 7 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(154.29) }}
              >
                <Image
                  src="/assets/images/home-landing2.png"
                  alt="home-landing-7"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(154.29) }}
                />
              </div>

              {/* Image 8 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: getOrbitCardTransform(180) }}
              >
                <Image
                  src="/assets/images/home-landing1.png"
                  alt="home-landing-8"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: 'rotate(531deg)' }}
                />
              </div>

              {/* Image 9 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: getOrbitCardTransform(205.71) }}
              >
                <Image
                  src="/assets/images/home-landing2.png"
                  alt="home-landing-9"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(531deg) scale(1.096)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 10 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl relative"
                style={{ transform: getOrbitCardTransform(231.43) }}
              >

                <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-10"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(480deg) scale(1.25)', transformOrigin: '50% 50%' }}
                />

                {/* <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-10"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: 'rotate(458deg)' }}
                  

        
                />*/}
              </div>

              {/* Image 11 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: getOrbitCardTransform(257.14) }}
              >
                <Image
                  src="/assets/images/home-landing4.png"
                  alt="home-landing-11"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(465deg) scale(1.16)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 12 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: getOrbitCardTransform(282.86) }}
              >
                <Image
                  src="/assets/images/home-landing5.png"
                  alt="home-landing-12"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(445deg) scale(1.055)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 13 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform transform overflow-hidden rounded-3xl"
                style={{ transform: getOrbitCardTransform(308.57) }}
              >
                <Image
                  src="/assets/images/home-landing6.png"
                  alt="home-landing-13"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(414deg) scale(1.269)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 14 */}
              <div
                className="absolute left-1/2 top-[46%] h-[var(--home-hero-card-size)] w-[var(--home-hero-card-size)] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: getOrbitCardTransform(334.29) }}
              >
                <Image
                  src="/assets/images/home-landing7.png"
                  alt="home-landing-14"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(390deg) scale(1.247)', transformOrigin: '50% 50%' }}
                />
              </div>

            </div>
          </div>
          {/* ================= MOBILE ARC ================= */}
          <div className="relative w-full md:hidden pointer-events-none">
            <div className="home-hero-mobile-stage absolute left-1/2 -translate-x-1/2 overflow-visible">
              {mobileHeroCards.map((card, i) => (
                <div
                  key={i}
                  className="home-hero-mobile-card absolute overflow-hidden rounded-[1.2rem] shadow-sm"
                  style={{
                    left: card.left,
                    top: card.top,
                    width: card.width,
                    height: card.height,
                    transform: `rotate(${card.rotation}deg)`,
                  }}
                >
                  <Image
                    src={card.src}
                    alt={`mobile-hero-${i}`}
                    width={95}
                    height={95}
                    className="h-full w-full object-cover"
                    style={{ transform: `scale(${card.imageScale})`, objectPosition: card.objectPosition }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>


        <section
          className={`home-hero-shell relative z-30 flex h-full flex-col items-center justify-start px-4 pb-2 pt-[13.2rem] text-center sm:pb-4 sm:pt-[15rem] md:pb-12 md:pt-24 ${isHomeSearchActive ? 'home-hero-shell--expanded' : ''
            }`}
          style={isHomeSearchActive ? { justifyContent: 'flex-start' } : undefined}
        >

          {/* ================= TEXT + SEARCH ================= */}
          <div
            ref={heroContentRef}
            className={`home-hero-content relative z-30 flex w-full max-w-[1600px] flex-col items-center gap-3 transition-transform duration-300 md:gap-5 md:-mt-2 lg:-mt-4 ${isHomeSearchActive ? '' : 'md:translate-y-10 lg:translate-y-12'}`}
          >

            <h1 className="home-hero-title max-w-[340px] text-[2.55rem] font-medium leading-[1.06] tracking-[-0.03em] sm:max-w-[380px] sm:text-[2.8rem] md:max-w-none md:leading-snug md:tracking-tight md:text-[2.05rem] lg:text-[2.2rem] xl:text-[2.55rem] 2xl:text-[3.05rem]">
              <span className="block">Buying a home</span>
              <span className="block">
                should be{' '}
                <span className="font-extralight italic">Very Easy</span>
              </span>
            </h1>

            <p className="home-hero-subtitle my-2 max-w-none whitespace-nowrap text-[0.82rem] font-medium text-[#CEB28B] sm:my-3 sm:text-[0.98rem]">
              First end-to-end guided real estate platform
            </p>

            <div className="relative w-full flex justify-center text-black">
              <div
                className={`home-hero-search-wrap mx-auto w-full transition-all duration-300 ${isHomeSearchActive ? 'home-hero-search-wrap--expanded' : ''}`}
                style={isHomeSearchActive ? { maxWidth: 'min(96vw, 68rem)' } : undefined}
              >
                <HeroSearchForm
                  onSearchStateChange={(isActive) => setIsHomeSearchActive(isActive)}
                  onSuggestionsOpen={(open) => setIsSearchSuggestionsOpen(open)}
                  respectParentWidth
                />
              </div>

              {/* <div className="mt-4 flex justify-center gap-4 text-sm text-white">
                <Radio
                  value="nlp"
                  label="Search by Location"
                  size="xs"
                  checked={searchMethod === 'nlp'}
                  onChange={() => setSearchMethod('nlp')}
                />
                <Radio
                  value="address"
                  label="Search by Full Address"
                  size="xs"
                  checked={searchMethod === 'address'}
                  onChange={() => setSearchMethod('address')}
                />
              </div> */}
            </div>

            <div className="home-hero-meta mt-2 flex items-center justify-center transition-all duration-200 md:-mt-3 md:gap-x-3">
              <span className={`whitespace-nowrap text-[0.82rem] font-medium transition-colors md:text-[1rem] ${heroMetaTextClass}`}>
                Conversational Search,
              </span>
              <div className="home-hero-meta-copy flex items-center gap-2">
                <span
                  className={`whitespace-nowrap text-[0.82rem] font-bold underline transition-colors md:text-[1rem] ${heroMetaAccentClass}`}
                >
                  Powered by Snaphomz AI.
                </span>
                <button className="uiverse home-hero-beta">
                  <div className="wrapper">
                    <span>BETA</span>
                    <div className="circle circle-12"></div>
                    <div className="circle circle-11"></div>
                    <div className="circle circle-10"></div>
                    <div className="circle circle-9"></div>
                    <div className="circle circle-8"></div>
                    <div className="circle circle-7"></div>
                    <div className="circle circle-6"></div>
                    <div className="circle circle-5"></div>
                    <div className="circle circle-4"></div>
                    <div className="circle circle-3"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-1"></div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* bottom gradient */}
        <div
          className="absolute bottom-0 h-20 w-full"
          style={{
            background:
              'linear-gradient(to bottom, rgba(25,7,0,0) 4.07%, #190700 55.92%)',
          }}
        />
      </section>