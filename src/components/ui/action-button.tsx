import React from 'react';

type ButtonProps = {
  text: string;
  onClick?: () => void;
  isPrimary?: boolean;
  className?: string;
};

export const ActionButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  isPrimary = false,
  className = '',
}) => (
  <button
    className={`h-[3.860rem] w-[16.5rem] items-center justify-center rounded-full border-[0.188rem] text-[1.4rem] font-medium ${
      isPrimary ? 'bg-black text-white' : 'border-black text-black'
    } ${className}`}
    onClick={onClick}
  >
    {text}
  </button>
);
