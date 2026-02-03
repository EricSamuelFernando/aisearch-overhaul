// 'use client';

// import { useState } from 'react';
// import { ArrowRight, Info } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// const OfferStrengthAnalyzer = () => {
//   const [price, setPrice] = useState('$180,000');
//   const successPercentage = 80; // Static for now, can be dynamic later

//   return (
//     <section className='bg-black py-12 text-white'>
//       <div className='container mx-auto px-4 md:px-8 lg:px-16'>
//         {/* Heading */}
//         <div className='text-center'>
//           <h2 className='text-5xl font-bold capitalize'>Offer Strength Analyzer</h2>
//           <p className='mt-2 text-lg'>
//             Gauge the strength of your bid by comparing your offer price against
//             market data and potential competitor offers
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className='mt-10 flex flex-col items-center justify-center gap-6 md:flex-row'>
//           {/* Left Section - Input Form */}
//           <div className='w-full max-w-lg rounded-xl bg-[#FDF1E8] p-6 shadow-lg'>
//             {/* Address / MLS Input */}
//             <div className='relative flex items-center'>
//               <Input
//                 type='text'
//                 placeholder='Enter your address or MLS#'
//                 className='w-full rounded-md border border-gray-300 p-3 text-black'
//               />
//               <Button
//                 size='icon'
//                 className='absolute right-2 h-7 bg-black text-white hover:bg-gray-800'
//               >
//                 <ArrowRight />
//               </Button>
//             </div>

//             {/* MSRP Info */}
//             <div className='mt-4 flex items-center space-x-2 text-gray-700'>
//               <p>MSRP: <span className='font-semibold'>$250,596</span></p>
//               <Info className='h-4 w-4 text-orange-500' />
//             </div>

//             {/* Offer Price Input */}
//             <div className='mt-4 flex items-center justify-between'>
//               <p className='font-bold text-black text-lg'>What is Your Price</p>
//               <ArrowRight className='text-black' />
//               <Input
//                 type='text'
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//                 className='w-32 rounded-md border border-gray-300 p-2 text-black text-center'
//               />
//             </div>

//             {/* Check Strength Button */}
//             <Button className='mt-6 w-full bg-black text-white hover:bg-gray-800'>
//               Check Strength
//             </Button>
//           </div>

//           {/* Right Section - Success Meter */}
//           <div className='w-full max-w-sm rounded-xl bg-[#1D1D1D] p-6 flex flex-col items-center justify-center'>
//             {/* Circular Progress Meter */}
//             <div className='relative w-40 h-40'>
//               <svg viewBox='0 0 36 36' className='w-full h-full'>
//                 <path
//                   className='stroke-current text-gray-300'
//                   strokeWidth='4'
//                   fill='transparent'
//                   d='M18 2a16 16 0 1 1 0 32'
//                 />
//                 <path
//                   className='stroke-current text-orange-500'
//                   strokeWidth='4'
//                   fill='transparent'
//                   strokeDasharray={`${successPercentage}, 100`}
//                   d='M18 2a16 16 0 1 1 0 32'
//                 />
//               </svg>
//               <span className='absolute inset-0 flex items-center justify-center text-2xl font-bold'>
//                 {successPercentage}%
//               </span>
//             </div>

//             {/* Success Message */}
//             <p className='mt-4 text-center text-lg'>
//               Your Have Chances of Success !
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export { OfferStrengthAnalyzer };

'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// const OfferStrengthAnalyzer = () => {
//   const [price, setPrice] = useState('$180,000');
//   const successPercentage = 80; // 0–100

//   const SVG_W = 200;  
//   const SVG_H = 100;  
//   const CX = 120;     
//   const CY = 120;     
//   const R  = 80;     
//   const STROKE = 30;  

//   // Clamp between 0 and 100, then map 0 → π, 100 → 0
//   const perc = Math.max(0, Math.min(100, successPercentage)) / 100;
//   const endAng = Math.PI * (1 - perc);

