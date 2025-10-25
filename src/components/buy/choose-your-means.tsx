'use client';
import Link from "next/link";

const ChooseYourMeans = () => {
  return (
       <section className="bg-[#FAF0E6] pt-32 px-12 sm:px-16 text-center">
      {/* Choose Your Means Section */}
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-medium ">
          Choose Your <span className="font-normal">Means</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-20 max-w-[600px] mx-auto">
          Gain unprecedented control with guided transactions, approval
        </p>

        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 sm:gap-16">
          {/* Team member 1 */}
          <div className="rounded-2xl overflow-hidden  relative cursor-pointer">
            <img
              src="/assets/images/landing-means.png"
              alt="Proper Name"
              className="relative w-full h-full object-cover "
            />
            <div className="absolute rounded-2xl bottom-0 left-0 right-0   text-white p-6 text-center">
                <p className="font-bold text-md text-center">Your Agent</p>
                <p className="text-xs">Onboard or invite your personal agent</p>
                <button  onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"}  className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
                  Get Started
                </button>
              </div>
          </div>


          {/* Team member 2 */}
          <div className="rounded-2xl overflow-hidden  relative group cursor-pointer">
            <img
              src="/assets/images/landing-means1.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
             <div className="absolute bottom-0 left-0 right-0 text-white p-6 text-center">
                <p className="font-bold text-md text-center">Your Agent</p>
                <p className="text-xs">Choose from our vetted list of agents</p>
                <button  onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"} className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
                  Get Started
                </button>
              </div>
          </div>

          {/* Team member 3 */}
          <div className="rounded-2xl overflow-hidden relative group cursor-pointer">
            <img
              src="/assets/images/landing-means2.png"
              alt="Proper Name"
              className="w-full h-full object-cover "
            />
              <div className="absolute bottom-0 left-0 right-0  text-[#e5e3e357] p-6 text-center">
                <p className="font-bold text-md text-center">Do It Yourself</p>
                <p className="text-xs ">We’ll guide you in every step</p>
                {/* <button  onClick={() => window.location.href = "https://preprod.snaphomz.com/home"} className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
                  Coming Soon
                  </button> */}
                  <button
  disabled
  className="mt-4 px-6 py-2 rounded-full text-sm
             bg-black text-white transition duration-200
             disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
>
  Coming Soon
</button>

              </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export { ChooseYourMeans };
