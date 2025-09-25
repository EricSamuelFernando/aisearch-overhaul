import React from 'react';

type ISearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  holder?: string;
};

const SearchInput: React.FC<ISearchInputProps> = ({
  label,
  labelClassName,
  inputClassName,
  containerClassName,
  holder,
  placeholder = holder || 'search',
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor='default-search'
          className={`sr-only mb-2 text-base font-medium text-gray-900 dark:text-white ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div className='relative'>
        <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3'>
          <svg
            width='18'
            height='17'
            viewBox='0 0 29 28'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M11.7415 0.5C5.51214 0.5 0.5 5.54794 0.5 11.7415C0.5 17.9351 5.54794 22.983 11.7415 22.983C14.6772 22.983 17.3981 21.8374 19.4029 19.9399L26.7421 27.2791L27.3149 26.7063L20.0115 19.4029C21.8732 17.3981 23.0546 14.713 23.0546 11.7415C23.0188 5.54794 17.9709 0.5 11.7415 0.5ZM11.7415 22.1954C5.97755 22.1954 1.32342 17.5055 1.32342 11.7773C1.32342 6.04915 6.01335 1.35922 11.7415 1.35922C17.4697 1.35922 22.1596 6.04915 22.1596 11.7773C22.1596 17.5055 17.5055 22.1954 11.7415 22.1954Z'
              fill='black'
            />
            <path
              d='M11.7415 0C14.8839 0 17.8429 1.22305 20.0734 3.44384C22.3002 5.66086 23.5365 8.60667 23.5546 11.7386C23.5546 14.5371 22.5441 17.2324 20.6991 19.3834L28.022 26.7063L26.7421 27.9863L19.3862 20.6303C17.2694 22.4736 14.5737 23.483 11.7415 23.483C5.26722 23.483 0 18.2158 0 11.7415C0 8.60868 1.21841 5.66226 3.4308 3.445C5.64746 1.22346 8.59893 0 11.7415 0ZM11.7415 21.6954C17.2104 21.6954 21.6596 17.2462 21.6596 11.7773C21.6596 9.14047 20.6245 6.65323 18.7451 4.77377C16.8656 2.8943 14.3784 1.85923 11.7415 1.85923C9.10467 1.85923 6.61743 2.8943 4.73796 4.77377C2.85849 6.65323 1.82342 9.14047 1.82342 11.7773C1.82342 17.2462 6.27266 21.6954 11.7415 21.6954Z'
              fill='black'
            />
          </svg>
        </div>
        <input
          type='search'
          id='default-search'
          className={`dark:focus:ring-#9B9B9B dark:focus:border-#9B9B9B block h-[3.6245rem] w-full border-b border-[#9B9B9B] bg-white p-4 ps-10 text-sm text-black !outline-none focus:border-[#9B9B9B] focus:ring-[#9B9B9B] focus-visible:ring-0 dark:border-[#9B9B9B] dark:bg-transparent dark:text-black dark:placeholder-[#5A5A5A] ${inputClassName}`}
          placeholder={placeholder}
          {...props}
        />
      </div>
    </div>
  );
};

export { SearchInput };
