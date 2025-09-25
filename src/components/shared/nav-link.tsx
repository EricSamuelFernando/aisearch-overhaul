'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import { cn } from '@/lib/utils';

type NavLinkProp = {
  children: React.ReactNode;
  className: string;
  slug: string;
  activeClass?: string;
  href: string;
  rel: string;
  handleMouseEnter: (slug: string) => void;
  handleMouseLeave: () => void;
};

export default function NavLink({
  slug,
  children,
  className,
  activeClass,
  href,
  rel,
  handleMouseEnter,
  handleMouseLeave,
}: Readonly<NavLinkProp>) {
  const segment = useSelectedLayoutSegment();
  const isActive = slug === segment;

  return (
    <Link
      rel={rel}
      href={href}
      className={cn(className, isActive ? activeClass : '')}
      onMouseEnter={() => handleMouseEnter(slug)}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}
