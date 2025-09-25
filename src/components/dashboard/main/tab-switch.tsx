'use client';

import { TabLinks } from '@/interfaces/tab-link.interface';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Fragment, ReactNode } from 'react';

type Props = {
  basePath?: string;
  tabs: TabLinks;
  className?: string;
  tabClass?: string;
  activeTabClass?: string;
  backButton?: ReactNode;
  queryKey?: string;
  defaultKey?: string;
  onChangeTab?: (val: string) => void;
};

function TabSwitch({
  tabs,
  className,
  tabClass,
  backButton,
  activeTabClass,
  queryKey = 'tab',
  defaultKey = 'dashboard',
  onChangeTab,
}: Props) {
  const [view, setView] = useQueryState(queryKey, {
    defaultValue: defaultKey,
  });
  const router = useRouter();
  const handleChangeTab = (val: string) => {
    console.log("seller : ",val,onChangeTab);
    setView(val);
    if(val === 'conversation') {
      router.push('/dashboard/chat');
    }
    if (onChangeTab) {
      onChangeTab(val);
    }
  };

  return (
    <div className={cn('flex h-24 w-full items-center gap-x-2', className)}>
      {backButton ? <Fragment>{backButton}</Fragment> : null}
      <div className='flex h-full items-center justify-center gap-x-6 px-[3.219rem]'>
        {tabs.map((item) => {
          return (
            <div
              className={cn(
                'relative flex h-full cursor-pointer items-center px-3 text-lg',
                view === item.query
                  ? `font-semibold  ${tabClass}`
                  : `font-normal ${activeTabClass}`,
              )}
              key={item.query}
              onClick={() => handleChangeTab(item.query!)}
            >
              <p className='relative'>
                {item.title}
                {item.query === 'messages' ? (
                  <span className='absolute -right-6 -top-2 h-[1.5rem] w-[1.5rem] rounded-full bg-ocOrange text-center text-md font-semibold text-white'>
                    2
                  </span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TabSwitch;
