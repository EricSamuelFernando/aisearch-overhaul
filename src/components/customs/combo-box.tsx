import { Fragment, useState } from 'react';

import { cn } from '@/lib/utils';
import { AddressProperty } from '@/interfaces/address';
import { BaseInputProps } from '@/interfaces/input.interface';
interface CustomComboBoxProps extends BaseInputProps {
  isLoading: boolean;
  fetchOptions: () => void;
  handleClick?: (city:string) => void;
  suggestions?:any;
  handleListSelection: (option: AddressProperty) => void;
  optionsData: AddressProperty[];
  showLoading?: boolean;
}

const RobustComboBox: React.FC<CustomComboBoxProps> = ({
  description,
  descriptionProps,
  disabled,
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
  withAsterisk = false,
  withErrorStyles = true,
  wrapperProps,
  className,
  optionsData,
  isLoading,
  fetchOptions,
  onChange,
  handleListSelection,
  handleClick,
  suggestions,
  showLoading = false,
  ...rest
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("Value : ",event.target.value,locationSuggestions);
    onChange && onChange(event);
    fetchOptions();
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setShowDropdown(false);
  };

  return (
    <div {...wrapperProps} className='max-h-400px relative h-full w-full'>
      {inputWrapperOrder.map((section) => {
        switch (section) {
          case 'label':
            return label ? (
              <label {...labelProps} key={section}>
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
                    className='absolute inset-y-0 left-0 flex items-center pl-2'
                    style={{
                      width: leftSectionWidth,
                      pointerEvents: leftSectionPointerEvents,
                    }}
                  >
                    {leftSection}
                  </div>
                )}
                <input
                  disabled={disabled}
                  className={cn(
                    'h-[3rem] w-full appearance-none rounded-md border border-solid border-[#c4c4c4] px-3.5 leading-tight text-gray-700 placeholder:text-sm placeholder:text-[#acacac] focus:border-black focus:outline-none',
                    !!leftSection ? 'pl-[2.4rem]' : '',
                    !!rightSection ? 'pr-[2.4rem]' : '',
                    className,
                  )}
                  list='options-list'
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  {...rest}
                />
                {suggestions.length > 0 && (
                  <div className="mt-2 left-0 absolute w-full border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto bg-white z-10 text-left">
                    {suggestions.map((city:string, index:any) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleClick?.(city)
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
                {isLoading && (
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                    <svg
                      className='h-5 w-5 animate-spin text-black'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='#E8804C'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='#E8804C'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      ></path>
                    </svg>
                  </div>
                )}
                {showDropdown &&
                  !isLoading &&
                  optionsData &&
                  optionsData.length > 0 && (
                    <div className='absolute left-0 top-full z-10 mt-0 max-h-56 w-full overflow-auto rounded-b-md border-none bg-white p-2 shadow-md'>
                      {optionsData.map((option, index) => {
                        console.log('Property Options', option);
                        return (
                          <div
                            key={index}
                            className='h-max w-full cursor-pointer text-wrap p-2 text-left hover:bg-gray-100'
                            onMouseDown={() => {
                              handleListSelection(option);
                              handleInputBlur();
                            }}
                          >
                            {option.propertyAddressDetails?.formattedAddress}
                          </div>
                        );
                      })}
                    </div>
                  )}
                {rightSection && (
                  <div
                    {...rightSectionProps}
                    className='absolute inset-y-0 right-0 flex items-center pr-2'
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

export default RobustComboBox;

// import React, { Fragment } from 'react';
// import { cn } from '@/lib/utils';
// import { BaseInputProps } from '@/interfaces/input.interface';

// interface CustomComboBoxProps extends BaseInputProps {
//   isLoading: boolean;
//   fetchOptions: () => void;
//   handleListSelection: (option: any) => void;
//   optionsData: any[];
//   showLoading?: boolean;
//   inputRef?: React.RefObject<HTMLInputElement>; // Add this line
// }

// const RobustComboBox: React.FC<CustomComboBoxProps> = ({
//   description,
//   descriptionProps,
//   disabled,
//   error,
//   errorProps,
//   inputContainer = (children) => <Fragment>{children}</Fragment>,
//   inputWrapperOrder = ['label', 'description', 'input', 'error'],
//   label,
//   labelProps,
//   leftSection,
//   leftSectionPointerEvents = 'none',
//   leftSectionProps,
//   leftSectionWidth,
//   required = false,
//   rightSection,
//   rightSectionPointerEvents = 'none',
//   rightSectionProps,
//   rightSectionWidth,
//   withAsterisk = false,
//   withErrorStyles = true,
//   wrapperProps,
//   className,
//   optionsData,
//   isLoading,
//   fetchOptions,
//   onChange,
//   handleListSelection,
//   showLoading = false,
//   inputRef, // Add this line
//   ...rest
// }) => {
//   return (
//     <div {...wrapperProps} className='max-h-400px relative h-full w-full'>
//       {inputWrapperOrder.map((section) => {
//         switch (section) {
//           case 'label':
//             return label ? (
//               <label {...labelProps} key={section}>
//                 {label}
//                 {required && !withAsterisk && (
//                   <span className='text-red-500'>*</span>
//                 )}
//               </label>
//             ) : null;
//           case 'description':
//             return description ? (
//               <div {...descriptionProps}>{description}</div>
//             ) : null;
//           case 'input':
//             return (
//               <div key={section} className='relative'>
//                 {leftSection && (
//                   <div
//                     {...leftSectionProps}
//                     className='absolute inset-y-0 left-0 flex items-center pl-2'
//                     style={{
//                       width: leftSectionWidth,
//                       pointerEvents: leftSectionPointerEvents,
//                     }}
//                   >
//                     {leftSection}
//                   </div>
//                 )}
//                 <input
//                   ref={inputRef} // Add this line
//                   disabled={disabled}
//                   className={cn(
//                     'h-[3rem] w-full appearance-none rounded-md border border-solid border-[#c4c4c4] px-3.5 leading-tight text-gray-700 placeholder:text-sm placeholder:text-[#acacac] focus:border-black focus:outline-none',
//                     !!leftSection ? 'pl-[2.4rem]' : '',
//                     !!rightSection ? 'pr-[2.4rem]' : '',
//                     className,
//                   )}
//                   onChange={onChange}
//                   {...rest}
//                 />
//                 {isLoading && (
//                   <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
//                     <svg
//                       className='h-5 w-5 animate-spin text-black'
//                       xmlns='http://www.w3.org/2000/svg'
//                       fill='none'
//                       viewBox='0 0 24 24'
//                     >
//                       <circle
//                         className='opacity-25'
//                         cx='12'
//                         cy='12'
//                         r='10'
//                         stroke='#E8804C'
//                         strokeWidth='4'
//                       ></circle>
//                       <path
//                         className='opacity-75'
//                         fill='#E8804C'
//                         d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
//                       ></path>
//                     </svg>
//                   </div>
//                 )}
//                 {rightSection && (
//                   <div
//                     {...rightSectionProps}
//                     className='absolute inset-y-0 right-0 flex items-center pr-2'
//                     style={{
//                       width: rightSectionWidth,
//                       pointerEvents: rightSectionPointerEvents,
//                     }}
//                   >
//                     {rightSection}
//                   </div>
//                 )}
//               </div>
//             );
//           case 'error':
//             return error ? (
//               <div className='text-xs italic text-red-500' {...errorProps}>
//                 {error}
//               </div>
//             ) : null;
//           default:
//             return null;
//         }
//       })}
//     </div>
//   );
// };

// export default RobustComboBox;
