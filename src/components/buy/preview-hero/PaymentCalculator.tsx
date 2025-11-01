// components/InterestRatePredictor.tsx
import React from 'react';

const ethnicData: any = [
    { label: "Asian", value: 47.2, color: "#FFA254" },
    { label: "Hispanic/Latino", value: 21.0, color: "#FFA785" },
    { label: "African American", value: 16.8, color: "#A39A28" },
    { label: "White", value: 11.2, color: "#F9F2D1" },
    { label: "Multiracial", value: 3.4, color: "#FFB395" },
    { label: "Native American", value: 0.3, color: "#6B3400" },
    { label: "Pacific Islander", value: 0.1, color: "#B2B2B2" },
];

interface EthnicEntry {
    label: string;
    value: number;
    color: string;
}

// Function to generate SVG path segments for the Donut Chart
function getDonutSegments(data: EthnicEntry[]) {
    let acc = 0;
    return data.map(({ value, color }: EthnicEntry, i: number) => {
        const startAngle = (acc / 100) * 2 * Math.PI;
        acc += value;
        const endAngle = (acc / 100) * 2 * Math.PI;
        
        const x1 = 50 + 40 * Math.sin(startAngle);
        const y1 = 50 - 40 * Math.cos(startAngle);
        const x2 = 50 + 40 * Math.sin(endAngle);
        const y2 = 50 - 40 * Math.cos(endAngle);
        
        const largeArc = value > 50 ? 1 : 0;
        const pathData = `
            M 50 50
            L ${x1} ${y1}
            A 40 40 0 ${largeArc} 1 ${x2} ${y2}
            Z
        `;
        return (
            <path
                key={i}
                d={pathData}
                fill={color}
                stroke="#fff"
                strokeWidth="0.5"
            />
        );
    });
}

const PaymentCalculator = () => {
    return (
        <div className="w-full px-4 sm:px-8 py-6 sm:py-10">
            <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">Payment Calculator</h1>
            
            {/* Main Container - Stacks on mobile, splits on desktop */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 rounded-2xl bg-[#F4F4F4] shadow-md p-4 sm:p-8">
                
                {/* ==================================================================== */}
                {/* Left Side: Chart, Value, and Legend (Flex-Col on Mobile) */}
                {/* ==================================================================== */}
                <div className="flex-1 flex flex-col items-center md:items-start justify-center md:justify-start">
                    
                    {/* Inner Container for Chart, Value, and Legend Group */}
                    <div className='flex flex-col w-full items-center md:items-start gap-6'>
                        
                        {/* CHART AND ESTIMATED VALUE BLOCK: STACKS ON XS, SIDE-BY-SIDE ON SM+ */}
                        <div className='flex flex-col sm:flex-row w-full justify-center md:justify-start gap-4 sm:gap-8 md:gap-16 items-center'>

                            {/* 1. Donut Chart Area - RESPONSIVE SIZING */}
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 flex-shrink-0"> 
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    {getDonutSegments(ethnicData)}
                                    <circle cx="50" cy="50" r="29" fill="white" /> 
                                </svg>
                            </div>
                            
                            {/* 2. Estimated Value - RESPONSIVE TEXT SIZE */}
                            {/* Force text alignment left, even when stacked */}
                            <div className='flex flex-col items-start justify-center text-left'>
                                <div className="mb-2">
                                    <span className="block text-gray-700 text-sm">Est. Monthly Payment</span>
                                    <span className="text-3xl sm:text-4xl font-extrabold">$3,834.79</span>
                                </div>
                            </div>
                        </div>

                        {/* LEGEND - FIX FOR MOBILE OVERFLOW */}
                        <div className="w-full flex justify-center md:justify-start">
                            {/* Used flex-wrap with tighter gaps (gap-x-4) instead of a fixed grid to allow natural wrapping without overflow */}
                            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-4 max-w-sm">
                                {ethnicData.map(({ label, value, color }: EthnicEntry) => (
                                    <div key={label} className="flex items-center space-x-2 flex-shrink-0">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                                            {label} ({value}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ==================================================================== */}
                {/* Right Side: Calculator Form */}
                {/* ==================================================================== */}
                {/* Form section remains w-full on mobile, constrained on desktop, now below the chart */}
                <div className="md:w-1/3 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-lg py-6 px-4 sm:py-8 sm:px-6 w-full md:max-w-sm md:mx-0 mt-6 md:mt-0">
                    <h2 className="text-lg font-semibold mb-2">Calculate payment today</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Find out what you can afford and get personalized insights on homes you may pre-qualify for.
                    </p>
                    <form className="grid grid-cols-2 gap-4">
                        
                        {/* Down Payment */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Down payment
                            <input
                                type="number"
                                defaultValue={94980}
                                className="mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        {/* Credit Score - Using a standard text input placeholder for simplicity */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Credit score
                            <input
                                type="number"
                                placeholder="300-850"
                                className="mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        {/* Loan Term */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Loan term (years)
                            <select className="mt-1 px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option>30</option>
                                <option>15</option>
                            </select>
                        </label>

                        {/* Interest Rate (Placeholder for required field) */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Interest Rate (%)
                            <input
                                type="number"
                                defaultValue={6.8}
                                step="0.1"
                                className="mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        {/* Submit Button (span full width) */}
                        <button
                            type="submit"
                            className="col-span-2 bg-black text-white py-3 rounded-xl mt-2 font-semibold hover:bg-gray-900 transition duration-150"
                        >
                            Calculate Payment
                        </button>
                    </form>
                    <span className="text-xs text-gray-400 mt-4 block text-center">
                        Powered by <span className="underline text-orange-700 font-medium">Snaphomsmortgage.com</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PaymentCalculator;
