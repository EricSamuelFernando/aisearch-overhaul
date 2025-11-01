// import React from 'react';
// import { ChevronDownIcon } from '@heroicons/react/24/solid';

// // --- Data Interfaces ---
// interface CollegeEntry {
//   rank: number;
//   name: string;
//   institutionId: string;
// }

// interface DiversityEntry {
//   label: string;
//   percentage: string; // e.g., "47.2%"
//   color: string; // Hex color code for exact match
// }

// interface TopCollegesProps {
//   schoolName?: string; // Optional, will use default
//   topColleges?: CollegeEntry[]; // Optional, will use default
//   diversityData?: DiversityEntry[]; // Optional, will use default
// }

// // --- Default Data (Pixel-matched from screenshot) ---
// const defaultTopColleges: CollegeEntry[] = [
//   { rank: 1, name: 'Yale University', institutionId: '94569.0' },
//   { rank: 2, name: 'University of Florida', institutionId: '94569.0' },
//   { rank: 3, name: 'University of Texas at Austin', institutionId: '94569.0' },
//   { rank: 4, name: 'Duke University', institutionId: '94569.0' },
// ];

// const defaultDiversityData: DiversityEntry[] = [
//   { label: 'African American', percentage: '16.8%', color: '#E97451' }, // Orange-brown
//   { label: 'Asian', percentage: '47.2%', color: '#E0643B' },          // Darker orange
//   { label: 'Hispanic/Latino', percentage: '21.0%', color: '#F8B179' }, // Light orange
//   { label: 'Multiracial', percentage: '3.4%', color: '#D3D3D3' },      // Light gray
//   { label: 'Native American', percentage: '0.3%', color: '#964B00' },   // Dark brown
//   { label: 'Pacific Islander', percentage: '0.1%', color: '#C4C4C4' }, // Medium gray
//   { label: 'White', percentage: '11.2%', color: '#E4CCAE' },           // Beige
// ];

// // --- Main Component ---
// const TopCollegesSection: React.FC<TopCollegesProps> = ({
//   schoolName = 'Richard J. Murphy School',
//   topColleges = defaultTopColleges,
//   diversityData = defaultDiversityData,
// }) => {
//   return (
//     <div className="bg-white p-8 md:p-10 max-w-6xl mx-auto">
      
//       {/* --- Header --- */}
    //   <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
    //     Top Colleges Attended by Graduates From{' '}
    //     <span className="text-orange-600">{schoolName}</span>
    //   </h2>

//       {/* --- Content Grid: Responsive Layout --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
//         {/* === Left Column: College List === */}
//         <div className="flex flex-col space-y-4">
//           {topColleges.map((college) => (
//             <div
//               key={college.rank}
//               className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 
//                 ${college.rank <= 2 ? 'bg-gray-100 shadow-sm' : 'bg-white'}`} 
//             >
//               <div className="flex flex-col">
//                 <p className="text-lg font-bold text-gray-900">{college.name}</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Institution ID: {college.institutionId}
//                 </p>
//               </div>
//               <div className="text-5xl font-extrabold text-gray-300 ml-4">
//                 #{college.rank}
//               </div>
//             </div>
//           ))}

//           {/* Show More Button */}
//           <button className="flex items-center mt-5 text-orange-600 font-medium hover:text-orange-700 w-max">
//             <ChevronDownIcon className="w-5 h-5 mr-1" aria-hidden="true" />
//             Show more
//           </button>
//         </div>

//         {/* === Right Column: Pie Chart and Legend === */}
//         <div className="flex flex-col items-center lg:items-start pt-4 lg:pt-0">
//           {/* Pie Chart Placeholder (Requires a charting library for actual functionality) */}
//           {/* Visual approximation: A ring with the primary color segment visible */}
//           <div className="relative w-64 h-64 mb-8">
//             {/* The outer ring */}
//             <div className="absolute inset-0 rounded-full border-[30px] border-orange-200"></div>
//             {/* The primary segment (47.2% Asian) */}
//             <div className="absolute inset-0 rounded-full border-[30px] border-orange-600 clip-pie-segment"></div>
//             {/* Inner circle to make it a donut chart */}
//             <div className="absolute inset-0 m-[30px] rounded-full bg-white"></div>
//           </div>
          
