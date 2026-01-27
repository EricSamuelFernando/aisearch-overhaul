'use client';

import React, { useState, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery } from '@mantine/hooks';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type TimeRange = '3M' | '6M' | 'All';
type RoomType = 'Average' | 'Studio' | '1BD' | '2BD' | '3BD' | '4BD' | '5BD';

interface ChartData {
  month: string;
  Average: number;
  Studio: number;
  '1BD': number;
  '2BD': number;
  '3BD': number;
  '4BD': number;
  '5BD': number;
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const timeRanges: Record<TimeRange, string[]> = {
  '3M': ['Jan', 'Mar', 'May'],
  '6M': ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
  All: [
    'Jan',
    'Mar',
    'May',
    'Jul',
    'Sep',
    'Nov',
    'Dec',
  ],
};

const roomTypes: RoomType[] = [
  'Average',
  'Studio',
  '1BD',
  '2BD',
  '3BD',
  '4BD',
  '5BD',
];

const generateChartData = (months: string[]): ChartData[] => {
  const specificAllTimeData: Record<string, { Average: number; '3BD': number }> = {
    Jan: { Average: 910, '3BD': 910 },
    Mar: { Average: 860, '3BD': 890 },
    May: { Average: 930, '3BD': 920 },
    Jul: { Average: 950, '3BD': 890 },
    Sep: { Average: 950, '3BD': 950 },
    Nov: { Average: 870, '3BD': 900 },
    Dec: { Average: 970, '3BD': 950 },
  };

  const specific3MData: Record<string, { Average: number; '3BD': number }> = {
    Jan: { Average: 910, '3BD': 910 },
    Mar: { Average: 860, '3BD': 890 },
    May: { Average: 930, '3BD': 920 },
  };

  const specific6MData: Record<string, { Average: number; '3BD': number }> = {
    Jan: { Average: 910, '3BD': 910 },
    Mar: { Average: 860, '3BD': 890 },
    May: { Average: 930, '3BD': 920 },
    Jul: { Average: 950, '3BD': 890 },
    Sep: { Average: 950, '3BD': 950 },
    Nov: { Average: 870, '3BD': 900 },
  };

  return months.map((month) => {
    if (months.length === 7 && specificAllTimeData[month]) {
      const monthData = specificAllTimeData[month];
      return {
        month,
        Average: monthData.Average,
        Studio: Math.floor(Math.random() * (1000 - 820) + 820),
        '1BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '2BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '3BD': monthData['3BD'],
        '4BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '5BD': Math.floor(Math.random() * (1000 - 820) + 820),
      };
    }
    
    if (months.length === 3 && specific3MData[month]) {
      const monthData = specific3MData[month];
      return {
        month,
        Average: monthData.Average,
        Studio: Math.floor(Math.random() * (1000 - 820) + 820),
        '1BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '2BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '3BD': monthData['3BD'],
        '4BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '5BD': Math.floor(Math.random() * (1000 - 820) + 820),
      };
    }
    
    if (months.length === 6 && specific6MData[month]) {
      const monthData = specific6MData[month];
      return {
        month,
        Average: monthData.Average,
        Studio: Math.floor(Math.random() * (1000 - 820) + 820),
        '1BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '2BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '3BD': monthData['3BD'],
        '4BD': Math.floor(Math.random() * (1000 - 820) + 820),
        '5BD': Math.floor(Math.random() * (1000 - 820) + 820),
      };
    }
    
    return {
      month,
      Average: Math.floor(Math.random() * (1000 - 820) + 820),
      Studio: Math.floor(Math.random() * (1000 - 820) + 820),
      '1BD': Math.floor(Math.random() * (1000 - 820) + 820),
      '2BD': Math.floor(Math.random() * (1000 - 820) + 820),
      '3BD': Math.floor(Math.random() * (1000 - 820) + 820),
      '4BD': Math.floor(Math.random() * (1000 - 820) + 820),
      '5BD': Math.floor(Math.random() * (1000 - 820) + 820),
    };
  });
};

const chartConfig: ChartConfig = {
  Average: { label: 'Average', color: '#F07639' },
  Studio: { label: 'Studio', color: '#B3B3B3' },
  '1BD': { label: '1 BD', color: '#B3B3B3' },
  '2BD': { label: '2 BD', color: '#B3B3B3' },
  '3BD': { label: '3 BD', color: '#000000' },
  '4BD': { label: '4 BD', color: '#B3B3B3' },
  '5BD': { label: '5 BD', color: '#B3B3B3' },
};

export function SellAnalytics(): React.ReactElement {
  const [timeRange, setTimeRange] = useState<TimeRange>('All');
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([
    'Average',
    '3BD',
  ]);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1199px)');

  const chartData = useMemo(
    () => generateChartData(timeRanges[timeRange]),
    [timeRange]
  );

