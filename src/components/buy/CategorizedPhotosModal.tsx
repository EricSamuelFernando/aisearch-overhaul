'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

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

const API_BASE_URL = "https://demo-ai.snaphomz.com/api";

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
    const [previewGallery, setPreviewGallery] = useState<{ title: string; urls: string[]; index: number } | null>(null);
    const [allowInteraction, setAllowInteraction] = useState(false);

    // Prevent ghost clicks by blocking pointer events initially
    useEffect(() => {
        if (isOpen) {
            setAllowInteraction(false);
            const timer = setTimeout(() => setAllowInteraction(true), 1200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);


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

    // --- NEW IMPLEMENTATION (Optimized with preloadedData) ---
    // Data handling logic
    useEffect(() => {
        if (isOpen) {
            // Function to process data (either from prop or API)
            const processData = (data: any) => {
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

                setCats(images);
                setAnalysis(analysisData);
            };

            // Used preloaded data if available AND has categorization, otherwise fetch
            const hasCategorization = preloadedData?.categorization?.categorized_images ||
                preloadedData?.data?.categorization?.categorized_images;

            if (hasCategorization) {
                console.log('Using preloaded data for CategorizedPhotosModal');
                processData(preloadedData);
                return;
            }

            if (listingId) {
                setLoading(true);

                const fetchCategorizedImages = async () => {
                    try {
                        // Use POST /image_categorization
                        const url = `${API_BASE_URL}/image_categorization`;
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
                        processData(data);

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
        }
    }, [isOpen, listingId, preloadedData]);

    // Derived state for ordered categories
    const orderedCats = useMemo(() => {
        if (!cats) return [];
        const entries = Object.entries(cats);
        entries.sort((a, b) => {
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
    const showFallback = !loading && !hasGroupedPhotos && fallbackPhotos.length > 0;
    const summaryText = analysis?.property_summary || analysis?.home_story || description || "";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >

                {/* Header - Matched to App.jsx style */}
                <div className="p-4 border-b flex items-center justify-between shrink-0">
                    <div>
                        <div className="font-bold text-lg">
                            {address || "Property Photos"}
                        </div>
                        <div className="text-sm text-gray-600">
                            {[city, state, zip].filter(Boolean).join(", ")}
                        </div>
                        <div className="text-indigo-600 font-semibold">
                            {price ? `$${Number(price).toLocaleString()}` : ''}
                            {beds ? ` - ${beds} bd` : ''}
                            {baths ? ` - ${baths} ba` : ''}
                            {sqft ? ` - ${sqft.toLocaleString()} sqft` : ''}
                        </div>
                    </div>
                    <button
                        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4 grow">
                    {/* Original Summary Text (fallback) */}
                    {summaryText && (
                        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                            {summaryText}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Organizing photos by room...</p>
                        </div>
                    )}

                    {!loading && hasGroupedPhotos && (
                        <div className="space-y-8" style={{ pointerEvents: allowInteraction ? 'auto' : 'none' }}>
                            {orderedCats.map(([room, items]) => (
                                <div key={room}>
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="text-xl font-semibold capitalize">{room.replaceAll('_', ' ')}</div>
                                        <div className="text-sm text-gray-500">{items.length} photo{items.length !== 1 ? 's' : ''}</div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {items.map((item: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 border cursor-pointer hover:opacity-90 transition relative"
                                                onClick={() => {
                                                    if (!allowInteraction) {
                                                        console.log('Click blocked - interaction not allowed yet');
                                                        return;
                                                    }
                                                    setPreviewGallery({ title: room.replaceAll('_', ' '), urls: items.map((x: any) => x.url), index: idx });
                                                }}
                                            >
                                                <Image
                                                    src={item.url}
                                                    alt={`${room} photo`}
                                                    fill
                                                    className="w-full h-full object-cover"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Property Condition Insights Summary */}
                    {analysis?.executive_summary && (
                        <div className="mt-8 mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Property Condition Insights Summary</h3>
                                {analysis.generated_at && (
                                    <span className="text-xs text-gray-500">Generated {new Date(analysis.generated_at).toLocaleDateString()}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Based solely on visible elements in the images.</p>

                            {/* Executive Summary */}
                            {analysis.executive_summary && analysis.executive_summary.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">EXECUTIVE SUMMARY</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Red Alerts */}
                                        {(() => {
                                            const redAlertCount = analysis.insights?.filter((i: any) =>
                                                i.severity === 'High' || i.classification === 'Red Alert'
                                            ).length || 0;

                                            if (redAlertCount === 0) return null;

                                            return (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <div className="text-xs font-semibold text-red-700 mb-1">RED ALERTS</div>
                                                    <div className="text-2xl font-bold text-red-700">
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
                                                    <div className="text-2xl font-bold text-blue-700">
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
                                            <h5 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h5>
                                            <ul className="text-sm text-gray-700 space-y-1">
                                                {section.items.map((item: string, itemIdx: number) => (
                                                    <li key={itemIdx} className="flex items-start">
                                                        <span className={`mr-2 ${section.label === 'High-priority repairs' ? 'text-red-600' :
                                                            section.label === 'Renovation opportunities' ? 'text-blue-600' :
                                                                'text-gray-600'
                                                            }`}>•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Key Callouts from insights */}
                            {analysis.insights && analysis.insights.length > 0 && (
                                <div className="bg-violet-50/50 rounded-lg p-5">
                                    <h4 className="text-base font-semibold text-gray-800 mb-4">Key Callouts</h4>
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
                                                    <span className="text-sm text-gray-700 leading-relaxed">{insight.what}</span>
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
                                                        <span className="mr-2">•</span>
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
                                                        <span className="mr-2">•</span>
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

                    {showFallback && (
                        <div>
                            <p className="text-gray-500 mb-4">Categorization not available. Showing all photos.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {fallbackPhotos.map((url, idx) => (
                                    <div key={idx} className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative border">
                                        <Image src={url} alt="Property photo" fill className="object-cover" />
                                    </div>
                                ))}
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
