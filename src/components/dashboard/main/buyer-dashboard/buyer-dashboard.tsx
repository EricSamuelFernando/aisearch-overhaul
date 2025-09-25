'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storeCookie } from '@/lib/storage';
import { buyerDashboardRoutes } from '@/utils/data';
import BuyerPropertyListing from '../dashboard-pane';
import { USER_ROLE } from '@/shared/constants/env';
import { BuyerTabSwitch } from './BuyerTabSwitch';
import FeedsPane from '../feeds-pane';
import MessageTab from '../../messages/message-tab';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ConversationPage from '../../conversation';
import ConversationTab from '../../conversation/message-tab';
import { useDispatch, useSelector } from 'react-redux';
import { setEngagedProperty } from '@/slices/property/property-slice';

function useHashState(defaultHash = 'dashboard') {
  const [hash, setHash] = useState(defaultHash);

  useEffect(() => {
    const updateHash = () => {
      const newHash = window.location.hash.slice(1) || defaultHash;
      setHash(newHash);
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [defaultHash]);

  const setHashAndUpdate = useCallback((newHash: string) => {
    window.location.hash = newHash;
    setHash(newHash);
  }, []);

  return [hash, setHashAndUpdate] as const;
}

function useTabState(defaultTab = 'dashboard') {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || defaultTab;
  
  const setTab = (newTab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    router.push(url.pathname + url.search);
  };
  
  return [tab, setTab] as const;
}

function BuyerDashboard() {
  const dispatch = useDispatch();
  const [screenHash] = useHashState();

  useEffect(() => {
    return ()=>{
      dispatch(setEngagedProperty({}));
    }
  }, []);

  const RenderTabPanel = useMemo(() => {
    switch (screenHash) {
      case 'dashboard':
        return <BuyerPropertyListing />;
      case 'feed':
        return <FeedsPane />;
      case 'messages':
      case 'conversations':
      default:
        return <BuyerPropertyListing />;
    }
  }, [screenHash]);

  return (
<section className="bottom-0 left-0 w-full z-50 min-h-[350px] border-t border-gray-300 bg-white px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8 shadow-md">
      {RenderTabPanel}
    </section>

  );
}

// function SwitchLayout() {
//   const [selectedQuery, setSelectedQuery] = useHashState();
//   const chatData = useSelector((state: { chat: any }) => state?.chat)
//   const pathname = usePathname();
//   const router = useRouter();

//   const handleChange = useCallback(
//     (newHash: string) => {
//       console.log("newHash", newHash);
//       if (newHash === 'conversation') {
//         router.push('/dashboard/conversation');
//       }
//       if (newHash === 'messages') {
//         router.push('/dashboard/chat?type=messages');
//       }
//       setSelectedQuery(newHash);
//     },
//     [setSelectedQuery],
//   );

//   const excludedPaths = ['offer', 'manage', 'add-agent'];

//   if (excludedPaths.some((path) => pathname.includes(path))) { return null }

//   return (
//     <BuyerTabSwitch
//       activeView={selectedQuery}
//       tabs={buyerDashboardRoutes}
//       onChangeTab={handleChange}
//       messageUnreadCount={chatData?.messageUnreadCount}
//       conversationUnreadCount={chatData?.conversationUnreadCount}
//     />
//   );
// }

function SwitchLayout() {
  const [selectedTab, setSelectedTab] = useTabState();
  const chatData = useSelector((state: { chat: any }) => state?.chat);
  const pathname = usePathname();
  const router = useRouter();


  const excludedPaths = ['offer', 'manage', 'add-agent'];
  if (excludedPaths.some((path) => pathname.includes(path))) return null;

  return (
    <BuyerTabSwitch
      activeView={selectedTab}
      tabs={buyerDashboardRoutes}
      // onChangeTab={handleChange}
      messageUnreadCount={chatData?.messageUnreadCount}
      conversationUnreadCount={chatData?.conversationUnreadCount}
    />
  );
}


export { BuyerDashboard, SwitchLayout };
