

// 'use client';

// import { useState } from 'react';
// import { Info } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';

// // const OfferStrengthAnalyzer = () => {
// //   const [price, setPrice] = useState('$180,000');
// //   const successPercentage = 80; // 0–100

// //   const SVG_W = 200;  
// //   const SVG_H = 100;  
// //   const CX = 120;     
// //   const CY = 120;     
// //   const R  = 80;     
// //   const STROKE = 30;  

// //   // Clamp between 0 and 100, then map 0 → π, 100 → 0
// //   const perc = Math.max(0, Math.min(100, successPercentage)) / 100;
// //   const endAng = Math.PI * (1 - perc);

// //   // Starting point at 180° = (CX - R, CY)
// //   const startX = CX - R;
// //   const startY = CY;

// //   // Endpoint of the orange arc (at angle = endAng)
// //   const endX = CX + R * Math.cos(endAng);
// //   const endY = CY - R * Math.sin(endAng);

// //   // Rightmost bottom of the half‐circle = (CX + R, CY)
// //   const rightX = CX + R;
// //   const rightY = CY;

// //   const orangeArc = `
// //     M ${startX} ${startY}
// //     A ${R} ${R} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}
// //   `;
// //   const grayArc = `
// //     M ${endX.toFixed(2)} ${endY.toFixed(2)}
// //     A ${R} ${R} 0 0 1 ${rightX} ${rightY}
// //   `;

// //   return (
// //     <section id="offer-strength" className="bg-[#FDF1E8] py-16">
// //       <div className="mx-auto max-w-5xl px-6 text-center">
// //         <h2 className="text-3xl sm:text-4xl font-bold mb-2">
// //           Offer Strength Analyzer
// //         </h2>
// //         <p className="mt-3 text-lg text-gray-700">
// //           Gauge the strength of your bid by comparing your offer price against market data and potential competitor offers
// //         </p>
// //       </div>

// //       <div className="mt-12 mx-auto overflow-hidden md:flex">

// //         {/* Left side with the graph */}
// //         <div className="flex w-full items-center justify-center bg-[#191919] py-12 md:w-1/2">
// //           <div className="relative w-full h-64 md:h-80">
// //             <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">
// //               <defs>
// //                 <linearGradient
// //                   id="arcGradient"
// //                   x1="0%"
// //                   y1="100%"
// //                   x2="100%"
// //                   y2="0%"
// //                   gradientUnits="userSpaceOnUse"
// //                 >
// //                   <stop offset="0%" stopColor="#F97316" />  {/* deep orange */}
// //                   <stop offset="100%" stopColor="#FCD34D" /> {/* bright yellow */}
// //                 </linearGradient>
// //               </defs>

// //               {/* Orange Arc */}
// //               <path
// //                 d={orangeArc}
// //                 stroke="url(#arcGradient)"
// //                 strokeWidth={STROKE}
// //                 fill="none"
// //                 strokeLinecap="round"
// //               />

// //               <path
// //                 d={grayArc}
// //                 stroke="#FFF6EC"
// //                 strokeWidth={STROKE}
// //                 fill="none"
// //                 strokeLinecap="round"  
// //               />
// //             </svg>

// //             <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
// //               {successPercentage}%
// //             </span>
// //           </div>
// //         </div>

// //         <div className="w-full bg-[#FFF6EC] border border-gray-300 px-8 py-20 md:w-1/2">
// //           <div className="space-y-6">
// //             <div>
// //               <Input
// //                 type="text"
// //                 placeholder="Enter your address or MLS#"
// //                 className="
// //                   flex-grow
// //                   rounded-lg
// //                   border border-gray-200
// //                   bg-[#F3EAE1]
// //                   px-4 py-8
// //                   text-gray-700
// //                   placeholder-gray-400
// //                   focus:ring-2 focus:ring-indigo-200
// //                 "
// //               />

// //               <div className="flex items-center justify-end text-[12px] pt-4">
// //                 <span className="font-medium text-black">MSRP:</span>
// //                 <div className="flex items-center space-x-1">
// //                   <span className="font-bold text-black">$250,596</span>
// //                   <Info className="h-4 w-4 text-orange-500" />
// //                 </div>
// //               </div>
// //             </div>

// //             <div>
// //               <div className="flex items-center bg-[#F3EAE1] rounded-lg px-6 py-4">
// //                 <Input
// //                   type="text"
// //                   placeholder="What is your price?"
// //                   className="
// //                     flex-grow
// //                     bg-transparent
// //                     border-none
// //                     text-gray-700
// //                     placeholder-gray-500
// //                     focus:ring-0
// //                   "
// //                 />

// //                 <Button className="ml-4 bg-black text-white rounded-full px-6 py-2 hover:bg-gray-800">
// //                   Check Strength
// //                 </Button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };
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


import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function buildArcs({ w, h, cx, cy, r, stroke, percent }: {
  w: number; h: number; cx: number; cy: number; r: number; stroke: number; percent: number;
}) {
  const p = Math.max(0, Math.min(100, percent)) / 100;
  const endAng = Math.PI * (1 - p);
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r * Math.cos(endAng);
  const endY = cy - r * Math.sin(endAng);
  const rightX = cx + r;
  const rightY = cy;
  return {
    viewBox: `0 0 ${w} ${h}`,
    orangeArc: `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`,
    grayArc:   `M ${endX.toFixed(2)} ${endY.toFixed(2)} A ${r} ${r} 0 0 1 ${rightX} ${rightY}`,
    stroke
  };
}

