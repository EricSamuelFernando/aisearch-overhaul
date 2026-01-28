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

    const addComment = async (text: string, userName: string, propertyName?: string) => {
        if (!text.trim()) return;

        console.log('[useComments] Adding comment via GraphQL:', { text, userName, propertyName, snapId, socketConnected: socket?.connected, socketId: socket?.id });

        try {
            const token = getAuthToken() || (typeof window !== 'undefined' ? localStorage.getItem('__WEB_APP_Ocreal345####btny_ocreal') : null);

            const mutation = `
                mutation CreateComment($createCommentInput: CreateCommentDto!) {
                    createComment(createCommentInput: $createCommentInput) {
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
                    query: mutation,
                    variables: {
                        createCommentInput: {
                            propertyId,
                            snapId: snapId || null,
                            text,
                            userName,
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

            // Optimistic update
            setComments((prev) => [response.data.data.createComment, ...prev]);
        } catch (err: any) {
            console.error('[useComments] Error adding comment via GraphQL:', err);
            setError(err?.response?.data?.errors?.[0]?.message || 'Failed to add comment');
        }
    };

    useEffect(() => {
        fetchComments();

        if (socket && propertyId) {
            // Join the property room to receive updates
            // Ideally we should also scope rooms by snapId, but for now propertyId room is fine 
            // as long as the client filters incoming events or we change room name to `propertyId:snapId`
            const joinRoom = () => {
                console.log(`[useComments] Joining room: ${propertyId}`);
                socket.emit('joinRoom', propertyId);
            };

            if (socket.connected) {
                joinRoom();
            } else {
                console.log('[useComments] Socket not connected yet, waiting for connect event');
            }

            // Listen for incoming comments
            const handleNewComment = (newComment: Comment & { snapId?: string }) => {
                console.log('[useComments] Received new_comment event:', newComment);
                if (newComment.propertyId === propertyId) {
                    // Filter by snapId if we are in a specific snap context
                    if (snapId && newComment.snapId && newComment.snapId !== snapId) {
                        return; // Ignore comments from other snaps
                    }
                    setComments((prev) => [newComment, ...prev]);
                }
            };

            const handleConnect = () => {
                console.log('[useComments] Socket reconnected/connected. Re-joining room.');
                joinRoom();
            };

            socket.on('new_comment', handleNewComment);
            socket.on('connect', handleConnect);

            return () => {
                socket.emit('leaveRoom', propertyId);
                socket.off('new_comment', handleNewComment);
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
