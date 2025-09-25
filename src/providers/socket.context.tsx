import { ReactNode, useState, createContext, useEffect, useContext } from "react";
import { isUserLoggedIn, accessToken, userData } from "@/slices/auth/auth.slice";
import { useSelector } from "react-redux";
import socketio, { Socket } from "socket.io-client";
import IdleTimeout from "./IdleTimeout";
import NewNotification from "@/components/chat-box/notification-bar";
import InvitationNotification from "@/components/notifications/invitation";
import OfferNotification from "@/components/notifications/offer";

type SocketContextType = {
  socket: Socket | null;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [isOffer, setIsOffer] = useState(false);
  const [offerData, setOfferData] = useState(null);
  // Auto-connect socket
  useEffect(() => {
    if (isLogin && token && user?.id && !socket) {
      const newSocket = socketio(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 20,
        forceNew: true,
        query: {
          token: `Bearer ${token}`,
        },
        transports: ["websocket", "polling"],
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("userConnected", user?.id);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }

    if (!isLogin && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [isLogin, token, user?.id]);

  // Handle incoming messages
  useEffect(() => {
    if (socket) {
      socket.on("invitation_updated", (data: any) => {
        setIsInvitation(true);
        setInvitationData(data);
      })
      socket.on("new_offer_recieved", (data: any) => {
        setIsOffer(true);
        setOfferData(data);
      })
      socket.on("recievedMessage", (newMessage: Message) => {
        if (newMessage?.threadId !== state.selectedChannel?.id) {
          const existingCount = state.conversationUnreadCount.find((c: any) => c.threadId === newMessage?.threadId)?.count ?? 0;

          setState((prevState: any) => ({
            ...prevState,
            conversationUnreadCount: [
              ...prevState.conversationUnreadCount.filter((c: any) => c.threadId !== newMessage?.threadId),
              { threadId: newMessage?.threadId || null, count: existingCount + 1 },
            ],
            notification: {
              user: newMessage?.user?.userName,
              property: newMessage?.property?.propertyName,
              isVisible: true,
              channelId: newMessage?.threadId,
              message: newMessage?.message,
            },
          }));
        } else {
          setState((prevState: any) => ({
            ...prevState,
            newMessage,
          }));
        }
      });

      return () => {
        socket.off("recievedMessage");
        socket.off("invitation_updated");
        socket.off("new_offer_recieved");
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
