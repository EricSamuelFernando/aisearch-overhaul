'use client';

import { useEffect, useState } from 'react';
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env";
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PropertyCardHomes from '@/components/buy/browse/property-card-nearby';

interface RecommendationProps {
    listingId: string;
    propertyId: string;
}

const PropertyRecommendations = ({ listingId, propertyId }: RecommendationProps) => {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!listingId && !propertyId) return;

            setLoading(true);
            try {
                const payload = {
                    listingId: parseInt(listingId) || 0,
                    propertyId: parseInt(propertyId) || 0
                };

                console.log("Fetching recommendations for payload:", payload);

                const response = await fetch(PROPERTY_DETAIL_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/get_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error("Recommendations API error:", response.status, response.statusText);
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log("Recommendations response data:", data);
                setRecommendations(data?.nearbyHomes || []);
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [listingId, propertyId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-ocOrange" />
                <span className="text-sm text-gray-500">Loading recommendations...</span>
            </div>
        );
    }

    if (!recommendations.length) return null;

    return (
        <div className="mt-4 pb-6">
            <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ocOrange"></span>
                    Snap Recommendations
                </h4>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
                {recommendations.slice(0, 6).map((home: any, index: number) => {
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
                            className="min-w-[280px] max-w-[280px] snap-start pointer-events-none"
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

export default PropertyRecommendations;
