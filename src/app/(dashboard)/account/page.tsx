'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatSellerDate } from '@/lib/helpers';
import PlaceholderImage from '@public/assets/images/placeholder.svg';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetUserDocuments } from '@/hooks/api/user/useGetUserDocuments';
import {
  truncateName,
} from '@/hooks/utils/useDocumentsHandlers';

import PDFViewerModal from '@/components/dashboard/main/pdf-viewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EllipsisVertical, Eye, FileText, MoreVertical, UserPlus, PlusCircle, Share2, Edit2, FileEdit, Trash2, ArrowLeft, Ellipsis, EllipsisIcon, Plus } from 'lucide-react';
import { useGetUserInvitedAgents } from '@/hooks/api/user/useGetUserInvitedAgents';
import ProfileCircle from '@/components/dashboard/user/profile-circle';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { error, success } from '@/components/alert/notify';
import { useSelector } from 'react-redux';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import InviteUserModal from '@/components/collaborative-invite';
import CollaborateModal from '@/components/collaborative-invite-modal';
import SendSnapLinkModal from '@/components/send_snap.modal';
import DeleteCollectionConfirmationModal from '@/components/delete-snap.modal';
import RenameCollectionModal from '@/components/rename-snap.modal';
import FavouritePropertyCards from '@/components/dashboard/main/fvourites.card';
import RecentCommentsSidebar from '@/components/dashboard/main/recent-comments-sidebar';
import CreateSnapModal from '@/components/create-snap.modal';
import { v4 as uuidv4 } from 'uuid';
import { useGetViewHistory, type ViewHistoryItem } from '@/hooks/api/auth/useViewHistory';


interface InvitationInterface {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface SnapCollection {
  id: string;
  name: string;
  image?: string;
  favourites?: any[];
}
interface Agent {
  id: string;
  accountType: string;
  is_accepted: string;
  sellerAgent?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  buyerAgent?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AccountPage() {
  const router = useRouter();
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchedAgents, setSearchedAgents] = useState<InvitationInterface[] | []>([]);
  const [favourites, setFavourites] = useState([])
  const { getAllAgentsQuery, searchAgentMutation, sendInviteMutation } = useUserAuthApi();
  const { data: userDocuments, isPending: isDocumentsPending } =
    useGetUserDocuments();
  const {
    createNewSnap,
    getAllSnaps,
    getAllSnapsProperties,
    getAllAgents,
    deleteSnap,
    updateSnap,
    createParticipents,

  } = useUserSnapAPIs()
  const userData = useSelector((state: any) => state.auth.user)
  const [snaps, setSnaps] = useState<SnapCollection[]>([])
  const [selectedSnap, setSelectedSnap] = useState<SnapCollection | null>(null)
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState("");
  const [isCollaborateModalOpen, setIsCollaborateModalOpen] = useState(false);
  const { isPending: isInvitedAgentsPending } = useGetUserInvitedAgents();

  const documents = userDocuments?.result;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [inviteUsers, setInviteUsers] = useState<InvitationInterface[]>([])
  const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyMeta, setHistoryMeta] = useState<{
    totalItems?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  }>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || '';

  // View History State
  const [viewHistoryPage, setViewHistoryPage] = useState(1);
  const [viewHistoryPerPage] = useState(10);
  const { getViewHistory } = useGetViewHistory(viewHistoryPage, viewHistoryPerPage);

  // Pagination State for Invitation Modal
  const [invitePage, setInvitePage] = useState(1);
  const [inviteTotal, setInviteTotal] = useState(0);
  const ITEMS_PER_PAGE = 10;



  const handleDeleteCollection = () => {
    console.log('Collection deleted!');
    // Your delete API call here
  };
  const handleSendInvite = (email: string) => {
    console.log('Invited:', email);
    // Add your API call here
  };

  const fetchInvitationUsers = (page: number) => {
    setLoading(true);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    getAllAgents.mutateAsync({ limit: ITEMS_PER_PAGE, offset }, {
      onSuccess: (response) => {
        setLoading(false);
        setInviteUsers(response?.users || []);
        setInviteTotal(response?.total || 0);
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
        setLoading(false);
      }
    });
  };

