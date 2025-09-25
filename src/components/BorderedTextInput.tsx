import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

type ITextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClass?: string;
  right?: ReactNode;
  left?: ReactNode;
  error?: string;
};

const BorderedTextInput: React.FC<ITextInputProps> = ({
  className,
  label,
  labelClassName,
  inputClassName,
  error,
  right,
  left,
  containerClass,
  ...props
}) => {
  return (
    <div className={cn('h-14 w-full', className)}>
      {label ? (
        <label
          className={cn(
            `mb-2 block text-sm font-normal text-[#848484]`,
            labelClassName,
          )}
        >
          {label}
        </label>
      ) : null}
      <div className={cn('flex h-full w-full items-center', containerClass)}>
        {left ? left : null}
        <input
          {...props}
          className={cn(
            'font-satoshi peer h-full w-full items-center rounded-md border border-[#D5D9DC] bg-transparent px-4 text-sm font-normal text-[#0B1D2E] outline-none transition-all placeholder-shown:border-[#D5D9DC] focus:border-[#FF8700] focus:bg-transparent active:bg-transparent disabled:border-0 disabled:bg-[#ACACAC]',
            inputClassName,
          )}
        />
        {right ? right : null}
      </div>
      {error ? <p className='my-1 text-xs text-red-600'>{error}</p> : null}
    </div>
  );
};

export { BorderedTextInput };
