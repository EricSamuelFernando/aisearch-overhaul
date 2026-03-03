import { ReactNode, useState, createContext, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isUserLoggedIn, accessToken, userData } from "@/slices/auth/auth.slice";
import { useSelector } from "react-redux";
import { WebSocketClient, createWebSocketClient } from "@/lib/websocket-client";
import IdleTimeout from "./IdleTimeout";
import NewNotification from "@/components/chat-box/notification-bar";
import InvitationNotification from "@/components/notifications/invitation";
import OfferNotification from "@/components/notifications/offer";
import { getAuthToken } from "@/lib/storage";
import { useAtom } from "jotai";
import { messageThreadsAtom } from "@/hooks/atoms";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationApi } from "@/hooks/api/user/useNotification";

type SocketContextType = {
  socket: WebSocketClient | null;
  state: typeof initialState;
  setState: React.Dispatch<React.SetStateAction<typeof initialState>>;
};

export const initialState: any = {
  isReadThreadId: null,
  notification: {
    user: null,
    property: null,
    message: "",
    title: "",
    body: "",
    kind: "message",
    channelId: null,
    action: "navigate",
    isVisible: false,
  },
  notifications: [],
  newMessage: null,
  isCurrentChatAtBottom: false,
  scrollToLatestRequest: null,
  selectedChannel: {
    id: "",
    propertyName: '',
  },
  messageUnreadCount: [
    {
      channelId: null,
      count: 0,
    },
  ],
  conversationUnreadCount: [
    {
      threadId: null as string | null,
      count: 0,
    },
  ],
};


export const SocketContext = createContext<SocketContextType>({
  socket: null,
  state: initialState,
  setState: () => { },
});

const getStringValue = (...values: any[]): string => {
  for (const value of values) {
    if (typeof value === "string") {
      const normalized = value.trim();
      if (
        normalized &&
        normalized.toLowerCase() !== "undefined" &&
        normalized.toLowerCase() !== "null"
      ) {
        return normalized;
      }
    }
  }
  return "";
};

const normalizeKey = (key: string): string => key.replace(/[^a-z0-9]/gi, "").toLowerCase();

