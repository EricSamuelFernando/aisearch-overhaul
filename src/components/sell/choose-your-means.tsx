// import React from 'react';

// const ChooseYourMeans = () => {
//   return (
//     <section className="bg-[#FAF0E6] pt-2 px-6 sm:px-12 mb-20 text-center">
//       {/* Section Title */}
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-3xl sm:text-4xl font-bold mb-2">
//           Choose Your <span className="font-normal">Means</span>
//         </h2>
//         <p className="text-xs sm:text-sm text-gray-600 mb-12 max-w-[600px] mx-auto">
//           Gain unprecedented control with guided transactions, approval
//         </p>

//         {/*  Responsive Card Layout */}
//         <div
//           className="
//             flex overflow-x-auto gap-6 pb-4 px-2 scrollbar-hide
//             sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-12 sm:overflow-visible
//           "
//         >
//           {/* Card 1 */}
//           <div className="min-w-[80%] sm:min-w-0 flex-shrink-0 rounded-2xl overflow-hidden relative cursor-pointer">
//             <img
//               src="/assets/images/sell-means.png"
//               alt="Our Agent"
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-6 bg-gradient-to-t from-black/60 to-transparent">
//               <p className="font-bold text-lg">Our Agent</p>
//               <p className="text-md w-[60%]">
//                 Choose from our directory list of vetted agents
//               </p>
//               <button className="mt-4 px-6 py-2 border border-white text-white text-xs rounded-full transition duration-200">
//                 Get Started
//               </button>
//             </div>
//           </div>

//           {/* Card 2 */}
//           <div className="min-w-[80%] sm:min-w-0 flex-shrink-0 rounded-2xl overflow-hidden relative cursor-pointer">
//             <img
//               src="/assets/images/sell-means1.png"
//               alt="Your Agent"
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-6 bg-gradient-to-t from-black/60 to-transparent">
//               <p className="font-bold text-lg">Your Agent</p>
//               <p className="text-md w-[60%]">
//                 Onboard or invite your personal agent
//               </p>
//               <button className="mt-4 px-6 py-2 border border-white text-white text-xs rounded-full transition duration-200">
//                 Get Started
//               </button>
//             </div>
//           </div>

//           {/* Card 3 */}
//           <div className="min-w-[80%] sm:min-w-0 flex-shrink-0 rounded-2xl overflow-hidden relative cursor-pointer">
//             <img
//               src="/assets/images/sell-means2.png"
//               alt="Do It Yourself"
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-6 bg-gradient-to-t from-black/60 to-transparent opacity-80">
//               <p className="font-bold text-lg">Do It Yourself</p>
//               <p className="text-md w-[70%]">
//                 We will guide you step-by-step using our detailed seller’s guide
//               </p>
//               <button className="mt-4 px-6 py-2 border border-white text-white text-xs rounded-full transition duration-200">
//                 Coming Soon
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ChooseYourMeans;



import React from 'react';

const ChooseYourMeans = () => {
  return (
    <section className="bg-[#FAF0E6] pt-11 pb-16 px-6 sm:px-12 text-center">
      {/* Heading */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-[#1A1A1A]">
          Choose Your <span className="font-normal italic">Means</span>
        </h2>
        <p className="text-[13px] sm:text-sm text-[#6B6B6B] mb-10 max-w-[420px] mx-auto leading-relaxed">
          Gain unprecedented control with guided transactions, approval
        </p>

        {/* Cards Container */}
        <div
          className="
            flex overflow-x-auto snap-x snap-mandatory gap-5 scrollbar-hide
            sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:snap-none
          "
        >
          {/* Card 1 */}
          <div className="min-w-[80%] sm:min-w-0 flex-shrink-0 snap-center rounded-2xl overflow-hidden relative bg-white shadow-md">
            <img
              src="/assets/images/sell-means1.png"
              alt="Your Agent"
              className="w-full h-[340px] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl flex flex-col items-center justify-end pb-8 text-white">
              <h3 className="text-lg font-semibold mb-1">Your Agent</h3>
              <p className="text-sm max-w-[70%] leading-snug mb-4 opacity-90">
                Onboard or invite your personal agent
              </p>
              <button className="px-6 py-2 border border-white text-white text-xs rounded-full hover:bg-white hover:text-black transition-all">
                Get Started
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="min-w-[80%] sm:min-w-0 flex-shrink-0 snap-center rounded-2xl overflow-hidden relative bg-white shadow-md">
            <img
              src="/assets/images/sell-means.png"
              alt="Our Agent"
              className="w-full h-[340px] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl flex flex-col items-center justify-end pb-8 text-white">
              <h3 className="text-lg font-semibold mb-1">Our Agent</h3>
              <p className="text-sm max-w-[70%] leading-snug mb-4 opacity-90">
                Choose from our directory list of vetted agents
              </p>
              <button className="px-6 py-2 border border-white text-white text-xs rounded-full hover:bg-white hover:text-black transition-all">
                Get Started
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="min-w-[80%] sm:min-w-0 flex-shrink-0 snap-center rounded-2xl overflow-hidden relative bg-white shadow-md">
            <img
              src="/assets/images/sell-means2.png"
              alt="Do It Yourself"
              className="w-full h-[340px] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl flex flex-col items-center justify-end pb-8 text-white opacity-90">
              <h3 className="text-lg font-semibold mb-1">Do It Yourself</h3>
              <p className="text-sm max-w-[75%] leading-snug mb-4 opacity-90">
                We will guide you step-by-step using our detailed seller’s guide
              </p>
              <button className="px-6 py-2 border border-white text-white text-xs rounded-full opacity-80 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChooseYourMeans;
