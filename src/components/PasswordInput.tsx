import React, { useState } from 'react';
import { TextInputProp } from './text-input';

interface Props extends TextInputProp {
  label?: string;
}

export const UserPasswordInput = ({ label, ...props }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='w-full'>
      {label ? (
        <label className='mb-2 block text-sm dark:text-white'>{label}</label>
      ) : null}
      <div className='relative'>
        <input
          {...props}
          id={props?.id ? props.id : 'hs-toggle-password'}
          type={showPassword ? 'text' : 'password'}
          autoComplete={props.autoComplete ?? 'new-password'}
          className='focus-visible:ring-border-0 block h-[72px] w-full rounded-lg border border-solid border-gray-200 pl-4 pr-12 py-2.5 text-[16px] leading-[32px] placeholder:text-[16px] placeholder:leading-[32px] focus:border-grey-210 focus:ring-grey-210 disabled:pointer-events-none disabled:opacity-50 dark:border-grey-210 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-grey-210'
          placeholder={props.placeholder ?? 'Enter password'}
        />
        <button
          onClick={() => setShowPassword((prev) => !prev)}
          type='button'
          className='absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full'
        >
          <svg
            className='size-3.5 flex-shrink-0 text-gray-400 dark:text-grey-210'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            {showPassword ? (
              // Eye open icon 
              <>
                <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'></path>
                <circle cx='12' cy='12' r='3'></circle>
              </>
            ) : (
              // Eye closed (off) icon
              <>
                <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24'></path>
                <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'></path>
                <path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'></path>
                <line x1='2' x2='22' y1='2' y2='22'></line>
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};
