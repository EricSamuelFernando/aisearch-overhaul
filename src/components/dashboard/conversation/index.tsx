'use client'
import React, { useCallback, useContext, useEffect, useState } from "react";
import ConversationBox from "./conversation";
import PropertyTabs from "../user/property-tabs";
import useDebounce from "@/hooks/utils/debounce";
import { SocketContext } from "@/providers/socket.context";

interface Message {
    sender: "Buyer" | "You";
    text?: string;
    timestamp: string;
    type: string;
    file?: any;
}

const ConversationPage = () => {
    const { socket } = useContext(SocketContext);
    const [message, setMessage] = useState('');
    const [input, setInput] = useState("");
    const debounce = useDebounce();
    const [threadInput, setThreadInput] = useState("");
    const [users] = useState(["User1", "User2", "User3", "User4", "User5"]);
    const [isTyping, setIsTyping] = useState(false);
    const [isThreadLoading, setIsThreadLoading] = useState<boolean>(false)
    const [isConversationLoading, setIsConversationLoading] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "Buyer",
            type: "text",
            text: "Of course. How about Wednesday at 3:00 PM? Does that work for your client?",
            timestamp: "2:30 PM",
        },
        {
            sender: "You",
            type: "text",
            text: "Wednesday at 3:00 PM sounds great. I’ll confirm with my client and get back to you shortly.",
            timestamp: "2:30 PM",
        },
        {
            sender: "You",
            type: "file",
            file: {
                name: "example.pdf",
                url: "https://example.com/example.pdf",
                size: "1.2 MB",
            },
            timestamp: "2:35 PM",
        },
    ]);
    // const selectedChannel = localStorage.getItem("selectedChannel");
    // const [selectedConversation,setSelecetdConversation] = useState<string|null>(selectedChannel);
    const sendMessage = () => {
        if (socket && message.trim()) {
            socket.emit('sendMessage', { sender: socket.id, content: message, recipient: "cheeku@mailinator.com" });
            setMessage('');
        }
    };

    const typing = useCallback(
        debounce(() => {
            if (socket) {
                socket.emit('typing',{ user: 'username', typing: false, recipient: "cheeku@mailinator.com" });
            }
        }, 2000),
        []
    );

    const handleTyping = (status: boolean) => {
        if (socket) {
            setIsTyping(status);
            socket.emit('typing', { user: 'username', typing: status, recipient: "cheeku@mailinator.com" });
            typing();
        }
    };

    const filteredUsers = users.filter((user) =>
        user.toLowerCase().includes(threadInput.toLowerCase())
    );
    useEffect(() => {
        if (socket) {
            socket.on('receiveMessage', (newMessage: Message) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            socket.on('typingStatus', (typing: boolean) => {
                setIsTyping(typing)
            });
            return () => {
                socket.off('receiveMessage');
            };
        }
    }, [socket]);

    // useEffect(()=>{
    //     if(socket&&selectedChannel){
            
    //     }
    // },[selectedChannel]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ConversationBox
                messages={messages}
                sendMessage={sendMessage}
                setMessages={setMessages}
                threadInput={threadInput}
                setThreadInput={setThreadInput}
                filteredUsers={filteredUsers}
                message={message}
                setMessage={setMessage}
                isThreadsLoading={isThreadLoading}
                isMessagesLoading={isConversationLoading}
                typingUser={isTyping}
                handleTyping={handleTyping}
            />
        </div>
    );
};

export default ConversationPage;
