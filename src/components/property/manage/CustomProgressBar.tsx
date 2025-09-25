import React from 'react';

interface ProgressBarProps {
  size?: number;
  progress?: number;
  trackWidth?: number;
  trackColor?: string;
  indicatorWidth?: number;
  indicatorColor?: string;
  indicatorCap?: 'butt' | 'round' | 'square';
  label?: React.ReactNode;
  labelColor?: string;
  spinnerMode?: boolean;
  spinnerSpeed?: number;
}

const CustomProgressBar: React.FC<ProgressBarProps> = (props) => {
  const {
    size = 150,
    progress = 0,
    trackWidth = 10,
    trackColor = '#ddd',
    indicatorWidth = 8,
    indicatorColor = '#07c',
    indicatorCap = 'round',
    label = 'Loading...',
    labelColor = '#333',
    spinnerMode = false,
    spinnerSpeed = 1,
  } = props;

  const center = size / 2;
  const radius = center - Math.max(trackWidth, indicatorWidth);
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray * ((100 - progress) / 100);

  let hideLabel = size < 60 || spinnerMode;

  return (
    <div className='svg-pi-wrapper' style={{ width: size, height: size }}>
      <svg className='svg-pi' style={{ width: size, height: size }}>
        <circle
          className='svg-pi-track'
          cx={center}
          cy={center}
          fill='transparent'
          r={radius}
          stroke={trackColor}
          strokeWidth={trackWidth}
        />
        <circle
          className={`svg-pi-indicator ${spinnerMode ? 'svg-pi-indicator--spinner' : ''}`}
          style={{ animationDuration: `${spinnerSpeed * 1000}ms` }}
          cx={center}
          cy={center}
          fill='transparent'
          r={radius}
          stroke={indicatorColor}
          strokeWidth={indicatorWidth}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap={indicatorCap}
        />
      </svg>

      {!hideLabel && (
        <div className='svg-pi-label' style={{ color: labelColor }}>
          {!spinnerMode ? (
            <span className='svg-pi-label__progress'>{label}</span>
          ) : (
            <span className='svg-pi-label__loading'>Loading...</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomProgressBar;
