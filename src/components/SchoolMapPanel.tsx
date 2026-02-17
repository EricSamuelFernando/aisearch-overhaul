import React from "react";

type MapMarker = {
    lat: number;
    lon: number;
    label?: string;
    role?: "home" | "school";
    name?: string;
};

type SchoolMapPanelProps = {
    title?: string;
    imageUrl?: string;
    radiusMiles?: number;
    markers?: MapMarker[];
    listCount?: number;
};

const MarkerLegend = ({ role, label }: { role: string; label: string }) => (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
        <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${role === "home" ? "bg-orange-500" : "bg-blue-600"
                }`}
        />
        {label}
    </div>
);

const SchoolMapPanel = ({
    title,
    imageUrl,
    radiusMiles,
    markers,
    listCount,
}: SchoolMapPanelProps) => {
    if (!imageUrl) return null;

    const markerCount = markers?.length ? Math.max(markers.length - 1, 0) : 0;
    const listCountSafe = listCount ?? markerCount;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 via-white to-sky-50 px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-gray-800">{title ?? "Nearby schools map"}</p>
                    <p className="text-xs text-gray-500">
                        Showing {listCountSafe} schools{radiusMiles ? ` within ${radiusMiles.toFixed(1)} miles` : ""}.
                    </p>
                    <p className="text-xs text-gray-400">Pins 1-10 match the list order.</p>
                </div>
                <div className="flex items-center gap-2">
                    <MarkerLegend role="home" label="Home" />
                    <MarkerLegend role="school" label="School" />
                </div>
            </div>
            <div className="relative">
                <img
                    src={imageUrl}
                    alt="School map"
                    className="h-72 w-full object-cover"
                    loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
            </div>
        </div>
    );
};

export default SchoolMapPanel;
