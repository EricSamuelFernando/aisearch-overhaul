import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RadioButtonProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  id: string;
  value: string;
  label: string;
  className?: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const CustomRadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ id, label, value, checked, onChange, className, ...rest }, ref) => {
    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
      onChange(e.currentTarget.value);
    };

    return (
      <div className='mb-4 flex items-center'>
        <input
          {...rest}
          type='radio'
          id={id}
          value={value}
          checked={checked}
          onChange={handleChange}
          ref={ref}
          className={cn('h-5 w-5 rounded-none text-indigo-600', className)}
        />
        <label htmlFor={id} className='ml-2 cursor-pointer text-gray-700'>
          {label}
        </label>
      </div>
    );
  },
);

CustomRadioButton.displayName = 'Radio Button';

export default CustomRadioButton;
