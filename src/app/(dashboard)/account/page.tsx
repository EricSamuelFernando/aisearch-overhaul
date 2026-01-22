'use client';

import { useEffect, useState } from 'react';
import { formatSellerDate } from '@/lib/helpers';
import PlaceholderImage from '@public/assets/images/placeholder.svg';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetUserDocument } from '@/hooks/api/user/useGetUserDocuments';
import {
  truncateName,
  useDocumentHandlers,
} from '@/hooks/utils/useDocumentsHandlers';
import PDFViewerModal from '@/components/dashboard/main/pdf-viewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, EllipsisVertical, Eye, FileText, MoreVertical, UserPlus, PlusCircle, Share2, Edit2, FileEdit, Trash2, ArrowLeft, Ellipsis, EllipsisIcon } from 'lucide-react';
import { useGetUserInvitedAgents } from '@/hooks/api/user/useGetUserInvitedAgents';
import ProfileCircle from '@/components/dashboard/user/profile-circle';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { error, success } from '@/components/alert/notify';
import { useSelector } from 'react-redux';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import InviteUserModal from '@/components/collaborative-invite';
import SendSnapLinkModal from '@/components/send_snap.modal';
import DeleteCollectionConfirmationModal from '@/components/delete-snap.modal';
import RenameCollectionModal from '@/components/rename-snap.modal';
import FavouritePropertyCards from '@/components/dashboard/main/fvourites.card';
import RecentCommentsSidebar from '@/components/dashboard/main/recent-comments-sidebar';


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
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchedAgents, setSearchedAgents] = useState<InvitationInterface[] | []>([]);
  const [favourites, setFavourites] = useState([])
  const { getAllAgentsQuery, searchAgentMutation, sendInviteMutation } = useUserAuthApi();
  const { data: userDocuments, isPending: isDocumentsPending } =
    useGetUserDocument();
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
  const { isPending: isInvitedAgentsPending } = useGetUserInvitedAgents();
  const { handleDownload } = useDocumentHandlers(undefined);
  const documents = userDocuments?.result;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inviteUsers, setInviteUsers] = useState<InvitationInterface[]>([])
  const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0);

  const handleDeleteCollection = () => {
    console.log('Collection deleted!');
    // Your delete API call here
  };
  const handleSendInvite = (email: string) => {
    console.log('Invited:', email);
    // Add your API call here
  };

  const handleSendInvitation = () => {
    try {
      setIsModalOpen("share")
      getAllAgents.mutateAsync({ limit: 10, offset: 0 }, {
        onSuccess: (response) => {
          setLoading(false);
          setInviteUsers(response)
        },
        onError: (error) => {
          console.log("Error in mutation: ", error);
          setLoading(false);
        }

      })
    } catch (error) {
      console.log(error);

    }
  }
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

  const handleSendSnapLink = (selectedIds: string[]) => {
    console.log('Sending Snap Link to:', selectedIds);
    success({ message: 'Snap link sent successfully!' });
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

  const inviteAgent = (email: string) => {
    const data = {
      snapId: selectedSnap?.id,
      email: email,
      status: "pending"
    }
    createParticipents.mutateAsync(data, {
      onSuccess: (response: any) => {
        console.log("Response : ", response);
        if (response?.data?.createSnapsParticipant?.success === "true") {
          success({ message: "Great! Your invite is on its way" })
          setIsModalOpen("")
        }
      }
    })

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

  return (
    <main className='mx-auto flex min-h-[90vh] flex-col bg-[#F4F9F5] px-12 pb-10'>
      <h1 className=' py-10 text-4xl font-bold leading-[3.88125rem] 2xl:text-[2.875rem]'>
        Account
      </h1>

      <Tabs defaultValue='favourites' className='space-y-10'>
        <TabsList className='h-auto w-full justify-start rounded-none border-b bg-transparent p-0 font-medium'>
          <TabsTrigger
            value='favourites'
            className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
          >
            Favourites
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
        </TabsList>

        <TabsContent value='favourites' className='mt-6 w-full'>
          <div className="flex justify-between items-center mb-6 bg-transparent">
            {selectedSnap ? (
              <>
                <div className='flex flex-col'>
                  <h3 className="text-lg font-bold">{selectedSnap?.name}</h3>
                  <span className="text-md text-gray-500">{favourites?.length || "0"} Results Found</span>
                  <br />
                  <Button
                    // variant="outline"
                    size="sm"
                    className="border-2 bg-transparent text-gray-600 hover:bg-gray-400 rounded-full px-4 h-8 text-xs font-medium flex items-center gap-2 w-fit"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSnap(null)
                    }}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </Button>
                </div>
              </>
            ) : <h3 className="text-lg font-bold">Snapz</h3>}
            {/* <h3 className="text-lg font-bold">Snaps</h3> */}
            {selectedSnap ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <EllipsisIcon



                      className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsModalOpen("invite")
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Invite to collaborate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Add to this snapz</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleSendInvitation()
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share snapz link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    <span>Select and edit in this snapz</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsModalOpen("rename")
                    }}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    <span>Rename snapz</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600"
                    onClick={() => {
                      setIsDeleteModalOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete snapz</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={fetchPendingRequests}
                >
                  View Requests
                </Button>
                <Button variant="outline" className="flex border-none bg-transparent items-center gap-2">
                  <span>Add New Snapz</span>
                  <span>+</span>
                </Button>
              </div>
            )}
          </div>
          {
            selectedSnap ? (
              <div className="flex gap-6 items-start h-[70vh]">
                <ScrollArea className='flex-1 h-full overflow-y-auto pr-4'>
                  <div className='grid grid-cols-2 xl:grid-cols-3 gap-6 p-2'>
                    {[...favourites].reverse().map((property: any) => {
                      const safeProperty = {
                        id: property.id || Math.random().toString(),
                        name: property.name || 'Property',
                        image: property.image || '/assets/images/placeholder.svg',
                        bedRooms: property.bedRooms || 0,
                        bathRooms: property.bathRooms || 0,
                        sqft: property.sqft || 0,
                        ...property,
                      };

                      return <FavouritePropertyCards
                        key={safeProperty.id}
                        {...safeProperty}
                        snapId={selectedSnap?.id}
                        isWishlisted={true}
                        onCommentAdded={() => setCommentRefreshTrigger(prev => prev + 1)}
                      />;
                    })}

                  </div>
                  <ScrollBar orientation='vertical' className='h-full' />
                </ScrollArea>

                {/* Recent Comments Sidebar */}
                <div className="w-[320px] xl:w-[380px] flex-shrink-0">
                  <RecentCommentsSidebar properties={favourites} refreshTrigger={commentRefreshTrigger} />
                </div>
              </div>
            ) : <div className="border rounded-md p-6 border-none">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {
                  snaps.length > 0 ? (
                    snaps.map((snap: any, idx: number) => {
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {snap?.image ? (
                              <div className="w-12 h-12 rounded overflow-hidden">
                                <img
                                  src={snap.image}
                                  alt={snap.name || "Collection"}
                                  className="w-full h-full object-cover"
                                />                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center rounded bg-indigo-500 text-white font-bold">
                                {snap?.name ? snap?.name.charAt(0).toUpperCase() : "C"}
                              </div>
                            )}
                            <span className="text-sm font-medium">{snap?.name || "Collection"}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full px-4 h-8 text-xs font-medium"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSnap(snap)
                            }}
                          >
                            View
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      No Snap Collections Found
                    </>
                  )
                }
              </div>
            </div>
          }
        </TabsContent>

        <TabsContent value='documents'>
          <div className='text-center text-gray-500'>
            <div className='grid grid-cols-3 gap-5 py-10'>
              {document &&
                documents?.map((doc) => (
                  <div
                    className='relative flex w-fit items-center justify-between rounded-lg p-4 transition-all duration-500 ease-in-out'
                    key={doc._id}
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
                              onClick={() => handleOpenPdfViewer(doc.url)}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              <span>Open</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(doc._id, doc.url)}
                            >
                              <Download className='mr-2 h-4 w-4' />
                              <span>Download</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className='flex flex-col justify-start space-y-2 text-start'>
                        <h3 className='font-bold text-black'>
                          {truncateName(doc.name, 20)}
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
            <form className="flex gap-3" onSubmit={handleAgentSearch}>
              <input
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="p-2 border rounded-md"
              />
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
                    <div className="flex justify-start gap-3">
                      <ProfileCircle
                        placeholder={`${agentData.firstName[0]}/${agentData.lastName[0]}`}
                        className="h-20 w-20 text-lg"
                      />
                      <section className="flex flex-col justify-start gap-1 text-start">
                        <p className="font-bold">{`${agentData.firstName} ${agentData.lastName}`}</p>
                        <p className="font-medium">{agentData.email}</p>
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
      </Tabs>
      <InviteUserModal
        isOpen={isModalOpen === "invite"}
        onClose={() => setIsModalOpen("")}
        onSend={inviteAgent}
      />
      <SendSnapLinkModal
        isOpen={isModalOpen === "share"}
        onClose={() => setIsModalOpen("")}
        users={inviteUsers}
        onSend={handleSendSnapLink}
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

      {/* Requests Modal */}
      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="space-y-4 min-h-[200px]">
              {pendingRequests.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-center text-gray-500 py-4">No requests available yet.</p>
                </div>
              ) : (
                pendingRequests.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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

                    <div className="flex gap-2">
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
