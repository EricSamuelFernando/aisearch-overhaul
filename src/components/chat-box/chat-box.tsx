// "use client"

// import Image from "next/image"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Input } from "@/components/ui/input"
// import EmojiPicker from "emoji-picker-react"
// import {
//   ChevronLeft,
//   Search,
//   HandHelpingIcon as Help,
//   MoreVertical,
//   Send,
//   Star,
//   Wifi,
//   CookingPotIcon as Kitchen,
//   Car,
//   Wind,
//   Maximize2,
//   X,
//   MessageCircle,
//   Paperclip,
//   Download,
//   FileText,
//   Smile,
//   FolderOpenDot,
//   Play,
//   SendHorizontal,
//   CircleCheck,
//   ZoomIn,
//   ZoomOut,
//   Eye,
//   Maximize,
// } from "lucide-react"
// import "swiper/css"
// import "swiper/css/navigation"
// import "swiper/css/pagination"
// import FavoriteBorder from "@mui/icons-material/FavoriteBorder"
// import LocationOnIcon from "@mui/icons-material/LocationOn"
// import { Badge } from "@/components/ui/badge"
// import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useCallback, useContext, useEffect, useRef, useState } from "react"
// import useDebounce from "@/hooks/utils/debounce"
// import { useSelector } from "react-redux"
// import KingBedIcon from "@mui/icons-material/KingBed"
// import BathtubIcon from "@mui/icons-material/Bathtub"
// import type { RootState } from "@/lib/store"
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { format, formatDistanceToNow, isSameDay, subDays } from "date-fns"
// import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env"
// import { SocketContext } from "@/providers/socket.context"
// import { useAgentConversationApi } from "@/hooks/api/auth/useConversationApi"
// import { FaHome, FaMapMarkerAlt } from "react-icons/fa"
// import { decryptMessage, encryptMessage, generateColorFromName } from "@/utils/math-utilities"
// import { useMessagesApi } from "@/hooks/api/useFetchMessages"
// import { useUserAgentMessageApi } from "@/hooks/api/auth/useMessageApi"
// import InviteUserModal from "./Invite-user-modal"
// import { threadId } from "worker_threads"
// import { useAtom } from "jotai"
// import { messageThreadsAtom } from "@/hooks/atoms"
// import { Loader } from "@mantine/core"
// import { usePropertyServiceAPI } from "@/hooks/api/agent/useAgentProperty"
// import { useRepoManagementApi } from "@/hooks/api/document/useRepoManagement"
// import { error } from "../alert/notify"
// import { useAuth } from "@/shared/hooks/useAuth"
// import { MdNotificationAdd } from "react-icons/md"

// interface User {
//   id: string
//   username: string
//   message: string
//   image: string
// }
// interface Message {
//   id?: string;
//   fileType?: string;
//   messageType?: string;
//   threadId: string
//   message?: string
//   content?: string
//   senderId?: string
//   roomId?: string
//   createdAt?: string
//   receiverId?: string
//   timestamp?: string
//   seen?: boolean
//   parentMessageId?: string | null
//   file?: {
//     name?: string
//     url?: string
//     type?: string
//   }
//   documents?: string[]
//   fileUrl?: string
//   message_type?: string
//   file_type?: string
// }
// export interface MediaPreview {
//   type: string;
//   url: string;
//   name?: string;
//   loaded?: boolean;
//   loading?: boolean;
//   error?: boolean;
// }
// interface Thread {
//   messages?: any
//   id: string
//   threadName?: string
//   image?: string;
//   propertyName?: string;
//   message?: string
//   lastSeen?: string
//   unreadCount?: number
//   propertyAddress?: string
//   propertyId?: string
//   listingId?: string
//   participants?: any
//   user?: {
//     id?: string
//     firstName?: string
//     lastName?: string
//   }
//   buyerAgent?: {
//     id?: string
//     firstName?: string
//     lastName?: string
//   }
//   sellerAgent?: {
//     id?: string
//     firstName?: string
//     lastName?: string
//   }
//   lastMessage?: string
//   lastMessageAt?: string | null
//   isTyping?: boolean
//   members?: any[]
//   threadId?: string | null
//   isActive?: boolean
// }
// interface PropertyData {
//   media?: {
//     primaryListingImageUrl?: string
//   }
//   listingId?: string
//   property?: {
//     bathroomsTotal?: number
//     bedroomsTotal?: number
//   }
//   address?: {
//     unparsedAddress?: string
//   }
//   courtesyOf?: string
//   publicRemarks?: string
// }

// export default function ChatBoxComponent(props: any) {
//   const { threads, setIsRead, setSearch, loading, threadId } = props
//   const router = useRouter()
//   const params = useSearchParams();
//   const type = params?.get('type')
//   const { socket, state, setState } = useContext(SocketContext)
//   const [isDetails, setIsDetails] = useState(false)
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)
//   const [activeButton, setActiveButton] = useState("all")
//   const toggleDropdown = () => setIsDropdownOpen((prev) => !prev)
//   const closeDropdown = () => setIsDropdownOpen(false)
//   const [message, setMessage] = useState("")
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [isTyping, setIsTyping] = useState(false)
//   const [fileErrorMsg, setFileErrorMsg] = useState("")
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [selectedChannel, setSelectedChannel] = useState<Thread | null>(null)
//   const propertyDetails = useSelector((state: { property: any }) => state.property)
//   const userData = useSelector((state: RootState) => state.auth.user)
//   const { user } = useAuth();
//   const currentUser = user?.account_type;
//   const [receiverId, setRecieverId] = useState<string>("")
//   const [messageLoading, setMessageLoading] = useState(false)
//   const [showThreads, setShowThreads] = useState(true)
//   const [receiverDetail, setRecieverDetail] = useState<any>({})
//   const [senderDetail, setSenderDetail] = useState<any>({})
//   const [showChat, setShowChat] = useState(false)
//   const [showDetails, setShowDetails] = useState(false)
//   const [propertyData, setPropertyData] = useState<any>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [allMediaFiles, setAllMediaFiles] = useState<{ type?: string, url?: string, name?: string }[]>([]);
//   const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
//   const debounce = useDebounce()
//   const imageTypes = ["image/jpeg", "image/png", "image/jpg"]
//   const scrollRef = useRef<HTMLDivElement>(null)
//   const uploadMenuRef = useRef<HTMLDivElement>(null);
//   const emojiPickerRef = useRef<HTMLDivElement>(null);

//   const [selectedThread, setSelectedThread] = useState<any>("")
//   const [threadParticipants, setThreadParticipant] = useState<any>([])
//   const [selectedThreadDetail, setSelectedThreadDetail] = useState<any>("")
//   const pathname = useSearchParams();
//   const [messageThreads, setMessageThreads] = useAtom(messageThreadsAtom);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [showUploadMenu, setShowUploadMenu] = useState(false);

//   console.log(selectedThreadDetail);
//   const imageMimeType = [
//     "image/png",
//     "image/jpeg",
//     "image/jpg",
//     "image/webp",
//     "image/gif",
//     "image/bmp",
//     "image/svg+xml",
//     "image/tiff",
//     "image/x-icon",
//     "image/heic",
//     "image/heif",
//   ]
//   const videoMimeType = [
//     "video/mp4",
//     "video/webm",
//     "video/ogg",
//     "video/quicktime",
//     "video/x-msvideo",
//     "video/x-ms-wmv",
//     "video/x-flv",
//     "video/x-matroska",
//     "video/3gpp",
//     "video/mp2t",
//     "video/x-m4v",
//   ]
//   const allowedFileTypes = [...imageMimeType, ...videoMimeType, "application/pdf"]
//   const extensionToMimeType: Record<string, string> = {
//     jpg: 'image/jpeg',
//     jpeg: 'image/jpeg',
//     png: 'image/png',
//     webp: 'image/webp',
//     gif: 'image/gif',
//     bmp: 'image/bmp',
//     svg: 'image/svg+xml',
//     tiff: 'image/tiff',
//     ico: 'image/x-icon',
//     heic: 'image/heic',
//     heif: 'image/heif',
//     mp4: 'video/mp4',
//     webm: 'video/webm',
//     ogg: 'video/ogg',
//     mov: 'video/quicktime',
//     avi: 'video/x-msvideo',
//     wmv: 'video/x-ms-wmv',
//     flv: 'video/x-flv',
//     mkv: 'video/x-matroska',
//     '3gp': 'video/3gpp',
//     ts: 'video/mp2t',
//     m4v: 'video/x-m4v',
//     pdf: 'application/pdf'
//   }
//   const isProbablyUrl = (value?: string) =>
//     !!value && (/^https?:\/\//i.test(value) || value.startsWith('data:'))
//   const getMimeTypeFromUrl = (url?: string) => {
//     if (!url) return undefined
//     if (url.startsWith('data:')) {
//       const dataType = url.slice(5, url.indexOf(';'))
//       return dataType || undefined
//     }
//     const match = url.match(/\.([a-z0-9]+)(?:\?|#|$)/i)
//     if (!match) return undefined
//     return extensionToMimeType[match[1].toLowerCase()]
//   }
//   const decryptMessageSafely = (value?: string) => {
//     if (!value) return ''
//     if (isProbablyUrl(value)) return value
//     try {
//       const decrypted = decryptMessage(value)
//       return isProbablyUrl(decrypted) || decrypted ? decrypted : value
//     } catch (error) {
//       console.log("[ChatBox] Message might not be encrypted, using as-is")
//       return value
//     }
//   }
//   const normalizeMessage = (message: Message) => {
//     const rawMessage = message.message ?? message.content ?? ''
//     const decryptedMessage = decryptMessageSafely(rawMessage)
//     const normalizedMessageType =
//       message.messageType || message.message_type || (message.fileType || message.file_type ? 'file' : 'text')
//     const fileUrlCandidate =
//       message.file?.url ||
//       (isProbablyUrl(decryptedMessage) ? decryptedMessage : '') ||
//       message.documents?.[0] ||
//       message.fileUrl ||
//       ''
//     const derivedFileType =
//       message.fileType || message.file_type || getMimeTypeFromUrl(fileUrlCandidate)
//     const finalMessageType =
//       normalizedMessageType === 'text' && (fileUrlCandidate || derivedFileType)
//         ? 'file'
//         : normalizedMessageType
//     return {
//       ...message,
//       message: decryptedMessage,
//       messageType: finalMessageType,
//       fileType: derivedFileType,
//       fileUrl: fileUrlCandidate || message.fileUrl
//     }
//   }
//   const { getAllConversationMessagesMutation } = useAgentConversationApi()
//   const { getAllUserAgentMessagesMutation } = useUserAgentMessageApi()
//   const { getThreadById } = useAgentConversationApi()
//   const { uploadNewFile } = usePropertyServiceAPI()
//   const { createRepoWithUploadedFile } = useRepoManagementApi()

//   const getThreadDetails = async (id: string) => {
//     getThreadById.mutateAsync(id ?? threadId, {
//       onSuccess: async (data: any) => {
//         const participants = await [
//           ...(data?.buyerAgent ? [data.buyerAgent] : []),
//           ...(data?.sellerAgent ? [data.sellerAgent] : []),
//           ...(data?.user ? [data.user] : []),
//           ...(Array.isArray(data?.participants) ? data.participants.map((p: any) => p.user) : []),
//         ];
//         handleThreadSelection(data, participants)
//       }
//     })
//   }
//   const handleFileUpload = async (file: File) => {
//     try {
//       const { key, url } = await uploadNewFile(file, userData?.id || "", selectedThreadDetail?.propertyId);
//       const payload = {
//         uploadedFile: {
//           fileName: file?.name,
//           fileSize: file?.size,
//           fileUrl: url,
//           fileType: file?.type
//         },
//         createRepoManagementInput: {
//           name: 'proof-document',
//           url: '/proof-document',
//           propertyId: selectedThreadDetail?.propertyId,
//           createdBy: userData?.id,
//           parentFolderName: 'proof-document',
//           isArchived: true,

//         }
//       };
//       createRepoWithUploadedFile?.mutate(payload, {
//         onSuccess: (data) => {
//           console.log(data)
//         },
//         onError: (err) => {
//           error({ message: err?.message || 'Upload failed' });
//         },
//       });
//       return url;
//     } catch (err: any) {
//       console.error("File upload failed:", err);
//       throw new Error('File upload failed');
//     }
//   };

//   const handleThreadSelection = (thread: Thread, participants: any) => {
//     if (selectedChannel === thread) return null

//     console.log('[chat-box] Thread selected:', thread?.id, thread);

//     // Leave previous room if exists
//     if (selectedThread && socket && socket.leaveRoom) {
//       console.log('[chat-box] Leaving previous room:', selectedThread);
//       socket.leaveRoom(selectedThread);
//     }

//     setIsDetails(false)
//     setShowThreads(false)
//     setShowChat(true)
//     setThreadParticipant(participants)
//     setSelectedThreadDetail(thread)
//     localStorage.setItem('threadId', thread?.id || '');

//     setSelectedThread(thread?.id)

//     // Update state immediately to ensure chat box shows
//     setState((prev: any) => ({
//       ...prev,
//       selectedChannel: {
//         id: thread?.id,
//         propertyName: thread.propertyName,
//       }
//     }))

//     // Join the room using websocket methods
//     if (socket && thread?.id && userData?.id) {
//       console.log('[chat-box] Joining room for thread:', thread.id);

//       // First, try to create or join conversation
//       socket.createOrJoinRoom({
//         threadId: thread.id,
//         propertyId: thread.propertyId,
//         userId: userData.id,
//         userType: 'buyer',
//         buyerAgentId: thread.buyerAgent?.id,
//         sellerAgentId: thread.sellerAgent?.id,
//         roomId: thread.id,
//         threadName: thread.threadName,
//         propertyName: thread.propertyName,
//         propertyAddress: thread.propertyAddress,
//       });

//       // Also join the room directly
//       if (socket.joinRoom) {
//         socket.joinRoom(thread.id);
//       }

//       // Removed joinThread event - not supported by backend, use joinRoom instead
//     }

//     // if (TYPE === "messages") {
//     getAllThreadMessage(thread?.id)
//     if (userData?.id === thread?.buyerAgent?.id) {
//       setRecieverId(thread?.user?.id || "")
//       setRecieverDetail(thread?.user)
//     }
//     if (userData?.id === thread?.sellerAgent?.id) {
//       setRecieverId(thread?.user?.id || "")
//       setRecieverDetail(thread?.user)
//     }
//     else if (userData?.id === thread?.user?.id) {
//       setRecieverId(thread?.buyerAgent?.id || "")
//       setRecieverDetail(thread?.buyerAgent)
//     }
//     // }
//     // else {
//     //   getAllConversationThreads(thread?.id)
//     //   if (userData?.id === thread?.buyerAgent?.id) {
//     //     setRecieverId(thread?.sellerAgent?.id || "")
//     //   }
//     //   else {
//     //     setRecieverId(thread?.buyerAgent?.id || "")
//     //   }
//     // }
//     getPropertyDetails(thread?.listingId, thread.propertyId)

//     console.log('[chat-box] Thread selection complete. showChat:', true, 'selectedThread:', thread?.id, 'selectedThreadDetail:', thread?.id);
//   }

//   const handleEmojiClick = (emoji: any) => {
//     setMessage((prev) => prev + emoji.emoji);
//   };
//   const handleBackToThreads = () => {
//     // Leave the room when going back to threads
//     if (selectedThread && socket && socket.leaveRoom) {
//       console.log('[chat-box] Leaving room for thread:', selectedThread);
//       socket.leaveRoom(selectedThread);
//     }

//     setShowThreads(true)
//     setShowChat(false)
//     setSelectedChannel(null)
//     setSelectedThread('')
//   }

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [])

//   // Removed typing event - not supported by backend

//   const getAllConversationThreads = async (threadId: string) => {
//     try {
//       setMessages([])
//       getAllConversationMessagesMutation.mutate(threadId, {
//         onSuccess: (data) => {
//           const normalizedMessages = data?.data?.conversationsByThread?.map((message: Message) =>
//             normalizeMessage(message)
//           )
//           setMessages(normalizedMessages || [])
//         },
//         onError: (error) => {
//           console.log("Error in mutation: ", error)
//         },
//       })
//     } catch (error) {
//       console.log("error : ", error)
//     }
//   }

//   const toggleUploadMenu = () => {
//     setShowUploadMenu((prev) => !prev);
//   };

//   const getAllThreadMessage = async (threadId: string) => {
//     try {
//       setMessages([]);
//       getAllUserAgentMessagesMutation.mutate(threadId, {
//         onSuccess: (data) => {
//           const decryptedMessages = data?.data?.messagesByThread?.map((message: Message) =>
//             normalizeMessage(message)
//           );
//           setTimeout(() => {
//             messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//           }, 2000)
//           setMessages(decryptedMessages || []);
//         },
//         onError: (error) => {
//           console.log("Error in mutation: ", error);
//         },
//       });
//     } catch (error) {
//       console.log("error: ", error);
//     }
//   };

//   const handleSearch = useCallback(
//     debounce((value: string) => {
//       setSearch(value)
//     }, 1000),
//     [],
//   )

//   // Removed handleTyping - typing event not supported by backend
//   const handleTyping = (status: boolean) => {
//     // Typing events removed - not supported by backend WebSocket handler
//   }

//   const handleZoom = (zoomIn: boolean) => {
//     if (zoomIn) {
//       setZoomLevel(prev => Math.min(prev + 0.25, 3));
//     } else {
//       setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
//     }
//   };

//   const closeMediaPreview = () => {
//     setMediaPreview(null);
//     setZoomLevel(1);
//   };

//   const openMediaPreview = useCallback((fileUrl: string, fileType: string) => {
//     if (fileUrl) {
//       setMediaPreview({
//         type: fileType || '',
//         url: fileUrl,
//         name: fileType.split('/')[1] || 'media',
//         loading: true
//       });

//       if (fileType && imageMimeType.includes(fileType)) {
//         if (fileUrl.startsWith('data:')) {
//           setZoomLevel(1);
//           setMediaPreview({
//             type: fileType,
//             url: fileUrl,
//             name: fileType.split('/')[1] || 'media',
//             loaded: true
//           });
//           return;
//         }

//         const img = document.createElement('img');
//         img.crossOrigin = "anonymous";
//         img.src = fileUrl;

//         img.onload = () => {
//           setZoomLevel(1);
//           setMediaPreview({
//             type: fileType,
//             url: fileUrl,
//             name: fileType.split('/')[1] || 'media',
//             loaded: true
//           });
//         };

//         img.onerror = (e) => {
//           console.error("Failed to load image:", e);

//           const imgFallback = document.createElement('img');
//           imgFallback.src = fileUrl;

//           imgFallback.onload = () => {
//             setZoomLevel(1);
//             setMediaPreview({
//               type: fileType,
//               url: fileUrl,
//               name: fileType.split('/')[1] || 'media',
//               loaded: true
//             });
//           };

//           imgFallback.onerror = () => {
//             console.error("All loading attempts failed for image");
//             setMediaPreview({
//               type: fileType,
//               url: '/placeholder.jpg',
//               name: fileType.split('/')[1] || 'media',
//               loaded: false,
//               error: true
//             });
//           };
//         };
//       } else {
//         setZoomLevel(1);
//         setMediaPreview({
//           type: fileType || '',
//           url: fileUrl,
//           name: fileType.split('/')[1] || 'media',
//           loading: false
//         });
//       }
//       const index = allMediaFiles.findIndex(mediaFile =>
//         mediaFile.url === fileUrl
//       );

//       if (index !== -1) {
//         setCurrentMediaIndex(index);
//       }
//     }
//   }, [allMediaFiles, imageMimeType]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]

//     if (file) {
//       setFileErrorMsg("")
//       setSelectedFile(null)
//       setShowUploadMenu(false) // Close upload menu when file is selected

//       const maxSize = 25 * 1024 * 1024 // 25MB

//       if (!allowedFileTypes.includes(file.type)) {
//         setFileErrorMsg("Invalid file type. Only images, videos, and PDF are allowed.")
//         return
//       }
//       if (file.size > maxSize) {
//         setFileErrorMsg("File size exceeds the 25MB limit.")
//         return
//       }

//       setSelectedFile(file)
//     }
//   }

//   const getPropertyDetails = async (id: any, propertyId: any) => {
//     try {
//       setMessageLoading(true)
//       setPropertyData(null)
//       const payload = {
//         listingId: parseInt(id) || "",
//         propertyId: parseInt(propertyId)
//       }
//       const response = await fetch(PROPERTY_DETAIL_SEARCH_AI_URL || "http://13.60.114.186:9000/api/search/preference", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       })
//       const data = await response.json()
//       setPropertyData(data?.data)
//       setMessageLoading(false)
//       // setIsDetails(true)
//       setShowDetails(true)
//       return data
//     } catch (error) {
//       console.log("error : ", error)
//     }
//     setMessageLoading(false)
//   }

//   const handleInputChange = (e: any) => {
//     const value = e.target.value
//     setMessage(value)

//     if (!isTyping) {
//       handleTyping(true)
//     }

//     // Removed typing status check - not supported by backend
//   }
//   const getBase64 = (file: Blob): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = (error) => reject(error);
//     });
//   };

//   useEffect(() => {
//     // Use fallback pattern to get thread ID
//     const roomId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;
//     if (!roomId || !socket) return;

//     console.log('[chat-box] useEffect: Joining room:', roomId);

//     // Use proper websocket joinRoom method
//     if (socket.joinRoom) {
//       socket.joinRoom(roomId);
//     } else {
//       // Fallback to emit for backward compatibility
//       socket.emit("joinRoom", { roomId });
//     }

//     return () => {
//       // Use proper websocket leaveRoom method
//       if (socket.leaveRoom) {
//         socket.leaveRoom(roomId);
//       } else {
//         // Fallback to emit for backward compatibility
//         socket.emit("leaveRoom", { roomId });
//       }
//     };
//   }, [socket, state?.selectedChannel?.id, selectedThreadDetail?.id, selectedThread, threadId]);


//   // const handleSendMessage = async () => {
//   //   try {
//   //     // Validate socket connection
//   //     if (!socket) {
//   //       console.error("[handleSendMessage] Socket is not connected");
//   //       return;
//   //     }

