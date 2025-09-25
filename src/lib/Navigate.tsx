'use client';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface NavigateProps {
  to: string;
}

const Navigate: React.FC<NavigateProps> = ({ to = '' }) => {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof to === 'string' && to.length > 0) {
      router.push(to);
    }
  }, [to, router]);

  return null;
};

export { Navigate };
