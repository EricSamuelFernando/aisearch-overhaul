'use client';

import { useState } from 'react';
import { Slider } from '../ui/slider';

const TimeWorth = () => {
  const [hours, setHours] = useState(5);
  const [hourlyRateInput, setHourlyRateInput] = useState('');

  const hourlyRate = Number(hourlyRateInput || 0);
  const hoursPerMonth = hours * 4;
  const valueOfTime = hoursPerMonth * hourlyRate;
  const subscriptionCost = 19;
  const totalRoi = valueOfTime - subscriptionCost;

  const formatCurrency = (value: number) =>
    `$${Math.max(0, Math.round(value)).toLocaleString()}`;

  return (
    <section className="bg-[#FFF6EC] pt-8 pb-6 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16 px-4 sm:px-6 lg:px-0">
      <div className="w-full lg:max-w-full mx-auto space-y-6 sm:space-y-12 lg:px-0">

        {/* Section Heading */}
        {/* <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center px-4 sm:px-6 lg:px-24">
          How Much is Your Time Worth to You?
        </h3> */}

        {/* ONE parent container */}
        <div className="grid grid-cols-1 md:grid-cols-2 border border-[#E2D6C8] lg:mx-0">

          {/* LEFT PANEL */}
          <div className="flex flex-col bg-black text-white p-8 sm:p-10">

            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-[#D4C8BD]">
                Snaphomz will save you this much
              </p>

              <h3 className="text-4xl sm:text-5xl font-semibold text-[#F07639] leading-none">
                {formatCurrency(totalRoi)}
              </h3>

              <p className="text-sm text-[#D4C8BD]">
                Or {hoursPerMonth} hours of your life
              </p>

              {/* CTA */}
              <button className="relative w-full px-8 py-8">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-[#F07639] to-[#1F7EA1] p-[2px]">
                  <span className="flex h-full w-full items-center justify-center rounded-md bg-black text-sm sm:text-base font-semibold text-[#F07639]">
                    Start your free trial
                  </span>
                </span>
              </button>

            </div>

            {/* Divider */}
            <div className="h-px w-full bg-[#796D61] my-8" />

            {/* Breakdown */}
            <div className="space-y-4 text-sm">
              {/* <p className="font-semibold">How did we get this number?</p> */}

              <div className="space-y-3 text-[#CCCCCC]">
                <div className="flex justify-between">
                  <span>Hours lost per month</span>
                  <span className="text-white font-medium">{hoursPerMonth} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Value of saving {hoursPerMonth} hours of your time</span>
                  <span className="text-white font-medium">{formatCurrency(valueOfTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost of Pro subscription per month</span>
                  <span className="text-white font-medium">{formatCurrency(subscriptionCost)}</span>
                </div>
              </div>

              <div className="h-px bg-[#796D61]" />

              <div className="flex justify-between font-semibold">
                <span>Total ROI per month</span>
                <span>{formatCurrency(totalRoi)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-8 bg-[#FFF6EC] p-8 sm:p-10">

            {/* Slider */}
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-[#555555] font-medium">
                Hours you spend per week drafting offers, disclosures, and manual calendaring work
              </p>

              <p className="text-2xl font-semibold">{hours} hours</p>

              <div>
                <Slider
                  value={[hours]}
                  onValueChange={(v) => setHours(v[0])}
                  max={20}
                  step={1}
                  className="w-full"
                  trackClassName="bg-black/70"
                  rangeClassName="bg-[#F07639]"
                  thumbClassName="border-[#F07639] bg-white"
                />

                <div className="flex justify-between text-xs font-medium text-[#757575] mt-2">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="space-y-3">
              <p className="text-sm sm:text-base text-[#555555] font-medium">
                How much 1 hour of your time is worth to you
              </p>

              <div className="flex items-center border border-[#909090] rounded-lg px-4 py-2">
                <span className="text-base text-black mr-2">$</span>
                <input
                  className="w-full bg-transparent outline-none text-base placeholder:text-black"
                  type="number"
                  min={0}
                  step={1}
                  value={hourlyRateInput}
                  onChange={(e) => setHourlyRateInput(e.target.value)}
                />
                <span className="text-sm text-[#9E9E9E] ml-2">/hr</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TimeWorth;
