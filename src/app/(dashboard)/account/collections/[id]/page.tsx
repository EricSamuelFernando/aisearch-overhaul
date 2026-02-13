'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    EllipsisIcon,
    UserPlus,
    PlusCircle,
    Share2,
    FileEdit,
    Trash2,
} from 'lucide-react';
import FavouritePropertyCards from '@/components/dashboard/main/fvourites.card';
import RecentCommentsSidebar from '@/components/dashboard/main/recent-comments-sidebar';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { useSelector } from 'react-redux';
import { success, error } from '@/components/alert/notify';
import CollaborateModal from '@/components/collaborative-invite-modal';
import InviteUserModal from '@/components/collaborative-invite';
import DeleteCollectionConfirmationModal from '@/components/delete-snap.modal';
import RenameCollectionModal from '@/components/rename-snap.modal';
import SendSnapLinkModal from '@/components/send_snap.modal';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import PropertyRecommendations from '@/components/dashboard/main/property-recommendations';

interface SnapCollection {
    id: string;
    name: string;
    image?: string;
}

export default function SnapDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const userData = useSelector((state: any) => state.auth.user);

    const [snap, setSnap] = useState<SnapCollection | null>(null);
    const [favourites, setFavourites] = useState<any[]>([]);
    const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0);
    const [userSnapRole, setUserSnapRole] = useState<string>('buyer');

    // Modals state
    const [isCollaborateModalOpen, setIsCollaborateModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Invite logic state (reused from account page)
    const [inviteUsers, setInviteUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { getAllAgents } = useUserSnapAPIs();
    const { createParticipents, deleteSnap, updateSnap, getAllSnaps, getAllSnapsProperties, getSnapById } = useUserSnapAPIs();

    useEffect(() => {
        if (id && userData?.id) {
            fetchSnapDetails();
            fetchSnapProperties();
        }
    }, [id, userData]);

    // Handle shared snap case: if properties loaded but snap not found in own snaps
    useEffect(() => {
        if (!snap && favourites.length > 0 && id) {
            console.log('[SnapDetails] Snap not found in own snaps, fetching by ID (shared snap)');
            // Fetch snap details directly by ID
            getSnapById.mutate(id, {
                onSuccess: (snapData: any) => {
                    if (snapData) {
                        setSnap({
                            id: snapData.id,
                            name: snapData.name || 'Shared Snapz',
                            image: favourites[0]?.image || undefined
                        });
                        // Determine user's role in this snap from participants
                        const participant = snapData.participants?.find((p: any) => p.userId === userData?.id || p.email === userData?.email);
                        if (participant?.accountType) {
                            setUserSnapRole(participant.accountType);
                        }
                    }
                },
                onError: (err) => {
                    console.error('[SnapDetails] Error fetching snap by ID:', err);
                    // Fallback to generic name
                    setSnap({
                        id: id,
                        name: 'Shared Snapz',
                        image: favourites[0]?.image || undefined
                    });
                }
            });
        }
    }, [favourites, snap, id]);

    const fetchSnapDetails = () => {
        // Try to fetch from user's own snaps first
        getAllSnaps.mutate(userData.id, {
            onSuccess: (snaps: any[]) => {
                const found = snaps?.find((s: any) => s.id === id);
                if (found) {
                    setSnap(found);
                } else {
                    // If not found in own snaps, it might be a shared snap
                    // We'll fetch it by ID in the useEffect above
                    console.log('[SnapDetails] Snap not found in own snaps, might be shared');
                }
            },
            onError: () => {
                console.log('[SnapDetails] Error fetching own snaps');
            }
        });
    };

    const fetchSnapProperties = () => {
        getAllSnapsProperties.mutate(id, {
            onSuccess: (response: any) => {
                setFavourites(response?.data?.favourites || []);
            },
            onError: (err) => {
                console.error("Error fetching properties", err);
            }
        });
    };

    // ... (Methods for handling invites, renaming, deleting - copied/adapted from account/page.tsx)

    // Pagination for Invite Modal
    const [invitePage, setInvitePage] = useState(1);
    const [inviteTotalPages, setInviteTotalPages] = useState(1);
    const INVITE_LIMIT = 10;

    const fetchAgents = (page: number) => {
        getAllAgents.mutate({ limit: INVITE_LIMIT, offset: (page - 1) * INVITE_LIMIT }, {
            onSuccess: (res: any) => {
                setInviteUsers(res?.users || []);
                const total = res?.total || 0;
                setInviteTotalPages(Math.ceil(total / INVITE_LIMIT));
            }
        });
    };

    const handleSendInvitation = () => {
        setIsModalOpen("share");
        setInvitePage(1);
        fetchAgents(1);
    };

    const handlePageChange = (page: number) => {
        setInvitePage(page);
        fetchAgents(page);
    };

    const inviteCollaborator = (email: string, type: 'agent' | 'co-buyer') => {
        const data = {
            snapId: id,
            email: email,
            status: "pending",
            accountType: type === 'agent' ? 'agent' : type
        }
        createParticipents.mutateAsync(data, {
            onSuccess: (response: any) => {
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

    const handleUpdateSnap = (name: string) => {
        updateSnap.mutateAsync({ id: id, name }, {
            onSuccess: (response: any) => {
                success({ message: "Snapz has been successfully renamed!" })
                setSnap((prev) => prev ? { ...prev, name } : null);
                fetchSnapDetails(); // Refresh
            }
        })
    }

    const handleDeleteCollection = () => {
        deleteSnap.mutateAsync(id, {
            onSuccess: (response: any) => {
                success({ message: "Snapz has been successfully deleted!" })
                router.push('/account');
            }
        })
    }

    const handleBatchInvite = async (users: any[]) => {
        if (!users.length) return;

        try {
            const promises = users.map(user => {
                // Logic: Use existing accountType (e.g. 'buyer', 'agent'). Default to 'agent' for External Agents.
                // Normalize to lowercase to match backend values (e.g. 'BUYER' -> 'buyer')
                const rawAccountType = user.accountType || 'agent';
                const accountTypeToSend = rawAccountType.toLowerCase();

                const data = {
                    snapId: id,
                    email: user.email,
                    status: "pending",
                    accountType: accountTypeToSend
                };
                return createParticipents.mutateAsync(data).then(res => {
                    // Check backend success flag (it returns { success: "true"/"false", message: "..." })
                    const isSuccess = res?.data?.createSnapsParticipant?.success === true || res?.data?.createSnapsParticipant?.success === "true";
                    return { success: isSuccess, email: user.email, message: res?.data?.createSnapsParticipant?.message };
                }).catch(err => {
                    return { success: false, email: user.email, message: err.message };
                });
            });

            const results = await Promise.all(promises);
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            if (successful.length > 0) {
                success({ message: `Successfully sent ${successful.length} invite(s)!` });
            }

            if (failed.length > 0) {
                // Log failed ones and potentially show error
                console.error("Failed invites:", failed);
                error({ message: `Failed to send ${failed.length} invite(s). ${failed[0]?.message || ''}` });
            }

            if (successful.length > 0) {
                setIsModalOpen("");
            }
        } catch (err: any) {
            console.error(err);
            error({ message: "An unexpected error occurred while sending invites." });
        }
    };

    if (!snap) return <div className="p-10">Loading Snap Details...</div>;

    return (
        <main className='mx-auto flex min-h-[90vh] flex-col bg-[#F4F9F5] px-12 pb-10'>
            <div className="flex justify-between items-center py-4 bg-transparent">
                <div className='flex flex-col items-start gap-4'>
                    <div className='flex flex-col gap-1'>
                        <h1 className="text-3xl font-bold">{snap.name}</h1>
                        <span className="text-md text-gray-500">{favourites?.length || "0"} Results Found</span>
                    </div>
                    <Button
                        size="sm"
                        className="border-2 bg-transparent text-gray-600 hover:bg-gray-400 rounded-full px-4 h-8 text-xs font-medium flex items-center gap-2 w-fit"
                        onClick={() => router.push('/account')}
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                    </Button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 p-0">
                            <span className="sr-only">Open menu</span>
                            <EllipsisIcon className="h-8 w-8" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => setIsCollaborateModalOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Invite to collaborate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/home')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Add to this Snapz</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSendInvitation}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share snapz link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsModalOpen("rename")}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            <span>Rename snapz</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setIsDeleteModalOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete snapz</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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

                            return (
                                <div key={safeProperty.id} className="flex flex-col">
                                    <FavouritePropertyCards
                                        {...safeProperty}
                                        snapId={id}
                                        isWishlisted={true}
                                        userSnapRole={userSnapRole}
                                        onCommentAdded={() => setCommentRefreshTrigger(prev => prev + 1)}
                                        onRead={fetchSnapProperties}
                                    />
                                    <PropertyRecommendations
                                        listingId={safeProperty.listingId}
                                        propertyId={safeProperty.propertyId}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <ScrollBar orientation='vertical' className='h-full' />
                </ScrollArea>

                <div className="w-[320px] xl:w-[380px] flex-shrink-0">
                    <RecentCommentsSidebar
                        properties={favourites}
                        refreshTrigger={commentRefreshTrigger}
                        onNewComment={fetchSnapProperties}
                    />
                </div>
            </div>

            <CollaborateModal
                isOpen={isCollaborateModalOpen}
                onClose={() => setIsCollaborateModalOpen(false)}
                onSend={inviteCollaborator}
            />
            <RenameCollectionModal
                isOpen={isModalOpen === "rename"}
                onClose={() => setIsModalOpen("")}
                onRename={handleUpdateSnap}
                currentName={snap.name}
            />
            <DeleteCollectionConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCollection}
            />
            <SendSnapLinkModal
                isOpen={isModalOpen === "share"}
                onClose={() => setIsModalOpen("")}
                users={inviteUsers}
                currentPage={invitePage}
                totalPages={inviteTotalPages}
                onPageChange={handlePageChange}
                onSend={handleBatchInvite}
            />
        </main>
    );
}
