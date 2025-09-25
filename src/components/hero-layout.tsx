import React from 'react';

import { cn } from '@/lib/utils';

export const HeroLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        'mx-auto w-full flex items-center justify-center ', 
        className
      )}
      style={{ minHeight: '80vh' }}
    >
      {children}
    </section>
  );
};
