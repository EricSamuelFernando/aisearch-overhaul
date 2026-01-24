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
      <div className="absolute inset-0 bg-[#f7e9d5a5] opacity-50"></div>

      {/* Content */}
      <div className="relative max-w-4xl text-center text-[#1B1B1B]">
        <h2 className="text-3xl font-bold mb-6">
          Who We <span className="font-normal">Are</span>
        </h2>
        <p className="mb-6 text-base text-[#595858] max-w-[80%] mx-auto">
          We're not just another real estate company — we're a movement. At Snaphomz, we're a united community who combine deep market knowledge with technological innovation to transform the way you find and secure your dream home. We believe in making real estate transactions as smooth as a snap of your fingers.
        </p>
        <p className="mb-6 text-base text-[#595858] max-w-[80%] mx-auto">
          Setting foundation first, We build lasting relationships on trust and expertise, with “transparency” in every “transaction” through simplified “technology”.
        </p>
        <p className="text-base max-w-[80%] text-[#595858] mx-auto">
          Community growth starts with individual success
        </p>
      </div>
    </section>

    {/* <section
        className="relative w-full py-20 px-10 flex justify-center"
        style={{
          backgroundImage: `url('/assets/images/company-whowe.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '700px',
        }}
      >
      
        <div className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="bg-[#F7E9D7] rounded-xl p-6 shadow-lg text-center">
            <h3 className="font-bold mb-2 text-lg">People Driven</h3>
            <p className="text-sm text-[#777675]">
              Human connections at the heart of every interaction and decision.
            </p>
          </div>

          <div className="bg-[#F7E9D7] rounded-xl p-6 shadow-lg text-center">
            <h3 className="font-bold mb-2 text-lg">Open House. Open Mind</h3>
            <p className="text-sm text-[#777675]">
              Breaking barriers to create accessible opportunities in every market.
            </p>
          </div>

          <div className="bg-[#F7E9D7] rounded-xl p-6 shadow-lg text-center">
            <h3 className="font-bold mb-2 text-lg">Digital Edge</h3>
            <p className="text-sm text-[#777675]">
              We build revolutionary digital solutions to disrupt the traditional real estate.
            </p>
          </div>
        </div>
      </section> */}
    <section
  className="relative w-full pt-20 pb-56 px-6 flex justify-center"
  style={{
    backgroundImage: `url('/assets/images/company-whowe.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '700px',
  }}
>
  {/* Light overlay */}
  <div className="absolute inset-0 bg-black/10" />

  <div className="relative max-w-6xl w-full">

    {/* ===== Mobile (card pushed DOWN) ===== */}
    <div className="sm:hidden absolute top-[118%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
      <div className="flex gap-6 overflow-x-auto px-4 snap-x snap-mandatory no-scrollbar">
        
        <div className="snap-center min-w-[300px] bg-[#F7E9D7] rounded-2xl px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h3 className="font-semibold text-lg mb-2 text-[#1E1E1E]">
            People Driven
          </h3>
          <p className="text-sm text-[#777675] leading-relaxed">
            Human connections at the heart of every interaction and decision.
          </p>
        </div>

        <div className="snap-center min-w-[300px] bg-[#F7E9D7] rounded-2xl px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h3 className="font-semibold text-lg mb-2">
            Open House. Open Mind
          </h3>
          <p className="text-sm text-[#777675] leading-relaxed">
            Breaking barriers to create accessible opportunities in every market.
          </p>
        </div>

        <div className="snap-center min-w-[300px] bg-[#F7E9D7] rounded-2xl px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h3 className="font-semibold text-lg mb-2">Digital Edge</h3>
          <p className="text-sm text-[#777675] leading-relaxed">
            We build revolutionary digital solutions to disrupt traditional real estate.
          </p>
        </div>

      </div>
    </div>

    {/* ===== Desktop (also pushed lower for consistency) ===== */}
    <div className="hidden sm:grid grid-cols-3 gap-8 absolute top-[92%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
      
      <div className="bg-[#F7E9D7] rounded-2xl px-8 py-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.3)]">
        <h3 className="font-semibold text-xl mb-3">People Driven</h3>
        <p className="text-sm text-[#777675] leading-relaxed">
          Human connections at the heart of every interaction and decision.
        </p>
      </div>

      <div className="bg-[#F7E9D7] rounded-2xl px-8 py-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.3)]">
        <h3 className="font-semibold text-xl mb-3">
          Open House. Open Mind
        </h3>
        <p className="text-sm text-[#777675] leading-relaxed">
          Breaking barriers to create accessible opportunities in every market.
        </p>
      </div>

      <div className="bg-[#F7E9D7] rounded-2xl px-8 py-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.3)]">
        <h3 className="font-semibold text-xl mb-3">Digital Edge</h3>
        <p className="text-sm text-[#777675] leading-relaxed">
          We build revolutionary digital solutions to disrupt traditional real estate.
        </p>
      </div>

    </div>
  </div>
</section>


    </>
  );
}; 

export default WhoWeCompany;