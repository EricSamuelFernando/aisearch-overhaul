"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import EmojiPicker from "emoji-picker-react"
import {
    ChevronLeft,
    Search,
    HandHelpingIcon as Help,
    MoreVertical,
    Send,
    Star,
    Wifi,
    CookingPotIcon as Kitchen,
    Car,
    Wind,
    Maximize2,
    X,
    MessageCircle,
    Paperclip,
    Download,
    FileText,
    Smile,
    FolderOpenDot,
    Play,
    SendHorizontal,
    CircleCheck,
    ZoomIn,
    ZoomOut,
    Eye,
    Maximize,
    Plus,
} from "lucide-react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import FavoriteBorder from "@mui/icons-material/FavoriteBorder"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { Badge } from "@/components/ui/badge"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import useDebounce from "@/hooks/utils/debounce"
import { useSelector } from "react-redux"
import KingBedIcon from "@mui/icons-material/KingBed"
import BathtubIcon from "@mui/icons-material/Bathtub"
import type { RootState } from "@/lib/store"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format, isSameDay, subDays } from "date-fns"
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env"
import { SocketContext } from "@/providers/socket.context"
import { useAgentConversationApi } from "@/hooks/api/auth/useConversationApi"
import { FaHome, FaMapMarkerAlt } from "react-icons/fa"
import { decryptMessage, encryptMessage, generateColorFromName } from "@/utils/math-utilities"
import { useMessagesApi } from "@/hooks/api/useFetchMessages"
import { useUserAgentMessageApi } from "@/hooks/api/auth/useMessageApi"
import InviteUserModal from "./Invite-user-modal"
import { threadId } from "worker_threads"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

interface User {
    id: string
    username: string
    message: string
    image: string
}
interface Message {
    createdAt?: any;
    fileType?: string;
    messageType?: string;
    threadId: string
    message: string;
    isRead?: boolean;
    senderId: string;
    id?: string
    receiverId: string
    timestamp?: string
    seen?: boolean
    parentMessageId?: string | null
    file?: {
        name?: string
        url?: string
        type?: string
    }
}
export interface MediaPreview {
    type: string;
    url: string;
    name?: string;
    loaded?: boolean;
    loading?: boolean;
    error?: boolean;
}
interface Thread {
    id: string
    threadName?: string
    image?: string;
    propertyName?: string;
    message?: string
    lastSeen?: string
    unreadCount?: number
    propertyAddress?: string
    propertyId?: string
    listingId?: string
    participants?: any
    user?: {
        id?: string
        firstName?: string
        lastName?: string
    }
    buyerAgent?: {
        id?: string
        firstName?: string
        lastName?: string
    }
    sellerAgent?: {
        id?: string
        firstName?: string
        lastName?: string
    }
    lastMessage?: string
    lastMessageAt?: string | null
    isTyping?: boolean
    members?: any[]
    threadId?: string | null
    isActive?: boolean
}
interface PropertyData {
    media?: {
        primaryListingImageUrl?: string
    }
    listingId?: string
    property?: {
        bathroomsTotal?: number
        bedroomsTotal?: number
    }
    address?: {
        unparsedAddress?: string
    }
    courtesyOf?: string
    publicRemarks?: string
}

