"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare } from "lucide-react"
import { useSelector } from "react-redux"
import { isUserLoggedIn } from "@/slices/auth/auth.slice"
import { decryptMessage } from "@/utils/math-utilities"
import { useRouter } from "next/navigation"

export default function NewNotification(props: any) {
  const { state, setState } = props;
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true)
  const isLoggedIn = useSelector(isUserLoggedIn)

  const resolveChannelIdForRoute = (rawChannelId: any): string => {
    if (typeof rawChannelId === "string") return rawChannelId.trim();
    if (typeof rawChannelId === "number") return String(rawChannelId);
    if (rawChannelId && typeof rawChannelId === "object") {
      const candidate =
        rawChannelId.threadId ||
        rawChannelId.thread_id ||
        rawChannelId.roomId ||
        rawChannelId.room_id ||
        rawChannelId.conversationId ||
        rawChannelId.conversation_id ||
        rawChannelId.id ||
        rawChannelId._id;
      if (candidate) return String(candidate).trim();
    }
    return "";
  };

  const getDisplayMessage = (rawMessage?: string) => {
    if (!rawMessage) return "You have a new message";
    try {
      const decrypted = decryptMessage(rawMessage);
      return decrypted || rawMessage;
    } catch (error) {
      return rawMessage;
    }
  };

  const hideNotification = () => {
    setIsVisible(false);
    setState((prev: any) => ({
      ...prev,
      notification: {
        user: null,
        property: null,
        message: "",
        channelId: null,
        action: "navigate",
        isVisible: false
      },
    }));
  };

  useEffect(() => {
    setIsVisible(state.notification.isVisible);
    const showTimer = setTimeout(() => {
      hideNotification()
    }, 10000)

    return () => clearTimeout(showTimer)
  }, [state.notification])

  useEffect(() => {
    if (!isVisible || !isLoggedIn) return;
    console.log("[NewNotification] render notification payload:", state?.notification);
  }, [isVisible, isLoggedIn, state?.notification]);

  return (
    <AnimatePresence>
      {isVisible && isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: -12, x: 0, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, x: 0, scale: 0.98 }}
          className="fixed cursor-pointer top-4 right-4 bg-white text-[#171717] border border-[#EAEAEA] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.12)] p-3 w-[22rem] z-[99998]"
        >
          <div className="flex items-start justify-between gap-3"
            onClick={(e) => {
              e.preventDefault();
              const channelId = resolveChannelIdForRoute(state?.notification?.channelId);
              const action = state?.notification?.action;
              if (action === "scroll" && channelId) {
                setState((prev: any) => ({
                  ...prev,
                  scrollToLatestRequest: {
                    threadId: channelId,
                    requestedAt: Date.now(),
                  },
                }));
                hideNotification();
                return;
              }
              if (channelId) {
                const targetPath = `/dashboard/chat/${encodeURIComponent(String(channelId))}?focusLatest=1`;
                const beforePath = `${window.location.pathname}${window.location.search}`;
                router.prefetch(targetPath);
                router.push(targetPath);
                setTimeout(() => {
                  const afterPath = `${window.location.pathname}${window.location.search}`;
                  if (afterPath === beforePath) {
                    window.location.assign(targetPath);
                  }
                }, 1800);
                hideNotification();
                return;
              }
              console.error("[NewNotification] Missing channelId in notification payload:", state?.notification);
              router.push("/dashboard/chat");
              hideNotification();
            }}
          >
            <div className="flex items-start space-x-3 min-w-0">
              <div className="h-12 w-12 rounded-full bg-[#FFF2E8] border border-[#FFD5B8] flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-[#F07639]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#8A8A8A]">New message</p>
                <p className="text-sm font-semibold truncate">{state.notification.user || "Someone"}</p>
                <p className="text-xs text-[#595959] truncate">
                  {getDisplayMessage(state.notification.message)}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                hideNotification();
              }}
              className="text-[#8A8A8A] hover:text-[#171717] shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
