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
      <div className='flex h-full items-center justify-center gap-x-6 px-[3.219rem]'>
        {tabs.map((item) => {
          return (
            <Link href="" key={item.query}
              onClick={(e)=>{
                e.preventDefault();

                router.push(item.url||"")
              }}
            >
              <div
                className={cn(
                  'relative flex h-full cursor-pointer items-center px-3 text-lg font-normal',
                  activeView === item.query && 'font-semibold',
                )}
                key={item.query}
                // onClick={(e) => {
                //   e.stopPropagation();
                //   // onChangeTab(item.query);
                // }}
              >
                <p className='relative'>
                  {item.title}
                  {(item.query === 'messages' && messageUnreadCount) ? (
                    <span className='absolute -right-6 -top-2 h-[1.5rem] w-[1.5rem] rounded-full bg-ocOrange text-center text-md font-semibold text-white'>
                      {messageUnreadCount}
                    </span>
                  ) : null}
                  {/* {(item.query === 'conversation' && conversationUnreadCount) ? (
                    <span className='absolute -right-6 -top-2 h-[1.5rem] w-[1.5rem] rounded-full bg-ocOrange text-center text-md font-semibold text-white'>
                      {conversationUnreadCount}
                    </span>
                  ) : null} */}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export { BuyerTabSwitch };
