'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';

import { buyerDashboardRoutes } from '@/utils/data';
import { BuyerTabSwitch } from './BuyerTabSwitch';
import MySnapzSection from '../my-snapz-section';
import SearchHistorySection from '../search-history-section';

function useTabState(defaultTab = 'my-snapz') {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || defaultTab;

  const setTab = useCallback(
    (newTab: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      router.push(url.pathname + url.search);
    },
    [router],
  );

  return [tab, setTab] as const;
}

const DASHBOARD_SECTIONS: Record<string, JSX.Element> = {
  'my-snapz': <MySnapzSection />,
  'search-history': <SearchHistorySection />,
};

function BuyerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'my-snapz';

  useEffect(() => {
    if (activeTab === 'messages') {
      router.replace('/dashboard/chat?tab=messages');
      return;
    }

    if (!DASHBOARD_SECTIONS[activeTab]) {
      router.replace('/dashboard/buyer?tab=my-snapz');
    }
  }, [activeTab, router]);

  if (activeTab === 'messages') {
    return null;
  }

  const content = DASHBOARD_SECTIONS[activeTab] || DASHBOARD_SECTIONS['my-snapz'];

  return (
    <section className="bottom-0 left-0 w-full z-50 min-h-[350px] border-t border-gray-300 bg-white px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8 shadow-md">
      {content}
    </section>
  );
}

function SwitchLayout() {
  const visibleTabs = useMemo(
    () => buyerDashboardRoutes.filter((tab) => !tab.hidden),
    [],
  );
  const preferredDefault =
    visibleTabs.find((tab) => tab.query === 'my-snapz')?.query ||
    visibleTabs[0]?.query ||
    'messages';
  const [selectedTab, setSelectedTab] = useTabState(preferredDefault);
  const chatData = useSelector((state: { chat: any }) => state?.chat);
  const pathname = usePathname();
  const excludedPaths = ['offer', 'manage', 'add-agent'];

  useEffect(() => {
    const currentTabVisible = visibleTabs.some((tab) => tab.query === selectedTab);
    if (!currentTabVisible && visibleTabs[0]?.query) {
      setSelectedTab(visibleTabs[0].query);
    }
  }, [selectedTab, setSelectedTab, visibleTabs]);

  useEffect(() => {
    if (pathname.includes('/dashboard/chat') && selectedTab !== 'messages') {
      setSelectedTab('messages');
    }
  }, [pathname, selectedTab, setSelectedTab]);

  if (excludedPaths.some((path) => pathname.includes(path))) return null;
  if (!visibleTabs.length) return null;

  return (
    <BuyerTabSwitch
      activeView={selectedTab}
      tabs={visibleTabs}
      messageUnreadCount={chatData?.messageUnreadCount}
      conversationUnreadCount={chatData?.conversationUnreadCount}
    />
  );
}

export { BuyerDashboard, SwitchLayout };
