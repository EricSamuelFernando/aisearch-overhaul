import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2, MessageCircle } from 'lucide-react';
import RecentCommentsModal from '@/components/modals/recent-comments-modal';
import { SocketContext } from '@/providers/socket.context';
import { getAuthToken } from '@/lib/storage';

interface Comment {
    id: string;
    text: string;
    userName: string;
    propertyName: string;
    propertyId: string;
    createdAt: string;
}

const RecentCommentsSidebar = ({ properties = [], refreshTrigger = 0 }: { properties?: any[], refreshTrigger?: number }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAppModalOpen, setAppModalOpen] = useState(false);
    const { socket } = useContext(SocketContext);

    const fetchRecentComments = async () => {
        setLoading(true);
        try {
            const token = getAuthToken() || localStorage.getItem('__WEB_APP_Ocreal345####btny_ocreal');
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

            const response = await axios.post(
                GRAPHQL_URI,
                {
                    query,
                    variables: { limit: 5 },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    const getPropertyName = (comment: Comment) => {
        if (comment.propertyName) return comment.propertyName;
        const found = properties.find((p: any) =>
            (p.listingId && p.listingId === comment.propertyId) ||
            (p.id && p.id === comment.propertyId)
        );
        return found ? found.name : 'Property view';
    };

    useEffect(() => {
        fetchRecentComments(); // Initial fetch

        if (socket) {
            const handleNewActivity = (data: any) => {
                console.log('New activity received via socket:', data);
                fetchRecentComments();
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
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{comments.length} new</span>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-ocOrange" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No recent comments.</p>
                ) : (
                    comments.map((comment) => {
                        const name = getPropertyName(comment);
                        const showName = name && name !== 'Property view';
                        return (
                            <div key={comment.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                {/* Property Name - Only show if known */}
                                {showName && (
                                    <p className="text-xs font-semibold text-ocOrange mb-1 truncate">
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
