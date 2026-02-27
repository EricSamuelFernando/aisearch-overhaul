'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { SectionKey } from '@/interfaces/card.interface';
import { AgentsWeMakeItEasyComponentData } from '@/data/card';
import AgentsWeMakeItEasyComponent from './companys-we-make-it-easy-components';

interface WeMakeItEasySection {
  title: string;
  component: React.ReactNode | React.ReactElement;
}

const sections: Record<SectionKey, WeMakeItEasySection> = {
  transaction: {
    title: 'Transaction',
    component: (
      <AgentsWeMakeItEasyComponent
        data={AgentsWeMakeItEasyComponentData['transaction']}
      />
    ),
  },
  technology: {
    title: 'Technology',
    component: (
      <AgentsWeMakeItEasyComponent
        data={AgentsWeMakeItEasyComponentData['technology']}
      />
    ),
  },
  transparency: {
    title: 'Transparency',
    component: (
      <AgentsWeMakeItEasyComponent
        data={AgentsWeMakeItEasyComponentData['transparency']}
      />
    ),
  },
};

const AgentsWeMakeItEasy = () => {
  const [activeSection, setActiveSection] =
    React.useState<SectionKey>('transaction');

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    key: SectionKey,
  ) => {
    e.stopPropagation();
    setActiveSection(key);
  };

  return (
    <section className='mb-4 flex flex-col pb-7'>
      {/* Title Section */}
      <div className='mx-auto flex h-auto w-full flex-col items-center justify-center gap-2 px-4 text-black md:px-8'>
        <h2 className='text-3xl font-bold capitalize leading-tight text-center md:text-5xl'>
          We Make It Easy
        </h2>
        <p className='text-center text-sm text-gray-600 md:text-lg max-w-md'>
          Guided Transactions Empowered by Transparency & Technology
        </p>
      </div>

      <div className="ms-4 me-4 flex w-auto mt-6  scroll-smooth whitespace-nowrap items-center justify-start  gap-3  md:flex-wrap md:justify-center md:p-6 md:pb-0 md:gap-6">
        {Object.entries(sections).map(([key, { title }]) => (
          <button
            key={key}
            className={cn(
              "relative flex-shrink-0 items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out  shadow-sm md:px-12 md:text-lg md:py-4",
              activeSection === key
                ? "bg-[#F07639] text-white shadow-md "
                : "bg-black text-white "
            )}
            onClick={(e) => handleClick(e, key as SectionKey)}
          >
            {/* {activeSection === key && (
              <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white md:left-4"></span>
            )} */}
            {title}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className='w-full bg-[#FAF9F5] overflow-x-auto px-16 '>
        {sections[activeSection].component}
      </div>

      {/* Pagination Dots */}
      <div className='flex justify-center space-x-2 pt-10'>
        {Object.keys(sections).map((key) => (
          <button
            key={key}
            onClick={(e) => handleClick(e, key as SectionKey)}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E1E1E] md:h-3 md:w-3',
              activeSection === key
                ? 'bg-[#1E1E1E] scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Switch to ${sections[key as SectionKey].title} section`}
          />
        ))}
      </div>
    </section>
  );
};

export default AgentsWeMakeItEasy;