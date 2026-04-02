"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from '@/lib/utils';

/* ---------------- Chart Data ---------------- */

const chartData = [
  { rate: 7.3 },
  { rate: 7.35 },
  { rate: 7.25 },
  { rate: 7.4 },
  { rate: 7.3 },
  { rate: 7.35 },
  { rate: 7.2 },
  { rate: 7.15 },
  { rate: 7.0 },
  { rate: 6.95 },
  { rate: 7.05 },
  { rate: 6.9 },
  { rate: 6.95 },
  { rate: 6.85 },
  { rate: 6.9 },
  { rate: 6.8 },
  { rate: 6.85 },
  { rate: 6.75 },
  { rate: 6.8 },
  { rate: 6.7 },
  { rate: 6.75 },
  { rate: 6.65 },
  { rate: 6.7 },
  { rate: 6.6 },
  { rate: 6.65 },
  { rate: 6.55 },
  { rate: 6.6 },
  { rate: 6.5 },
  { rate: 6.45 },
  { rate: 6.4 },
  { rate: 6.35 },
  { rate: 6.3 },
];

/* ---------------- Main Section ---------------- */

export default function FindPerfectMortgage({
  headingClassName,
}: {
  headingClassName?: string;
}) {
  return (
    <section className="home-mortgage-section w-full h-auto md:h-full bg-[#FFF6EC] px-4 sm:px-10 lg:px-20 xl:px-24 2xl:px-28 flex flex-col justify-start md:justify-center py-4 sm:py-6 md:py-10">

      {/* Heading */}
      <div className="max-w-5xl mx-auto text-center mb-3 sm:mb-5">
        <h1 className={cn('text-3xl sm:text-4xl md:text-5xl font-medium text-[#2C1F18]', headingClassName)}>
          Find Your Perfect <span className="font-light">Mortgage</span>
        </h1>
        <p className="mt-2 text-xs sm:text-base text-[#6E645A] max-w-2xl mx-auto">
          Whether you&apos;re a first-time buyer or experienced homeowner, we have
          mortgage solutions tailored to your specific needs.
        </p>
      </div>

      {/* Content */}
      <div className="home-mortgage-container w-full max-w-6xl 2xl:max-w-[1450px] mx-auto flex flex-col lg:flex-row items-center gap-4 sm:gap-10 lg:gap-12 xl:gap-16">

        {/* LEFT CARD (CHART) */}
        <div className="w-full max-w-full lg:w-1/2 lg:max-w-[440px] xl:max-w-[500px] bg-[#F6E9D8] rounded-3xl p-4 sm:p-8 xl:p-10 2xl:p-12 scale-100 mt-1 sm:mt-4 lg:mt-0 min-h-[320px] sm:min-h-[410px] xl:min-h-[450px] flex flex-col justify-between">

          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg font-bold text-[#2C1F18] mb-1">
              Mortgage rates
            </h2>

            <p className="text-xs text-[#2C1F18] font-medium">
              The national average for 2-year mortgages was{" "}
              <span className="font-semibold">6.26%</span> as of Oct. 22.
            </p>
          </div>

          {/* Chart */}
          <div className="h-[150px] sm:h-[220px] xl:h-[250px] mb-5 sm:mb-8 w-full max-w-full xl:max-w-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 15,
                  left: 16,
                  bottom: 20
                }}
              >
                {/* Horizontal dotted grid lines */}
                <CartesianGrid
                  vertical={false}
                  stroke="#D0C4B0"
                  strokeDasharray="2 4"
                  strokeWidth={1}
                />

                <XAxis hide />

                <YAxis
                  domain={[5.5, 8.0]}
                  ticks={[5.5, 6.0, 6.5, 7.0, 7.5, 8.0]}
                  tick={{
                    fill: "#2C1F18",
                    fontSize: 11,
                    fontWeight: 600,
                    textAnchor: "end"
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  width={34}
                  tickMargin={4}
                />

                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#F07639"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CTA */}
          <a
            href="https://snapinterest.snaphomz.com/?utm_source=nav_bar"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-black text-white py-3 sm:py-4 rounded-full text-xs sm:text-sm font-semibold hover:opacity-90 transition block text-center"
          >
            Calculate Rate
          </a>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center items-center py-2 sm:min-h-[410px] xl:min-h-[450px]">
          <div className="w-[78vw] max-w-[320px] sm:w-[280px] md:w-[360px] lg:w-[400px] xl:w-[470px] 2xl:w-[520px]">
            <Image
              src="/assets/images/buyer-home_mortgage.png"
              alt="Mortgage illustration"
              width={500}
              height={600}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
