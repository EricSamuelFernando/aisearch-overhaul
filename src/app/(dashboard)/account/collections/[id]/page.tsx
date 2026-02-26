'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ComparisonTable from '@/components/dashboard/main/comparison-table';
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
    Columns2,
    X,
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
// import PropertyRecommendations from '@/components/dashboard/main/property-recommendations'; // replaced by SnapzAIAssistant
import SnapzAIAssistant from '@/components/dashboard/main/snapz-ai-assistant';
import SnapzAIReel from '@/components/dashboard/main/snapz-ai-reel';

interface SnapCollection {
    id: string;
    name: string;
    image?: string;
}

export default function SnapDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const userData = useSelector((state: any) => state.auth.user);
    const fromBuyerDashboard = searchParams?.get('from') === 'buyer-dashboard';
    const backTarget = fromBuyerDashboard ? '/dashboard/buyer?tab=my-snapz' : '/account';

    const [snap, setSnap] = useState<SnapCollection | null>(null);
    const [favourites, setFavourites] = useState<any[]>([]);
    const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0);
    const [userSnapRole, setUserSnapRole] = useState<string>('buyer');

    // Compare mode state
    const [compareMode, setCompareMode] = useState(false);
    const [compareSlots, setCompareSlots] = useState<Array<string | null>>([null, null, null, null]);
    const [activeCompareSlot, setActiveCompareSlot] = useState(0);
    const [recentlyFilledSlot, setRecentlyFilledSlot] = useState<number | null>(null);
    const comparisonRef = useRef<HTMLDivElement>(null);
    const propertyGridRef = useRef<HTMLDivElement>(null);
    const fillAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reelSectionRef = useRef<HTMLDivElement>(null);

    // AI reel recommendations
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

    const getScrollableAncestor = useCallback((node: HTMLElement | null): HTMLElement | null => {
        let current = node?.parentElement || null;
        while (current) {
            const style = window.getComputedStyle(current);
            const overflowY = style.overflowY;
            const isScrollable = /(auto|scroll|overlay)/.test(overflowY);
            if (isScrollable && current.scrollHeight > current.clientHeight + 2) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }, []);

    const smoothScrollToTarget = useCallback((target: HTMLElement | null, offset: number) => {
        if (!target) return;

        const container = getScrollableAncestor(target);

        if (container) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - offset;
            container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });

            window.setTimeout(() => {
                const latestRect = target.getBoundingClientRect();
                const correctedTop = container.scrollTop + (latestRect.top - containerRect.top) - offset;
                container.scrollTo({ top: Math.max(0, correctedTop), behavior: 'smooth' });
            }, 220);
            return;
        }

        const absoluteTop = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
        window.setTimeout(() => {
            const corrected = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: Math.max(0, corrected), behavior: 'smooth' });
        }, 220);
    }, [getScrollableAncestor]);

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

    const inviteCollaborator = (email: string, type: 'agent' | 'co-buyer' | 'other') => {
        const data = {
            snapId: id,
            email: email,
            status: "pending",
            accountType: type === 'agent' ? 'agent' : type === 'other' ? 'other' : 'buyer'
        }
        createParticipents.mutateAsync(data, {
            onSuccess: (response: any) => {
                const successValue = response?.data?.createSnapsParticipant?.success;
                if (successValue === true || successValue === "true") {
                    success({ message: `Great! Your ${type === 'agent' ? 'agent' : type === 'other' ? 'collaboration' : 'co-buyer'} invite is on its way` })
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
                router.push(backTarget);
            }
        })
    }

    const handleBatchInvite = async (users: any[]) => {
        if (!users.length) return;

        try {
            const promises = users.map(user => {
                // Logic: Use existing accountType (e.g. 'buyer', 'agent'). Default to 'agent' for External Agents.
                // Normalize to lowercase to match backend values (e.g. 'BUYER' -> 'buyer')
                const rawAccountType = (user.accountType || 'agent').toLowerCase();
                const accountTypeToSend =
                    rawAccountType === 'buyer'
                        ? 'buyer'
                        : rawAccountType === 'seller'
                            ? 'other'
                            : 'agent';

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

    const handleToggleCompareMode = () => {
        if (compareMode) {
            setCompareMode(false);
            setCompareSlots([null, null, null, null]);
            setActiveCompareSlot(0);
            setRecentlyFilledSlot(null);
        } else {
            setCompareMode(true);
            setCompareSlots([null, null, null, null]);
            setActiveCompareSlot(0);
            setRecentlyFilledSlot(null);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    smoothScrollToTarget(comparisonRef.current, 88);
                });
            });
        }
    };

    const getPropertyKey = (property: any) => property?.listingId || property?.id;

    const scrollToPropertySelection = () => {
        smoothScrollToTarget(propertyGridRef.current, 96);
    };

    const handleFocusCompareSlot = (slotIndex: number) => {
        setActiveCompareSlot(slotIndex);
        scrollToPropertySelection();
    };

    const handleSelectForCompare = (propertyId: string) => {
        setCompareSlots(prev => {
            const next = [...prev];
            const existingIndex = next.findIndex(id => id === propertyId);
            const targetIndex = activeCompareSlot;

            if (existingIndex !== -1) {
                next[existingIndex] = null;
                setRecentlyFilledSlot(null);
                setActiveCompareSlot(existingIndex);
                return next;
            }

            next[targetIndex] = propertyId;
            setRecentlyFilledSlot(targetIndex);
            if (fillAnimationTimeoutRef.current) {
                clearTimeout(fillAnimationTimeoutRef.current);
            }
            fillAnimationTimeoutRef.current = setTimeout(() => {
                setRecentlyFilledSlot(null);
            }, 280);

            const nextEmpty = next.findIndex(slot => !slot);
            setActiveCompareSlot(nextEmpty === -1 ? targetIndex : nextEmpty);
            return next;
        });
    };

    const handleRemoveCompareSlot = (slotIndex: number) => {
        setCompareSlots(prev => {
            const next = [...prev];
            next[slotIndex] = null;
            return next;
        });
        setRecentlyFilledSlot(null);
        setActiveCompareSlot(slotIndex);
    };

    const handleExitComparison = () => {
        setCompareMode(false);
        setCompareSlots([null, null, null, null]);
        setActiveCompareSlot(0);
        setRecentlyFilledSlot(null);
    };

    useEffect(() => {
        return () => {
            if (fillAnimationTimeoutRef.current) {
                clearTimeout(fillAnimationTimeoutRef.current);
            }
        };
    }, []);

    const handleRecommendationsReady = useCallback((props: any[]) => {
        setAiRecommendations(props);
    }, []);

    // Auto-scroll to reel section when recommendations first arrive
    useEffect(() => {
        if (aiRecommendations.length > 0 && reelSectionRef.current) {
            const timer = setTimeout(() => {
                smoothScrollToTarget(reelSectionRef.current, 80);
            }, 150);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiRecommendations.length]);

    const compareSlotProperties = useMemo(
        () =>
            compareSlots.map(slotId => {
                if (!slotId) return null;
                return favourites.find(property => getPropertyKey(property) === slotId) || null;
            }),
        [compareSlots, favourites]
    );

    const selectedCount = compareSlots.filter(Boolean).length;
    const previousSelectedCountRef = useRef(0);

    useEffect(() => {
        if (!compareMode) {
            previousSelectedCountRef.current = selectedCount;
            return;
        }

        const becameFull = previousSelectedCountRef.current < 4 && selectedCount === 4;
        if (becameFull) {
            window.setTimeout(() => {
                smoothScrollToTarget(comparisonRef.current, 88);
            }, 160);
        }

        previousSelectedCountRef.current = selectedCount;
    }, [compareMode, selectedCount, smoothScrollToTarget]);

    if (!snap) return <div className="p-10">Loading Snap Details...</div>;

    return (
        <main className='mx-auto flex min-h-[90vh] flex-col bg-[#F4F9F5] px-2 sm:px-6 md:px-8 lg:px-12 pb-10'>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 bg-transparent gap-4">
                <div className='flex flex-col items-start gap-3 sm:gap-4 w-full sm:w-auto'>
                    <div className='flex flex-col gap-1'>
                        <h1 className="text-2xl sm:text-3xl font-bold break-words">{snap.name}</h1>
                        <span className="text-sm sm:text-md text-gray-500">{favourites?.length || "0"} Results Found</span>
                    </div>
                    <Button
                        size="sm"
                        className="border-2 bg-transparent text-gray-600 hover:bg-gray-400 rounded-full px-4 h-8 text-xs font-medium flex items-center gap-2 w-fit"
                        onClick={() => router.push(backTarget)}
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                    </Button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {favourites.length >= 2 && (
                        <Button
                            size="sm"
                            className={`flex items-center gap-2 rounded-full px-5 h-10 text-sm font-semibold transition-all shadow-sm ${compareMode
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                            onClick={handleToggleCompareMode}
                        >
                            {compareMode ? (
                                <>
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Columns2 className="w-3.5 h-3.5" />
                                    Compare
                                </>
                            )}
                        </Button>
                    )}
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
            </div>

            {/* Compare mode instruction banner */}
            {compareMode && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-2.5 text-sm text-orange-700 font-medium">
                    <Columns2 className="w-4 h-4 flex-shrink-0" />
                    Pick a slot below, then tap a property card to fill it
                    <span className="ml-auto text-xs font-normal text-orange-500">{selectedCount} / 4 selected</span>
                </div>
            )}

            <div className={`flex gap-4 lg:gap-6 items-start w-full ${compareMode ? 'flex-col' : 'flex-col lg:flex-row min-h-[60vh] lg:h-[70vh]'}`}>
                <ScrollArea className={`flex-1 w-full ${compareMode ? 'h-auto' : 'h-[50vh] lg:h-full'} overflow-y-auto`}>
                    <div ref={propertyGridRef} className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full'>
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
                            const propKey = safeProperty.listingId || safeProperty.id;
                            return <div key={safeProperty.id} className="flex flex-col">
                                <FavouritePropertyCards
                                    key={safeProperty.id}
                                    {...safeProperty}
                                    snapId={id}
                                    isWishlisted={true}
                                    userSnapRole={userSnapRole}
                                    onCommentAdded={() => setCommentRefreshTrigger(prev => prev + 1)}
                                    onRead={fetchSnapProperties}
                                    compareMode={compareMode}
                                    isSelected={compareSlots.includes(propKey)}
                                    isDisabled={false}
                                    onSelect={handleSelectForCompare}
                                />
                                {/* SnapzAI: per-card recommendations removed — personalised panel is now in the right sidebar
                                {!compareMode && (
                                    <PropertyRecommendations
                                        listingId={safeProperty.listingId}
                                        propertyId={safeProperty.propertyId}
                                    />
                                )}
                                */}
                            </div>
                        })}
                    </div>
                    <ScrollBar orientation='vertical' className='h-full' />
                </ScrollArea>

                {!compareMode && (
                    <div className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0 flex flex-col gap-3 lg:h-[70vh]">
                        {/* Recent Activity — top 45% */}
                        <div className="flex-[0_0_45%] min-h-0 flex flex-col">
                            <RecentCommentsSidebar
                                properties={favourites}
                                snapId={id}
                                refreshTrigger={commentRefreshTrigger}
                                onNewComment={fetchSnapProperties}
                            />
                        </div>
                        {/* Snapz AI — bottom 55% */}
                        <div className="flex-[0_0_55%] min-h-0">
                            <SnapzAIAssistant
                                key={id}
                                snapProperties={favourites}
                                snapId={id}
                                onPropertyAdded={fetchSnapProperties}
                                onRecommendationsReady={handleRecommendationsReady}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── AI Picks Reel (Option C: full-width section below snap grid) ── */}
            {!compareMode && aiRecommendations.length > 0 && (
                <div ref={reelSectionRef} className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-2">
                            <span className="text-ocOrange font-bold text-[15px]">✦</span>
                            <h2 className="text-[17px] font-bold text-gray-900">AI Picks for you</h2>
                        </div>
                        <span className="text-[12px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                            {aiRecommendations.length} homes
                        </span>
                        <span className="text-[12px] text-gray-400 hidden sm:inline">· based on your answers</span>
                        <button
                            onClick={() => setAiRecommendations([])}
                            className="ml-auto flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" /> Dismiss
                        </button>
                    </div>

                    {/* Horizontal reel */}
                    <SnapzAIReel
                        properties={aiRecommendations}
                        snapId={id}
                        onPropertyAdded={fetchSnapProperties}
                    />
                </div>
            )}

            {/* Comparison Table */}
            {compareMode && (
                <div ref={comparisonRef}>
                    <ComparisonTable
                        slotProperties={compareSlotProperties}
                        activeSlotIndex={activeCompareSlot}
                        recentlyFilledSlotIndex={recentlyFilledSlot}
                        onSelectSlot={handleFocusCompareSlot}
                        onRemoveFromSlot={handleRemoveCompareSlot}
                        onClose={handleExitComparison}
                    />
                </div>
            )}
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

