'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { preloadImageUrls } from '@/lib/photo-preload';

interface CategorizedPhotosModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    propertyId: string; // Add this
    fallbackPhotos: string[];
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    price?: number;
    beds?: number;
    baths?: number;
    sqft?: number;
    description?: string;
    preloadedData?: any; // New prop to accept existing data
}

// --- Constants & Helpers (Ported from reference) ---

const ROOM_ORDER = [
    "exterior", "front_yard_driveway", "backyard_garden", "balcony_patio", "pool", "view",
    "living_room", "family_room", "dining", "kitchen", "bedroom", "kids_room", "bathroom",
    "laundry_room", "home_office", "media_room", "home_gym", "basement", "garage",
    "hallway", "staircase", "walk_in_closet", "other"
];
const ROOM_ORDER_LOOKUP = new Map(ROOM_ORDER.map((label, idx) => [label, idx]));

const IMAGE_CLASSIFIER_BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_CLASSIFIER_BASE_URL ||
    process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '';
const API_BASE_URL = IMAGE_CLASSIFIER_BASE_URL
    ? `${IMAGE_CLASSIFIER_BASE_URL}/api`
    : '/api';
const IMAGE_CATEGORIZATION_API = `${API_BASE_URL}/image_categorization`;
const CATEGORY_CACHE_PREFIX = 'photo_categorization_v1';
const IMAGE_CATEGORIZATION_POLL_INTERVAL_MS = 250;
const IMAGE_CATEGORIZATION_POLL_WAIT_TIMEOUT_MS = 3500;
const IMAGE_CATEGORIZATION_MAX_POLL_ATTEMPTS = 16;

const extractCategorization = (data: any) => {
    const images = data?.categorization?.categorized_images ||
        data?.data?.categorization?.categorized_images ||
        data?.images ||
        {};

    const analysisData = data?.categorization?.condition_analysis ||
        data?.categorization?.analysis ||
        data?.data?.categorization?.condition_analysis ||
        data?.data?.categorization?.analysis ||
        data?.analysis ||
        {};

    const hasCategorization = Boolean(
        images &&
        typeof images === 'object' &&
        !Array.isArray(images) &&
        Object.keys(images).length > 0
    );

    return { images, analysisData, hasCategorization };
};

type ImageTagKind = 'none' | 'red_alert' | 'needs_review' | 'opportunity';

interface TaggedImageSelection {
    room: string;
    url: string;
    tag: ImageTagKind;
    insights: any[];
}

const getUrlKeyCandidates = (value: unknown): string[] => {
    if (typeof value !== 'string') return [];
    const raw = value.trim();
    if (!raw) return [];

    const stripQueryAndHash = (input: string) => input.split('#')[0].split('?')[0].trim();
    const cleaned = stripQueryAndHash(raw);
    if (!cleaned) return [];

    const normalized = cleaned.toLowerCase();
    const candidates = new Set<string>([normalized]);

    try {
        const parsed = new URL(cleaned);
        const path = stripQueryAndHash(parsed.pathname || '').toLowerCase();
        if (path) candidates.add(path);
        const leaf = path.split('/').filter(Boolean).at(-1);
        if (leaf) candidates.add(leaf);
    } catch {
        const withoutDomain = normalized.replace(/^https?:\/\/[^/]+/i, '');
        if (withoutDomain) {
            candidates.add(withoutDomain);
            const leaf = withoutDomain.split('/').filter(Boolean).at(-1);
            if (leaf) candidates.add(leaf);
        }
    }

    return [...candidates];
};

const doesUrlMatch = (left: unknown, right: unknown): boolean => {
    const leftKeys = getUrlKeyCandidates(left);
    const rightKeys = new Set(getUrlKeyCandidates(right));
    if (leftKeys.length === 0 || rightKeys.size === 0) return false;
    return leftKeys.some((key) => rightKeys.has(key));
};

const classifyInsightTag = (insight: any): ImageTagKind => {
    const severity = String(insight?.severity || '').toLowerCase();
    const classification = String(insight?.classification || '').toLowerCase();
    const category = String(insight?.category || '').toLowerCase();
    const textBlob = `${insight?.title || ''} ${insight?.what || ''} ${insight?.category_label || ''}`.toLowerCase();

    if (severity === 'high' || classification.includes('red alert')) return 'red_alert';
    if (category === 'upgrade' || classification.includes('opportunity') || textBlob.includes('opportunit')) {
        return 'opportunity';
    }
    return 'needs_review';
};

const resolveImageTag = (insights: any[]): ImageTagKind => {
    if (!insights.length) return 'none';
    if (insights.some((insight) => classifyInsightTag(insight) === 'red_alert')) return 'red_alert';
    if (insights.some((insight) => classifyInsightTag(insight) === 'opportunity')) return 'opportunity';
    return 'needs_review';
};

const tagLabel = (tag: ImageTagKind): string | null => {
    if (tag === 'red_alert') return 'Red Alert';
    if (tag === 'opportunity') return 'Opportunity';
    if (tag === 'needs_review') return 'Needs Review';
    return null;
};

