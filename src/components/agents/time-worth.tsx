'use client';

import { useState } from 'react';
import { Slider } from '../ui/slider';

const TimeWorth = () => {
  const [hours, setHours] = useState(5); 

  const handleSliderChange = (value: number[]) => {
    setHours(value[0]); 
  };

  return (
    <section className="flex flex-col items-center justify-center space-y-10 sm:space-y-20 px-6 sm:px-10 py-5">
      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
        How Much is Your Time Worth to You?
      </h3>

      {/* Grid Layout for larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 w-full">

        {/* First Section: Time Saving */}
        <div className="flex flex-col rounded-[20px] bg-black text-white font-medium p-6 sm:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center justify-center text-lg sm:text-xl">
              <p className="text-white">Snaphomz will save you this much</p>
              <h3 className="text-5xl sm:text-7xl text-[#F07639] leading-none sm:leading-[7rem]">
                $981
              </h3>
              <p className="text-lg sm:text-xl text-white">Or 20 hours of your life</p>
            </div>

            <button className="relative w-full border border-transparent px-8 py-4 sm:py-6">
              <span className="absolute inset-0 rounded-md bg-gradient-to-r from-[#F07639] to-[#1F7EA1] p-[2px]">
                <span className="flex h-full w-full items-center justify-center rounded-md bg-black text-lg sm:text-xl font-bold text-[#F07639]">
                  Start your free trial
                </span>
              </span>
            </button>
          </div>

          <div className="h-[2px] w-full bg-[#EEE3D8] my-6" />

          <div className="space-y-5">
            <p className="font-bold">How did we get this number?</p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[#CCCCCC]">Hours lost per month</p>
                <p className="font-bold">20 hours</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#CCCCCC]">Value of saving 20 hours of your time</p>
                <p className="font-bold">$1000</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#CCCCCC]">Cost of Pro subscription per month</p>
                <p className="font-bold">$19</p>
              </div>
            </div>

            <div className="h-[2px] w-full bg-[#EEE3D8]" />

            <div className="flex w-full justify-between font-bold mt-5">
              <p>Total ROI per month</p>
              <p className="font-bold">$981</p>
            </div>
          </div>
        </div>

        {/* Second Section: Time Spent and Value */}
        <div className="flex flex-col gap-6 rounded-[20px] bg-[#F7F2EB] p-6 sm:p-8 font-bold">
          <p className="text-xl sm:text-2xl text-[#555555]">
            Hours you spend per week drafting offers, disclosures, and manual calendaring work
          </p>

          <div className="space-y-3">
            <p className="text-3xl sm:text-4xl font-bold">{hours} hours</p>
            <div>
              <Slider
                value={[hours]} // Binding slider value to state
                onValueChange={handleSliderChange} // Handle slider change
                max={20}
                step={1}
                className="w-full"
                trackClassName="bg-black"
                rangeClassName="bg-[#F07639]"
                thumbClassName="border-[#F07639]"
              />

              <div className="flex items-center justify-between pt-2 text-lg font-bold text-[#757575]">
                <p>1</p>
                <p>20</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xl sm:text-2xl text-[#555555]">
              How much 1 hour of your time is worth to you
            </p>
            <div className="flex w-full items-center rounded-[10px] border border-[#909090] bg-transparent px-4 py-2 font-medium">
              <input
                className="w-full border-none bg-transparent text-lg sm:text-xl outline-none"
                placeholder="$"
              />{' '}
              <p className="flex w-fit items-end justify-end text-lg sm:text-2xl text-[#9E9E9E]">
                /hr
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TimeWorth;
