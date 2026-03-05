import { useContext, useEffect, useMemo, type ComponentType } from 'react';
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
  snapId?: string;
  source?: 'socket' | 'api';
};

type IconComponent = ComponentType<{ size?: string | number }>;

const iconByKind: Record<NotificationKind, IconComponent> = {
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
  const { state, setState } = useContext(SocketContext);
  const rawApiData = notificationsQuery.data?.data as any;
  const apiNotifications = Array.isArray(rawApiData)
    ? rawApiData
    : rawApiData?.data?.result?.result || rawApiData?.result || [];

  const notifications = useMemo(() => {
    const socketNotifications = Array.isArray(state?.notifications) ? state.notifications : [];
    const normalizedSocket: UINotification[] = socketNotifications.map((item: UINotification) => ({
      ...item,
      kind: normalizeKind(item.kind) || deriveKind(item.title, item.body),
      source: item.source || 'socket',
    }));

    const normalizedApi: UINotification[] = apiNotifications.map((item: any) => {
      const threadId = (item as { threadId?: string }).threadId;
      const snapId = (item as { snapId?: string }).snapId;
      const link =
        (item as { link?: string }).link ||
        (snapId ? `/account/collections/${snapId}` : undefined) ||
        (threadId ? `/dashboard/buyer?tab=messages&threadId=${threadId}` : undefined);
      return {
        id: item._id,
        title: item.title,
        body: item.body,
        createdAt: item.createdAt,
        read: item.read,
        kind: normalizeKind((item as { type?: string }).type) || deriveKind(item.title, item.body),
        link,
        threadId,
        snapId,
        source: 'api',
      };
    });

    const merged = [...normalizedSocket, ...normalizedApi].reduce((acc: UINotification[], next) => {
      if (!acc.find((n) => n.id === next.id)) acc.push(next);
      return acc;
    }, []);

    return merged.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
  }, [apiNotifications, state?.notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!state?.notification?.isVisible && !state?.newMessage) return;
    notificationsQuery.refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.notification?.isVisible, state?.newMessage]);

  useEffect(() => {
    const activeThreadId = state?.selectedChannel?.id;
    if (!activeThreadId) return;
    setState((prev: any) => ({
      ...prev,
      notifications: Array.isArray(prev.notifications)
        ? prev.notifications.map((item: UINotification) =>
            item.threadId === activeThreadId ? { ...item, read: true } : item,
          )
        : prev.notifications,
    }));
  }, [state?.selectedChannel?.id]);
  const handleOpenNotification = (notification: UINotification) => {
    if (!notification.read) {
      if (notification.source === 'api') {
        markOneAsReadMutation.mutate(notification.id);
        if (notification.link) {
          markLinkAsReadMutation.mutate(notification.link);
        }
      }
      if (notification.source === 'socket') {
        setState((prev: any) => ({
          ...prev,
          notifications: Array.isArray(prev.notifications)
            ? prev.notifications.map((item: UINotification) =>
                item.id === notification.id ? { ...item, read: true } : item,
              )
            : prev.notifications,
        }));
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAll = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate(undefined);
    }
    setState((prev: any) => ({
      ...prev,
      notifications: Array.isArray(prev.notifications)
        ? prev.notifications.map((item: UINotification) => ({ ...item, read: true }))
        : prev.notifications,
    }));
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

