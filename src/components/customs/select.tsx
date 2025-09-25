import React, { Fragment, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface ComboboxData {
  value: string;
  label: string;
}

interface NativeSelectProps
  extends Omit<
    React.InputHTMLAttributes<HTMLSelectElement>,
    'onChange' | 'size'
  > {
  data?: ComboboxData[];
  description?: React.ReactNode;
  descriptionProps?: Record<string, any>;
  disabled?: boolean;
  error?: React.ReactNode;
  errorProps?: Record<string, any>;
  inputContainer?: (children: any) => any;
  inputWrapperOrder?: ('input' | 'label' | 'description' | 'error')[];
  label?: React.ReactNode;
  labelProps?: Record<string, any>;
  leftSection?: React.ReactNode;
  leftSectionPointerEvents?: React.CSSProperties['pointerEvents'];
  leftSectionProps?: React.ComponentPropsWithoutRef<'div'>;
  leftSectionWidth?: React.CSSProperties['width'];
  required?: boolean;
  rightSection?: React.ReactNode;
  rightSectionPointerEvents?: React.CSSProperties['pointerEvents'];
  rightSectionProps?: React.ComponentPropsWithoutRef<'div'>;
  rightSectionWidth?: React.CSSProperties['width'];
  size?: 'sm' | 'md' | 'lg';
  withAsterisk?: boolean;
  withErrorStyles?: boolean;
  wrapperProps?: Record<string, any>;
  handleChange: (val: string) => void;
  parentClass?: string;
  defaultValue?: string;
}

const CustomNativeSelect: React.FC<NativeSelectProps> = ({
  data,
  description,
  descriptionProps,
  disabled = false,
  error,
  errorProps,
  inputContainer = (children) => <Fragment>{children}</Fragment>,
  inputWrapperOrder = ['label', 'description', 'input', 'error'],
  label,
  labelProps,
  leftSection,
  leftSectionPointerEvents = 'none',
  leftSectionProps,
  leftSectionWidth,
  required = false,
  rightSection,
  rightSectionPointerEvents = 'none',
  rightSectionProps,
  rightSectionWidth,
  size = 'sm',
  withAsterisk = false,
  withErrorStyles = true,
  wrapperProps,
  handleChange,
  className,
  placeholder,
  parentClass,
  value,
  defaultValue,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue ?? undefined,
  );
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue);
      handleChange(defaultValue);
    }
  }, [defaultValue]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    handleChange(value);
    setSelectedValue(value);
    setIsOpen(false);
  };

  return inputContainer(
    <div className={cn('w-full', parentClass)}>
      {inputWrapperOrder.map((section) => {
        switch (section) {
          case 'label':
            return label ? (
              <label
                key={section}
                className={cn(
                  'mb-1 block text-sm  text-gray-900',
                  labelProps?.className,
                )}
                {...labelProps}
              >
                {label}
                {required && !withAsterisk && (
                  <span className='text-red-500'>*</span>
                )}
              </label>
            ) : null;
          case 'description':
            return description ? (
              <div key={section} {...descriptionProps}>
                {description}
              </div>
            ) : null;
          case 'input':
            return (
              <div key={section} className='relative'>
                {leftSection && (
                  <div
                    className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2'
                    style={{
                      pointerEvents: leftSectionPointerEvents,
                      width: leftSectionWidth,
                    }}
                    {...leftSectionProps}
                  >
                    {leftSection}
                  </div>
                )}
                <div className='relative'>
                  <button
                    className={cn(
                      'w-full rounded-md border px-4 text-left',
                      size === 'sm'
                        ? 'h-8'
                        : size === 'md'
                          ? 'h-10'
                          : size === 'lg'
                            ? 'h-12'
                            : '',
                      withErrorStyles && error
                        ? 'border-red-500 text-red-500'
                        : 'border-gray-300',
                      disabled
                        ? 'cursor-not-allowed bg-gray-100'
                        : 'cursor-pointer bg-white',
                      className,
                    )}
                    onClick={toggleOpen}
                    disabled={disabled}
                    {...wrapperProps}
                  >
                    {selectedValue ? (
                      data?.find((option) => option.value === selectedValue)
                        ?.label
                    ) : (
                      <span className='text-gray-500'>
                        {placeholder ?? 'Select...'}
                      </span>
                    )}
                  </button>
                  <div className='pointer-events-none absolute  ml-4 inset-y-0 right-0 flex items-center pr-2'>
                    <ChevronDown className='h-4 w-4 text-gray-400' />
                  </div>
                  {isOpen && (
                    <div className='absolute z-10 mt-1 w-full min-w-[100px] rounded border border-gray-300 bg-white shadow'>
                      {data?.map((option) => (
                        <div
                          key={option.value}
                          className='w-full cursor-pointer px-4 py-2 hover:bg-gray-100'
                          onClick={() => handleSelect(option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {rightSection && (
                  <div
                    className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'
                    style={{
                      pointerEvents: rightSectionPointerEvents,
                      width: rightSectionWidth,
                    }}
                    {...rightSectionProps}
                  >
                    {rightSection}
                  </div>
                )}
              </div>
            );
          case 'error':
            return error ? (
              <div
                key={section}
                className='mt-1 text-xs italic text-red-500'
                {...errorProps}
              >
                {error}
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </div>,
  );
};

export default CustomNativeSelect;