const tagBorderClass = (tag: ImageTagKind): string => {
    if (tag === 'red_alert') return 'border-red-300';
    if (tag === 'opportunity') return 'border-blue-300';
    if (tag === 'needs_review') return 'border-amber-300';
    return 'border-gray-200';
};

const tagBadgeClass = (tag: ImageTagKind): string => {
    if (tag === 'red_alert') return 'bg-red-50 text-red-600 border-red-300';
    if (tag === 'opportunity') return 'bg-blue-50 text-blue-600 border-blue-300';
    if (tag === 'needs_review') return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-gray-50 text-gray-600 border-gray-200';
};

export default function CategorizedPhotosModal({
    isOpen,
    onClose,
    listingId,
    propertyId, // Destructure propertyId
    fallbackPhotos,
    address,
    city,
    state,
    zip,
    price,
    beds,
    baths,
    sqft,
    description,
    preloadedData // Destructure new prop
}: CategorizedPhotosModalProps) {
    const [cats, setCats] = useState<Record<string, any[]> | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isCategorizationPending, setIsCategorizationPending] = useState(false);
    const [categorizationError, setCategorizationError] = useState<string | null>(null);
    const [previewGallery, setPreviewGallery] = useState<{ title: string; urls: string[]; index: number } | null>(null);
    const [selectedTaggedImage, setSelectedTaggedImage] = useState<TaggedImageSelection | null>(null);
    const [allowInteraction, setAllowInteraction] = useState(false);
    const [highlightSelectedInsight, setHighlightSelectedInsight] = useState(false);
    const contentScrollRef = useRef<HTMLDivElement | null>(null);
    const summaryCardRef = useRef<HTMLDivElement | null>(null);
    const selectedInsightRef = useRef<HTMLDivElement | null>(null);

    // Prevent ghost clicks by blocking pointer events initially
    useEffect(() => {
        if (isOpen) {
            setAllowInteraction(false);
            const timer = setTimeout(() => setAllowInteraction(true), 1200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setLoading(false);
            setIsCategorizationPending(false);
            setCategorizationError(null);
            setSelectedTaggedImage(null);
            setHighlightSelectedInsight(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!selectedTaggedImage || !isOpen) return;

        setHighlightSelectedInsight(true);
        const frameId = window.requestAnimationFrame(() => {
            const container = contentScrollRef.current;
            const target = summaryCardRef.current || selectedInsightRef.current;
            if (container && target) {
                const containerRect = container.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                const topOffset = 28;
                const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - topOffset;
                container.scrollTo({
                    top: Math.max(nextTop, 0),
                    behavior: 'smooth',
                });
                return;
            }
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const timer = window.setTimeout(() => {
            setHighlightSelectedInsight(false);
        }, 1400);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(timer);
        };
    }, [selectedTaggedImage, isOpen]);

    useEffect(() => {
        if (!cats) return;
        const urls: string[] = [];
        Object.values(cats).forEach((items: any) => {
            if (!Array.isArray(items)) return;
            items.forEach((item: any) => {
                if (item?.url) urls.push(item.url);
            });
        });
        preloadImageUrls(urls, { maxConcurrent: 6, maxTotal: 48, idleTimeoutMs: 2000 });
    }, [cats]);


    // --- OLD IMPLEMENTATION (Redundant Fetch) ---
    /*
    useEffect(() => {
        if (isOpen && listingId) {
            setLoading(true);

            const fetchCategorizedImages = async () => {
                try {
                    // Use POST /get_data as confirmed working
                    const url = `${API_BASE_URL}/get_data`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            listingId: parseInt(listingId, 10),
                            propertyId: parseInt(propertyId, 10)
                        })
                    });

                    if (!res.ok) throw new Error(`Status ${res.status}`);
                    const data = await res.json();

                    console.log('Full API Response:', data); // Debug: see full response

                    // Handle the response structure from /get_data
                    // Based on user log: {"categorization": { "categorized_images": { ... } }}
                    // Also keep fallback support for direct structure just in case
                    const images = data?.categorization?.categorized_images ||
                        data?.data?.categorization?.categorized_images ||
                        data?.images ||
                        {};

                    const analysisData = data?.categorization?.condition_analysis ||
                        data?.categorization?.analysis ||
                        data?.data?.categorization?.condition_analysis ||
                        data?.data?.categorization?.analysis ||
                        data?.analysis ||
                        {};

                    console.log('Extracted Analysis Data:', analysisData); // Debug log
                    console.log('Has condition_analysis?', !!analysisData?.executive_summary); // Check if it has the expected fields

                    setCats(images);
                    setAnalysis(analysisData);
                } catch (err) {
                    console.error("API attempt failed", err);
                    setCats({});
                    setAnalysis(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchCategorizedImages();
        }
    }, [isOpen, listingId]);
    */

    // --- NEW IMPLEMENTATION (Optimized with preloadedData + async polling) ---
    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        const cacheKey = `${CATEGORY_CACHE_PREFIX}:${listingId}`;

        const readCache = () => {
            try {
                const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        };

        const writeCache = (data: any) => {
            try {
                if (typeof window === 'undefined') return;
                window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
            } catch {
                // Ignore cache errors
            }
        };

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const applyData = (data: any): boolean => {
            const { images, analysisData, hasCategorization } = extractCategorization(data);
            if (cancelled) return hasCategorization;
            setCats(images);
            setAnalysis(analysisData);
            return hasCategorization;
        };

        const run = async () => {
            setCategorizationError(null);
            setIsCategorizationPending(false);
            setLoading(true);
            setCats(null);
            setAnalysis(null);

            const preloadedHasCategorization = extractCategorization(preloadedData).hasCategorization;
            if (preloadedHasCategorization) {
                writeCache(preloadedData);
                applyData(preloadedData);
                setLoading(false);
                return;
            }

            const cached = readCache();
            if (extractCategorization(cached).hasCategorization) {
                applyData(cached);
                setLoading(false);
                return;
            }

            const parsedListingId = Number(listingId);
            const parsedPropertyId = Number(propertyId);
            if (!Number.isFinite(parsedListingId)) {
                setCategorizationError('A valid listingId is required for image categorization');
                setCats({});
                setAnalysis(null);
                setLoading(false);
                return;
            }

            try {
                const basePayload: Record<string, number | boolean> = { listingId: parsedListingId };
                if (Number.isFinite(parsedPropertyId)) {
                    basePayload.propertyId = parsedPropertyId;
                }

                const kickoffRes = await fetch(IMAGE_CATEGORIZATION_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...basePayload, asyncMode: true }),
                    cache: 'no-store',
                });
                const kickoffData = await kickoffRes.json().catch(() => ({}));
                if (!kickoffRes.ok) {
                    throw new Error(kickoffData?.error || `Status ${kickoffRes.status}`);
                }
                if (applyData(kickoffData)) {
                    writeCache(kickoffData);
                    setLoading(false);
                    return;
                }
                setLoading(false);
                setIsCategorizationPending(true);

                let pollStatus = String(kickoffData?.status || '').toLowerCase();
                let pollError = kickoffData?.error || kickoffData?.details || null;

                for (let attempt = 0; attempt < IMAGE_CATEGORIZATION_MAX_POLL_ATTEMPTS; attempt += 1) {
                    if (cancelled) return;
                    if (pollStatus === 'failed' || pollStatus === 'error') {
                        throw new Error(String(pollError || 'Image categorization failed'));
                    }

                    const pollRes = await fetch(IMAGE_CATEGORIZATION_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...basePayload, waitTimeoutMs: IMAGE_CATEGORIZATION_POLL_WAIT_TIMEOUT_MS }),
                        cache: 'no-store',
                    });
                    const pollData = await pollRes.json().catch(() => ({}));
                    if (!pollRes.ok) {
                        throw new Error(pollData?.error || `Status ${pollRes.status}`);
                    }
                    if (applyData(pollData)) {
                        writeCache(pollData);
                        setIsCategorizationPending(false);
                        return;
                    }

                    pollStatus = String(pollData?.status || '').toLowerCase();
                    pollError = pollData?.error || pollData?.details || null;
                    if (pollStatus === 'done' && !extractCategorization(pollData).hasCategorization) {
                        break;
                    }
                    await sleep(IMAGE_CATEGORIZATION_POLL_INTERVAL_MS);
                }

                const finalRes = await fetch(IMAGE_CATEGORIZATION_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...basePayload, waitTimeoutMs: IMAGE_CATEGORIZATION_POLL_WAIT_TIMEOUT_MS }),
                    cache: 'no-store',
                });
                const finalData = await finalRes.json().catch(() => ({}));
                if (finalRes.ok && applyData(finalData)) {
                    writeCache(finalData);
                    setIsCategorizationPending(false);
                    return;
                }

                setCats({});
                setAnalysis(null);
                setIsCategorizationPending(false);
            } catch (err: any) {
                console.error('API attempt failed', err);
                if (!cancelled) {
                    setCategorizationError(err?.message || 'Failed to categorize photos');
                    setCats({});
                    setAnalysis(null);
                    setIsCategorizationPending(false);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [isOpen, listingId, propertyId, preloadedData]);

    // Derived state for ordered categories
    const orderedCats = useMemo(() => {
        if (!cats) return [];
        const entries = Object.entries(cats);
        entries.sort((a, b) => {
            const aCount = Array.isArray(a[1]) ? a[1].length : 0;
            const bCount = Array.isArray(b[1]) ? b[1].length : 0;
            if (aCount !== bCount) return bCount - aCount;

            const aIdx = ROOM_ORDER_LOOKUP.get(a[0]);
            const bIdx = ROOM_ORDER_LOOKUP.get(b[0]);
            const safeA = aIdx ?? ROOM_ORDER.length;
            const safeB = bIdx ?? ROOM_ORDER.length;
            if (safeA === safeB) return a[0].localeCompare(b[0]);
            return safeA - safeB;
        });
        return entries;
    }, [cats]);

    const hasGroupedPhotos = orderedCats.length > 0;
    const showFallback = !hasGroupedPhotos && fallbackPhotos.length > 0 && (!loading || isCategorizationPending);
    const summaryText = analysis?.property_summary || analysis?.home_story || description || "";

    const effectiveInsights = useMemo(() => {
        const directInsights = Array.isArray(analysis?.insights) ? analysis.insights : [];
        if (directInsights.length > 0) return directInsights;

        const roomSections = Array.isArray(analysis?.room_sections) ? analysis.room_sections : [];
        return roomSections.flatMap((roomSection: any) => {
            const roomLabel = roomSection?.title || roomSection?.area;
            const issues = Array.isArray(roomSection?.issues) ? roomSection.issues : [];
            return issues.map((issue: any) => ({
                ...issue,
                what: issue?.summary || issue?.title || '',
                why: issue?.why || issue?.impact || '',
                next_step: issue?.recommendation || '',
                areas: roomLabel ? [roomLabel] : [],
                category: String(issue?.severity || '').toLowerCase() === 'high' ? 'repair' : 'potential',
                classification: String(issue?.severity || '').toLowerCase() === 'high' ? 'Red Alert' : undefined,
            }));
        });
    }, [analysis]);

    const imageInsightMap = useMemo(() => {
        const mapped = new Map<string, any[]>();
        const pushInsight = (candidateUrl: unknown, insight: any) => {
            for (const key of getUrlKeyCandidates(candidateUrl)) {
                const current = mapped.get(key) || [];
                if (!current.includes(insight)) {
                    current.push(insight);
                    mapped.set(key, current);
                }
            }
        };

        for (const insight of effectiveInsights) {
            const sampleImages = Array.isArray(insight?.sample_images) ? insight.sample_images : [];
            const sampleUrls = Array.isArray(insight?.sample_urls) ? insight.sample_urls : [];
            const singleSampleUrl = typeof insight?.sample_url === 'string' ? [insight.sample_url] : [];
            for (const sampleImage of sampleImages) {
                if (typeof sampleImage === 'string') {
                    pushInsight(sampleImage, insight);
                } else {
                    pushInsight(sampleImage?.url, insight);
                }
            }
            for (const url of sampleUrls) {
                pushInsight(url, insight);
            }
            for (const url of singleSampleUrl) {
                pushInsight(url, insight);
            }
        }

        return mapped;
    }, [effectiveInsights]);

    const groupedPhotoSections = useMemo(() => {
        return orderedCats.map(([room, items]) => {
            const enrichedItems = (Array.isArray(items) ? items : []).map((item: any, idx: number) => {
                const seen = new Set<any>();
                const insights = getUrlKeyCandidates(item?.url).flatMap((key) => {
                    const matches = imageInsightMap.get(key) || [];
                    return matches.filter((insight) => {
                        if (seen.has(insight)) return false;
                        seen.add(insight);
                        return true;
                    });
                });
                const tag = resolveImageTag(insights);
                return {
                    item,
                    idx,
                    insights,
                    tag,
                };
            });

            const counts = {
                red_alert: enrichedItems.filter((entry) => entry.tag === 'red_alert').length,
                needs_review: enrichedItems.filter((entry) => entry.tag === 'needs_review').length,
                opportunity: enrichedItems.filter((entry) => entry.tag === 'opportunity').length,
            };

            return {
                room,
                items,
                enrichedItems,
                counts,
            };
        });
    }, [orderedCats, imageInsightMap]);

    const fallbackTaggedPhotos = useMemo(() => {
        return fallbackPhotos.map((url, idx) => {
            const seen = new Set<any>();
            const insights = getUrlKeyCandidates(url).flatMap((key) => {
                const matches = imageInsightMap.get(key) || [];
                return matches.filter((insight) => {
                    if (seen.has(insight)) return false;
                    seen.add(insight);
                    return true;
                });
            });
            const tag = resolveImageTag(insights);
            return {
                url,
                idx,
                insights,
                tag,
            };
        });
    }, [fallbackPhotos, imageInsightMap]);

    // Gallery Logic
    const closeGallery = () => setPreviewGallery(null);
    const shiftGallery = (delta: number) => {
        setPreviewGallery(prev => {
            if (!prev) return null;
            const total = prev.urls.length;
            const nextIndex = (prev.index + delta + total) % total;
            return { ...prev, index: nextIndex };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >

                {/* Header - Matched to App.jsx style */}
                <div className="p-3 sm:p-4 border-b flex items-start sm:items-center justify-between gap-3 shrink-0">
                    <div className="min-w-0">
                        <div className="font-bold text-base sm:text-lg break-words">
                            {address || "Property Photos"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 break-words">
                            {[city, state, zip].filter(Boolean).join(", ")}
                        </div>
                        <div className="text-sm sm:text-base text-indigo-600 font-semibold break-words">
                            {price ? `$${Number(price).toLocaleString()}` : ''}
                            {beds ? ` - ${beds} bd` : ''}
                            {baths ? ` - ${baths} ba` : ''}
                            {sqft ? ` - ${sqft.toLocaleString()} sqft` : ''}
                        </div>
                    </div>
                    <button
                        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap shrink-0"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                {/* Content */}
                <div ref={contentScrollRef} className="overflow-y-auto p-3 sm:p-4 grow">
                    {/* Original Summary Text (fallback) */}
                    {summaryText && (
                        <div ref={summaryCardRef} className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                            {summaryText}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Organizing photos by room...</p>
                        </div>
                    )}

                    {isCategorizationPending && !hasGroupedPhotos && (
                        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></span>
                            <span>AI insights are loading in the background. You can browse photos now and tags will appear automatically.</span>
                        </div>
                    )}

                    {!loading && selectedTaggedImage && (
                        <div
                            ref={selectedInsightRef}
                            className={`mb-5 rounded-xl border p-4 transition ${selectedTaggedImage.tag === 'red_alert'
                                ? 'border-red-200 bg-red-50/60'
                                : selectedTaggedImage.tag === 'opportunity'
                                    ? 'border-blue-200 bg-blue-50/60'
                                    : 'border-amber-200 bg-amber-50/60'
                                } ${highlightSelectedInsight ? 'ring-2 ring-indigo-300 shadow-md' : 'shadow-sm'}`}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Selected Image Insight</div>
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
                                        {selectedTaggedImage.tag === 'opportunity'
                                            ? 'Opportunity for this image'
                                            : selectedTaggedImage.tag === 'red_alert'
                                                ? 'Risk found in this image'
                                                : 'Review item for this image'}
                                    </h4>
                                    <p className="mt-1 text-xs text-gray-600">
                                        This card updates when you click a tagged photo.
                                    </p>
                                </div>
                                <button
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => {
                                        if (selectedTaggedImage.room === 'all photos') {
                                            const selectedKeys = new Set(getUrlKeyCandidates(selectedTaggedImage.url));
                                            const index = fallbackPhotos.findIndex((url) =>
                                                getUrlKeyCandidates(url).some((key) => selectedKeys.has(key))
                                            );
                                            if (index < 0) return;
                                            setPreviewGallery({
                                                title: 'all photos',
                                                urls: fallbackPhotos,
                                                index,
                                            });
                                            return;
                                        }
                                        const roomSection = groupedPhotoSections.find((section) => section.room === selectedTaggedImage.room);
                                        if (!roomSection) return;
                                        const selectedKeys = new Set(getUrlKeyCandidates(selectedTaggedImage.url));
                                        const index = roomSection.enrichedItems.findIndex((entry) =>
                                            getUrlKeyCandidates(entry.item?.url).some((key) => selectedKeys.has(key))
                                        );
                                        if (index < 0) return;
                                        setPreviewGallery({
                                            title: selectedTaggedImage.room.replaceAll('_', ' '),
                                            urls: roomSection.items.map((x: any) => x.url),
                                            index,
                                        });
                                    }}
                                >
                                    Open image
                                </button>
                            </div>
                            <div className="mt-3 space-y-2">
                                {selectedTaggedImage.insights.slice(0, 2).map((insight, idx) => (
                                    <div key={idx} className="rounded-lg border border-white/70 bg-white/70 p-3">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {insight?.title || 'Condition Insight'}
                                        </div>
                                        {(insight?.what || insight?.summary) && (
                                            <p className="mt-1 text-sm text-gray-700">{insight?.what || insight?.summary}</p>
                                        )}
                                        {(insight?.why || insight?.impact) && (
                                            <p className="mt-1 text-xs text-gray-600">
                                                <span className="font-semibold text-gray-700">Impact:</span> {insight?.why || insight?.impact}
                                            </p>
                                        )}
                                        {(insight?.next_step || insight?.recommendation) && (
                                            <p className="mt-1 text-xs text-gray-600">
                                                <span className="font-semibold text-gray-700">Next step:</span> {insight?.next_step || insight?.recommendation}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && hasGroupedPhotos && (
                        <div className="space-y-8" style={{ pointerEvents: allowInteraction ? 'auto' : 'none' }}>
                            {groupedPhotoSections.map((section) => (
                                <div key={section.room}>
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <div className="text-3xl font-semibold capitalize leading-none">{section.room.replaceAll('_', ' ')}</div>
                                        <div className="text-2xl text-gray-500 leading-none">
                                            {section.items.length} photo{section.items.length !== 1 ? 's' : ''}
                                        </div>
                                        {section.counts.red_alert > 0 && (
                                            <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                {section.counts.red_alert} red
                                            </span>
                                        )}
                                        {section.counts.needs_review > 0 && (
                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                {section.counts.needs_review} review
                                            </span>
                                        )}
                                        {section.counts.opportunity > 0 && (
                                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                                {section.counts.opportunity} opportunity
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {section.enrichedItems.map((entry) => {
                                            const label = tagLabel(entry.tag);
                                            const isSelected = doesUrlMatch(selectedTaggedImage?.url, entry.item?.url);
                                            return (
                                                <div
                                                    key={`${section.room}-${entry.idx}`}
                                                    className={`aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 border-2 cursor-pointer transition relative ${tagBorderClass(entry.tag)} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-md' : ''}`}
                                                    onClick={() => {
                                                        if (!allowInteraction) return;
                                                        if (entry.tag === 'none') {
                                                            setSelectedTaggedImage(null);
                                                            setPreviewGallery({
                                                                title: section.room.replaceAll('_', ' '),
                                                                urls: section.items.map((x: any) => x.url),
                                                                index: entry.idx,
                                                            });
                                                            return;
                                                        }
                                                        setSelectedTaggedImage({
                                                            room: section.room,
                                                            url: String(entry.item?.url || ''),
                                                            tag: entry.tag,
                                                            insights: entry.insights,
                                                        });
                                                    }}
                                                >
                                                    <Image
                                                        src={entry.item?.url}
                                                        alt={`${section.room} photo`}
                                                        fill
                                                        className="w-full h-full object-cover"
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                    />
                                                    {label && (
                                                        <span className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${tagBadgeClass(entry.tag)}`}>
                                                            {label}
                                                        </span>
                                                    )}
                                                    {isSelected && entry.tag !== 'none' && (
                                                        <span className="absolute bottom-2 left-2 rounded-full bg-indigo-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                            Selected insight
                                                        </span>
                                                    )}
                                                    <button
                                                        className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white hover:bg-black/70"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setPreviewGallery({
                                                                title: section.room.replaceAll('_', ' '),
                                                                urls: section.items.map((x: any) => x.url),
                                                                index: entry.idx,
                                                            });
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Property Condition Insights Summary */}
                    {analysis?.executive_summary && (
                        <div className="mt-6 sm:mt-8 mb-5 rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mb-4">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">Property Condition Insights Summary</h3>
                                {analysis.generated_at && (
                                    <span className="text-[11px] sm:text-xs text-gray-500">Generated {new Date(analysis.generated_at).toLocaleDateString()}</span>
                                )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4">Based solely on visible elements in the images.</p>

                            {/* Executive Summary */}
                            {analysis.executive_summary && analysis.executive_summary.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">EXECUTIVE SUMMARY</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Red Alerts */}
                                        {(() => {
                                            const redAlertCount = analysis.insights?.filter((i: any) =>
                                                i.severity === 'High' || i.classification === 'Red Alert'
                                            ).length || 0;

                                            if (redAlertCount === 0) return null;

                                            return (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <div className="text-xs font-semibold text-red-700 mb-1">RED ALERTS</div>
                                                    <div className="text-xl sm:text-2xl font-bold text-red-700">
                                                        {redAlertCount}
                                                    </div>
                                                    <div className="text-xs text-red-600 mt-1">Critical risks requiring immediate verification</div>
                                                </div>
                                            );
                                        })()}

                                        {/* Opportunities */}
                                        {(() => {
                                            const opportunityCount = analysis.insights?.filter((i: any) =>
                                                !(i.severity === 'High' || i.classification === 'Red Alert')
                                            ).length || 0;

                                            if (opportunityCount === 0) return null;

                                            return (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="text-xs font-semibold text-blue-700 mb-1">OPPORTUNITIES</div>
                                                    <div className="text-xl sm:text-2xl font-bold text-blue-700">
                                                        {opportunityCount}
                                                    </div>
                                                    <div className="text-xs text-blue-600 mt-1">Renovation or value-add plays for forced appreciation</div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Lists */}
                            <div className="space-y-3 mb-4">
                                {analysis.executive_summary?.map((section: any, idx: number) => (
                                    section.items && section.items.length > 0 && (
                                        <div key={idx}>
                                            <h5 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">{section.label}</h5>
                                            <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                                                {section.items.map((item: string, itemIdx: number) => (
                                                    <li key={itemIdx} className="flex items-start">
                                                        <span className={`mr-2 ${section.label === 'High-priority repairs' ? 'text-red-600' :
                                                            section.label === 'Renovation opportunities' ? 'text-blue-600' :
                                                                'text-gray-600'
                                                            }`}>-</span>
                                                        <span className="break-words">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Key Callouts from insights */}
                            {analysis.insights && analysis.insights.length > 0 && (
                                <div className="bg-violet-50/50 rounded-lg p-3 sm:p-5">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">Key Callouts</h4>
                                    <ul className="space-y-3">
                                        {analysis.insights.slice(0, 5).map((insight: any, idx: number) => {
                                            // Determine color based on severity
                                            let colorClass = 'bg-blue-500';
                                            if (insight.severity === 'High') {
                                                colorClass = 'bg-red-500';
                                            } else if (insight.severity === 'Medium') {
                                                colorClass = 'bg-orange-500';
                                            } else if (insight.severity === 'Low' && insight.category === 'upgrade') {
                                                colorClass = 'bg-yellow-500';
                                            }

                                            return (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <span className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${colorClass}`}></span>
                                                    <span className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">{insight.what}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* Positive Property Signals */}
                            {analysis.positive_insights && analysis.positive_insights.length > 0 && (
                                <div className="mt-4 bg-emerald-50/50 rounded-lg p-5">
                                    <h4 className="text-base font-semibold text-emerald-800 mb-3">Positive Property Signals</h4>




                                    {/* Summary paragraph */}
                                    <div className="mb-4 text-sm text-gray-700">
                                        {analysis.positive_insights.map((positive: any, idx: number) => (
                                            <span key={idx}>
                                                <span className="font-semibold text-emerald-800">{positive.title || positive.category || positive.key}: </span>
                                                <span>{positive.description}</span>
                                                {idx < analysis.positive_insights.length - 1 && <br className="mb-2" />}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Individual positive signal cards */}
                                    <div className="space-y-3">
                                        {analysis.positive_insights.map((positive: any, idx: number) => (
                                            <div key={idx} className="bg-white rounded-lg p-4 border border-emerald-100">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h5 className="text-sm font-bold text-gray-800">
                                                        LUX {positive.title || positive.category || positive.key}
                                                    </h5>
                                                </div>

                                                <div className="flex gap-2 mb-2">
                                                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                                                        {positive.confidence || 'High'} confidence
                                                    </span>
                                                    {positive.areas && positive.areas.length > 0 && (
                                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                                            Focus: {positive.areas.join(', ')}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-700 mb-2">{positive.description}</p>

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>
                                                        Based on {positive.sample_images?.length || positive.image_count || 1} photo covering {positive.room_count || 1} area.
                                                        {positive.score && <span className="ml-1">Top score: {Math.round(positive.score * 100)}%</span>}
                                                    </span>
                                                </div>

                                                {positive.sample_url && (
                                                    <button
                                                        onClick={() => {
                                                            if (positive.sample_images && positive.sample_images.length > 0) {
                                                                setPreviewGallery({
                                                                    title: positive.category || positive.key,
                                                                    urls: positive.sample_images.map((img: any) => img.url || img),
                                                                    index: 0
                                                                });
                                                            } else {
                                                                setPreviewGallery({
                                                                    title: positive.category || positive.key,
                                                                    urls: [positive.sample_url],
                                                                    index: 0
                                                                });
                                                            }
                                                        }}
                                                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        View reference photo
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Grouped Insights */}
                            {analysis.insights && analysis.insights.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-base font-semibold text-gray-800 mb-4">GROUPED INSIGHTS</h4>

                                    <div className="space-y-4">
                                        {analysis.insights.map((insight: any, idx: number) => {
                                            // Determine classification color and label
                                            let classificationLabel = 'Opportunity';
                                            let classificationColor = 'bg-blue-100 text-blue-800';
                                            let confidenceColor = 'text-gray-700';

                                            if (insight.severity === 'High' || insight.classification === 'Red Alert') {
                                                classificationLabel = 'Red Alert';
                                                classificationColor = 'bg-red-100 text-red-800';
                                            } else if (insight.severity === 'Medium') {
                                                classificationLabel = 'Opportunity';
                                                classificationColor = 'bg-blue-100 text-blue-800';
                                            }

                                            return (
                                                <div key={idx} className="bg-white rounded-lg p-5 border border-gray-200">
                                                    {/* Title and badges */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h5 className="text-base font-bold text-gray-900">{insight.title}</h5>
                                                        <div className="flex gap-2">
                                                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded ${classificationColor}`}>
                                                                Classification: {classificationLabel}
                                                            </span>
                                                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded bg-gray-100 ${confidenceColor}`}>
                                                                Confidence: [{insight.confidence || '88'}% AI Confidence]
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Scope */}
                                                    {(insight.where || (insight.areas && insight.areas.length > 0)) && (
                                                        <div className="mb-3 text-sm text-gray-600">
                                                            <span className="font-semibold">Scope:</span> {insight.where || insight.areas.join(', ')}
                                                        </div>
                                                    )}

                                                    {/* Observation */}
                                                    <div className="mb-2">
                                                        <span className="text-sm font-semibold text-gray-900">Observation: </span>
                                                        <span className="text-sm text-gray-700">{insight.what}</span>
                                                    </div>

                                                    {/* Impact */}
                                                    {(insight.impact || insight.why) && (
                                                        <div className="mb-2">
                                                            <span className="text-sm font-semibold text-gray-900">Impact: </span>
                                                            <span className="text-sm text-gray-700">{insight.impact || insight.why}</span>
                                                        </div>
                                                    )}

                                                    {/* Recommendation */}
                                                    {(insight.recommendation || insight.next_step) && (
                                                        <div className="mb-3">
                                                            <span className="text-sm font-semibold text-gray-900">Recommendation: </span>
                                                            <span className="text-sm text-gray-700">{insight.recommendation || insight.next_step}</span>
                                                        </div>
                                                    )}

                                                    {/* Reference images */}
                                                    {(insight.sample_images || insight.image_urls) && (
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-medium">Reference images: </span>
                                                            <button
                                                                onClick={() => {
                                                                    const images = insight.sample_images || insight.image_urls || [];
                                                                    if (images.length > 0) {
                                                                        setPreviewGallery({
                                                                            title: insight.title,
                                                                            urls: images.map((img: any) => img.url || img),
                                                                            index: 0
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-indigo-600 hover:text-indigo-800 font-medium mr-2"
                                                            >
                                                                Preview
                                                            </button>
                                                            <span className="text-gray-400">/</span>
                                                            <button
                                                                onClick={() => {
                                                                    const images = insight.sample_images || insight.image_urls || [];
                                                                    if (images.length > 0) {
                                                                        setPreviewGallery({
                                                                            title: insight.title,
                                                                            urls: images.map((img: any) => img.url || img),
                                                                            index: 0
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-indigo-600 hover:text-indigo-800 font-medium ml-2"
                                                            >
                                                                Open image
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Assessment Limitations */}
                                    {analysis.limitations && analysis.limitations.length > 0 && (
                                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-5">
                                            <h5 className="text-sm font-bold text-amber-900 mb-3">ASSESSMENT LIMITATIONS</h5>
                                            <ul className="space-y-1 text-sm text-gray-700">
                                                {analysis.limitations.map((limitation: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="mr-2">-</span>
                                                        <span>{limitation}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Suggested Next Steps */}
                                    {analysis.next_steps && analysis.next_steps.length > 0 && (
                                        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                                            <h5 className="text-sm font-bold text-emerald-900 mb-3">SUGGESTED NEXT STEPS</h5>
                                            <ul className="space-y-1 text-sm text-gray-700">
                                                {analysis.next_steps.map((step: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="mr-2">-</span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && categorizationError && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                            Could not organize photos by room right now. Showing all available photos.
                        </div>
                    )}

                    {showFallback && (
                        <div>
                            <p className="text-gray-500 mb-4">
                                {isCategorizationPending
                                    ? 'Showing all photos first for speed. Room grouping and AI tags will appear shortly.'
                                    : 'Categorization not available. Showing all photos.'}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {fallbackTaggedPhotos.map((entry) => {
                                    const label = tagLabel(entry.tag);
                                    const isSelected = doesUrlMatch(selectedTaggedImage?.url, entry.url);
                                    return (
                                        <div
                                            key={entry.idx}
                                            className={`aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative border-2 cursor-pointer ${tagBorderClass(entry.tag)} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-md' : ''}`}
                                            onClick={() => {
                                                if (entry.tag === 'none') {
                                                    setSelectedTaggedImage(null);
                                                    setPreviewGallery({ title: 'all photos', urls: fallbackPhotos, index: entry.idx });
                                                    return;
                                                }
                                                setSelectedTaggedImage({
                                                    room: 'all photos',
                                                    url: entry.url,
                                                    tag: entry.tag,
                                                    insights: entry.insights,
                                                });
                                            }}
                                        >
                                            <Image src={entry.url} alt="Property photo" fill className="object-cover" />
                                            {label && (
                                                <span className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${tagBadgeClass(entry.tag)}`}>
                                                    {label}
                                                </span>
                                            )}
                                            {isSelected && entry.tag !== 'none' && (
                                                <span className="absolute bottom-2 left-2 rounded-full bg-indigo-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                    Selected insight
                                                </span>
                                            )}
                                            <button
                                                className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white hover:bg-black/70"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setPreviewGallery({ title: 'all photos', urls: fallbackPhotos, index: entry.idx });
                                                }}
                                            >
                                                View
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lightbox Gallery */}
                {previewGallery && (
                    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeGallery();
                            }}
                            className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                            {previewGallery.urls.length > 1 && (
                                <button onClick={() => shiftGallery(-1)} className="absolute left-2 p-3 text-white hover:bg-white/10 rounded-full">
                                    <ChevronLeft size={32} />
                                </button>
                            )}

                            <div className="relative w-full max-w-5xl h-full max-h-[80vh]">
                                <Image
                                    src={previewGallery.urls[previewGallery.index]}
                                    alt={previewGallery.title}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            {previewGallery.urls.length > 1 && (
                                <button onClick={() => shiftGallery(1)} className="absolute right-2 p-3 text-white hover:bg-white/10 rounded-full">
                                    <ChevronRight size={32} />
                                </button>
                            )}
                        </div>

                        <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                            <p className="font-semibold text-lg capitalize">{previewGallery.title}</p>
                            <p className="text-sm text-gray-400">{previewGallery.index + 1} / {previewGallery.urls.length}</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

