// 'use client';

// import React, { useState, useMemo } from 'react';
// import {
//   CartesianGrid,
//   Line,
//   LineChart,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts';

// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Button } from '@/components/ui/button';
// import { Circle } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from '@/components/ui/chart';

// type TimeRange = '3M' | '6M' | 'All';
// type RoomType = 'Average' | 'Studio' | '1BD' | '2BD' | '3BD' | '4BD' | '5BD';

// interface ChartData {
//   month: string;
//   Average: number;
//   Studio: number;
//   '1BD': number;
//   '2BD': number;
//   '3BD': number;
//   '4BD': number;
//   '5BD': number;
// }

// interface ChartConfig {
//   [key: string]: {
//     label: string;
//     color: string;
//   };
// }

// const timeRanges: Record<TimeRange, string[]> = {
//   '3M': ['Jan', 'Feb', 'Mar'],
//   '6M': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//   All: [
//     'Jan',
//     'Feb',
//     'Mar',
//     'Apr',
//     'May',
//     'Jun',
//     'Jul',
//     'Aug',
//     'Sep',
//     'Oct',
//     'Nov',
//     'Dec',
//   ],
// };

// const roomTypes: RoomType[] = [
//   'Average',
//   'Studio',
//   '1BD',
//   '2BD',
//   '3BD',
//   '4BD',
//   '5BD',
// ];

// const generateChartData = (months: string[]): ChartData[] => {
//   return months.map((month) => ({
//     month,
//     Average: Math.floor(Math.random() * (1000 - 820) + 820),
//     Studio: Math.floor(Math.random() * (1000 - 820) + 820),
//     '1BD': Math.floor(Math.random() * (1000 - 820) + 820),
//     '2BD': Math.floor(Math.random() * (1000 - 820) + 820),
//     '3BD': Math.floor(Math.random() * (1000 - 820) + 820),
//     '4BD': Math.floor(Math.random() * (1000 - 820) + 820),
//     '5BD': Math.floor(Math.random() * (1000 - 820) + 820),
//   }));
// };

// const chartConfig: ChartConfig = {
//   Average: { label: 'Average', color: '#F07639' },
//   Studio: { label: 'Studio', color: '#000000' },
//   '1BD': { label: '1 Bedroom', color: '#000000' },
//   '2BD': { label: '2 Bedrooms', color: '#000000' },
//   '3BD': { label: '3 Bedrooms', color: '#000000' },
//   '4BD': { label: '4 Bedrooms', color: '#000000' },
//   '5BD': { label: '5 Bedrooms', color: '#000000' },
// };

// export function SellAnalytics(): React.ReactElement {
//   const [timeRange, setTimeRange] = useState<TimeRange>('3M');
//   const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([
//     'Average',
//     '2BD',
//   ]);

//   const chartData = useMemo(
//     () => generateChartData(timeRanges[timeRange]),
//     [timeRange],
//   );

//   const toggleRoomSelection = (room: RoomType) => {
//     setSelectedRooms((prev) =>
//       prev.includes(room)
//         ? prev.filter((r) => r !== room)
//         : prev.length < 2
//           ? [...prev, room]
//           : [prev[1], room],
//     );
//   };

//   return (
//     <Card className='h-full'>
//       <CardHeader className='flex flex-row items-center justify-between'>
//         <CardTitle>Historical Performance</CardTitle>
//         <Tabs
//           defaultValue='3M'
//           // @ts-ignore
//           onValueChange={(value: TimeRange) => setTimeRange(value)}
//         >
//           <TabsList>
//             <TabsTrigger value='All'>All Time</TabsTrigger>
//             <TabsTrigger value='3M'>3 Months</TabsTrigger>
//             <TabsTrigger value='6M'>6 Months</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </CardHeader>
//       <CardContent className='h-full w-full'>
//         <div className='mb-4 flex flex-wrap items-center justify-start gap-2 '>
//           {roomTypes.map((room) => (
//             <Button
//               key={room}
//               variant={'ghost'}
//               onClick={() => toggleRoomSelection(room)}
//               className='flex items-center gap-2'
//             >
//               {selectedRooms.includes(room) && (
//                 <Circle
//                   className='h-3 w-3 fill-current'
//                   style={{ color: chartConfig[room].color }}
//                 />
//               )}
//               {chartConfig[room].label}
//             </Button>
//           ))}
//         </div>
//         <ChartContainer config={chartConfig} className='h-[600px] w-full'>
//           <ResponsiveContainer width='100%' height='100%'>
//             <LineChart
//               data={chartData}
//               margin={{
//                 top: 20,
//                 right: 20,
//                 left: 20,
//                 bottom: 20,
//               }}
//             >
//               <CartesianGrid vertical={false} />
//               <XAxis
//                 dataKey='month'
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={8}
//               />
//               <YAxis
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={8}
//                 domain={[800, 1000]}
//                 ticks={[800, 840, 880, 920, 960, 1000]}
//               />
//               <ChartTooltip content={<ChartTooltipContent />} />
//               <Legend />
//               {selectedRooms.map((room) => (
//                 <Line
//                   key={room}
//                   type='monotone'
//                   dataKey={room}
//                   stroke={chartConfig[room].color}
//                   strokeWidth={3}
//                   dot={true}
//                 />
//               ))}
//             </LineChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }


