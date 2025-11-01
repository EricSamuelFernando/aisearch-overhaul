import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// --- Data Interfaces ---
interface PriceHistoryEntry {
  date: string;
  event: string;
  price: string;
}

interface TaxHistoryEntry {
  year: string;
  taxPaid: string;
  paidChange: string; // e.g., "+4.9%"
  taxAssessment: string;
  assessmentChange: string; // e.g., "+2%"
}

// --- Static Data (Pixel-matched from screenshot) ---
const staticPriceHistory: PriceHistoryEntry[] = [
  { date: '05/31/2024', event: 'Listed for sale', price: '$1,249,000 - $799 / sqft' },
  { date: '05/31/2024', event: 'Price change', price: '$1,249,000 - $799 / sqft' },
  { date: '05/31/2024', event: 'Listing removed', price: '$1,249,000 - $799 / sqft' },
];

const staticTaxHistory: TaxHistoryEntry[] = [
  { year: '2023', taxPaid: '$7,544', paidChange: '+4.9%', taxAssessment: '$606,370', assessmentChange: '+2%' },
  { year: '2022', taxPaid: '$7,544', paidChange: '+71.8%', taxAssessment: '$606,370', assessmentChange: '+2%' },
  { year: '2021', taxPaid: '$7,544', paidChange: '-0.9%', taxAssessment: '$606,370', assessmentChange: '+2%' },
];

interface HistoryTableProps {
  data: PriceHistoryEntry[] | TaxHistoryEntry[];
  type: 'price' | 'tax';
}

const HistoryTable: React.FC<HistoryTableProps> = ({ data, type }) => {
  const isPrice = type === 'price';
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      
      <div className={`grid ${isPrice ? 'grid-cols-3' : 'grid-cols-3'} text-sm font-semibold text-gray-700 bg-[#F4F4F4] py-3 px-4`}>
        <div className="col-span-1">{isPrice ? 'Date' : 'Year'}</div>
        <div className="col-span-1">{isPrice ? 'Event' : 'Tax paid'}</div>
        <div className="col-span-1">{isPrice ? 'Price' : 'Tax assessment'}</div>
      </div>

      {data.map((entry, index) => (
        <div 
          key={index} 
          className={`grid ${isPrice ? 'grid-cols-3' : 'grid-cols-3'} items-center text-sm py-3 px-4 border-t border-gray-100 last:border-b-0`}
        >
          <div className="col-span-1 text-gray-900">
            {isPrice ? (entry as PriceHistoryEntry).date : (entry as TaxHistoryEntry).year}
          </div>
          
          <div className="col-span-1 text-gray-900 flex flex-col sm:flex-row sm:items-center">
            {isPrice ? (entry as PriceHistoryEntry).event : (entry as TaxHistoryEntry).taxPaid}
            
            {!isPrice && (
              <span 
                className={`ml-2 text-xs font-medium ${
                  (entry as TaxHistoryEntry).paidChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(entry as TaxHistoryEntry).paidChange}
              </span>
            )}
          </div>
          
          <div className="col-span-1 text-gray-900 flex flex-col sm:flex-row sm:items-center">
            {isPrice ? (entry as PriceHistoryEntry).price : (entry as TaxHistoryEntry).taxAssessment}
            
            {!isPrice && (
              <span 
                className={`ml-2 text-xs font-medium ${
                  (entry as TaxHistoryEntry).assessmentChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(entry as TaxHistoryEntry).assessmentChange}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


// --- Main Component ---
const PropertyHistorySection: React.FC = () => {
  return (
    <div className="max-w-4xl  py-8 px-4 sm:px-6">
      
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Price history
      </h2>

      <HistoryTable data={staticPriceHistory} type="price" />

      <button className="flex items-center mt-4 mb-10 text-orange-600 font-medium hover:text-orange-700">
        <ChevronDownIcon className="w-5 h-5 mr-1" aria-hidden="true" />
        Show more
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Tax history
      </h2>

      <HistoryTable data={staticTaxHistory} type="tax" />

      <button className="flex items-center mt-4 text-orange-600 font-medium hover:text-orange-700">
        <ChevronDownIcon className="w-5 h-5 mr-1" aria-hidden="true" />
        Show more
      </button>

    </div>
  );
};

export default PropertyHistorySection;