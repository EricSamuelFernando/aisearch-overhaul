'use client';

import { ArrowLeft, Plus, Star, X } from 'lucide-react';
import NImage from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { getStateFromZip } from '@/utils/addressParser';
import { imageLoader } from '@/utils/image-loader';

interface ComparisonTableProps {
    slotProperties: Array<any | null>;
    activeSlotIndex: number;
    recentlyFilledSlotIndex: number | null;
    onSelectSlot: (slotIndex: number) => void;
    onRemoveFromSlot: (slotIndex: number) => void;
    onClose: () => void;
}

const getBestIndex = (values: Array<number | null>, mode: 'highest' | 'lowest'): number => {
    const valid = values
        .map((value, index) => ({ value, index }))
        .filter(({ value }) => value !== null && value !== undefined && value > 0);

    if (valid.length < 2) return -1;

    const best =
        mode === 'highest'
            ? valid.reduce((a, b) => (b.value! > a.value! ? b : a))
            : valid.reduce((a, b) => (b.value! < a.value! ? b : a));

    return best.index;
};

const Badge = ({ className = 'ml-1.5' }: { className?: string }) => (
    <span className={`${className} inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[#FF8700]`}>
        <Star className="h-[9px] w-[9px] fill-white text-white stroke-[2.4]" />
    </span>
);

