import { ReactNode, useState, createContext, useEffect, useContext } from "react";
import { isUserLoggedIn, accessToken, userData } from "@/slices/auth/auth.slice";
import { useSelector } from "react-redux";
import { WebSocketClient, createWebSocketClient } from "@/lib/websocket-client";
import IdleTimeout from "./IdleTimeout";
import NewNotification from "@/components/chat-box/notification-bar";
import InvitationNotification from "@/components/notifications/invitation";
import OfferNotification from "@/components/notifications/offer";
import { getAuthToken } from "@/lib/storage";

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
    isVisible: false,
  },
  newMessage: null,
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

      // Handle newMessage event from websocket backend (Lambda/API Gateway)
      socket.on("newMessage", (messageData: any) => {
        console.log('[SocketContext] Received newMessage:', messageData);
        const threadId = messageData.threadId || messageData.thread_id;
        
        if (threadId !== state.selectedChannel?.id) {
          const existingCount = state.conversationUnreadCount.find((c: any) => c.threadId === threadId)?.count ?? 0;

          setState((prevState: any) => ({
            ...prevState,
            conversationUnreadCount: [
              ...prevState.conversationUnreadCount.filter((c: any) => c.threadId !== threadId),
              { threadId: threadId || null, count: existingCount + 1 },
            ],
            notification: {
              user: messageData?.userName || messageData?.senderId,
              property: messageData?.propertyName,
              isVisible: true,
              channelId: threadId,
              message: messageData?.message,
            },
          }));
        } else {
          setState((prevState: any) => ({
            ...prevState,
            newMessage: {
              ...messageData,
              threadId: threadId,
            },
          }));
        }
      });

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
        socket.off("newMessage");
        socket.off("createOrJoinConversation_response");
        socket.off("sendMessage_response");
        socket.off("joinRoom_response");
        socket.off("leaveRoom_response");
      };
    }
  }, [socket, state.selectedChannel]);

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