//           {/* Legend */}
//           <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm max-w-xs sm:max-w-md w-full">
//             {diversityData.map((item, index) => (
//               <div key={index} className="flex items-center space-x-2">
//                 <span
//                   className="w-3 h-3 rounded-full shrink-0"
//                   style={{ backgroundColor: item.color }}
//                 ></span>
//                 <span className="text-gray-900 font-medium">{item.label}</span>
//                 <span className="text-gray-600 ml-auto">({item.percentage})</span> {/* ml-auto pushes percentage to the right */}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* --- Footer Disclaimer --- */}
//       <p className="text-xs text-gray-500 mt-10 border-t border-gray-200 pt-4">
//         School ratings are provided by{' '}
//         <a href="https://snaphomecollege.org" className="text-orange-600 hover:underline">
//           Snaphomecollege.org
//         </a>
//         . This information should only be used as a reference. Proximity or boundaries shown here are not a guarantee of enrollment. Please reach out to schools directly to verify all information and enrollment eligibility.
//       </p>
//     </div>
//   );
// };

// export default TopCollegesSection;






import React from "react";
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Assuming you use Heroicons


const colleges :any  = [
  { name: "Yale University", id: "94569.0", rank: 1 },
  { name: "University of Florida", id: "94569.0", rank: 2 },
  { name: "University of Texas at Austin", id: "94569.0", rank: 3 },
  { name: "Duke University", id: "94569.0", rank: 4 },
];

const ethnicData :any = [
  { label: "Asian", value: 47.2, color: "#FFA254" },
  { label: "Hispanic/Latino", value: 21.0, color: "#FFA785" },
  { label: "African American", value: 16.8, color: "#A39A28" },
  { label: "White", value: 11.2, color: "#F9F2D1" },
  { label: "Multiracial", value: 3.4, color: "#FFB395" },
  { label: "Native American", value: 0.3, color: "#6B3400" },
  { label: "Pacific Islander", value: 0.1, color: "#B2B2B2" },
];

// Util to convert percent data to SVG path for donut
interface EthnicEntry {
  label: string;
  value: number;
  color: string;
}

function getDonutSegments(data: EthnicEntry[]) {
  let acc = 0;
  return data.map(({ value, color }: EthnicEntry, i: number) => {
    const startAngle = (acc / 100) * 2 * Math.PI;
    acc += value;
    const endAngle = (acc / 100) * 2 * Math.PI;
    const x1 = 50 + 40 * Math.cos(startAngle - Math.PI / 2);
    const y1 = 50 + 40 * Math.sin(startAngle - Math.PI / 2);
    const x2 = 50 + 40 * Math.cos(endAngle - Math.PI / 2);
    const y2 = 50 + 40 * Math.sin(endAngle - Math.PI / 2);
    const largeArc = value > 50 ? 1 : 0;
    const pathData = `
      M ${x1} ${y1}
      A 40 40 0 ${largeArc} 1 ${x2} ${y2}
      L 50 50
      Z
    `;
    return (
      <path
        key={i}
        d={pathData}
        fill={color}
        stroke="#fff"
        strokeWidth="1"
      />
    );
  });
}

const TopCollegesSection = () => (
  <section className="p-6 w-full mt-4">
     <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
        Top Colleges Attended by Graduates From{' '}
        <span className="text-orange-600">Richard J. Murphy School</span>
      </h2>
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex-1 w-full">
        <div className="space-y-4">
          {colleges.map((college:any, idx:any) => (
            <div
              key={college.rank}
              className="flex justify-between items-center bg-orange-50 p-4 rounded-lg"
            >
              <div>
                <div className="font-semibold">{college.name}</div>
                <div className="text-xs text-gray-500">Institution ID: {college.id}</div>
              </div>
              <div className="text-3xl text-gray-400 font-bold">#{college.rank}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-1/2 mt-10 md:mt-0">
        {/* Donut Chart */}
        <div className="relative w-56 h-56">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {getDonutSegments(ethnicData)}
            <circle cx="50" cy="50" r="29" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="sr-only">Ethnic Diversity Donut Chart</span>
          </div>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-6">
          {ethnicData.map(({ label, value, color }: EthnicEntry) => (
            <div key={label} className="flex items-center space-x-2">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-700 text-sm">{label} ({value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
     <button className="flex items-center mt-4 text-orange-600 font-medium hover:text-orange-700">
            <ChevronDownIcon className="w-5 h-5 mr-1" aria-hidden="true" />
            Show more
          </button>
    <p className="text-[11px] text-gray-400 mt-6">
      School ratings are provided by Snaponhscollege.org. This information should only be used as a reference. 
      Proximity or boundaries shown here are not a guarantee of enrollment. Please reach out to schools directly to verify all information and enrollment eligibility.
    </p>
  </section>
);

export default TopCollegesSection;