import { Icons } from '@/components/icons';
import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';
import Image from 'next/image';

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
  label?: string | ReactNode;
  onMouseOver?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  loadingIcon?: string;
  btnIcon?: string;
  variant?: string;
  btnLeftIcon?: string;
  btnRightIcon?: string;
  textClass?: string;
}
const CustomButton: React.FC<ButtonProps> = ({
  type,
  label,
  onClick,
  onMouseOver,
  disabled,
  loading,
  className,
  btnLeftIcon,
  btnRightIcon,
  textClass,
}) => {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      onMouseOver={onMouseOver}
      disabled={loading || disabled}
      className={cn(
        'relative w-full rounded px-6 py-3 transition-all duration-500 ease-linear hover:opacity-90',
        className,
      )}
      style={{
        cursor: loading || disabled ? 'not-allowed' : '',
        opacity: loading || disabled ? '.68' : '1',
        backgroundColor: loading || disabled ? '#363641' : '',
      }}
    >
      {loading ? (
        <div className='flex justify-center align-middle'>
          <Icons.Loader />
        </div>
      ) : (
        <div className='flex items-center justify-center'>
          {btnLeftIcon && (
            <div className='mr-2 md:mr-4'>
              <Image src={btnLeftIcon} width={20} height={20} alt='icon' />
            </div>
          )}
          <div
            className={`md:w-fit ${
              btnLeftIcon !== '' || btnRightIcon !== '' ? 'w-full' : null
            } `}
          >
            <p
              className={cn(
                'whitespace-nowrap text-center text-sm md:text-base',
                textClass,
              )}
            >
              {label}
            </p>
          </div>
          {btnRightIcon && (
            <div className='ml-2'>
              <Image src={btnRightIcon} width={20} height={20} alt='icon' />
            </div>
          )}
        </div>
      )}
    </button>
  );
};

export default CustomButton;
