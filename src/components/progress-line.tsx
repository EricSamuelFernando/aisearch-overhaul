'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface ProgressLineProps {
  percentage?: number;
  progressOverlayClassName?: string;
  progressClassName?: string;
}

const ProgressLine: React.FC<ProgressLineProps> = ({
  percentage = 10,
  progressClassName,
  progressOverlayClassName,
}) => (
  <div
    className={cn(
      'mt-[10px] flex h-1.5 w-full rounded-lg bg-gray-200 shadow-sm',
      progressOverlayClassName,
    )}
  >
    <div
      className={cn('h-full rounded-lg bg-ocOrange', progressClassName)}
      style={{ width: `${percentage}%` }}
    />
  </div>
);

export { ProgressLine };
