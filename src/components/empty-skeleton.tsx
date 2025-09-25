import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Props = {
  placeholder?: string;
  className?: string;
};

export function EmptySkeleton({
  placeholder = `It's Empty Here`,
  className = '',
}: Props) {
  return (
    <div className={cn('relative flex w-full flex-col space-y-3', className)}>
      <Skeleton className='h-[125px] w-full rounded-xl' />
      <h1 className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] text-sm'>
        {placeholder}
      </h1>
    </div>
  );
}
