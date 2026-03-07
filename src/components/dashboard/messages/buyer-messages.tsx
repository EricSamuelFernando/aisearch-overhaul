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
  const [restoredThreadId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('threadId') || undefined;
    }
    return undefined;
  });
  const [isRead, setIsRead] = useState(false);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const [cachedMessageThreads, setMessageThreads] = useAtom(messageThreadsAtom);
  const { state, setState } = useContext(SocketContext);
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
      getAllThreadsByUserAgentMutation.mutate(payload, {
        onSuccess: (response) => {
          const nextThreads = response?.data?.get_user_and_agent_threads || [];
          const socketUnread = Array.isArray(state?.conversationUnreadCount)
            ? state.conversationUnreadCount
            : [];
          const normalizeId = (value?: string | null) =>
            String(value ?? '').trim().toLowerCase();
          const mergedThreads = nextThreads.map((thread: any) => {
            const entry = socketUnread.find((item: any) => {
              const entryId = normalizeId(item?.threadId);
              const candidates = [
                thread?.id,
                thread?.threadId,
                thread?.thread_id,
                thread?.roomId,
                thread?.room_id,
                thread?.conversationId,
                thread?.conversation_id,
              ];
              return candidates.some((candidate) => normalizeId(candidate) === entryId);
            });
            if (!entry) return thread;
            return {
              ...thread,
              unreadCount: Math.max(thread?.unreadCount || 0, entry?.count || 0),
            };
          });
          setThreads(mergedThreads);
          setMessageThreads(mergedThreads);

          // Seed socket state with authoritative unread counts from REST API
          // so badges show correctly on initial page load (no socket event needed)
          setState((prev: any) => {
            const existing: { threadId: string; count: number }[] = Array.isArray(prev.conversationUnreadCount)
              ? prev.conversationUnreadCount
              : [];
            const threadsWithCount = mergedThreads.filter((t: any) => (t.unreadCount || 0) > 0);
            if (threadsWithCount.length === 0) return prev;

            const updated = [...existing];
            threadsWithCount.forEach((thread: any) => {
              const idx = updated.findIndex((e) => e.threadId === thread.id);
              const apiCount = thread.unreadCount || 0;
              if (idx >= 0) {
                // Keep the higher value between socket and REST
                updated[idx] = { ...updated[idx], count: Math.max(updated[idx].count, apiCount) };
              } else {
                updated.push({ threadId: thread.id, count: apiCount });
              }
            });
            return { ...prev, conversationUnreadCount: updated };
          });

          setLoading(false);
        },
        onError: (error) => {
          console.log('Error in mutation: ', error);
          setLoading(false);
        },
      });
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
      threadId={restoredThreadId}
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
