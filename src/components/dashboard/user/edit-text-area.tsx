import { cn } from '@/lib/utils';
import React from 'react';

type ITextInputProps = React.InputHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  labelClassName?: string;
  inputClassName?: string;
  error?: string;
};

const EditTextArea: React.FC<ITextInputProps> = ({
  className,
  label,
  labelClassName,
  inputClassName,
  error,
  ...props
}) => {
  return (
    <div className={cn('relative h-14 w-full', className)}>
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
      <textarea
        {...props}
        className={cn(
          'font-satoshi peer h-full w-full resize-none appearance-none rounded-md border border-[#D5D9DC] bg-transparent px-4 py-2 text-sm font-normal text-[#0B1D2E] outline-none transition-all placeholder-shown:border-[#D5D9DC] focus:border-[#FF8700] disabled:border-0 disabled:bg-[#ACACAC]',
          inputClassName,
        )}
      />
      {error ? <p className='my-1 text-xs text-red-600'>{error}</p> : null}
    </div>
  );
};

export default EditTextArea;
