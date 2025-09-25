import { cn } from '@/lib/utils';
import { BaseInputProps } from '@/interfaces/input.interface';

interface CustomTextInputProps extends BaseInputProps {}

export const CustomInput = ({
  description,
  descriptionProps,
  disabled,
  error,
  errorProps,
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
  withAsterisk = false,
  withErrorStyles = true,
  wrapperProps,
  className,
  rightClassName,
  labelClass,
  containerClass,
  ...rest
}: CustomTextInputProps) => {
  return (
    <div className={cn('mb-4 w-full', containerClass)}>
      {inputWrapperOrder.map((section) => {
        switch (section) {
          case 'label':
            return label ? (
              <label className={cn('', labelClass)} key={section}>
                {label}
                {required && !withAsterisk && (
                  <span className='text-red-500'>*</span>
                )}
              </label>
            ) : null;
          case 'description':
            return description ? (
              <div {...descriptionProps}>{description}</div>
            ) : null;
          case 'input':
            return (
              <div key={section} className='relative'>
                {leftSection && (
                  <div
                    {...leftSectionProps}
                    className={cn(
                      'absolute inset-y-0 left-0 flex items-center pl-4',
                      leftSectionProps?.className,
                    )}
                    style={{
                      width: leftSectionWidth,
                      pointerEvents: leftSectionPointerEvents,
                      ...leftSectionProps?.style,
                    }}
                  >
                    {leftSection}
                  </div>
                )}
                <input
                  disabled={disabled}
                  className={cn(
                    'h-12 w-full appearance-none rounded-md border border-solid border-[#c4c4c4] text-base leading-tight text-gray-700 placeholder:text-base  placeholder:text-[#acacac]  focus:border-black focus:outline-none',
                    !!leftSection ? 'pl-12' : 'pl-4',
                    !!rightSection ? 'pr-12' : 'pr-4',
                    className,
                  )}
                  {...rest}
                />
                {rightSection && (
                  <div
                    className={cn(
                      'absolute inset-y-0 right-0 flex items-center pr-3',
                      rightClassName,
                    )}
                    style={{
                      width: rightSectionWidth,
                      pointerEvents: rightSectionPointerEvents,
                    }}
                  >
                    {rightSection}
                  </div>
                )}
              </div>
            );
          case 'error':
            return error ? (
              <div className='text-xs italic text-red-500' {...errorProps}>
                {error}
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default CustomInput;
