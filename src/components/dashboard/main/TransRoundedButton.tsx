import { cn } from '@/lib/utils';
import React, { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

type ButtonProps = {
  className?: string;
  label: string | ReactElement;
  onClick?: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  children?: ReactNode;
  icon?: ReactElement;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const TransRoundedButton: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant,
  className,
  children,
  icon,
  loading,
  ...props
}) => {
  const getButtonClass = (variant: 'primary' | 'secondary' | 'danger') => {
    switch (variant) {
      case 'primary':
        return 'px-7 py-3 font-medium bg-white text-black rounded-full text-sm';
      case 'secondary':
        return 'px-7 py-3 font-medium bg-transparent text-white/[.34] border border-[rgba(255, 255, 255, 0.34)] rounded-full text-sm';
      case 'danger':
        return 'px-7 py-3 font-medium bg-transparent text-white border border-white rounded-full text-sm';
      default:
        return '';
    }
  };

  return (
    <button
      className={cn(getButtonClass(variant), className)}
      onClick={onClick}
      {...props}
    >
      {icon && <span className='mr-2 flex items-center'>{icon}</span>}

      {loading ? (
        <svg
          className='h-5 w-5 animate-spin text-white'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
          ></path>
        </svg>
      ) : (
        label
      )}
    </button>
  );
};

export { TransRoundedButton };