//   //     if (!socket.connected) {
//   //       console.error("[handleSendMessage] Socket is not connected. State:", socket.connected);
//   //       socket.connect();
//   //       return;
//   //     }

//   //     // Get thread ID from multiple possible sources
//   //     const currentThreadId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;

//   //     // Validate required fields
//   //     if (!currentThreadId) {
//   //       console.error("[handleSendMessage] No thread selected", {
//   //         selectedChannel: state?.selectedChannel,
//   //         selectedThreadDetail: selectedThreadDetail?.id,
//   //         selectedThread: selectedThread,
//   //         threadId: threadId
//   //       });
//   //       return;
//   //     }

//   //     if (!userData?.id) {
//   //       console.error("[handleSendMessage] User ID is missing");
//   //       return;
//   //     }

//   //     if (!receiverId) {
//   //       console.error("[handleSendMessage] Receiver ID is missing");
//   //       return;
//   //     }

//   //     const encryptedMessage = encryptMessage(message);
//   //     console.log("[handleSendMessage] Starting message send:", {
//   //       threadId: currentThreadId,
//   //       senderId: userData?.id,
//   //       receiverId: receiverId,
//   //       hasMessage: !!message.trim(),
//   //       hasFile: !!selectedFile,
//   //       encryptedMessageLength: encryptedMessage.length
//   //     });

//   //     if (encryptedMessage.trim() !== "" || selectedFile) {
//   //       const newMessage = {
//   //         threadId: currentThreadId,
//   //         message: message, // Plain message for local display
//   //         senderId: userData?.id,
//   //         roomId: selectedThreadDetail?.roomId || currentThreadId,
//   //         receiverId: receiverId,
//   //         createdAt: new Date().toISOString(),
//   //       } as Message;

//   //       let fileData = null;

//   //       if (selectedFile) {
//   //         try {
//   //           console.log("[handleSendMessage] Processing file upload:", {
//   //             fileName: selectedFile.name,
//   //             fileType: selectedFile.type,
//   //             fileSize: selectedFile.size
//   //           });

//   //           handleFileUpload(selectedFile);
//   //           const base64Content = await getBase64(selectedFile);
//   //           const fileType = selectedFile.type;
//   //           fileData = {
//   //             name: selectedFile.name,
//   //             type: fileType,
//   //             size: selectedFile.size,
//   //             content: base64Content,
//   //             sender: userData,
//   //           };

//   //           // File upload not supported via WebSocket - use REST API first
//   //           // TODO: Upload file via REST API, then send file URL using sendMessage
//   //           console.error("[handleSendMessage] File upload via WebSocket not supported. Use REST API for file uploads.");
//   //           error({ message: "File upload via WebSocket not yet implemented. Please use REST API for file uploads." });
//   //         } catch (fileError) {
//   //           console.error("[handleSendMessage] File processing error:", fileError);
//   //         }
//   //       } else {
//   //         // Send text message using websocket sendMessage method
//   //         const currentThreadId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;

//   //         if (socket && socket.sendMessage && currentThreadId && userData?.id) {
//   //           console.log("[handleSendMessage] Sending message via websocket:", {
//   //             threadId: currentThreadId,
//   //             userId: userData.id,
//   //             messageLength: message.length
//   //           });

//   //           socket.sendMessage({
//   //             threadId: currentThreadId,
//   //             message: message, // Send plain message (backend can handle encryption if needed)
//   //             userId: userData.id,
//   //             messageType: 'text'
//   //           });

//   //           // Handle response
//   //           const handleSendMessageResponse = (response: any) => {
//   //             console.log("[handleSendMessage] sendMessage_response:", response);
//   //             if (response.status === 'success') {
//   //               // Message sent successfully, it will be broadcasted via newMessage event
//   //               setMessage('');
//   //             } else {
//   //               error({ message: response.message || 'Failed to send message' });
//   //             }
//   //             socket.off('sendMessage_response', handleSendMessageResponse);
//   //           };

//   //           socket.on('sendMessage_response', handleSendMessageResponse);

//   //           // Add message to local state for immediate UI update (will be updated via newMessage event)
//   //           setMessages((prev) => [{ ...newMessage, message }, ...prev]);
//   //           setMessage('');
//   //         } else {
//   //           // Fallback to old method if websocket methods not available
//   //           const encryptedTextMessage = encryptMessage(message);
//   //           const messagePayload = {
//   //             ...newMessage,
//   //             message: encryptedTextMessage, // Encrypted for backend
//   //             reciepent: receiverId,
//   //             userName: userData?.firstname + " " + userData?.lastname,
//   //             user: {
//   //               reciepent: receiverId,
//   //               userName: userData?.firstname + " " + userData?.lastname,
//   //             }
//   //           };

//   //           // Removed sendMessagetoThread event - not supported by backend
//   //           // Use sendMessage method instead (already handled above)
//   //           console.error("[handleSendMessage] sendMessagetoThread not supported. Use socket.sendMessage() instead.");
//   //           error({ message: "Message sending failed. Please use the sendMessage method." });
//   //         }
//   //       }

//   //       setSelectedFile(null);
//   //     } else {
//   //       console.warn("[handleSendMessage] Empty message and no file");
//   //     }

//   //     setTimeout(() => {
//   //       if (messagesEndRef.current) {
//   //         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//   //       }
//   //     }, 1000);
//   //   } catch (error) {
//   //     console.error("[handleSendMessage] Unexpected error:", error);
//   //   }
//   // }


//   const handleSendMessage = async () => {
//     try {
//       // Validate socket
//       if (!socket) {
//         console.error("[handleSendMessage] Socket missing");
//         return;
//       }

//       if (!socket.connected) {
//         socket.connect();
//         return;
//       }

//       // Resolve thread ID
//       const currentThreadId =
//         state?.selectedChannel?.id ||
//         selectedThreadDetail?.id ||
//         selectedThread ||
//         threadId;

//       if (!currentThreadId || !userData?.id || !receiverId) {
//         console.error("[handleSendMessage] Missing required data");
//         return;
//       }

//       const hasText = message.trim() !== "";
//       const hasFile = !!selectedFile;

//       if (!hasText && !hasFile) {
//         console.warn("[handleSendMessage] Empty message");
//         return;
//       }

//       let fileUrl: string | '' = '';

//       // 1️⃣ Upload file first (REST)
//       if (hasFile && selectedFile) {
//         try {
//           fileUrl = await handleFileUpload(selectedFile);
//         } catch {
//           error({ message: "File upload failed" });
//           return;
//         }
//       }

//       // 2️⃣ Send message via WebSocket
//       socket.sendMessage({
//         threadId: currentThreadId,
//         userId: userData.id,
//         messageType: hasFile ? "file" : "text",
//         message: hasFile ? fileUrl : message,
//         fileType: hasFile ? selectedFile?.type : undefined, // ✅ FIX

//       });

//       // 3️⃣ Optimistic UI update
//       setMessages((prev: any) => [
//         {
//           threadId: currentThreadId,
//           senderId: userData.id,
//           receiverId,
//           messageType: hasFile ? "file" : "text",
//           message: hasFile ? fileUrl : message,
//           fileType: hasFile ? selectedFile?.type : undefined, // ✅ FIX
//           createdAt: new Date().toISOString(),
//           file: hasFile
//             ? {
//               name: selectedFile?.name,
//               size: selectedFile?.size,
//               type: selectedFile?.type,
//               url: fileUrl,
//             }
//             : null,
//         },
//         ...prev,
//       ]);

//       // 4️⃣ Cleanup
//       setMessage("");
//       setSelectedFile(null);

//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 300);
//     } catch (err) {
//       console.error("[handleSendMessage] Unexpected error:", err);
//     }
//   };

//   const handleTrheadsName = (user: any) => {
//     const str1 = "Byuer (" + user?.buyerAgent.firstName + " " + user?.buyerAgent.lastName + ")"
//     const str2 = "Seller (" + user?.sellerAgent.firstName + " " + user?.sellerAgent.lastName + ")"
//     return <>
//       <h3 className="font-semibold text-sm sm:text-base truncate">{str1}</h3>
//       <h3 className="font-semibold text-sm sm:text-base truncate">{str2}</h3>
//     </>
//   }

//   const groupedMessages: { [date: string]: Message[] } = messages.reduce((acc: { [date: string]: Message[] }, message) => {
//     const date = format(new Date(message?.createdAt ?? 0), "yyyy-MM-dd");
//     if (!acc[date]) acc[date] = [];
//     acc[date].push(message);
//     return acc;
//   }, {});

//   // const groupedMessages: { [date: string]: Message[] } = (() => {
//   //   const thread = messageThreads.find((thread) => thread.id === selectedThread);
//   //   return thread?.messages?.reduce((acc: { [date: string]: Message[] }, message) => {
//   //     const date = format(new Date(message?.createdAt ?? 0), "yyyy-MM-dd");
//   //     if (!acc[date]) acc[date] = [];
//   //     acc[date].push(message);
//   //     return acc;
//   //   }, {}) || {};
//   // })();


//   function isToday(date: Date): boolean {
//     const today = new Date();
//     return isSameDay(date, today);
//   }

//   function isYesterday(date: Date): boolean {
//     const yesterday = subDays(new Date(), 1);
//     return isSameDay(date, yesterday);
//   }

//   const saveAllMessages = () => {
//     // Removed save_user_agent_messages event - not supported by backend WebSocket handler
//     // Message saving should be handled via REST API
//   }


//   useEffect(() => {
//     if (socket) {
//       // socket?.on('thread_marked_as_read', (data: any) => {
//       //   if (selectedThread === data?.threadId) {
//       //     // setAllMessages(allMessages);
//       //     const updatedMessages = allMessages.map((msg) =>
//       //       msg.isRead ? msg : { ...msg, isRead: true }
//       //     );
//       //     setAllMessages(updatedMessages);
//       //   }
//       // })
//       // socket.on("recievedMessage", (newMessage: Message) => {
//       //   // setShowNewMessageTag(true)
//       //   console.log("Data : ", selectedThread, newMessage);
//       //   setMessages(prevMessages => [newMessage, ...prevMessages]);
//       // })
//       // Removed typingStatus event - not supported by backend WebSocket handler
//       // Removed saveAllMessages interval - save_user_agent_messages event not supported by backend
//       // const interval = setInterval(saveAllMessages, 5000);
//       return () => {
//         socket.off("recievedMessage")
//         socket.off("thread_marked_as_read")
//         // Removed clearInterval(interval) - interval was removed
//         // Removed saveAllMessages() - message saving removed, use REST API instead
//       }
//     }
//     // Don't reset selectedChannel here - it should persist
//   }, [socket])

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [groupedMessages]);


//   // Removed joinThread event - not supported by backend, use joinRoom instead
//   // useEffect(() => {
//   //   if (socket && selectedThread) {
//   //     socket.emit("joinThread", selectedThread);
//   //   }
//   // }, [socket, selectedThread])

//   useEffect(() => {
//     // Use fallback pattern to get thread ID
//     const currentThreadId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;
//     if (socket && currentThreadId) {

//       console.log("[ChatBox] Setting up real-time listeners for thread:", currentThreadId);

//       socket.on("recievedMessage", (newMessage: Message) => {
//         console.log("[ChatBox] Received message:", newMessage);

//         // Only process messages for the current thread
//         if (newMessage.threadId === currentThreadId || newMessage.threadId === selectedThreadDetail?.id) {
//           // For file messages, the message field contains the file URL (should not be encrypted)
//           // For text messages, decrypt if needed
//           let processedMessage = { ...newMessage };

//           if (newMessage.messageType === "file") {
//             // File messages: message field contains the URL, keep it as-is
//             processedMessage.message = newMessage.message;
//           } else if (newMessage.message) {
//             // Text messages: try to decrypt if encrypted
//             try {
//               // Try to decrypt - if it fails, it might already be plain text
//               const decrypted = decryptMessage(newMessage.message);
//               processedMessage.message = decrypted;
//             } catch (error) {
//               // Message might already be decrypted or not encrypted
//               console.log("[ChatBox] Message might not be encrypted, using as-is");
//               processedMessage.message = newMessage.message;
//             }
//           }

//           console.log("[ChatBox] Adding message to state:", processedMessage);
//           setMessages((prevMessages) => {
//             // Check if message already exists to avoid duplicates
//             const exists = prevMessages.some(
//               msg => msg.createdAt === processedMessage.createdAt &&
//                 msg.senderId === processedMessage.senderId &&
//                 msg.message === processedMessage.message
//             );
//             if (exists) {
//               console.log("[ChatBox] Message already exists, skipping");
//               return prevMessages;
//             }
//             return [processedMessage, ...prevMessages];
//           });
//         } else {
//           console.log("[ChatBox] Message is for different thread, ignoring:", {
//             receivedThreadId: newMessage.threadId,
//             currentThreadId: currentThreadId
//           });
//         }
//       });

//       socket.on("typingStatus", (typing: boolean) => {
//         setIsTyping(typing);
//       });

//       // Handle newMessage event from websocket backend (Lambda/API Gateway)
//       const handleNewMessage = (messageData: any) => {
//         console.log('[ChatBox] Received newMessage from websocket:', messageData);
//         console.log('[ChatBox] Current thread ID:', currentThreadId, 'Selected thread detail:', selectedThreadDetail?.id);

//         const threadId = messageData.threadId || messageData.thread_id;
//         console.log('[ChatBox] Message thread ID:', threadId);

//         // Only process messages for the current thread
//         if (threadId === currentThreadId || threadId === selectedThreadDetail?.id) {
//           console.log('[ChatBox] Message matches current thread, processing...');
//           let processedMessage = normalizeMessage({
//             ...messageData,
//             threadId: threadId,
//             message: messageData.message || messageData.content,
//             senderId: messageData.senderId || messageData.sender_id,
//             receiverId: messageData.receiverId || messageData.receiver_id,
//             createdAt: messageData.createdAt || messageData.created_at,
//             messageType: messageData.messageType || messageData.message_type || 'text',
//             fileType: messageData.fileType || messageData.file_type,
//           });

//           console.log("[ChatBox] Adding newMessage to state:", processedMessage);
//           setMessages((prevMessages) => {
//             // Check if message already exists to avoid duplicates
//             const exists = prevMessages.some(
//               msg => (msg.createdAt === processedMessage.createdAt ||
//                 (msg.id && msg.id === processedMessage.id)) &&
//                 msg.senderId === processedMessage.senderId &&
//                 msg.message === processedMessage.message
//             );
//             if (exists) {
//               console.log("[ChatBox] Message already exists, skipping");
//               return prevMessages;
//             }
//             return [processedMessage, ...prevMessages];
//           });
//         } else {
//           console.log("[ChatBox] newMessage is for different thread, ignoring:", {
//             receivedThreadId: threadId,
//             currentThreadId: currentThreadId
//           });
//         }
//       };

//       socket.on('newMessage', handleNewMessage);

//       // Handle websocket response events
//       socket.on('createOrJoinConversation_response', (response: any) => {
//         console.log('[ChatBox] createOrJoinConversation_response:', response);
//       });

//       socket.on('joinRoom_response', (response: any) => {
//         console.log('[ChatBox] joinRoom_response:', response);
//       });

//       socket.on('sendMessage_response', (response: any) => {
//         console.log('[ChatBox] sendMessage_response:', response);
//       });

//       // Listen for WebSocket errors
//       socket.on("error", (errorData: any) => {
//         console.error("[ChatBox] WebSocket error:", errorData);
//       });

//       // Listen for connection status
//       socket.on("connect", () => {
//         console.log("[ChatBox] Socket connected");
//         // Rejoin room when reconnected
//         if (currentThreadId) {
//           if (socket.joinRoom) {
//             socket.joinRoom(currentThreadId);
//           } else {
//             socket.emit("joinRoom", { roomId: currentThreadId });
//           }
//         }
//       });

//       socket.on("disconnect", () => {
//         console.warn("[ChatBox] Socket disconnected");
//       });

//       return () => {
//         console.log("[ChatBox] Cleaning up real-time listeners");
//         socket.off("recievedMessage");
//         socket.off("newMessage", handleNewMessage);
//         socket.off("typingStatus");
//         socket.off("error");
//         socket.off("connect");
//         socket.off("disconnect");
//         socket.off("createOrJoinConversation_response");
//         socket.off("joinRoom_response");
//         socket.off("sendMessage_response");
//       };
//     }
//     return () => {
//       setState((prev: any) => ({
//         ...prev,
//         selectedChannel: {
//           id: null,
//           propertyName: ""
//         }
//       }));
//     };
//   }, [socket, state?.selectedChannel?.id, selectedThreadDetail?.id]);

//   useEffect(() => {

//     const handleUnload = () => {
//       // Removed save_user_agent_messages and save_messages events - not supported by backend
//       // Message saving should be handled via REST API
//       if (socket) {
//         console.log("[chat-box] Message saving removed - use REST API instead");
//         // }
//       }
//     };

//     // Trigger save when the user tries to refresh or close the page
//     window.addEventListener("beforeunload", handleUnload);

//     // Trigger save when the user presses the back button
//     window.addEventListener("popstate", handleUnload);

//     // Clean up the event listeners when the component unmounts
//     return () => {
//       window.removeEventListener("beforeunload", handleUnload);
//       window.removeEventListener("popstate", handleUnload);
//     };
//   }, [socket]
//   );

//   useEffect(() => {
//     if (state?.newMessage) {
//       // const message = decryptMessage(state?.newMessage?.message)
//       const normalized = normalizeMessage(state?.newMessage);
//       state.newMessage.message = normalized.message;
//       console.log("DAtaaaaaaaaaaa: ", state.newMessage);

//       setMessages((prevMessages) => [normalized, ...prevMessages]);
//       setState((prev: any) => ({
//         ...prev,
//         newMessage: null
//       }));
//     }
//   }, [state.newMessage]);

//   useEffect(() => {
//     if (threadId) {
//       getThreadDetails(threadId);
//     }
//   }, [threadId]);

//   // Predefined light colors for consistent user avatars
//   const lightColors = ["bg-blue-200", "bg-green-200", "bg-red-200", "bg-yellow-200", "bg-purple-200"];

//   // Function to pick a static color based on the user's name
//   const getStaticColor = (name: string) => {
//     const index = name?.charCodeAt(0) % lightColors.length;
//     return lightColors[index];
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((n: string) => n[0])
//       .join("")
//       .toUpperCase();
//   };

//   console.log(message);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       // Upload dropdown
//       if (
//         showUploadMenu &&
//         uploadMenuRef.current &&
//         !uploadMenuRef.current.contains(event.target as Node)
//       ) {
//         setShowUploadMenu(false);
//       }

//       // Emoji picker
//       if (
//         showEmojiPicker &&
//         emojiPickerRef.current &&
//         !emojiPickerRef.current.contains(event.target as Node)
//       ) {
//         setShowEmojiPicker(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showUploadMenu, showEmojiPicker]);

//   console.log("Thread Data: ", threads);
//   console.log("[chat-box] Render state - showChat:", showChat, "selectedThread:", selectedThread, "selectedThreadDetail:", selectedThreadDetail?.id, "state.selectedChannel:", state.selectedChannel);
//   const isImageFile = (url: string) => {
//     return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
//   };

//   return (
//     <div className="mt-24 max-w-full ">
//       <header className="border-b px-2 sm:px-4 py-2 flex items-center justify-between  shadow-sm">
//         <div className="flex bg-white shadow  pr-4 rounded-full items-center " onClick={() => router.push(`/dashboard/${currentUser === "seller" ? "" : "buyer"}`)}>
//           <Button variant="ghost" size="icon">
//             <ChevronLeft className="h-5 w-5" />
//           </Button>
//           <span className="font-semibold">Back</span>
//         </div>
//         <div className="flex justify-center items-center w-full">
//           <div className="shadow relative flex w-full max-w-xl bg-white h-10 rounded-full">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
//             <Input
//               placeholder="Search"
//               className="pl-12 pr-4 bg-transparent text-gray-700 placeholder-gray-500 w-full focus:outline-none appearance-none border-0"
//               onChange={(e) => {
//                 handleSearch(e.target.value)
//               }}
//             />
//           </div>
//         </div>
//         <Button variant="ghost" size="icon">
//           <Help className="h-5 w-5" />
//         </Button>
//       </header>
//       <section>
//         <div className="flex flex-col border-l md:flex-row bg-gray-100 h-[calc(100vh-9rem)] max-h-[calc(100vh-9rem)]">
//           <div className={`w-full md:w-96 bg-white border-r ${showThreads ? "block" : "hidden md:block"} overflow-hidden`}>
//             {/* Header */}
//             <div className="p-4 border-b flex justify-between items-center">
//               <h2 className="font-semibold text-lg text-gray-800">Messages</h2>
//               <Button variant="ghost" size="icon">
//                 <MessageCircle className="h-6 w-6 text-gray-600" />
//               </Button>
//             </div>

