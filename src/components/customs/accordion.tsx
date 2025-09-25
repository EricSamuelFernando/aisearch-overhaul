'use client';

import React, { ReactNode, useState } from 'react';
import Heading from '@/components/heading';

interface AccordionProps {
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='border-t  border-grey-970'>
      <div
        className='flex cursor-pointer items-center justify-between p-4 transition-all duration-300 ease-in-out'
        onClick={toggleAccordion}
      >
        <h2 className='text-lg font-medium'>{title}</h2>
        <svg
          className={`h-6 w-6 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </div>
      {isOpen && <div className='p-4'>{children}</div>}
    </div>
  );
};

export const AccordionTitle = ({ title }: { title: string }) => {
  return <Heading title={title} className='my-0 text-xl font-bold' />;
};