const findStringByKeysDeep = (input: any, wantedKeys: string[]): string => {
  if (!input || typeof input !== "object") return "";
  const wanted = new Set(wantedKeys.map((k) => normalizeKey(k)));
  const visited = new Set<any>();
  const queue: any[] = [input];

  while (queue.length) {
    const node = queue.shift();
    if (!node || typeof node !== "object" || visited.has(node)) continue;
    visited.add(node);

    for (const [rawKey, value] of Object.entries(node)) {
      const key = normalizeKey(rawKey);
      if (wanted.has(key) && typeof value === "string") {
        const normalized = getStringValue(value);
        if (normalized) return normalized;
      }
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return "";
};

const isUuidLike = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const resolveSenderName = (messageData: any): string => {
  const containers = [
    messageData,
    messageData?.data,
    messageData?.payload,
    messageData?.data?.payload,
    messageData?.payload?.data,
  ].filter(Boolean);

  const firstNameKeys = [
    "senderFirstName",
    "sender_first_name",
    "senderFirstname",
    "sender_firstname",
    "firstName",
    "first_name",
  ];
  const lastNameKeys = [
    "senderLastName",
    "sender_last_name",
    "senderLastname",
    "sender_lastname",
    "lastName",
    "last_name",
  ];
  const explicitNameKeys = [
    "senderName",
    "sender_name",
    "senderFullName",
    "sender_full_name",
    "userName",
    "user_name",
    "name",
  ];

  for (const container of containers) {
    const firstName = getStringValue(...firstNameKeys.map((key) => container?.[key]));
    const lastName = getStringValue(...lastNameKeys.map((key) => container?.[key]));
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName && !isUuidLike(fullName)) return fullName;
    if (firstName && !isUuidLike(firstName)) return firstName;
    if (lastName && !isUuidLike(lastName)) return lastName;

    const senderObject = container?.sender;
    const senderFirst = getStringValue(
      senderObject?.firstName,
      senderObject?.first_name,
      senderObject?.senderFirstName,
      senderObject?.sender_first_name,
    );
    const senderLast = getStringValue(
      senderObject?.lastName,
      senderObject?.last_name,
      senderObject?.senderLastName,
      senderObject?.sender_last_name,
    );
    const senderFull = `${senderFirst} ${senderLast}`.trim();
    if (senderFull && !isUuidLike(senderFull)) return senderFull;
    if (senderFirst && !isUuidLike(senderFirst)) return senderFirst;
    if (senderLast && !isUuidLike(senderLast)) return senderLast;

    const explicitName = getStringValue(
      ...explicitNameKeys.map((key) => container?.[key]),
      senderObject?.name,
      container?.user?.name,
      container?.user?.firstName,
      container?.user?.first_name,
      container?.sender,
    );
    if (explicitName && !isUuidLike(explicitName)) return explicitName;
  }

  const deepFirstName = findStringByKeysDeep(messageData, [
    "senderFirstName",
    "sender_first_name",
    "firstName",
    "first_name",
  ]);
  const deepLastName = findStringByKeysDeep(messageData, [
    "senderLastName",
    "sender_last_name",
    "lastName",
    "last_name",
  ]);
  const deepFullName = `${deepFirstName} ${deepLastName}`.trim();
  if (deepFullName && !isUuidLike(deepFullName)) return deepFullName;
  if (deepFirstName && !isUuidLike(deepFirstName)) return deepFirstName;
  if (deepLastName && !isUuidLike(deepLastName)) return deepLastName;

  const deepExplicitName = findStringByKeysDeep(messageData, [
    "senderName",
    "sender_name",
    "senderFullName",
    "sender_full_name",
    "name",
  ]);
  if (deepExplicitName && !isUuidLike(deepExplicitName)) return deepExplicitName;

  const senderId = getStringValue(
    messageData?.senderId,
    messageData?.sender_id,
    messageData?.data?.senderId,
    messageData?.data?.sender_id,
    messageData?.payload?.senderId,
    messageData?.payload?.sender_id,
    messageData?.data?.payload?.senderId,
    messageData?.data?.payload?.sender_id,
    messageData?.payload?.data?.senderId,
    messageData?.payload?.data?.sender_id,
  );
  if (senderId && !isUuidLike(senderId)) return senderId;

  return "";
};

const resolveNotificationMessage = (messageData: any): string =>
  getStringValue(
    messageData?.message,
    messageData?.content,
    messageData?.text,
  );

const resolveNotificationThreadId = (payload: any): string =>
  getStringValue(
    payload?.threadId,
    payload?.thread_id,
    payload?.channelId,
    payload?.channel_id,
    payload?.data?.threadId,
    payload?.data?.thread_id,
  );

const getFileNameFromUrl = (url?: string): string => {
  if (!url) return "";
  try {
    const cleanUrl = url.split("?")[0];
    const fileName = cleanUrl.split("/").pop() || "";
    return decodeURIComponent(fileName);
  } catch {
    return "";
  }
};

const normalizeId = (value: any): string => String(value ?? "").trim().toLowerCase();

const resolveSenderId = (messageData: any): string =>
  getStringValue(
    messageData?.senderId,
    messageData?.sender_id,
    messageData?.sender?.id,
    messageData?.sender?.userId,
    messageData?.sender?.user_id,
    messageData?.createdById,
    messageData?.created_by_id,
  );

const resolveChannelId = (messageData: any): string =>
  getStringValue(
    messageData?.threadId,
    messageData?.thread_id,
    messageData?.thread?.id,
    messageData?.thread?._id,
    messageData?.thread?.threadId,
    messageData?.thread?.thread_id,
    messageData?.roomId,
    messageData?.room_id,
    messageData?.room?.id,
    messageData?.room?._id,
    messageData?.room?.roomId,
    messageData?.conversationId,
    messageData?.conversation_id,
    messageData?.conversation?.id,
    messageData?.conversation?._id,
    messageData?.conversation?.threadId,
    messageData?.conversation?.thread_id,
    messageData?.channelId,
    messageData?.channel_id,
    messageData?.data?.threadId,
    messageData?.data?.thread_id,
    messageData?.data?.thread?.id,
    messageData?.data?.thread?._id,
    messageData?.data?.roomId,
    messageData?.data?.room?.id,
    messageData?.data?.room?._id,
    messageData?.data?.conversationId,
    messageData?.data?.conversation?.id,
    messageData?.data?.conversation?._id,
    messageData?.id,
    messageData?._id,
  );

const resolveSenderNameFromThreads = (
  threadId: string,
  senderId: string,
  threads: any[],
): string => {
  if (!threadId || !senderId || !Array.isArray(threads) || threads.length === 0) return "";

  const normalizedThreadId = normalizeId(threadId);
  const normalizedSenderId = normalizeId(senderId);
  const matchedThread = threads.find((thread: any) => {
    const candidates = [
      thread?.id,
      thread?.threadId,
      thread?.thread_id,
      thread?.roomId,
      thread?.room_id,
      thread?.conversationId,
      thread?.conversation_id,
    ];
    return candidates.some((candidate) => normalizeId(candidate) === normalizedThreadId);
  });
  if (!matchedThread) return "";

  const participantCandidates = [
    ...(Array.isArray(matchedThread?.participants) ? matchedThread.participants : []),
    matchedThread?.user,
    matchedThread?.buyerAgent,
    matchedThread?.sellerAgent,
  ].filter(Boolean);

  for (const rawParticipant of participantCandidates) {
    const participant = rawParticipant?.user ?? rawParticipant;
    const participantId = normalizeId(
      getStringValue(
        participant?.id,
        participant?.userId,
        participant?.user_id,
      ),
    );
    if (!participantId || participantId !== normalizedSenderId) continue;

    const firstName = getStringValue(participant?.firstName, participant?.first_name);
    const lastName = getStringValue(participant?.lastName, participant?.last_name);
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (firstName) return firstName;
    if (lastName) return lastName;
  }

  return "";
};

function SocketProvider({ children }: { children: ReactNode }) {
  const SOCKET_URL =
    process.env.NEXT_PUBLIC_COMMUNICATION_SOCKET_URI || "http://localhost:4002";
  const isLogin = useSelector(isUserLoggedIn);
  const token = useSelector(accessToken);
  const user = useSelector(userData);
  const [state, setState] = useState(initialState);
  const [socket, setSocket] = useState<WebSocketClient | null>(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [isOffer, setIsOffer] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [messageThreads] = useAtom(messageThreadsAtom);
  const queryClient = useQueryClient();
  const { notificationsQuery } = useNotificationApi();
  const authNotificationWsRef = useRef<WebSocket | null>(null);
  const authNotificationReconnectRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get token from Redux OR Cookie
  const cookieToken = getAuthToken();
  const effectiveToken = token || cookieToken;

  useEffect(() => {
    console.log('[SocketProvider] Debug Auth:', {
      reduxToken: !!token ? `Yes (${token.substring(0, 5)}...)` : 'No',
      cookieToken: !!cookieToken ? `Yes (${cookieToken.substring(0, 5)}...)` : 'No',
      effectiveToken: !!effectiveToken,
      socketExists: !!socket
    });
  }, [token, cookieToken, effectiveToken, socket]);

  // Auto-connect socket - prevent duplicate connections
  useEffect(() => {
    console.log('[SocketProvider] Effect Triggered. Token:', !!effectiveToken, 'Socket:', !!socket, 'isLogin:', isLogin);

    // Only connect if logged in and have token, and socket doesn't exist
    if (isLogin && effectiveToken && !socket) {
      console.log('[SocketContext] Token found. Creating new socket connection to:', SOCKET_URL);

      const newSocket = createWebSocketClient(SOCKET_URL);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log('[SocketContext] Connected!', newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error('[SocketContext] Connection Error:', err);
      });

      newSocket.on("disconnect", (reason) => {
        console.warn('[SocketContext] Disconnected:', reason);
      });

      return () => {
        console.log('[SocketContext] Cleanup: Disconnecting socket');
        if (newSocket) {
          newSocket.disconnect();
        }
        setSocket(null);
      };
    } else if ((!isLogin || !effectiveToken) && socket) {
      console.log('[SocketContext] No token or not logged in. Disconnecting.');
      socket.disconnect();
      setSocket(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, effectiveToken]); // Only depend on login status and token, not socket (to prevent loops)

  // Auth WS connection for bell notifications (notification_created)
  useEffect(() => {
    const commWsUrl = process.env.NEXT_PUBLIC_COMMUNICATION_SOCKET_URI;
    const baseAuthWsUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL;
    const authServiceBaseUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL;
    if (!isLogin || !effectiveToken) return;

    let resolvedAuthWsUrl = baseAuthWsUrl || authServiceBaseUrl;
    if (!resolvedAuthWsUrl) return;

    if (commWsUrl && resolvedAuthWsUrl === commWsUrl && authServiceBaseUrl && authServiceBaseUrl !== commWsUrl) {
      resolvedAuthWsUrl = authServiceBaseUrl;
    }

    // const trimmedBase = resolvedAuthWsUrl.replace(/\/$/, '');
    // const wsBase = trimmedBase.endsWith('/ws') ? trimmedBase : `${trimmedBase}/ws`;
    // const wsUrl = wsBase.startsWith('ws') ? wsBase : wsBase.replace(/^http/, 'ws');
    const encodedToken = encodeURIComponent(`Bearer ${effectiveToken}`);
    const authWsUrl = `${resolvedAuthWsUrl}?token=${encodedToken}&authorization=${encodedToken}`;
    console.log("Websocket url is ", authWsUrl)
    const connectAuthWs = () => {
      if (authNotificationWsRef.current) return;

      const authWs = new WebSocket(authWsUrl);
      authNotificationWsRef.current = authWs;

      authWs.onopen = () => {
        console.log('[AuthWS] Connected for notifications');
      };

      authWs.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          const eventName = packet?.event || packet?.action;
          if (eventName !== 'notification_created') return;

          const data = packet?.data || packet;
          const title = getStringValue(data?.title, data?.heading);
          const body = getStringValue(data?.body, data?.message, data?.text);
          const kind = getStringValue(data?.type, data?.kind) || 'general';
          const threadId = resolveNotificationThreadId(data);
          const snapId = getStringValue(data?.snapId, data?.snap_id);
          const link =
            getStringValue(data?.link) ||
            (snapId ? `/account/collections/${snapId}` : '') ||
            (threadId ? `/dashboard/buyer?tab=messages&threadId=${threadId}` : '');

          console.log('[AuthWS] notification_created received:', data);

          setState((prev: any) => ({
            ...prev,
            notification: {
              user: prev.notification?.user,
              property: prev.notification?.property,
              message: body || title || 'New notification',
              title: title || 'New notification',
              body: body || '',
              kind,
              channelId: threadId,
              action: 'navigate',
              isVisible: true,
              link,
            },
            notifications: [
              {
                id: data?.id || `socket-notification-${Date.now()}`,
                title: title || 'New notification',
                body: body || '',
                createdAt: data?.createdAt || new Date().toISOString(),
                read: false,
                kind: kind || 'general',
                link: link || undefined,
                threadId: threadId || undefined,
                snapId: snapId || undefined,
                source: 'socket',
              },
              ...(Array.isArray(prev.notifications) ? prev.notifications : []),
            ].slice(0, 50),
          }));

          console.log('[AuthWS] Notification added to state');
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (error) {
          console.error('[AuthWS] Error parsing notification payload:', error);
        }
      };

      authWs.onerror = (error) => {
        console.error('[AuthWS] Error event:', error);
      };

      authWs.onclose = () => {
        authNotificationWsRef.current = null;
        if (authNotificationReconnectRef.current) {
          clearTimeout(authNotificationReconnectRef.current);
        }
        authNotificationReconnectRef.current = setTimeout(() => {
          connectAuthWs();
        }, 2000);
      };
    };

    connectAuthWs();

    return () => {
      if (authNotificationReconnectRef.current) {
        clearTimeout(authNotificationReconnectRef.current);
        authNotificationReconnectRef.current = null;
      }
      if (authNotificationWsRef.current) {
        authNotificationWsRef.current.close();
        authNotificationWsRef.current = null;
      }
    };
  }, [isLogin, effectiveToken, queryClient]);

  // Hydrate bell notifications from API on load and refresh
  useEffect(() => {
    const rawApiData = notificationsQuery.data?.data as any;
    const apiNotifications = Array.isArray(rawApiData)
      ? rawApiData
      : rawApiData?.data?.result?.result || rawApiData?.result || [];
    if (!Array.isArray(apiNotifications) || apiNotifications.length === 0) return;

    setState((prev: any) => {
      const existing = Array.isArray(prev.notifications) ? prev.notifications : [];
      const normalized = apiNotifications.map((item: any) => ({
        id: item._id,
        title: item.title,
        body: item.body,
        createdAt: item.createdAt,
        read: item.read,
        kind: item.type || "general",
        link:
          item.link ||
          (item.snapId ? `/account/collections/${item.snapId}` : undefined) ||
          (item.threadId ? `/dashboard/buyer?tab=messages&threadId=${item.threadId}` : undefined),
        threadId: item.threadId,
        snapId: item.snapId,
        source: "api",
      }));

      const merged = [...normalized, ...existing].reduce((acc: any[], next: any) => {
        if (!acc.find((n) => n.id === next.id)) acc.push(next);
        return acc;
      }, []);

      return {
        ...prev,
        notifications: merged,
      };
    });
  }, [notificationsQuery.data]);

  // Sync notifications on route change to ensure hydration from API
  useEffect(() => {
    if (!isLogin) return;
    notificationsQuery.refetch();
  }, [pathname, isLogin, notificationsQuery]);

  useEffect(() => {
    if (!isLogin) return;
    notificationsQuery.refetch();
  }, [isLogin, effectiveToken, notificationsQuery]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    const isMessagingRoute =
      tab === 'messages' ||
      pathname.includes('/dashboard/chat') ||
      pathname.includes('/dashboard/conversation');

    if (!isMessagingRoute) {
      setState((prev: any) => ({
        ...prev,
        selectedChannel: {
          id: null,
          propertyName: '',
        },
      }));
    }
  }, [pathname, searchParams]);

  // Removed userConnected event - not supported by backend WebSocket handler

  // Handle incoming messages - only using backend-supported events
  useEffect(() => {
    if (socket) {
      // Removed invitation_updated, new_offer_recieved, recievedMessage - not supported by backend
      // These should be handled via REST API or separate WebSocket connection if needed

      // Handle incoming message events from websocket backend
      const handleIncomingMessage = (messageData: any, sourceEvent: "newMessage" | "recievedMessage") => {
        const threadId = resolveChannelId(messageData);
        const senderId = resolveSenderId(messageData);
        const socketResolvedSenderName = resolveSenderName(messageData);
        const threadResolvedSenderName = resolveSenderNameFromThreads(threadId, senderId, messageThreads);
        const notificationSenderName = getStringValue(socketResolvedSenderName, threadResolvedSenderName, "Agent");
        const resolvedMessageType = getStringValue(
          messageData?.messageType,
          messageData?.message_type,
          messageData?.type,
        );
        const resolvedEventType = getStringValue(
          messageData?.eventType,
          messageData?.event_type,
          messageData?.data?.eventType,
          messageData?.data?.event_type,
        );
        const fileName =
          getStringValue(messageData?.meta?.file?.name, messageData?.file?.name) ||
          getFileNameFromUrl(resolveNotificationMessage(messageData));
        const isDocumentEvent =
          resolvedEventType === "document_shared" ||
          resolvedEventType === "media_shared" ||
          resolvedMessageType === "file";

        console.log(`[SocketContext] Received ${sourceEvent}:`, messageData);
        console.log('[SocketContext] newMessage sender debug:', {
          sourceEvent,
          senderFirstName: messageData?.senderFirstName,
          senderLastName: messageData?.senderLastName,
          dataSenderFirstName: messageData?.data?.senderFirstName,
          dataSenderLastName: messageData?.data?.senderLastName,
          payloadSenderFirstName: messageData?.payload?.senderFirstName,
          payloadSenderLastName: messageData?.payload?.senderLastName,
          resolvedSenderName: socketResolvedSenderName,
          resolvedSenderNameFromThreads: threadResolvedSenderName,
          notificationSenderName,
          resolvedNotificationMessage: resolveNotificationMessage(messageData),
          resolvedChannelId: threadId,
          rawPayload: messageData,
        });

        setState((prevState: any) => {
          const normalizedThreadId = normalizeId(threadId);
          const normalizedSelectedChannelId = normalizeId(prevState.selectedChannel?.id);
          const isCurrentThreadOpen =
            !!normalizedThreadId &&
            !!normalizedSelectedChannelId &&
            normalizedThreadId === normalizedSelectedChannelId;
          const hasReliableSenderId = typeof senderId === "string" && senderId.length > 0;
          const isSelfMessage = hasReliableSenderId && !!user?.id && senderId === user.id;
          const existingCount =
            prevState.conversationUnreadCount.find((c: any) => c.threadId === threadId)?.count ?? 0;

          const updatedUnreadCounts = isCurrentThreadOpen || isSelfMessage
            ? prevState.conversationUnreadCount
            : [
              ...prevState.conversationUnreadCount.filter((c: any) => c.threadId !== threadId),
              { threadId: threadId || null, count: existingCount + 1 },
            ];

          const shouldShowNotification =
            (!isSelfMessage && !isCurrentThreadOpen) ||
            (isDocumentEvent && !isCurrentThreadOpen);

          const nextNotifications = Array.isArray(prevState.notifications)
            ? [...prevState.notifications]
            : [];

          if (shouldShowNotification) {
            const notificationId = `socket-${threadId || 'thread'}-${Date.now()}`;
            nextNotifications.unshift({
              id: notificationId,
              title: isDocumentEvent
                ? "Document shared in property chat"
                : "New message in property chat",
              body: isDocumentEvent
                ? `${notificationSenderName} shared ${fileName || "a document"}`
                : `${notificationSenderName}: ${resolveNotificationMessage(messageData)}`,
              createdAt: new Date().toISOString(),
              read: false,
              kind: isDocumentEvent ? "document" : "message",
              link: threadId
                ? `/dashboard/buyer?tab=messages&threadId=${threadId}`
                : "/dashboard/buyer?tab=messages",
              threadId: threadId || undefined,
              source: "socket",
            });
          }

          return {
            ...prevState,
            conversationUnreadCount: updatedUnreadCounts,
            notification: shouldShowNotification
              ? {
                user: notificationSenderName,
                property: getStringValue(
                  messageData?.propertyName,
                  messageData?.property_name,
                ),
                isVisible: true,
                channelId: threadId,
                action: "navigate",
                kind: isDocumentEvent ? "document" : "message",
                title: isDocumentEvent
                  ? "Document shared in property chat"
                  : "New message in property chat",
                body: isDocumentEvent
                  ? `${notificationSenderName} shared ${fileName || "a document"}`
                  : "",
                message: resolveNotificationMessage(messageData),
              }
              : prevState.notification,
            newMessage: isCurrentThreadOpen
              ? {
                ...messageData,
                threadId: threadId,
              }
              : prevState.newMessage,
            notifications: nextNotifications.slice(0, 50),
          };
        });
      };

      const handleNewMessage = (messageData: any) => handleIncomingMessage(messageData, "newMessage");
      const handleRecievedMessage = (messageData: any) => handleIncomingMessage(messageData, "recievedMessage");

      // Handle authoritative unread count pushed from backend
      const handleUnreadCountUpdated = (data: any) => {
        const threadId = data?.threadId;
        const count = typeof data?.count === 'number' ? data.count : 0;
        if (!threadId) return;
        console.log(`[SocketContext] unread_count_updated: threadId=${threadId}, count=${count}`);
        setState((prev: any) => ({
          ...prev,
          conversationUnreadCount: [
            ...(Array.isArray(prev.conversationUnreadCount)
              ? prev.conversationUnreadCount.filter((c: any) => c.threadId !== threadId)
              : []),
            { threadId, count },
          ],
        }));
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("recievedMessage", handleRecievedMessage);
      socket.on("unread_count_updated", handleUnreadCountUpdated);
      socket.on("notification_created", (payload: any) => {
        console.log("[SocketContext] notification_created:", payload);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        const data = payload?.data || payload;
        const threadId = resolveNotificationThreadId(data);
        const snapId = getStringValue(data?.snapId, data?.snap_id);
        const title = getStringValue(data?.title, data?.heading);
        const body = getStringValue(data?.body, data?.message, data?.text);
        const kind = getStringValue(data?.type, data?.kind) || "general";
        const link =
          getStringValue(data?.link) ||
          (snapId ? `/account/collections/${snapId}` : '') ||
          (threadId ? `/dashboard/buyer?tab=messages&threadId=${threadId}` : '');

        console.log("[SocketContext] notification_created received:", data);

        setState((prev: any) => ({
          ...prev,
          notification: {
            user: prev.notification?.user,
            property: prev.notification?.property,
            message: body || title || "New notification",
            title: title || "New notification",
            body: body || "",
            kind,
            channelId: threadId,
            action: "navigate",
            isVisible: true,
            link,
          },
          notifications: [
            {
              id: data?.id || `socket-notification-${Date.now()}`,
              title: title || "New notification",
              body: body || "",
              createdAt: data?.createdAt || new Date().toISOString(),
              read: false,
              kind: kind || "general",
              link: link || undefined,
              threadId: threadId || undefined,
              snapId: snapId || undefined,
              source: "socket",
            },
            ...(Array.isArray(prev.notifications) ? prev.notifications : []),
          ].slice(0, 50),
        }));

        console.log("[SocketContext] Notification added to state");
      });

      const handleRecentActivityUpdate = (payload: any) => {
        const data = payload?.data || payload;
        const snapId = getStringValue(data?.snapId, data?.snap_id);
        if (!snapId) return;

        const title =
          getStringValue(data?.title, data?.heading) ||
          "New comment in Snapz";
        const body =
          getStringValue(data?.body, data?.message, data?.text) ||
          getStringValue(data?.comment, data?.content) ||
          "";
        const link = `/account/collections/${snapId}`;

        console.log("[SocketContext] recent_activity_update received:", data);

        setState((prev: any) => ({
          ...prev,
          notification: {
            user: prev.notification?.user,
            property: prev.notification?.property,
            message: body || title,
            title,
            body,
            kind: "comment",
            channelId: null,
            action: "navigate",
            isVisible: true,
            link,
          },
          notifications: [
            {
              id: data?.id || `socket-comment-${Date.now()}`,
              title,
              body,
              createdAt: data?.createdAt || new Date().toISOString(),
              read: false,
              kind: "comment",
              link,
              snapId,
              source: "socket",
            },
            ...(Array.isArray(prev.notifications) ? prev.notifications : []),
          ].slice(0, 50),
        }));

        console.log("[SocketContext] Comment notification added to state");
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      };

      socket.on("recent_activity_update", handleRecentActivityUpdate);

      // Handle websocket response events
      socket.on("createOrJoinConversation_response", (response: any) => {
        console.log('[SocketContext] createOrJoinConversation_response:', response);
      });

      socket.on("sendMessage_response", (response: any) => {
        console.log('[SocketContext] sendMessage_response:', response);
      });

      socket.on("joinRoom_response", (response: any) => {
        console.log('[SocketContext] joinRoom_response:', response);
      });

      socket.on("leaveRoom_response", (response: any) => {
        console.log('[SocketContext] leaveRoom_response:', response);
      });

      return () => {
        socket.off("recievedMessage");
        socket.off("invitation_updated");
        socket.off("new_offer_recieved");
        socket.off("newMessage", handleNewMessage);
        socket.off("recievedMessage", handleRecievedMessage);
        socket.off("unread_count_updated", handleUnreadCountUpdated);
        socket.off("notification_created");
        socket.off("recent_activity_update", handleRecentActivityUpdate);
        socket.off("createOrJoinConversation_response");
        socket.off("sendMessage_response");
        socket.off("joinRoom_response");
        socket.off("leaveRoom_response");
      };
    }
  }, [messageThreads, socket, user?.id, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, state, setState }}>
      <IdleTimeout timeout={600000}>{children}</IdleTimeout>
      <NewNotification state={state} socket={socket} setState={setState} />
      {isInvitation && (
        <InvitationNotification
          agentName="Aditi Mehra"
          propertyName="Lakeview Residency"
          data={invitationData}
          onClose={() => {
            setIsInvitation(false);
            setInvitationData(null);
          }}
        />
      )}

      {isOffer && (
        <OfferNotification
          agentName="Aditi Mehra"
          propertyName="Lakeview Residency"
          data={offerData}
          onClose={() => {
            setIsOffer(false);
            setOfferData(null);
          }}
        />
      )}

    </SocketContext.Provider>
  );
}

export default SocketProvider;
