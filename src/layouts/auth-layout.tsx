'use client';

import Image from 'next/image';
import React, { Fragment, ReactNode } from 'react';

import Link from 'next/link';
import { useAuth } from '@/shared/hooks/useAuth';
import { Navigate } from '@/lib/Navigate';
// Use the provided logo asset in /public/assets/Logos
import SnapHomz from '@public/assets/Logos/Snaphomz-Logo-Black (4).png';

interface AuthLayoutProps {
  children: ReactNode;
}
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  const link: string = ['seller', 'buyer'].includes(user?.account_type!)
    ? '/dashboard'
    : '/dashboard/agent';

  if (user && user?.account_type) return <Navigate to={link} />;

  return (
    <Fragment>
      <section className='px-6 py-3'>
        <Link href={'/home'}>
          <Image
            src={SnapHomz}
            alt='Snaphomz logo'
            className='h-[3.75rem] w-44 object-contain'
            priority
          />
        </Link>
      </section>
      <article className='flex h-[70vh] w-full items-center justify-center'>
        <Fragment>{children}</Fragment>
      </article>
    </Fragment>
  );
};

export { AuthLayout };