//   // Starting point at 180° = (CX - R, CY)
//   const startX = CX - R;
//   const startY = CY;

//   // Endpoint of the orange arc (at angle = endAng)
//   const endX = CX + R * Math.cos(endAng);
//   const endY = CY - R * Math.sin(endAng);

//   // Rightmost bottom of the half‐circle = (CX + R, CY)
//   const rightX = CX + R;
//   const rightY = CY;

//   const orangeArc = `
//     M ${startX} ${startY}
//     A ${R} ${R} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}
//   `;
//   const grayArc = `
//     M ${endX.toFixed(2)} ${endY.toFixed(2)}
//     A ${R} ${R} 0 0 1 ${rightX} ${rightY}
//   `;

//   return (
//     <section id="offer-strength" className="bg-[#FDF1E8] py-16">
//       <div className="mx-auto max-w-5xl px-6 text-center">
//         <h2 className="text-3xl sm:text-4xl font-bold mb-2">
//           Offer Strength Analyzer
//         </h2>
//         <p className="mt-3 text-lg text-gray-700">
//           Gauge the strength of your bid by comparing your offer price against market data and potential competitor offers
//         </p>
//       </div>

//       <div className="mt-12 mx-auto overflow-hidden md:flex">

//         {/* Left side with the graph */}
//         <div className="flex w-full items-center justify-center bg-[#191919] py-12 md:w-1/2">
//           <div className="relative w-full h-64 md:h-80">
//             <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">
//               <defs>
//                 <linearGradient
//                   id="arcGradient"
//                   x1="0%"
//                   y1="100%"
//                   x2="100%"
//                   y2="0%"
//                   gradientUnits="userSpaceOnUse"
//                 >
//                   <stop offset="0%" stopColor="#F97316" />  {/* deep orange */}
//                   <stop offset="100%" stopColor="#FCD34D" /> {/* bright yellow */}
//                 </linearGradient>
//               </defs>

//               {/* Orange Arc */}
//               <path
//                 d={orangeArc}
//                 stroke="url(#arcGradient)"
//                 strokeWidth={STROKE}
//                 fill="none"
//                 strokeLinecap="round"
//               />

//               <path
//                 d={grayArc}
//                 stroke="#FFF6EC"
//                 strokeWidth={STROKE}
//                 fill="none"
//                 strokeLinecap="round"  
//               />
//             </svg>

//             <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
//               {successPercentage}%
//             </span>
//           </div>
//         </div>

//         <div className="w-full bg-[#FFF6EC] border border-gray-300 px-8 py-20 md:w-1/2">
//           <div className="space-y-6">
//             <div>
//               <Input
//                 type="text"
//                 placeholder="Enter your address or MLS#"
//                 className="
//                   flex-grow
//                   rounded-lg
//                   border border-gray-200
//                   bg-[#F3EAE1]
//                   px-4 py-8
//                   text-gray-700
//                   placeholder-gray-400
//                   focus:ring-2 focus:ring-indigo-200
//                 "
//               />

//               <div className="flex items-center justify-end text-[12px] pt-4">
//                 <span className="font-medium text-black">MSRP:</span>
//                 <div className="flex items-center space-x-1">
//                   <span className="font-bold text-black">$250,596</span>
//                   <Info className="h-4 w-4 text-orange-500" />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <div className="flex items-center bg-[#F3EAE1] rounded-lg px-6 py-4">
//                 <Input
//                   type="text"
//                   placeholder="What is your price?"
//                   className="
//                     flex-grow
//                     bg-transparent
//                     border-none
//                     text-gray-700
//                     placeholder-gray-500
//                     focus:ring-0
//                   "
//                 />

//                 <Button className="ml-4 bg-black text-white rounded-full px-6 py-2 hover:bg-gray-800">
//                   Check Strength
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };
// const OfferStrengthAnalyzer = () => {
//   const [price, setPrice] = useState('$180,000');
//   const successPercentage = 80;

