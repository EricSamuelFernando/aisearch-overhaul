import React from 'react';
// Assuming 'Image' is available (e.g., imported from 'next/image' or a similar component)

interface HomeHighlightsProps {
  highlights: string[]; // e.g., ["VAULTED CEILINGS", "NEARBY PARKS"]
  description: string;
  stats: {
    daysOnMarket: string; // e.g., "3 days"
    views: string; // e.g., "721"
    saves: string; // e.g., "18"
    sellLikelihood: string; // e.g., "98%"
  };
  floorPlanSrc: string; // URL for floor plan image
  threeDHomeSrc: string; // URL for 3D home image
}

const defaultProps: HomeHighlightsProps = {
  highlights: ["VAULTED CEILINGS", "NEARBY PARKS", "RICH HARDWOOD FLOORS", "STAINLESS STEEL APPLIANCES"],
  description: "An enchanting tree-lined walkway leads to the front door. Enter to find a bright, open entryway. The light-filled primary suite awaits on this level of the home, complete with beautiful open beam ceilings, updated bath, walk-in closet/laundry and fireplace. The open stairwell ascends to the spacious living room featuring gorgeous cathedral ceilings and tons of natural light. The formal dining room and updated kitchen open to a spacious wrap-around deck shaded by majestic oak trees, perfect for entertaining or dining al fresco. This level also features two additional bedrooms and a full bath...",
  stats: {
    daysOnMarket: "3 days",
    views: "721",
    saves: "18",
    sellLikelihood: "98%",
  },
  // Use placeholder image sources
  floorPlanSrc: '/assets/images/floor-plans.png', // Replace with actual path
  threeDHomeSrc: '/assets/images/3d-home.png', // Replace with actual path
};



const HomeHighlights: React.FC<HomeHighlightsProps> = (props = defaultProps) => {
  const { highlights, description, stats, floorPlanSrc, threeDHomeSrc } = props;

  // The description is split into two paragraphs with a 'read more' break
  // const descParagraphs = description.split(". The open stairwell ascends to the spacious living room");
  // const firstParagraph = descParagraphs[0] + ".";
  // const secondParagraph = "The open stairwell ascends to the spacious living room" + descParagraphs.slice(1).join(". The open stairwell ascends to the spacious living room");

  // NOTE: The image shows a 'read more' link truncating the second paragraph.
  // For the exact UI match, we will replicate the visible text and the red 'read more' link.

  return (
    <div className="max-w-4xl py-10 px-4 sm:px-6 lg:px-8">

      {/* --- Title --- */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Home highlights
      </h2>

      {/* --- Highlight Tags --- */}
      <div className="flex flex-wrap gap-2 mb-8">
        {highlights.map((highlight, index) => (
          <span
            key={index}
            className="px-3 py-1 text-xs font-semibold tracking-wider text-gray-700 uppercase bg-gray-200 rounded"
          >
            {highlight}
          </span>
        ))}
      </div>

      {/* --- Description --- */}
      <div className="text-gray-700 leading-relaxed mb-6">
        <p className="mb-4">
          {description}
        </p>

        {/* <p>
          {secondParagraph.substring(0, 350)}
          <span className="text-red-600 font-semibold cursor-pointer ml-1 hover:text-red-700" style={{fontFamily:"Satoshi"}}>
            ...read more
          </span>
        </p> */}

      </div>

      {/* --- Stats --- */}
      <div className="flex items-center  space-x-7 gap-6 mb-10 text-sm text-gray-700" style={{ fontFamily: "Satoshi", fontSize: "18px" }}>
        <p style={{ fontFamily: "Satoshi" }}><span style={{ fontWeight: '700', fontFamily: "Satoshi" }}>{stats.daysOnMarket}</span> days on Snaphomz</p>
        <p style={{ fontFamily: "Satoshi" }}><span style={{ fontWeight: '700', fontFamily: "Satoshi" }}>{stats.views}</span> views</p>
        <p style={{ fontFamily: "Satoshi" }}><span style={{ fontWeight: '700', fontFamily: "Satoshi" }}>{stats.saves}</span> saves</p>
        <p style={{ fontFamily: "Satoshi" }}>Likely to sell faster than <span className="font-bold text-gray-900">{stats.sellLikelihood}</span> nearby</p>
      </div>

      {/* --- Floor Plan and 3D Home Images --- */}
      <div className="flex flex-col sm:flex-row gap-6" style={{ borderTop: "1px solid #DDDDDD", paddingTop: "50px" }}>

        {/* Floor Plan Card */}
        <div className="flex-1 min-w-0">
          <div className="aspect-w-4 aspect-h-3">
            <img src={floorPlanSrc} alt="Floor Plans" className="w-full h-full object-cover rounded-lg border border-gray-200" />
          </div>
          <p className="mt-2 text-md font-semibold text-gray-900">Floor plans</p>
        </div>

        {/* 3D Home Card */}
        <div className="flex-1 min-w-0">
          <div className="aspect-w-4 aspect-h-3">
            {/* Replace with your Image component/tag */}
            <img src={threeDHomeSrc} alt="3D Home Tour" className="w-full h-full object-cover rounded-lg border border-gray-200" />
          </div>
          <p className="mt-2 text-md font-semibold text-gray-900">3D home</p>
        </div>
      </div>
    </div>
  );
};

export default HomeHighlights;