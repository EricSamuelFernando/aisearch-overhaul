'use client';

import { cn } from '@/lib/utils';

interface Props extends React.PropsWithChildren {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const Cell: React.FC<Props> = ({
  onClick,
  children,
  className,
  isActive = false,
}) => {
  return (
    <div
      onClick={!isActive ? onClick : undefined}
      className={cn(
        'flex  h-10 select-none items-center justify-center transition-colors',
        {
          'cursor-pointer hover:bg-grey-100 active:bg-grey-200':
            !isActive && onClick,
          'bg-blue-600 font-bold text-white': isActive,
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
