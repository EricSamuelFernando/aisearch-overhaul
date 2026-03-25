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

import { cn } from '@/lib/utils';

type ChooseYourMeansProps = {
  headingClassName?: string;
};

const ChooseYourMeans = ({ headingClassName }: ChooseYourMeansProps) => {
  return (
    <section className="mb-0 bg-[#FFF6EC] px-4 pt-0 text-center sm:px-16">
      {/* Choose Your Means Section */}
      <div className="mx-auto max-w-6xl text-center">
        <h2 className={cn('mb-2 satoshi text-3xl font-medium sm:text-4xl', headingClassName)}>
          Choose Your <span className="font-light">Means</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[600px] text-xs text-gray-600 sm:mb-12 sm:text-sm">
          Gain unprecedented control with guided transactions, approval
        </p>

        {/* Card Layout */}
        <div className="home-choose-grid flex gap-4 overflow-x-auto pl-4 pr-4 pb-2 snap-x snap-mandatory md:mx-auto md:grid md:max-w-[1060px] md:grid-cols-[430px_430px] md:justify-center md:gap-20 md:overflow-visible md:px-0 lg:max-w-[1140px] lg:grid-cols-[450px_450px] lg:gap-20">
          {/* Card 1 */}
          <div className="home-choose-card relative h-[345px] min-w-[80vw] snap-start cursor-pointer overflow-hidden rounded-[2.8rem] sm:h-[350px] sm:rounded-[3rem] md:h-[410px] md:min-w-0 lg:h-[455px] lg:rounded-[3.35rem]">
            <img
              src="/assets/images/sell-means1.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-8 px-5 text-center text-white sm:bottom-10 sm:px-6 lg:bottom-12">
              <p className="mb-3 font-semibold text-[1.2rem] leading-[1.1] sm:mb-2 sm:text-[1.85rem] lg:text-[1.95rem]">Your Agent</p>
              <p className="mx-auto mb-5 max-w-[270px] text-[0.92rem] leading-[1.35] text-white/90 sm:mb-4 sm:max-w-[230px] sm:text-[1rem] sm:leading-[1.45]">
                Onboard or invite your personal agent
              </p>
              <button className="mt-4 min-w-[138px] rounded-full border border-white bg-transparent px-6 py-2.5 text-[0.88rem] text-white transition duration-200 sm:min-w-[150px] sm:px-7 sm:py-3 sm:text-[0.95rem]">
                Get Started
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="home-choose-card relative h-[345px] min-w-[80vw] snap-start cursor-pointer overflow-hidden rounded-[2.8rem] sm:h-[350px] sm:rounded-[3rem] md:h-[410px] md:min-w-0 lg:h-[455px] lg:rounded-[3.35rem]">
            <img
              src="/assets/images/sell-means.png"
              alt="Proper Name"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-8 px-5 text-center text-white sm:bottom-10 sm:px-6 lg:bottom-12">
              <p className="mb-3 font-semibold text-[1.2rem] leading-[1.1] sm:mb-2 sm:text-[1.85rem] lg:text-[1.95rem]">Our Agent</p>
              <p className="mx-auto mb-5 max-w-[250px] text-[0.92rem] leading-[1.35] text-white/90 sm:mb-4 sm:max-w-[238px] sm:text-[1rem] sm:leading-[1.45]">
                Choose from our directory list of vetted agents
              </p>
              <button className="mt-4 min-w-[138px] rounded-full border border-white bg-transparent px-6 py-2.5 text-[0.88rem] text-white transition duration-200 sm:min-w-[150px] sm:px-7 sm:py-3 sm:text-[0.95rem]">
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
