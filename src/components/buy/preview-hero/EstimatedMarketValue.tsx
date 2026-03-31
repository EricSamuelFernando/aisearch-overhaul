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
    estimatedData?: Partial<EstimatedMarketData>; // Allow partial overrides
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

const EstimatedMarketValue: React.FC<any> = ({ estimatedData }) => {
    const data = { ...defaultEstimatedData, ...(estimatedData || {}) };

    return (
        <div className="bg-white p-2 md:p-2 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Estimated market value
            </h2>
            <p className="text-base text-gray-600 mb-6 md:mb-8">
                This is what this home is worth in the market
            </p>

            <div
                className="w-full overflow-x-auto pr-4 md:pr-0
    md:w-full md:overflow-x-visible
    flex md:grid
    flex-nowrap md:flex-wrap
    md:grid-cols-3
    gap-3 md:gap-6 items-stretch
    scrollbar-hide
    snap-x snap-mandatory md:snap-none"
            >

                {/* Card 1: Estimated house value */}
                <div className="bg-[#F4F4F4] p-4 md:p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-full 
                min-w-[74%] sm:min-w-[350px] md:min-w-0 md:w-auto 
                snap-start md:col-span-1">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Estimated house value</p>
                        <p className="text-[1.85rem] md:text-2xl font-bold text-gray-900 mb-4 leading-none">
                            {data.houseValue}
                        </p>
                    </div>
                </div>

                {/* Card 2: Estimated Rent */}
                <div className="bg-[#F4F4F4] p-4 md:p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-full 
                min-w-[74%] sm:min-w-[350px] md:min-w-0 md:w-auto 
                snap-start md:col-span-1">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Estimated Rent</p>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[1.85rem] md:text-2xl font-bold text-gray-900 leading-none">
                                {data.estimatedRent}
                            </p>
                            <span
                                className={`font-semibold text-lg ${data.rentChange?.startsWith('+')
                                    ? 'text-green-500'
                                    : data.rentChange?.startsWith('-')
                                        ? 'text-red-500'
                                        : 'text-gray-400'
                                    }`}
                            >
                                {data.rentChange}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Projected % Gain (5Y) */}
                <div className="bg-[#F4F4F4] p-4 md:p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-full 
                min-w-[74%] sm:min-w-[350px] md:min-w-0 md:w-auto 
                snap-start md:col-span-1">
                    <div>
                        <p className="text-gray-700 text-sm mb-1">Projected % Gain (5Y)</p>
                        <p className="text-[1.85rem] md:text-2xl font-bold text-gray-900 mb-4 leading-none">
                            {data.projectedGain}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export { EstimatedMarketValue };
