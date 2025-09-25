import React, { useState } from 'react';

interface RatingProps {
  color?: string;
  count?: number;
  defaultValue?: number;
  emptySymbol?: React.ReactNode | ((value: number) => React.ReactNode);
  fractions?: number;
  fullSymbol?: React.ReactNode | ((value: number) => React.ReactNode);
  getSymbolLabel?: (index: number) => string;
  highlightSelectedOnly?: boolean;
  name?: string;
  onChange?: (value: number) => void;
  onHover?: (value: number) => void;
  readOnly?: boolean;
  size?: number | string;
  value: number;
}

const CustomRating: React.FC<RatingProps> = ({
  color = 'gold',
  count = 5,
  defaultValue = 0,
  emptySymbol = '☆',
  fractions = 1,
  fullSymbol = '★',
  getSymbolLabel,
  highlightSelectedOnly = false,
  name,
  onChange,
  onHover,
  readOnly = false,
  size = 'sm',
  value,
}) => {
  const [rating, setRating] = useState(value || defaultValue);

  const handleRatingChange = (newValue: number) => {
    if (!readOnly && onChange) {
      setRating(newValue);
      onChange(newValue);
    }
  };

  const handleHover = (newValue: number) => {
    if (!readOnly && onHover) {
      onHover(newValue);
    }
  };

  const renderSymbol = (index: number) => {
    const symbolValue = index / fractions;
    const isFull = symbolValue <= rating;

    return (
      <span
        key={index}
        onMouseEnter={() => handleHover(symbolValue)}
        onClick={() => handleRatingChange(symbolValue)}
        aria-label={getSymbolLabel ? getSymbolLabel(index) : index.toString()}
        style={{ color }}
      >
        {isFull
          ? typeof fullSymbol === 'function'
            ? fullSymbol(symbolValue)
            : fullSymbol
          : typeof emptySymbol === 'function'
            ? emptySymbol(symbolValue)
            : emptySymbol}
      </span>
    );
  };

  return (
    <div>
      {[...Array(count * fractions)].map((_, index) => renderSymbol(index + 1))}
    </div>
  );
};

export default CustomRating;
