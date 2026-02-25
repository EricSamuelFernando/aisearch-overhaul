'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { useSelector } from 'react-redux';

import ChatBoxComponent from '@/components/chat-box/chat-box';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';
import { messageThreadsAtom } from '@/hooks/atoms';
import { SocketContext } from '@/providers/socket.context';

interface ThreadInterface {
  id: string;
  threadName: string;
  propertyId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  unreadCount: number;
}

function BuyerMessagesPanel() {
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<ThreadInterface[] | []>([]);
  const [isRead, setIsRead] = useState(false);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const [cachedMessageThreads, setMessageThreads] = useAtom(messageThreadsAtom);
  const { setState } = useContext(SocketContext);
  const { getAllThreadsByUserAgentMutation } = useUserAgentMessageApi();
  const { getAllThreadsByUserMutation, getThreadById } = useAgentConversationApi();

  const userData = useSelector((state: { auth: { user: any } }) => state.auth.user);
  const routeThreadId = useMemo(
    () => String(searchParams?.get('threadId') || '').trim(),
    [searchParams],
  );

  const getAllUserAgentMessageThreadsByUser = async () => {
    try {
      const userId = String(userData?.id || '').trim();
      if (!userId) {
        setLoading(false);
        if (Array.isArray(cachedMessageThreads) && cachedMessageThreads.length > 0) {
          setThreads(cachedMessageThreads as any);
        }
        return;
      }
      setLoading(true);
      if (Array.isArray(cachedMessageThreads) && cachedMessageThreads.length > 0) {
        setThreads(cachedMessageThreads as any);
      }
      const payload = {
        userId,
        threadName: search,
        isRead: isRead,
      };

      const primaryResponse =
        await getAllThreadsByUserAgentMutation.mutateAsync(payload);
      let nextThreads = Array.isArray(primaryResponse?.data?.get_user_and_agent_threads)
        ? primaryResponse.data.get_user_and_agent_threads
        : [];

      if (!nextThreads.length) {
        try {
          const secondaryResponse = await getAllThreadsByUserMutation.mutateAsync(payload);
          nextThreads = Array.isArray(secondaryResponse?.data?.get_threads_by_user)
            ? secondaryResponse.data.get_threads_by_user
            : [];
        } catch (secondaryError) {
          console.log('Fallback get_threads_by_user failed: ', secondaryError);
        }
      }

      if (!nextThreads.length) {
        const cachedThreadId =
          typeof window !== 'undefined'
            ? String(localStorage.getItem('threadId') || '').trim()
            : '';
        const fallbackThreadId = routeThreadId || cachedThreadId;
        if (fallbackThreadId) {
          try {
            const hydratedThread = await getThreadById.mutateAsync(fallbackThreadId);
            if (hydratedThread?.id) {
              nextThreads = [hydratedThread];
            }
          } catch (threadHydrationError) {
            console.log('Fallback getThreadById failed: ', threadHydrationError);
          }
        }
      }

      setThreads(nextThreads);
      setMessageThreads(nextThreads);
    } catch (error) {
      console.log('error : ', error);
      if (Array.isArray(cachedMessageThreads) && cachedMessageThreads.length > 0) {
        setThreads(cachedMessageThreads as any);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUserAgentMessageThreadsByUser();
    return () => {
      setState((prev: any) => ({
        ...prev,
        selectedChannel: {
          id: null,
          propertyName: '',
        },
      }));
    };
  }, [isRead, routeThreadId, search, userData?.id]);

  return (
    <ChatBoxComponent
      loading={loading}
      setLoading={setLoading}
      threads={threads}
      search={search}
      setSearch={setSearch}
      isRead={isRead}
      setIsRead={setIsRead}
      embedded
    />
  );
}

export default BuyerMessagesPanel;
