import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// --- Data Structure for clarity ---
interface InteriorFeature {
  sectionTitle: string;
  items: string[];
}

interface FeatureSectionProps {
  bedroomsAndBathrooms: InteriorFeature;
  primaryBedroom: InteriorFeature;
  appliances: InteriorFeature;
  features: InteriorFeature;
}

// --- Static Data (Pixel-matched from screenshot) ---
const staticFeatures: FeatureSectionProps = {
  bedroomsAndBathrooms: {
    sectionTitle: 'Bedrooms & bathrooms',
    items: [
      'Bedrooms: 3',
      'Bathrooms: 2',
      'Full bathrooms: 2',
    ],
  },
  primaryBedroom: {
    sectionTitle: 'Primary bedroom',
    items: [
      'Features: Ceiling Fan(s), Dual Sinks, En Suite Bathroom, Hollywood Bath, Separate Shower, Walk-In Closet(s)',
      'Level: First',
      'Dimensions: 17 x 16',
    ],
  },
  appliances: {
    sectionTitle: 'Appliances',
    items: [
      'Included: Dishwasher, Disposal, Gas Range, Microwave, Range, Refrigerator, Some Commercial Grade, Vented Exhaust Fan',
      'Laundry: Gas Dryer Hookup, Laundry in Utility Room',
    ],
  },
  features: {
    sectionTitle: 'Features',
    items: [
      'Decorative/Designer Lighting Fixtures, Double Vanity, Eat-In Kitchen, High Speed Internet, Open Floorplan, Pantry, Walk-In Closet(s)',
      'Flooring: Tile, Wood',
      'Has basement: No',
      'Has fireplace: No',
    ],
  },
};

// --- Sub-Component for rendering the lists ---
interface FeatureListProps {
  title: string;
  items: string[];
  isAppliances?: boolean;
}

const FeatureList: React.FC<FeatureListProps> = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
    <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
      {items.map((item, index) => (
        <li key={index} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  </div>
);


// --- Main Component ---
const InteriorOffersSection: React.FC = () => {
  const { bedroomsAndBathrooms, primaryBedroom, appliances, features } = staticFeatures;
  
  return (
    <div className="max-w-4xl py-8">
      
      {/* --- Header --- */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        What this place offers
      </h2>

      {/* --- Interior Tab (Gray Bar) --- */}
      <div className="bg-gray-100 p-3 rounded-t-lg mb-6">
        <p className="font-semibold text-gray-900">Interior</p>
      </div>

      {/* --- Two-Column Content Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
        
        {/* === LEFT COLUMN === */}
        <div>
          {/* Bedrooms & bathrooms */}
          <FeatureList 
            title={bedroomsAndBathrooms.sectionTitle}
            items={bedroomsAndBathrooms.items}
          />
          
          {/* Primary bedroom */}
          <FeatureList 
            title={primaryBedroom.sectionTitle}
            items={primaryBedroom.items}
          />
        </div>
        
        {/* === RIGHT COLUMN === */}
        <div>
          {/* Appliances */}
          <FeatureList 
            title={appliances.sectionTitle}
            items={appliances.items}
          />
          
          {/* Features */}
          <FeatureList 
            title={features.sectionTitle}
            items={features.items}
          />
        </div>
      </div>

      {/* --- Show More Button --- */}
      <button className="flex items-center mt-3 text-orange-600 font-medium hover:text-orange-700">
        <ChevronDownIcon className="w-5 h-5 mr-1" aria-hidden="true" />
        Show more
      </button>

    </div>
  );
};

export default InteriorOffersSection;