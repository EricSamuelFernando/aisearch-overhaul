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
        'mb-4 flex h-12 w-full cursor-pointer items-center justify-center  gap-x-2 rounded-md border-[1px] px-4 py-3 text-center',
        isActive
          ? 'bg-grey-200 hover:bg-grey-200/70'
          : 'border border-black bg-white',
      )}
      onClick={onClick}
    >
      <p className='text-center text-lg font-bold'>
        I am {userType === 'agent' ? 'an' : 'a'} {userType}
      </p>
    </div>
  );
};
