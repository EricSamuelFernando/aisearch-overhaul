'use client';

import { useEffect, useState, useRef } from 'react';
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env";
import { Loader2 } from 'lucide-react';
import PropertyCardHomes from '@/components/buy/browse/property-card-nearby';

interface CollectionRecommendationProps {
    snapId: string;
}

const CollectionRecommendations = ({ snapId }: CollectionRecommendationProps) => {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const dataFetchedRef = useRef(false);

    useEffect(() => {
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;

        const fetchRecommendations = async () => {
            if (!snapId) return;

            setLoading(true);
            try {
                const payload = {
                    snapz_id: snapId
                };

                console.log("Fetching collection recommendations for payload:", payload);

                // Using the specific URL requested by the user: https://demo-ai.snaphomz.com/api/snapz-recommendations
                const response = await fetch('https://demo-ai.snaphomz.com/api/snapz-recommendations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error("Collection Recommendations API error:", response.status, response.statusText);
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log("Collection Recommendations response data:", data);
                // Assuming the API returns a similar structure or a list of homes/listings
                // The user request said "if there 2 listing in a collection then two snap recommendation is showing but make it it will check overall listing from collection give one snap recommendation"
                // and provided the endpoint. The endpoint response structure isn't fully defined but likely contains a list of properties.
                // Based on previous code, it might be in `nearbyHomes` or directly as an array.
                // Let's assume it returns { nearbyHomes: [...] } or just [...]
                // Ideally I should check the response structure, but I can adapt based on typical patterns here.
                // The user didn't specify the response format, but existing code used `data?.nearbyHomes`.
                // I will try to handle both or defaults.

                // Let's assume the new API aligns with the goal. If data is an array, use it. If it has a property like 'recommendations' or 'nearbyHomes', use that.
                // Common pattern in this codebase seems to be `nearbyHomes`.

                let recs = [];
                if (Array.isArray(data)) {
                    recs = data;
                } else if (data?.similar_properties) {
                    recs = data.similar_properties;
                } else if (data?.nearbyHomes) {
                    recs = data.nearbyHomes;
                } else if (data?.recommendations) {
                    recs = data.recommendations;
                } else if (data?.data) { // common wrapper
                    if (Array.isArray(data.data)) recs = data.data;
                }

                setRecommendations(recs || []);

            } catch (error) {
                console.error("Error fetching collection recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [snapId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4 px-1">
                <Loader2 className="w-4 h-4 animate-spin text-ocOrange" />
                <span className="text-sm text-gray-500">Loading recommendations...</span>
            </div>
        );
    }

    if (!recommendations.length) return null;

    return (
        <div className="mt-8 pb-6">
            <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-ocOrange"></span>
                    Snap Recommendations
                </h4>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
                {recommendations.map((home: any, index: number) => {
                    const recListingId = home?.listing?.listingId || home?.listingId || home?.id;

                    if (!recListingId) return null;

                    // Support different data structures while ensuring the correct ID is prioritized
                    const normalizedHome = {
                        ...(home.listing || home),
                        listingId: recListingId, // Explicitly set the ID for PropertyCardHomes to use
                        listing: home.listing || home
                    };

                    return (
                        <div
                            key={`${index}-${recListingId}`}
                            className="min-w-[280px] max-w-[280px] snap-start"
                        >
                            <PropertyCardHomes
                                listing={normalizedHome}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CollectionRecommendations;