  const handleSendInvitation = () => {
    try {
      setIsModalOpen("share");
      setInvitePage(1); // Reset to first page
      fetchInvitationUsers(1);
    } catch (error) {
      console.log(error);
    }
  }

  const handleInvitePageChange = (newPage: number) => {
    setInvitePage(newPage);
    fetchInvitationUsers(newPage);
  };
  const handleOpenPdfViewer = (url: string) => {
    setPdfViewerUrl(url);
    setIsPdfViewerModalOpen(true);
  };
  const handleFetchAgents = () => {
    getAllAgentsQuery.mutate(null, {
      onSuccess: (response) => {
        setLoading(false);
        setAgents(response?.data?.data?.get_all_agents)
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
        setLoading(false);
      },
    });
  };

  const handleSendSnapLink = async (selectedUsers: any[]) => {
    // console.log('Sending Snap Link to:', selectedUsers);
    setLoading(true);
    let successCount = 0;

    for (const user of selectedUsers) {
      try {
        const payload = {
          email: user.email,
          snapId: selectedSnap?.id,
          // If accountType is explicitly 'buyer' (case-insensitive), use it. Otherwise default to 'agent' (which covers external agents too)
          accountType: user.accountType?.toLowerCase() === 'buyer' ? 'buyer' : 'agent',
          status: 'pending' // As requested: status 'pending'
        };

        await createParticipents.mutateAsync(payload);
        successCount++;
      } catch (err) {
        console.error(`Failed to invite ${user.email}`, err);
      }
    }

    setLoading(false);
    if (successCount > 0) {
      success({ message: `Snap link sent successfully to ${successCount} users!` });
      setIsModalOpen(""); // Close modal on success
    } else {
      // error({ message: "Failed to send invitations" });
    }
  };

