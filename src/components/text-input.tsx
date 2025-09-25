import React from 'react';

export interface TextInputProp
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  label?: string;
}

const CustomTextInput = ({
  error,
  errorMessage,
  label,
  name,
  type = 'text',
  ...props
}: TextInputProp) => {
  return (
    <div className='mb-4 w-full'>
      {label ? (
        <label className='mb-2 block font-medium text-gray-700' htmlFor={name}>
          {label}
        </label>
      ) : null}
      <input
        {...props}
        type={type}
        name={name}
        className={`${props.className} h-12 w-full appearance-none rounded-md border border-solid border-[#c4c4c4] px-3.5 leading-tight text-gray-700 placeholder:text-sm placeholder:text-[#acacac] focus:border-black focus:outline-none`}
      />
      {error && <p className='text-xs italic text-red-500'>{errorMessage}</p>}
    </div>
  );
};

export default CustomTextInput;
