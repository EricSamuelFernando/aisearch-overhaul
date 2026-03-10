const WeBelive = () => {
  return (
    <>
      {/* WHAT WE BELIEVE + MEET THE TEAM */}
      <section className="bg-[#FFF6EC] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 xl:px-12">
        {/* WHAT WE BELIEVE */}
        <div className="mx-auto mb-24 max-w-6xl sm:mb-32">
          <h2 className="mb-2 text-[2.35rem] font-medium sm:text-[2.75rem] md:text-[3.35rem]">
            What We <span className="font-normal">Believe</span>
          </h2>

          <p className="mx-auto mb-10 max-w-[600px] text-sm text-gray-600 sm:mb-14">
            We believe a home is more than walls and a roof - it's where your
            story unfolds. Our mission is to make your real estate experience
            clear, reliable, and stress-free every step of the way, no matter
            who you are.
          </p>

          <div className="mx-auto flex w-full max-w-[380px] flex-nowrap items-start justify-between gap-2 sm:max-w-none sm:justify-center sm:gap-12 md:gap-16 lg:gap-28 xl:gap-36">
            {[
              {
                img: '/assets/images/company-webelive1.png',
                text: 'Where Home Begins',
              },
              {
                img: '/assets/images/company-webelive2.png',
                text: 'Innovative Growth',
              },
              { img: '/assets/images/company-webelive3.png', text: 'Shared World' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex w-1/3 min-w-0 flex-col items-center sm:w-[170px] lg:w-[200px]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center sm:mb-6 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 xl:h-36 xl:w-36 2xl:h-40 2xl:w-40">
                  <img
                    src={item.img}
                    alt={item.text}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h3 className="text-center text-[11px] font-bold leading-tight sm:text-base">
                  {item.text}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* MEET THE TEAM */}
        <div className="mx-auto mt-20 max-w-7xl text-center sm:mt-24">
          <h2 className="mb-2 text-[2.35rem] font-medium sm:text-[2.75rem] md:text-[3.35rem]">
            Meet The <span className="font-normal">Team</span>
          </h2>

          <p className="mb-10 text-sm text-gray-600 sm:mb-12">
            Dedicated to building real estate experience that works better for
            everyone
          </p>

          <div className="flex flex-row flex-nowrap justify-start gap-4 overflow-x-auto px-4 pb-2 sm:gap-6 sm:px-6 md:gap-8 lg:justify-center lg:gap-12 lg:px-0 xl:gap-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              {
                img: '/assets/images/company-power1.png',
                name: 'Nrupen Mandava',
              },
              {
                img: '/assets/images/company-power2.png',
                name: 'Sundeep Ambati',
              },
              {
                img: '/assets/images/company-power3.png',
                name: 'Chygoz Obike',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative h-[320px] w-[280px] flex-shrink-0 cursor-pointer overflow-hidden rounded-[32px] sm:h-[350px] sm:w-[300px] md:h-[280px] md:w-[260px] lg:h-[350px] lg:w-[300px] xl:h-[400px] xl:w-[340px]"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 flex items-end justify-center rounded-[32px] bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-center text-white">
                  <div>
                    <p className="text-sm font-bold sm:text-base">{item.name}</p>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default WeBelive;