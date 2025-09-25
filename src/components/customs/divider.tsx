import React from 'react';
import { cn } from '../../lib/utils';

type DividerProps = {
  color?: string;
  label?: React.ReactNode;
  labelPosition?: 'center' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
  size?: number | string;
  className?: string;
};

const CustomDivider: React.FC<DividerProps> = ({
  color = 'gray',
  label,
  labelPosition = 'left',
  orientation = 'horizontal',
  className,
}) => {
  const orientationClass = orientation === 'horizontal' ? 'flex' : 'flex-col';
  const labelClass =
    labelPosition === 'center'
      ? 'justify-center'
      : labelPosition === 'right'
        ? 'justify-end'
        : 'justify-start';

  return (
    <div
      className={cn(
        `flex items-center space-x-4`,
        orientationClass,
        `{divide-${color}}`,
        labelClass,
        className,
      )}
    >
      {label && <span>{label}</span>}
      <div className={`flex-1 border-t border-${color}`}></div>
    </div>
  );
};

export default CustomDivider;
