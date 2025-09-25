'use client';

const cleanPercentage = (percentage: number | string): number => {
  const parsedPercentage = +percentage;
  const isNegativeOrNaN =
    !Number.isFinite(parsedPercentage) || parsedPercentage < 0;
  const isTooHigh = parsedPercentage > 100;
  return isNegativeOrNaN ? 0 : isTooHigh ? 100 : parsedPercentage;
};

interface CircleProps {
  colour: string;
  percentage: number | string;
}

const Circle: React.FC<CircleProps> = ({ colour, percentage }) => {
  const r: number = 40;
  const circ: number = 2 * Math.PI * r;
  const parsedPercentage: number = cleanPercentage(+percentage);
  const strokePct: number = ((100 - parsedPercentage) * circ) / 100;

  return (
    <circle
      r={r}
      cx={100}
      cy={100}
      fill='transparent'
      stroke={strokePct !== circ ? colour : ''}
      strokeWidth={'0.5rem'}
      strokeDasharray={circ}
      strokeDashoffset={parsedPercentage ? strokePct : 0}
    ></circle>
  );
};

interface TextProps {
  percentage: number;
}

interface PieProps {
  percentage: number | string;
  colour: string;
}

const Wordings: React.FC<TextProps> = ({ percentage }) => {
  return (
    <text
      x='50%'
      y='50%'
      dominantBaseline='central'
      textAnchor='middle'
      fontSize={'1em'}
    >
      {percentage.toFixed(0)}%
    </text>
  );
};

export const ProgressCircle: React.FC<PieProps> = ({ percentage, colour }) => {
  const pct: number = cleanPercentage(percentage);

  return (
    <svg width={200} height={200}>
      <g transform={`rotate(-90 ${'100 100'})`}>
        <Circle colour='red' percentage={pct} />
        <Circle colour={colour} percentage={pct} />
      </g>
      <Wordings percentage={pct} />
    </svg>
  );
};
