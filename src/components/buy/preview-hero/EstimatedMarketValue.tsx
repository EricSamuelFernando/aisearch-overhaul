import React from 'react';
// import Image from 'next/image'; // Uncomment if you need to use next/image later

// Define the interface for the data the component expects
interface EstimatedMarketData {
    houseValue: string;
    houseValueDescription: string;
    estimatedRent: string;
    rentChange: string; // e.g., "-$250"
    rentDescription: string;
    projectedGain: string; // e.g., "22.6%"
    projectedGainDescription: string;
}

// Define the component props type
interface EstimatedMarketValueProps {
    estimatedData?: EstimatedMarketData; // Make the data optional with a fallback
}

// Default data for demonstration or fallback
const defaultEstimatedData: EstimatedMarketData = {
    houseValue: "$450,460",
    houseValueDescription: "Overall readiness assessment",
    estimatedRent: "$3,700",
    rentChange: "-$250",
    rentDescription: "Valued in Rent and lost in Mortgage",
    projectedGain: "22.6%",
    projectedGainDescription: "Post-graduation enrolment rates",
};

const ViewButton = () => (
    <button className="flex items-center space-x-1 px-3 py-2 bg-white rounded-full shadow-md text-sm transition-shadow hover:shadow-lg">
        {/* Correct Green Up-Arrow Graph Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1222_158)">
                <path d="M16.2856 6H23.1428V12.8571" stroke="#077414" style={{ stroke: '#077414', color: 'rgb(6.8, 116, 19.5)', strokeOpacity: 1 }} strokeWidth="1.71429" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23.1429 6L13.4572 15.6857C13.297 15.8428 13.0815 15.9307 12.8572 15.9307C12.6328 15.9307 12.4174 15.8428 12.2572 15.6857L8.31432 11.7429C8.1541 11.5858 7.93868 11.4978 7.71432 11.4978C7.48996 11.4978 7.27455 11.5858 7.11432 11.7429L0.857178 18" stroke="#077414" style={{ stroke: '#077414', color: 'rgb(6.8, 116, 19.5)', strokeOpacity: 1 }} strokeWidth="1.71429" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_1222_158">
                    <rect width="24" height="24" fill="white" style={{ fill: 'white', fillOpacity: 1 }} />
                </clipPath>
            </defs>
        </svg>

        <span className="text-gray-900 font-semibold ml-4">View</span>
    </button>
);

const EstimatedMarketValue: React.FC<any> = ({ estimatedData }) => {
    const data = estimatedData || defaultEstimatedData;

    return (
        <div className="bg-white p-6 md:p-8">
            {/* --- Heading Section --- */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Estimated market value
            </h2>
            <p className="text-base text-gray-600 mb-6 md:mb-8">
                This is what this home is worth in the market
            </p>

            {/* --- Cards Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

                {/* Card 1: Estimated house value */}
                <div className="bg-[#F4F4F4] p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Estimated house value</p>
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                            {data.houseValue}
                        </p>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 text-sm">
                        <p>{data.houseValueDescription}</p>
                        <ViewButton />
                    </div>
                </div>

                {/* Card 2: Estimated Rent */}
                {/* <div className="bg-[#F4F4F4] p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Estimated Rent</p>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-2xl font-bold text-gray-900">
                                {data.estimatedRent}
                            </p>
                            <span className={`font-semibold text-lg ${data.rentChange.startsWith('-') ? 'text-orange-500' : 'text-green-500'}`}>
                                {data.rentChange}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 text-sm">
                        <p className="p-2">{data.rentDescription}</p>
                        <ViewButton />
                    </div>
                </div> */}
                 <div className="bg-[#F4F4F4] p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Estimated house value</p>
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                            {data.houseValue}
                        </p>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 text-sm">
                        <p>{data.houseValueDescription}</p>
                        <ViewButton />
                    </div>
                </div>

                {/* Card 3: Projected % Gain (5Y) */}
                <div className="bg-[#F4F4F4] p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Projected % Gain (5Y)</p>
                        <p className="text-2xl font-bold text-gray-900 mb-4">
                            {data.projectedGain}
                        </p>
                    </div>
                    {/* Note: This card does not have the 'View' button like the others in the image */}
                    <div className="text-gray-500 text-sm">
                        <p>{data.projectedGainDescription}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { EstimatedMarketValue };