const ComparisonTable = ({
    slotProperties,
    activeSlotIndex,
    recentlyFilledSlotIndex,
    onSelectSlot,
    onRemoveFromSlot,
    onClose,
}: ComparisonTableProps) => {
    const normalizedSlots = [0, 1, 2, 3].map(index => slotProperties[index] || null);
    const selectedCount = normalizedSlots.filter(Boolean).length;

    const prices = normalizedSlots.map(property => (property ? Number(property?.price) || null : null));
    const beds = normalizedSlots.map(property => (property ? Number(property?.bedRooms) || null : null));
    const baths = normalizedSlots.map(property => (property ? Number(property?.bathRooms) || null : null));
    const sqfts = normalizedSlots.map(property =>
        property ? Number(property?.livingArea || property?.sqft) || null : null
    );
    const pricePerSqft = normalizedSlots.map(property => {
        if (!property) return null;
        const price = Number(property?.price);
        const area = Number(property?.livingArea || property?.sqft);
        return price && area ? Math.round(price / area) : null;
    });

    const bestPriceIdx = getBestIndex(prices, 'lowest');
    const bestBedsIdx = getBestIndex(beds, 'highest');
    const bestBathsIdx = getBestIndex(baths, 'highest');
    const bestSqftIdx = getBestIndex(sqfts, 'highest');
    const bestPpsqIdx = getBestIndex(pricePerSqft, 'lowest');

    const sections = [
        {
            title: 'Property Details',
            rows: [
                { label: 'Bedrooms', values: beds.map(value => (value ? String(value) : null)), bestIdx: bestBedsIdx },
                { label: 'Bathrooms', values: baths.map(value => (value ? String(value) : null)), bestIdx: bestBathsIdx },
                {
                    label: 'Living Area',
                    values: sqfts.map(value => (value ? `${value.toLocaleString()} sqft` : null)),
                    bestIdx: bestSqftIdx,
                },
                {
                    label: 'Status',
                    values: normalizedSlots.map(property => property?.listing?.standardStatus || property?.status || null),
                    bestIdx: -1,
                },
            ],
        },
        {
            title: 'Location',
            rows: [
                { label: 'Address', values: normalizedSlots.map(property => property?.address || null), bestIdx: -1 },
                { label: 'City', values: normalizedSlots.map(property => property?.city || null), bestIdx: -1 },
                {
                    label: 'State / Zip',
                    values: normalizedSlots.map(property => {
                        const state = getStateFromZip(property?.zipCode);
                        return [state, property?.zipCode].filter(Boolean).join(' ') || null;
                    }),
                    bestIdx: -1,
                },
            ],
        },
        {
            title: 'Financial Details',
            rows: [
                {
                    label: 'List Price',
                    values: prices.map(value => (value ? formatCurrency(value, 'USD') : null)),
                    bestIdx: bestPriceIdx,
                },
                {
                    label: 'Price / sqft',
                    values: pricePerSqft.map(value => (value ? `$${value.toLocaleString()}` : null)),
                    bestIdx: bestPpsqIdx,
                },
            ],
        },
    ];

    return (
        <div className="mt-8 w-full">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Compare Properties</h2>
                    <p className="mt-0.5 text-sm text-gray-400">Comparing {selectedCount} of 4 properties</p>
                    {selectedCount < 2 && (
                        <p className="mt-1 text-xs font-medium text-orange-500">Select at least 2 properties to compare data.</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition-colors hover:text-gray-900"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Exit Compare
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex border-b border-gray-100">
                    <div className="w-[160px] flex-shrink-0 border-r border-gray-100 bg-gray-50" />

                    <div className="flex flex-1 gap-2 overflow-x-auto p-2">
                        {normalizedSlots.map((property, index) => {
                            const isActive = index === activeSlotIndex;
                            const isBestPrice = index === bestPriceIdx;
                            const isRecentlyFilled = index === recentlyFilledSlotIndex;

                            if (!property) {
                                return (
                                    <button
                                        type="button"
                                        key={`slot-empty-${index}`}
                                        onClick={() => onSelectSlot(index)}
                                        className={`group min-w-[220px] flex-1 max-w-[360px] rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
                                            isActive
                                                ? 'border-[#FF8700] bg-orange-50 shadow-[0_6px_24px_rgba(255,135,0,0.12)]'
                                                : 'border-gray-200 bg-gray-50 hover:-translate-y-0.5 hover:border-[#FF8700]/70 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]'
                                        }`}
                                    >
                                        <p className="text-4xl font-semibold text-gray-400 transition-transform duration-200 group-hover:-translate-y-0.5">
                                            {index + 1}
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition-colors group-hover:border-[#FF8700]/60 group-hover:text-[#FF8700]">
                                            <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
                                            Add Property
                                        </div>
                                        <p className="mt-3 text-xs text-gray-400">Tap to pick from the list</p>
                                    </button>
                                );
                            }

                            const displayCity = property?.city;
                            const displayState = getStateFromZip(property?.zipCode);
                            const image = property?.listing?.media?.photosList?.[0]?.lowRes || property?.image;

                            return (
                                <div
                                    key={property?.id || `slot-filled-${index}`}
                                    onClick={() => onSelectSlot(index)}
                                    className={`min-w-[220px] flex-1 max-w-[360px] cursor-pointer overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md ${
                                        isActive ? 'ring-2 ring-[#FF8700]' : ''
                                    } ${
                                        isRecentlyFilled ? 'scale-[1.015] shadow-[0_10px_28px_rgba(255,135,0,0.22)]' : ''
                                    } ${isBestPrice ? 'border-[#FF8700]/40' : ''}`}
                                >
                                    <div className="relative w-full bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                                        {image ? (
                                            <NImage
                                                src={image}
                                                alt={property?.address || 'Property'}
                                                fill
                                                unoptimized
                                                loader={imageLoader}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-xs text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <span className="absolute left-2 top-2 rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white">
                                            Slot {index + 1}
                                        </span>
                                        {isBestPrice && (
                                            <span className="absolute right-2 top-2 rounded-md bg-[#FF8700] px-2 py-0.5 text-[10px] font-bold text-white">
                                                Best Price *
                                            </span>
                                        )}
                                    </div>

                                    <div className={`px-4 py-3 text-center ${isBestPrice ? 'bg-[#FF8700]' : 'bg-gray-900'}`}>
                                        <p className="text-base font-bold leading-tight text-white">
                                            {property?.price ? formatCurrency(Number(property.price), 'USD') : '-'}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-100 bg-white px-4 py-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-800">{property?.address || '-'}</p>
                                                <p className="mt-0.5 truncate text-xs text-gray-400">
                                                    {[displayCity, displayState].filter(Boolean).join(', ')}
                                                    {property?.zipCode ? ` ${property.zipCode}` : ''}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={event => {
                                                    event.stopPropagation();
                                                    onRemoveFromSlot(index);
                                                }}
                                                title="Remove from comparison"
                                                className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {sections.map(section => (
                    <div key={section.title}>
                        <div className="border-b border-gray-100 bg-white p-3">
                            <div className="flex w-full items-center rounded-full bg-gray-900 px-5 py-3">
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none text-white">
                                    {section.title}
                                </span>
                            </div>
                        </div>

                        {section.rows.map(row => (
                            <div key={row.label} className="flex border-b border-gray-100 transition-colors hover:bg-orange-50/30 last:border-0">
                                <div className="w-[160px] flex-shrink-0 border-r border-gray-100 bg-gray-50 px-4 py-3.5">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{row.label}</span>
                                </div>

                                <div className="flex flex-1">
                                    {row.values.map((value, columnIndex) => {
                                        const isBest = columnIndex === row.bestIdx;
                                        const isActive = columnIndex === activeSlotIndex;

                                        return (
                                            <div
                                                key={`${row.label}-${columnIndex}`}
                                                className={`flex min-w-[220px] flex-1 items-center justify-center border-r border-gray-100 px-4 py-3.5 text-center last:border-0 max-w-[360px] ${
                                                    isActive ? 'bg-orange-50/20' : ''
                                                }`}
                                            >
                                                {value ? (
                                                    <span
                                                        className={`flex items-center gap-0.5 text-sm font-medium ${
                                                            isBest ? 'font-bold text-[#FF8700]' : 'text-gray-800'
                                                        }`}
                                                    >
                                                        {value}
                                                        {isBest && <Badge />}
                                                    </span>
                                                ) : (
                                                    <span className="text-base font-light text-gray-300">-</span>
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

            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <Badge className="" />
                Best value in this category
            </p>
        </div>
    );
};

export default ComparisonTable;
