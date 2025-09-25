import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ChartArea,
  ChartDataset,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

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
}

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

const SellerLineChart: React.FC<LineChartProps> = ({
  labels,
  datasets,
  options,
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
      borderColor: 'black',
      tension: 0.4,
      borderWidth: 2,
    }));

    setChartData({
      labels,
      datasets: updatedDatasets,
    });
  }, [labels, datasets]);

  return <Line ref={chartRef} data={chartData} options={options} />;
};

export default SellerLineChart;
