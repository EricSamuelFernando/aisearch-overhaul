import { useContext, useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Menu,
  UnstyledButton,
  Indicator,
  Text,
  ScrollArea,
  Box,
} from '@mantine/core';
import {
  BellDot,
  CalendarCheck2,
  CalendarClock,
  FileText,
  FolderPlus,
  Handshake,
  MessageCircle,
  MessageSquareText,
  Tag,
  CircleDot,
} from 'lucide-react';
import { useNotificationApi } from '@/hooks/api/user/useNotification';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { SocketContext } from '@/providers/socket.context';

type NotificationKind =
  | 'message'
  | 'comment'
  | 'snapz'
  | 'collection'
  | 'price'
  | 'status'
  | 'open_house'
  | 'reply'
  | 'document'
  | 'offer'
  | 'appointment'
  | 'general';

type UINotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: NotificationKind;
  link?: string;
  threadId?: string;
};

const iconByKind: Record<NotificationKind, ComponentType<{ size?: number }>> = {
  message: MessageCircle,
  comment: MessageSquareText,
  snapz: CircleDot,
  collection: FolderPlus,
  price: Tag,
  status: CircleDot,
  open_house: CalendarClock,
  reply: MessageCircle,
  document: FileText,
  offer: Handshake,
  appointment: CalendarCheck2,
  general: CircleDot,
};

const normalizeKind = (type?: string): NotificationKind => {
  const value = (type || '').toLowerCase();
  if (!value) return 'general';
  if (value === 'message' || value === 'chat') return 'message';
  if (value === 'comment') return 'comment';
  if (value === 'snapz') return 'snapz';
  if (value === 'collection') return 'collection';
  if (value === 'price' || value === 'price_change') return 'price';
  if (value === 'status' || value === 'status_change') return 'status';
  if (value === 'open_house') return 'open_house';
  if (value === 'reply') return 'reply';
  if (value === 'document') return 'document';
  if (value === 'offer' || value === 'offer_status') return 'offer';
  if (value === 'appointment' || value === 'tour') return 'appointment';
  return 'general';
};

const deriveKind = (title?: string, body?: string): NotificationKind => {
  const text = `${title ?? ''} ${body ?? ''}`.toLowerCase();
  if (text.includes('message') || text.includes('chat')) return 'message';
  if (text.includes('comment')) return 'comment';
  if (text.includes('snapz')) return 'snapz';
  if (text.includes('collection')) return 'collection';
  if (text.includes('price') || text.includes('drop')) return 'price';
  if (text.includes('status') || text.includes('under contract') || text.includes('back on market')) return 'status';
  if (text.includes('open house')) return 'open_house';
  if (text.includes('reply') || text.includes('replied')) return 'reply';
  if (text.includes('document') || text.includes('inspection') || text.includes('disclosure')) return 'document';
  if (text.includes('offer')) return 'offer';
  if (text.includes('appointment') || text.includes('tour') || text.includes('confirmed') || text.includes('rescheduled')) return 'appointment';
  return 'general';
};

export default function NotificationDropdown() {
  const {
    notificationsQuery,
    markOneAsReadMutation,
    markAllAsReadMutation,
    markLinkAsReadMutation,
  } = useNotificationApi();
  const router = useRouter();
  const { state } = useContext(SocketContext);
  const [socketNotifications, setSocketNotifications] = useState<UINotification[]>([]);
  const apiNotifications =
    notificationsQuery.data?.data.data.result.result || [];

  const notifications = useMemo(() => {
    const normalized: UINotification[] = apiNotifications.map((item) => ({
      id: item._id,
      title: item.title,
      body: item.body,
      createdAt: item.createdAt,
      read: item.read,
      kind: normalizeKind((item as { type?: string }).type) || deriveKind(item.title, item.body),
      link: (item as { link?: string }).link,
    }));
    return [...socketNotifications, ...normalized].reduce<UINotification[]>((acc, next) => {
      if (!acc.find((existing) => existing.id === next.id)) {
        acc.push(next);
      }
      return acc;
    }, []);
  }, [apiNotifications, socketNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!state?.notification?.isVisible && !state?.newMessage) return;
    notificationsQuery.refetch();
  }, [notificationsQuery, state?.notification?.isVisible, state?.newMessage]);

  useEffect(() => {
    if (!state?.notification?.isVisible) return;
    const message = state.notification.message || 'New message';
    const sender = state.notification.user || 'Someone';
    const channelId = state.notification.channelId;
    const idSuffix = channelId || Date.now().toString();
    const link = channelId ? `/dashboard/buyer?tab=messages&threadId=${channelId}` : '/dashboard/buyer?tab=messages';

    setSocketNotifications((prev) => {
      const id = `socket-${idSuffix}-${Date.now()}`;
      const next: UINotification = {
        id,
        title: 'New message in property chat',
        body: `${sender}: ${message}`,
        createdAt: new Date().toISOString(),
        read: false,
        kind: 'message',
        link,
        threadId: channelId || undefined,
      };
      return [next, ...prev].slice(0, 20);
    });
  }, [state?.notification]);

  useEffect(() => {
    const activeThreadId = state?.selectedChannel?.id;
    if (!activeThreadId) return;
    setSocketNotifications((prev) =>
      prev.map((item) =>
        item.threadId === activeThreadId ? { ...item, read: true } : item,
      ),
    );
  }, [state?.selectedChannel?.id]);
  const handleOpenNotification = (notification: UINotification) => {
    if (!notification.read) {
      if (!notification.id.startsWith('socket-')) {
        markOneAsReadMutation.mutate(notification.id);
        if (notification.link) {
          markLinkAsReadMutation.mutate(notification.link);
        }
      }
      setSocketNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAll = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate(undefined);
    }
    setSocketNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <Menu shadow="md" radius={'lg'} width={280} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <Indicator color="red" size={12} disabled={!unreadCount}>
            <BellDot size={24} />
          </Indicator>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Box className="flex items-center justify-between px-3 pt-2">
          <Text size="xs" className="text-slate-500">
            Notifications
          </Text>
          <button
            type="button"
            onClick={handleMarkAll}
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wide',
              unreadCount > 0 ? 'text-amber-700' : 'text-slate-400 cursor-default'
            )}
            aria-disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </Box>
        <ScrollArea h={320}>
          {notifications.length === 0 && (
            <Box p="md">
              <Text size="sm" color="dimmed">
                No notifications
              </Text>
            </Box>
          )}

          {notifications.map((notification) => {
            const Icon = iconByKind[notification.kind] || CircleDot;
            const timestamp = new Date(notification.createdAt);
            const timeLabel = Number.isNaN(timestamp.getTime())
              ? 'Just now'
              : `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const isUnread = !notification.read;

            return (
              <Box
                key={notification.id}
                p="xs"
                className={cn(
                  'p-2 mb-1 flex flex-col gap-2 rounded-md border cursor-pointer',
                  isUnread
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-slate-50 border-slate-100'
                )}
                onClick={() => handleOpenNotification(notification)}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      'mt-0.5 rounded-full p-1',
                      isUnread
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <Text
                      size="sm"
                      className={
                        isUnread ? 'font-semibold text-slate-900' : 'text-slate-700'
                      }
                    >
                      {notification.title}
                    </Text>
                    <Text size="xs" className="text-slate-500">
                      {notification.body}
                    </Text>
                  </div>
                </div>
                <div className="text-[10px] text-right text-gray-500 italic">
                  {timeLabel}
                </div>
              </Box>
            );
          })}
        </ScrollArea>
      </Menu.Dropdown>
    </Menu>
  );
}