//             {/* Toggle Buttons */}
//             <div className="p-2 px-4  border-b flex justify-center items-center">
//               <div className="flex w-full gap-2 rounded-full bg-gray-100 p-1 shadow-sm">
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => {
//                     setIsRead(false)
//                     setActiveButton("all")
//                   }}
//                   className={`h-10 w-full text-gray-600 rounded-full px-4 py-2 ${activeButton === "all" ? "bg-white shadow text-gray-800" : ""}`}
//                 >
//                   All
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => {
//                     setIsRead(true)
//                     setActiveButton("unread")
//                   }}
//                   className={`h-10 w-full text-gray-600 rounded-full px-4 py-2 ${activeButton === "unread" ? "bg-white shadow text-gray-800" : ""}`}
//                 >
//                   Unread
//                 </Button>
//               </div>
//             </div>

//             {/* Threads List */}
//             {props?.loading ?
//               <div className="flex items-center justify-center h-32">
//                 <svg
//                   className="animate-spin h-6 w-6 text-orange-500"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8z"
//                   ></path>
//                 </svg>
//               </div> :
//               <ScrollArea className="px-4 py-2 overflow-auto h-[calc(96vh-16rem)]">
//                 {threads?.length ? (
//                   threads.map((thread: Thread) => {
//                     const participants = [
//                       ...(thread?.buyerAgent ? [thread.buyerAgent] : []),
//                       ...(thread?.sellerAgent ? [thread.sellerAgent] : []),
//                       ...(thread?.user ? [thread.user] : []),
//                       ...(Array.isArray(thread?.participants) ? thread.participants.map(p => p.user) : []),
//                     ];
//                     const lastMessage = thread?.messages?.[thread?.messages?.length - 1]
//                     const initials = getInitials(
//                       `${thread?.buyerAgent?.firstName || ''} ${thread?.user?.firstName || thread?.sellerAgent?.firstName || ''}`
//                     );

//                     return (
//                       <div
//                         key={thread.id}
//                         className={`group relative flex w-full border-b border-r border-t mt-3 items-start gap-3 p-4 rounded-md ${selectedThreadDetail?.id === thread?.id ? 'bg-orange-50 text-gray-900 border-orange-300' : "bg-white"} hover:shadow-xl hover:bg-orange-100 hover:text-gray-900 cursor-pointer transition-colors`}
//                         onClick={() => handleThreadSelection(thread, participants)}
//                       >
//                         {/* Avatar */}
//                         {thread?.image ? (
//                           <Image
//                             src={thread.image}
//                             alt="User Avatar"
//                             width={50}
//                             height={50}
//                             className="rounded-full object-cover w-[40px] h-[40px] sm:w-[50px] sm:h-[50px]"
//                             priority
//                             unoptimized
//                           />
//                         ) : (
//                           <div
//                             className={`rounded-full flex items-center justify-center font-semibold w-[40px] h-[40px] sm:w-[50px] sm:h-[50px]  bg-gray-800 text-white `}
//                           >
//                             {initials}
//                           </div>
//                         )}

//                         {/* Thread Content */}
//                         <div className="flex-1 min-w-0 relative">

//                           {/* Top row: Name + Time */}
//                           <div className="flex items-center gap-2">
//                             <p className="font-semibold text-sm sm:text-base truncate flex-1 min-w-0">
//                               {thread.buyerAgent?.firstName} &{" "}
//                               {thread?.user?.firstName || thread.sellerAgent?.firstName}
//                             </p>

//                             <span
//                               className={`text-xs whitespace-nowrap shrink-0 ${selectedThreadDetail?.id === thread?.id ? "text-gray-700 font-medium" : "text-gray-500"} group-hover:text-gray-700`}
//                             >
//                               {lastMessage?.createdAt
//                                 ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })
//                                 : ""}
//                             </span>
//                           </div>


//                           {/* Recent message (instead of participants) */}
//                           <p className={`text-xs sm:text-sm truncate w-full mt-0.5 ${selectedThreadDetail?.id === thread?.id ? "text-gray-600" : "text-gray-500"} group-hover:text-gray-600`}>
//                             {lastMessage?.message || "No messages yet"}
//                           </p>

//                           {/* Property tag only */}
//                           <div className="mt-2">
//                             {/* Outer container */}
//                             <div className="inline-flex items-center gap-2 bg-[#FFFAEB] px-2 py-4 rounded-full h-6">

//                               {/* Inner container: property name */}
//                               <span className="inline-flex items-center gap-1 bg-white border border-orange-500 text-orange-700 px-3 py-1 rounded-full text-[10px] sm:text-xs truncate max-w-[140px]">

//                                 {/* Property icon (SVG first) */}
//                                 <img
//                                   src="/assets/icons8-map-pin-color/locaation.svg"
//                                   alt="Property"
//                                   className="w-5 h-5"
//                                 />

//                                 {/* Property name */}
//                                 <span className="truncate text-[#E85500]">
//                                   {thread.propertyName}
//                                 </span>
//                               </span>

//                               {/* Lollipop / pin icon */}
//                               <span className="text-md">📍</span>
//                             </div>
//                           </div>




//                           {/*
//   <div className="flex flex-wrap gap-1 text-[10px] text-gray-500 truncate w-full">
//     {participants.map((p: any, i: number) => (
//       <span key={i} className="truncate">
//         {p?.firstName}{i < participants.length - 1 && ","}
//       </span>
//     ))}
//   </div>

//   <span className="flex items-center gap-1 bg-orange-100 w-24 text-orange-700 px-3 py-1 rounded-full text-[10px] sm:text-xs h-6">
//     <FaMapMarkerAlt className="text-orange-600 text-xs" />
//     <span className="truncate max-w-[100px]">
//       {thread.propertyAddress}
//     </span>
//   </span>
//   */}
//                         </div>

//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="text-center mt-6 text-gray-400">
//                     <p className="text-lg font-semibold">No threads available</p>
//                     <p className="text-sm">It seems like you have not started any conversations yet.</p>
//                   </div>
//                 )}
//               </ScrollArea>
//             }
//           </div>


//           <div className={`flex-1  flex flex-col bg-[#F7F2EB] ${showChat ? "block" : "hidden md:block"} max-h-full overflow-hidden`}>
//             <header className="border-b bg-[#F7F2EB] px-4 py-2 flex items-center justify-between md:hidden">
//               <div className="flex items-center gap-4">
//                 <Button variant="ghost" size="icon" onClick={handleBackToThreads}>
//                   <ChevronLeft className="h-5 w-5" />
//                 </Button>
//                 <span className="font-semibold">{state?.selectedChannel?.propertyName || ""}</span>
//               </div>
//             </header>
//             <div className="flex-1 flex bg-gray-50">
//               {(state.selectedChannel.id || selectedThreadDetail?.id || selectedThread) ? (
//                 <div className="flex-1 flex flex-col">
//                   {messageLoading ? (
//                     <div className="flex items-center justify-center h-full">
//                       <Loader size="md" />
//                     </div>
//                   ) : (
//                     <>
//                       <div className="p-4 border-b flex justify-between items-center">
//                         <div className="flex items-center gap-3">

//                           {selectedThread?.image ? (
//                             <Image
//                               src={selectedThread?.image}
//                               alt="User Avatar"
//                               width={50}
//                               height={50}
//                               className="rounded-full object-cover w-[40px] h-[40px] sm:w-[50px] sm:h-[50px]"
//                             />
//                           ) : (
//                             <div
//                               className={`rounded-full flex items-center justify-center text-gray-700 font-semibold w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] text-white bg-gray-700
//                               `}
//                             >
//                               {getInitials(
//                                 `${selectedThread?.buyerAgent?.firstName?.[0] || ""} ${selectedThread?.user?.firstName?.[0] || selectedThread?.sellerAgent?.firstName?.[0] || ""}`
//                               )}
//                             </div>

//                           )}
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <div className="flex-1 min-w-0">
//                                 {/* Name */}
//                                 <p className="font-semibold text-sm sm:text-base truncate">{selectedThreadDetail.buyerAgent?.firstName} & {selectedThreadDetail?.user?.firstName || selectedThreadDetail?.sellerAgent?.firstName}</p>

//                                 <span className="truncate max-w-[100px] flex text-[10px]">{threadParticipants?.map((participant: any, idx: number) => <p key={idx}>{participant?.firstName}, </p>)}</span>
//                               </div>
//                               {/* <span className="text-xs text-green-500">Online</span> */}
//                             </div>
//                             {isTyping && <span className="text-sm text-green-600">Typing...</span>}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <div className="flex items-center  gap-3">
//                             <Image
//                               src={propertyData?.media?.photosList?.[0]?.lowRes || "/placeholder.jpg"}
//                               alt="Property"
//                               width={60}
//                               height={40}
//                               className="rounded-lg object-cover"
//                               priority
//                               unoptimized
//                             />
//                             <div>
//                               <span className="text-xs">{propertyData?.courtesyOf}</span>
//                             </div>
//                           </div>
//                           <div className="relative">
//                             <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleDropdown}>
//                               <MoreVertical className="h-5 w-5" />
//                             </button>
//                             {isDropdownOpen && (
//                               <div
//                                 className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border"
//                                 onMouseLeave={closeDropdown}
//                                 style={{ zIndex: 100 }}
//                               >
//                                 <ul className="py-1">
//                                   <li>
//                                     <button
//                                       className="w-full text-left px-4 py-2 hover:bg-gray-100"
//                                       onClick={() => {
//                                         closeDropdown()
//                                         setIsDetails(!isDetails)
//                                         setShowDetails(!showDetails)
//                                       }}
//                                     >
//                                       Property Details
//                                     </button>
//                                   </li>
//                                   <li>
//                                     <InviteUserModal
//                                       threadId={selectedThread}
//                                     />
//                                   </li>
//                                 </ul>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       <ScrollArea className="ms-2 mb-2 sm:ms-5 scrollbar-hide sm:me-5 overflow-auto h-[calc(96vh-16rem)] sm:h-[calc(96vh-18rem)]">
//                         <div className="space-y-6 me-4">
//                           {Object.entries(groupedMessages)
//                             .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
//                             .map(([dateKey, dayMessages]) => {
//                               const parsedDate = new Date(dateKey);
//                               // const label = "Today"
//                               const label = isToday(parsedDate)
//                                 ? "Today"
//                                 : isYesterday(parsedDate)
//                                   ? "Yesterday"
//                                   : format(parsedDate, "EEEE, MMMM d");

//                               return (
//                                 <div key={dateKey}>
//                                   <div className="text-center py-2">
//                                     <span className="text-gray-500 text-xs sm:text-sm font-medium bg-white px-3 py-1 rounded-full shadow">
//                                       {label}
//                                     </span>
//                                   </div>


//                                   <div className="space-y-4">
//                                     {[...dayMessages]
//                                       .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b?.createdAt ?? 0).getTime())
//                                       .map((message, index) => {
//                                         const isSender = message.senderId === userData?.id;
//                                         const isLastMessage = index === dayMessages?.length - 1;
//                                         const formattedTime = format(new Date(message?.createdAt ?? 0), "hh:mm a");
//                                         const receiver = threadParticipants.find(
//                                           (p: any) => p.id === message.senderId && p.id !== userData?.id
//                                         );

//                                         const notificationMessage = message?.messageType === "notification";

//                                         return (
//                                           <div
//                                             key={index}
//                                             className={`flex gap-3 mt-4 items-start ${isSender ? 'justify-end' : ''}`}
//                                           // ref={isLastMessage ? messagesEndRef : null}
//                                           >
//                                             {notificationMessage &&

//                                               <div className="flex justify-center  rounded-xl text-center w-full  pt-6 p-3">
//                                                 <div className="bg-white shadow-md rounded-full w-fit px-8 py-4 pt-6">
//                                                   <div className="flex gap-2 items-center">
//                                                     <MdNotificationAdd size={24} />
//                                                     <p className="whitespace-pre-wrap break-words  text- text-sm">{message.message}</p>
//                                                   </div>
//                                                   <div className={`text-xs text-gray-400 px-2 mt-2 text-right`}>
//                                                     {formattedTime}
//                                                   </div>
//                                                 </div>

//                                               </div>
//                                             }
//                                             {!isSender && receiver && !notificationMessage && (
//                                               <div
//                                                 className="w-7 h-7 sm:w-10 bg-black mt-4 text-white sm:h-10 flex items-center justify-center bg-gray-300 text-white text-xs sm:text-sm font-semibold rounded-full bg-gray-800 text-white shrink-0"

//                                               >
//                                                 {getInitials(`${receiver?.firstName} ${receiver?.lastName}` || '')}
//                                               </div>
//                                             )}


//                                             {!notificationMessage &&

//                                               <div className="w-full flex flex-col gap-1">
//                                                 {/* Time aligned to sender/receiver side */}
//                                                 <div className={`text-xs text-gray-400 px-2 ${isSender ? "text-right" : "text-left"}`}>
//                                                   {formattedTime}
//                                                 </div>

//                                                 {/* Message container taking full width */}
//                                                 <div className={`w-full flex ${isSender ? "justify-end" : "justify-start"}`}>
//                                                   <div
//                                                     className={`p-3 sm:p-4 bg-black text-white  font-medium rounded-2xl shadow-md text-xs sm:text-sm max-w-full sm:max-w-[90%] 
//       `}
//                                                   >
//                                                     {/* Text message */}
//                                                     {message?.messageType !== "file" && message.message && (
//                                                       <p className="whitespace-pre-wrap break-words">{message.message}</p>
//                                                     )}

//                                                     {/* File message */}
//                                                     {message?.messageType === "file" && (
//                                                       <div className="rounded-lg flex items-center gap-3 p-2">
//                                                         {(() => {
//                                                           // Get the file URL - ensure it's not encrypted
//                                                           let fileUrl = message.message || "";

//                                                           // If the URL looks encrypted (starts with common encryption patterns), try to decrypt
//                                                           // But file URLs from S3 should not be encrypted, so only decrypt if it looks like encrypted text
//                                                           if (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('data:')) {
//                                                             try {
//                                                               const decrypted = decryptMessage(fileUrl);
//                                                               // Only use decrypted if it looks like a URL
//                                                               if (decrypted.startsWith('http') || decrypted.startsWith('data:')) {
//                                                                 fileUrl = decrypted;
//                                                               }
//                                                             } catch (error) {
//                                                               console.log("[ChatBox] File URL might not be encrypted:", error);
//                                                             }
//                                                           }

//                                                           if (message.fileType && imageMimeType.includes(message.fileType)) {
//                                                             return (
//                                                               <div
//                                                                 className="relative cursor-pointer group"
//                                                                 onClick={() => openMediaPreview(fileUrl, message.fileType ?? "")}
//                                                               >
//                                                                 <Image
//                                                                   src={fileUrl || "/placeholder.svg"}
//                                                                   alt="Uploaded Image"
//                                                                   width={140}
//                                                                   height={140}
//                                                                   unoptimized={true}
//                                                                   priority
//                                                                   className="rounded-lg max-w-[120px] hover:opacity-90 transition-opacity"
//                                                                   onError={(e) => {
//                                                                     console.error("[ChatBox] Failed to load image:", fileUrl);
//                                                                     // Fallback to placeholder
//                                                                     e.currentTarget.src = "/placeholder.svg";
//                                                                   }}
//                                                                 />
//                                                                 <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
//                                                                   <Maximize className="w-4 h-4 text-white" />
//                                                                 </div>
//                                                               </div>
//                                                             );
//                                                           } else if (message.fileType && videoMimeType?.includes(message.fileType)) {
//                                                             return (
//                                                               <video
//                                                                 controls
//                                                                 className="rounded-lg max-w-[120px]"
//                                                                 onClick={(e) => {
//                                                                   e.stopPropagation();
//                                                                   openMediaPreview(fileUrl, message.fileType || "");
//                                                                 }}
//                                                               >
//                                                                 <source src={fileUrl} type={message.fileType} />
//                                                                 Your browser does not support the video tag.
//                                                               </video>
//                                                             );
//                                                           } else {
//                                                             return (
//                                                               <div className="flex items-center gap-2 text-xs sm:text-sm">
//                                                                 <FileText className="w-5 h-5 text-gray-600" />
//                                                                 <span className="truncate max-w-[100px] sm:max-w-full">
//                                                                   {fileUrl ? fileUrl.slice(0, 20) : "File"}
//                                                                 </span>
//                                                                 <a
//                                                                   href={fileUrl}
//                                                                   target="_blank"
//                                                                   rel="noopener noreferrer"
//                                                                   className="text-blue-500 hover:underline"
//                                                                 >
//                                                                   <Eye className="w-4 h-4 text-orange-500" />
//                                                                 </a>
//                                                               </div>
//                                                             );
//                                                           }
//                                                         })()}
//                                                       </div>
//                                                     )}

//                                                     {/* Reply Preview */}
//                                                     {message.parentMessageId && (
//                                                       <div className="mt-2 p-2 border-l-4 border-gray-300 text-sm italic">
//                                                         Replying to: <span className="font-medium">{message.parentMessageId}</span>
//                                                       </div>
//                                                     )}

//                                                     {/* Seen indicator */}
//                                                     {isSender && isLastMessage && message.seen && (
//                                                       <div className="text-xs text-blue-500 mt-1 text-right">Seen</div>
//                                                     )}
//                                                   </div>
//                                                 </div>
//                                               </div>
//                                             }


//                                             {isSender && !notificationMessage && (
//                                               <div className="w-7 h-7 mt-4 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-300  bg-gray-800 text-white text-xs sm:text-sm font-semibold rounded-full shrink-0">
//                                                 {getInitials(`${userData?.firstname} ${userData?.lastname}` || '')}
//                                               </div>
//                                             )}
//                                           </div>
//                                         );
//                                       })}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                         </div>

//                         {selectedFile && (
//                           <div className="mx-4 mt-2 mb-3 relative">
//                             <div className="bg-gray-100 rounded-lg p-3 pr-10">
//                               <div className="flex items-start">
//                                 {selectedFile.type && imageTypes.includes(selectedFile.type) ? (
//                                   <div className="mr-3">
//                                     <div className="w-16 h-16 sm:w-20 sm:h-20 relative bg-[#FAF9F5] rounded-md overflow-hidden">
//                                       <img
//                                         src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
//                                         alt="Preview"
//                                         className="w-full h-full object-cover"
//                                       />
//                                     </div>
//                                   </div>
//                                 ) : selectedFile.type && selectedFile.type.startsWith("video/") ? (
//                                   <div className="mr-3">
//                                     <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[#FAF9F5] rounded-md relative">
//                                       <Play className="w-8 h-8 text-gray-500" />
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <div className="mr-3">
//                                     <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[#FAF9F5] rounded-md">
//                                       <FileText className="w-8 h-8 text-gray-500" />
//                                     </div>
//                                   </div>
//                                 )}
//                                 <div className="flex-1 min-w-0">
//                                   <p className="font-medium text-sm truncate">{selectedFile.name}</p>
//                                   <p className="text-xs text-gray-500 mt-1">
//                                     {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                                   </p>
//                                   <p className="text-xs text-gray-500 capitalize">{selectedFile.type.split("/")[0]}</p>
//                                 </div>
//                               </div>
//                               <button
//                                 className="absolute top-3 right-3 p-1 rounded-full hover:bg-[#FAF9F5] text-gray-500"
//                                 onClick={() => setSelectedFile(null)}
//                               >
//                                 <X className="w-4 h-4" />
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                         <div ref={messagesEndRef} />
//                       </ScrollArea>
//                       {/* Message Input Section
//                       <div className="p-4 border-t">
//                         <div className="flex items-center gap-2">
//                           <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100">
//                             <Paperclip className="h-5 w-5 text-gray-600" />
//                             <input type="file" className="hidden" onChange={handleFileChange} />
//                           </label>
//                           <form
//                             className="flex-1 py-2 px-4"
//                             onSubmit={(e) => {
//                               e.preventDefault()
//                               handleSendMessage()
//                             }}
//                           >
//                             <Input
//                               className="flex-1 py-2 px-4 border rounded-lg focus:outline-none"
//                               placeholder="Type a message..."
//                               value={message}
//                               onChange={handleInputChange}
//                             />
//                           </form>
//                           <Button
//                             size="icon"
//                             className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex px-3 gap-2"
//                             onClick={handleSendMessage}
//                           >
//                             <Send className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div> */}

//                       <div className="p-2 sm:p-4 border-t relative">
//                         {fileErrorMsg && (
//                           <div className="absolute -top-10 left-0 right-0 bg-red-100 text-red-600 p-2 text-xs sm:text-sm text-center">
//                             {fileErrorMsg}
//                           </div>
//                         )}
//                         <div className="flex items-center gap-1 sm:gap-2">
//                           {/* File Upload with dropdown */}
//                           <div className="relative">
//                             <button
//                               className="cursor-pointer  p-1 sm:p-2 rounded-full hover:bg-[#FAF9F5]"
//                               onClick={toggleUploadMenu}
//                             >
//                               <FolderOpenDot className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
//                             </button>
//                             {showUploadMenu && (
//                               <div
//                                 ref={uploadMenuRef}
//                                 className="absolute bottom-full left-0 mb-2 bg-white  rounded-lg z-10 w-48"
//                               >
//                                 <div className="p-2 shadow text-xs sm:text-sm">
//                                   <p className="font-medium mb-1">Upload file</p>
//                                   <Image
//                                     src="/assets/images/v2/pangea_logo1.jpg"
//                                     alt="Powered by Pangea"
//                                     width={100}
//                                     height={100}
//                                     className="absolute top-2 right-2 object-contain"
//                                   />
//                                   <div className="space-y-2">
//                                     <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
//                                       <Paperclip className="h-4 w-4 text-blue-500" />
//                                       <span>Image</span>
//                                       <input
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleFileChange}
//                                         accept="image/jpeg,image/png,image/jpg"
//                                       />
//                                     </label>
//                                     <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
//                                       <Play className="h-4 w-4 text-red-500" />
//                                       <span>Video</span>
//                                       <input
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleFileChange}
//                                         accept="video/mp4,video/webm,video/ogg"
//                                       />
//                                     </label>
//                                     <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer">
//                                       <FileText className="h-4 w-4 text-gray-500" />
//                                       <span>Document</span>
//                                       <input
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleFileChange}
//                                         accept="application/pdf"
//                                       />
//                                     </label>
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>

//                           <div className="relative">
//                             <button
//                               type="button"
//                               className="p-1 sm:p-2 rounded-full bg-[#FAF9F5] hover:bg-[#FAF9F5]"
//                               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//                             >
//                               <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
//                             </button>
//                             {showEmojiPicker && (
//                               <div
//                                 ref={emojiPickerRef}
//                                 className="absolute bottom-12 left-0 z-10 scale-75 sm:scale-100 origin-bottom-left">
//                                 <EmojiPicker onEmojiClick={handleEmojiClick} />
//                               </div>
//                             )}
//                           </div>

//                           {/* Message Input */}
//                           <form
//                             className="flex-1 py-1 sm:py-2 px-2 sm:px-4"
//                             onSubmit={(e) => {
//                               e.preventDefault();
//                               handleSendMessage();
//                             }}
//                           >
//                             <Input
//                               className="flex-1 py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm border rounded-lg focus:outline-none"
//                               placeholder="Type a message..."
//                               value={message}
//                               onChange={handleInputChange}
//                             />
//                           </form>

