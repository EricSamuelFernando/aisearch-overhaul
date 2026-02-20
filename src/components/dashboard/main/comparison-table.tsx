'use client';

import { ArrowLeft, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getStateFromZip } from '@/utils/addressParser';
import NImage from 'next/image';
import { imageLoader } from '@/utils/image-loader';

interface ComparisonTableProps {
    properties: any[];
    onClose: () => void;
    onDeselect?: (propertyId: string) => void;
}

const getBestIndex = (values: (number | null)[], mode: 'highest' | 'lowest'): number => {
    const valid = values
        .map((v, i) => ({ v, i }))
        .filter(({ v }) => v !== null && v !== undefined && v > 0);
    if (valid.length < 2) return -1;
    const best = mode === 'highest'
        ? valid.reduce((a, b) => (b.v! > a.v! ? b : a))
        : valid.reduce((a, b) => (b.v! < a.v! ? b : a));
    return best.i;
};

const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="ml-1.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#FF8700] text-white text-[9px] font-bold flex-shrink-0">★</span>
);

const ComparisonTable = ({ properties, onClose, onDeselect }: ComparisonTableProps) => {
    const count = properties.length;
    const labelColumnWidth = 160;
    const valueColumnMinWidth = 220;
    const comparisonMinWidth = labelColumnWidth + (count * valueColumnMinWidth);

    const prices     = properties.map(p => Number(p?.price) || null);
    const beds       = properties.map(p => Number(p?.bedRooms) || null);
    const baths      = properties.map(p => Number(p?.bathRooms) || null);
    const sqfts      = properties.map(p => Number(p?.livingArea || p?.sqft) || null);
    const pricePerSqft = properties.map(p => {
        const price = Number(p?.price);
        const area  = Number(p?.livingArea || p?.sqft);
        return price && area ? Math.round(price / area) : null;
    });

    const bestPriceIdx = getBestIndex(prices, 'lowest');
    const bestBedsIdx  = getBestIndex(beds, 'highest');
    const bestBathsIdx = getBestIndex(baths, 'highest');
    const bestSqftIdx  = getBestIndex(sqfts, 'highest');
    const bestPpsqIdx  = getBestIndex(pricePerSqft, 'lowest');

    // Each row: { label, values: string|null[], bestIdx }
    const sections = [
        {
            title: 'Property Details',
            rows: [
                { label: 'Bedrooms',    values: beds.map(v => v ? String(v) : null),       bestIdx: bestBedsIdx },
                { label: 'Bathrooms',   values: baths.map(v => v ? String(v) : null),      bestIdx: bestBathsIdx },
                { label: 'Living Area', values: sqfts.map(v => v ? `${v.toLocaleString()} sqft` : null), bestIdx: bestSqftIdx },
                { label: 'Status',      values: properties.map(p => p?.listing?.standardStatus || p?.status || null), bestIdx: -1 },
            ],
        },
        {
            title: 'Location',
            rows: [
                { label: 'Address',    values: properties.map(p => p?.address || null),  bestIdx: -1 },
                { label: 'City',       values: properties.map(p => p?.city || null),     bestIdx: -1 },
                { label: 'State / Zip', values: properties.map(p => {
                    const state = getStateFromZip(p?.zipCode);
                    return [state, p?.zipCode].filter(Boolean).join(' ') || null;
                }), bestIdx: -1 },
            ],
        },
        {
            title: 'Financial Details',
            rows: [
                { label: 'List Price',    values: prices.map(v => v ? formatCurrency(v, 'USD') : null), bestIdx: bestPriceIdx },
                { label: 'Price / sqft',  values: pricePerSqft.map(v => v ? `$${v.toLocaleString()}` : null), bestIdx: bestPpsqIdx },
            ],
        },
    ];

    return (
        <div className="mt-8 w-full">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Compare Properties</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Comparing {count} {count === 1 ? 'property' : 'properties'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 bg-white rounded-full px-4 py-2 shadow-sm"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Exit Compare
                </button>
            </div>

            {/* Card-based layout: label col + one card per property */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <div style={{ minWidth: `${comparisonMinWidth}px` }}>

                {/* ─── Property header cards ─── */}
                <div className="flex border-b border-gray-100">
                    {/* Label spacer */}
                    <div className="w-[160px] flex-shrink-0 bg-gray-50 border-r border-gray-100" />

                    {/* Property cards */}
                    <div className="flex flex-1 gap-2 p-2">
                        {properties.map((prop, idx) => {
                            const displayCity  = prop?.city;
                            const displayState = getStateFromZip(prop?.zipCode);
                            const img = prop?.listing?.media?.photosList?.[0]?.lowRes || prop?.image;
                            const isBestPrice  = idx === bestPriceIdx;

                            return (
                                <div
                                    key={prop?.id || idx}
                                    className={`flex flex-col flex-1 min-w-[220px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm ${isBestPrice ? 'ring-2 ring-[#FF8700]/50' : ''}`}
                                >
                                    {/* Image with fixed aspect ratio */}
                                    <div className="relative w-full bg-gray-100" style={{ aspectRatio: '16/9' }}>
                                        {img ? (
                                            <NImage
                                                src={img}
                                                alt={prop?.address || 'Property'}
                                                fill
                                                unoptimized
                                                loader={imageLoader}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                                                No Image
                                            </div>
                                        )}
                                        {prop?.listing?.standardStatus && (
                                            <span className="absolute top-2 left-2 bg-[#FF8700] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                                {prop.listing.standardStatus}
                                            </span>
                                        )}
                                        {isBestPrice && (
                                            <span className="absolute top-2 right-2 bg-[#FF8700] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                                Best Price ★
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className={`px-4 py-3 text-center ${isBestPrice ? 'bg-[#FF8700]' : 'bg-gray-900'}`}>
                                        <p className="text-base font-bold text-white leading-tight">
                                            {prop?.price ? formatCurrency(Number(prop.price), 'USD') : '—'}
                                        </p>
                                    </div>

                                    {/* Address */}
                                    <div className="px-4 py-3 border-t border-gray-100 bg-white">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{prop?.address || '—'}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                    {[displayCity, displayState].filter(Boolean).join(', ')}
                                                    {prop?.zipCode ? ` ${prop.zipCode}` : ''}
                                                </p>
                                            </div>
                                            {onDeselect && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeselect(prop?.listingId || prop?.id); }}
                                                    title="Remove from comparison"
                                                    className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors mt-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Data sections ─── */}
                {sections.map((section) => (
                    <div key={section.title}>
                        {/* Section header */}
                        <div className="p-3 bg-white border-b border-gray-100">
                            <div className="bg-gray-900 rounded-full w-full flex items-center px-5 py-3">
                                <span className="text-[11px] font-bold text-white uppercase tracking-widest leading-none">
                                    {section.title}
                                </span>
                            </div>
                        </div>

                        {/* Rows */}
                        {section.rows.map((row, rowIdx) => (
                            <div
                                key={row.label}
                                className={`flex border-b border-gray-100 last:border-0 hover:bg-orange-50/30 transition-colors`}
                            >
                                {/* Label */}
                                <div className="w-[160px] flex-shrink-0 px-4 py-3.5 bg-gray-50 border-r border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {row.label}
                                    </span>
                                </div>

                                {/* Values */}
                                <div className="flex flex-1">
                                    {row.values.map((val, colIdx) => {
                                        const isBest = colIdx === row.bestIdx;
                                        return (
                                            <div
                                                key={colIdx}
                                                className="flex-1 min-w-[220px] px-4 py-3.5 text-center border-r border-gray-100 last:border-0 flex items-center justify-center"
                                            >
                                                {val ? (
                                                    <span className={`text-sm font-medium flex items-center gap-0.5 ${isBest ? 'text-[#FF8700] font-bold' : 'text-gray-800'}`}>
                                                        {val}
                                                        {isBest && <Badge>★</Badge>}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-base font-light">—</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF8700] text-white text-[9px] font-bold">★</span>
                Best value in this category
            </p>
        </div>
    );
};

export default ComparisonTable;
