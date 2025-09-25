'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface HeroProps extends React.PropsWithChildren {
  title: string;
  form: React.ReactElement;
  className: string;
}

const Hero: React.FC<HeroProps> = ({ children, className, form, title }) => {
  return (
    <section
      className={cn(
        'mx-auto mb-5 flex min-h-[65vh] flex-row items-center justify-between space-x-8 px-4 pb-2 pt-12 md:min-h-[80vh] md:px-8 md:pb-2 md:pt-24',
        className,
      )}
    >
      <div className='flex w-full flex-col justify-center space-y-4 lg:w-1/3'>
        <h1 className='whitespace-pre-line py-3 text-3xl font-bold text-white md:text-2xl'>
          {title}
        </h1>
        {form}
      </div>
      <div className='hidden w-3/5 md:block'>{children}</div>
    </section>
  );
};

export { Hero };
