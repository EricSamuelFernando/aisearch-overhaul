import { ReactNode, useState, createContext, useEffect } from "react";
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
    channelId: null,
    action: "navigate",
    isVisible: false,
  },
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
    if (fullName) return fullName;
    if (firstName) return firstName;
    if (lastName) return lastName;

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
    if (senderFull) return senderFull;
    if (senderFirst) return senderFirst;
    if (senderLast) return senderLast;

    const explicitName = getStringValue(
      ...explicitNameKeys.map((key) => container?.[key]),
      senderObject?.name,
      container?.user?.name,
      container?.user?.firstName,
      container?.user?.first_name,
      container?.sender,
    );
    if (explicitName) return explicitName;
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
  if (deepFullName) return deepFullName;
  if (deepFirstName) return deepFirstName;
  if (deepLastName) return deepLastName;

  const deepExplicitName = findStringByKeysDeep(messageData, [
    "senderName",
    "sender_name",
    "senderFullName",
    "sender_full_name",
    "name",
  ]);
  if (deepExplicitName) return deepExplicitName;

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
  const SOCKET_URL = process.env.NEXT_PUBLIC_AUTH_SERIVCE_SOCKET_URL || "http://localhost:4000";
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
        const notificationSenderName = getStringValue(socketResolvedSenderName, threadResolvedSenderName, "Someone");

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
            !isSelfMessage && !isCurrentThreadOpen;

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
                message: resolveNotificationMessage(messageData),
              }
              : prevState.notification,
            newMessage: isCurrentThreadOpen
              ? {
                ...messageData,
                threadId: threadId,
              }
              : prevState.newMessage,
          };
        });
      };

      const handleNewMessage = (messageData: any) => handleIncomingMessage(messageData, "newMessage");
      const handleRecievedMessage = (messageData: any) => handleIncomingMessage(messageData, "recievedMessage");

      socket.on("newMessage", handleNewMessage);
      socket.on("recievedMessage", handleRecievedMessage);

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
        socket.off("createOrJoinConversation_response");
        socket.off("sendMessage_response");
        socket.off("joinRoom_response");
        socket.off("leaveRoom_response");
      };
    }
  }, [messageThreads, socket, user?.id]);

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
