// MenuDropdown.tsx
import React, { useState } from 'react';
import useClickOutside from '../../hooks/utils/useClickOutside';

export interface MenuItem {
  label: React.ReactNode;
  onClick?: () => void;
}

interface MenuDropdownProps {
  buttonLabel: React.ReactNode;
  items: MenuItem[];
  containerClassName?: string;
  dropdownClassName?: string;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  buttonLabel,
  items,
  containerClassName,
  dropdownClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const ref = useClickOutside(() => {
    setIsOpen(false);
  });

  return (
    <div className={`relative z-50 inline-block text-left ${containerClassName || ''}`}>
      <div onClick={toggleMenu}>{buttonLabel}</div>

      {isOpen && (
        <div
          ref={ref}
          className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownClassName || ''}`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item?.onClick ? item?.onClick() : null;
                setIsOpen(false);
              }}
              className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;

interface CustomDropdownProps {
  buttonLabel: React.ReactNode;
  items: React.ReactNode;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  buttonLabel,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useClickOutside(() => {
    setIsOpen(false);
  });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='relative z-20 inline-block text-left'>
      <div onClick={toggleMenu}>{buttonLabel}</div>
      {isOpen && (
        <div
          ref={ref}
          className='absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
        >
          {items}
        </div>
      )}
    </div>
  );
};
