import { userChatStatusOptions } from "@/data/userStatus";
import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "./socket.context";

interface IdleTimeoutProps {
  timeout: number;
  children: React.ReactNode;
}

const IdleTimeout: React.FC<IdleTimeoutProps> = ({ timeout, children }) => {
    const userData = useSelector((state: any) => state.auth);
    const isLogin = !userData?.isLoggedIn;
    const dispatch = useDispatch();  
    const chatStatus: string | undefined = useSelector(
    (state: any) => state?.chat?.onlineUsers?.[state?.auth?.userData?.user?.id]
  );
  const { socket } = useContext(SocketContext);
  const onIdle = (status:any) => {    
    const onlineStatus = status === "active" ? "online" : "away";
    const statusOption = userChatStatusOptions[onlineStatus];
    console.log("new socket",socket);
    
    // Removed user_status_update events - not supported by backend WebSocket handler
    // User status updates should be handled via REST API if needed
  };

  const updatedStatus: { status?: string } | null = JSON.parse(
    localStorage.getItem("online_status") ?? "null"
  );

  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    if (isLogin) {
      let activityTimer: NodeJS.Timeout = setTimeout(() => {}, 0);

      function resetTimer() {
        clearTimeout(activityTimer);
        activityTimer = setTimeout(() => {
          setIsActive(false);
          if (!updatedStatus || (updatedStatus && updatedStatus?.status === "online")) {
            onIdle("inactive");
          }
        }, timeout);
      }

      function handleActivity() {
        
        if (!isActive && chatStatus !== "online" && !updatedStatus) {
          onIdle("active");
          if (!isActive) {
            setIsActive(true);
            clearTimeout(activityTimer);
          }
        }

        resetTimer();
      }

      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);
      window.addEventListener("touchstart", handleActivity);

      resetTimer();

      if (chatStatus === "away") {
        clearTimeout(activityTimer);
      }

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        window.removeEventListener("touchstart", handleActivity);
        clearTimeout(activityTimer);
      };
    }
  }, [timeout, isActive, onIdle, isLogin, chatStatus, updatedStatus]);

  return <>{children}</>;
};

export default IdleTimeout;
