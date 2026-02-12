import React, { useState } from 'react';
import CustomModal from '@/components/custom-modal';
import NImage from 'next/image';
import { useComments } from '@/hooks/api/useComments';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/lib/hook';
import { userData } from '@/slices/auth/auth.slice';

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: any;
    snapId?: string; // Add snapId prop
    onCommentAdded?: () => void;
    userSnapRole?: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, property, snapId, onCommentAdded, userSnapRole }) => {
    const listingId = property?.listingId || property?.property?.listingId || property?.listingid;
    const getDisplayAddress = () => {
        const details = property?.propertyAddressDetails;

        let street = property?.address;
        if (details?.formattedAddress) {
            street = details.formattedAddress;
        } else if (details?.streetNumber && details?.streetName) {
            street = `${details.streetNumber} ${details.streetName}`;
        }

        let city = details?.city || property?.city;
        let state = details?.state || details?.province || property?.state;
        let zip = details?.postalCode || property?.zipCode || property?.postalCode;

        // Clean up strings
        const parts = [
            street,
            [city, state].filter(Boolean).join(', '),
            zip
        ].filter(Boolean).join(' ');

        return parts || property?.address || 'Property Address';
    };

    const address = getDisplayAddress();
    const propertyName = property?.name || property?.propertyName;

    const { comments, loading, addComment } = useComments(listingId, snapId); // Pass snapId to hook
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get current user info from redux store
    const currentUser = useAppSelector(userData);
    const getUserName = () => {
        if (!currentUser) return 'Guest User'; // Fallback if not logged in
        if (currentUser.fullname) return currentUser.fullname;
        return `${currentUser.firstname} ${currentUser.lastname || ''}`.trim();
    };
    const userName = getUserName();
    const accountType = userSnapRole || currentUser?.account_type || 'buyer'; // Use snap role if available, fallback to user account type

    const handleAddComment = async () => {
        if (!newCommentText.trim()) return;
        setIsSubmitting(true);
        try {
            await addComment(newCommentText, userName, propertyName, accountType); // Pass accountType
            setNewCommentText('');
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            className="z-[9999]"
            contentClassName="max-w-md w-full rounded-2xl p-0 overflow-hidden"
        >
            <div className="flex flex-col h-[600px] bg-white">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                        {propertyName && <p className="text-base font-medium text-gray-800">{propertyName}</p>}
                        <p className="text-sm text-gray-500 line-clamp-2">{address}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Body - Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {loading && comments.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-ocOrange" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-gray-400 text-sm">
                            <p>No comments yet.</p>
                            <p>Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-100 p-4 rounded-r-xl border-l-2 border-[#FF8700] shadow-sm mb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-gray-900">{comment.userName}</h4>
                                        {comment.accountType && (
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${comment.accountType.toLowerCase() === 'agent'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : comment.accountType.toLowerCase() === 'co-buyer'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                {comment.accountType.toLowerCase() === 'agent' ? 'Agent' : comment.accountType.toLowerCase() === 'co-buyer' ? 'Co-Buyer' : 'Buyer'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed font-sans break-words whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer - Add Comment Input */}
                <div className="p-6 border-t border-gray-100 bg-white">
                    <div className="relative">
                        <textarea
                            placeholder="Add a comment"
                            className="w-full bg-white border border-black rounded-xl p-4 text-sm focus:outline-none resize-none transition-all placeholder:text-gray-400"
                            rows={3}
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddComment}
                        disabled={!newCommentText.trim() || isSubmitting}
                        className="mt-4 bg-black text-white font-medium py-2 px-8 rounded-full hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isSubmitting ? 'Adding...' : 'Add comment'}
                    </button>
                </div>
            </div>
        </CustomModal>
    );
};

export default CommentsModal;