'use client';

import React, { useState, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react';
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
  '3M': ['Jan', 'Feb', 'Mar'],
  '6M': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  All: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
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
  return months.map((month) => ({
    month,
    Average: Math.floor(Math.random() * (1000 - 820) + 820),
    Studio: Math.floor(Math.random() * (1000 - 820) + 820),
    '1BD': Math.floor(Math.random() * (1000 - 820) + 820),
    '2BD': Math.floor(Math.random() * (1000 - 820) + 820),
    '3BD': Math.floor(Math.random() * (1000 - 820) + 820),
    '4BD': Math.floor(Math.random() * (1000 - 820) + 820),
    '5BD': Math.floor(Math.random() * (1000 - 820) + 820),
  }));
};

const chartConfig: ChartConfig = {
  Average: { label: 'Average', color: '#F07639' },
  Studio: { label: 'Studio', color: '#B3B3B3' },
  '1BD': { label: '1BD', color: '#B3B3B3' },
  '2BD': { label: '2BD', color: '#000000' },
  '3BD': { label: '3BD', color: '#B3B3B3' },
  '4BD': { label: '4BD', color: '#B3B3B3' },
  '5BD': { label: '5BD', color: '#B3B3B3' },
};

export function SellAnalytics(): React.ReactElement {
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [selectedRooms, setSelectedRooms] = useState<RoomType[]>([
    'Average',
    '2BD',
  ]);

  const chartData = useMemo(
    () => generateChartData(timeRanges[timeRange]),
    [timeRange]
  );

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
    <Card className="h-full rounded-none bg-[#FDF6EE]">
      <CardHeader className="flex flex-row items-center justify-between  pb-4">
        <CardTitle className="text-lg font-semibold text-[#2A1C14]">
          Historical Performance
        </CardTitle>
        <Tabs
          defaultValue="3M"
          onValueChange={(value: string) => setTimeRange(value as TimeRange)}
        >
          <TabsList className="space-x-1 bg-[#2A1C14] rounded-full p-1">
            <TabsTrigger
              value="All"
              className="whitespace-nowrap rounded-full px-4 py-1 text-[14px] font-medium text-[#E1D4CB] data-[state=active]:bg-[#100C07] data-[state=active]:text-white"
            >
              All Time
            </TabsTrigger>
            <TabsTrigger
              value="3M"
              className="whitespace-nowrap rounded-full px-4 py-1 text-[14px] font-medium text-[#E1D4CB] data-[state=active]:bg-[#100C07] data-[state=active]:text-white"
            >
              3 Months
            </TabsTrigger>
            <TabsTrigger
              value="6M"
              className="whitespace-nowrap rounded-full px-4 py-1 text-[14px] font-medium text-[#E1D4CB] data-[state=active]:bg-[#100C07] data-[state=active]:text-white"
            >
              6 Months
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="h-full w-full py-2">
        {/* ——— Room-type “legend” buttons ——— */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {roomTypes.map((room) => (
            <Button
              key={room}
              variant="ghost"
              onClick={() => toggleRoomSelection(room)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-[#F0E7E0] data-[active]:bg-transparent data-[hovered]:bg-[#F0E7E0]"
            >
              {selectedRooms.includes(room) && (
                <Circle
                  className="h-3 w-3 fill-current"
                  style={{
                    color: chartConfig[room].color,
                  }}
                />
              )}
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

        {/* ——— Actual Recharts LineChart ——— */}
        <ChartContainer config={chartConfig} className="h-[400px] w-full bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid stroke="#E2D8CF" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#2A1C14', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[800, 1000]}
                ticks={[800, 840, 880, 920, 960, 1000]}
                tick={{ fill: '#2A1C14', fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: 8,
                  fontSize: 12,
                  color: '#2A1C14',
                }}
                payload={selectedRooms.map((room) => ({
                  id: room,
                  value: chartConfig[room].label,
                  type: 'circle',
                  color: chartConfig[room].color,
                }))}
              />
              {selectedRooms.map((room) => (
                <Line
                  key={room}
                  type="monotone"
                  dataKey={room}
                  stroke={chartConfig[room].color}
                  strokeWidth={3}
                  dot={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default SellAnalytics;
