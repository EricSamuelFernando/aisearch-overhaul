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
    'relative mx-auto mb-5 flex flex-col items-center px-4 pt-10 md:px-8 md:pt-24 lg:min-h-[80vh]',
    className,
  )}
>
      <div
  className="
    relative
    flex
    w-full
    justify-center
    mb-6
    sm:mb-8
    lg:mb-0
  "
>
  <div
    className="
      w-[180px]
      sm:w-[220px]
      md:w-[280px]
      lg:w-[420px]
      xl:w-[520px]
    "
  >
    {children}
  </div>
</div>



      <div
  className="
    relative
    flex
    w-full
    max-w-xl
    flex-col
    items-center
    text-center

    lg:absolute
    lg:left-8
    lg:top-1/2
    lg:-translate-y-1/2
    lg:items-start
    lg:text-left
  "
>
        <h1
  className="
    font-satoshi
    text-white
    tracking-[-0.04em]

    text-[36px] leading-[42px]
    sm:text-[48px] sm:leading-[56px]
    lg:text-[64px] lg:leading-[70px]
  "
>
  {title}
</h1>
        {form}
      </div>
    </section>
  );
};

export { Hero };