//   // Adjusted for sharper curve and proper stroke width
//   const SVG_W = 80;  // Smaller width
//   const SVG_H = 90;  // Smaller height
//   const CX = 40;
//   const CY = 80;
//   const R = 50;       // Slightly larger radius to avoid too sharp a curve
//   const STROKE = 40;  // Adjusted stroke width for a better visual

//   // Calculate angles for the arc
//   const perc = Math.max(0, Math.min(100, successPercentage)) / 100;
//   const endAng = Math.PI * (1 - perc);

//   const startX = CX - R;
//   const startY = CY;
//   const endX = CX + R * Math.cos(endAng);
//   const endY = CY - R * Math.sin(endAng);
//   const rightX = CX + R;
//   const rightY = CY;

//   const orangeArc = `
//     M ${startX} ${startY}
//     A ${R} ${R} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}
//   `;
//   const grayArc = `
//     M ${endX.toFixed(2)} ${endY.toFixed(2)}
//     A ${R} ${R} 0 0 1 ${rightX} ${rightY}
//   `;

//   return (
//     <section id="offer-strength" className="bg-[#FDF1E8] pt-32 ">
//       <div className="mx-auto max-w-5xl px-6 text-center">
//         <h2 className="text-3xl sm:text-4xl font-medium ">
//           Offer Strength Analyzer
//         </h2>
//         <p className="text-xs sm:text-sm text-gray-600  max-w-[600px] mx-auto">
//           Gauge the strength of your bid by comparing your offer price <br></br> against market data and potential competitor offers
//         </p>
//       </div>

//       <div className="mt-16 mx-auto overflow-hidden md:flex">
//         {/* Left side with the graph */}
//         <div className="flex w-full items-center justify-center bg-[#170800] py-12 md:w-1/2">
//           <div className="relative  w-full h-full md:h-60">
//             <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">
//               <defs>
//                 <linearGradient
//                   id="arcGradient"
//                   x1="0%"
//                   y1="100%"
//                   x2="100%"
//                   y2="0%"
//                   gradientUnits="userSpaceOnUse"
//                 >
//                   <stop offset="0%" stopColor="#F97316" />
//                   <stop offset="100%" stopColor="#FCD34D" />
//                 </linearGradient>
//               </defs>

//               {/* Orange Arc */}
//               <path
//                 d={orangeArc}
//                 stroke="url(#arcGradient)"
//                 strokeWidth={STROKE}
//                 fill="none"

//               />

//               {/* Gray Arc */}
//               <path
//                 d={grayArc}
//                 stroke="#FFF6EC"
//                 strokeWidth={STROKE}
//                 fill="none"

//               />
//             </svg>

//             <span className="absolute inset-0  top-36 flex items-center justify-center text-2xl font-bold text-white">
//               {successPercentage}%
//             </span>
//           </div>
//         </div>

//         <div className="w-full bg-[#FFF6EC] border border-gray-300 px-24 h-full py-16 h-96 md:w-1/2">
//           <div className="space-y-14 flex flex-col  justify-between">
//             <div>
//               <Input
//                 type="text"
//                 placeholder="Enter your address or MLS#"
//                 className="
//                   flex-grow
//                   rounded-lg
//                   border border-gray-200
//                   bg-[#F3EAE1]
//                   px-4 py-10
//                   text-gray-700
//                   placeholder-gray-400
//                   focus:ring-2 focus:ring-orange-500
//                   outline-none
//                 "
//               />

//               <div className="flex items-center justify-end text-[12px] pt-4">
//                 <span className="font-medium text-black">MSRP:</span>
//                 <div className="flex items-center space-x-1">
//                   <span className="font-bold text-black">$250,596</span>
//                   <Info className="h-4 w-4 text-orange-500" />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <div className="flex items-center bg-[#F3EAE1] rounded-lg px-6 py-6">
//                 <Input
//                   type="text"
//                   placeholder="What is your price?"
//                   className="
//                     flex-grow
//                     bg-transparent
//                     border-none
//                     text-gray-700
//                     placeholder-gray-500
//                     focus:ring-2 focus:ring-orange-500
//                     outline-none
//                   "
//                 />

