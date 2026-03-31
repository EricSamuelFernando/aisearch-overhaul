import React from 'react';

import { cn } from '@/lib/utils';

export const HeroLayout = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <section
      className={cn(
        'mx-auto w-full flex items-center justify-center ', 
        className
      )}
      style={{ minHeight: '80vh', ...style }}
    >
      {children}
    </section>
  );
};
