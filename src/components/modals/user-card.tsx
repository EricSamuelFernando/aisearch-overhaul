'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export type UserType = 'buyer' | 'seller' | 'agent';

interface UserCardProps {
  userType: 'buyer' | 'seller' | 'agent';
  onClick: () => void;
  isActive: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  userType,
  onClick,
  isActive,
}) => {
  return (
    <div
      className={cn(
        'mb-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap rounded-md border px-4 py-6 text-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30',
        isActive
          ? 'border-black bg-black text-white hover:bg-black hover:text-white'
          : 'border-black bg-white text-black hover:bg-gray-200 hover:text-black',
      )}
      onClick={onClick}
    >
      <p className='text-center text-base font-semibold'>
        I am {userType === 'agent' ? 'an' : 'a'} {userType}
      </p>
    </div>
  );
};