//                 <Button className="ml-4 bg-black text-white rounded-full px-6 py-2 hover:bg-gray-800">
//                   Check Strength
//                 </Button>
//               </div>
//             </div>
//           </div>
//           </div>
//       </div>
//     </section>
//   );
// };


// export { OfferStrengthAnalyzer };

const OfferStrengthAnalyzer = () => {
  const [price, setPrice] = useState('$180,000');
  const successPercentage = 80;

  // Responsive SVG values
  const SVG_W = 200;
  const SVG_H = 120;
  const CX = 100;
  const CY = 110;
  const R = 80;
  const STROKE = 36;

  const perc = Math.max(0, Math.min(100, successPercentage)) / 100;
  const endAng = Math.PI * (1 - perc);

  const startX = CX - R;
  const startY = CY;
  const endX = CX + R * Math.cos(endAng);
  const endY = CY - R * Math.sin(endAng);
  const rightX = CX + R;
  const rightY = CY;

  const orangeArc = `
    M ${startX} ${startY}
    A ${R} ${R} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}
  `;
  const grayArc = `
    M ${endX.toFixed(2)} ${endY.toFixed(2)}
    A ${R} ${R} 0 0 1 ${rightX} ${rightY}
  `;

  return (
    <section id="offer-strength" className="bg-[#FFF6EC] pt-16 md:pt-32">
      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className=" satoshi text-3xl sm:text-4xl font-semibold ">
          Offer Strength <span className="font-light">Analyzer</span>
        </h2>
        <p className="mt-2 text-sm text-[#8E8B8A] max-w-[600px] mx-auto satoshi">
          Gauge the strength of your bid by comparing your offer price
          against market data and potential competitor offers
        </p>
      </div>

      {/* Content */}
      <div className="mt-10 md:flex
  mx-auto
  max-w-6xl lg:max-w-none
  px-4 sm:px-6 lg:px-0
">
        {/* Graph */}
        <div className="flex w-full items-center justify-center bg-[#170800] py-10 md:w-1/2">
          <div className="relative w-full max-w-sm">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
              <defs>
                <linearGradient
                  id="arcGradient"
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
              </defs>

              <path
                d={orangeArc}
                stroke="url(#arcGradient)"
                strokeWidth={STROKE}
                fill="none"
              />

              <path
                d={grayArc}
                stroke="#FFF6EC"
                strokeWidth={STROKE}
                fill="none"
              />
            </svg>

            <span className="absolute inset-0 flex items-center justify-center pt-16 text-2xl font-bold text-white">
              {successPercentage}%
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full bg-[#FFF6EC] border border-gray-300 px-6 md:px-16 py-10 md:w-1/2 md:flex md:justify-center md:items-center">
          <div className="space-y-10">
            <div>
              <Input
                type="text"
                placeholder="Enter your address or MLS#"
                className="rounded-lg border border-gray-200 bg-[#F3EAE1] px-4 py-4 text-gray-700"
              />

              <div className="flex items-center justify-end text-xs pt-3">
                <span className="font-medium text-black">MSRP:</span>
                <span className="ml-1 font-bold text-black">$250,596</span>
                <Info className="ml-1 h-4 w-4 text-orange-500" />
              </div>
            </div>

            <div className="flex items-center bg-[#F3EAE1] rounded-lg px-4 py-3 gap-3">
              <Input
                type="text"
                placeholder="What is your price?"
                className="bg-transparent border-none text-gray-700 flex-1 min-w-0"
              />

              <a
                href="https://snapaudit.snaphomz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white rounded-full px-6 py-2 hover:bg-gray-800 shrink-0 whitespace-nowrap inline-block text-center"
              >
                Check Strength
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { OfferStrengthAnalyzer };