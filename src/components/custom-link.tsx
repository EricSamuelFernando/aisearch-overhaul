import React, { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CustomLinkProps {
  className?: string;
  children: ReactNode | string;
  href: string;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  className,
  href,
  children,
}) => {
  return (
    <Link
      className={cn(
        `mt-16 flex h-[3.25rem] w-2/4 items-center justify-center rounded-[3px] bg-white px-12 font-bold text-black`,
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
};

export default CustomLink;
