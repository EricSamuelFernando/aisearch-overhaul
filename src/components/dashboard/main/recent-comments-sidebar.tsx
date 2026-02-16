import React, { useEffect, useState, useContext } from 'react';
import API from '@/lib/api/axios';
import { format } from 'date-fns';
import { Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import RecentCommentsModal from '@/components/modals/recent-comments-modal';
import { SocketContext } from '@/providers/socket.context';
import { getStateFromZip } from '@/utils/addressParser';

interface Comment {
    id: string;
    text: string;
    userName: string;
    propertyName: string;
    propertyId: string;
    createdAt: string;
}

const normalizeId = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
};

const normalizeNumericId = (value: unknown): string => {
    const raw = normalizeId(value).replace(/\.0+$/, '');
    if (!/^\d+$/.test(raw)) return '';
    return String(Number(raw));
};

const idsMatch = (a: unknown, b: unknown): boolean => {
    const left = normalizeId(a);
    const right = normalizeId(b);
    if (!left || !right) return false;
    if (left === right) return true;

    const leftNum = normalizeNumericId(left);
    const rightNum = normalizeNumericId(right);
    return Boolean(leftNum && rightNum && leftNum === rightNum);
};

const looksLikeAddress = (value: string): boolean => {
    if (!value) return false;
    return /\d/.test(value) || /,\s*[A-Za-z]{2}\b/.test(value);
};

const buildFullAddress = (property: any): string => {
    const street =
        property?.address ||
        property?.propertyAddress ||
        property?.propertyAddressDetails?.formattedAddress ||
        property?.public?.address?.unparsedAddress ||
        property?.public?.address?.label ||
        property?.listing?.address?.unparsedAddress;

    const city =
        property?.city ||
        property?.propertyAddressDetails?.city ||
        property?.public?.address?.city ||
        property?.listing?.address?.city;

    const zipCode =
        property?.zipCode ||
        property?.postalCode ||
        property?.propertyAddressDetails?.postalCode ||
        property?.public?.address?.zipCode ||
        property?.listing?.address?.zipCode;

    const state =
        property?.state ||
        property?.propertyAddressDetails?.state ||
        property?.propertyAddressDetails?.province ||
        getStateFromZip(zipCode);

    const cityState = [city, state].filter(Boolean).join(', ');
    const line2 = [cityState, zipCode].filter(Boolean).join(' ');

    if (street && line2) return `${street}, ${line2}`;
    return street || line2 || '';
};

const RecentCommentsSidebar = ({ properties = [], refreshTrigger = 0, onNewComment }: { properties?: any[], refreshTrigger?: number, onNewComment?: () => void }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAppModalOpen, setAppModalOpen] = useState(false);
    const { socket } = useContext(SocketContext);

    const fetchRecentComments = async () => {
        setLoading(true);
        try {
            const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/auth/graphql';

            const query = `
                query RecentComments($limit: Int) {
                    recentComments(limit: $limit) {
                        id
                        propertyId
                        text
                        userName
                        snapId
                        propertyName
                        createdAt
                    }
                }
            `;

            const response = await API.post(
                GRAPHQL_URI,
                {
                    query,
                    variables: { limit: 5 },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.errors) {
                throw new Error(response.data.errors[0]?.message || 'Failed to fetch recent comments');
            }

            setComments(response.data.data.recentComments || []);
        } catch (error) {
            console.error('Failed to fetch recent comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPropertyAddress = (comment: Comment) => {
        const found = properties.find((p: any) =>
            [p?.propertyId, p?.listingId, p?.id].some((id) => idsMatch(id, comment.propertyId))
        );

        if (found) {
            const fullAddress = buildFullAddress(found);
            if (fullAddress) return fullAddress;
        }

        // Snap detail pages often show one property; use it as deterministic fallback.
        if (properties.length === 1) {
            const singleAddress = buildFullAddress(properties[0]);
            if (singleAddress) return singleAddress;
        }

        const propertyName = (comment.propertyName || '').trim();
        return looksLikeAddress(propertyName) ? propertyName : 'Property view';
    };

    useEffect(() => {
        fetchRecentComments(); // Initial fetch

        if (socket) {
            const handleNewActivity = (comment: Comment) => {
                console.log('[RecentComments] New activity received via socket:', comment);

                // Notify parent to refresh unread counts
                if (typeof onNewComment === 'function') {
                    console.log('[RecentComments] Triggering parent onNewComment refresh');
                    onNewComment();
                } else {
                    console.warn('[RecentComments] onNewComment callback is missing');
                }

                // Add comment directly to state instead of refetching
                setComments((prev) => {
                    // Prevent duplicates
                    if (prev.some(c => c.id === comment.id)) {
                        console.log('[RecentComments] Duplicate comment, skipping');
                        return prev;
                    }

                    // Add new comment and keep only latest 5
                    console.log('[RecentComments] Adding new comment to recent activity');
                    return [comment, ...prev].slice(0, 5);
                });
            };

            socket.on('recent_activity_update', handleNewActivity);

            return () => {
                socket.off('recent_activity_update', handleNewActivity);
            };
        }
    }, [refreshTrigger, socket]);

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{comments.length} new</span>
                    <button
                        onClick={() => fetchRecentComments()}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh comments"
                    >
                        <RefreshCw className={`w-3 h-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                {loading && comments.length === 0 ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-ocOrange" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No recent comments.</p>
                ) : (
                    comments.map((comment) => {
                        const name = getPropertyAddress(comment);
                        const showName = name && name !== 'Property view';
                        return (
                            <div key={comment.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                {/* Property Name - Only show if known */}
                                {showName && (
                                    <p className="text-xs font-semibold text-ocOrange mb-1 break-words">
                                        {name}
                                    </p>
                                )}

                                {/* User Info & Time */}
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                        {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="text-xs font-medium text-gray-900 truncate max-w-[100px]">{comment.userName}</span>
                                    <span className="text-[10px] text-gray-400">• {format(new Date(comment.createdAt), 'MMM d, yyyy, h:mm a')}</span>
                                </div>

                                {/* Comment Text */}
                                <p className="text-sm text-gray-600 pl-8 break-all whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                            </div>
                        );
                    })
                )}

                <button
                    onClick={() => setAppModalOpen(true)}
                    className="w-full mt-4 text-xs font-medium text-gray-500 hover:text-ocOrange transition-colors flex items-center justify-center gap-1 py-2 border-t border-gray-100"
                >
                    Load more references <MessageCircle className="w-3 h-3" />
                </button>
            </div>

            <RecentCommentsModal
                isOpen={isAppModalOpen}
                onClose={() => setAppModalOpen(false)}
                properties={properties}
            />
        </div>
    );
};

export default RecentCommentsSidebar;

