import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const WeBelive = () => {
  return (
    <>
      <section className="bg-[#FAF0E6] py-20 px-8 text-center">
        {/* What We Believe */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-2">
            What We <span className="font-normal">Believe</span>
          </h2>
          <p className="text-sm text-gray-600 mb-12 max-w-[600px] mx-auto">
            We believe a home is more than walls and a roof—it’s where your story unfolds. Our mission is to make your real estate experience clear, reliable, and stress-free every step of the way, no matter who you are.
          </p>

          {/* Icons with text */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center max-w-[185px]">
              <img src="/assets/images/company-webelive1.png" alt="Where Home Begins" className="mb-4" />
              <h3 className="font-bold mb-1">Where Home Begins</h3>
            </div>

            <div className="flex flex-col items-center max-w-[185px]">
              <img src="/assets/images/company-webelive2.png" alt="Where Home Begins" className="mb-4" />
              <h3 className="font-bold mb-1">Innovative Growth</h3>
            </div>

            <div className="flex flex-col items-center max-w-[185px]">
              <img src="/assets/images/company-webelive3.png" alt="Where Home Begins" className="mb-4" />
              <h3 className="font-bold mb-1">Shared World</h3>
            </div>
          </div>
        </div>

        {/* Meet The Team */}
      <section className="max-w-5xl mx-auto text-center">
  <h2 className="text-3xl font-bold mb-2">
    Meet The <span className="font-normal">Team</span>
  </h2>
  <p className="text-xs text-gray-600 mb-12">
    Dedicated to building real estate experience that works better for everyone
  </p>

  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
    {/* Team member 1 */}
    <div className="rounded-2xl overflow-hidden sm:max-w-[300px] md:max-w-[240px] shadow-lg relative group cursor-pointer">
      <img
        src="/assets/images/company-power1.png"
        alt="Proper Name"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 text-left">
        <p className="font-bold">Proper Name</p>
        <p className="text-xs">Official Title</p>
      </div>
    </div>

    {/* Team member 2 */}
    <div className="rounded-2xl overflow-hidden sm:max-w-[300px] md:max-w-[240px] shadow-lg relative group cursor-pointer">
      <img
        src="/assets/images/company-power2.png"
        alt="Proper Name"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 text-left">
        <p className="font-bold">Proper Name</p>
        <p className="text-xs">Official Title</p>
      </div>
    </div>

    {/* Team member 3 */}
    <div className="rounded-2xl overflow-hidden sm:max-w-[300px] md:max-w-[240px] shadow-lg relative group cursor-pointer">
      <img
        src="/assets/images/company-power3.png"
        alt="Proper Name"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 text-left">
        <p className="font-bold">Proper Name</p>
        <p className="text-xs">Official Title</p>
      </div>
    </div>
  </div>
</section>

      </section>

      <section className="bg-[#170800] text-white py-20 px-8 md:px-20 flex items-center justify-center md:justify-between flex-col md:flex-row w-full mx-auto">
        {/* Left text content */}
        <div className="max-w-lg text-center md:text-left mb-8 md:mb-0">
          <h2 className="text-4xl font-light mb-4 font-semibold">
            Talk to a Snaphomz <span className="font-light">Agent</span>
          </h2>
          <p className="text-sm text-white">
            Take the first step by chatting with an expert local agent—there’s no pressure or obligation.
          </p>
        </div>

        {/* Search input */}
        <div className="flex flex-col space-y-2 max-w-md w-full">
          <div className="flex items-center bg-[#2d2525] rounded-lg px-4 py-2 w-full">
            <Search className="text-[#838181] mr-3" size={20} />
            <Input
              className="bg-transparent border-none text-white placeholder-[#2D2525] focus:outline-none w-full"
              placeholder="Search name, email or location"
            />
          </div>

          <div className="w-full flex justify-end">
            <a
              href="#"
              className="text-white underline text-sm hover:text-white transition"
            >
              Invite your own
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default WeBelive;