export default function ConversationPage(props: any) {
    const { threads, setIsRead, setSearch, loading, threadId } = props
    const router = useRouter()
    const { socket, state, setState } = useContext(SocketContext)
    const [isDetails, setIsDetails] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [activeButton, setActiveButton] = useState("all")
    const toggleDropdown = () => setIsDropdownOpen((prev) => !prev)
    const closeDropdown = () => setIsDropdownOpen(false)
    const [message, setMessage] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [fileErrorMsg, setFileErrorMsg] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedChannel, setSelectedChannel] = useState<Thread | null>(null)
    const propertyDetails = useSelector((state: { property: any }) => state.property)
    const userData = useSelector((state: RootState) => state.auth.user)
    const [receiverId, setRecieverId] = useState<string>("")
    const [messageLoading, setMessageLoading] = useState(false)
    const [showThreads, setShowThreads] = useState(true)
    const [receiverDetail, setRecieverDetail] = useState<any>({})
    const [senderDetail, setSenderDetail] = useState<any>({})
    const [showChat, setShowChat] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [propertyData, setPropertyData] = useState<any>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [allMediaFiles, setAllMediaFiles] = useState<{ type?: string, url?: string, name?: string }[]>([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const debounce = useDebounce()
    const imageTypes = ["image/jpeg", "image/png", "image/jpg"]
    const scrollRef = useRef<HTMLDivElement>(null)
    const [selectedThread, setSelectedThread] = useState<any>("")
    const [threadParticipants, setThreadParticipant] = useState<any>([])
    const [selectedThreadDetail, setSelectedThreadDetail] = useState<any>("")
    const [showMore, setShowMore] = useState(false);
    const pathname = useSearchParams();
    const messagesEndRef = useRef(null);
    const [firstTime, setFirstTime] = useState(false);
    const TYPE = pathname.get('type');
    const scrollContainerRef = useRef(null);
    const imageMimeType = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
        "image/bmp",
        "image/svg+xml",
        "image/tiff",
        "image/x-icon",
        "image/heic",
        "image/heif",
    ]
    const videoMimeType = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-ms-wmv",
        "video/x-flv",
        "video/x-matroska",
        "video/3gpp",
        "video/mp2t",
        "video/x-m4v",
    ]
    const {
        getAllConversationMessagesMutation,
        getConversationMessagesMutation
    } = useAgentConversationApi()
    const { getAllUserAgentMessagesMutation } = useUserAgentMessageApi()
    const { getThreadById } = useAgentConversationApi()

    const getThreadDetails = async (id: string) => {
        getThreadById.mutateAsync(id ?? threadId, {
            onSuccess: async (data: any) => {
                const participants = await [
                    ...(data?.buyerAgent ? [data.buyerAgent] : []),
                    ...(data?.sellerAgent ? [data.sellerAgent] : []),
                    ...(data?.user ? [data.user] : []),
                    ...(Array.isArray(data?.participants) ? data.participants.map((p: any) => p.user) : []),
                ];
                handleThreadSelection(data)
            }
        })
    }
    const handleThreadSelection = (thread: Thread) => {
        console.log("Thread data : ", thread);
        if (selectedChannel === thread) return null
        setIsDetails(false)
        setShowThreads(false)
        setShowChat(true)
        setSelectedThreadDetail(thread)
        if (socket) {
            socket.emit("joinThread", thread?.id);
        }
        setSelectedThread(thread?.id)
        // if (TYPE === "messages") {
        getAllConversationThreads(thread?.id)
        if (userData?.id === thread?.buyerAgent?.id) {
            setRecieverId(thread?.user?.id || "")
            setRecieverDetail(thread?.user)
        }
        if (userData?.id === thread?.sellerAgent?.id) {
            setRecieverId(thread?.user?.id || "")
            setRecieverDetail(thread?.user)
        }
        else if (userData?.id === thread?.user?.id) {
            setRecieverId(thread?.buyerAgent?.id || "")
            setRecieverDetail(thread?.buyerAgent)
        }
        // }
        // else {
        //   getAllConversationThreads(thread?.id)
        //   if (userData?.id === thread?.buyerAgent?.id) {
        //     setRecieverId(thread?.sellerAgent?.id || "")
        //   }
        //   else {
        //     setRecieverId(thread?.buyerAgent?.id || "")
        //   }
        // }
        getPropertyDetails(thread?.listingId, thread.propertyId)
        setState((prev: any) => ({
            ...prev,
            selectedChannel: {
                id: thread?.id,
                propertyName: thread.propertyName,
            }
        }))
    }

    const handleEmojiClick = (emoji: any) => {
        setMessage((prev) => prev + emoji.emoji);
    };
    const handleBackToThreads = () => {
        setShowThreads(true)
        setShowChat(false)
        setSelectedChannel(null)
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [])

    const typing = useCallback(
        debounce((id) => {
            if (socket) {
                socket.emit("typing", { user: "username", typing: false, recipient: id })
            }
        }, 2000),
        [],
    )

    const getAllConversationThreads = async (threadId: string) => {
        try {
            setMessages([])
            getConversationMessagesMutation.mutate(threadId, {
                onSuccess: (data) => {
                    setMessages(data?.data?.conversationsByThread)
                },
                onError: (error) => {
                    console.log("Error in mutation: ", error)
                },
            })
        } catch (error) {
            console.log("error : ", error)
        }
    }

    const getAllThreadMessage = async (threadId: string) => {
        try {
            setMessages([]);
            getAllUserAgentMessagesMutation.mutate(threadId, {
                onSuccess: (data) => {
                    const decryptedMessages = data?.data?.messagesByThread?.map((message: Message) => {
                        const decryptedMessage = decryptMessage(message.message);
                        return {
                            ...message,
                            message: decryptedMessage,
                        };
                    });
                    setMessages(decryptedMessages || []);
                },
                onError: (error) => {
                    console.log("Error in mutation: ", error);
                },
            });
        } catch (error) {
            console.log("error: ", error);
        }
    };

    const handleSearch = useCallback(
        debounce((value: string) => {
            setSearch(value)
        }, 1000),
        [],
    )

    const handleTyping = (status: boolean) => {
        if (socket) {
            socket.emit("typing", { user: "username", typing: status, recipient: receiverId })
            setTimeout(() => {
                socket.emit("typing", { user: "username", typing: false, recipient: receiverId })
            }, 1000);
            typing(receiverId)
        }
    }

    const handleZoom = (zoomIn: boolean) => {
        if (zoomIn) {
            setZoomLevel(prev => Math.min(prev + 0.25, 3));
        } else {
            setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
        }
    };

    const closeMediaPreview = () => {
        setMediaPreview(null);
        setZoomLevel(1);
    };

    const openMediaPreview = useCallback((fileUrl: string, fileType: string) => {
        if (fileUrl) {
            setMediaPreview({
                type: fileType || '',
                url: fileUrl,
                name: fileType.split('/')[1] || 'media',
                loading: true
            });

            if (fileType && imageMimeType.includes(fileType)) {
                if (fileUrl.startsWith('data:')) {
                    setZoomLevel(1);
                    setMediaPreview({
                        type: fileType,
                        url: fileUrl,
                        name: fileType.split('/')[1] || 'media',
                        loaded: true
                    });
                    return;
                }

                const img = document.createElement('img');
                img.crossOrigin = "anonymous";
                img.src = fileUrl;

                img.onload = () => {
                    setZoomLevel(1);
                    setMediaPreview({
                        type: fileType,
                        url: fileUrl,
                        name: fileType.split('/')[1] || 'media',
                        loaded: true
                    });
                };

                img.onerror = (e) => {
                    console.error("Failed to load image:", e);

                    const imgFallback = document.createElement('img');
                    imgFallback.src = fileUrl;

                    imgFallback.onload = () => {
                        setZoomLevel(1);
                        setMediaPreview({
                            type: fileType,
                            url: fileUrl,
                            name: fileType.split('/')[1] || 'media',
                            loaded: true
                        });
                    };

                    imgFallback.onerror = () => {
                        console.error("All loading attempts failed for image");
                        setMediaPreview({
                            type: fileType,
                            url: '/placeholder.jpg',
                            name: fileType.split('/')[1] || 'media',
                            loaded: false,
                            error: true
                        });
                    };
                };
            } else {
                setZoomLevel(1);
                setMediaPreview({
                    type: fileType || '',
                    url: fileUrl,
                    name: fileType.split('/')[1] || 'media',
                    loading: false
                });
            }
            const index = allMediaFiles.findIndex(mediaFile =>
                mediaFile.url === fileUrl
            );

            if (index !== -1) {
                setCurrentMediaIndex(index);
            }
        }
    }, [allMediaFiles, imageMimeType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (file) {
            setFileErrorMsg("")
            setSelectedFile(null)

            const validTypes = ["image/jpeg", "image/png", "application/pdf"]
            const maxSize = 5 * 1024 * 1024

            if (!validTypes.includes(file.type)) {
                setFileErrorMsg("Invalid file type. Only JPG, PNG, and PDF are allowed.")
                return
            }
            if (file.size > maxSize) {
                setFileErrorMsg("File size exceeds the 5MB limit.")
                return
            }

            setSelectedFile(file)
        }
    }

    const getPropertyDetails = async (id: any, propertyId: any) => {
        try {
            setMessageLoading(true)
            setPropertyData(null)
            const payload = {
                listingId: parseInt(id) || "",
                propertyId: parseInt(propertyId)
            }
            const response = await fetch(PROPERTY_DETAIL_SEARCH_AI_URL || "http://13.60.114.186:9000/api/search/preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            setPropertyData(data?.data)
            setMessageLoading(false)
            // setIsDetails(true)
            setShowDetails(true)
            return data
        } catch (error) {
            console.log("error : ", error)
        }
        setMessageLoading(false)
    }

    function isToday(date: Date): boolean {
        const today = new Date();
        return isSameDay(date, today);
    }

    function isYesterday(date: Date): boolean {
        const yesterday = subDays(new Date(), 1);
        return isSameDay(date, yesterday);
    }

    const saveAllMessages = () => {
        if (socket) {
            const threadId = pathname.get('threadId')
            socket.emit("save_user_agent_messages", threadId);
        }
    }

    useEffect(() => {
        if (socket) {
            // socket?.on('thread_marked_as_read', (data: any) => {
            //   if (selectedThread === data?.threadId) {
            //     // setAllMessages(allMessages);
            //     const updatedMessages = allMessages.map((msg) =>
            //       msg.isRead ? msg : { ...msg, isRead: true }
            //     );
            //     setAllMessages(updatedMessages);
            //   }
            // })
            // socket.on("recievedMessage", (newMessage: Message) => {
            //   // setShowNewMessageTag(true)
            //   console.log("Data : ", selectedThread, newMessage);
            //   setMessages(prevMessages => [newMessage, ...prevMessages]);
            // })
            socket.on("typingStatus", (typing: boolean) => {
                setIsTyping(typing)
            })
            const interval = setInterval(saveAllMessages, 5000);
            return () => {
                socket.off("recievedMessage")
                socket.off("thread_marked_as_read")
                clearInterval(interval);
                saveAllMessages();
            }
        }
        return () => {
            setState((prev: any) => ({
                ...prev,
                selectedChannel: {
                    id: null,
                    propertyName: ""
                }
            }))
        }
    }, [socket])

    useEffect(() => {
        if (socket) {
            socket.emit("joinThread", selectedThread);
        }
    }, [selectedThread])

    useEffect(() => {
        if (socket) {
            socket.on("recievedMessage", (newMessage: Message) => {
                setMessages((prevMessages) => [newMessage, ...prevMessages])
            })
            socket.on("typingStatus", (typing: boolean) => {
                setIsTyping(typing)
            })
            return () => {
                socket.off("recievedMessage")
                socket.off("typingStatus");
            }
        }
        return () => {
            setState((prev: any) => ({
                ...prev,
                selectedChannel: {
                    id: null,
                    propertyName: ""
                }
            }))
        }
    },
        [socket])
    useEffect(() => {

        const handleUnload = () => {
            if (socket) {
                // if (TYPE === "messages") {
                const threadId = pathname.get('threadId')
                socket.emit("save_user_agent_messages", threadId);
                // }
                // else {
                //   socket.emit("save_messages");
                // }
            }
        };

        // Trigger save when the user tries to refresh or close the page
        window.addEventListener("beforeunload", handleUnload);

        // Trigger save when the user presses the back button
        window.addEventListener("popstate", handleUnload);

        // Clean up the event listeners when the component unmounts
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            window.removeEventListener("popstate", handleUnload);
        };
    }, [socket]
    );

    useEffect(() => {
        if (state?.newMessage) {
            const message = decryptMessage(state?.newMessage?.message)
            state.newMessage.message = message;
            setMessages((prevMessages) => [state.newMessage, ...prevMessages])
            setState((prev: any) => ({
                ...prev,
                newMessage: null
            }))
        }
    }, [state.newMessage])

    useEffect(() => {
        if (threadId) {
            getThreadDetails(threadId);
        }
    }, [threadId]);

    // Predefined light colors for consistent user avatars
    const lightColors = ["bg-blue-200", "bg-green-200", "bg-red-200", "bg-yellow-200", "bg-purple-200"];

    // Function to pick a static color based on the user's name
    const getStaticColor = (name: string) => {
        const index = name?.charCodeAt(0) % lightColors.length;
        return lightColors[index];
    };

    // Function to generate initials from name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="mt-24 max-w-full overflow-hidden">
            <header className="border-b px-2 sm:px-4 py-2 flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4" onClick={() => router.push("/dashboard/buyer")}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <span className="font-semibold text-sm sm:text-base">Back</span>
                </div>
                <div className="flex justify-center items-center w-full max-w-[65%] sm:max-w-xl">
                    <div className="shadow relative flex w-full bg-white-100 h-8 sm:h-10 rounded-full">
                        <Search className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                        <Input
                            placeholder="Search"
                            className="pl-8 sm:pl-12 pr-2 sm:pr-4 bg-transparent text-gray-700 placeholder-gray-500 w-full focus:outline-none appearance-none border-0 text-xs sm:text-sm"
                            onChange={(e) => {
                                handleSearch(e.target.value)
                            }}
                        />
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                    <Help className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </header>
            <section>
                <div className="flex flex-col border-l md:flex-row bg-gray-100 h-[calc(100vh-9rem)] max-h-[calc(100vh-9rem)]">
                    {/* Threads Section */}
                    <div className={`w-full md:w-96 bg-white border-r ${showThreads ? "block" : "hidden md:block"} overflow-hidden`}>
                        <div className="p-3 sm:p-4 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-sm sm:text-base">Messages</h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                            </Button>
                        </div>

                        <div className="p-2 sm:p-4 border-b flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                            <div className="flex w-full sm:w-60 gap-2 rounded-full bg-gray-100 p-1 shadow-sm">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsRead(false)
                                        setActiveButton("all")
                                    }}
                                    className={`h-8 sm:h-10 w-full text-xs sm:text-sm text-gray-600 rounded-full px-2 sm:px-4 py-1 sm:py-2 ${activeButton === "all" ? "bg-white shadow text-gray-800" : ""
                                        }`}
                                >
                                    All
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsRead(true)
                                        setActiveButton("unread")
                                    }}
                                    className={`h-8 sm:h-10 w-full text-xs sm:text-sm text-gray-600 rounded-full px-2 sm:px-4 py-1 sm:py-2 ${activeButton === "unread" ? "bg-white shadow text-gray-800" : ""
                                        }`}
                                >
                                    Unread
                                </Button>
                            </div>
                            {/* <Button
                                size="sm"
                                variant="outline"
                                // onClick={() => setInviteOpen(true)}
                                className="h-8 sm:h-10 w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm"
                            >
                                Invite an agent &nbsp; <Plus size={14} className="sm:size-4" />
                            </Button> */}
                        </div>
                        {props?.loading ? <div className="flex items-center justify-center h-32">
                            <svg
                                className="animate-spin h-6 w-6 text-orange-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                ></path>
                            </svg>
                        </div> : <ScrollArea className="overflow-auto gap-2 mb-12 h-[calc(96vh-15rem)] sm:h-[calc(96vh-16rem)] w-full p-2 sm:p-4 bg-white">
                            {threads?.length ? (
                                threads?.map((thread: Thread) => {
                                    return (
                                        <div
                                            key={thread.id}
                                            className={`relative flex w-full mt-2 items-center gap-2 rounded-md sm:gap-3 p-2 sm:p-4 bg-gray-50 ${selectedThreadDetail?.id === thread?.id ? 'border border-2 border-dashed border-orange-400' : ""}hover:border hover:border-2 hover:border-dashed hover:border-orange-400 hover:shadow-xl cursor-pointer transition`}
                                            onClick={() => handleThreadSelection(thread)}
                                        >
                                            {/* Last Seen Timestamp (Top Right Corner) */}
                                            <span className="absolute me-2  sm:me-6 top-1 sm:top-2 right-1 sm:right-3 text-[8px] sm:text-xs text-gray-400 ">
                                                20 mins ago
                                            </span>

                                            {/* User Avatar (Image or Initials) */}
                                            {thread?.image ? (
                                                <Image
                                                    src={thread?.image || "/placeholder.svg"}
                                                    alt="User Avatar"
                                                    width={50}
                                                    height={50}
                                                    priority
                                                    unoptimized
                                                    className="rounded-full object-cover w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px] flex-shrink-0"
                                                />
                                            ) : (
                                                <div
                                                    className={`rounded-full flex items-center justify-center text-gray-700 font-semibold text-xs sm:text-sm w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px] flex-shrink-0 ${getStaticColor(thread.threadName || "")}`}
                                                >
                                                    {getInitials(thread.propertyName || "")}
                                                </div>
                                            )}

                                            {/* Thread Details */}
                                            <div className="flex-1 min-w-0">
                                                {/* Name Section */}
                                                <p className="font-semibold color-white text-xs sm:text-sm md:text-base truncate">
                                                    {thread.buyerAgent?.firstName} {thread.buyerAgent?.lastName}
                                                    {thread.sellerAgent && ` & ${thread.sellerAgent?.firstName} ${thread.sellerAgent?.lastName}`}
                                                </p>

                                                <p className="text-[10px] sm:text-xs text-gray-500 truncate w-[120px] sm:w-[160px] md:w-[200px]">
                                                    {thread?.message}
                                                </p>

                                                {/* Capsules Section */}
                                                <div className="text-[8px] sm:text-xs flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                                                    {/* Property Capsule */}
                                                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-1 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs h-4 sm:h-6">
                                                        <FaHome className="text-green-600 text-[8px] sm:text-xs" />
                                                        <span className="truncate max-w-[60px] sm:max-w-[100px]">{thread?.propertyName}</span>
                                                    </span>

                                                    {/* Location Capsule */}
                                                    <span className="flex items-center gap-1 bg-[#FAF9F5] text-gray-600 px-1 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs h-4 sm:h-6">
                                                        <FaMapMarkerAlt className="text-gray-500 text-[8px] sm:text-xs" />
                                                        <span className="truncate max-w-[60px] sm:max-w-[100px]">{thread?.propertyAddress}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Unread Count Badge */}
                                            {(thread.unreadCount || 0) > 0 && (
                                                <Badge className="text-[8px] sm:text-xs md:text-sm text-black bg-white px-1 sm:px-2 py-0.5 sm:py-1 me-2 sm:me-6 h-4 sm:h-6 min-w-4 sm:min-w-6 flex items-center justify-center">
                                                    {thread.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center mt-6 text-gray-400">
                                    <p className="text-sm sm:text-lg font-semibold">No threads available</p>
                                    <p className="text-xs sm:text-sm">It seems like you have not started any conversations yet.</p>
                                </div>
                            )}
                        </ScrollArea>}
                    </div>

                    {/* Chat Section */}
                    <div
                        className={`flex-1 flex flex-col bg-[#FAF9F5]  ${showChat ? "block" : "hidden md:block"} max-h-full overflow-hidden`}
                    >
                        {/* Mobile Header for Chat */}
                        <header className="border-b px-3 py-2 mt-4 flex items-center justify-between md:hidden">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToThreads}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold text-sm truncate max-w-[200px]">
                                    {state?.selectedChannel?.propertyName || ""}
                                </span>
                            </div>
                        </header>

                        <div className="flex-1 bg-gray-50 mt-2 flex">
                            {state.selectedChannel.id ? (
                                <div className=" flex-1 flex flex-col max-h-full overflow-hidden">
                                    {!messageLoading ? (
                                        <>
                                            <div className="p-2 sm:p-4 border-b flex justify-between items-center flex-wrap sm:flex-nowrap gap-2">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {userData?.profile ? (
                                                        <Image
                                                            src={userData.profile || "/placeholder.svg"}
                                                            alt="User Avatar"
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full object-cover w-8 h-8 sm:w-10 sm:h-10"
                                                            priority
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-300 text-white text-xs sm:text-sm font-semibold rounded-full">
                                                            {getInitials(userData?.firstname || "")}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-full">
                                                                {userData?.firstname} {userData?.lastname}
                                                            </span>
                                                            <span className="text-[10px] sm:text-xs text-green-500">Online</span>
                                                        </div>
                                                        {isTyping && <span className="text-xs sm:text-sm text-green-600">Typing...</span>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <Image
                                                            src={propertyData?.media?.primaryListingImageUrl || "/placeholder.jpg"}
                                                            alt="Property"
                                                            width={48}
                                                            height={32}
                                                            className="rounded-lg object-cover w-12 h-8 sm:w-16 sm:h-10"
                                                            priority
                                                            unoptimized
                                                        />
                                                        <div className="hidden sm:block">
                                                            <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px] inline-block">
                                                                {propertyData?.courtesyOf}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* <div className="relative">
                            <button className="p-1 sm:p-2 rounded-full hover:bg-gray-100" onClick={() => {
                              toggleDropdown()
                            }}>
                              <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            {isDropdownOpen && (
                              <div
                                className="absolute right-0 mt-2 w-36 sm:w-48 bg-white rounded-md shadow-lg border z-50"
                                onMouseLeave={closeDropdown}
                              >
                                <ul className="py-1">
                                  <li>
                                    <button
                                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        closeDropdown()
                                        setIsDetails(!isDetails)
                                        setBuyerFaq(false)
                                        setSellerFaq(false)
                                        setShowDetails(!showDetails)
                                      }}
                                    >
                                      Property Details
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        closeDropdown()
                                        getAllFaqData()
                                        setBuyerFaq(true)
                                        setIsDetails(false);
                                        setSellerFaq(false)
                                      }}
                                    >
                                      Buyer FAQ Details
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        closeDropdown()
                                        setBuyerFaq(false)
                                        setIsDetails(false);
                                        setSellerFaq(true)
                                        getAllSeelerFaqData()
                                      }}
                                    >
                                      Seller FAQ Details
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div> */}
                                                </div>
                                            </div>

                                            <div className="relative bg-gray-50">
                                                <ScrollArea
                                                    ref={scrollContainerRef}
                                                    className="ms-2 me-2 sm:ms-5 sm:me-5 overflow-auto h-[calc(96vh-16rem)] sm:h-[calc(96vh-16rem)]"
                                                >
                                                    <div className="space-y-2 bg-[##F7F2EB] sm:space-y-4 py-2">

                                                        {/* Messages */}
                                                        {messages.length > 0 ? (
                                                            [...messages].reverse().map((message, index, arr) => {
                                                                const isSender = message.senderId === userData?.id;
                                                                const isLastMessage = index === messages.length - 1;
                                                                const messageDate = new Date(message.createdAt);
                                                                const showDateHeader =
                                                                    index === 0 ||
                                                                    format(new Date(arr[index - 1].createdAt), "yyyy-MM-dd") !==
                                                                    format(messageDate, "yyyy-MM-dd");

                                                                const displayDate = isToday(messageDate)
                                                                    ? "Today"
                                                                    : isYesterday(messageDate)
                                                                        ? "Yesterday"
                                                                        : format(messageDate, "dd MMM yyyy");

                                                                return (
                                                                    <div key={message.id || index}>
                                                                        {/* Day Separator */}
                                                                        {showDateHeader && (
                                                                            <div className="text-center py-2">
                                                                                <span className="text-gray-500 text-xs sm:text-sm font-medium bg-white px-3 py-1 rounded-full shadow">
                                                                                    {displayDate}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Message Bubble */}
                                                                        <div
                                                                            className={`flex gap-2 sm:gap-3 mt-2 sm:mt-4 items-start ${isSender ? "justify-end" : ""
                                                                                }`}
                                                                            ref={isLastMessage ? messagesEndRef : null}
                                                                        >
                                                                            {/* Avatar */}
                                                                            {!isSender && (
                                                                                <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-300 text-white text-xs sm:text-sm font-semibold rounded-full shrink-0">
                                                                                    {getInitials(userData?.firstname || "")}
                                                                                </div>
                                                                            )}

                                                                            <div
                                                                                className={`relative p-2 font-medium rounded-2xl shadow max-w-[75%] sm:max-w-[80%] text-xs sm:text-sm ${isSender ? "bg-black text-white" : "bg-white"
                                                                                    }`}
                                                                            >
                                                                                {/* Message content */}
                                                                                {message.messageType !== "file" && (
                                                                                    <p className="break-words">{message.message}</p>
                                                                                )}

                                                                                {/* File message */}
                                                                                {message.messageType === "file" && (
                                                                                    <div className="rounded-lg flex items-center gap-2 sm:gap-3 mt-1">
                                                                                        {message.fileType && imageMimeType.includes(message.fileType) ? (
                                                                                            <div
                                                                                                className="relative cursor-pointer group"
                                                                                                onClick={() =>
                                                                                                    openMediaPreview(message.message, message.fileType || "")
                                                                                                }
                                                                                            >
                                                                                                <Image
                                                                                                    src={message.message || ""}
                                                                                                    alt="Uploaded Image"
                                                                                                    width={140}
                                                                                                    height={140}
                                                                                                    unoptimized
                                                                                                    priority
                                                                                                    className="rounded-lg max-w-[100px] sm:max-w-[120px] hover:opacity-90 transition-opacity"
                                                                                                />
                                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                                                                    <Maximize className="w-4 h-4 text-white" />
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : message.fileType &&
                                                                                            videoMimeType?.includes(message.fileType) ? (
                                                                                            <video
                                                                                                controls
                                                                                                className="rounded-lg max-w-[100px] sm:max-w-[120px]"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openMediaPreview(message.message, message.fileType || "");
                                                                                                }}
                                                                                            >
                                                                                                <source src={message.message} type={message.fileType} />
                                                                                                Your browser does not support the video tag.
                                                                                            </video>
                                                                                        ) : (
                                                                                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                                                                                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                                                                                                <span className="truncate max-w-[100px] sm:max-w-full">
                                                                                                    {message.message.slice(0, 20)}
                                                                                                </span>
                                                                                                <a
                                                                                                    href={message.message}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="text-blue-500 hover:underline"
                                                                                                >
                                                                                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                                                                                                </a>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* Timestamp and read indicator */}
                                                                                <div className="flex justify-end items-center gap-1 mt-1">
                                                                                    <span className="text-[10px] sm:text-xs text-gray-400">
                                                                                        {message.createdAt
                                                                                            ? format(new Date(message.createdAt), "HH:mm")
                                                                                            : format(new Date(), "HH:mm")}
                                                                                    </span>
                                                                                    {isSender && (
                                                                                        <span className="text-blue-500 inline-flex">
                                                                                            {message.isRead ? (
                                                                                                <CircleCheck className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 text-white rounded-lg" />
                                                                                            ) : (
                                                                                                <CircleCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                                                            )}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Sender avatar */}
                                                                            {isSender && (
                                                                                <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-300 text-white text-xs sm:text-sm font-semibold rounded-full shrink-0">
                                                                                    {getInitials(userData?.firstname || "")}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-center text-xs sm:text-sm text-gray-500">No messages yet.</p>
                                                        )}

                                                        {selectedFile && (
                                                            <div className="mx-4 mt-2 mb-3 relative">
                                                                <div className="bg-gray-100 rounded-lg p-3 pr-10">
                                                                    <div className="flex items-start">
                                                                        {selectedFile.type && imageTypes.includes(selectedFile.type) ? (
                                                                            <div className="mr-3">
                                                                                <div className="w-16 h-16 sm:w-20 sm:h-20 relative bg-[#FAF9F5] rounded-md overflow-hidden">
                                                                                    <img
                                                                                        src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                                                                                        alt="Preview"
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ) : selectedFile.type && selectedFile.type.startsWith("video/") ? (
                                                                            <div className="mr-3">
                                                                                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[#FAF9F5] rounded-md relative">
                                                                                    <Play className="w-8 h-8 text-gray-500" />
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="mr-3">
                                                                                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[#FAF9F5] rounded-md">
                                                                                    <FileText className="w-8 h-8 text-gray-500" />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 capitalize">{selectedFile.type.split("/")[0]}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        className="absolute top-3 right-3 p-1 rounded-full hover:bg-[#FAF9F5] text-gray-500"
                                                                        onClick={() => setSelectedFile(null)}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>

                                        </>
                                    ) : (
                                        <>
                                            <div className="flex mt-5 justify-center items-center h-40">
                                                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-blue-500"></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* <div className="text-center mt-6 text-gray-400">
                            <p className="text-lg font-semibold">No thread is Selected</p>
                            <p className="text-sm">It seems like you haven't started any conversations yet.</p>
                        </div> */}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Property Details Section */}

                </div>
            </section>
            {/* Media Preview Modal */}
            {mediaPreview && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <button
                            onClick={closeMediaPreview}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white z-20"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Navigation controls */}
                        {/* {allMediaFiles.length > 1 && (
              <>
                <button
                  onClick={goToPrevMedia}
                  disabled={currentMediaIndex === 0}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full ${currentMediaIndex === 0 ? 'bg-gray-500/30 cursor-not-allowed' : 'bg-black/50 hover:bg-black/70 cursor-pointer'} text-white z-20`}
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNextMedia}
                  disabled={currentMediaIndex === allMediaFiles.length - 1}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full ${currentMediaIndex === allMediaFiles.length - 1 ? 'bg-gray-500/30 cursor-not-allowed' : 'bg-black/50 hover:bg-black/70 cursor-pointer'} text-white z-20`}
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </>
            )} */}

                        {/* Zoom controls for images */}
                        {mediaPreview.type &&
                            imageMimeType.includes(mediaPreview.type) &&
                            !mediaPreview.loading &&
                            !mediaPreview.error && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2 z-20">
                                    <button
                                        onClick={() => handleZoom(false)}
                                        className="text-white hover:text-gray-200"
                                        disabled={zoomLevel <= 0.5}
                                    >
                                        <ZoomOut className="h-5 w-5" />
                                    </button>
                                    <span className="text-white text-sm">{Math.round(zoomLevel * 100)}%</span>
                                    <button
                                        onClick={() => handleZoom(true)}
                                        className="text-white hover:text-gray-200"
                                        disabled={zoomLevel >= 3}
                                    >
                                        <ZoomIn className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm z-20 max-w-[80%] truncate">
                            {mediaPreview.name || "Media Preview"}
                        </div>

                        <div className="max-w-full max-h-full overflow-auto">
                            {/* Loading indicator */}
                            {mediaPreview.loading && (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                                    <p className="text-white text-sm">Loading image...</p>
                                </div>
                            )}

                            {/* Error message */}
                            {mediaPreview.error && (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="bg-red-600/20 p-8 rounded-lg text-center">
                                        <p className="text-white text-lg mb-2">Failed to load image</p>
                                        <p className="text-gray-300 text-sm">The image could not be loaded due to an error.</p>
                                    </div>
                                </div>
                            )}

                            {/* Image preview */}
                            {mediaPreview.type &&
                                imageMimeType.includes(mediaPreview.type) &&
                                !mediaPreview.loading &&
                                !mediaPreview.error ? (
                                <div
                                    className="relative flex items-center justify-center w-full h-full"
                                    style={{
                                        transform: `scale(${zoomLevel})`,
                                        transition: "transform 0.2s ease-out",
                                    }}
                                >
                                    <img
                                        src={mediaPreview.url || "/placeholder.svg"}
                                        alt="Image Preview"
                                        className="max-w-full max-h-[90vh] object-contain"
                                        onLoad={() => console.log("Image loaded successfully")}
                                        onError={(e) => {
                                            console.error("Image failed to display in preview:", e)
                                            setMediaPreview((prev) => (prev ? { ...prev, error: true } : null))
                                        }}
                                    />
                                </div>
                            ) : mediaPreview.type && videoMimeType.includes(mediaPreview.type) ? (
                                <div className="relative max-w-4xl w-full">
                                    <video
                                        src={mediaPreview.url}
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-[90vh]"
                                        onError={(e) => {
                                            console.error("Video failed to load:", e)
                                            setMediaPreview((prev) => (prev ? { ...prev, error: true } : null))
                                        }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                !mediaPreview.loading &&
                                !mediaPreview.error && (
                                    <div className="bg-white rounded-lg p-8 text-center max-w-lg">
                                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-medium mb-2">File preview not available</p>
                                        <p className="text-gray-500 mb-6">{mediaPreview.name}</p>
                                        <a
                                            href={mediaPreview.url}
                                            download
                                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="h-4 w-4 mr-2" /> Download File
                                        </a>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
const hashCode = (str: string) => str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

