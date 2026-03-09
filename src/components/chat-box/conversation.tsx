'use client';

import Image from 'next/image';
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
  FolderOpenDot,
  Plus,
  Smile,
  CheckCheck,
  Check,
  CircleCheck,
  Play,
  Maximize,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  View,
  Eye,
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import KingBedIcon from '@mui/icons-material/KingBed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { format, isSameDay, subDays } from 'date-fns';
import { initialState, SocketContext } from '../../providers/socket.context';
import { FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { error, success } from '../alert/notify';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import useDebounce from '../../lib/debounce';
import { useAgentConversationApi } from '../../lib/api/useConversationApi';
import { useAtom } from 'jotai';
import { agentReadWriteAtom } from '../../store/atoms/agent-atom';
import EmojiPicker from 'emoji-picker-react';
import { v4 as uuidv4 } from 'uuid';
import { useFAQApi } from '../../lib/api/useFAQApi';
import { Loader } from '@mantine/core';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { usePropertyServiceAPI } from '../../lib/api/property';
import { useRepoManagementApi } from '../../lib/api/useRepoManagement';
import { claimPropertyAtom } from '../../hooks/claim-property-atom';
import Modal from '../common/Modal';
import NegotiationCard from './negotiation-card';
import { normalizeAgentTiersPayload } from './agent-tier-utils';
import { sendNegotiationUpdateEmail } from '@/utils/email-notification';

interface User {
  id: string;
  username: string;
  message: string;
  image: string;
}
interface Message {
  id: string;
  isRead?: boolean;
  threadId: string;
  message: string;
  senderId: string;
  receiverId: string;
  createdAt?: string;
  seen?: boolean;
  messageType?: string;
  fileType?: string;
  parentMessageId?: string | null;
  file?: {
    name?: string;
    url?: string;
    type?: string;
  };
}

interface Thread {
  id: string;
  propertyOwnerId: string;
  listingId?: string;
  threadName?: string;
  image?: string;
  propertyName?: string;
  message?: string;
  lastSeen?: string;
  unreadCount?: number;
  propertyAddress?: string;
  propertyId?: string;
  buyerAgent?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  sellerAgent?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string | null;
  isTyping?: boolean;
  members?: any[];
  threadId?: string | null;
  isActive?: boolean;
  visibleForOthersUsers?: boolean;
  status?: "NEGOTIATION_PENDING" | "OFFER_SENT" | "COUNTER_SENT" | "AGREED" | "ACTIVE";
}
interface PropertyData {
  media?: {
    primaryListingImageUrl?: string;
  };
  listingId?: string;
  property?: {
    bathroomsTotal?: number;
    bedroomsTotal?: number;
  };
  address?: {
    unparsedAddress?: string;
  };
  courtesyOf?: string;
  publicRemarks?: string;
}

// Update the interface for the MediaPreview type
export interface MediaPreview {
  type: string;
  url: string;
  name?: string;
  loaded?: boolean;
  loading?: boolean;
  error?: boolean;
}

interface BuyerQuestionInterface {
  id: string;
  question: string;
  answer: string;
  user: {
    image?: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function ConversationPageForBuyerAgentChat(props: any) {
  const { threads, setIsRead, setSearch, loading, updateConversationThread, agentEmail, focusLatest } =
    props;
  const router = useRouter();
  const { socket, state, setState } = useContext(SocketContext);
  const [isDetails, setIsDetails] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeButton, setActiveButton] = useState('all');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fileErrorMsg, setFileErrorMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Thread | null>(null);
  const [agentData] = useAtom(agentReadWriteAtom);
  const [receiverId, setRecieverId] = useState<string>('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [showThreads, setShowThreads] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // Added state variable
  const [propertyData, setPropertyData] = useState<any>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  // Robust field resolution helpers (replicated from chat-box.tsx for standalone use)
  const pickFirstString = (...values: any[]): string => {
    for (const val of values) {
      if (typeof val === 'string' && val.trim()) return val.trim();
      if (typeof val === 'number') return String(val);
    }
    return '';
  };

  const normalizeIsoTimestamp = (value?: string): string => {
    if (!value) return '';
    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) return '';
    // Reject Epoch (0) or very near it (Jan 1, 1970) as it's usually a placeholder
    if (timestamp.getTime() < 100000) return '';
    return timestamp.toISOString();
  };

  const resolveMessageId = (message: any): string =>
    pickFirstString(
      message?.id,
      message?.messageId,
      message?.message_id,
      message?._id,
      message?.data?.id,
      message?.data?.messageId,
      message?.payload?.id,
    );

  const resolveMessageCreatedAt = (message: any): string =>
    normalizeIsoTimestamp(
      pickFirstString(
        message?.createdAt,
        message?.created_at,
        message?.timestamp,
        message?.date,
        message?.dateCreated,
        message?.date_created,
        message?.data?.createdAt,
        message?.payload?.createdAt,
      ),
    );

  const mergeUniqueMessages = (newMessages: any[], existingMessages: any[]) => {
    const deduped = new Map<string, Message>();

    // Process existing messages first
    existingMessages.forEach(msg => {
      const id = resolveMessageId(msg) || (msg as any).id;
      if (id) deduped.set(String(id), msg);
    });

    // Merge new messages
    newMessages.forEach(raw => {
      const id = resolveMessageId(raw);
      const createdAt = resolveMessageCreatedAt(raw);
      const msg: Message = {
        ...raw,
        id: id || raw.id || `temp-${Date.now()}-${Math.random()}`,
        createdAt: createdAt || raw.createdAt || new Date().toISOString(),
        message: raw.message || raw.content || raw.text || '',
      };
      if (id) {
        deduped.set(String(id), msg);
      } else {
        // If no ID, use a composite key to at least try to deduplicate
        const compositeKey = `${createdAt}-${msg.message.substring(0, 20)}`;
        if (!deduped.has(compositeKey)) deduped.set(compositeKey, msg);
      }
    });

    return Array.from(deduped.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  };
  const [selectedThread, setSelectedThread] = useState('');
  const [conversationLoading, setConversationLoading] = useState(false);
  const debounce = useDebounce();
  const imageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const allowedFileTypes = [...imageTypes, ...videoTypes, 'application/pdf'];
  const [userDetails, setUserDetails] = useState<{
    imageUrl?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);
  const { getAllConversationMessagesMutation, addParticipant, searchMessages, getAgentTiersForThreadMutation } =
    useAgentConversationApi();
  const userData = agentData.user;
  const scrollContainerRef = useRef(null);
  const PROPERTY_DETAIL_SEARCH_AI_URL =
    process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ||
    'https://demo-ai.snaphomz.com';
  const [email, setEmail] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [firstTime, setFirstTime] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef(null);
  const [showNewMessageTag, setShowNewMessageTag] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [allMediaFiles, setAllMediaFiles] = useState<
    { type?: string; url?: string; name?: string }[]
  >([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [buyerFaqQuestions, setBuyerFaqQuestions] = useState<
    BuyerQuestionInterface[]
  >([]);
  const [sellerFaqQuestions, setSellerFaqQuestions] = useState<
    BuyerQuestionInterface[]
  >([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread>();
  const [tierSelected, setTierSelected] = useState(false);
  const [agentTiers, setAgentTiers] = useState<any[]>([]);
  const [isLoadingAgentTiers, setIsLoadingAgentTiers] = useState(false);
  const fetchedTierKeyRef = useRef<string>('');
  const [isChecked, setIsChecked] = useState(
    currentThread?.visibleForOthersUsers,
  );
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const endMessageRef = useRef<HTMLDivElement>(null);
  const [currentUser] = useAtom(agentReadWriteAtom);
  const { getAllFaqsByUserMutation } = useFAQApi(() => {
    setIsModalOpen(false);
  });
  const imageMimeType = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/heic',
    'image/heif',
  ];
  const videoMimeType = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/x-matroska',
    'video/3gpp',
    'video/mp2t',
    'video/x-m4v',
  ];
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const { uploadNewFile } = usePropertyServiceAPI();
  const { createRepoWithUploadedFile } = useRepoManagementApi();
  const [currentProperty] = useAtom(claimPropertyAtom);
  const toggleAnswer = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };
  const toggleUploadMenu = () => {
    setShowUploadMenu((prev) => !prev);
  };
  const handleEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.emoji);
  };

  const handleselectTier = (tier: any) => {
    if (!currentThread?.id || !socket) return;

    console.log("[Conversation Negotiation] Selecting tier:", tier);
    const messageContent = `Buyer selected ${tier.name} (${tier.commission}%)`;
    const newMessage = {
      id: uuidv4(),
      threadId: currentThread.id,
      message: messageContent,
      isRead: false,
      senderId: userData?.id,
      receiverId: receiverId,
      createdAt: new Date().toISOString(),
      messageType: 'notification',
    } as Message;

    // Update LOCAL status (optimistic UI)
    setCurrentThread((prev: any) => ({
      ...prev,
      status: "OFFER_SENT"
    }));

    // Mark tier as selected to unlock messages
    setTierSelected(true);

    // Emit message and status update
    if (socket && socket.sendMessage) {
      socket.sendMessage({
        threadId: currentThread.id,
        message: messageContent,
        userId: userData?.id || "",
        messageType: 'notification'
      });
    }

    // Custom event for backend to update status
    socket.emit("update_negotiation_status", {
      threadId: currentThread.id,
      status: "OFFER_SENT"
    });

    // Determine agent email (other party)
    let agentEmail = '';
    if (userData?.id === currentThread?.buyerAgent?.id) {
      agentEmail = currentThread?.sellerAgent?.email || '';
    } else {
      agentEmail = currentThread?.buyerAgent?.email || '';
    }

    // Send email notification to agent about tier selection
    if (agentEmail) {
      const buyerName = userData?.firstName || 'Buyer';
      sendNegotiationUpdateEmail(
        agentEmail,
        buyerName,
        currentThread?.propertyAddress || 'Property',
        tier.name,
        tier.commission,
        socket
      ).catch(err => {
        console.warn('[Conversation] Email notification failed:', err);
        // Don't interrupt the flow if email fails
      });
    }

    success({ message: `Offer for ${tier.name} sent to agent.` });
  };

  const handleThreadSelection = (thread: Thread) => {
    setCurrentThread(thread);
    if (socket) {
      socket.emit('mark_as_read', { threadId: thread?.id });
    }
    if (selectedThread === thread?.id) {
      return null;
    }

    // Leave previous room if exists
    if (selectedThread && socket && socket.leaveRoom) {
      socket.leaveRoom(selectedThread);
    }

    setIsDetails(false);
    setSelectedThread(thread?.id);
    // setSelectedThread("")
    setShowThreads(false);
    setShowChat(true);
    setPage(1);
    if (userData?.id === thread?.buyerAgent?.id) {
      setRecieverId(thread?.sellerAgent?.id || '');
      setUserDetails(thread?.sellerAgent ?? null);
    } else {
      setUserDetails(thread?.buyerAgent ?? null);
      setRecieverId(thread?.buyerAgent?.id || '');
    }
    getAllConversationThreads(thread?.id);
    getPropertyDetails(thread.propertyId, thread?.listingId);
    setState((prev: any) => ({
      ...prev,
      selectedChannel: {
        id: thread?.id,
        propertyName: thread.propertyName,
      },
    }));

    // Join the room for this thread
    if (socket && thread?.id && userData?.id) {
      console.log('[conversation] Joining room for thread:', thread.id);

      // First, try to create or join conversation
      socket.createOrJoinRoom({
        threadId: thread.id,
        propertyId: thread.propertyId,
        userId: userData.id,
        userType: 'buyer',
        propertyOwnerId: thread.propertyOwnerId,
        buyerAgentId: thread.buyerAgent?.id,
        sellerAgentId: thread.sellerAgent?.id,
        roomId: thread.id,
        threadName: thread.threadName,
        propertyName: thread.propertyName,
        propertyAddress: thread.propertyAddress,
      });

      // Also join the room directly (joinRoom expects roomId as string)
      if (socket.joinRoom && userData?.id) {
        socket.joinRoom(thread.id);
      }
    }
  };
  const handleBackToThreads = () => {
    // Leave the room when going back to threads
    if (selectedThread && socket && socket.leaveRoom) {
      console.log('[conversation] Leaving room for thread:', selectedThread);
      socket.leaveRoom(selectedThread);
    }

    setShowThreads(true);
    setShowChat(false);
    setSelectedChannel(null);
    setSelectedThread('');
  };

  // Auto-select thread based on agentEmail or focusLatest query param
  useEffect(() => {
    if (!threads || threads.length === 0 || !selectedThread) return;

    if (focusLatest === '1' && threads.length > 0) {
      // Select the most recent thread
      const latestThread = threads[0];
      if (latestThread) {
        handleThreadSelection(latestThread);
      }
    } else if (agentEmail && threads.length > 0) {
      // Find agent thread by matching email in agent details or participants
      // Note: Threads typically contain buyerAgent and sellerAgent info
      const matchedThread = threads.find((thread: any) => {
        // Check if agentEmail matches any agent in the thread
        const sellerAgentMatch = thread?.sellerAgent?.email?.toLowerCase() === agentEmail?.toLowerCase();
        const buyerAgentMatch = thread?.buyerAgent?.email?.toLowerCase() === agentEmail?.toLowerCase();
        return sellerAgentMatch || buyerAgentMatch;
      });

      if (matchedThread) {
        handleThreadSelection(matchedThread);
      } else if (threads.length > 0) {
        // Fallback to first thread if exact match not found
        handleThreadSelection(threads[0]);
      }
    }
  }, [threads, agentEmail, focusLatest, selectedThread]);

  // Reset tierSelected when thread changes
  useEffect(() => {
    if (selectedThread !== currentThread?.id) {
      setTierSelected(false);
    }
  }, [selectedThread, currentThread?.id]);

  // Fetch agent tiers when thread is NEGOTIATION_PENDING
  useEffect(() => {
    const activeThreadId = currentThread?.id || '';
    const currentStatus = currentThread?.status || '';
    const fetchKey = `${activeThreadId}:${currentStatus}`;

    if (!currentThread?.id || currentThread?.status !== 'NEGOTIATION_PENDING') {
      fetchedTierKeyRef.current = '';
      setAgentTiers((prev) => (prev.length > 0 ? [] : prev));
      setIsLoadingAgentTiers((prev) => (prev ? false : prev));
      return;
    }

    if (fetchedTierKeyRef.current === fetchKey) {
      return;
    }

    fetchedTierKeyRef.current = fetchKey;
    let isActive = true;
    setIsLoadingAgentTiers(true);

    getAgentTiersForThreadMutation.mutate(currentThread.id, {
      onSuccess: (payload: any) => {
        if (!isActive) return;
        setAgentTiers(normalizeAgentTiersPayload(payload?.tiers));
        setIsLoadingAgentTiers(false);
      },
      onError: (mutationError: any) => {
        if (!isActive) return;
        fetchedTierKeyRef.current = '';
        console.error('[conversation] Failed to load agent tiers:', mutationError);
        setAgentTiers((prev) => (prev.length > 0 ? [] : prev));
        setIsLoadingAgentTiers((prev) => (prev ? false : prev));
      },
    });

    return () => {
      isActive = false;
    };
  }, [currentThread?.id, currentThread?.status, getAgentTiersForThreadMutation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const typing = useCallback(
    debounce((id) => {
      if (socket) {
        socket.emit('typing', {
          user: 'username',
          typing: false,
          recipient: id,
        });
      }
    }, 2000),
    [],
  );
  const getAllConversationThreads = async (threadId: string) => {
    try {
      setConversationLoading(true);
      setAllMessages([]);
      getAllConversationMessagesMutation.mutate(threadId, {
        onSuccess: (data) => {
          const rawMessages = data?.data?.conversationsByThread || [];
          setAllMessages((prev) => mergeUniqueMessages(rawMessages, []));
          setConversationLoading(false);
        },
        onError: (error) => {
          console.log('Error in mutation: ', error);
          setConversationLoading(false);
        },
      });
    } catch (error) {
      console.log('error : ', error);
      setConversationLoading(false);
    }
  };
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
      searchMessaages(value);
    }, 1000),
    [],
  );
  const handleTyping = (status: boolean) => {
    if (socket) {
      socket.emit('typing', {
        user: 'username',
        typing: status,
        recipient: receiverId,
      });
      setTimeout(() => {
        socket.emit('typing', {
          user: 'username',
          typing: false,
          recipient: receiverId,
        });
      }, 1000);
      typing(receiverId);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileErrorMsg('');
      setSelectedFile(null);

      const maxSize = 25 * 1024 * 1024;

      if (!allowedFileTypes.includes(file.type)) {
        setFileErrorMsg(
          'Invalid file type. Only JPG, PNG, MP4, WebM, OGG and PDF are allowed.',
        );
        return;
      }
      if (file.size > maxSize) {
        setFileErrorMsg('File size exceeds the 25MB limit.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const getPropertyDetails = async (id: any, listingId: any) => {
    try {
      setMessageLoading(true);
      setPropertyData(null);
      const payload = {
        propertyId: +id,
        listingId: +listingId,
      };
      const response = await fetch(
        `${PROPERTY_DETAIL_SEARCH_AI_URL}/api/get_data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      setPropertyData(data?.data);
      setMessageLoading(false);
      setShowDetails(true);
      return data;
    } catch (error) {
      console.log('error : ', error);
    }
    setMessageLoading(false);
  };

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping) {
      handleTyping(true);
    }

    if (value.trim() === '') {
      handleTyping(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const getBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      const { key } = await uploadNewFile(
        file,
        currentUser.user?.id || '',
        currentThread?.propertyId || '',
      );
      const payload = {
        uploadedFile: {
          fileName: file?.name,
          fileSize: file?.size,
          fileUrl: key,
          fileType: file?.type,
        },
        createRepoManagementInput: {
          name: 'proof-document',
          url: '/proof-document',
          propertyId: currentThread?.propertyId,
          createdBy: userData?.id || '',
          parentFolderName: 'proof-document',
          isArchived: false,
        },
      };
      createRepoWithUploadedFile?.mutate(payload, {
        onSuccess: (data) => {
          console.log(data);
        },
        onError: (err) => {
          error({ message: err?.message || 'Upload failed' });
        },
      });
      return key;
    } catch (err: any) {
      console.error('File upload failed:', err);
      throw new Error('File upload failed');
    }
  };

  const handleSendMessage = async () => {
    try {
      // Check if in negotiation mode and tier not selected
      if (currentThread?.status === 'NEGOTIATION_PENDING' && !tierSelected) {
        error({ message: 'Please select an agent tier before sending messages.' });
        return;
      }

      if (message.trim() !== '' || selectedFile) {
        // const encryptedMessage = encryptMessage(message)
        const encryptedMessage = message;
        const newMessage = {
          id: uuidv4(),
          threadId: state?.selectedChannel.id || '',
          message: encryptedMessage,
          isRead: false,
          senderId: userData?.id,
          receiverId: receiverId,
          createdAt: new Date().toISOString(),
        } as Message;

        let fileData = null;

        if (selectedFile) {
          handleFileUpload(selectedFile);
          const base64Content = await getBase64(selectedFile);
          const fileType = selectedFile.type;
          fileData = {
            name: selectedFile.name,
            type: fileType,
            size: selectedFile.size,
            content: base64Content,
            sender: userData,
          };

          // Listen for save_file_response event
          const handleFileResponse = (response: any) => {
            if (response?.success) {
              // const message = encryptMessage(response.data.message);
              const message = response.data.message;
              socket?.emit('sendMessage', {
                ...newMessage,
                ...response?.data,
                message,
                reciepent: receiverId,
                userName: `${userData?.firstName} ${userData?.lastName}`,
              });
              setTimeout(() => {
                setAllMessages((prev) => [
                  {
                    ...newMessage,
                    ...response?.data,
                  },
                  ...prev,
                ]);
              }, 1000);
            }
            // Remove listener after handling
            socket?.off('save_file_response', handleFileResponse);
          };

          // Listen for errors
          const handleFileError = (errorData: any) => {
            console.error('[handleSendMessage] File upload error:', errorData);
            socket?.off('save_file_error', handleFileError);
          };

          // Removed save_file event - not supported by backend WebSocket handler
          // File upload should be handled via REST API first, then send file URL using sendMessage
          console.error('[conversation] File upload via WebSocket not supported. Use REST API for file uploads.');
          // socket?.on('save_file_response', handleFileResponse);
          // socket?.on('save_file_error', handleFileError);
          // socket?.emit('save_file', fileData);
        }
        if (message.trim() !== '') {
          // Use the proper sendMessage method from websocket-client
          if (socket && socket.sendMessage && selectedThread && userData?.id) {
            console.log('[conversation] Sending message via websocket:', {
              threadId: selectedThread,
              userId: userData.id,
              messageLength: message.length
            });

            socket.sendMessage({
              threadId: selectedThread,
              message: message,
              userId: userData.id,
              receiverId: receiverId,
              messageType: 'text'
            });

            // Handle response
            const handleSendMessageResponse = (response: any) => {
              console.log('[conversation] sendMessage_response:', response);
              if (response.status === 'success') {
                // Message sent successfully, it will be broadcasted via newMessage event
                setMessage('');
              } else {
                error({ message: response.message || 'Failed to send message' });
              }
              socket?.off('sendMessage_response', handleSendMessageResponse);
            };

            socket.on('sendMessage_response', handleSendMessageResponse);

            // Add message to local state for immediate UI update (will be updated via newMessage event)
            setAllMessages((prev) => [{ ...newMessage, message }, ...prev]);
            setMessage('');
          } else {
            // Fallback to old method if websocket methods not available
            socket?.emit('sendMessage', {
              ...newMessage,
              messageType: 'text',
              fileType: 'text',
              reciepent: receiverId,
              userName: `${userData?.firstName} ${userData?.lastName}`,
            });
            setAllMessages((prev) => [{ ...newMessage, message }, ...prev]);
            setMessage('');
          }
        }
        // if (messagesEndRef.current) {
        //   messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        // }

        setSelectedFile(null);
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setTimeout(() => {
      setFirstTime(false);
      if (messagesEndRef.current) {
        (messagesEndRef.current as HTMLElement | null)?.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }, 100);
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  };

  useEffect(() => {
    // Sync the state with currentThread when it changes.
    setIsChecked(currentThread?.visibleForOthersUsers);
  }, [currentThread]);

  const handleTrheadsName = (user: any) => {
    const str1 =
      'Byuer (' +
      user?.buyerAgent.firstName +
      ' ' +
      user?.buyerAgent.lastName +
      ')';
    const str2 =
      'Seller (' +
      user?.sellerAgent.firstName +
      ' ' +
      user?.sellerAgent.lastName +
      ')';
    return (
      <>
        <h3 className='truncate text-sm font-semibold sm:text-base'>{str1}</h3>
        <h3 className='truncate text-sm font-semibold sm:text-base'>{str2}</h3>
      </>
    );
  };

  const getAllFaqData = () => {
    getAllFaqsByUserMutation.mutate(
      { userId: currentThread?.propertyOwnerId, agentType: 'BUYER_AGENT' },
      {
        onSuccess: (response: any) => {
          setBuyerFaqQuestions(response);
        },
        onError: (err) => {
          console.log('Error : ', err);
        },
      },
    );
  };

  const getAllSeelerFaqData = () => {
    getAllFaqsByUserMutation.mutate(
      {
        userId: '586a1ef1-86da-426d-8c67-50f3bd9bc51a',
        agentType: 'SELLER_AGENT',
      },
      {
        onSuccess: (response: any) => {
          setSellerFaqQuestions(response);
        },
        onError: (err) => {
          console.log('Error : ', err);
        },
      },
    );
  };

  const searchMessaages = (message: string) => {
    console.log('Selected Thread : ', currentThread);

    searchMessages.mutate(
      {
        threadId: currentUser?.user?.id ?? '',
        searchText: message,
      },
      {
        onSuccess: (response: any) => {
          console.log('Response : ', response);
        },
      },
    );
  };

  useEffect(() => {
    if (socket) {
      socket?.on('thread_marked_as_read', (data: any) => {
        if (selectedThread === data?.threadId) {
          // setAllMessages(allMessages);
          const updatedMessages = allMessages.map((msg) =>
            msg.isRead ? msg : { ...msg, isRead: true },
          );
          setAllMessages(updatedMessages);
        }
      });
      const handleIncomingMessage = (messageData: any, source: string) => {
        console.log(`[conversation] Received ${source}:`, messageData);
        const incomingThreadId = String(messageData.threadId || messageData.thread_id || messageData.channelId || messageData.conversationId || messageData.conversation_id || '').trim();
        const currentSel = String(selectedThread || '').trim();

        // Only add message if it's for the current thread
        if (incomingThreadId && currentSel && incomingThreadId === currentSel) {
          setShowNewMessageTag(true);
          const incoming: Message = {
            ...messageData,
            threadId: incomingThreadId,
            message: messageData.message || messageData.content || messageData.text,
            createdAt: messageData.createdAt || messageData.created_at || messageData.timestamp || messageData.date,
          };
          setAllMessages((prevMessages) => {
            const incomingId = resolveMessageId(messageData) || `temp-${Date.now()}`;
            const rawDate = resolveMessageCreatedAt(messageData);

            const normalizedIncoming: Message = {
              ...incoming,
              id: incomingId,
              message: incoming.message || (messageData as any).content || (messageData as any).text || "",
              createdAt: rawDate || new Date().toISOString()
            };

            // Deduplicate: don't add if a message with the same ID already exists
            if (incomingId && prevMessages.some((m) => String(m.id || "").trim() === incomingId)) {
              console.log("[conversation] Duplicate message ignored:", incomingId);
              return prevMessages;
            }
            return [normalizedIncoming, ...prevMessages];
          });
        }
      };

      const handleNewMessage = (messageData: any) => handleIncomingMessage(messageData, 'newMessage');
      const handleRecievedMessage = (messageData: any) => handleIncomingMessage(messageData, 'recievedMessage');

      socket.on('newMessage', handleNewMessage);
      socket.on('recievedMessage', handleRecievedMessage);

      socket.on('typingStatus', (typing: boolean) => {
        setIsTyping(typing);
      });

      // Handle websocket response events
      socket.on('createOrJoinConversation_response', (response: any) => {
        console.log('[conversation] createOrJoinConversation_response:', response);
      });

      socket.on('joinRoom_response', (response: any) => {
        console.log('[conversation] joinRoom_response:', response);
      });

      const interval = setInterval(saveAllMessages, 5000);
      return () => {
        socket.off('recievedMessage', handleRecievedMessage);
        socket.off('newMessage', handleNewMessage);
        socket.off('createOrJoinConversation_response');
        socket.off('joinRoom_response');
        clearInterval(interval);
        saveAllMessages();
      };
    }
    return () => {
      // Cleanup when component unmounts or thread changes
    };
  }, [socket, selectedThread]);

  // NOTE: state.newMessage handler removed to avoid duplicate messages.
  // Messages are directly added by the socket.on('newMessage') listener above.
  // The SocketContext still updates state.newMessage, but this component ignores it.

  useEffect(() => {
    if (state?.isReadThreadId === selectedThread) {
      const hasUnread = allMessages.some((msg) => !msg.isRead);
      if (!hasUnread) return;

      const updatedMessages = allMessages.map((msg) =>
        msg.isRead ? msg : { ...msg, isRead: true },
      );

      setAllMessages(updatedMessages);
    }
  }, [state?.isReadThreadId, selectedThread, allMessages]);

  const lightColors = [
    'bg-blue-200',
    'bg-green-200',
    'bg-red-200',
    'bg-yellow-200',
    'bg-purple-200',
  ];

  const getStaticColor = (name: string) => {
    const index = name?.charCodeAt(0) % lightColors.length;
    return lightColors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  };
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessages]);

  const saveAllMessages = () => {
    if (socket) {
      // Removed save_messages event - not supported by backend WebSocket handler
      // Message saving should be handled via REST API, not WebSocket
      console.log('[conversation] Message saving removed - use REST API instead');
      // const handleSaveMessagesResponse = () => {
      //   console.log('Save message event called');
      //   socket?.off('save_messages_response', handleSaveMessagesResponse);
      // };

      // socket.on('save_messages_response', handleSaveMessagesResponse);
      // socket.emit('save_messages');
    }
  };
  setTimeout(() => {
    if (messagesEndRef.current && firstTime) {
      setFirstTime(false);
      if (messagesEndRef.current) {
        (messagesEndRef.current as HTMLElement | null)?.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }
  }, 100);

  const extractMediaFiles = useCallback(() => {
    const mediaFiles = allMessages
      .filter(
        (message) =>
          message.fileType &&
          (imageTypes.includes(message.fileType) ||
            message.fileType.startsWith('video/')) &&
          message.message,
      )
      .map((message) => ({
        type: message.fileType,
        url: message.message,
        name: message.fileType ? message.fileType.split('/')[1] : undefined,
      }));

    setAllMediaFiles(
      mediaFiles as { type?: string; url?: string; name?: string }[],
    );
  }, [allMessages]);

  useEffect(() => {
    if (allMessages.length > 0) {
      extractMediaFiles();
    }
  }, [allMessages, extractMediaFiles]);

  const openMediaPreview = useCallback(
    (fileUrl: string, fileType: string) => {
      if (fileUrl) {
        setMediaPreview({
          type: fileType || '',
          url: fileUrl,
          name: fileType.split('/')[1] || 'media',
          loading: true,
        });

        if (fileType && imageMimeType.includes(fileType)) {
          if (fileUrl.startsWith('data:')) {
            setZoomLevel(1);
            setMediaPreview({
              type: fileType,
              url: fileUrl,
              name: fileType.split('/')[1] || 'media',
              loaded: true,
            });
            return;
          }

          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.src = fileUrl;

          img.onload = () => {
            setZoomLevel(1);
            setMediaPreview({
              type: fileType,
              url: fileUrl,
              name: fileType.split('/')[1] || 'media',
              loaded: true,
            });
          };

          img.onerror = (e) => {
            console.error('Failed to load image:', e);

            const imgFallback = document.createElement('img');
            imgFallback.src = fileUrl;

            imgFallback.onload = () => {
              setZoomLevel(1);
              setMediaPreview({
                type: fileType,
                url: fileUrl,
                name: fileType.split('/')[1] || 'media',
                loaded: true,
              });
            };

            imgFallback.onerror = () => {
              console.error('All loading attempts failed for image');
              setMediaPreview({
                type: fileType,
                url: '/placeholder.jpg',
                name: fileType.split('/')[1] || 'media',
                loaded: false,
                error: true,
              });
            };
          };
        } else {
          // For non-images, just set directly
          setZoomLevel(1);
          setMediaPreview({
            type: fileType || '',
            url: fileUrl,
            name: fileType.split('/')[1] || 'media',
            loading: false,
          });
        }

        // Find index of the current media in the media files array
        const index = allMediaFiles.findIndex(
          (mediaFile) => mediaFile.url === fileUrl,
        );

        if (index !== -1) {
          setCurrentMediaIndex(index);
        }
      }
    },
    [allMediaFiles, imageMimeType],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mediaPreview) return;

      switch (e.key) {
        case 'Escape':
          closeMediaPreview();
          break;
        case 'ArrowRight':
          if (currentMediaIndex < allMediaFiles.length - 1) {
            goToNextMedia();
          }
          break;
        case 'ArrowLeft':
          if (currentMediaIndex > 0) {
            goToPrevMedia();
          }
          break;
        case '+':
        case '=':
          handleZoom(true);
          break;
        case '-':
          handleZoom(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaPreview, currentMediaIndex, allMediaFiles.length]);

  const goToNextMedia = () => {
    if (currentMediaIndex < allMediaFiles.length - 1) {
      const nextIndex = currentMediaIndex + 1;
      setCurrentMediaIndex(nextIndex);
      setZoomLevel(1);
      setMediaPreview({
        type: allMediaFiles[nextIndex].type || '',
        url: allMediaFiles[nextIndex].url || '',
        name: allMediaFiles[nextIndex].name,
      });
    }
  };

  const goToPrevMedia = () => {
    if (currentMediaIndex > 0) {
      const prevIndex = currentMediaIndex - 1;
      setCurrentMediaIndex(prevIndex);
      setZoomLevel(1);
      setMediaPreview({
        type: allMediaFiles[prevIndex].type || '',
        url: allMediaFiles[prevIndex].url || '',
        name: allMediaFiles[prevIndex].name,
      });
    }
  };

  const handleInvite = () => {
    const data = {
      threadId: selectedThread,
      email: email,
    };
    addParticipant.mutateAsync(data, {
      onSuccess: (response: any) => {
        setInviteOpen(false);
        if (response?.success) {
          success({ message: response?.message });
        } else {
          error({ message: response?.message });
        }
      },
      onError: (err: any) => {
        console.log('error : ', err);
        // error({message: error})
        // error({ message: err });
      },
    });
  };
  const handleZoom = (zoomIn: boolean) => {
    if (zoomIn) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 3));
    } else {
      setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
    }
  };

  const closeMediaPreview = () => {
    setMediaPreview(null);
    setZoomLevel(1);
  };

  const groupedMessages: { [date: string]: Message[] } = allMessages.reduce(
    (acc: { [date: string]: Message[] }, message) => {
      const rawDate = resolveMessageCreatedAt(message);
      // If date is invalid, don't default to Jan 1. Use 'Unknown' or filter it.
      // Filtering duplicates with invalid dates out of the grouping keeps the UI clean.
      if (!rawDate) return acc;

      const dateKey = format(new Date(rawDate), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(message);
      return acc;
    },
    {},
  );

  function isToday(date: Date): boolean {
    const today = new Date();
    return isSameDay(date, today);
  }

  function isYesterday(date: Date): boolean {
    const yesterday = subDays(new Date(), 1);
    return isSameDay(date, yesterday);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUploadMenu &&
        uploadMenuRef.current &&
        !uploadMenuRef.current.contains(event.target as Node)
      ) {
        setShowUploadMenu(false);
      }
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

  useEffect(() => {
    return () => {
      setState(initialState);
    };
  }, []);

  useEffect(() => {
    endMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupedMessages]);

  useEffect(() => {
    // if (currentThread?.propertyOwnerId) {
    //   getAllFaqData()
    //   getAllSeelerFaqData()
    // }
    if (props?.threadData) {
      handleThreadSelection(props?.threadData);
    }
  }, [props?.threadData, currentThread]);

  return (
    <div className='mt-36 max-w-full overflow-hidden'>
      <header className='flex items-center justify-between border-b bg-white px-2 py-2 shadow-sm sm:px-4'>
        <div
          className='flex cursor-pointer items-center gap-2 sm:gap-4'
          onClick={() => router.back()}
        >
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 sm:h-10 sm:w-10'
          >
            <ChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' />
          </Button>
          <span className='text-sm font-semibold sm:text-base'>Back</span>
        </div>
        <div className='flex w-full max-w-[65%] items-center justify-center sm:max-w-xl'>
          <div className='bg-white-100 relative flex h-8 w-full rounded-full shadow sm:h-10'>
            <Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 sm:left-4 sm:h-5 sm:w-5' />
            <Input
              placeholder='Search'
              className='w-full appearance-none border-0 bg-transparent pl-8 pr-2 text-xs text-gray-700 placeholder-gray-500 focus:outline-none sm:pl-12 sm:pr-4 sm:text-sm'
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
            />
          </div>
        </div>
        <Button variant='ghost' size='icon' className='h-8 w-8 sm:h-10 sm:w-10'>
          <Help className='h-4 w-4 sm:h-5 sm:w-5' />
        </Button>
      </header>
      <section>
        <div className='flex h-[calc(100vh-9rem)] max-h-[calc(100vh-9rem)] flex-col border-l bg-gray-100 md:flex-row'>
          {/* Threads Section */}
          <div
            className={`w-full border-r bg-white md:w-96 ${showThreads ? 'block' : 'hidden md:block'} overflow-hidden`}
          >
            <div className='flex items-center justify-between border-b p-3 sm:p-4'>
              <h2 className='text-sm font-semibold sm:text-base'>Messages</h2>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 sm:h-10 sm:w-10'
              >
                <MessageCircle className='h-5 w-5 text-gray-600 sm:h-6 sm:w-6' />
              </Button>
            </div>

            <div className='flex flex-col items-center justify-center gap-2 border-b p-2 sm:flex-row sm:gap-4 sm:p-4'>
              <div className='flex w-full gap-2 rounded-full bg-gray-100 p-1 shadow-sm sm:w-60'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => {
                    setIsRead(false);
                    setActiveButton('all');
                  }}
                  className={`h-8 w-full rounded-full px-2 py-1 text-xs text-gray-600 sm:h-10 sm:px-4 sm:py-2 sm:text-sm ${activeButton === 'all'
                    ? 'bg-white text-gray-800 shadow'
                    : ''
                    }`}
                >
                  All
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => {
                    setIsRead(true);
                    setActiveButton('unread');
                  }}
                  className={`h-8 w-full rounded-full px-2 py-1 text-xs text-gray-600 sm:h-10 sm:px-4 sm:py-2 sm:text-sm ${activeButton === 'unread'
                    ? 'bg-white text-gray-800 shadow'
                    : ''
                    }`}
                >
                  Unread
                </Button>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setInviteOpen(true)}
                className='h-8 w-full rounded-full px-3 py-1 text-xs sm:h-10 sm:w-auto sm:px-4 sm:py-2 sm:text-sm'
              >
                Invite an agent &nbsp; <Plus size={14} className='sm:size-4' />
              </Button>
            </div>
            {props?.loading ? (
              <div className='flex h-32 items-center justify-center'>
                <svg
                  className='h-6 w-6 animate-spin text-orange-500'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v8z'
                  ></path>
                </svg>
              </div>
            ) : (
              <ScrollArea className='mb-12 h-[calc(96vh-15rem)] w-full gap-2 overflow-auto bg-white p-2 sm:h-[calc(96vh-16rem)] sm:p-4'>
                {threads?.length ? (
                  threads.some(
                    (thread: Thread) => thread.visibleForOthersUsers,
                  ) ? (
                    threads?.map((thread: Thread) => {
                      return (
                        thread.visibleForOthersUsers && (
                          <div
                            key={thread.id}
                            className={`relative mt-2 flex w-full items-center gap-2 rounded-md p-2 sm:gap-3 sm:p-4  ${currentThread?.id === thread?.id ? 'bg-[#16161d] text-white' : 'bg-gray-100'}  cursor-pointer transition-colors hover:shadow-md`}
                            onClick={() => handleThreadSelection(thread)}
                          >
                            {/* Last Seen Timestamp (Top Right Corner) */}
                            <span
                              className={`absolute right-1 top-1 text-[8px] sm:right-3 sm:top-2 sm:text-xs ${currentThread?.id === thread?.id ? ' text-white' : 'text-black'}  `}
                            >
                              20 mins ago
                            </span>
                            <br />
                            {/* User Avatar (Image or Initials) */}
                            {thread?.image ? (
                              <Image
                                src={thread?.image || '/placeholder.svg'}
                                alt='User Avatar'
                                width={50}
                                height={50}
                                priority
                                unoptimized
                                className='h-[30px] w-[30px] flex-shrink-0 rounded-full object-cover sm:h-[40px] sm:w-[40px] md:h-[50px] md:w-[50px]'
                              />
                            ) : (
                              <div
                                className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-gray-700 text-white sm:h-[40px] sm:w-[40px] sm:text-sm md:h-[50px] md:w-[50px]`}
                              >
                                {getInitials(thread.propertyName || '')}
                              </div>
                            )}

                            {/* Thread Details */}
                            <div className='min-w-0 flex-1'>
                              {/* Name Section */}
                              <p className='color-white truncate text-xs font-semibold sm:text-sm md:text-base'>
                                {thread.buyerAgent?.firstName}
                                {thread.sellerAgent &&
                                  ` & ${thread.sellerAgent?.firstName}`}
                              </p>

                              <p className='w-[120px] truncate text-[10px] text-gray-500 sm:w-[160px] sm:text-xs md:w-[200px]'>
                                {/* {decryptMessage(thread?.message || "")} */}
                                {thread?.message || ''}
                              </p>

                              {/* Capsules Section */}
                              <div className='mt-1 flex flex-wrap items-center gap-1 text-[8px] sm:mt-2 sm:gap-2 sm:text-xs'>
                                {/* Property Capsule */}
                                <span className='flex h-4 items-center gap-1 rounded-full border border-orange-400 bg-white px-1 py-0.5 text-[8px] text-gray-700 sm:h-6 sm:px-3 sm:py-1 sm:text-[10px] md:text-xs'>
                                  <FaHome className='text-[8px] text-orange-600 sm:text-xs' />
                                  <span className='max-w-[60px] truncate sm:max-w-[100px]'>
                                    {thread?.propertyName}
                                  </span>
                                </span>

                                {/* Location Capsule */}
                                <span className='flex h-4 items-center gap-1  rounded-full bg-[#FAF9F5] bg-orange-100 px-1 py-0.5 text-[8px] text-gray-600 sm:h-6 sm:px-3 sm:py-1 sm:text-[10px] md:text-xs'>
                                  <FaMapMarkerAlt className='text-[8px]  text-orange-600 sm:text-xs' />
                                  <span className='max-w-[60px] truncate sm:max-w-[100px]'>
                                    {thread?.propertyAddress}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Unread Count Badge */}
                            {(thread.unreadCount || 0) > 0 && (
                              <Badge className='me-2 flex h-4 min-w-4 items-center justify-center bg-white px-1 py-0.5 text-[8px] text-black sm:me-6 sm:h-6 sm:min-w-6 sm:px-2 sm:py-1 sm:text-xs md:text-sm'>
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>
                        )
                      );
                    })
                  ) : (
                    <div className='mt-6 text-center text-gray-400'>
                      <p className='text-sm font-semibold sm:text-lg'>
                        Agents are not allowed to have conversations
                      </p>
                    </div>
                  )
                ) : (
                  <div className='mt-6 text-center text-gray-400'>
                    <p className='text-sm font-semibold sm:text-lg'>
                      No threads available
                    </p>
                    <p className='text-xs sm:text-sm'>
                      It seems like you have not started any conversations yet.
                    </p>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          {/* Chat Section */}
          <div
            className={`flex flex-1 flex-col bg-[#FAF9F5]  ${showChat ? 'block' : 'hidden md:block'} max-h-full overflow-hidden`}
          >
            {/* Mobile Header for Chat */}
            <header className='mt-4 flex items-center justify-between border-b px-3 py-2 md:hidden'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handleBackToThreads}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <span className='max-w-[200px] truncate text-sm font-semibold'>
                  {state?.selectedChannel?.propertyName || ''}
                </span>
              </div>
            </header>

            <div className='mt-2 flex flex-1 bg-gray-50'>
              {state.selectedChannel.id ? (
                <div className=' flex max-h-full flex-1 flex-col overflow-hidden'>
                  {!messageLoading ? (
                    <>
                      <div className='flex  flex-wrap items-center justify-between gap-2 border-b p-2 sm:flex-nowrap sm:p-4'>
                        <div className='flex items-center gap-2 sm:gap-3'>
                          {userDetails?.imageUrl ? (
                            <Image
                              src={userDetails.imageUrl || '/placeholder.svg'}
                              alt='User Avatar'
                              width={40}
                              height={40}
                              className='h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10'
                              priority
                              unoptimized
                            />
                          ) : (
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm'>
                              {getInitials(userDetails?.firstName || '')}
                            </div>
                          )}

                          <div>
                            <div className='flex items-center gap-2'>
                              <span className='max-w-[100px] truncate text-xs font-semibold sm:max-w-full sm:text-sm'>
                                {userDetails?.firstName} {userDetails?.lastName}
                              </span>
                              <span className='text-[10px] text-green-500 sm:text-xs'>
                                Online
                              </span>
                            </div>
                            {isTyping && (
                              <span className='text-xs text-green-600 sm:text-sm'>
                                Typing...
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3'>
                          <div className='flex items-center gap-2 sm:gap-3'>
                            <Image
                              src={
                                propertyData?.media?.primaryListingImageUrl ||
                                '/placeholder.jpg'
                              }
                              alt='Property'
                              width={48}
                              height={32}
                              className='h-8 w-12 rounded-lg object-cover sm:h-10 sm:w-16'
                              priority
                              unoptimized
                            />
                            <div className='hidden sm:block'>
                              <span className='inline-block max-w-[80px] truncate text-xs sm:max-w-[120px] sm:text-sm'>
                                {propertyData?.courtesyOf}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='relative bg-gray-50'>
                        <ScrollArea
                          ref={scrollContainerRef}
                          className='me-2 ms-2 h-[calc(96vh-16rem)] overflow-auto sm:me-5 sm:ms-5 sm:h-[calc(96vh-18rem)]'
                        >
                          <div className='me-4 space-y-2 bg-[##F7F2EB] py-2 sm:space-y-4'>

                            {/* No More Messages Indicator */}
                            {!hasMoreMessages && allMessages.length > 0 && (
                              <div className='py-2 text-center'>
                                <p className='text-xs text-gray-500 sm:text-sm'>
                                  No more messages to load
                                </p>
                              </div>
                            )}

                            {/* Messages */}
                            {Object.entries(groupedMessages).length > 0 ? (
                              [...allMessages]
                                .reverse()
                                .map((message, index, arr) => {
                                  const isSender =
                                    message.senderId === userData?.id;
                                  const isLastMessage =
                                    index === allMessages.length - 1;
                                  const messageDate = new Date(
                                    message.createdAt ?? 0,
                                  );
                                  const showDateHeader =
                                    index === 0 ||
                                    format(
                                      new Date(arr[index - 1].createdAt ?? 0),
                                      'yyyy-MM-dd',
                                    ) !== format(messageDate, 'yyyy-MM-dd');

                                  const displayDate = isToday(messageDate)
                                    ? 'Today'
                                    : isYesterday(messageDate)
                                      ? 'Yesterday'
                                      : format(messageDate, 'dd MMM yyyy');

                                  return (
                                    <div key={message.id || index}>
                                      {/* Day Separator */}
                                      {showDateHeader && (
                                        <div className='py-2 text-center'>
                                          <span className='rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow sm:text-sm'>
                                            {displayDate}
                                          </span>
                                        </div>
                                      )}

                                      {/* Message Bubble */}
                                      <div
                                        className={`mt-2 flex items-start gap-2 sm:mt-4 sm:gap-3 ${isSender ? 'justify-end' : ''
                                          }`}
                                        ref={
                                          isLastMessage ? messagesEndRef : null
                                        }
                                      >
                                        {/* Avatar */}
                                        {!isSender && (
                                          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm'>
                                            {/* {getInitials(
                                              userData?.firstName || '',
                                            )} */}
                                            {message.senderId ===
                                              currentThread?.buyerAgent?.id
                                              ? getInitials(
                                                currentThread?.buyerAgent
                                                  ?.firstName || '',
                                              )
                                              : getInitials(
                                                currentThread?.sellerAgent
                                                  ?.firstName || '',
                                              )}
                                          </div>
                                        )}

                                        <div
                                          className={`relative max-w-[75%] rounded-2xl bg-black p-2 text-xs font-medium text-white shadow sm:max-w-[80%] sm:text-sm `}
                                        >
                                          {/* Message content */}
                                          {message.messageType !== 'file' && (
                                            <p className='break-words'>
                                              {message.message}
                                            </p>
                                          )}

                                          {/* File message */}
                                          {message.messageType === 'file' && (
                                            <div className='mt-1 flex items-center gap-2 rounded-lg sm:gap-3'>
                                              {message.fileType &&
                                                imageMimeType.includes(
                                                  message.fileType,
                                                ) ? (
                                                <div
                                                  className='group relative cursor-pointer'
                                                  onClick={() =>
                                                    openMediaPreview(
                                                      message.message,
                                                      message.fileType || '',
                                                    )
                                                  }
                                                >
                                                  <Image
                                                    src={message.message || ''}
                                                    alt='Uploaded Image'
                                                    width={140}
                                                    height={140}
                                                    unoptimized
                                                    priority
                                                    className='max-w-[100px] rounded-lg transition-opacity hover:opacity-90 sm:max-w-[120px]'
                                                  />
                                                  <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 opacity-0 transition-opacity group-hover:opacity-100'>
                                                    <Maximize className='h-4 w-4 text-white' />
                                                  </div>
                                                </div>
                                              ) : message.fileType &&
                                                videoMimeType?.includes(
                                                  message.fileType,
                                                ) ? (
                                                <video
                                                  controls
                                                  className='max-w-[100px] rounded-lg sm:max-w-[120px]'
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMediaPreview(
                                                      message.message,
                                                      message.fileType || '',
                                                    );
                                                  }}
                                                >
                                                  <source
                                                    src={message.message}
                                                    type={message.fileType}
                                                  />
                                                  Your browser does not support
                                                  the video tag.
                                                </video>
                                              ) : (
                                                <div className='flex items-center gap-2 text-xs sm:text-sm'>
                                                  <FileText className='h-4 w-4 text-gray-600 sm:h-6 sm:w-6' />
                                                  <span className='max-w-[100px] truncate sm:max-w-full'>
                                                    {message.message.slice(
                                                      0,
                                                      20,
                                                    )}
                                                  </span>
                                                  <a
                                                    href={message.message}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-500 hover:underline'
                                                  >
                                                    <Eye className='h-3 w-3 text-orange-500 sm:h-4 sm:w-4' />
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Timestamp and read indicator */}
                                          <div className='mt-1 flex items-center justify-end gap-1'>
                                            <span className='text-[10px] text-gray-400 sm:text-xs'>
                                              {message.createdAt
                                                ? format(
                                                  new Date(message.createdAt),
                                                  'HH:mm',
                                                )
                                                : format(new Date(), 'HH:mm')}
                                            </span>
                                            {isSender && (
                                              <span className='inline-flex text-blue-500'>
                                                {message.isRead ? (
                                                  <CircleCheck className='h-3 w-3 rounded-lg bg-green-600 text-white sm:h-4 sm:w-4' />
                                                ) : (
                                                  <CircleCheck className='h-3 w-3 text-green-600 sm:h-4 sm:w-4' />
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Sender avatar */}
                                        {isSender && (
                                          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm'>
                                            {getInitials(
                                              userData?.firstName || '',
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                            ) : (
                              <p className='text-center text-xs text-gray-500 sm:text-sm'>
                                No messages yet.
                              </p>
                            )}

                            {selectedFile && (
                              <div className='relative mx-4 mb-3 mt-2'>
                                <div className='rounded-lg bg-gray-100 p-3 pr-10'>
                                  <div className='flex items-start'>
                                    {selectedFile.type &&
                                      imageTypes.includes(selectedFile.type) ? (
                                      <div className='mr-3'>
                                        <div className='relative h-16 w-16 overflow-hidden rounded-md bg-[#FAF9F5] sm:h-20 sm:w-20'>
                                          <img
                                            src={
                                              URL.createObjectURL(
                                                selectedFile,
                                              ) || '/placeholder.svg'
                                            }
                                            alt='Preview'
                                            className='h-full w-full object-cover'
                                          />
                                        </div>
                                      </div>
                                    ) : selectedFile.type &&
                                      selectedFile.type.startsWith('video/') ? (
                                      <div className='mr-3'>
                                        <div className='relative flex h-16 w-16 items-center justify-center rounded-md bg-[#FAF9F5] sm:h-20 sm:w-20'>
                                          <Play className='h-8 w-8 text-gray-500' />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className='mr-3'>
                                        <div className='flex h-16 w-16 items-center justify-center rounded-md bg-[#FAF9F5] sm:h-20 sm:w-20'>
                                          <FileText className='h-8 w-8 text-gray-500' />
                                        </div>
                                      </div>
                                    )}
                                    <div className='min-w-0 flex-1'>
                                      <p className='truncate text-sm font-medium'>
                                        {selectedFile.name}
                                      </p>
                                      <p className='mt-1 text-xs text-gray-500'>
                                        {(
                                          selectedFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{' '}
                                        MB
                                      </p>
                                      <p className='text-xs capitalize text-gray-500'>
                                        {selectedFile.type.split('/')[0]}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    className='absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-[#FAF9F5]'
                                    onClick={() => setSelectedFile(null)}
                                  >
                                    <X className='h-4 w-4' />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div ref={endMessageRef} />
                        </ScrollArea>

                        {/* Negotiation Card - Show when in NEGOTIATION_PENDING status */}
                        {currentThread?.status === 'NEGOTIATION_PENDING' && (
                          <div className='border-t bg-white p-3 sm:p-4'>
                            {isLoadingAgentTiers ? (
                              <p className='text-xs font-medium text-gray-600 sm:text-sm'>
                                Loading agent tier preferences...
                              </p>
                            ) : agentTiers.length > 0 ? (
                              <>
                                <p className='mb-3 text-xs font-medium text-gray-600 sm:text-sm'>
                                  Select an agent tier to proceed with negotiation:
                                </p>
                                <NegotiationCard
                                  tiers={agentTiers}
                                  status={currentThread.status}
                                  onSelectTier={handleselectTier}
                                  onNegotiate={(offer) => {
                                    const negotiationMessage = offer?.message
                                      ? `Offer sent: ${offer.message}`
                                      : "Negotiation flow initiated. You can now propose custom terms.";
                                    success({ message: negotiationMessage });
                                  }}
                                />
                              </>
                            ) : (
                              <p className='text-xs font-medium text-gray-600 sm:text-sm'>
                                Agent has not configured tier preferences yet.
                              </p>
                            )}
                          </div>
                        )}

                        {/* 
                        {showNewMessageTag && (
                          <button
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm shadow-md animate-bounce"
                            onClick={() => {
                              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                              setShowNewMessageTag(false)
                            }}
                          >
                            New Message ↓
                          </button>
                        )} */}
                      </div>
                      {/* <div className='relative border-t bg-gray-50 p-2 sm:p-4'>
                        {fileErrorMsg && (
                          <div className='absolute -top-10 left-0 right-0 bg-red-100 p-2 text-center text-xs text-red-600 sm:text-sm'>
                            {fileErrorMsg}
                          </div>
                        )}
                        <div className='flex items-center gap-1 bg-[##F7F2EB] sm:gap-2'>
                          <div className='relative'>
                            <button
                              className='cursor-pointer  rounded-full p-1 hover:bg-[#FAF9F5] sm:p-2'
                              onClick={toggleUploadMenu}
                            >
                              <FolderOpenDot className='h-4 w-4 text-green-700 sm:h-5 sm:w-5' />
                            </button>
                            {showUploadMenu && (
                              <div
                                ref={uploadMenuRef}
                                className='absolute bottom-full left-0 z-10 mb-2  w-48 rounded-lg bg-white'
                              >
                                <div className='p-2 text-xs shadow sm:text-sm'>
                                  <p className='mb-1 font-medium'>
                                    Upload file
                                  </p>
                                  <div className='space-y-2'>
                                    <label className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-100'>
                                      <Paperclip className='h-4 w-4 text-blue-500' />
                                      <span>Image</span>
                                      <input
                                        type='file'
                                        className='hidden'
                                        onChange={handleFileChange}
                                        accept='image/jpeg,image/png,image/jpg'
                                      />
                                    </label>
                                    <label className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-100'>
                                      <Play className='h-4 w-4 text-red-500' />
                                      <span>Video</span>
                                      <input
                                        type='file'
                                        className='hidden'
                                        onChange={handleFileChange}
                                        accept='video/mp4,video/webm,video/ogg'
                                      />
                                    </label>
                                    <label className='flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-100'>
                                      <FileText className='h-4 w-4 text-gray-500' />
                                      <span>Document</span>
                                      <input
                                        type='file'
                                        className='hidden'
                                        onChange={handleFileChange}
                                        accept='application/pdf'
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className='relative'>
                            <button
                              type='button'
                              className='rounded-full bg-[#FAF9F5] p-1 hover:bg-[#FAF9F5] sm:p-2'
                              onClick={() =>
                                setShowEmojiPicker(!showEmojiPicker)
                              }
                            >
                              <Smile className='h-4 w-4 text-gray-600 sm:h-5 sm:w-5' />
                            </button>
                            {showEmojiPicker && (
                              <div
                                ref={emojiPickerRef}
                                className='absolute bottom-12 left-0 z-10 origin-bottom-left scale-75 sm:scale-100'
                              >
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                              </div>
                            )}
                          </div>

                          <form
                            className='flex-1 px-2 py-1 sm:px-4 sm:py-2'
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                          >
                            <Input
                              className='flex-1 rounded-lg border-none px-2 py-1 text-xs focus:outline-none sm:px-4 sm:py-2 sm:text-sm'
                              placeholder='Write Message'
                              value={message}
                              onChange={handleInputChange}
                            />
                          </form>

                          <Button
                            size='icon'
                            className='flex h-8 w-8 items-center justify-center rounded-lg border-none bg-black text-white sm:h-10 sm:w-auto sm:gap-2 sm:px-3'
                            onClick={handleSendMessage}
                          >
                            <Send className='h-3 w-3 sm:h-4 sm:w-4' />
                            <span className='hidden sm:inline'>Send</span>
                          </Button>
                        </div>
                      </div> */}
                    </>
                  ) : (
                    <>
                      {/* <Loader color="orange" /> */}

                      <div className='mt-5 flex h-40 items-center justify-center'>
                        {/* <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-blue-500"></div> */}
                        <Loader color='orange' size='xl' />
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
          {selectedThread ? (
            <Accordion
              type='multiple'
              className='w-md mx-auto max-w-md rounded-md border'
            >
              <AccordionItem value='item-1'>
                <AccordionTrigger>Property Details</AccordionTrigger>
                <AccordionContent>
                  <div
                    className={`w-full border-l bg-gray-50 md:w-96 ${showDetails ? 'block' : 'hidden md:block'} max-h-full overflow-hidden`}
                  >
                    {/* <div className="p-2 sm:p-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-sm sm:text-base">Property Details</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-9 sm:w-9"
                      onClick={() => {
                        setIsDetails(false)
                        setShowDetails(false)
                      }}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div> */}
                    <ScrollArea className='h-[calc(100vh-16rem)] px-2 sm:h-[calc(100vh-17rem)] sm:px-0'>
                      <div className='p-2 sm:p-4'>
                        <div className='relative'>
                          <Image
                            src={
                              propertyData?.media?.primaryListingImageUrl || ''
                            }
                            alt={`Property Image`}
                            width={400}
                            height={100}
                            className='h-auto w-full rounded-lg object-cover'
                            priority
                            unoptimized={true}
                          />
                        </div>
                        <div className='mt-3 sm:mt-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-1'>
                              <LocationOnIcon className='text-base text-primary sm:text-lg' />
                              <div>
                                <h3 className='text-sm font-semibold sm:text-lg'>
                                  {propertyData?.address?.unparsedAddress}
                                </h3>
                                <p className='text-xs text-muted-foreground sm:text-sm'>
                                  {propertyData?.courtesyOf}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Star className='h-3 w-3 fill-primary text-primary sm:h-4 sm:w-4' />
                              <span className='text-xs sm:text-sm'>4.6</span>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className='mt-3 flex items-center justify-between sm:mt-4'>
                            <div className='flex gap-1 sm:gap-2'>
                              {/* Bedroom Capsule */}
                              <div className='flex items-center gap-1 rounded-full bg-[#FAF9F5] px-2 py-1 text-xs sm:px-3 sm:text-sm'>
                                <BathtubIcon className='text-base sm:text-lg' />
                                <span>
                                  {propertyData?.property?.bathroomsTotal} Bath
                                </span>
                              </div>
                              {/* Bathroom Capsule */}
                              <div className='flex items-center gap-1 rounded-full bg-[#FAF9F5] px-2 py-1 text-xs sm:px-3 sm:text-sm'>
                                <KingBedIcon className='text-base sm:text-lg' />
                                <span>
                                  {propertyData?.property?.bedroomsTotal} Bed
                                </span>
                              </div>
                            </div>
                            {/* Heart Icon */}
                            <FavoriteBorder className='cursor-pointer text-lg text-gray-500 hover:text-red-500 sm:text-xl' />
                          </div>
                        </div>
                        <div className='mt-3 sm:mt-4'>
                          <h4 className='text-sm font-semibold sm:text-lg'>
                            Overview
                          </h4>
                          <span className='text-xs sm:text-sm'>
                            {propertyData?.publicRemarks
                              ? propertyData?.publicRemarks.length > 100
                                ? propertyData?.publicRemarks.slice(0, 100) +
                                '...'
                                : propertyData?.publicRemarks
                              : ''}
                            {propertyData?.publicRemarks &&
                              propertyData?.publicRemarks.length > 100 && (
                                <Button
                                  variant='link'
                                  className='ml-1 h-auto p-0 text-xs text-blue-600 sm:ml-2 sm:text-sm'
                                  onClick={() => setIsModalOpen(true)}
                                >
                                  View More
                                </Button>
                              )}
                          </span>

                          {/* Modal for full description */}
                          <Dialog
                            open={isModalOpen}
                            onOpenChange={setIsModalOpen}
                          >
                            <DialogContent className='max-w-[90vw] rounded-lg bg-white sm:max-w-lg'>
                              <DialogHeader>
                                <DialogTitle className='text-sm sm:text-base'>
                                  Property Overview
                                </DialogTitle>
                                <DialogDescription className='text-xs sm:text-sm'>
                                  {propertyData?.publicRemarks}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogClose asChild>
                                <Button className='bg-orange-500 text-xs hover:bg-orange-600 sm:text-sm'>
                                  Close
                                </Button>
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className='mt-4 sm:mt-6'>
                          <h4 className='mb-2 text-sm font-medium sm:text-base'>
                            Amenities
                          </h4>
                          <div className='grid grid-cols-2 gap-2 sm:gap-4'>
                            <div className='flex items-center gap-1 sm:gap-2'>
                              <Wifi className='h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='text-xs sm:text-sm'>Wifi</span>
                            </div>
                            <div className='flex items-center gap-1 sm:gap-2'>
                              <Kitchen className='h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='text-xs sm:text-sm'>
                                Kitchen
                              </span>
                            </div>
                            <div className='flex items-center gap-1 sm:gap-2'>
                              <Maximize2 className='h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='text-xs sm:text-sm'>
                                Workspace
                              </span>
                            </div>
                            <div className='flex items-center gap-1 sm:gap-2'>
                              <Car className='h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='text-xs sm:text-sm'>
                                Free parking
                              </span>
                            </div>
                            <div className='flex items-center gap-1 sm:gap-2'>
                              <Wind className='h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='text-xs sm:text-sm'>
                                Air conditioning
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </div>
      </section>
      {inviteOpen && (

        <Modal closeModal={() => setInviteOpen(false)} isOpen={inviteOpen} useChildStyle>
          <div className="w-full max-w-[92%] sm:max-w-md mx-auto rounded-xl bg-white p-4 sm:p-6">

            <h2 className="mb-3 text-center text-base font-bold sm:text-xl">
              Invite an Agent
            </h2>

            <p className="mb-4 text-center text-sm text-gray-600">
              Enter the agent’s email below to send an invitation.
            </p>

            <Input
              type="email"
              placeholder="Agent's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-5 w-full rounded-lg border p-3 text-sm"
            />

            <div className="flex justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setInviteOpen(false)}
                className="flex-1 py-2 text-sm"
              >
                Cancel
              </Button>

              <Button
                onClick={handleInvite}
                disabled={!email}
                className="flex-1 bg-orange-600 py-2 text-sm text-white disabled:opacity-50"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </Modal>

      )}

      {/* Media Preview Modal */}
      {mediaPreview && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4'>
          <div className='relative flex h-full w-full items-center justify-center'>
            <button
              onClick={closeMediaPreview}
              className='absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/70'
            >
              <X className='h-6 w-6' />
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
                <div className='absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 transform items-center gap-4 rounded-full bg-black/50 px-4 py-2'>
                  <button
                    onClick={() => handleZoom(false)}
                    className='text-white hover:text-gray-200'
                    disabled={zoomLevel <= 0.5}
                  >
                    <ZoomOut className='h-5 w-5' />
                  </button>
                  <span className='text-sm text-white'>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom(true)}
                    className='text-white hover:text-gray-200'
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className='h-5 w-5' />
                  </button>
                </div>
              )}

            <div className='absolute left-4 top-4 z-20 max-w-[80%] truncate rounded-md bg-black/50 px-3 py-1 text-sm text-white'>
              {mediaPreview.name || 'Media Preview'}
            </div>

            <div className='max-h-full max-w-full overflow-auto'>
              {/* Loading indicator */}
              {mediaPreview.loading && (
                <div className='flex flex-col items-center justify-center'>
                  <div className='mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-white'></div>
                  <p className='text-sm text-white'>Loading image...</p>
                </div>
              )}

              {/* Error message */}
              {mediaPreview.error && (
                <div className='flex flex-col items-center justify-center'>
                  <div className='rounded-lg bg-red-600/20 p-8 text-center'>
                    <p className='mb-2 text-lg text-white'>
                      Failed to load image
                    </p>
                    <p className='text-sm text-gray-300'>
                      The image could not be loaded due to an error.
                    </p>
                  </div>
                </div>
              )}

              {/* Image preview */}
              {mediaPreview.type &&
                imageMimeType.includes(mediaPreview.type) &&
                !mediaPreview.loading &&
                !mediaPreview.error ? (
                <div
                  className='relative flex h-full w-full items-center justify-center'
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: 'transform 0.2s ease-out',
                  }}
                >
                  <img
                    src={mediaPreview.url || '/placeholder.svg'}
                    alt='Image Preview'
                    className='max-h-[90vh] max-w-full object-contain'
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => {
                      console.error('Image failed to display in preview:', e);
                      setMediaPreview((prev) =>
                        prev ? { ...prev, error: true } : null,
                      );
                    }}
                  />
                </div>
              ) : mediaPreview.type &&
                videoMimeType.includes(mediaPreview.type) ? (
                <div className='relative w-full max-w-4xl'>
                  <video
                    src={mediaPreview.url}
                    controls
                    autoPlay
                    className='max-h-[90vh] max-w-full'
                    onError={(e) => {
                      console.error('Video failed to load:', e);
                      setMediaPreview((prev) =>
                        prev ? { ...prev, error: true } : null,
                      );
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                !mediaPreview.loading &&
                !mediaPreview.error && (
                  <div className='max-w-lg rounded-lg bg-white p-8 text-center'>
                    <FileText className='mx-auto mb-4 h-16 w-16 text-gray-400' />
                    <p className='mb-2 text-xl font-medium'>
                      File preview not available
                    </p>
                    <p className='mb-6 text-gray-500'>{mediaPreview.name}</p>
                    <a
                      href={mediaPreview.url}
                      download
                      className='inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Download className='mr-2 h-4 w-4' /> Download File
                    </a>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const hashCode = (str: string) =>
  str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
