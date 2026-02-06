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

export default function FindPerfectMortgage() {
  return (
    <section className="w-full h-full bg-[#FFF6EC] px-4 sm:px-10 lg:px-20 flex flex-col">

      {/* Heading */}
      <div className="max-w-5xl mx-auto text-center mb-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#2C1F18]">
          Find Your Perfect <span className="font-light">Mortgage</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#6E645A] max-w-2xl mx-auto">
          Whether you're a first-time buyer or experienced homeowner, we have
          mortgage solutions tailored to your specific needs.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16">

        {/* LEFT CARD (CHART) */}
        <div className="w-full lg:w-1/2 bg-[#F6E9D8] rounded-3xl p-8 sm:p-10 scale-[0.7] origin-top mt-8">

          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#2C1F18] mb-1">
              Mortgage rates
            </h2>

            <p className="text-xs text-[#2C1F18] font-medium">
              The national average for 2-year mortgages was{" "}
              <span className="font-semibold">6.26%</span> as of Oct. 22.
            </p>
          </div>

          {/* Chart */}
          <div className="h-[200px] sm:h-[220px] mb-10 max-w-md">
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
            href="https://snapinterest.snaphomz.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-black text-white py-4 rounded-full text-sm font-semibold hover:opacity-90 transition block text-center"
          >
            Calculate Rate
          </a>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] scale-[0.7] origin-center -mt-14">
            <Image
              src="/assets/images/buyer-home_mortgage.png"
              alt="Mortgage illustration"
              width={500}
              height={600}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}
