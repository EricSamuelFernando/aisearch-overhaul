import React, { useState } from 'react';

interface SharePropertyMenuProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const SharePropertyMenu: React.FC<SharePropertyMenuProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        onClick={toggleDropdown}
        className='w-full rounded-lg border border-grey-850 bg-grey-550  p-4 text-left text-md text-gray-700 outline-none'
      >
        {selectedValue || 'Role'}
        <svg
          className='absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute right-0 z-50 mt-1 w-full rounded-md bg-white shadow-lg'>
          <ul className='py-2'>
            {options.map((option) => (
              <li key={option.value}>
                <button
                  className='block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-[#E8804C] hover:text-white'
                  onClick={() => handleOptionClick(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SharePropertyMenu;
