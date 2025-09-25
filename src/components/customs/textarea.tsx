import React from 'react';
import { cn } from '@/lib/utils';

interface CustomTextAreaProps
  extends React.HTMLAttributes<HTMLTextAreaElement> {
  handleTextChange: (value: string) => void;
  description?: React.ReactNode;
  descriptionProps?: Record<string, any>;
  disabled?: boolean;
  error?: React.ReactNode;
  errorProps?: Record<string, any>;
  label?: React.ReactNode;
  labelProps?: Record<string, any>;
  required?: boolean;
  withAsterisk?: boolean;
  withErrorStyles?: boolean;
  wrapperProps?: Record<string, any>;
  className?: string;
  placeholder?: string;
  rows?: number;
  value?: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  onChange,
  description,
  descriptionProps,
  disabled = false,
  error,
  errorProps,
  label,
  labelProps,
  required = false,
  withAsterisk = false,
  withErrorStyles = true,
  wrapperProps,
  className,
  handleTextChange,
  placeholder,
  rows,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleTextChange(event.target.value);
  };

  return (
    <div {...wrapperProps}>
      {label && (
        <label {...labelProps} className='pb-4'>
          {label}
          {required && !withAsterisk && <span className='text-red-500'>*</span>}
        </label>
      )}
      {description && <div {...descriptionProps}>{description}</div>}
      <textarea
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'focus:border-1 w-full rounded border p-4 focus:border-black',
          withErrorStyles && error
            ? 'border-red-500 text-red-500'
            : 'border-gray-300',
          disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-text bg-white',
          'focus:outline-none',
          'focus:border-transparent',
        )}
        rows={rows}
        {...wrapperProps}
      />
      {error && <div {...errorProps}>{error}</div>}
    </div>
  );
};

export default CustomTextArea;
