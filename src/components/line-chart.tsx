'use client';

import React, { useEffect, useRef, useState } from 'react';
import type {
  ChartArea,
  ChartData,
  ChartOptions,
  ChartDataset,
} from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController,
} from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController,
);
//TODO move this to another file
const colors = [
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
  'teal',
  'blue',
  'purple',
];

interface LineChartProps {
  labels: string[];
  datasets: ChartDataset<'line'>[];
  options?: ChartOptions<'line'>;
  boderColor?: string;
}

//TODO move this to another file
function createGradient(
  ctx: CanvasRenderingContext2D,
  area: ChartArea,
): CanvasGradient {
  const colorStart = faker.helpers.arrayElement(colors);
  const colorMid = faker.helpers.arrayElement(
    colors.filter((color) => color !== colorStart),
  );
  const colorEnd = faker.helpers.arrayElement(
    colors.filter((color) => color !== colorStart && color !== colorMid),
  );

  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(0.5, colorMid);
  gradient.addColorStop(1, colorEnd);

  return gradient;
}

const LineChart: React.FC<LineChartProps> = ({
  labels,
  datasets,
  options,
  boderColor,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels,
    datasets: [],
  });

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    const updatedDatasets = datasets?.map((dataset) => ({
      ...dataset,
      borderColor: boderColor
        ? boderColor
        : createGradient(chart.ctx, chart.chartArea),
      tension: 0.1,
    }));

    setChartData({
      labels,
      datasets: updatedDatasets,
    });
  }, [labels, datasets, boderColor]);

  return (
    <Chart ref={chartRef} type='line' data={chartData} options={options} />
  );
};

export { LineChart };
