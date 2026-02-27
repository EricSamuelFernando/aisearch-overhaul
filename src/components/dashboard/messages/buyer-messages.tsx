'use client';

import { useContext, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useSelector } from 'react-redux';

import ChatBoxComponent from '@/components/chat-box/chat-box';
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
  const [, setMessageThreads] = useAtom(messageThreadsAtom);
  const { setState, state } = useContext(SocketContext);
  const { getAllThreadsByUserAgentMutation } = useUserAgentMessageApi();

  const userData = useSelector((state: { auth: { user: any } }) => state.auth.user);

  const getAllUserAgentMessageThreadsByUser = async () => {
    try {
      setLoading(true);
      setThreads([]);
      const data = {
        userId: userData?.id,
        threadName: search,
        isRead: isRead,
      };
      getAllThreadsByUserAgentMutation.mutate(data, {
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
          setLoading(false);
        },
        onError: (error) => {
          console.log('Error in mutation: ', error);
          setLoading(false);
        },
      });
    } catch (error) {
      console.log('error : ', error);
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
  }, [isRead, search]);

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
