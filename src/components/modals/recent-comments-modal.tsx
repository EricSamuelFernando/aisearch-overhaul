import React, { useEffect, useState } from 'react';
import CustomModal from '@/components/custom-modal';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { getAuthToken } from '@/lib/storage';
import { getStateFromZip } from '@/utils/addressParser';

interface Comment {
    id: string;
    text: string;
    userName: string;
    propertyName: string;
    propertyId?: string; // Add propertyId
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

    const getPropertyAddress = (comment: Comment) => {
        const found = properties.find((p: any) =>
            [p?.propertyId, p?.listingId, p?.id].some((id) => idsMatch(id, comment.propertyId))
        );

        if (found) {
            const fullAddress = buildFullAddress(found);
            if (fullAddress) return fullAddress;
        }

        if (properties.length === 1) {
            const singleAddress = buildFullAddress(properties[0]);
            if (singleAddress) return singleAddress;
        }

        const propertyName = (comment.propertyName || '').trim();
        return looksLikeAddress(propertyName) ? propertyName : 'Property view';
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
                            const name = getPropertyAddress(comment);
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