  const chartMargins = useMemo(() => {
    if (isMobile) {
      return { top: 15, right: 8, left: 5, bottom: 15 };
    }
    if (isTablet) {
      return { top: 18, right: 15, left: 15, bottom: 18 };
    }
    return { top: 20, right: 20, left: 20, bottom: 20 };
  }, [isMobile, isTablet]);

  const toggleRoomSelection = (room: RoomType) => {
    setSelectedRooms((prev) =>
      prev.includes(room)
        ? prev.filter((r) => r !== room)
        : prev.length < 2
        ? [...prev, room]
        : [prev[1], room]
    );
  };

  return (
    <div className="w-full h-full">
      <Card className="h-full rounded-none bg-[#FDF6EE] border-0">
        <CardHeader className="pb-4 px-4 md:px-6 pt-6">
          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden flex flex-col w-full gap-4">
            <div className="flex gap-1 bg-[#2A1C14] rounded-lg p-1 items-center w-full">
              <button
                onClick={() => setTimeRange('All')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap flex-1 ${
                  timeRange === 'All'
                    ? 'bg-[#100C07] text-white'
                    : 'text-[#8B7D6B] bg-transparent hover:bg-[#4A3F35]'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('3M')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap flex-1 ${
                  timeRange === '3M'
                    ? 'bg-[#100C07] text-white'
                    : 'text-[#8B7D6B] bg-transparent hover:bg-[#4A3F35]'
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setTimeRange('6M')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap flex-1 ${
                  timeRange === '6M'
                    ? 'bg-[#100C07] text-white'
                    : 'text-[#8B7D6B] bg-transparent hover:bg-[#4A3F35]'
                }`}
              >
                6 Months
              </button>
            </div>
            <CardTitle className="text-lg font-semibold text-[#2A1C14] leading-tight">
              Historical Performance
            </CardTitle>
          </div>

          {/* Mobile/Tablet: Legend */}
          <div className="lg:hidden flex items-center gap-4 w-full mb-4">
            {selectedRooms.map((room) => (
              <div key={room} className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#2A1C14] whitespace-nowrap">
                  {chartConfig[room].label}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-row items-center justify-between relative">
            <CardTitle className="text-lg font-semibold text-[#2A1C14]">
              Historical Performance
            </CardTitle>
            <div className="flex gap-1 bg-[#2A1C14] rounded-[15px] p-1 items-center justify-center absolute right-0">
              <button
                onClick={() => setTimeRange('All')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  timeRange === 'All'
                    ? 'bg-[#100C07] text-white'
                    : 'text-[#8B7D6B] hover:bg-[#4A3F35]'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('3M')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  timeRange === '3M'
                    ? 'bg-[#100C07] text-white'
                    : 'text-[#8B7D6B] hover:bg-[#4A3F35]'
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setTimeRange('6M')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  timeRange === '6M'
                    ? 'bg-[#100C07] text-white'
                    : 'text-[#8B7D6B] hover:bg-[#4A3F35]'
                }`}
              >
                6 Months
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-full w-full py-4 px-4 md:px-6">
          {/* Desktop: Room-type legend buttons */}
          <div className="hidden lg:flex flex-wrap items-center gap-2 mb-6">
            {roomTypes.map((room) => (
              <Button
                key={room}
                variant="ghost"
                onClick={() => toggleRoomSelection(room)}
                className="flex items-center gap-2 px-2 py-1 hover:bg-[#F0E7E0]"
              >
                <span
                  className={`text-[14px] font-medium ${
                    selectedRooms.includes(room)
                      ? 'text-[#2A1C14]'
                      : 'text-[#B3A498]'
                  }`}
                >
                  {chartConfig[room].label}
                </span>
              </Button>
            ))}
          </div>

          {/* Chart */}
          <ChartContainer config={chartConfig} className="h-[280px] md:h-[350px] lg:h-[400px] w-full bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={chartMargins}
              >
                <CartesianGrid stroke="#E2D8CF" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={isMobile ? 6 : isTablet ? 7 : 8}
                  tick={{ fill: '#2A1C14', fontSize: isMobile ? 10 : isTablet ? 11 : 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={isMobile ? 6 : isTablet ? 7 : 8}
                  domain={[820, 1000]}
                  ticks={[820, 840, 880, 920, 960, 1000]}
                  tick={{ fill: '#2A1C14', fontSize: isMobile ? 10 : isTablet ? 11 : 12 }}
                  tickFormatter={(value) => `${value}`}
                  width={isMobile ? 50 : isTablet ? 55 : undefined}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {selectedRooms.map((room) => (
                  <Line
                    key={room}
                    type="monotone"
                    dataKey={room}
                    stroke={chartConfig[room].color}
                    strokeWidth={isMobile ? 2.5 : isTablet ? 2.8 : 3}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default SellAnalytics;