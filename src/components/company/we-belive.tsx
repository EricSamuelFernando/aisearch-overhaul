import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const WeBelive = () => {
  return (
    <>
      {/* WHAT WE BELIEVE + MEET THE TEAM */}
      <section className="bg-[#FFF6EC] py-20 px-4 sm:px-6 lg:px-8 xl:px-12 text-center">

        {/* WHAT WE BELIEVE */}
        <div className="max-w-6xl mx-auto mb-32"> {/* ⬅️ increased bottom space */}
          <h2 className="text-3xl font-bold mb-2">
            What We <span className="font-normal">Believe</span>
          </h2>

          <p className="text-sm text-gray-600 mb-14 max-w-[600px] mx-auto">
            We believe a home is more than walls and a roof—it’s where your story unfolds.
            Our mission is to make your real estate experience clear, reliable, and
            stress-free every step of the way, no matter who you are.
          </p>

          {/* ICONS */}
          <div
            className="
              flex justify-center items-start
              gap-16
              md:gap-24
              lg:gap-40
              xl:gap-52
              2xl:gap-64
            "
          >
            {[
              { img: '/assets/images/company-webelive1.png', text: 'Where Home Begins' },
              { img: '/assets/images/company-webelive2.png', text: 'Innovative Growth' },
              { img: '/assets/images/company-webelive3.png', text: 'Shared World' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center w-[200px]">
                <img
                  src={item.img}
                  alt={item.text}
                  className="
                    mb-6
                    w-20 h-20
                    md:w-24 md:h-24
                    lg:w-32 lg:h-32
                    xl:w-36 xl:h-36
                    2xl:w-40 2xl:h-40
                    object-contain
                  "
                />
                <h3 className="font-bold text-center">{item.text}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* MEET THE TEAM */}
        <div className="max-w-7xl mx-auto text-center mt-26"> {/* ⬅️ added top space */}
          <h2 className="text-3xl font-bold mb-2">
            Meet The <span className="font-normal">Team</span>
          </h2>
          <p className="text-xs text-gray-600 mb-12">
            Dedicated to building real estate experience that works better for everyone
          </p>

          <div className="flex flex-nowrap overflow-x-auto md:overflow-x-visible gap-8 md:gap-12 lg:gap-16 xl:gap-20 px-4 sm:px-6 lg:px-0 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              '/assets/images/company-power1.png',
              '/assets/images/company-power2.png',
              '/assets/images/company-power3.png',
            ].map((img, idx) => (
              <div
                key={idx}
                className="
    relative
    rounded-2xl
    overflow-hidden
    flex-shrink-0
    max-w-[280px]
    sm:max-w-[300px]
    md:max-w-[260px]
    lg:max-w-[300px]
    xl:max-w-[340px]
    shadow-lg
  "
              >
                <img
                  src={img}
                  alt="Proper Name"
                  className="w-full h-full object-cover"
                />

                {/* GRADIENT OVERLAY – perfectly clipped */}
                <div
                  className="
      absolute inset-0
      bg-gradient-to-t from-black/80 via-black/30 to-transparent
      flex items-end justify-center
      text-white p-4 text-center
    "
                >
                  <div>
                    <p className="font-bold">Proper Name</p>
                    <p className="text-xs">Official Title</p>
                  </div>
                </div>
              </div>

            ))}
          </div>
        </div>
      </section>

      {/* TALK TO AGENT */}
      <section className="bg-[#170800] text-white py-20 px-8 md:px-20 flex items-center justify-center md:justify-between flex-col md:flex-row w-full mx-auto">
        <div className="max-w-lg text-center md:text-left mb-8 md:mb-0">
          <h2 className="text-4xl font-semibold mb-4">
            Talk to a Snaphomz <span className="font-light">Agent</span>
          </h2>
          <p className="text-sm">
            Take the first step by chatting with an expert local agent—there’s no pressure or obligation.
          </p>
        </div>

        <div className="flex flex-col space-y-2 max-w-md w-full">
          <div className="flex items-center bg-[#2d2525] rounded-lg px-4 py-2 w-full">
            <Search className="text-[#838181] mr-3" size={20} />
            <Input
              className="bg-transparent border-none text-white focus:outline-none w-full"
              placeholder="Search name, email or location"
            />
          </div>

          <div className="w-full flex justify-end">
            <a href="#" className="underline text-sm">
              Invite your own
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default WeBelive;
