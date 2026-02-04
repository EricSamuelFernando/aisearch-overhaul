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
    <div className={cn('flex h-16 sm:h-20 md:h-24 w-full items-center gap-x-1 sm:gap-x-2 bg-white border-b border-gray-100', className)}>
      <div className="flex h-full items-center px-2 sm:px-4 md:px-6 lg:px-[3.219rem] overflow-x-auto scrollbar-hide">
        <div className="flex h-full items-center gap-x-2 sm:gap-x-4 md:gap-x-6 whitespace-nowrap min-w-max">
          {tabs.map((item) => {
        return (
          <Link
            href={item.url || ''}
            key={item.query}
            onClick={(e) => {
          e.preventDefault();
          router.push(item.url || '');
            }}
            className="flex-shrink-0"
          >
            <div
          className={cn(
            'relative flex h-full cursor-pointer items-center px-1 sm:px-2 md:px-3 text-sm sm:text-base md:text-lg font-normal whitespace-nowrap transition-colors duration-200 hover:text-ocOrange',
            activeView === item.query && 'font-semibold text-ocOrange border-b-2 border-ocOrange'
          )}
            >
          <p className="relative py-2">
            {item.title}
            {item.query === 'messages' && messageUnreadCount ? (
              <span className="absolute -right-3 sm:-right-4 md:-right-6 -top-1 sm:-top-2 flex h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-ocOrange text-[8px] sm:text-[10px] md:text-xs font-semibold text-white shadow-sm">
            {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
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
