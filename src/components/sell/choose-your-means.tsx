// import { SellChooseYourMeansCardData } from '@/data/card';
// import SellMeansCard from './sell-means-card';

// const ChooseYourMeans = () => {
//   return (
//     <section className="bg-[#FAF0E6] pt-32 px-12 mb-20 sm:px-16 text-center">
//       {/* Choose Your Means Section */}
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-3xl sm:text-4xl font-bold mb-2">
//           Choose Your <span className="font-normal">Means</span>
//         </h2>
//         <p className="text-xs sm:text-sm text-gray-600 mb-12 max-w-[600px] mx-auto">
//           Gain unprecedented control with guided transactions, approval
//         </p>

//         {/* Card Grid Layout */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
//           {/* Team member 1 */}
//           <div className="rounded-2xl overflow-hidden relative gcursor-pointer">
//             <img
//               src="/assets/images/sell-means.png"
//               alt="Proper Name"
//               className="w-full h-full object-cover"
//             />
//              <div claassName="absolute rounded-2xl flex flex-col items-center gap-1 bottom-0 left-0 right-0   text-white p-6 text-center">
//                 <p className="font-bold text-lg text-center">Our Agent</p>
//                 <p className="text-md text-center  w-[60%]">Choose from our directory list of vetted agents</p>
//                 <button   className="mt-4 px-6 py-2 bg-transparent border border-white text-white text-xs rounded-full transition duration-200">
//                   Get Started
//                 </button>
//               </div>
//           </div>

//           {/* Team member 2 */}
//           <div className="rounded-2xl overflow-hidden  relative  cursor-pointer">
//             <img
//               src="/assets/images/sell-means1.png"
//               alt="Proper Name"
//               className="w-full h-full object-cover"
//             />
//            <div className="absolute rounded-2xl flex flex-col items-center gap-1 bottom-0 left-0 right-0   text-white p-6 text-center">
//                 <p className="font-bold text-lg text-center">Your Agent</p>
//                 <p className="text-md text-center  w-[60%]">Onboard or invite your personal agent</p>
//                 <button   className="mt-4 px-6 py-2 bg-transparent border border-white text-white text-xs rounded-full transition duration-200">
//                   Get Started
//                 </button>
//               </div>
//           </div>

//           {/* Team member 3 */}
//           <div className="rounded-2xl overflow-hidden  relative  cursor-pointer">
//             <img
//               src="/assets/images/sell-means2.png"
//               alt="Proper Name"
//               className="w-full h-full object-cover "
//             />
//              <div className="absolute rounded-2xl opacity-70 flex flex-col items-center gap-1 bottom-0 left-0 right-0   text-white p-6 text-center">
//                 <p className="font-bold text-lg text-center">Do It Yourself</p>
//                 <p className="text-md text-center  w-[70%]">We will guide you step-by-step using our detailed seller’s guide</p>
//                 <button   className="mt-4  px-6 py-2 bg-transparent border border-white text-white text-xs rounded-full transition duration-200">
//                 Coming Soon
//                 </button>
//               </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ChooseYourMeans;


const ChooseYourMeans = () => {
  return (
    <section className="mb-0 bg-[#FFF6EC] px-4 pt-0 text-center sm:px-16">
      {/* Choose Your Means Section */}
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-2 text-3xl font-bold sm:text-4xl">
          Choose Your <span className="font-normal italic">Means</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[600px] text-xs text-gray-600 sm:mb-12 sm:text-sm">
          Gain unprecedented control with guided transactions, approval
        </p>

        {/* Card Layout */}
        <div
          className="
            -mx-4 flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto px-4 pb-4
            scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-8 sm:overflow-visible sm:px-0 sm:snap-none
          "
        >
          {/* Card 1 */}
          <div className="relative w-[64vw] min-w-[230px] max-w-[270px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[28px] sm:w-[300px] sm:min-w-0 sm:max-w-none">
            <img
              src="/assets/images/sell-means1.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1 rounded-[28px] p-6 text-center text-white">
              <p className="text-center text-base font-bold sm:text-lg">Your Agent</p>
              <p className="w-[75%] text-center text-xs text-[#E5E3E3] sm:w-[60%] sm:text-sm">
                Onboard or invite your personal agent
              </p>
              <button className="mt-4 rounded-full border border-white bg-transparent px-6 py-2 text-xs text-white transition duration-200">
                Get Started
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative w-[64vw] min-w-[230px] max-w-[270px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[28px] sm:w-[300px] sm:min-w-0 sm:max-w-none">
            <img
              src="/assets/images/sell-means.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1 rounded-[28px] p-6 text-center text-white">
              <p className="text-center text-base font-bold sm:text-lg">Our Agent</p>
              <p className="w-[75%] text-center text-xs text-[#E5E3E3] sm:w-[60%] sm:text-sm">
                Choose from our directory list of vetted agents
              </p>
              <button className="mt-4 rounded-full border border-white bg-transparent px-6 py-2 text-xs text-white transition duration-200">
                Get Started
              </button>
            </div>
          </div>

          {/* Card 3 */}
          {/*
          <div className="min-w-[260px] sm:min-w-0 rounded-2xl overflow-hidden relative cursor-pointer">
            <img
              src="/assets/images/sell-means2.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
            <div className="absolute rounded-2xl opacity-70 flex flex-col items-center gap-1 bottom-0 left-0 right-0 text-white p-6 text-center">
              <p className="font-bold text-lg text-center">Do It Yourself</p>
              <p className="text-md text-center w-[70%] text-[#E5E3E3]">
                We will guide you step-by-step using our detailed seller’s guide
              </p>
              <button className="mt-4 px-6 py-2 bg-transparent border border-white text-white text-xs rounded-full transition duration-200">
                Coming Soon
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default ChooseYourMeans;
