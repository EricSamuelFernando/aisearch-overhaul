'use client';

import ConversationPageForBuyerAgentChat from '@/components/chat-box/conversation';
import { useGetUserEngagementsAgents } from '@/hooks/api/agent/useAgentProperty';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';
import { BUYER_DASHBOARD_SECTION_VISIBILITY } from '@/utils/data';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export interface ThreadInterface {
  id: string;
  threadName: string;
  propertyId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  unreadCount: number;
}

const ChatBox = () => {
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<ThreadInterface[] | []>([]);
  const [isRead, setIsRead] = useState(true);
  const [search, setSearch] = useState('');
  const [threadParticipants, setThreadParticipant] = useState<any>([]);
  const params = useSearchParams();
  const router = useRouter();
  const isConversationVisible =
    BUYER_DASHBOARD_SECTION_VISIBILITY.conversation !== false;
  const engagedProperty = useSelector(
    (state: { property: { engagedProperty: any } }) =>
      state.property.engagedProperty,
  );
  const { data: agents, isLoading } = useGetUserEngagementsAgents();
  const { getAllThreadsByBuyerAgentsMutation } = useAgentConversationApi();
  const { getAllThreadByPropertyMutation } = useUserAgentMessageApi();

  const getAllConversationThreads = async () => {
    try {
      setLoading(true);
      getAllThreadByPropertyMutation.mutate(
        {
          propertyId: engagedProperty?.propertyId,
          listingId: engagedProperty?.listingId + '',
        },
        {
          onSuccess: (data) => {
            setThreads(data?.data?.get_threads_by_property || []);
            setLoading(false);
          },
          onError: (error) => {
            console.error('Error in mutation: ', error);
            setLoading(false);
          },
        },
      );
    } catch (error) {
      console.error('Error : ', error);
    }
  };

  const getAllConversationThreadsByBuyerAgents = async () => {
    try {
      setLoading(true);
      const data = {
        agentIds: agents?.map((agent: any) => agent.id),
        threadName: search,
        isRead: isRead,
      };
      getAllThreadsByBuyerAgentsMutation.mutate(data, {
        onSuccess: (data) => {
          setThreads(data?.data?.get_threads_by_buyer_agents || []);
          setLoading(false);
        },
        onError: (error) => {
          console.error('Error in mutation: ', error);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error : ', error);
    }
  };

  useEffect(() => {
    if (!isConversationVisible) {
      router.replace('/dashboard/chat');
    }
  }, [isConversationVisible, router]);

  useEffect(() => {
    if (engagedProperty && agents) {
      // Get threads by Buyer Agents only if engagedProperty and agents are available
      getAllConversationThreadsByBuyerAgents();
    }
  }, [engagedProperty, agents, isRead, search]);

  if (!isConversationVisible) {
    return null;
  }

  return (
    <>
      <ConversationPageForBuyerAgentChat
        loading={loading}
        threads={threads}
        search={search}
        setSearch={setSearch}
        isRead={isRead}
        setIsRead={setIsRead}
      />
    </>
  );
};

export default ChatBox;
