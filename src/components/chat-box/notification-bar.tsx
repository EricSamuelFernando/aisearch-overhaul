"use client"

import { useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import { isUserLoggedIn } from "@/slices/auth/auth.slice"
import { decryptMessage } from "@/utils/math-utilities"
import { useRouter } from "next/navigation"
import { info } from "@/components/alert/notify"

export default function NewNotification(props: any) {
  const { state, setState } = props;
  const router = useRouter();
  const lastToastKeyRef = useRef<string>("")
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

  const hideNotification = useCallback(() => {
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
  }, [setState]);

  const handleNavigate = useCallback(() => {
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
    router.push("/dashboard/chat");
    hideNotification();
  }, [hideNotification, router, setState, state?.notification?.action, state?.notification?.channelId]);

  useEffect(() => {
    const currentNotification = state?.notification;
    if (!isLoggedIn || !currentNotification?.isVisible) return;

    const toastKey = [
      String(currentNotification?.channelId || ""),
      String(currentNotification?.user || ""),
      String(currentNotification?.message || ""),
    ].join("|");

    if (toastKey && lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    info({
      message: currentNotification?.user
        ? `New message from ${currentNotification.user}`
        : "New message",
      subtitle: getDisplayMessage(currentNotification?.message),
      duration: 10000,
      onClick: handleNavigate,
    } as any);

    hideNotification();
  }, [handleNavigate, hideNotification, isLoggedIn, state?.notification]);

  return null;
}
