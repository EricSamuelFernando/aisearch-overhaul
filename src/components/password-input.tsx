'use client';

import React, { useState } from 'react';
import { TextInputProp } from './text-input';
import { EyeIcon, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props extends TextInputProp {
  showPassword?: boolean;
  containerClass?: string;
}

const PasswordInput = ({
  error,
  errorMessage,
  label,
  name,
  className,
  containerClass,
  ...props
}: Omit<Props, 'type'>) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={cn('relative mb-4 w-full', containerClass)}>
      {label ? (
        <label className='mb-2 block font-medium text-gray-700' htmlFor={name}>
          {label}
        </label>
      ) : null}
      <div className={cn('relative', className)}>
        <input
          {...props}
          name={name}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'h-full w-full appearance-none rounded-md border border-solid border-[#c4c4c4] pl-8 leading-tight text-gray-700 placeholder:text-2xl placeholder:text-[#acacac] focus:border-black focus:outline-none',
          )}
        />
        <button
          type='button'
          className='absolute right-4 top-[40%] cursor-pointer text-sm focus:outline-none'
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className='text-xs italic text-red-500'>{errorMessage}</p>}
    </div>
  );
};

export default PasswordInput;