const OfferStrengthAnalyzer = () => {
  const successPercentage = 80;

  // Desktop constants: unchanged
  const DESKTOP = buildArcs({ w: 80, h: 90, cx: 40, cy: 80, r: 50, stroke: 40, percent: successPercentage });

  // Mobile constants: only used on mobile
  const MOBILE  = buildArcs({ w: 200, h: 120, cx: 100, cy: 110, r: 80, stroke: 40, percent: successPercentage });

  return (
    <section id="offer-strength" className="bg-[#FDF1E8] pt-32">
      {/* ===== MOBILE HEADER (exact text) ===== */}
      <div className="mx-auto max-w-5xl px-6 text-center md:hidden">
        <h1 className="text-[34px] leading-[40px] font-medium tracking-tight">
          EasyOffer <span>Strength</span>
        </h1>
        <div className="mt-1 text-[28px] leading-[32px] italic text-black/90">Analyzer</div>
        <p className="mt-6 text-[14px] leading-6 text-[#8A7D73] max-w-[360px] mx-auto">
          Tailor your homebuying experience — your way, with the guidance you need.
        </p>
      </div>

      {/* ===== DESKTOP HEADER (unchanged) ===== */}
      <div className="mx-auto max-w-5xl px-6 text-center hidden md:block">
        <h2 className="text-3xl sm:text-4xl font-medium">Offer Strength Analyzer</h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-[600px] mx-auto">
          Gauge the strength of your bid by comparing your offer price <br className="hidden sm:block" />
          against market data and potential competitor offers
        </p>
      </div>

      {/* ===== MOBILE LAYOUT (same as before) ===== */}
      <div className="mt-8 md:hidden">
        <div className="mx-4 rounded-lg bg-[#170800] px-4 py-8 shadow-sm">
          <div className="relative w-full">
            <svg viewBox={MOBILE.viewBox} className="w-full h-[180px]">
              <defs>
                <linearGradient id="arcGradientMobile" x1="0%" y1="100%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
              </defs>
              <path d={MOBILE.orangeArc} stroke="url(#arcGradientMobile)" strokeWidth={MOBILE.stroke} fill="none" />
              <path d={MOBILE.grayArc}   stroke="#FFF6EC" strokeWidth={MOBILE.stroke} fill="none" />
            </svg>
            <span className="absolute inset-0 top-[92px] flex items-center justify-center text-2xl font-bold text-white">
              {successPercentage}%
            </span>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-xl border border-[#E9D9C8] bg-[#FFF6EC] p-4">
          <div className="relative">
            <div className="flex h-14 items-center rounded-xl border border-[#EADFD4] bg-[#F3EAE1] px-4">
              <Input
                type="text"
                placeholder="Enter your address or MLS#"
                className="h-full w-full border-0 bg-transparent p-0 text-[15px] placeholder:text-[#9C8E82] focus-visible:ring-0"
              />
            </div>
            <div className="mt-2 flex items-center justify-end text-[12px]">
              <span className="mr-1 text-black/70">MSRP:</span>
              <span className="font-semibold text-black">$250,596</span>
              <Info className="ml-1 h-4 w-4 text-orange-500" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#EADFD4] bg-[#F3EAE1] px-4 py-3">
            <Input
              type="text"
              placeholder="What is your price?"
              className="w-full border-0 bg-transparent p-0 text-[15px] placeholder:text-[#9C8E82] focus-visible:ring-0"
            />
            <Button className="ml-3 shrink-0 rounded-full bg-black px-4 py-2 text-xs hover:bg-black/90">
              Check Strength
            </Button>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (unchanged) ===== */}
      <div className="mt-16 mx-auto overflow-hidden md:flex hidden">
        <div className="flex w-full items-center justify-center bg-[#170800] py-12 md:w-1/2">
          <div className="relative w-full h-full md:h-60">
            <svg viewBox={DESKTOP.viewBox} className="w-full h-full">
              <defs>
                <linearGradient id="arcGradientDesktop" x1="0%" y1="100%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
              </defs>
              <path d={DESKTOP.orangeArc} stroke="url(#arcGradientDesktop)" strokeWidth={DESKTOP.stroke} fill="none" />
              <path d={DESKTOP.grayArc}   stroke="#FFF6EC" strokeWidth={DESKTOP.stroke} fill="none" />
            </svg>
            <span className="absolute inset-0 top-36 flex items-center justify-center text-2xl font-bold text-white">
              {successPercentage}%
            </span>
          </div>
        </div>

        <div className="w-full bg-[#FFF6EC] border border-gray-300 px-24 h-full py-16 h-96 md:w-1/2">
          <div className="space-y-14 flex flex-col justify-between">
            <div>
              <Input
                type="text"
                placeholder="Enter your address or MLS#"
                className="flex-grow rounded-lg border border-gray-200 bg-[#F3EAE1] px-4 py-10 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <div className="flex items-center justify-end text-[12px] pt-4">
                <span className="font-medium text-black">MSRP:</span>
                <div className="ml-1 flex items-center space-x-1">
                  <span className="font-bold text-black">$250,596</span>
                  <Info className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center bg-[#F3EAE1] rounded-lg px-6 py-6">
                <Input
                  type="text"
                  placeholder="What is your price?"
                  className="flex-grow bg-transparent border-none text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <Button className="ml-4 bg-black text-white rounded-full px-6 py-2 hover:bg-gray-800">
                  Check Strength
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { OfferStrengthAnalyzer };
