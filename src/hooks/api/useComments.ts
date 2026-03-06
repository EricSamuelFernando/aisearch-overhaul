import { useState, useEffect, useContext } from 'react';
import API from '@/lib/api/axios';
import { SocketContext } from '@/providers/socket.context';
import { getAuthToken } from '@/lib/storage';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';

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
    userId?: string;
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

    const user = useSelector(userData);
    const userId = user?.id;

    const addComment = async (text: string, userName: string, propertyName?: string, accountType?: string) => {
        if (!text.trim()) return;

        console.log('[useComments] Adding comment via GraphQL:', { text, userName, propertyName, accountType, snapId, userId });

        try {
            // Save comment via GraphQL mutation (persists to local DB)
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
                            accountType: accountType || 'buyer',
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

            const savedComment = response.data.data.createComment;
            console.log('[useComments] Comment saved via GraphQL:', savedComment.id);

            // Update local state with the real saved comment
            setComments((prev) => [savedComment, ...prev]);

            // Also emit via WebSocket for real-time broadcast to other users
            // Pass the full saved comment so recipients have all fields (including createdAt)
            if (socket && socket.connected) {
                socket.emit('addComment', {
                    id: savedComment.id,
                    propertyId,
                    snapId: snapId || null,
                    text,
                    userId,
                    userName,
                    accountType: accountType || 'buyer',
                    propertyName: propertyName || null,
                    createdAt: savedComment.createdAt || new Date().toISOString(),
                    broadcastOnly: true,
                });
            }
        } catch (err) {
            console.error('[useComments] Error adding comment:', err);
            setError('Failed to save comment');
        }
    };

    useEffect(() => {
        fetchComments();

        if (socket && propertyId) {
            // Join room by snapId if available, otherwise by propertyId
            // Backend broadcasts to 'snap-${snapId}' or 'property-${propertyId}'
            const room = snapId ? `snap-${snapId}` : `property-${propertyId}`;

            console.log(`[useComments] Joining room: ${room}`);
            socket.emit('joinRoom', { roomId: room }); // Send as object

            // Listen for incoming comments
            const handleNewComment = (newComment: Comment & { snapId?: string; tempId?: string }) => {
                console.log('[useComments] Received new_comment event:', newComment);

                // If we're in a specific snap context, prioritise snapId match
                const isSameSnap = snapId && newComment.snapId && newComment.snapId === snapId;
                const isSameProperty = newComment.propertyId === propertyId;

                // If neither snap nor property matches, ignore
                if (!isSameSnap && !isSameProperty) {
                    return;
                }

                setComments((prev) => {
                    // 1. Check if we already have this EXACT comment ID (real duplicate from network)
                    if (prev.some(c => c.id === newComment.id)) {
                        console.log('[useComments] Duplicate comment ID, skipping:', newComment.id);
                        return prev;
                    }

                    // 2. Check if we already have a comment with same text + userId (GraphQL-saved + WebSocket echo)
                    const alreadyExists = prev.some(c =>
                        c.text === newComment.text &&
                        c.userId === newComment.userId
                    );

                    if (alreadyExists) {
                        console.log('[useComments] Duplicate comment (same text+user), skipping');
                        return prev;
                    }

                    console.log('[useComments] Adding new verified comment to state');
                    return [newComment, ...prev];
                });
            };

            const handleActivityUpdate = (data: any) => {
                console.log('[useComments] Received recent_activity_update:', data);
                if (data.action === 'comment_added' && data.snapId === snapId) {
                    console.log('[useComments] New comment in current snap, refetching...');
                    fetchComments();
                }
            };

            const handleConnect = () => {
                console.log('[useComments] Socket reconnected/connected. Re-joining room.');
                socket.emit('joinRoom', { roomId: room }); // Send as object
            };

            socket.on('new_comment', handleNewComment);
            socket.on('recent_activity_update', handleActivityUpdate);
            socket.on('connect', handleConnect);

            return () => {
                console.log(`[useComments] Leaving room: ${room}`);
                socket.emit('leaveRoom', { roomId: room }); // Send as object
                socket.off('new_comment', handleNewComment);
                socket.off('recent_activity_update', handleActivityUpdate);
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