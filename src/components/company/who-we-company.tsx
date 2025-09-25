import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const WhoWeCompany = () => {
  return (
    <>

    <section
      className="relative w-full py-36 px-10 flex justify-center items-center"
      style={{
        backgroundImage: `url('/assets/images/company-whoare.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#f7e9d5a5] opacity-90"></div>

      {/* Content */}
      <div className="relative max-w-4xl text-center text-[#1B1B1B]">
        <h2 className="text-3xl font-bold mb-6">
          Who We <span className="font-normal">Are</span>
        </h2>
        <p className="mb-6 text-base text-gray-600 max-w-[80%] mx-auto">
          We're not just another real estate company — we're a movement. At Snaphomz, we're a united community who combine deep market knowledge with technological innovation to transform the way you find and secure your dream home. We believe in making real estate transactions as smooth as a snap of your fingers.
        </p>
        <p className="mb-6 text-base text-gray-600 max-w-[80%] mx-auto">
          Setting foundation first, We build lasting relationships on trust and expertise, with “transparency” in every “transaction” through simplified “technology”.
        </p>
        <p className="text-base max-w-[80%] text-gray-600 mx-auto">
          Community growth starts with individual success
        </p>
      </div>
    </section>

    <section
        className="relative w-full py-20 px-10 flex justify-center"
        style={{
          backgroundImage: `url('/assets/images/company-whowe.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '700px',
        }}
      >
        {/* Overlay (slightly tint the background) */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Cards container */}
        <div className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {/* ------------------------------------------- */}
          {/* Card #1 */}
          {/* ------------------------------------------- */}
          <div className="bg-[#F7E9D7] rounded-xl p-6 shadow-lg text-center">
            <h3 className="font-bold mb-2 text-lg">People Driven</h3>
            <p className="text-sm text-gray-700">
              Human connections at the heart of every interaction and decision.
            </p>
          </div>

          {/* ------------------------------------------- */}
          {/* Card #2 */}
          {/* ------------------------------------------- */}
          <div className="bg-[#F7E9D7] rounded-xl p-6 shadow-lg text-center">
            <h3 className="font-bold mb-2 text-lg">Open House. Open Mind</h3>
            <p className="text-sm text-gray-700">
              Breaking barriers to create accessible opportunities in every market.
            </p>
          </div>

          {/* ------------------------------------------- */}
          {/* Card #3 */}
          {/* ------------------------------------------- */}
          <div className="bg-[#F7E9D7] rounded-xl p-6 shadow-lg text-center">
            <h3 className="font-bold mb-2 text-lg">Digital Edge</h3>
            <p className="text-sm text-gray-700">
              We build revolutionary digital solutions to disrupt the traditional real estate.
            </p>
          </div>
        </div>
      </section>
        
    </>
  );
}; 

export default WhoWeCompany;



