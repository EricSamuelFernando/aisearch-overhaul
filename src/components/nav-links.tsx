'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NavLink({
  slug,
  children,
  className,
  activeClass,
  href,
  rel,
}: {
  children: React.ReactNode;
  className: string;
  slug: string;
  activeClass?: string;
  href: string;
  rel: string;
}) {
  const segment = useSelectedLayoutSegment();
  const isActive = slug === segment;

  return (
    <Link
      rel={rel}
      href={href}
      className={cn(className, isActive ? activeClass : '')}
    >
      {children}
    </Link>
  );
}
