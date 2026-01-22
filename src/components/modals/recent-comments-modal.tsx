import React, { useEffect, useState } from 'react';
import CustomModal from '@/components/custom-modal';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { getAuthToken } from '@/lib/storage';

interface Comment {
    id: string;
    text: string;
    userName: string;
    propertyName: string;
    propertyId?: string; // Add propertyId
    createdAt: string;
}

interface RecentCommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties?: any[]; // Accept properties list
}

const RecentCommentsModal: React.FC<RecentCommentsModalProps> = ({ isOpen, onClose, properties = [] }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAllRecentComments = async () => {
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
                    variables: { limit: 100 },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (response.data.errors) {
                throw new Error(response.data.errors[0]?.message || 'Failed to fetch comments');
            }

            setComments(response.data.data.recentComments || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
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
        if (isOpen) {
            fetchAllRecentComments();
        }
    }, [isOpen]);

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            className="z-[9999]"
            contentClassName="max-w-xl w-full rounded-2xl p-0 overflow-hidden"
        >
            <div className="flex flex-col h-[700px] bg-white">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">All Recent Activity</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-ocOrange" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">No activity yet.</p>
                    ) : (
                        comments.map((comment) => {
                            const name = getPropertyName(comment);
                            const showName = name && name !== 'Property view';

                            return (
                                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    {/* Property Name - Matches Sidebar Style */}
                                    {showName && (
                                        <p className="text-sm font-semibold text-ocOrange mb-2">
                                            {name}
                                        </p>
                                    )}

                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm">{comment.userName}</span>
                                                    <span className="text-[11px] text-gray-400">• {format(new Date(comment.createdAt), 'MMM d, yyyy, h:mm a')}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed break-all whitespace-pre-wrap">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </CustomModal>
    );
};

export default RecentCommentsModal;
