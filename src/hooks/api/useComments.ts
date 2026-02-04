import { useState, useEffect, useContext } from 'react';
import API from '@/lib/api/axios';
import { SocketContext } from '@/providers/socket.context';
import { getAuthToken } from '@/lib/storage';

// interface for Comment
export interface Comment {
    id: string;
    propertyId: string;
    text: string;
    userName: string;
    accountType?: string; // 'buyer' or 'agent'
    createdAt: string;
    snapId?: string;
    propertyName?: string;
}

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/auth/graphql';

export const useComments = (propertyId: string, snapId?: string) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useContext(SocketContext);

    console.log('[useComments] Render. Socket exists:', !!socket, 'Connected:', socket?.connected, 'SnapId:', snapId);

    const fetchComments = async () => {
        if (!propertyId) return;
        setLoading(true);
        try {
            const query = `
                query CommentsByProperty($propertyId: String!, $snapId: String) {
                    commentsByProperty(propertyId: $propertyId, snapId: $snapId) {
                        id
                        propertyId
                        text
                        userName
                        accountType
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
                    variables: {
                        propertyId,
                        snapId: snapId || null,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.errors) {
                throw new Error(response.data.errors[0]?.message || 'Failed to fetch comments');
            }

            setComments(response.data.data.commentsByProperty || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const addComment = async (text: string, userName: string, propertyName?: string, accountType?: string) => {
        if (!text.trim()) return;

        console.log('[useComments] Adding comment via GraphQL:', { text, userName, propertyName, accountType, snapId, socketConnected: socket?.connected, socketId: socket?.id });

        try {
            const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('__WEB_APP_Ocreal345####btny_ocreal') : null);

            const mutation = `
                mutation CreateComment($createCommentInput: CreateCommentDto!) {
                    createComment(createCommentInput: $createCommentInput) {
                        id
                        propertyId
                        text
                        userName
                        accountType
                        snapId
                        propertyName
                        createdAt
                    }
                }
            `;

            const response = await API.post(
                GRAPHQL_URI,
                {
                    query: mutation,
                    variables: {
                        createCommentInput: {
                            propertyId,
                            snapId: snapId || null,
                            text,
                            userName,
                            accountType: accountType || 'buyer', // Default to 'buyer' if not provided
                            propertyName: propertyName || null,
                        },
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.errors) {
                throw new Error(response.data.errors[0]?.message || 'Failed to create comment');
            }

            // Optimistic update with duplicate prevention
            const newComment = response.data.data.createComment;
            setComments((prev) => {
                // Prevent duplicates by checking ID
                if (prev.some(c => c.id === newComment.id)) {
                    console.log('[useComments] Comment already exists (from WebSocket), skipping optimistic update');
                    return prev;
                }
                return [newComment, ...prev];
            });
        } catch (err: any) {
            console.error('[useComments] Error adding comment via GraphQL:', err);
            setError(err?.response?.data?.errors?.[0]?.message || 'Failed to add comment');
        }
    };

    useEffect(() => {
        fetchComments();

        if (socket && propertyId) {
            // Join room by snapId if available, otherwise by propertyId
            const room = snapId || `property:${propertyId}`;

            console.log(`[useComments] Joining room: ${room}`);
            socket.emit('joinRoom', { roomId: room }); // Send as object

            // Listen for incoming comments
            const handleNewComment = (newComment: Comment & { snapId?: string }) => {
                console.log('[useComments] Received new_comment event:', newComment);

                // Filter by propertyId
                if (newComment.propertyId !== propertyId) {
                    console.log('[useComments] Ignoring comment for different property');
                    return;
                }

                // If we're in a specific snap context, filter by snapId
                if (snapId && newComment.snapId && newComment.snapId !== snapId) {
                    console.log('[useComments] Ignoring comment from different snap');
                    return;
                }

                // Add comment to state with duplicate prevention
                setComments((prev) => {
                    // Prevent duplicates by checking ID
                    if (prev.some(c => c.id === newComment.id)) {
                        console.log('[useComments] Duplicate comment, skipping');
                        return prev;
                    }
                    console.log('[useComments] Adding new comment to state');
                    return [newComment, ...prev];
                });
            };

            const handleConnect = () => {
                console.log('[useComments] Socket reconnected/connected. Re-joining room.');
                socket.emit('joinRoom', { roomId: room }); // Send as object
            };

            socket.on('new_comment', handleNewComment);
            socket.on('recent_activity_update', handleNewComment); // Also listen to global updates
            socket.on('connect', handleConnect);

            return () => {
                console.log(`[useComments] Leaving room: ${room}`);
                socket.emit('leaveRoom', { roomId: room }); // Send as object
                socket.off('new_comment', handleNewComment);
                socket.off('recent_activity_update', handleNewComment);
                socket.off('connect', handleConnect);
            };
        }
    }, [propertyId, snapId, socket]);

    return {
        comments,
        loading,
        error,
        addComment,
        refetch: fetchComments,
    };
};