  const handleAgentSearch = async (e: any) => {
    try {
      e.preventDefault();
      if (agentSearch.trim().length || searchedAgents?.length) {
        setLoading(true)
        setSearchedAgents([])
        searchAgentMutation.mutate(agentSearch, {
          onSuccess: (data) => {
            setLoading(false);
            if (data?.data?.get_agents?.length) {
              success({ message: 'All registered agents are fetched' });
              setSearchedAgents(data?.data?.get_agents)
            } else {
              error({ message: 'No any agent were found.' });
            }
          },
          onError: (error) => {
            console.log("Error in mutation: ", error);
            setLoading(false);
          },
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllCollections = () => {
    if (userData?.id) {
      console.log("Fetching collections for user:", userData.id);
      // Fetch owned snaps
      getAllSnaps.mutate(userData?.id, {
        onSuccess: (ownedSnaps) => {
          console.log("Owned Snaps fetched:", ownedSnaps);
          // Fetch accepted shared snaps
          getAllSnapzRequest.mutateAsync({
            status: "accepted",
            participentId: userData?.id
          }).then((sharedRequests: any) => {
            console.log("Shared Requests fetched:", sharedRequests);
            const sharedSnaps = sharedRequests?.map((req: any) => req.snap) || [];
            console.log("Mapped Shared Snaps:", sharedSnaps);
            // Filter out duplicates if any (though shouldn't prevent duplicate view if intended)
            // For now, simple merge
            const allSnaps = [...(ownedSnaps || []), ...sharedSnaps];
            console.log("Merged Snaps:", allSnaps);
            setSnaps(allSnaps);
          }).catch(err => {
            console.error("Error fetching shared snaps", err);
            // Fallback to just owned snaps if shared fails
            if (ownedSnaps) setSnaps(ownedSnaps);
          });

        },
        onError: (error) => {
          console.log("Error fetching collections: ", error);
        }
      });
    }
  };

  useEffect(() => {
    getAllCollections();
  }, [userData]);


  const handleKeyDown = (e: any) => {
    if (e.key === 'ArrowDown') {
      // Move down in the suggestion list
      setSelectedIndex((prevIndex) => (prevIndex + 1) % searchedAgents.length);
    } else if (e.key === 'ArrowUp') {
      // Move up in the suggestion list
      setSelectedIndex(
        (prevIndex) => (prevIndex - 1 + searchedAgents.length) % searchedAgents.length
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      // Select the current suggestion
      // setAgentSearch(searchedAgents[selectedIndex].email);
      setSearchedAgents([]);
    }
  };

  const sendAgentInvitation = async (agentId: string) => {
    try {
      sendInviteMutation.mutate(agentId, {
        onSuccess: (data) => {
          setLoading(false);
          if (data?.data?.inivte_agents?.success) {
            success({ message: data?.data?.inivte_agents?.message });
            setSearchedAgents([])
            handleFetchAgents()
          } else {
            error({ message: data?.data?.inivte_agents?.message });
          }
        },
        onError: (error) => {
          console.log("Error in mutation: ", error);
          setLoading(false);
        },
      })
    } catch (error) {
      console.log(error);
    }
  }

  const getAllSnapProperties = () => {
    debugger
    if (selectedSnap?.id) {
      getAllSnapsProperties.mutate(selectedSnap?.id, {
        onSuccess: (response) => {
          setFavourites(response?.data?.favourites)
        },
        onError: (error) => {
          console.log("Error fetching properties: ", error);
        }
      })
    }
  }

  const handleUpdateSnap = (name: string) => {
    updateSnap.mutateAsync({ id: selectedSnap?.id, name }, {
      onSuccess: (response: any) => {
        getAllCollections()
        success({ message: "Snapz has been successfully renamed!" })
        setSelectedSnap((prev) =>
          prev ? { ...prev, name } : null
        )
      }
    })
  }

  const handleDeleteSnap = () => {
    deleteSnap.mutateAsync("" + selectedSnap?.id, {
      onSuccess: (response: any) => {
        success({ message: "Snapz has been successfully deleted!" })
        setSelectedSnap(null)
        getAllCollections()
      }
    })
  }

  const inviteCollaborator = (email: string, type: 'agent' | 'co-buyer') => {
    const data = {
      snapId: selectedSnap?.id,
      email: email,
      status: "pending",
      accountType: type === 'agent' ? 'agent' : type
    }
    createParticipents.mutateAsync(data, {
      onSuccess: (response: any) => {
        console.log("Response : ", response);
        const successValue = response?.data?.createSnapsParticipant?.success;
        if (successValue === true || successValue === "true") {
          success({ message: `Great! Your ${type === 'agent' ? 'agent' : 'co-buyer'} invite is on its way` })
          setIsCollaborateModalOpen(false);
        } else {
          error({ message: response?.data?.createSnapsParticipant?.message || "Failed to send invite" });
        }
      },
      onError: (err: any) => {
        error({ message: err.message || "Failed to send invite" });
      }
    })
  };

  const inviteAgent = (email: string) => {
    inviteCollaborator(email, 'co-buyer'); // Fallback for old modal if needed
  };

  useEffect(() => {
    if (selectedSnap?.id) {
      debugger
      console.log(selectedSnap, "selectedSnap")
      getAllSnapProperties()
    }
  }, [selectedSnap])

  const { getAllSnapzRequest, updateSnapzById } = useAgentConversationApi();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isCreateSnapModalOpen, setIsCreateSnapModalOpen] = useState(false);

  const handleCreateNewSnap = (name: string) => {
    const snapId = uuidv4();
    const randomLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/snaps/${snapId}`;

    createNewSnap.mutate({
      name,
      link: randomLink,
      userId: userData?.id
    }, {
      onSuccess: (data) => {
        success({ message: "Snapz created successfully!" });
        getAllCollections();
        setIsCreateSnapModalOpen(false);
      },
      onError: (err: any) => {
        error({ message: err.message || "Failed to create snap" });
      }
    });
  };

  const fetchPendingRequests = () => {
    if (userData?.id) {
      getAllSnapzRequest.mutateAsync({
        status: "pending",
        participentId: userData?.id
      }, {
        onSuccess: (response: any) => {
          setPendingRequests(response);
          if (response?.length > 0) {
            setIsRequestsModalOpen(true);
          } else {
            success({ message: "No pending requests found." });
          }
        },
        onError: (err) => {
          console.error("Error fetching requests:", err);
        }
      });
    }
  };

  const handleRequestAction = (id: string, action: "accept" | "reject") => {
    const status = action === "accept" ? "accepted" : "rejected";
    updateSnapzById.mutateAsync({
      id: id,
      status: status
    }, {
      onSuccess: (response) => {
        success({ message: `Request ${action === "accept" ? "accepted" : "rejected"} successfully` });
        fetchPendingRequests(); // Refresh list
        // If accepted, we might want to refresh collections too
        if (action === "accept") {
          getAllCollections();
        }
      },
      onError: (err) => {
        error({ message: "Failed to update request status" });
      }
    });
  };

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Load Search History
  useEffect(() => {
    if (!userData?.id) return;
    const controller = new AbortController();

    const loadSearchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const params = new URLSearchParams({
          user_id: String(userData.id),
          page: String(historyPage),
          per_page: String(historyPerPage),
        });
        const base = AI_BASE_URL.replace(/\/$/, '');
        const response = await fetch(`${base}/api/search_history?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to load search history');
        }
        const json = await response.json();
        const items =
          json?.history ||
          json?.data ||
          json?.items ||
          json?.results ||
          (Array.isArray(json) ? json : []);
        const totalPages =
          json?.pagination?.total_pages ||
          json?.total_pages ||
          (json?.total && historyPerPage
            ? Math.max(1, Math.ceil(Number(json.total) / historyPerPage))
            : 1);
        setSearchHistory(items);
        setHistoryTotalPages(totalPages);
        setHistoryMeta({
          totalItems: json?.pagination?.total_items ?? json?.total,
          hasNext: json?.pagination?.has_next_page,
          hasPrev: json?.pagination?.has_previous_page,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setHistoryError(err?.message || 'Failed to load search history');
          setSearchHistory([]);
        }
      } finally {
        setHistoryLoading(false);
      }
    };

    loadSearchHistory();

    return () => controller.abort();
  }, [userData?.id, historyPage, historyPerPage]);

  return (
    <main className='mx-auto flex min-h-[90vh] w-full max-w-screen-2xl flex-col bg-[#F4F9F5] px-4 pb-8 sm:px-6 lg:px-12 lg:pb-10'>
      <h1 className='py-6 text-3xl font-bold leading-tight sm:py-8 sm:text-4xl 2xl:text-[2.875rem]'>
        Account
      </h1>

      <Tabs defaultValue='my-snapz' className='space-y-6 sm:space-y-8'>
        <ScrollArea className='w-full whitespace-nowrap'>
          <TabsList className='h-auto w-max min-w-full justify-start rounded-none border-b bg-transparent p-0 font-medium'>
            <TabsTrigger
              value='my-snapz'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              My Snapz
            </TabsTrigger>
            <TabsTrigger
              value='documents'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value='linked-agents'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
              onClick={() => {
                handleFetchAgents()
              }}
            >
              Linked Agents
            </TabsTrigger>
            <TabsTrigger
              value='search-history'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              Search History
            </TabsTrigger>
            <TabsTrigger
              value='view-history'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              View History
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value='my-snapz' className='mt-6 w-full'>
          <div className="w-full">
            <div className="mb-6 flex flex-col gap-4 bg-transparent sm:flex-row sm:items-center sm:justify-end">
              <div className="flex flex-wrap gap-3">
                <Button className="h-10 bg-orange-500 px-4 text-sm text-white hover:bg-orange-600 rounded-full"
                  onClick={fetchPendingRequests}
                >
                  View Requests
                </Button>
                <div 
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium hover:text-gray-700"
                  onClick={() => setIsCreateSnapModalOpen(true)}
                >
                  <span>Add collection</span>
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="rounded-md border-none sm:p-0">
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                {
                  snaps.length > 0 ? (
                    snaps.map((snap: any, idx: number) => {
                      return (
                        <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center gap-3">
                            {/* Larger Image Card */}
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              {snap?.favourites?.length > 0 && snap?.favourites[0]?.image ? (
                                <img
                                  src={snap?.favourites[0]?.image}
                                  alt={snap.name || "Collection"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-indigo-500 text-lg font-bold text-white">
                                  {snap?.name ? snap?.name.charAt(0).toUpperCase() : "C"}
                                </div>
                              )}
                            </div>
                            <span className="truncate text-base font-medium text-gray-900">{snap?.name || "Collection"}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              className="h-8 rounded-full bg-black px-5 text-xs font-medium text-white hover:bg-gray-800"
                              onClick={() => router.push(`/account/collections/${snap.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-10 text-center text-gray-500">
                      No Snap Collections Found. Create one to get started!
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='documents'>
          <div className='text-center text-gray-500'>
            <div className='grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 sm:gap-5 sm:py-8 lg:grid-cols-4'>
              {documents?.map((doc) => (

                <div
                  className='relative flex w-fit items-center justify-between rounded-lg p-4 transition-all duration-500 ease-in-out'
                  key={doc.id}
                >
                  <section className='flex cursor-pointer flex-col gap-4 '>
                    <div className='relative flex items-center justify-center rounded-md bg-white p-4'>
                      <FileText className='h-20 w-20 text-black' />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='absolute right-0 top-0 h-8 w-8 p-0'
                          >
                            <span className='sr-only'>Open menu</span>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleOpenPdfViewer(doc.fileUrl)}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            <span>Open</span>
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className='flex flex-col justify-start space-y-2 text-start'>
                      <h3 className='font-bold text-black'>
                        {truncateName(doc.fileName, 20)}
                      </h3>
                      <p className='text-xs text-gray-500'>
                        {formatSellerDate(new Date(doc.updatedAt))}
                      </p>
                    </div>
                  </section>
                </div>
              ))}

              {pdfViewerUrl && (
                <PDFViewerModal
                  isOpen={isPdfViewerModalOpen}
                  onClose={() => setIsPdfViewerModalOpen(false)}
                  documentUrl={pdfViewerUrl}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='linked-agents'>
          <div className="mb-6 w-full">
            <h3 className="font-bold text-lg mb-2">Contact Agent</h3>
            <form className="flex flex-col gap-2 sm:flex-row sm:gap-3" onSubmit={handleAgentSearch}>
              <input
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="w-full rounded-md border p-2 text-sm sm:max-w-[320px]" />
              <Button className="p-2" type="submit" disabled={loading}>
                Contact Agent
              </Button>
            </form>

            {/* Suggestions dropdown */}
            {searchedAgents.length > 0 && (
              <ul className="absolute bg-white border border-gray-300 mt-1 max-h-60 overflow-y-auto rounded-md">
                {searchedAgents.map((suggestion, index) => (
                  <li
                    key={index}
                    className={`p-2 cursor-pointer ${selectedIndex === index ? 'bg-gray-200' : ''
                      }`}
                    onClick={() => {
                      sendAgentInvitation(suggestion?.id)
                      // setAgentSearch(suggestion.email);
                      // setSearchedAgents([]);
                    }}
                  >
                    {suggestion.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-4 gap-5 py-12 text-center w-full">
            {agents?.length ? (
              agents.map((agent, idx) => {
                // Determine which data to use based on accountType
                const isSeller = agent.accountType === "SELLER";
                const agentData = isSeller ? agent.sellerAgent : agent.buyerAgent;

                // Only render if agentData exists
                if (!agentData) return null;

                return (
                  <div key={idx} className="rounded-lg bg-white p-3">
                    <div className="flex items-start justify-start gap-3">
                      <ProfileCircle
                        placeholder={`${agentData.firstName[0]}/${agentData.lastName[0]}`}
                        className="h-20 w-20 text-lg"
                      />
                      <section className="flex flex-col justify-start gap-1 text-start">
                        <p className="font-bold">{`${agentData.firstName} ${agentData.lastName}`}</p>
                        <p className="break-all text-sm font-medium">{agentData.email}</p>
                      </section>
                    </div>
                    <Button disabled={agent?.is_accepted === "pending"} className="w-full">Send Message</Button>
                  </div>
                );
              })
            ) : (
              <p>No agents found.</p>
            )}
          </div>

        </TabsContent>

        <TabsContent value='search-history'>
          <div className='py-4'>
            {historyLoading ? (
              <p className='text-sm text-gray-500'>Loading search history...</p>
            ) : historyError ? (
              <p className='text-sm text-red-600'>{historyError}</p>
            ) : searchHistory.length === 0 ? (
              <p className='text-sm text-gray-500'>No search history found.</p>
            ) : (
              <div className='space-y-4'>
                <div className='hidden md:grid grid-cols-12 gap-3 rounded-lg bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500'>
                  <div className='col-span-4'>Search</div>
                  <div className='col-span-4'>Location</div>
                  <div className='col-span-2'>Photos</div>
                  <div className='col-span-2'>Date</div>
                </div>

                <div className='grid grid-cols-1 gap-3'>
                  {searchHistory.map((item, idx) => {
                    const natural = item?.natural_query || item?.query || item?.search || '';
                    const searchQuery = item?.search_query || {};
                    const location = [
                      searchQuery?.address,
                      searchQuery?.city,
                      searchQuery?.state,
                    ].filter(Boolean).join(', ');
                    const photos = searchQuery?.include_photos ? 'Yes' : 'No';
                    const size = searchQuery?.size ? `Size ${searchQuery.size}` : '';
                    const createdAt = item?.timestamp || item?.created_at || item?.createdAt || '';
                    const label = natural || location || `Search ${idx + 1}`;

                    return (
                      <div
                        key={item?.id || `${idx}-${label}`}
                        className='rounded-lg border border-gray-200 px-4 py-3'
                      >
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3'>
                          <div className='md:col-span-4'>
                            <p className='text-sm font-semibold text-black'>{label}</p>
                            {size ? (
                              <p className='text-xs text-gray-500'>{size}</p>
                            ) : null}
                          </div>
                          <div className='md:col-span-4'>
                            <p className='text-sm text-gray-800'>{location || 'N/A'}</p>
                          </div>
                          <div className='md:col-span-2'>
                            <p className='text-sm text-gray-800'>{photos}</p>
                          </div>
                          <div className='md:col-span-2'>
                            <p className='text-sm text-gray-800'>
                              {createdAt ? formatTimestamp(createdAt) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {historyTotalPages > 1 && (
                  <div className='flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between'>
                    <button
                      className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1 || historyMeta.hasPrev === false}
                    >
                      Previous
                    </button>
                    <p className='text-sm text-gray-600'>
                      Page {historyPage} of {historyTotalPages}
                      {historyMeta.totalItems ? ` • ${historyMeta.totalItems} total` : ''}
                    </p>
                    <button
                      className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
                      onClick={() =>
                        setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                      }
                      disabled={historyPage >= historyTotalPages || historyMeta.hasNext === false}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='view-history'>
          <div className='py-4'>
            {getViewHistory.isLoading ? (
              <p className='text-sm text-gray-500'>Loading view history...</p>
            ) : getViewHistory.isError ? (
              <p className='text-sm text-red-600'>Failed to load view history.</p>
            ) : !getViewHistory.data?.items?.length ? (
              <p className='text-sm text-gray-500'>No view history found. Browse properties to start tracking your views.</p>
            ) : (
              <div className='space-y-4'>
                {/* Table Header */}
                <div className='hidden md:grid grid-cols-12 gap-3 rounded-lg bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500'>
                  <div className='col-span-1'>Image</div>
                  <div className='col-span-3'>Address</div>
                  <div className='col-span-2'>City</div>
                  <div className='col-span-2'>Price</div>
                  <div className='col-span-2'>Type</div>
                  <div className='col-span-2'>Viewed At</div>
                </div>

                {/* Table Rows */}
                <div className='grid grid-cols-1 gap-3'>
                  {getViewHistory.data.items.map((item: ViewHistoryItem) => (
                    <div
                      key={item.id}
                      className='cursor-pointer rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50'
                      onClick={() => router.push(`/buy/${item.listingId}/prop/preview`)}
                    >
                      <div className='grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3 md:items-center'>
                        {/* Property Image */}
                        <div className='md:col-span-1'>
                          {item.propertyImage ? (
                            <img
                              src={item.propertyImage}
                              alt='Property'
                              className='h-12 w-12 rounded-md object-cover'
                            />
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500'>
                              N/A
                            </div>
                          )}
                        </div>
                        {/* Address */}
                        <div className='md:col-span-3'>
                          <p className='text-sm font-semibold text-black'>
                            {item.propertyAddress || 'N/A'}
                          </p>
                          <p className='text-xs text-gray-500 md:hidden'>
                            {[item.city, item.state].filter(Boolean).join(', ') || 'N/A'}
                          </p>
                        </div>
                        {/* City/State */}
                        <div className='hidden md:col-span-2 md:block'>
                          <p className='text-sm text-gray-800'>
                            {[item.city, item.state].filter(Boolean).join(', ') || 'N/A'}
                          </p>
                        </div>
                        {/* Price */}
                        <div className='md:col-span-2'>
                          <p className='text-sm text-gray-800'>
                            {item.price ? `$${Number(item.price).toLocaleString()}` : 'N/A'}
                          </p>
                        </div>
                        {/* Type */}
                        <div className='md:col-span-2'>
                          <p className='text-sm text-gray-800'>{item.propertyType || 'N/A'}</p>
                        </div>
                        {/* Viewed At */}
                        <div className='md:col-span-2'>
                          <p className='text-sm text-gray-800'>
                            {formatTimestamp(item.viewedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {(getViewHistory.data?.totalPages ?? 1) > 1 && (
                  <div className='flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between'>
                    <button
                      className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
                      onClick={() => setViewHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={viewHistoryPage === 1}
                    >
                      Previous
                    </button>
                    <p className='text-sm text-gray-600'>
                      Page {viewHistoryPage} of {getViewHistory.data?.totalPages ?? 1}
                      {getViewHistory.data?.total ? ` • ${getViewHistory.data.total} total` : ''}
                    </p>
                    <button
                      className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
                      onClick={() =>
                        setViewHistoryPage((p) =>
                          Math.min(getViewHistory.data?.totalPages ?? 1, p + 1),
                        )
                      }
                      disabled={viewHistoryPage >= (getViewHistory.data?.totalPages ?? 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <CollaborateModal
        isOpen={isCollaborateModalOpen}
        onClose={() => setIsCollaborateModalOpen(false)}
        onSend={inviteCollaborator}
      />
      <InviteUserModal
        isOpen={isModalOpen === "invite"}
        onClose={() => setIsModalOpen("")}
        onSend={inviteAgent}
        title="Invite Co-buyer"
      />
      <SendSnapLinkModal
        isOpen={isModalOpen === "share"}
        onClose={() => setIsModalOpen("")}
        users={inviteUsers}
        onSend={handleSendSnapLink}
        currentPage={invitePage}
        totalPages={Math.ceil(inviteTotal / ITEMS_PER_PAGE)}
        onPageChange={handleInvitePageChange}
        total={inviteTotal}
      />
      <DeleteCollectionConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSnap}
        collectionName={selectedSnap?.name || ""}
      />
      <RenameCollectionModal
        isOpen={isModalOpen === "rename"}
        onClose={() => setIsModalOpen("")}
        onRename={handleUpdateSnap}
        currentName={selectedSnap?.name || ""}
      />
      <CreateSnapModal
        isOpen={isCreateSnapModalOpen}
        onClose={() => setIsCreateSnapModalOpen(false)}
        onCreate={handleCreateNewSnap}
      />

      {/* Requests Modal */}
      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-3 w-full max-w-[500px] rounded-2xl bg-white p-4 shadow-2xl sm:mx-0 sm:p-6">
            <div className="space-y-4 min-h-[200px]">
              {pendingRequests.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-center text-gray-500 py-4">No requests available yet.</p>
                </div>
              ) : (
                pendingRequests.map((req, idx) => (
                  <div key={idx} className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div className="flex items-center space-x-4">
                      {/* Avatar Logic */}
                      {req?.snap?.user?.image ? (
                        <img src={req?.snap?.user?.image} alt={req?.snap?.user?.firstName} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 font-bold rounded-full text-sm">
                          {req?.snap?.user?.firstName?.charAt(0).toUpperCase()}{req?.snap?.user?.lastName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-bold">{req?.snap?.user?.firstName} {req?.snap?.user?.lastName}</span> has invited you to join his snapz - <span className="font-bold">{req?.snap?.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button
                        size="sm"
                        className="bg-black text-white hover:bg-gray-800 h-8 text-xs px-3"
                        onClick={() => handleRequestAction(req.id, "accept")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3 border-black text-black hover:bg-gray-100"
                        onClick={() => handleRequestAction(req.id, "reject")}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsRequestsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}