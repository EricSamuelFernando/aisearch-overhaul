import React, { InputHTMLAttributes, useEffect, useState } from 'react';

export interface IPhoneNumberInputProps
  extends InputHTMLAttributes<HTMLInputElement> {}

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6)
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const PhoneNumberInput = (props: IPhoneNumberInputProps) => {
  const { onChange, value, ...rest } = props;
  const rawValue = value === undefined || value === null ? '' : String(value);
  const [displayValue, setDisplayValue] = useState(() =>
    formatPhoneNumber(rawValue),
  );

  useEffect(() => {
    setDisplayValue(formatPhoneNumber(rawValue));
  }, [rawValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = event.currentTarget.value.replace(/\D/g, '').slice(0, 10);
    setDisplayValue(formatPhoneNumber(rawDigits));
    event.currentTarget.value = rawDigits;
    event.target.value = rawDigits;
    onChange?.(event);
  };

  return (
    <div className='group flex w-full items-center'>
      <div
        className='dark:focus:ring-grey-700 z-10 inline-flex h-[72px] flex-shrink-0 appearance-none items-center rounded-l-md border-y border-l border-r-0 border-solid
        border-[#c4c4c4] bg-white px-3.5 py-2 text-center text-sm font-medium leading-tight text-gray-700 placeholder:text-sm placeholder:text-[#acacac] group-focus:border-black focus:outline-none dark:text-white'
      >
        <svg
          fill='none'
          aria-hidden='true'
          className='me-2 h-4 w-4'
          viewBox='0 0 20 15'
        >
          <rect width='19.6' height='14' y='.5' fill='#fff' rx='2' />
          <mask
            id='a'
            width='20'
            height='15'
            x='0'
            y='0'
            maskUnits='userSpaceOnUse'
          >
            <rect width='19.6' height='14' y='.5' fill='#fff' rx='2' />
          </mask>
          <g mask='url(#a)'>
            <path
              fill='#D02F44'
              fillRule='evenodd'
              d='M19.6.5H0v.933h19.6V.5zm0 1.867H0V3.3h19.6v-.933zM0 4.233h19.6v.934H0v-.934zM19.6 6.1H0v.933h19.6V6.1zM0 7.967h19.6V8.9H0v-.933zm19.6 1.866H0v.934h19.6v-.934zM0 11.7h19.6v.933H0V11.7zm19.6 1.867H0v.933h19.6v-.933z'
              clipRule='evenodd'
            />
            <path fill='#46467F' d='M0 .5h8.4v6.533H0z' />
            <g filter='url(#filter0_d_343_121520)'>
              <path
                fill='url(#paint0_linear_343_121520)'
                fillRule='evenodd'
                d='M1.867 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.866 0a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM7.467 1.9a.467.467 0 11-.934 0 .467.467 0 01.934 0zM2.333 3.3a.467.467 0 100-.933.467.467 0 000 .933zm2.334-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm1.4.467a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.934 0 .467.467 0 01.934 0zm-2.334.466a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.466a.467.467 0 11-.933 0 .467.467 0 01.933 0zM1.4 4.233a.467.467 0 100-.933.467.467 0 000 .933zm1.4.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zm1.4.467a.467.467 0 100-.934.467.467 0 000 .934zM6.533 4.7a.467.467 0 11-.933 0 .467.467 0 01.933 0zM7 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.933 0 .467.467 0 01.933 0zM3.267 6.1a.467.467 0 100-.933.467.467 0 000 .933zm-1.4-.467a.467.467 0 11-.934 0 .467.467 0 01.934 0z'
                clipRule='evenodd'
              />
            </g>
          </g>
          <defs>
            <linearGradient
              id='paint0_linear_343_121520'
              x1='.933'
              x2='.933'
              y1='1.433'
              y2='6.1'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='#fff' />
              <stop offset='1' stopColor='#F0F0F0' />
            </linearGradient>
            <filter
              id='filter0_d_343_121520'
              width='6.533'
              height='5.667'
              x='.933'
              y='1.433'
              colorInterpolationFilters='sRGB'
              filterUnits='userSpaceOnUse'
            >
              <feFlood floodOpacity='0' result='BackgroundImageFix' />
              <feColorMatrix
                in='SourceAlpha'
                result='hardAlpha'
                values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
              />
              <feOffset dy='1' />
              <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0' />
              <feBlend
                in2='BackgroundImageFix'
                result='effect1_dropShadow_343_121520'
              />
              <feBlend
                in='SourceGraphic'
                in2='effect1_dropShadow_343_121520'
                result='shape'
              />
            </filter>
          </defs>
        </svg>
        +1
      </div>

      {/* <label
          htmlFor='phone-input'
          className='mb-2 text-sm font-medium text-grey-900 sr-only dark:text-white'
        >
          Phone number:
        </label> */}
      <div className='relative w-full'>
        {/* TODO split numbers */}
        <input
          {...rest}
          type='tel'
          id='phone-input'
          className='h-[72px] w-full appearance-none rounded-r-md border-y border-r border-solid border-[#c4c4c4] px-3.5 leading-tight text-gray-700 placeholder:text-sm placeholder:text-[#acacac] group-focus:border-black  focus:outline-none'
          pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
          required
          inputMode='numeric'
          value={displayValue}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
