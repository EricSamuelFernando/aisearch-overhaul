'use client';

import ChatBoxComponent from "@/components/chat-box/chat-box";
import { useAgentConversationApi } from "@/hooks/api/auth/useConversationApi";
import { useUserAgentMessageApi } from "@/hooks/api/auth/useMessageApi";
import { SocketContext } from "@/providers/socket.context";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { use, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ThreadInterface {
    id: string;
    threadName: string;
    propertyId: string;
    buyerAgentId: string;
    sellerAgentId: string;
    unreadCount: number;

}
const ChatBox = () => {
    const router = useRouter();
    const params = useParams()
    const id = params?.id;
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const { socket, state, setState } = useContext(SocketContext)
    const [threads, setThreads] = useState<ThreadInterface[] | []>([]);
    const [isRead, setIsRead] = useState(true);
    const [search, setSearch] = useState("");
    const {
        getAllThreadsMutation,
        getAllThreadsByUserMutation,
    } = useAgentConversationApi()
    const { getAllThreadsByUserAgentMutation } = useUserAgentMessageApi()

    const userData = useSelector((state: { auth: { user: any } }) => state.auth.user);
    const getAllConversationThreads = async () => {
        try {
            getAllThreadsMutation.mutate(null, {
                onSuccess: (data) => {
                    setLoading(false);
                    console.log(data)
                },
                onError: (error) => {
                    console.log("Error in mutation: ", error);
                    setLoading(false);
                },
            })
        } catch (error) {
            console.log("error : ", error);
        }
    }

    const getAllConversationThreadsByUser = async () => {
        try {
            setLoading(true);
            setThreads([]);
            const data = {
                userId: userData?.id,
                threadName: search,
                isRead: isRead
            }
            getAllThreadsByUserMutation.mutate(data, {
                onSuccess: (data) => {
                    setThreads(data?.data?.get_threads_by_user)
                    setLoading(false);
                },
                onError: (error) => {
                    console.log("Error in mutation: ", error);
                    setLoading(false);
                },
            })
        } catch (error) {
            console.log("error : ", error);
        }
    }

    const getAllUserAgentMessageThreadsByUser = async () => {
        try {
            setLoading(true);
            setThreads([]);
            const data = {
                userId: userData?.id,
                threadName: search,
                isRead: isRead
            }
            getAllThreadsByUserAgentMutation.mutate(data, {
                onSuccess: (data) => {
                    setThreads(data?.data?.get_user_and_agent_threads)
                    setLoading(false);
                },
                onError: (error) => {
                    console.log("Error in mutation: ", error);
                    setLoading(false);
                },
            })
        } catch (error) {
            console.log("error : ", error);
        }
    }
    useEffect(() => {
        getAllUserAgentMessageThreadsByUser()
        return () => {
            setState((prev: any) => ({
                ...prev,
                selectedChannel: {
                    id: null,
                    propertyName: ""
                }
            }))
        }
    }, [isRead, search])

    return <>
        <ChatBoxComponent
            threadId={id}
            loading={loading}
            threads={threads}
            search={search}
            setSearch={setSearch}
            isRead={isRead}
            setIsRead={setIsRead}
        />
    </>
};

export default ChatBox;