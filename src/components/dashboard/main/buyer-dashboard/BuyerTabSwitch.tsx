import * as React from 'react';

import { cn } from '@/lib/utils';
import { TabLinks } from '@/interfaces/tab-link.interface';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BuyerTabSwitchProps {
  activeView: string;
  className?: string;
  // onChangeTab: (val: string) => void;
  tabs: TabLinks;
  messageUnreadCount?:number;
  conversationUnreadCount?: number;
}

const BuyerTabSwitch: React.FC<BuyerTabSwitchProps> = ({
  activeView,
  className,
  // onChangeTab,
  conversationUnreadCount,
  messageUnreadCount,
  tabs,
}) => {
  const router = useRouter();
  return (
    <div className={cn('flex h-24 w-full items-center gap-x-2', className)}>
      <div className="flex h-full items-center px-2 sm:px-[3.219rem] overflow-x-auto">
        <div className="flex h-full items-center gap-x-4 sm:gap-x-6 whitespace-nowrap">
          {tabs.map((item) => {
        return (
          <Link
            href={item.url || ''}
            key={item.query}
            onClick={(e) => {
          e.preventDefault();
          router.push(item.url || '');
            }}
          >
            <div
          className={cn(
            'relative flex h-full cursor-pointer items-center px-2 sm:px-3 text-base sm:text-lg font-normal whitespace-nowrap',
            activeView === item.query && 'font-semibold'
          )}
            >
          <p className="relative">
            {item.title}
            {item.query === 'messages' && messageUnreadCount ? (
              <span className="absolute -right-4 sm:-right-6 -top-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-ocOrange text-[10px] sm:text-xs font-semibold text-white">
            {messageUnreadCount}
              </span>
            ) : null}
          </p>
            </div>
          </Link>
        );
          })}
        </div>
      </div>
    </div>
  );
};

export { BuyerTabSwitch };
