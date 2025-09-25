import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';

type Props = {};

const SkeletonLoader = forwardRef<Props, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className } = props;
    return (
      <div
        className={cn(
          'h-32 w-32 animate-pulse rounded-md bg-gray-200',
          className,
        )}
      ></div>
    );
  },
);

export default SkeletonLoader;
SkeletonLoader.displayName = 'Skeleton Loader';
