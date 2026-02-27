import React from 'react';

const InterestRatePredictor = () => {
    return (
        <div className="w-full px-4 sm:px-8 py-6 sm:py-10"> {/* Adjusted padding for mobile */}
            <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">Interest rate predictor</h1>

            {/* Main Container - Stacks on mobile, splits on desktop */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 rounded-2xl bg-[#F4F4F4] shadow-md p-4 sm:p-8">

                <div className="flex-1 flex flex-col items-center md:items-start justify-between">

                    {/* Inner Container for Chart and Value Group - Centered on mobile */}
                    <div className='flex w-full justify-center md:justify-start gap-6 sm:gap-10 md:gap-16'>

                        {/* 1. Bar Chart Area */}
                        <div className="flex flex-col justify-end items-end">
                            {/* Bars Container - Uses relative heights for scaling */}
                            <div className='flex items-end gap-3 sm:gap-6 mb-4'>
                                {/* Bar 1: Final Rate (Taller) - SCALES RESPONSIVELY */}
                                <span className="w-10 sm:w-12 h-[150px] md:h-60 bg-green-200 rounded-xl block transition-all duration-300" />
                                {/* Bar 2: Base Rate (Shorter) - SCALES RESPONSIVELY */}
                                <span className="w-10 sm:w-12 h-[120px] md:h-48 bg-yellow-200 rounded-xl block transition-all duration-300" />
                            </div>

                            <button className="text-orange-700 mt-2 font-medium underline underline-offset-2 text-sm">
                                Advanced options
                            </button>
                        </div>


                        <div className='flex flex-col items-start justify-end pb-8 sm:pb-12 md:pb-16'> {/* Adjusted padding to visually align with bar height */}

                            {/* Estimated Value */}
                            <div className="text-left mb-6">
                                <span className="block text-gray-700 text-sm">Est.</span>
                                <span className="text-3xl sm:text-4xl font-extrabold my-1">$3,834.79</span>
                            </div>


                            <div className="flex flex-col items-start gap-1 text-xs sm:text-sm">
                                <span className="flex items-center gap-2">
                                    <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> {/* Better visibility */}
                                    Final rate today: <span className="font-medium">6.8%</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" /> {/* Better visibility */}
                                    Base rate today: 6.35% <span className="text-gray-400">(as of 2025-09-11)</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-1/3 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-lg py-6 px-4 sm:py-8 sm:px-6 w-full md:max-w-sm md:mx-0">
                    <h2 className="text-lg font-semibold mb-2">Calculate rate today</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        Find out what you can afford and get personalized insights on homes you may pre-qualify for.
                    </p>
                    <form className="grid grid-cols-2 gap-4">

                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Down payment
                            <input
                                type="number"
                                defaultValue={94980}
                                className="mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </label>

                        {/* Credit Score */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Credit score
                            <select className="mt-1 px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option>300-850</option>
                            </select>
                        </label>

                        {/* Loan Term */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Loan term
                            <select className="mt-1 px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option>4</option>
                            </select>
                        </label>

                        {/* Income Stability */}
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Income stability
                            <select className="mt-1 px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option>3</option>
                            </select>
                        </label>

                        {/* Submit Button (span full width) */}
                        <button
                            type="submit"
                            className="col-span-2 bg-black text-white py-3 rounded-xl mt-2 font-semibold hover:bg-gray-900 transition duration-150"
                        >
                            Calculate rate
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

export default InterestRatePredictor;