//                           {/* Send Button */}
//                           <Button
//                             size="icon"
//                             className="bg-black text-white rounded-xl flex h-8 w-8 sm:h-10 sm:w-auto sm:px-3 sm:gap-2 items-center justify-center"
//                             onClick={handleSendMessage}
//                           > <SendHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
//                             <span className="hidden sm:inline">Send</span>

//                           </Button>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   {/* <div className="text-center mt-6 text-gray-400">
//                             <p className="text-lg font-semibold">No thread is Selected</p>
//                             <p className="text-sm">It seems like you haven't started any conversations yet.</p>
//                         </div> */}
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Property Details Sidebar */}
//           {isDetails && (
//             <div className={`w-full md:w-96 bg-gray-50 border-l ${showDetails ? "block" : "hidden md:block"}`}>
//               <div className="p-4 border-b flex justify-between items-center">
//                 <h2 className="font-semibold">Property Details</h2>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     setIsDetails(false)
//                     setShowDetails(false)
//                   }}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//               <ScrollArea className="h-[calc(82vh-10rem)]">
//                 <div className="p-4">
//                   {/* <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//                                         <Carousel images={propertyDetails?.property?.property?.imageURLs} />
//                                     </div> */}
//                   <div className="relative">
//                     <Image
//                       src={propertyData?.media?.photosList?.[0]?.lowRes || ""}
//                       alt={`Property Image `}
//                       width={400}
//                       height={100}
//                       className="rounded-lg objectcover"
//                       priority
//                       unoptimized
//                     />
//                   </div>
//                   <div className="mt-4">
//                     <div className="flex justify-between items-start">
//                       <div className="flex items-start gap-1">
//                         <LocationOnIcon className="text-primary" />
//                         <div>
//                           {/* <h3 className="font-semibold text-lg">{propertyDetails?.property?.address}</h3> */}
//                           <p className="text-sm text-muted-foreground">{propertyData?.courtesyOf}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Star className="h-4 w-4 fill-primary text-primary" />
//                         <span>4.6</span>
//                       </div>
//                     </div>

//                     {/* Additional Info */}
//                     <div className="flex justify-between items-center mt-4">
//                       <div className="flex gap-2">
//                         {/* Bedroom Capsule */}
//                         <div className="bg-gray-200 text-sm rounded-full px-3 py-1 flex items-center">
//                           <BathtubIcon />
//                           <span>{propertyData?.property?.bathroomsTotal
//                           } Bath</span>
//                         </div>
//                         {/* Bathroom Capsule */}
//                         <div className="bg-gray-200 text-sm rounded-full px-3 py-1 flex items-center">
//                           <KingBedIcon />
//                           <span>{propertyData?.property?.bedroomsTotal} Bed</span>
//                         </div>
//                       </div>
//                       {/* Heart Icon */}
//                       <FavoriteBorder className="text-gray-500 hover:text-red-500 cursor-pointer" />
//                     </div>
//                   </div>
//                   <div className="mt-4">
//                     <h4 className="font-semibold text-lg">Overview</h4>
//                     <span>

//                       {propertyData?.publicRemarks}
//                     </span>

//                     {/* Modal for full description */}
//                     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Property Overview</DialogTitle>
//                           <DialogDescription>{propertyData?.property?.descriptions?.[0]?.value}</DialogDescription>
//                         </DialogHeader>
//                         <DialogClose asChild>
//                           <Button className="bg-orange-500 hover:bg-orange-600">Close</Button>
//                         </DialogClose>
//                       </DialogContent>
//                     </Dialog>
//                   </div>

//                   <div className="mt-6">
//                     <h4 className="font-medium mb-2">Amenities</h4>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="flex items-center gap-2">
//                         <Wifi className="h-4 w-4" />
//                         <span className="text-sm">Wifi</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Kitchen className="h-4 w-4" />
//                         <span className="text-sm">Kitchen</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Maximize2 className="h-4 w-4" />
//                         <span className="text-sm">Workspace</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Car className="h-4 w-4" />
//                         <span className="text-sm">Free parking</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Wind className="h-4 w-4" />
//                         <span className="text-sm">Air conditioning</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </ScrollArea>
//               <Button
//                 className="ms-2 me-5 shadow bg-orange-500 hover:bg-orange-600 w-full mt-6"
//                 onClick={() => {
//                   router.push(`/buy/${propertyData.property?.id}/prop/preview`)
//                 }}
//               >
//                 View details
//               </Button>
//             </div>
//           )}
//         </div>
//       </section>
//       {mediaPreview && (
//         <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
//           <div className="relative w-full h-full flex items-center justify-center">
//             <button
//               onClick={closeMediaPreview}
//               className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white z-20"
//             >
//               <X className="h-6 w-6" />
//             </button>

//             {/* Navigation controls */}
//             {/* {allMediaFiles.length > 1 && (
//                           <>
//                             <button
//                               onClick={goToPrevMedia}
//                               disabled={currentMediaIndex === 0}
//                               className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full ${currentMediaIndex === 0 ? 'bg-gray-500/30 cursor-not-allowed' : 'bg-black/50 hover:bg-black/70 cursor-pointer'} text-white z-20`}
//                             >
//                               <ArrowLeft className="h-6 w-6" />
//                             </button>
//                             <button
//                               onClick={goToNextMedia}
//                               disabled={currentMediaIndex === allMediaFiles.length - 1}
//                               className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full ${currentMediaIndex === allMediaFiles.length - 1 ? 'bg-gray-500/30 cursor-not-allowed' : 'bg-black/50 hover:bg-black/70 cursor-pointer'} text-white z-20`}
//                             >
//                               <ArrowRight className="h-6 w-6" />
//                             </button>
//                           </>
//                         )} */}

//             {/* Zoom controls for images */}
//             {mediaPreview.type &&
//               imageMimeType.includes(mediaPreview.type) &&
//               !mediaPreview.loading &&
//               !mediaPreview.error && (
//                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2 z-20">
//                   <button
//                     onClick={() => handleZoom(false)}
//                     className="text-white hover:text-gray-200"
//                     disabled={zoomLevel <= 0.5}
//                   >
//                     <ZoomOut className="h-5 w-5" />
//                   </button>
//                   <span className="text-white text-sm">{Math.round(zoomLevel * 100)}%</span>
//                   <button
//                     onClick={() => handleZoom(true)}
//                     className="text-white hover:text-gray-200"
//                     disabled={zoomLevel >= 3}
//                   >
//                     <ZoomIn className="h-5 w-5" />
//                   </button>
//                 </div>
//               )}

//             <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm z-20 max-w-[80%] truncate">
//               {mediaPreview.name || "Media Preview"}
//             </div>

//             <div className="max-w-full max-h-full overflow-auto">
//               {/* Loading indicator */}
//               {mediaPreview.loading && (
//                 <div className="flex flex-col items-center justify-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
//                   <p className="text-white text-sm">Loading image...</p>
//                 </div>
//               )}

//               {/* Error message */}
//               {mediaPreview.error && (
//                 <div className="flex flex-col items-center justify-center">
//                   <div className="bg-red-600/20 p-8 rounded-lg text-center">
//                     <p className="text-white text-lg mb-2">Failed to load image</p>
//                     <p className="text-gray-300 text-sm">The image could not be loaded due to an error.</p>
//                   </div>
//                 </div>
//               )}

//               {/* Image preview */}
//               {mediaPreview.type &&
//                 imageMimeType.includes(mediaPreview.type) &&
//                 !mediaPreview.loading &&
//                 !mediaPreview.error ? (
//                 <div
//                   className="relative flex items-center justify-center w-full h-full"
//                   style={{
//                     transform: `scale(${zoomLevel})`,
//                     transition: "transform 0.2s ease-out",
//                   }}
//                 >
//                   <img
//                     src={mediaPreview.url || "/placeholder.svg"}
//                     alt="Image Preview"
//                     className="max-w-full max-h-[90vh] object-contain"
//                     onLoad={() => console.log("Image loaded successfully")}
//                     onError={(e) => {
//                       console.error("Image failed to display in preview:", e)
//                       setMediaPreview((prev) => (prev ? { ...prev, error: true } : null))
//                     }}
//                   />
//                 </div>
//               ) : mediaPreview.type && videoMimeType.includes(mediaPreview.type) ? (
//                 <div className="relative max-w-4xl w-full">
//                   <video
//                     src={mediaPreview.url}
//                     controls
//                     autoPlay
//                     className="max-w-full max-h-[90vh]"
//                     onError={(e) => {
//                       console.error("Video failed to load:", e)
//                       setMediaPreview((prev) => (prev ? { ...prev, error: true } : null))
//                     }}
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               ) : (
//                 !mediaPreview.loading &&
//                 !mediaPreview.error && (
//                   <div className="bg-white rounded-lg p-8 text-center max-w-lg">
//                     <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//                     <p className="text-xl font-medium mb-2">File preview not available</p>
//                     <p className="text-gray-500 mb-6">{mediaPreview.name}</p>
//                     <a
//                       href={mediaPreview.url}
//                       download
//                       className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       <Download className="h-4 w-4 mr-2" /> Download File
//                     </a>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// const hashCode = (str: string) => str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)


"use client"

import Image from "next/image"
import Link from "next/link"
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
  ArrowDown,
} from "lucide-react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { Badge } from "@/components/ui/badge"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, formatDistanceToNow, isSameDay, subDays } from "date-fns"
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env"
import { SocketContext } from "@/providers/socket.context"
import { useAgentConversationApi } from "@/hooks/api/auth/useConversationApi"
import { decryptMessage, encryptMessage, generateColorFromName } from "@/utils/math-utilities"
import { useMessagesApi } from "@/hooks/api/useFetchMessages"
import { useUserAgentMessageApi } from "@/hooks/api/auth/useMessageApi"
import { useUserAuthApi } from "@/hooks/api/auth/useUserAuthApi"
import { AgentDirectoryWrapper } from "@/components/buy/preview/agent-directory-wrapper"
import InviteUserModal from "./Invite-user-modal"
import { threadId } from "worker_threads"
import { useAtom } from "jotai"
import { messageThreadsAtom } from "@/hooks/atoms"
import { Loader } from "@mantine/core"
import { usePropertyServiceAPI } from "@/hooks/api/agent/useAgentProperty"
import { useRepoManagementApi } from "@/hooks/api/document/useRepoManagement"
import { useNotificationApi } from "@/hooks/api/user/useNotification"
import { error, success } from "../alert/notify"
import { useAuth } from "@/shared/hooks/useAuth"
import { MdNotificationAdd } from "react-icons/md"

import { useCollectionModal } from "@/providers/collection-modal-provider"
import { useUserSnapAPIs } from "@/hooks/api/auth/snaps.API"
import { SnapzHeartButton } from "@/components/ui/snapz-heart"
import { usePropertyActions } from "@/shared/hooks/useProperty"
import { v4 as uuidv4 } from "uuid"


interface User {
  id: string
  username: string
  message: string
  image: string
}
interface Message {
  id?: string;
  fileType?: string;
  messageType?: string;
  eventType?: "user_added" | "document_shared" | "media_shared";
  meta?: {
    actor?: { id?: string; name?: string };
    target?: { id?: string; name?: string };
    file?: { name?: string; url?: string; mimeType?: string };
  };
  threadId: string
  message?: string
  content?: string
  senderId?: string
  roomId?: string
  createdAt?: string
  receiverId?: string
  timestamp?: string
  seen?: boolean
  isRead?: boolean
  read?: boolean
  parentMessageId?: string | null
  file?: {
    name?: string
    url?: string
    type?: string
  }
  documents?: string[]
  fileUrl?: string
  message_type?: string
  file_type?: string
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
  messages?: any
  id: string
  threadName?: string
  updatedAt?: string | null
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
interface AgentPropertySummary {
  propertyId: string
  propertyName?: string
  propertyAddress?: string
  threadId?: string
  listingId?: string
  participants?: any[]
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
interface InvitedUserListItem {
  id: string
  name: string
  email: string
  role: string
  initials: string
  status: "accepted" | "pending" | "expired" | "declined"
}
interface MediaDocumentListItem {
  id: string
  url: string
  fileType: string
  fileName: string
  kind: "image" | "video" | "document"
  senderName: string
  createdAt?: string
}
const INVITED_USERS_STORAGE_KEY = "chat_invited_users_by_thread_v1"
const MAX_INVITES_PER_CHAT = 5

export default function ChatBoxComponent(props: any) {
  const { threads, setIsRead, setSearch, loading, threadId, isRead, embedded } = props
  const router = useRouter()
  const params = useSearchParams();
  const type = params?.get('type')
  const focusLatestFromNotification = params?.get('focusLatest') === '1'
  const { socket, state, setState } = useContext(SocketContext)
  // const [isDetails, setIsDetails] = useState(false)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
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
  const { user, isLoggedIn } = useAuth();
  const { openCollectionModal } = useCollectionModal()
  const { getAllSnaps } = useUserSnapAPIs()
  const mutateGetAllSnaps = getAllSnaps.mutate
  const { saveCurrenctProperty } = usePropertyActions()
  const currentUser = user?.account_type;
  const [snaps, setSnaps] = useState<any[]>([])
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
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [selectedThread, setSelectedThread] = useState<any>("")
  const [threadParticipants, setThreadParticipant] = useState<any>([])
  const [selectedThreadDetail, setSelectedThreadDetail] = useState<any>("")
  const [expandedEntryKey, setExpandedEntryKey] = useState<string | null>(null)
  const [persistedInvitesByThread, setPersistedInvitesByThread] = useState<Record<string, any[]>>({})
  const pathname = useSearchParams();
  const [messageThreads, setMessageThreads] = useAtom(messageThreadsAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageScrollAreaRef = useRef<HTMLDivElement>(null);
  const isAtLatestMessageRef = useRef(true);
  const shouldAutoScrollOnIncomingRef = useRef(false);
  const hasHandledNotificationFocusRef = useRef(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isContactAgentDialogOpen, setIsContactAgentDialogOpen] = useState(false);
  const [isSearchAgentModalOpen, setIsSearchAgentModalOpen] = useState(false);
  const [isInviteAgentModalOpen, setIsInviteAgentModalOpen] = useState(false);
  const [inviteAgentEmail, setInviteAgentEmail] = useState('');
  const [inviteAgentError, setInviteAgentError] = useState('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [locallyReadThreadIds, setLocallyReadThreadIds] = useState<Record<string, number>>({});
  const [pendingNewMessageCount, setPendingNewMessageCount] = useState(0);
  const [isAtLatestMessage, setIsAtLatestMessage] = useState(true);

  const fetchSnaps = () => {
    const currentUserId = userData?.id
    if (!currentUserId) {
      setSnaps([])
      return
    }

    mutateGetAllSnaps(currentUserId, {
      onSuccess: (data: any) => {
        setSnaps(Array.isArray(data) ? data : [])
      },
      onError: () => {
        setSnaps([])
      },
    })
  }

  useEffect(() => {
    if (!userData?.id) {
      setSnaps([])
      return
    }
    mutateGetAllSnaps(userData.id, {
      onSuccess: (data: any) => {
        setSnaps(Array.isArray(data) ? data : [])
      },
      onError: () => {
        setSnaps([])
      },
    })
  }, [mutateGetAllSnaps, userData?.id])

  const snapzPropertyId = useMemo(
    () =>
      selectedThreadDetail?.propertyId ||
      propertyData?.propertyId ||
      propertyData?.id ||
      "",
    [propertyData?.id, propertyData?.propertyId, selectedThreadDetail?.propertyId],
  )

  const snapzListingId = useMemo(
    () =>
      selectedThreadDetail?.listingId ||
      propertyData?.listingId ||
      "",
    [propertyData?.listingId, selectedThreadDetail?.listingId],
  )

  const snapzPropertyImage = useMemo(
    () =>
      propertyData?.listing?.media?.primaryListingImageUrl ||
      propertyData?.media?.primaryListingImageUrl ||
      propertyData?.media?.photosList?.[0]?.lowRes ||
      propertyData?.public?.imageUrl ||
      "/assets/images/property-placeholder.jpg",
    [propertyData],
  )

  const isPropertyInFavourite = useCallback(
    (snapsList: any[]) => {
      if (!Array.isArray(snapsList)) {
        return false
      }

      return snapsList.some((snap: any) =>
        snap?.favourites?.some((favourite: any) => {
          if (!favourite) return false
          const propertyIdMatch =
            !!snapzPropertyId && favourite?.propertyId == snapzPropertyId
          const listingIdMatch =
            !!snapzListingId && favourite?.listingId == snapzListingId
          return propertyIdMatch || listingIdMatch
        }),
      )
    },
    [snapzListingId, snapzPropertyId],
  )

  const isFavored = isPropertyInFavourite(snaps)

  interface AggregatedAgentThread {
    entryKey: string;
    agentId?: string;
    baseThread: Thread;
    properties: AgentPropertySummary[];
    latestUpdatedAt: number;
    totalUnread: number;
  }

  const aggregatedThreads = useMemo<AggregatedAgentThread[]>(() => {
    if (!Array.isArray(threads)) {
      return [];
    }

    const groupMap = new Map<string, AggregatedAgentThread>();
    const standaloneEntries: AggregatedAgentThread[] = [];
    const normalizeThreadId = (value?: string | null) =>
      (value || "").toString().trim().toLowerCase();

    const resolveAgentCandidate = (thread: Thread) =>
      thread?.buyerAgent ||
      thread?.sellerAgent ||
      thread?.participants
        ?.map((participant: any) => participant?.user)
        .find(
          (participant: any) =>
            participant?.id && participant.id !== userData?.id,
        );

    const resolvePropertyIdentifier = (thread: Thread) =>
      (thread?.propertyId && thread.propertyId.toString()) ||
      (thread?.listingId && thread.listingId.toString()) ||
      thread?.id;

    const resolveLastUpdated = (thread: Thread) => {
      const lastMessage =
        Array.isArray(thread?.messages) && thread.messages.length
          ? thread.messages[thread.messages.length - 1]
          : null;
      return new Date(
        thread?.updatedAt ||
        thread?.lastMessageAt ||
        lastMessage?.createdAt ||
        0,
      ).getTime();
    };

    threads.forEach((thread: Thread) => {
      const agentCandidate = resolveAgentCandidate(thread);
      const agentId = agentCandidate?.id;
      const propertyIdentifier = resolvePropertyIdentifier(thread);
      const propertySummary: AgentPropertySummary | undefined = propertyIdentifier
        ? {
          propertyId: propertyIdentifier,
          propertyName: thread?.propertyName,
          propertyAddress: thread?.propertyAddress,
          threadId: thread?.id,
          listingId: thread?.listingId,
          participants: thread?.participants,
        }
        : undefined;

      const updatedAt = resolveLastUpdated(thread);
      const unreadCountFromMessages = Array.isArray(thread?.messages)
        ? thread.messages.filter((message: Message) => {
          const isUnread =
            message?.isRead === false ||
            message?.read === false ||
            message?.seen === false;
          if (!isUnread) return false;
          const senderId =
            message?.senderId ||
            (message as any)?.sender_id ||
            (message as any)?.sender?.id;
          return !senderId || senderId !== userData?.id;
        }).length
        : 0;
      const socketUnreadCount = Array.isArray(state?.conversationUnreadCount)
        ? state.conversationUnreadCount.find(
          (entry: any) =>
            normalizeThreadId(entry?.threadId) === normalizeThreadId(thread?.id),
        )?.count || 0
        : 0;
      const normalizedThreadId = normalizeThreadId(thread?.id);
      const lastMessageTime = updatedAt || 0;
      const localReadAt = locallyReadThreadIds[normalizedThreadId] || 0;
      const isLocallyRead = localReadAt > 0 && localReadAt >= lastMessageTime;
      let unreadCount = 0;
      if (socketUnreadCount > 0) {
        unreadCount = socketUnreadCount;
      } else if (isLocallyRead) {
        unreadCount = 0;
      } else {
        unreadCount = thread?.unreadCount ?? unreadCountFromMessages;
      }

      if (agentId) {
        let entry = groupMap.get(agentId);
        if (!entry) {
          entry = {
            entryKey: agentId,
            agentId,
            baseThread: thread,
            properties:
              propertySummary && propertySummary.propertyId
                ? [propertySummary]
                : [],
            latestUpdatedAt: updatedAt,
            totalUnread: unreadCount,
          };
          groupMap.set(agentId, entry);
        } else {
          if (updatedAt > entry.latestUpdatedAt) {
            entry.baseThread = thread;
            entry.latestUpdatedAt = updatedAt;
          }
          entry.totalUnread += unreadCount;
          if (
            propertySummary &&
            propertySummary.propertyId &&
            !entry.properties.some(
              (property) => property.propertyId === propertySummary.propertyId,
            )
          ) {
            entry.properties.push(propertySummary);
          }
        }
      } else {
        standaloneEntries.push({
          entryKey:
            thread?.id || crypto.randomUUID?.() || Math.random().toString(36),
          baseThread: thread,
          properties:
            propertySummary && propertySummary.propertyId
              ? [propertySummary]
              : [],
          latestUpdatedAt: updatedAt,
          totalUnread: unreadCount,
        });
      }
    });

    const aggregated = [
      ...Array.from(groupMap.values()),
      ...standaloneEntries,
    ];

    aggregated.sort(
      (a, b) => (b.latestUpdatedAt || 0) - (a.latestUpdatedAt || 0),
    );

    return aggregated;
  }, [threads, userData?.id, locallyReadThreadIds, state?.conversationUnreadCount]);

  const displayedThreads = useMemo<AggregatedAgentThread[]>(() => {
    if (showUnreadOnly) {
      return aggregatedThreads.filter(
        (entry) => (entry.totalUnread || 0) > 0,
      );
    }
    return aggregatedThreads;
  }, [aggregatedThreads, showUnreadOnly]);

  const unreadMessageCount = useMemo(() => {
    return aggregatedThreads.reduce(
      (total, entry) => total + (entry.totalUnread || 0),
      0,
    );
  }, [aggregatedThreads]);

  const getMessageViewportElement = useCallback(() => {
    return messageScrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;
  }, []);

  const updateLatestMessageState = useCallback(() => {
    const viewport = getMessageViewportElement();
    if (!viewport) return;

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const atLatest = distanceFromBottom <= 80;

    isAtLatestMessageRef.current = atLatest;
    setIsAtLatestMessage(atLatest);

    if (atLatest) {
      setPendingNewMessageCount(0);
    }
    setState((prev: any) =>
      prev.isCurrentChatAtBottom === atLatest
        ? prev
        : {
          ...prev,
          isCurrentChatAtBottom: atLatest,
        },
    );
  }, [getMessageViewportElement]);

  const scrollToLatestMessages = useCallback(() => {
    setPendingNewMessageCount(0);
    setIsAtLatestMessage(true);
    isAtLatestMessageRef.current = true;
    const viewport = getMessageViewportElement();
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [getMessageViewportElement]);

  const scrollToLatestMessagesWithRetry = useCallback((attempts = 8) => {
    let remainingAttempts = attempts;
    const tryScroll = () => {
      scrollToLatestMessages();
      const viewport = getMessageViewportElement();
      const distanceFromBottom = viewport
        ? viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
        : Number.MAX_SAFE_INTEGER;

      if (distanceFromBottom <= 4) {
        updateLatestMessageState();
        return;
      }

      remainingAttempts -= 1;
      if (remainingAttempts <= 0) {
        updateLatestMessageState();
        return;
      }
      setTimeout(tryScroll, 120);
    };
    tryScroll();
  }, [getMessageViewportElement, scrollToLatestMessages, updateLatestMessageState]);

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(INVITED_USERS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") {
        setPersistedInvitesByThread(parsed)
      }
    } catch (err) {
      console.error("[chat-box] Failed to load persisted invites:", err)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(INVITED_USERS_STORAGE_KEY, JSON.stringify(persistedInvitesByThread))
    } catch (err) {
      console.error("[chat-box] Failed to persist invites:", err)
    }
  }, [persistedInvitesByThread])

  const invitedUsers = useMemo<InvitedUserListItem[]>(() => {
    const inviteExpiryMs = 10 * 24 * 60 * 60 * 1000
    const currentThreadId = String(selectedThreadDetail?.id || selectedThread || "")
    const backendParticipants = Array.isArray(selectedThreadDetail?.participants)
      ? selectedThreadDetail.participants
      : []
    const persistedParticipants = currentThreadId
      ? (persistedInvitesByThread[currentThreadId] || [])
      : []
    const rawParticipants = [...backendParticipants, ...persistedParticipants]
    const seenKeys = new Set<string>()
    const normalizedUsers: InvitedUserListItem[] = []

    const toInitials = (name?: string, email?: string) => {
      if (name?.trim()) {
        const words = name.trim().split(/\s+/).filter(Boolean)
        const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
        if (initials) return initials
      }
      if (email?.trim()) {
        return email.trim().slice(0, 2).toUpperCase()
      }
      return "NA"
    }
    const getRoleLabel = (rawRole?: string) => {
      const normalizedRole = String(rawRole || "").toLowerCase()
      if (!normalizedRole) return "Role not set"
      if (normalizedRole.includes("buyer_agent") || normalizedRole.includes("buyer agent")) return "Buyer Agent"
      if (normalizedRole.includes("co_buyer") || normalizedRole.includes("co-buyer") || normalizedRole.includes("cobuyer")) return "Co-buyer"
      if (normalizedRole.includes("family_friends") || normalizedRole.includes("family/friends") || normalizedRole.includes("family friends")) return "Family/Friends"
      return rawRole || "Role not set"
    }

    rawParticipants.forEach((participant: any, index: number) => {
      const userDetails = participant?.user ?? participant ?? {}
      const firstName = userDetails?.firstName || ""
      const lastName = userDetails?.lastName || ""
      const combinedName = `${firstName} ${lastName}`.trim()
      const email = userDetails?.email || participant?.email || ""
      const name = combinedName || email?.split("@")?.[0] || "Invited User"
      const role = getRoleLabel(
        participant?.inviteRole ||
        participant?.role ||
        participant?.agentType ||
        participant?.accountType ||
        participant?.user?.accountType,
      )
      const id = String(userDetails?.id || participant?.id || `${email}-${index}`)
      const dedupeKey = email
        ? `email-${String(email).toLowerCase()}`
        : userDetails?.id || participant?.id
          ? `id-${String(userDetails?.id || participant?.id).toLowerCase()}`
          : `fallback-${index}`

      if (seenKeys.has(dedupeKey)) {
        return
      }
      seenKeys.add(dedupeKey)

      const rawStatus = String(
        participant?.approvalStatus ??
        participant?.status ??
        participant?.inviteStatus ??
        participant?.invitationStatus ??
        "",
      ).toLowerCase()

      let status: InvitedUserListItem["status"] = "pending"
      const isDeclined =
        Boolean(participant?.isDeclined) ||
        rawStatus.includes("declin") ||
        rawStatus.includes("reject")
      const isAccepted =
        participant?.is_accepted === true ||
        participant?.isAccepted === true ||
        rawStatus.includes("accept") ||
        rawStatus.includes("approv") ||
        rawStatus.includes("join")

      if (isDeclined) {
        status = "declined"
      } else if (isAccepted) {
        status = "accepted"
      } else {
        const inviteDateRaw =
          participant?.createdAt ||
          participant?.invitedAt ||
          participant?.inviteSentAt ||
          participant?.requestedAt ||
          participant?.joinDate
        const inviteDate = inviteDateRaw ? new Date(inviteDateRaw) : null
        const isValidInviteDate = inviteDate instanceof Date && !Number.isNaN(inviteDate.getTime())
        if (isValidInviteDate && Date.now() - inviteDate.getTime() > inviteExpiryMs) {
          status = "expired"
        }
      }

      {/* Modified here by Abhradip Paul role typescript error*/ }
      normalizedUsers.push({
        id,
        name,
        email,
        role: role || "",
        initials: toInitials(name, email),
        status,
      })
    })

    return normalizedUsers
  }, [persistedInvitesByThread, selectedThread, selectedThreadDetail?.id, selectedThreadDetail?.participants]);

  const invitedUserStyles: Record<InvitedUserListItem["status"], { name: string; email: string; badge: string; avatar: string; label: string }> = {
    accepted: {
      name: "text-gray-900",
      email: "text-gray-500",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      avatar: "bg-white text-gray-700 border-gray-400",
      label: "Accepted",
    },
    pending: {
      name: "text-gray-900",
      email: "text-gray-500",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      avatar: "bg-white text-orange-700 border-orange-300",
      label: "Pending",
    },
    expired: {
      name: "text-red-600",
      email: "text-red-400",
      badge: "bg-red-50 text-red-700 border-red-200",
      avatar: "bg-white text-red-700 border-red-300",
      label: "Expired",
    },
    declined: {
      name: "text-gray-400",
      email: "text-gray-400",
      badge: "bg-gray-100 text-gray-400 border-gray-200",
      avatar: "bg-white text-gray-400 border-gray-300",
      label: "Declined",
    },
  }
  const totalParticipantsCount = Array.isArray(threadParticipants) ? threadParticipants.length : 0
  const isInviteLimitReached = totalParticipantsCount >= MAX_INVITES_PER_CHAT
  const inviteLimitMessage = `No more than ${MAX_INVITES_PER_CHAT} participants can be in this chat.`
  const blockedInviteEmails = useMemo(() => {
    const collectedEmails = new Set<string>()
    const pushEmail = (value?: string) => {
      const normalized = String(value || "").trim().toLowerCase()
      if (normalized) collectedEmails.add(normalized)
    }

    invitedUsers.forEach((invitedUser) => pushEmail(invitedUser.email))
    if (Array.isArray(threadParticipants)) {
      threadParticipants.forEach((participant: any) => pushEmail(participant?.email))
    }
    pushEmail(selectedThreadDetail?.user?.email)
    pushEmail(selectedThreadDetail?.buyerAgent?.email)
    pushEmail(selectedThreadDetail?.sellerAgent?.email)
    pushEmail(userData?.email)
    pushEmail(user?.email)

    return Array.from(collectedEmails)
  }, [
    invitedUsers,
    selectedThreadDetail?.buyerAgent?.email,
    selectedThreadDetail?.sellerAgent?.email,
    selectedThreadDetail?.user?.email,
    threadParticipants,
    user?.email,
    userData?.email,
  ])

  console.log(selectedThreadDetail);
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
  const allowedFileTypes = [...imageMimeType, ...videoMimeType, "application/pdf"]
  const extensionToMimeType: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    tiff: 'image/tiff',
    ico: 'image/x-icon',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    mkv: 'video/x-matroska',
    '3gp': 'video/3gpp',
    ts: 'video/mp2t',
    m4v: 'video/x-m4v',
    pdf: 'application/pdf'
  }
  const isProbablyUrl = (value?: string) =>
    !!value && (/^https?:\/\//i.test(value) || value.startsWith('data:'))
  const getMimeTypeFromUrl = (url?: string) => {
    if (!url) return undefined
    if (url.startsWith('data:')) {
      const dataType = url.slice(5, url.indexOf(';'))
      return dataType || undefined
    }
    const match = url.match(/\.([a-z0-9]+)(?:\?|#|$)/i)
    if (!match) return undefined
    return extensionToMimeType[match[1].toLowerCase()]
  }
  const decryptMessageSafely = (value?: string) => {
    if (!value) return ''
    if (isProbablyUrl(value)) return value
    try {
      const decrypted = decryptMessage(value)
      return isProbablyUrl(decrypted) || decrypted ? decrypted : value
    } catch (error) {
      console.log("[ChatBox] Message might not be encrypted, using as-is")
      return value
    }
  }
  const normalizeMessage = (message: Message) => {
    const rawMessage = message.message ?? message.content ?? ''
    const decryptedMessage = decryptMessageSafely(rawMessage)
    const normalizedMessageType =
      message.messageType ||
      message.message_type ||
      (message.fileType || message.file_type ? 'file' : 'text')
    const fileUrlCandidate =
      message.file?.url ||
      (isProbablyUrl(decryptedMessage) ? decryptedMessage : '') ||
      message.documents?.[0] ||
      message.fileUrl ||
      ''
    const derivedFileType =
      message.fileType || message.file_type || getMimeTypeFromUrl(fileUrlCandidate)
    const finalMessageType =
      normalizedMessageType === 'system'
        ? 'system'
        : normalizedMessageType === 'text' && (fileUrlCandidate || derivedFileType)
          ? 'file'
          : normalizedMessageType
    return {
      ...message,
      message: decryptedMessage,
      messageType: finalMessageType,
      fileType: derivedFileType,
      fileUrl: fileUrlCandidate || message.fileUrl
    }
  }

  const getSystemMessageText = (message: Message) => {
    const actor = message?.meta?.actor?.name || "Someone";
    const target = message?.meta?.target?.name || "someone";
    const eventType = message?.eventType;

    if (eventType === "user_added") {
      return `${actor} added ${target}`;
    }
    if (eventType === "document_shared") {
      return `${actor} shared a document`;
    }
    if (eventType === "media_shared") {
      return `${actor} shared media`;
    }
    return message?.message || "System update";
  };
  const getFileNameFromUrl = useCallback((url: string) => {
    try {
      if (!url) return "File"
      const cleanUrl = url.split("?")[0]
      const fileName = cleanUrl.split("/").pop() || "File"
      const decodedFileName = decodeURIComponent(fileName)
      const uuidPattern =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-?/
      return decodedFileName.replace(uuidPattern, "")
    } catch (error) {
      console.error("[ChatBox] Failed to parse file name:", error)
      return "File"
    }
  }, [])
  const resolveAttachmentUrlFromMessage = useCallback((message: Message): string => {
    const candidateValues = [
      message?.file?.url,
      message?.fileUrl,
      ...(Array.isArray(message?.documents) ? message.documents : []),
      message?.messageType === "file" || message?.message_type === "file"
        ? message?.message
        : undefined,
    ]

    for (const rawCandidate of candidateValues) {
      if (typeof rawCandidate !== "string") continue
      let candidate = rawCandidate.trim()
      if (!candidate) continue

      if (candidate.startsWith("CL::")) {
        candidate = candidate.substring(4)
      }

      if (
        candidate.startsWith("http://") ||
        candidate.startsWith("https://") ||
        candidate.startsWith("data:") ||
        candidate.startsWith("/")
      ) {
        return candidate
      }

      try {
        const decrypted = decryptMessage(candidate)
        if (
          decrypted &&
          (decrypted.startsWith("http://") ||
            decrypted.startsWith("https://") ||
            decrypted.startsWith("data:") ||
            decrypted.startsWith("/"))
        ) {
          return decrypted
        }
      } catch (error) {
        // Ignore decrypt errors for non-encrypted values.
      }
    }

    return ""
  }, [])
  const getAttachmentKind = useCallback((fileType: string, fileUrl: string): "image" | "video" | "document" => {
    const normalizedType = String(fileType || "").toLowerCase()
    const normalizedUrl = String(fileUrl || "").toLowerCase()
    if (
      normalizedType.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)(\?|$)/i.test(normalizedUrl)
    ) {
      return "image"
    }
    if (
      normalizedType.startsWith("video/") ||
      /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|3gp|m4v|ts)(\?|$)/i.test(normalizedUrl)
    ) {
      return "video"
    }
    return "document"
  }, [])

  const mediaDocuments = useMemo<MediaDocumentListItem[]>(() => {
    const participantNameById = new Map<string, string>()
      ; (threadParticipants || []).forEach((participant: any) => {
        const id = String(participant?.id || participant?.user?.id || "").trim()
        if (!id) return
        const firstName = participant?.firstName || participant?.user?.firstName || ""
        const lastName = participant?.lastName || participant?.user?.lastName || ""
        const fullName = `${firstName} ${lastName}`.trim()
        participantNameById.set(id, fullName || participant?.email || "Unknown user")
      })

    const items: MediaDocumentListItem[] = []
      ; (messages || []).forEach((message, index) => {
        const attachmentUrl = resolveAttachmentUrlFromMessage(message)
        if (!attachmentUrl) return

        const fileType =
          message?.fileType ||
          message?.file_type ||
          message?.file?.type ||
          getMimeTypeFromUrl(attachmentUrl) ||
          ""
        const kind = getAttachmentKind(fileType, attachmentUrl)
        const senderId = String(message?.senderId || "").trim()
        const senderName = senderId && senderId === userData?.id
          ? "You"
          : participantNameById.get(senderId) || "Unknown user"
        const createdAt = message?.createdAt || message?.timestamp

        items.push({
          id: String(message?.id || `${attachmentUrl}-${createdAt || index}`),
          url: attachmentUrl,
          fileType,
          fileName: getFileNameFromUrl(attachmentUrl),
          kind,
          senderName,
          createdAt,
        })
      })

    return items.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [
    getAttachmentKind,
    getFileNameFromUrl,
    messages,
    resolveAttachmentUrlFromMessage,
    threadParticipants,
    userData?.id,
  ])

  const { getAllConversationMessagesMutation } = useAgentConversationApi()
  const { getAllUserAgentMessagesMutation, createUserAgentThreadMutation } = useUserAgentMessageApi()
  const { externalAgentIvitationMutation } = useUserAuthApi()
  const { getThreadById } = useAgentConversationApi()
  const { uploadNewFile } = usePropertyServiceAPI()
  const { createRepoWithUploadedFile } = useRepoManagementApi()
  const { markThreadAsReadMutation } = useNotificationApi()

  const handleInviteSuccess = useCallback((invitedEmail: string, selectedRole: "buyer_agent" | "co_buyer" | "family_friends") => {
    const normalizedEmail = invitedEmail?.trim().toLowerCase()
    if (!normalizedEmail) return
    const activeThreadId = String(selectedThreadDetail?.id || selectedThread || "")
    if (!activeThreadId) return

    const inferredName = invitedEmail.split("@")[0] || "Invited"
    const optimisticParticipant = {
      id: `pending-${Date.now()}-${normalizedEmail}`,
      approvalStatus: "pending",
      inviteRole: selectedRole,
      createdAt: new Date().toISOString(),
      user: {
        firstName: inferredName,
        lastName: "",
        email: invitedEmail,
      },
    }

    setSelectedThreadDetail((prev: any) => {
      if (!prev) return prev
      const existingParticipants = Array.isArray(prev?.participants) ? prev.participants : []
      const alreadyExists = existingParticipants.some(
        (participant: any) =>
          String(participant?.user?.email || participant?.email || "").toLowerCase() === normalizedEmail,
      )
      if (alreadyExists) return prev
      return {
        ...prev,
        participants: [...existingParticipants, optimisticParticipant],
      }
    })

    setThreadParticipant((prev: any) => {
      const existingParticipants = Array.isArray(prev) ? prev : []
      const alreadyExists = existingParticipants.some(
        (participant: any) =>
          String(participant?.email || "").toLowerCase() === normalizedEmail,
      )
      if (alreadyExists) return existingParticipants
      return [
        ...existingParticipants,
        {
          firstName: inferredName,
          lastName: "",
          email: invitedEmail,
        },
      ]
    })

    setPersistedInvitesByThread((prev) => {
      const threadInvites = Array.isArray(prev[activeThreadId]) ? prev[activeThreadId] : []
      const alreadyExists = threadInvites.some(
        (participant: any) =>
          String(participant?.user?.email || participant?.email || "").toLowerCase() === normalizedEmail,
      )
      if (alreadyExists) return prev
      return {
        ...prev,
        [activeThreadId]: [...threadInvites, optimisticParticipant],
      }
    })
  }, [selectedThread, selectedThreadDetail?.id])

  const getThreadDetails = async (id: string) => {
    try {
      await getThreadById.mutateAsync(id ?? threadId, {
        onSuccess: async (data: any) => {
          const participants = await [
            ...(data?.buyerAgent ? [data.buyerAgent] : []),
            ...(data?.sellerAgent ? [data.sellerAgent] : []),
            ...(data?.user ? [data.user] : []),
            ...(Array.isArray(data?.participants) ? data.participants.map((p: any) => p.user) : []),
          ];
          handleThreadSelection(data, participants)
        },
      });
    } catch (err) {
      console.error("[chat-box] Failed to fetch thread details for id:", id, err);
      selectThreadById(id);
    }
  }
  const normalizeThreadKey = (value?: string | null) =>
    String(value ?? "").trim().toLowerCase();

  const threadMatchesRouteId = (thread: Thread, targetId?: string) => {
    const normalizedTarget = normalizeThreadKey(targetId);
    if (!normalizedTarget) return false;

    const candidates = [
      thread?.id,
      (thread as any)?.threadId,
      (thread as any)?.thread_id,
      (thread as any)?.roomId,
      (thread as any)?.room_id,
      (thread as any)?.conversationId,
      (thread as any)?.conversation_id,
      (thread as any)?.channelId,
      (thread as any)?.channel_id,
    ];

    return candidates.some(
      (candidate) => normalizeThreadKey(candidate as string | null | undefined) === normalizedTarget,
    );
  };
  const handleFileUpload = async (file: File) => {
    try {
      const { key, url } = await uploadNewFile(file, userData?.id || "", selectedThreadDetail?.propertyId);
      const payload = {
        uploadedFile: {
          fileName: file?.name,
          fileSize: file?.size,
          fileUrl: url,
          fileType: file?.type
        },
        createRepoManagementInput: {
          name: 'proof-document',
          url: '/proof-document',
          propertyId: selectedThreadDetail?.propertyId,
          createdBy: userData?.id,
          parentFolderName: 'proof-document',
          isArchived: true,

        }
      };
      createRepoWithUploadedFile?.mutate(payload, {
        onSuccess: (data) => {
          console.log(data)
        },
        onError: (err) => {
          error({ message: err?.message || 'Upload failed' });
        },
      });
      return url;
    } catch (err: any) {
      console.error("File upload failed:", err);
      throw new Error('File upload failed');
    }
  };

  const handleThreadSelection = (thread: Thread, participants: any) => {
    if (selectedChannel === thread) return null

    console.log('[chat-box] Thread selected:', thread?.id, thread);

    // Leave previous room if exists
    if (selectedThread && socket && socket.leaveRoom) {
      console.log('[chat-box] Leaving previous room:', selectedThread);
      socket.leaveRoom(selectedThread);
    }

    // setIsDetails(false)
    setShowThreads(false)
    setShowChat(true)
    setThreadParticipant(participants)
    const resolvedAgentId =
      thread?.buyerAgent?.id ||
      thread?.sellerAgent?.id ||
      participants.find(
        (participant: any) => participant?.id && participant.id !== userData?.id,
      )?.id ||
      null
    setExpandedEntryKey(resolvedAgentId || thread?.id || null)
    setSelectedThreadDetail(thread)
    localStorage.setItem('threadId', thread?.id || '');

    setSelectedThread(thread?.id)
    if (thread?.id) {
      const normalizedId = thread.id.toString().trim().toLowerCase();
      setLocallyReadThreadIds((prev) => ({
        ...prev,
        [normalizedId]: Date.now(),
      }));
    }
    setIsRead(false)
    if (showUnreadOnly) {
      setShowUnreadOnly(false)
    }
    setPendingNewMessageCount(0)
    setIsAtLatestMessage(true)
    isAtLatestMessageRef.current = true

    // Update state immediately to ensure chat box shows
    setState((prev: any) => ({
      ...prev,
      selectedChannel: {
        id: thread?.id,
        propertyName: thread.propertyName,
      },
      conversationUnreadCount: Array.isArray(prev.conversationUnreadCount)
        ? prev.conversationUnreadCount.filter(
          (entry: { threadId?: string | null }) => entry?.threadId !== thread?.id,
        )
        : prev.conversationUnreadCount,
    }))

    // Join the room using websocket methods
    if (socket && thread?.id && userData?.id) {
      console.log('[chat-box] Joining room for thread:', thread.id);

      // First, try to create or join conversation
      socket.createOrJoinRoom({
        threadId: thread.id,
        propertyId: thread.propertyId,
        userId: userData.id,
        userType: 'buyer',
        buyerAgentId: thread.buyerAgent?.id,
        sellerAgentId: thread.sellerAgent?.id,
        roomId: thread.id,
        threadName: thread.threadName,
        propertyName: thread.propertyName,
        propertyAddress: thread.propertyAddress,
      });

      socket.emit('mark_as_read', { threadId: thread.id });
      if (thread?.id) {
        markThreadAsReadMutation.mutate(thread.id);
      }

      // Also join the room directly
      if (socket.joinRoom) {
        socket.joinRoom(thread.id);
      }

      // Removed joinThread event - not supported by backend, use joinRoom instead
    }

    // if (TYPE === "messages") {
    getAllThreadMessage(thread?.id)
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

    console.log('[chat-box] Thread selection complete. showChat:', true, 'selectedThread:', thread?.id, 'selectedThreadDetail:', thread?.id);
  }

  const selectThreadById = (targetThreadId?: string) => {
    if (!targetThreadId || !Array.isArray(threads)) return

    const targetThread = threads.find((thread: Thread) => threadMatchesRouteId(thread, targetThreadId))
    if (!targetThread) return

    const participants = [
      ...(targetThread?.buyerAgent ? [targetThread.buyerAgent] : []),
      ...(targetThread?.sellerAgent ? [targetThread.sellerAgent] : []),
      ...(targetThread?.user ? [targetThread.user] : []),
      ...(Array.isArray(targetThread?.participants) ? targetThread.participants.map((p: any) => p.user) : []),
    ]

    handleThreadSelection(targetThread, participants)
  }

  const handleEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.emoji);
  };
  const handleBackToThreads = () => {
    setShowThreads(true)
    setShowChat(false)
    setSelectedChannel(null)
    setSelectedThread('')
    setExpandedEntryKey(null)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  // Removed typing event - not supported by backend

  const getAllConversationThreads = async (threadId: string) => {
    try {
      setMessages([])
      getAllConversationMessagesMutation.mutate(threadId, {
        onSuccess: (data) => {
          const normalizedMessages = data?.data?.conversationsByThread?.map((message: Message) =>
            normalizeMessage(message)
          )
          setMessages(normalizedMessages || [])
        },
        onError: (error) => {
          console.log("Error in mutation: ", error)
        },
      })
    } catch (error) {
      console.log("error : ", error)
    }
  }

  const toggleUploadMenu = () => {
    setShowUploadMenu((prev) => !prev);
  };

  const getAllThreadMessage = async (threadId: string) => {
    try {
      setMessages([]);
      getAllUserAgentMessagesMutation.mutate(threadId, {
        onSuccess: (data) => {
          const decryptedMessages = data?.data?.messagesByThread?.map((message: Message) =>
            normalizeMessage(message)
          );
          setPendingNewMessageCount(0);
          setMessages(decryptedMessages || []);
          if (focusLatestFromNotification) {
            scrollToLatestMessagesWithRetry();
          }
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

  // Removed handleTyping - typing event not supported by backend
  const handleTyping = (status: boolean) => {
    // Typing events removed - not supported by backend WebSocket handler
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
      setShowUploadMenu(false) // Close upload menu when file is selected

      const maxSize = 25 * 1024 * 1024 // 25MB

      if (!allowedFileTypes.includes(file.type)) {
        setFileErrorMsg("Invalid file type. Only images, videos, and PDF are allowed.")
        return
      }
      if (file.size > maxSize) {
        setFileErrorMsg("File size exceeds the 25MB limit.")
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

  const handleInputChange = (e: any) => {
    const value = e.target.value
    setMessage(value)

    if (!isTyping) {
      handleTyping(true)
    }

    // Removed typing status check - not supported by backend
  }
  const getBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (!socket || !Array.isArray(threads) || threads.length === 0) return;

    const threadIds = Array.from(
      new Set(
        threads
          .map((thread: Thread) => thread?.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    );

    if (threadIds.length === 0) return;

    threadIds.forEach((roomId) => {
      if (socket.joinRoom) {
        socket.joinRoom(roomId);
      } else {
        socket.emit("joinRoom", { roomId });
      }
    });

    return () => {
      threadIds.forEach((roomId) => {
        if (socket.leaveRoom) {
          socket.leaveRoom(roomId);
        } else {
          socket.emit("leaveRoom", { roomId });
        }
      });
    };
  }, [socket, threads]);


  // const handleSendMessage = async () => {
  //   try {
  //     // Validate socket connection
  //     if (!socket) {
  //       console.error("[handleSendMessage] Socket is not connected");
  //       return;
  //     }

  //     if (!socket.connected) {
  //       console.error("[handleSendMessage] Socket is not connected. State:", socket.connected);
  //       socket.connect();
  //       return;
  //     }

  //     // Get thread ID from multiple possible sources
  //     const currentThreadId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;

  //     // Validate required fields
  //     if (!currentThreadId) {
  //       console.error("[handleSendMessage] No thread selected", {
  //         selectedChannel: state?.selectedChannel,
  //         selectedThreadDetail: selectedThreadDetail?.id,
  //         selectedThread: selectedThread,
  //         threadId: threadId
  //       });
  //       return;
  //     }

  //     if (!userData?.id) {
  //       console.error("[handleSendMessage] User ID is missing");
  //       return;
  //     }

  //     if (!receiverId) {
  //       console.error("[handleSendMessage] Receiver ID is missing");
  //       return;
  //     }

  //     const encryptedMessage = encryptMessage(message);
  //     console.log("[handleSendMessage] Starting message send:", {
  //       threadId: currentThreadId,
  //       senderId: userData?.id,
  //       receiverId: receiverId,
  //       hasMessage: !!message.trim(),
  //       hasFile: !!selectedFile,
  //       encryptedMessageLength: encryptedMessage.length
  //     });

  //     if (encryptedMessage.trim() !== "" || selectedFile) {
  //       const newMessage = {
  //         threadId: currentThreadId,
  //         message: message, // Plain message for local display
  //         senderId: userData?.id,
  //         roomId: selectedThreadDetail?.roomId || currentThreadId,
  //         receiverId: receiverId,
  //         createdAt: new Date().toISOString(),
  //       } as Message;

  //       let fileData = null;

  //       if (selectedFile) {
  //         try {
  //           console.log("[handleSendMessage] Processing file upload:", {
  //             fileName: selectedFile.name,
  //             fileType: selectedFile.type,
  //             fileSize: selectedFile.size
  //           });

  //           handleFileUpload(selectedFile);
  //           const base64Content = await getBase64(selectedFile);
  //           const fileType = selectedFile.type;
  //           fileData = {
  //             name: selectedFile.name,
  //             type: fileType,
  //             size: selectedFile.size,
  //             content: base64Content,
  //             sender: userData,
  //           };

  //           // File upload not supported via WebSocket - use REST API first
  //           // TODO: Upload file via REST API, then send file URL using sendMessage
  //           console.error("[handleSendMessage] File upload via WebSocket not supported. Use REST API for file uploads.");
  //           error({ message: "File upload via WebSocket not yet implemented. Please use REST API for file uploads." });
  //         } catch (fileError) {
  //           console.error("[handleSendMessage] File processing error:", fileError);
  //         }
  //       } else {
  //         // Send text message using websocket sendMessage method
  //         const currentThreadId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;

  //         if (socket && socket.sendMessage && currentThreadId && userData?.id) {
  //           console.log("[handleSendMessage] Sending message via websocket:", {
  //             threadId: currentThreadId,
  //             userId: userData.id,
  //             messageLength: message.length
  //           });

  //           socket.sendMessage({
  //             threadId: currentThreadId,
  //             message: message, // Send plain message (backend can handle encryption if needed)
  //             userId: userData.id,
  //             messageType: 'text'
  //           });

  //           // Handle response
  //           const handleSendMessageResponse = (response: any) => {
  //             console.log("[handleSendMessage] sendMessage_response:", response);
  //             if (response.status === 'success') {
  //               // Message sent successfully, it will be broadcasted via newMessage event
  //               setMessage('');
  //             } else {
  //               error({ message: response.message || 'Failed to send message' });
  //             }
  //             socket.off('sendMessage_response', handleSendMessageResponse);
  //           };

  //           socket.on('sendMessage_response', handleSendMessageResponse);

  //           // Add message to local state for immediate UI update (will be updated via newMessage event)
  //           setMessages((prev) => [{ ...newMessage, message }, ...prev]);
  //           setMessage('');
  //         } else {
  //           // Fallback to old method if websocket methods not available
  //           const encryptedTextMessage = encryptMessage(message);
  //           const messagePayload = {
  //             ...newMessage,
  //             message: encryptedTextMessage, // Encrypted for backend
  //             reciepent: receiverId,
  //             userName: userData?.firstname + " " + userData?.lastname,
  //             user: {
  //               reciepent: receiverId,
  //               userName: userData?.firstname + " " + userData?.lastname,
  //             }
  //           };

  //           // Removed sendMessagetoThread event - not supported by backend
  //           // Use sendMessage method instead (already handled above)
  //           console.error("[handleSendMessage] sendMessagetoThread not supported. Use socket.sendMessage() instead.");
  //           error({ message: "Message sending failed. Please use the sendMessage method." });
  //         }
  //       }

  //       setSelectedFile(null);
  //     } else {
  //       console.warn("[handleSendMessage] Empty message and no file");
  //     }

  //     setTimeout(() => {
  //       if (messagesEndRef.current) {
  //         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //       }
  //     }, 1000);
  //   } catch (error) {
  //     console.error("[handleSendMessage] Unexpected error:", error);
  //   }
  // }


  const handleSendMessage = async () => {
    try {
      // Validate socket
      if (!socket) {
        console.error("[handleSendMessage] Socket missing");
        return;
      }

      if (!socket.connected) {
        socket.connect();
        return;
      }

      // Resolve thread ID
      const currentThreadId =
        state?.selectedChannel?.id ||
        selectedThreadDetail?.id ||
        selectedThread ||
        threadId;

      if (!currentThreadId || !userData?.id || !receiverId) {
        console.error("[handleSendMessage] Missing required data");
        return;
      }

      const hasText = message.trim() !== "";
      const hasFile = !!selectedFile;

      if (!hasText && !hasFile) {
        console.warn("[handleSendMessage] Empty message");
        return;
      }

      let fileUrl: string | '' = '';

      // 1️⃣ Upload file first (REST)
      if (hasFile && selectedFile) {
        try {
          fileUrl = await handleFileUpload(selectedFile);
        } catch {
          error({ message: "File upload failed" });
          return;
        }
      }

      // 2️⃣ Send message via WebSocket
      socket.sendMessage({
        threadId: currentThreadId,
        userId: userData.id,
        messageType: hasFile ? "file" : "text",
        message: hasFile ? fileUrl : message,
        fileType: hasFile ? selectedFile?.type : undefined, // ✅ FIX

      });

      // 3️⃣ Optimistic UI update
      setPendingNewMessageCount(0);
      setMessages((prev: any) => [
        {
          threadId: currentThreadId,
          senderId: userData.id,
          receiverId,
          messageType: hasFile ? "file" : "text",
          message: hasFile ? fileUrl : message,
          fileType: hasFile ? selectedFile?.type : undefined, // ✅ FIX
          createdAt: new Date().toISOString(),
          file: hasFile
            ? {
              name: selectedFile?.name,
              size: selectedFile?.size,
              type: selectedFile?.type,
              url: fileUrl,
            }
            : null,
        },
        ...prev,
      ]);

      // 4️⃣ Cleanup
      setMessage("");
      setSelectedFile(null);
      requestAnimationFrame(() => {
        scrollToLatestMessages();
      });

    } catch (err) {
      console.error("[handleSendMessage] Unexpected error:", err);
    }
  };

  const handleTrheadsName = (user: any) => {
    const str1 = "Byuer (" + user?.buyerAgent.firstName + " " + user?.buyerAgent.lastName + ")"
    const str2 = "Seller (" + user?.sellerAgent.firstName + " " + user?.sellerAgent.lastName + ")"
    return <>
      <h3 className="font-semibold text-sm sm:text-base truncate">{str1}</h3>
      <h3 className="font-semibold text-sm sm:text-base truncate">{str2}</h3>
    </>
  }

  const groupedMessages: { [date: string]: Message[] } = messages.reduce((acc: { [date: string]: Message[] }, message) => {
    const date = format(new Date(message?.createdAt ?? 0), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {});

  // const groupedMessages: { [date: string]: Message[] } = (() => {
  //   const thread = messageThreads.find((thread) => thread.id === selectedThread);
  //   return thread?.messages?.reduce((acc: { [date: string]: Message[] }, message) => {
  //     const date = format(new Date(message?.createdAt ?? 0), "yyyy-MM-dd");
  //     if (!acc[date]) acc[date] = [];
  //     acc[date].push(message);
  //     return acc;
  //   }, {}) || {};
  // })();


  function isToday(date: Date): boolean {
    const today = new Date();
    return isSameDay(date, today);
  }

  function isYesterday(date: Date): boolean {
    const yesterday = subDays(new Date(), 1);
    return isSameDay(date, yesterday);
  }

  const saveAllMessages = () => {
    // Removed save_user_agent_messages event - not supported by backend WebSocket handler
    // Message saving should be handled via REST API
  }

  const appendIncomingMessage = useCallback((processedMessage: Message) => {
    setMessages((prevMessages) => {
      const exists = prevMessages.some(
        (msg) =>
          (msg.createdAt === processedMessage.createdAt ||
            (!!msg.id && !!processedMessage.id && msg.id === processedMessage.id)) &&
          msg.senderId === processedMessage.senderId &&
          msg.message === processedMessage.message,
      );

      if (exists) {
        return prevMessages;
      }

      const hasSenderId = typeof processedMessage.senderId === "string" && processedMessage.senderId.length > 0;
      const hasReceiverId = typeof processedMessage.receiverId === "string" && processedMessage.receiverId.length > 0;
      const isIncomingFromOtherUser = hasSenderId
        ? processedMessage.senderId !== userData?.id
        : hasReceiverId
          ? processedMessage.receiverId === userData?.id
          : true;
      const isNotificationMessage = processedMessage.messageType === "notification";

      if (isIncomingFromOtherUser && !isNotificationMessage && !isAtLatestMessageRef.current) {
        setPendingNewMessageCount((prev) => prev + 1);
      }
      if (isIncomingFromOtherUser && !isNotificationMessage && isAtLatestMessageRef.current) {
        shouldAutoScrollOnIncomingRef.current = true;
      }

      return [processedMessage, ...prevMessages];
    });
  }, [userData?.id]);


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
      // Removed typingStatus event - not supported by backend WebSocket handler
      // Removed saveAllMessages interval - save_user_agent_messages event not supported by backend
      // const interval = setInterval(saveAllMessages, 5000);
      return () => {
        socket.off("recievedMessage")
        socket.off("thread_marked_as_read")
        // Removed clearInterval(interval) - interval was removed
        // Removed saveAllMessages() - message saving removed, use REST API instead
      }
    }
    // Don't reset selectedChannel here - it should persist
  }, [socket])

  useEffect(() => {
    const viewport = getMessageViewportElement();
    if (!viewport) return;

    const handleViewportScroll = () => {
      updateLatestMessageState();
    };

    updateLatestMessageState();
    viewport.addEventListener("scroll", handleViewportScroll);

    return () => {
      viewport.removeEventListener("scroll", handleViewportScroll);
    };
  }, [getMessageViewportElement, updateLatestMessageState, selectedThreadDetail?.id]);

  useEffect(() => {
    if (!shouldAutoScrollOnIncomingRef.current) return;
    requestAnimationFrame(() => {
      scrollToLatestMessages();
      shouldAutoScrollOnIncomingRef.current = false;
    });
  }, [messages.length, scrollToLatestMessages]);

  useEffect(() => {
    const request = state?.scrollToLatestRequest;
    if (!request?.threadId) return;

    const activeThreadId =
      state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;

    if (request.threadId === activeThreadId) {
      scrollToLatestMessages();
      setState((prev: any) => ({
        ...prev,
        scrollToLatestRequest: null,
      }));
    }
  }, [scrollToLatestMessages, selectedThread, selectedThreadDetail?.id, setState, state?.scrollToLatestRequest, state?.selectedChannel?.id, threadId]);

  // Removed joinThread event - not supported by backend, use joinRoom instead
  // useEffect(() => {
  //   if (socket && selectedThread) {
  //     socket.emit("joinThread", selectedThread);
  //   }
  // }, [socket, selectedThread])

  useEffect(() => {
    // Use fallback pattern to get thread ID
    const currentThreadId = state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;
    if (socket && currentThreadId) {

      console.log("[ChatBox] Setting up real-time listeners for thread:", currentThreadId);

      socket.on("typingStatus", (typing: boolean) => {
        setIsTyping(typing);
      });

      // Handle newMessage event from websocket backend (Lambda/API Gateway)
      const handleNewMessage = (messageData: any) => {
        console.log('[ChatBox] Received newMessage from websocket:', messageData);
        console.log('[ChatBox] Current thread ID:', currentThreadId, 'Selected thread detail:', selectedThreadDetail?.id);

        const threadId = messageData.threadId || messageData.thread_id;
        console.log('[ChatBox] Message thread ID:', threadId);

        // Only process messages for the current thread
        if (threadId === currentThreadId || threadId === selectedThreadDetail?.id) {
          console.log('[ChatBox] Message matches current thread, processing...');
          let processedMessage = normalizeMessage({
            ...messageData,
            threadId: threadId,
            message: messageData.message || messageData.content,
            senderId:
              messageData.senderId ||
              messageData.sender_id ||
              messageData.userId ||
              messageData.user_id ||
              messageData.createdBy,
            receiverId: messageData.receiverId || messageData.receiver_id,
            createdAt: messageData.createdAt || messageData.created_at,
            messageType: messageData.messageType || messageData.message_type || 'text',
            fileType: messageData.fileType || messageData.file_type,
          });

          console.log("[ChatBox] Adding newMessage to state:", processedMessage);
          appendIncomingMessage(processedMessage);
        } else {
          console.log("[ChatBox] newMessage is for different thread, ignoring:", {
            receivedThreadId: threadId,
            currentThreadId: currentThreadId
          });
        }
      };

      socket.on('newMessage', handleNewMessage);

      // Handle websocket response events
      socket.on('createOrJoinConversation_response', (response: any) => {
        console.log('[ChatBox] createOrJoinConversation_response:', response);
      });

      socket.on('joinRoom_response', (response: any) => {
        console.log('[ChatBox] joinRoom_response:', response);
      });

      socket.on('sendMessage_response', (response: any) => {
        console.log('[ChatBox] sendMessage_response:', response);
      });

      // Listen for WebSocket errors
      socket.on("error", (errorData: any) => {
        console.error("[ChatBox] WebSocket error:", errorData);
      });

      // Listen for connection status
      socket.on("connect", () => {
        console.log("[ChatBox] Socket connected");
        // Rejoin room when reconnected
        if (currentThreadId) {
          if (socket.joinRoom) {
            socket.joinRoom(currentThreadId);
          } else {
            socket.emit("joinRoom", { roomId: currentThreadId });
          }
        }
      });

      socket.on("disconnect", () => {
        console.warn("[ChatBox] Socket disconnected");
      });

      return () => {
        console.log("[ChatBox] Cleaning up real-time listeners");
        socket.off("newMessage", handleNewMessage);
        socket.off("typingStatus");
        socket.off("error");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("createOrJoinConversation_response");
        socket.off("joinRoom_response");
        socket.off("sendMessage_response");
      };
    }
    return () => {
      setState((prev: any) => ({
        ...prev,
        selectedChannel: {
          id: null,
          propertyName: ""
        }
      }));
    };
  }, [appendIncomingMessage, socket, state?.selectedChannel?.id, selectedThreadDetail?.id, threadId, selectedThread]);

  useEffect(() => {

    const handleUnload = () => {
      // Removed save_user_agent_messages and save_messages events - not supported by backend
      // Message saving should be handled via REST API
      if (socket) {
        console.log("[chat-box] Message saving removed - use REST API instead");
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
      const normalized = normalizeMessage(state?.newMessage);
      const currentThreadId =
        state?.selectedChannel?.id || selectedThreadDetail?.id || selectedThread || threadId;
      const normalizedThreadId = normalized?.threadId;
      const handledByActiveSocketListener =
        !!socket &&
        !!currentThreadId &&
        (normalizedThreadId === currentThreadId || normalizedThreadId === selectedThreadDetail?.id);

      if (!handledByActiveSocketListener) {
        appendIncomingMessage(normalized);
      }
      setState((prev: any) => ({
        ...prev,
        newMessage: null
      }));
    }
  }, [appendIncomingMessage, setState, socket, state?.newMessage, state?.selectedChannel?.id, selectedThread, selectedThreadDetail?.id, threadId]);

  useEffect(() => {
    if (threadId) {
      getThreadDetails(threadId);
    }
  }, [threadId]);

  useEffect(() => {
    if (!threadId || !Array.isArray(threads) || threads.length === 0) return;
    if (selectedThreadDetail?.id) return;

    const matchedThread = threads.find((thread: Thread) => threadMatchesRouteId(thread, String(threadId)));
    if (!matchedThread) return;

    const participants = [
      ...(matchedThread?.buyerAgent ? [matchedThread.buyerAgent] : []),
      ...(matchedThread?.sellerAgent ? [matchedThread.sellerAgent] : []),
      ...(matchedThread?.user ? [matchedThread.user] : []),
      ...(Array.isArray(matchedThread?.participants) ? matchedThread.participants.map((p: any) => p.user) : []),
    ];
    handleThreadSelection(matchedThread, participants);
  }, [threadId, threads, selectedThreadDetail?.id]);

  useEffect(() => {
    if (!focusLatestFromNotification) return;
    if (hasHandledNotificationFocusRef.current) return;
    if (!selectedThreadDetail?.id || messages.length === 0) return;

    scrollToLatestMessagesWithRetry(24);
    hasHandledNotificationFocusRef.current = true;
  }, [focusLatestFromNotification, messages.length, scrollToLatestMessagesWithRetry, selectedThreadDetail?.id]);

  useEffect(() => {
    hasHandledNotificationFocusRef.current = false;
  }, [threadId, focusLatestFromNotification]);

  // Predefined light colors for consistent user avatars
  const lightColors = ["bg-blue-200", "bg-green-200", "bg-red-200", "bg-yellow-200", "bg-purple-200"];

  // Function to pick a static color based on the user's name
  const getStaticColor = (name: string) => {
    const index = name?.charCodeAt(0) % lightColors.length;
    return lightColors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  console.log(message);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Upload dropdown
      if (
        showUploadMenu &&
        uploadMenuRef.current &&
        !uploadMenuRef.current.contains(event.target as Node)
      ) {
        setShowUploadMenu(false);
      }

      // Emoji picker
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUploadMenu, showEmojiPicker]);

  console.log("Thread Data: ", threads);
  console.log("[chat-box] Render state - showChat:", showChat, "selectedThread:", selectedThread, "selectedThreadDetail:", selectedThreadDetail?.id, "state.selectedChannel:", state.selectedChannel);
  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  const resolveAgentIdField = () => {
    const normalizedType = (currentUser || '').toString().toLowerCase();
    return normalizedType === 'seller' ? 'sellerAgentId' : 'buyerAgentId';
  };

  const resolveProfileImage = (person: any) =>
    person?.profile || person?.avatar || person?.image || '';

  const handleCreateThreadWithAgent = async (agent: any) => {
    const agentId = agent?.id || agent?._id;
    if (!agentId) {
      error({ message: 'Agent selection is missing an id.' });
      return;
    }
    const activeUserId = userData?.id || user?.id;
    if (!activeUserId) {
      error({ message: 'Please login to start a chat.' });
      return;
    }
    if (isCreatingThread) return;

    setIsCreatingThread(true);
    const agentIdField = resolveAgentIdField();
    const payload: Record<string, any> = {
      propertyId: '',
      threadName: 'New Chat',
      propertyName: 'New Chat',
      propertyImage: '',
      listingId: '',
      propertyAddress: '',
      propertyOwnerId: '',
      userType: (currentUser || 'Buyer').toString(),
      userId: activeUserId,
      roomId: uuidv4(),
      parentMessage: "Let's connect and talk",
      [agentIdField]: agentId,
    };

    createUserAgentThreadMutation.mutate(payload, {
      onSuccess: (data: any) => {
        const createdThreadId = data?.id;
        if (createdThreadId) {
          getThreadDetails(createdThreadId);
        }
        setIsContactAgentDialogOpen(false);
        setIsSearchAgentModalOpen(false);
        setIsInviteAgentModalOpen(false);
        setInviteAgentEmail('');
        setInviteAgentError('');
        setIsCreatingThread(false);
      },
      onError: (err: any) => {
        console.error('[chat-box] Failed to create thread:', err);
        error({ message: err?.message || 'Unable to create chat. Please try again.' });
        setIsCreatingThread(false);
      },
    });
  };

  const handleInviteAgentSubmit = async () => {
    const email = inviteAgentEmail.trim();
    if (!email) {
      setInviteAgentError('Please enter an email.');
      return;
    }
    setInviteAgentError('');
    const activeUserId = userData?.id || user?.id;
    if (!activeUserId) {
      setInviteAgentError('Please login to invite an agent.');
      return;
    }
    if (isCreatingThread) return;

    setIsCreatingThread(true);
    try {
      const payload = {
        agentType: currentUser,
        userId: activeUserId,
        email,
        is_accepted: 'pending',
      };
      await externalAgentIvitationMutation.mutateAsync(payload);
      success({ message: 'Agent invitation sent successfully.' });
      setIsInviteAgentModalOpen(false);
      setInviteAgentEmail('');
      setInviteAgentError('');
    } catch (err: any) {
      console.error('[chat-box] Invite agent failed:', err);
      setInviteAgentError(err?.message || 'Unable to send invite right now.');
    } finally {
      setIsCreatingThread(false);
    }
  };

  const agentForHeader = (() => {
    const candidates = [selectedThreadDetail?.buyerAgent, selectedThreadDetail?.sellerAgent].filter(Boolean) as any[];
    if (userData?.id) {
      const other = candidates.find((agent) => agent?.id && agent.id !== userData.id);
      if (other) return other;
    }
    return candidates[0] || null;
  })();
  const agentNameForHeader =
    [agentForHeader?.firstName, agentForHeader?.lastName].filter(Boolean).join(' ') || '';
  const agentImageForHeader =
    agentForHeader?.profile || agentForHeader?.image || agentForHeader?.avatar || '';

  const wrapperClassName = embedded
    ? "max-w-full min-h-[calc(100vh-6rem)] flex flex-col"
    : "mt-24 max-w-full min-h-[calc(100vh-6rem)] flex flex-col";

  return (
    <div className={wrapperClassName}>
      <Dialog open={isContactAgentDialogOpen} onOpenChange={setIsContactAgentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Agent</DialogTitle>
            <DialogDescription>
              Choose how you would like to contact an agent for this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsContactAgentDialogOpen(false);
                setIsSearchAgentModalOpen(true);
              }}
              className="w-full bg-black text-white px-6 py-3 rounded-full text-base font-normal hover:bg-gray-800 transition-colors"
            >
              Search Agent
            </button>
            <button
              type="button"
              onClick={() => {
                setIsContactAgentDialogOpen(false);
                setIsInviteAgentModalOpen(true);
              }}
              className="w-full bg-white text-black border-2 border-black px-6 py-3 rounded-full text-base font-normal hover:bg-gray-50 transition-colors"
            >
              Invite Agent
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isSearchAgentModalOpen} onOpenChange={setIsSearchAgentModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Search Agents</DialogTitle>
            <DialogDescription>
              Browse and search for agents to start a new chat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
              <AgentDirectoryWrapper
                engagementId=""
                propertyId=""
                mode="chat"
                onAgentSelected={(agent) => handleCreateThreadWithAgent(agent)}
                onClose={() => setIsSearchAgentModalOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isInviteAgentModalOpen} onOpenChange={setIsInviteAgentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Agent</DialogTitle>
            <DialogDescription>
              Enter an agent email to start a new chat.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <input
              value={inviteAgentEmail}
              onChange={(e) => setInviteAgentEmail(e.target.value)}
              placeholder="Agent email"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            {inviteAgentError && (
              <p className="text-xs text-red-600">{inviteAgentError}</p>
            )}
            <Button
              type="button"
              onClick={handleInviteAgentSubmit}
              disabled={isCreatingThread}
              className="w-full"
            >
              {isCreatingThread ? 'Creating...' : 'Invite & Start Chat'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* <header className="border-b px-2 sm:px-4 py-2 flex items-center justify-between  shadow-sm">
        <div className="flex bg-white shadow  pr-4 rounded-full items-center " onClick={() => router.push(`/dashboard/${currentUser === "seller" ? "" : "buyer"}`)}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Back</span>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="shadow relative flex w-full max-w-xl bg-white h-10 rounded-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search"
              className="pl-12 pr-4 bg-transparent text-gray-700 placeholder-gray-500 w-full focus:outline-none appearance-none border-0"
              onChange={(e) => {
                handleSearch(e.target.value)
              }}
            />
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Help className="h-5 w-5" />
        </Button>
      </header> */}
      <section className="w-full flex-1 min-w-0">
        <div className="w-full min-w-0 flex-1 flex flex-col border-l md:flex-row bg-gray-100">
          <div className={`w-full md:basis-[25%] md:max-w-[25%] md:min-w-[25%] bg-white border-r ${showThreads ? "block" : "hidden md:block"} overflow-hidden`}>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg text-gray-800">Messages</h2>
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="New chat"
                      className="gap-2"
                      onClick={() => setIsContactAgentDialogOpen(true)}
                    >
                      <span className="text-sm font-medium text-gray-700">New chat</span>
                      <MessageCircle className="h-6 w-6 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end">
                    start a new chat and invite your agent
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Toggle Buttons */}
            <div className="p-2 px-4  border-b flex justify-center items-center">
              <div className="flex w-full gap-2 rounded-full bg-gray-100 p-1 shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowUnreadOnly(false)
                    setIsRead(false)
                  }}
                  className={`h-10 w-full text-gray-600 rounded-full px-4 py-2 ${!showUnreadOnly ? "bg-white shadow text-gray-800" : ""}`}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowUnreadOnly(true)
                    setIsRead(true)
                  }}
                  className={`h-10 w-full text-gray-600 rounded-full px-4 py-2 ${showUnreadOnly ? "bg-white shadow text-gray-800" : ""}`}
                >
                  Unread {unreadMessageCount > 0 ? `(${unreadMessageCount})` : "(0)"}
                </Button>
              </div>
            </div>

            {/* Threads List */}
            {props?.loading ?
              <div className="flex items-center justify-center h-32">
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
              </div> :
              <ScrollArea className="px-4 py-2 overflow-auto h-[calc(96vh-16rem)]">
                {displayedThreads.length ? (
                  displayedThreads.map((entry) => {
                    const thread = entry.baseThread;
                    const participants = [
                      ...(thread?.buyerAgent ? [thread.buyerAgent] : []),
                      ...(thread?.sellerAgent ? [thread.sellerAgent] : []),
                      ...(thread?.user ? [thread.user] : []),
                      ...(Array.isArray(thread?.participants) ? thread.participants.map(p => p.user) : []),
                    ];
                    const lastMessage = thread?.messages?.[thread?.messages?.length - 1]
                    const initials = getInitials(
                      `${thread?.buyerAgent?.firstName || ''} ${thread?.user?.firstName || thread?.sellerAgent?.firstName || ''}`
                    );
                    const agentId =
                      entry.agentId ||
                      thread?.buyerAgent?.id ||
                      thread?.sellerAgent?.id ||
                      thread?.participants
                        ?.map((participant: any) => participant?.user)
                        .find(
                          (participant: any) =>
                            participant?.id && participant.id !== userData?.id,
                        )?.id ||
                      null;
                    const engagedProperties = entry.properties;
                    const engagedPropertiesCount =
                      engagedProperties.length ||
                      (thread?.propertyId ? 1 : 0);
                    const entryKey = entry.entryKey;
                    const isExpanded = expandedEntryKey === entryKey;
                    const isActiveThread = selectedThreadDetail?.id === thread?.id;
                    const threadCardClasses = `relative flex flex-col w-full mt-3 gap-3 rounded-2xl border p-5 transition-colors shadow-sm cursor-pointer ${isActiveThread ? 'bg-[#FFF7EF] border-[#F6D4B3]' : 'bg-white border-[#F1ECE6]'
                      }`;
                    const timestampColor = isActiveThread ? 'text-[#C4A189]' : 'text-gray-400';
                    const engagedLabelColor = isActiveThread ? 'text-[#B5571E]' : 'text-gray-500';
                    const agentForThread = (() => {
                      const candidates = [thread?.buyerAgent, thread?.sellerAgent].filter(Boolean) as any[];
                      if (userData?.id) {
                        const other = candidates.find((agent) => agent?.id && agent.id !== userData.id);
                        if (other) return other;
                      }
                      return candidates[0] || null;
                    })();
                    const agentName =
                      [agentForThread?.firstName, agentForThread?.lastName].filter(Boolean).join(' ') || 'Agent';
                    const agentImage = agentForThread?.profile || agentForThread?.image || agentForThread?.avatar || '';

                    return (
                      <div
                        key={thread.id}
                        className={threadCardClasses}
                        onClick={() => handleThreadSelection(thread, participants)}
                      >
                        {lastMessage?.createdAt ? (
                          <span className={`absolute top-4 right-5 text-[11px] sm:text-xs ${timestampColor}`}>
                            {formatDistanceToNow(new Date(lastMessage?.createdAt), { addSuffix: true })}
                          </span>
                        ) : null}

                        <div
                          className="flex items-start gap-4 w-full"
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpandedEntryKey((prev) =>
                              prev === entryKey ? null : entryKey,
                            );
                          }}
                        >
                          {agentImage || thread?.image ? (
                            <Image
                              src={agentImage || thread.image}
                              alt="Agent Avatar"
                              width={50}
                              height={50}
                              className="rounded-full object-cover w-[40px] h-[40px] sm:w-[50px] sm:h-[50px]"
                              priority
                              unoptimized
                            />
                          ) : (
                            <div className="rounded-full flex items-center justify-center font-semibold w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-gray-800 text-white">
                              {getInitials(agentName)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {agentName}
                            </p>
                            <p className={`text-xs font-medium ${engagedLabelColor}`}>
                              Engaged in - {engagedPropertiesCount}{' '}
                              {engagedPropertiesCount === 1 ? 'property' : 'properties'}
                            </p>
                          </div>
                        </div>

                        {isExpanded && engagedProperties.length > 0 && (
                          <div className="mt-4 space-y-3 w-full">
                            {engagedProperties.map((property: AgentPropertySummary) => {
                              const isActiveProperty = selectedThreadDetail?.id === property.threadId;
                              const displayTitle =
                                property.propertyAddress || property.propertyName || 'Property';
                              const participantUsers = (property.participants ?? [])
                                .map((participant: any) => participant?.user)
                                .filter(
                                  (participant: any) =>
                                    participant?.id && participant.id !== userData?.id,
                                )
                                .slice(0, 3);

                              return (
                                <div
                                  key={property.propertyId}
                                  className={`w-full min-h-[86px] rounded-3xl border px-6 py-4 text-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${isActiveProperty
                                    ? 'bg-[#1B1B1B] text-white border-[#1B1B1B]'
                                    : 'bg-[#FFF4EC] text-[#352416] border-[#F5D4B7]'
                                    }`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    selectThreadById(property.threadId);
                                    setExpandedEntryKey(entryKey);
                                  }}
                                >
                                  <div>
                                    <p className="font-semibold text-sm sm:text-base truncate">
                                      {displayTitle}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center justify-between">
                                    <Link
                                      href={`/buy/${property.listingId || property.propertyId}/prop/preview`}
                                      onClick={(event) => event.stopPropagation()}
                                      className={`text-sm font-semibold ${isActiveProperty ? 'text-[#FDD9BD]' : 'text-[#E47A36]'
                                        }`}
                                    >
                                      View Property
                                    </Link>
                                    {participantUsers.length > 0 && (
                                      <div className="flex -space-x-2">
                                        {participantUsers.map((participant: any) => {
                                          const participantImage =
                                            participant?.profile ||
                                            participant?.avatar ||
                                            participant?.image ||
                                            '';
                                          const rawName =
                                            `${participant?.firstName || ''} ${participant?.lastName || ''}`.trim();
                                          const fallbackName =
                                            rawName ||
                                            participant?.email ||
                                            participant?.user?.email ||
                                            participant?.id ||
                                            'NA';
                                          const initials = getInitials(fallbackName);

                                          return (
                                            <div
                                              key={participant?.id}
                                              className={`h-7 w-7 rounded-full border overflow-hidden flex items-center justify-center text-[10px] font-semibold ${isActiveProperty
                                                ? 'border-white bg-[#FBB785] text-white'
                                                : 'border-[#FFE8D3] bg-[#FBB785] text-white'
                                                }`}
                                            >
                                              {participantImage ? (
                                                <Image
                                                  src={participantImage}
                                                  alt="Participant"
                                                  width={28}
                                                  height={28}
                                                  className="h-7 w-7 object-cover"
                                                  unoptimized
                                                />
                                              ) : (
                                                initials || 'NA'
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center mt-6 text-gray-400">
                    <p className="text-lg font-semibold">
                      {showUnreadOnly ? "No unread conversations" : "No threads available"}
                    </p>
                    <p className="text-sm">
                      {showUnreadOnly
                        ? "You're all caught up for now."
                        : "It seems like you have not started any conversations yet."}
                    </p>
                  </div>
                )}
              </ScrollArea>
            }
          </div>


          <div
            className={`w-full min-w-0 ${showDetails
              ? "md:basis-[50%] md:max-w-[50%] md:min-w-[50%]"
              : "md:basis-[75%] md:max-w-[75%] md:min-w-[75%]"
              } flex flex-col bg-white ${showChat ? "block" : "hidden md:block"} max-h-full overflow-hidden`}
          >
            <header className="border-b bg-white px-4 py-2 flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2 min-w-0">
                <Button variant="ghost" size="icon" onClick={handleBackToThreads}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm">Back</span>
                <span className="font-semibold truncate">{state?.selectedChannel?.propertyName || ""}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setShowDetails(true)}
              >
                Details
              </Button>
            </header>
            <div className="flex-1 flex bg-white">
              {(state.selectedChannel.id || selectedThreadDetail?.id || selectedThread) ? (
                <div className="flex-1 flex flex-col">
                  {messageLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader size="md" />
                    </div>
                  ) : (
                    <>
                      {/* Chat Header */}
                      <div className="bg-white border-b shadow-sm">
                        {/* Main Header Row */}
                        <div className="px-4 py-4 flex justify-between items-start">
                          {/* Left Section: Avatar and User Info */}
                          <div className="flex items-start gap-3 flex-1">
                            {/* Avatar Container */}
                            <div className="relative flex-shrink-0">
                              {agentImageForHeader || selectedThread?.image ? (
                                <Image
                                  src={agentImageForHeader || selectedThread?.image}
                                  alt="Agent Avatar"
                                  width={50}
                                  height={50}
                                  className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12"
                                  priority
                                  unoptimized
                                />
                              ) : (
                                <div className="rounded-full flex items-center justify-center bg-black text-white font-semibold w-10 h-10 sm:w-12 sm:h-12 text-xs sm:text-sm">
                                  {getInitials(
                                    agentNameForHeader ||
                                    `${selectedThread?.buyerAgent?.firstName?.[0] || ""} ${selectedThread?.user?.firstName?.[0] || selectedThread?.sellerAgent?.firstName?.[0] || ""}`
                                  )}
                                </div>
                              )}
                              {/* Online Indicator */}
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              {/* User Name */}
                              <p className="font-bold text-sm sm:text-base text-gray-900 truncate">
                                {agentNameForHeader ||
                                  `${selectedThreadDetail.buyerAgent?.firstName || ""} & ${selectedThreadDetail?.user?.firstName || selectedThreadDetail?.sellerAgent?.firstName || ""}`}
                              </p>

                              {/* Participant Count */}
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                                <span className="font-medium">{threadParticipants?.length || 0} participants</span>
                              </div>
                            </div>
                          </div>

                          {/* Public Chat Toggle intentionally hidden for now.
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Public Chat</span>
                            <div className="w-11 h-6 bg-gray-300 rounded-full relative cursor-pointer hover:bg-gray-400 transition-colors flex items-center px-1">
                              <div className="w-5 h-5 bg-white rounded-full shadow-md transition-transform"></div>
                            </div>
                          </div>
                          */}

                          <div className="relative">
                            <button className="p-2 rounded-full hover:bg-gray-100" onClick={toggleDropdown}>
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {isDropdownOpen && (
                              <div
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border"
                                style={{ zIndex: 100 }}
                              >
                                <ul className="py-1">
                                  <li>
                                    <button
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                      onClick={() => {
                                        closeDropdown()
                                        // setIsDetails(!isDetails)
                                        setShowDetails(!showDetails)
                                      }}
                                    >
                                      Property Details
                                    </button>
                                  </li>
                                  <li>
                                    <InviteUserModal
                                      threadId={selectedThreadDetail?.id || selectedThread}
                                      onInviteSuccess={handleInviteSuccess}
                                      onParticipantsRefresh={() => {
                                        const activeThreadId = selectedThreadDetail?.id || selectedThread
                                        if (activeThreadId) {
                                          getThreadDetails(activeThreadId)
                                        }
                                      }}
                                      disableInvite={isInviteLimitReached}
                                      disableInviteMessage={inviteLimitMessage}
                                      blockedEmails={blockedInviteEmails}
                                      currentUserEmail={userData?.email || user?.email}
                                      currentUserData={userData}
                                      propertyId={selectedThreadDetail?.propertyId || snapzPropertyId}
                                      listingId={selectedThreadDetail?.listingId || snapzListingId}
                                      propertyName={
                                        selectedThreadDetail?.propertyName ||
                                        propertyData?.listing?.courtesyOf
                                      }
                                      propertyAddress={
                                        selectedThreadDetail?.propertyAddress ||
                                        propertyData?.listing?.address?.unparsedAddress
                                      }
                                      propertyImage={snapzPropertyImage}
                                    />
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>


                        </div>

                        {/* Conversation Type Indicator Row */}
                        <div className="px-4 py-2.5 bg-white flex items-center gap-3 text-xs sm:text-sm">
                          <span className="font-semibold text-gray-700">Conversation:</span>

                          {/* Buyer Role */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                            <span className="text-gray-600">Buyer</span>
                          </div>

                          {/* Seller Role */}
                          {/* <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                            <span className="text-gray-600">Seller</span>
                          </div> */}

                          {/* Agent Role */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                            <span className="text-gray-600">Agent</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative bg-[#F7F2EB]">
                        <ScrollArea
                          ref={messageScrollAreaRef}
                          className="ms-2 mb-2 sm:ms-5 scrollbar-hide sm:me-5 overflow-auto h-[calc(96vh-16rem)] sm:h-[calc(96vh-18rem)]"
                        >
                          <div className="space-y-6 me-4">
                            {Object.entries(groupedMessages)
                              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                              .map(([dateKey, dayMessages]) => {
                                const parsedDate = new Date(dateKey);
                                // const label = "Today"
                                const label = isToday(parsedDate)
                                  ? "Today"
                                  : isYesterday(parsedDate)
                                    ? "Yesterday"
                                    : format(parsedDate, "EEEE, MMMM d");

                                return (
                                  <div key={dateKey}>
                                    <div className="text-center py-2">
                                      <span className="text-gray-500 text-xs sm:text-sm font-medium bg-white px-3 py-1 rounded-full shadow">
                                        {label}
                                      </span>
                                    </div>


                                    <div className="space-y-4">
                                      {[...dayMessages]
                                        .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b?.createdAt ?? 0).getTime())
                                        .map((message, index) => {
                                          const isSender = message.senderId === userData?.id;
                                          const isLastMessage = index === dayMessages?.length - 1;
                                          const formattedTime = format(new Date(message?.createdAt ?? 0), "hh:mm a");
                                          const receiver = threadParticipants.find(
                                            (p: any) => p.id === message.senderId && p.id !== userData?.id
                                          );
                                          const receiverImage = resolveProfileImage(receiver);
                                          const senderImage = resolveProfileImage(userData) || resolveProfileImage(user);
                                          const receiverFallbackName =
                                            `${receiver?.firstName || ''} ${receiver?.lastName || ''}`.trim() ||
                                            receiver?.email ||
                                            receiver?.id ||
                                            'NA';
                                          const senderFallbackName =
                                            `${userData?.firstname || ''} ${userData?.lastname || ''}`.trim() ||
                                            userData?.email ||
                                            userData?.id ||
                                            user?.email ||
                                            user?.id ||
                                            'NA';

                                          const notificationMessage = message?.messageType === "notification";
                                          const systemMessage = message?.messageType === "system";

                                          return (
                                            <div
                                              key={index}
                                              className={`flex gap-3 mt-4 items-start ${isSender ? 'justify-end' : ''}`}
                                            // ref={isLastMessage ? messagesEndRef : null}
                                            >
                                              {systemMessage && (
                                                <div className="flex justify-center rounded-xl text-center w-full pt-4 p-3">
                                                  <div className="bg-white shadow-md rounded-full w-fit px-8 py-3">
                                                    <div className="flex gap-2 items-center justify-center">
                                                      <MdNotificationAdd size={20} />
                                                      <p className="whitespace-pre-wrap break-words text-sm">
                                                        {getSystemMessageText(message)}
                                                      </p>
                                                    </div>
                                                    <div className="text-xs text-gray-400 px-2 mt-1 text-right">
                                                      {formattedTime}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              {notificationMessage &&

                                                <div className="flex justify-center  rounded-xl text-center w-full  pt-6 p-3">
                                                  <div className="bg-white shadow-md rounded-full w-fit px-8 py-4 pt-6">
                                                    <div className="flex gap-2 items-center">
                                                      <MdNotificationAdd size={24} />
                                                      <p className="whitespace-pre-wrap break-words  text- text-sm">{message.message}</p>
                                                    </div>
                                                    <div className={`text-xs text-gray-400 px-2 mt-2 text-right`}>
                                                      {formattedTime}
                                                    </div>
                                                  </div>

                                                </div>
                                              }
                                              {!isSender && receiver && !notificationMessage && !systemMessage && (
                                                <div className="w-7 h-7 sm:w-10 sm:h-10 mt-4 rounded-full border border-white/70 bg-[#FBB785] overflow-hidden flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 text-white">
                                                  {receiverImage ? (
                                                    <Image
                                                      src={receiverImage}
                                                      alt="Participant"
                                                      width={40}
                                                      height={40}
                                                      className="h-full w-full object-cover"
                                                      unoptimized
                                                    />
                                                  ) : (
                                                    getInitials(receiverFallbackName) || 'NA'
                                                  )}
                                                </div>
                                              )}


                                              {!notificationMessage && !systemMessage &&

                                                <div className="w-full flex flex-col gap-1">
                                                  {/* Time aligned to sender/receiver side */}
                                                  <div className={`text-xs text-gray-400 px-2 ${isSender ? "text-right" : "text-left"}`}>
                                                    {formattedTime}
                                                  </div>

                                                  {/* Message container taking full width */}
                                                  <div className={`w-full flex ${isSender ? "justify-end" : "justify-start"}`}>
                                                    <div
                                                      className={`p-3 sm:p-4 bg-white text-black font-medium rounded-2xl shadow-md text-xs sm:text-sm max-w-full sm:max-w-[90%]`}
                                                    >
                                                      {/* Text message */}
                                                      {message?.messageType !== "file" && message.message && (
                                                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                                      )}

                                                      {/* File message */}
                                                      {message?.messageType === "file" && (
                                                        <div className="rounded-lg flex items-center gap-3 p-2">
                                                          {(() => {
                                                            // Get the file URL - ensure it's not encrypted
                                                            let fileUrl = message.message || "";

                                                            // Handle CL:: prefix (legacy encryption artifact)
                                                            if (fileUrl.startsWith('CL::')) {
                                                              fileUrl = fileUrl.substring(4);
                                                            }

                                                            // If the URL looks encrypted (starts with common encryption patterns), try to decrypt
                                                            // But file URLs from S3 should not be encrypted, so only decrypt if it looks like encrypted text
                                                            if (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('data:')) {
                                                              try {
                                                                const decrypted = decryptMessage(fileUrl);
                                                                // Only use decrypted if it looks like a URL
                                                                if (decrypted.startsWith('http') || decrypted.startsWith('data:')) {
                                                                  fileUrl = decrypted;
                                                                }
                                                              } catch (error) {
                                                                console.log("[ChatBox] File URL might not be encrypted:", error);
                                                              }
                                                            }

                                                            // Helper to extract filename
                                                            const getFileNameFromUrl = (url: string) => {
                                                              try {
                                                                if (!url) return "File";
                                                                const cleanUrl = url.split('?')[0]; // Remove query params
                                                                const fileName = cleanUrl.split('/').pop() || "File";
                                                                const decodedFileName = decodeURIComponent(fileName);

                                                                // Regex to match UUID at the beginning of the filename (8-4-4-4-12 hex chars followed by a hyphen)
                                                                const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-?/;
                                                                return decodedFileName.replace(uuidPattern, "");
                                                              } catch (e) {
                                                                console.error("Error parsing filename:", e);
                                                                return "File";
                                                              }
                                                            };

                                                            if (message.fileType && imageMimeType.includes(message.fileType)) {
                                                              return (
                                                                <div
                                                                  className="relative cursor-pointer group"
                                                                  onClick={() => openMediaPreview(fileUrl, message.fileType ?? "")}
                                                                >
                                                                  <Image
                                                                    src={fileUrl || "/placeholder.svg"}
                                                                    alt="Uploaded Image"
                                                                    width={140}
                                                                    height={140}
                                                                    unoptimized={true}
                                                                    priority
                                                                    className="rounded-lg max-w-[120px] hover:opacity-90 transition-opacity"
                                                                    onError={(e) => {
                                                                      console.error("[ChatBox] Failed to load image:", fileUrl);
                                                                      // Fallback to placeholder
                                                                      e.currentTarget.src = "/placeholder.svg";
                                                                    }}
                                                                  />
                                                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                                    <Maximize className="w-4 h-4 text-white" />
                                                                  </div>
                                                                </div>
                                                              );
                                                            } else if (message.fileType && videoMimeType?.includes(message.fileType)) {
                                                              return (
                                                                <video
                                                                  controls
                                                                  className="rounded-lg max-w-[120px]"
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openMediaPreview(fileUrl, message.fileType || "");
                                                                  }}
                                                                >
                                                                  <source src={fileUrl} type={message.fileType} />
                                                                  Your browser does not support the video tag.
                                                                </video>
                                                              );
                                                            } else {
                                                              return (
                                                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                                                  <FileText className="w-5 h-5 text-gray-600" />
                                                                  {/* Display Filename instead of truncated URL */}
                                                                  <span className="truncate max-w-[100px] sm:max-w-full" title={getFileNameFromUrl(fileUrl)}>
                                                                    {getFileNameFromUrl(fileUrl)}
                                                                  </span>
                                                                  <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 hover:underline"
                                                                  >
                                                                    <Eye className="w-4 h-4 text-orange-500" />
                                                                  </a>
                                                                </div>
                                                              );
                                                            }
                                                          })()}
                                                        </div>
                                                      )}

                                                      {/* Reply Preview */}
                                                      {message.parentMessageId && (
                                                        <div className="mt-2 p-2 border-l-4 border-gray-300 text-sm italic">
                                                          Replying to: <span className="font-medium">{message.parentMessageId}</span>
                                                        </div>
                                                      )}

                                                      {/* Seen indicator */}
                                                      {isSender && isLastMessage && message.seen && (
                                                        <div className="text-xs text-blue-500 mt-1 text-right">Seen</div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              }


                                              {isSender && !notificationMessage && !systemMessage && (
                                                <div className="w-7 h-7 mt-4 sm:w-10 sm:h-10 rounded-full border border-white/70 bg-[#FBB785] overflow-hidden flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 text-white">
                                                  {senderImage ? (
                                                    <Image
                                                      src={senderImage}
                                                      alt="You"
                                                      width={40}
                                                      height={40}
                                                      className="h-full w-full object-cover"
                                                      unoptimized
                                                    />
                                                  ) : (
                                                    getInitials(senderFallbackName) || 'NA'
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>

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
                          <div ref={messagesEndRef} />
                        </ScrollArea>

                        {pendingNewMessageCount > 0 && !isAtLatestMessage && (
                          <button
                            type="button"
                            onClick={scrollToLatestMessages}
                            className="absolute bottom-4 right-6 flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-gray-800"
                          >
                            <ArrowDown className="h-4 w-4" />
                            <span>New message</span>
                          </button>
                        )}
                      </div>
                      {/* Message Input Section
                      <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100">
                            <Paperclip className="h-5 w-5 text-gray-600" />
                            <input type="file" className="hidden" onChange={handleFileChange} />
                          </label>
                          <form
                            className="flex-1 py-2 px-4"
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleSendMessage()
                            }}
                          >
                            <Input
                              className="flex-1 py-2 px-4 border rounded-lg focus:outline-none"
                              placeholder="Type a message..."
                              value={message}
                              onChange={handleInputChange}
                            />
                          </form>
                          <Button
                            size="icon"
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex px-3 gap-2"
                            onClick={handleSendMessage}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div> */}

                      <div className="p-2 sm:p-4 border-t relative bg-white">
                        {fileErrorMsg && (
                          <div className="absolute -top-10 left-0 right-0 bg-red-100 text-red-600 p-2 text-xs sm:text-sm text-center">
                            {fileErrorMsg}
                          </div>
                        )}
                        <div className="flex items-center gap-1 sm:gap-2">
                          {/* File Upload with dropdown */}
                          <div className="relative">
                            <button
                              className="cursor-pointer  p-1 sm:p-2 rounded-full hover:bg-[#FAF9F5]"
                              onClick={toggleUploadMenu}
                            >
                              <FolderOpenDot className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
                            </button>
                            {showUploadMenu && (
                              <div
                                ref={uploadMenuRef}
                                className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-md z-10 w-44 overflow-hidden"
                              >
                                <div className="p-2 text-xs sm:text-sm flex flex-col items-center">
                                  <Image
                                    src="/assets/images/v2/pangea_logo1.jpg"
                                    alt="Powered by Pangea"
                                    width={100}
                                    height={100}
                                    className="object-contain mx-auto mb-2"
                                  />
                                  <div className="space-y-1 w-full">
                                    <label className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
                                      <Paperclip className="h-4 w-4 text-blue-500" />
                                      <span>Image</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,image/jpg"
                                      />
                                    </label>
                                    <label className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
                                      <Play className="h-4 w-4 text-red-500" />
                                      <span>Video</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="video/mp4,video/webm,video/ogg"
                                      />
                                    </label>
                                    <label className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <span>Document</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="application/pdf"
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="relative">
                            <button
                              type="button"
                              className="p-1 sm:p-2 rounded-full bg-[#FAF9F5] hover:bg-[#FAF9F5]"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            </button>
                            {showEmojiPicker && (
                              <div
                                ref={emojiPickerRef}
                                className="absolute bottom-12 left-0 z-10 scale-75 sm:scale-100 origin-bottom-left"
                                onKeyDownCapture={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                  }
                                }}
                              >
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                              </div>
                            )}
                          </div>

                          {/* Message Input */}
                          <form
                            className="flex-1 py-1 sm:py-2 px-2 sm:px-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                          >
                            <Input
                              className="flex-1 py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm border rounded-lg focus:outline-none"
                              placeholder="Type a message..."
                              value={message}
                              onChange={handleInputChange}
                            />
                          </form>

                          {/* Send Button */}
                          <Button
                            size="icon"
                            className="bg-black text-white rounded-xl flex h-8 w-8 sm:h-10 sm:w-auto sm:px-3 sm:gap-2 items-center justify-center"
                            onClick={handleSendMessage}
                          > <SendHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Send</span>

                          </Button>
                        </div>
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

          {/* Property Details Sidebar */}
          {showDetails && (
            <div className="w-full md:basis-[25%] md:max-w-[25%] md:min-w-[25%] bg-gray-50 border-l flex flex-col overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold">Property Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // setIsDetails(false)
                    setShowDetails(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="mb-2 overflow-auto h-[calc(110vh-16rem)]">
                <div className="p-4">
                  <Accordion type="multiple" defaultValue={["property-details", "invited-users", "media-documents"]} className="w-full">
                    <AccordionItem value="property-details" className="border rounded-xl bg-white px-3">
                      <AccordionTrigger>Property Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="pb-2">
                          <div className="relative">
                            <Image
                              src={propertyData?.media?.photosList?.[0]?.lowRes || ""}
                              alt={`Property Image `}
                              width={400}
                              height={100}
                              className="rounded-lg objectcover"
                              priority
                              unoptimized
                            />
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-1">
                                <LocationOnIcon className="text-primary" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {selectedThreadDetail?.propertyAddress || selectedThreadDetail?.propertyName || "Property"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span>4.6</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                              <div className="flex gap-2">
                                <div className="bg-gray-200 text-sm rounded-full px-3 py-1 flex items-center">
                                  <BathtubIcon />
                                  <span>{propertyData?.property?.bathroomsTotal} Bath</span>
                                </div>
                                <div className="bg-gray-200 text-sm rounded-full px-3 py-1 flex items-center">
                                  <KingBedIcon />
                                  <span>{propertyData?.property?.bedroomsTotal} Bed</span>
                                </div>
                              </div>
                              <SnapzHeartButton
                                isActive={isFavored}
                                size={20}
                                className="text-gray-500 hover:text-red-500"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (!isLoggedIn) {
                                    router.push("/login")
                                    return
                                  }

                                  if (!snapzPropertyId || !snapzListingId) {
                                    error({ message: "Property details are still loading. Please try again." })
                                    return
                                  }

                                  // Modal reads data from Redux property slice; keep it populated from chat context.
                                  saveCurrenctProperty({
                                    ...propertyData,
                                    id: snapzPropertyId,
                                    propertyId: snapzPropertyId,
                                    listingId: snapzListingId,
                                    image: snapzPropertyImage,
                                    listing: {
                                      ...(propertyData?.listing || {}),
                                      courtesyOf:
                                        propertyData?.listing?.courtesyOf ||
                                        propertyData?.courtesyOf ||
                                        selectedThreadDetail?.propertyName,
                                      listPriceLow:
                                        propertyData?.listing?.listPriceLow ||
                                        propertyData?.listPrice ||
                                        0,
                                      address: {
                                        ...(propertyData?.listing?.address || {}),
                                        unparsedAddress:
                                          propertyData?.listing?.address?.unparsedAddress ||
                                          selectedThreadDetail?.propertyAddress,
                                        city:
                                          propertyData?.listing?.address?.city ||
                                          propertyData?.address?.city,
                                        zipCode:
                                          propertyData?.listing?.address?.zipCode ||
                                          propertyData?.address?.zipCode,
                                      },
                                      media: {
                                        ...(propertyData?.listing?.media || {}),
                                        primaryListingImageUrl: snapzPropertyImage,
                                      },
                                      property: {
                                        ...(propertyData?.listing?.property || {}),
                                        bedroomsTotal:
                                          propertyData?.listing?.property?.bedroomsTotal ||
                                          propertyData?.property?.bedroomsTotal,
                                        bathroomsTotal:
                                          propertyData?.listing?.property?.bathroomsTotal ||
                                          propertyData?.property?.bathroomsTotal,
                                        livingArea:
                                          propertyData?.listing?.property?.livingArea ||
                                          propertyData?.property?.livingArea,
                                      },
                                    },
                                    public: {
                                      ...(propertyData?.public || {}),
                                      imageUrl: snapzPropertyImage,
                                    },
                                  } as any)

                                  openCollectionModal(
                                    String(snapzPropertyId),
                                    snapzPropertyImage,
                                    fetchSnaps,
                                  )
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <h4 className="font-semibold text-lg">Overview</h4>
                            <span>{propertyData?.publicRemarks}</span>

                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Property Overview</DialogTitle>
                                  <DialogDescription>{propertyData?.property?.descriptions?.[0]?.value}</DialogDescription>
                                </DialogHeader>
                                <DialogClose asChild>
                                  <Button className="bg-orange-500 hover:bg-orange-600">Close</Button>
                                </DialogClose>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Amenities</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Wifi className="h-4 w-4" />
                                <span className="text-sm">Wifi</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Kitchen className="h-4 w-4" />
                                <span className="text-sm">Kitchen</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Maximize2 className="h-4 w-4" />
                                <span className="text-sm">Workspace</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span className="text-sm">Free parking</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4" />
                                <span className="text-sm">Air conditioning</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            className="shadow bg-orange-500 hover:bg-orange-600 w-full mt-6"
                            onClick={() => {
                              router.push(`/buy/${propertyData.property?.id}/prop/preview`)
                            }}
                          >
                            View Property
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="invited-users" className="border rounded-xl bg-white px-3 mt-4">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span>Invited Users</span>
                          <span className="text-xs text-gray-500">({invitedUsers.length})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pb-2">
                          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            {invitedUsers.length === 0 ? (
                              <div className="px-4 py-6 text-center">
                                <p className="text-sm font-medium text-gray-600">No invited users yet</p>
                                <p className="text-xs text-gray-400 mt-1">Users invited to this chat will appear here.</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {invitedUsers.map((invitedUser) => {
                                  const styles = invitedUserStyles[invitedUser.status]
                                  const isExistingInviteDisabled = isInviteLimitReached
                                  return (
                                    <div
                                      key={invitedUser.id}
                                      className={`flex items-center justify-between gap-3 px-3 py-3 transition-colors ${isExistingInviteDisabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 ${styles.avatar}`}>
                                          {invitedUser.initials}
                                        </div>
                                        <div className="min-w-0">
                                          <p className={`text-sm font-semibold truncate ${styles.name}`}>
                                            {invitedUser.name}
                                          </p>
                                          <p className={`text-xs truncate ${styles.email}`}>
                                            {invitedUser.email || "Email not available"}
                                          </p>
                                          <p className="text-[11px] text-gray-500 truncate">
                                            {invitedUser.role}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles.badge}`}>
                                          {isExistingInviteDisabled ? "Disabled" : styles.label}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500 mt-2">
                            Invites expire after 10 days if not accepted.
                          </p>
                          {isInviteLimitReached && (
                            <p className="text-xs text-red-600 mt-1">
                              {inviteLimitMessage}
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="media-documents" className="border rounded-xl bg-white px-3 mt-4">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <span>Media & Documents</span>
                          <span className="text-xs text-gray-500">({mediaDocuments.length})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pb-2">
                          {mediaDocuments.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden px-4 py-6 text-center">
                              <p className="text-sm font-medium text-gray-600">No media or documents yet</p>
                              <p className="text-xs text-gray-400 mt-1">Files shared in this chat will appear here.</p>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                              <Accordion
                                type="multiple"
                                defaultValue={["media-items", "document-items"]}
                                className="w-full"
                              >
                                <AccordionItem value="media-items" className="border-0 border-b">
                                  <AccordionTrigger className="px-3 py-3">
                                    <span className="text-sm font-semibold">
                                      Media ({mediaDocuments.filter((item) => item.kind === "image" || item.kind === "video").length})
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100">
                                      {mediaDocuments.filter((item) => item.kind === "image" || item.kind === "video").length === 0 ? (
                                        <div className="px-4 py-5 text-center text-xs text-gray-500">
                                          No media yet
                                        </div>
                                      ) : (
                                        mediaDocuments
                                          .filter((item) => item.kind === "image" || item.kind === "video")
                                          .map((item) => {
                                            const createdDate = item.createdAt ? new Date(item.createdAt) : null
                                            const hasValidDate = createdDate instanceof Date && !Number.isNaN(createdDate.getTime())
                                            const timeLabel = hasValidDate
                                              ? formatDistanceToNow(createdDate, { addSuffix: true })
                                              : "Unknown time"
                                            return (
                                              <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => openMediaPreview(item.url, item.fileType)}
                                                className="w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors"
                                              >
                                                <div className="flex items-center gap-3 min-w-0">
                                                  {item.kind === "image" ? (
                                                    <img
                                                      src={item.url}
                                                      alt={item.fileName}
                                                      className="w-12 h-12 rounded-md object-cover border border-gray-200 shrink-0"
                                                      onError={(e) => {
                                                        e.currentTarget.src = "/placeholder.svg"
                                                      }}
                                                    />
                                                  ) : (
                                                    <div className="w-12 h-12 rounded-md border border-gray-200 shrink-0 flex items-center justify-center bg-black text-white">
                                                      <Play className="w-5 h-5" />
                                                    </div>
                                                  )}
                                                  <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 truncate" title={item.fileName}>
                                                      {item.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                      {item.senderName} . {timeLabel}
                                                    </p>
                                                  </div>
                                                  <Eye className="w-4 h-4 text-orange-500 shrink-0" />
                                                </div>
                                              </button>
                                            )
                                          })
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="document-items" className="border-0">
                                  <AccordionTrigger className="px-3 py-3">
                                    <span className="text-sm font-semibold">
                                      Documents ({mediaDocuments.filter((item) => item.kind === "document").length})
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100">
                                      {mediaDocuments.filter((item) => item.kind === "document").length === 0 ? (
                                        <div className="px-4 py-5 text-center text-xs text-gray-500">
                                          No documents yet
                                        </div>
                                      ) : (
                                        mediaDocuments
                                          .filter((item) => item.kind === "document")
                                          .map((item) => {
                                            const createdDate = item.createdAt ? new Date(item.createdAt) : null
                                            const hasValidDate = createdDate instanceof Date && !Number.isNaN(createdDate.getTime())
                                            const timeLabel = hasValidDate
                                              ? formatDistanceToNow(createdDate, { addSuffix: true })
                                              : "Unknown time"
                                            return (
                                              <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                                                className="w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors"
                                              >
                                                <div className="flex items-center gap-3 min-w-0">
                                                  <div className="w-12 h-12 rounded-md border border-gray-200 shrink-0 flex items-center justify-center bg-gray-100 text-gray-700">
                                                    <FileText className="w-5 h-5" />
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 truncate" title={item.fileName}>
                                                      {item.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                      {item.senderName} . {timeLabel}
                                                    </p>
                                                  </div>
                                                  <Eye className="w-4 h-4 text-orange-500 shrink-0" />
                                                </div>
                                              </button>
                                            )
                                          })
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </section>
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
