'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { usePropertyStore } from '@/store/use-property-store';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { imageLoader } from '@/utils/image-loader';

interface PropertyComparisonModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

export default function PropertyComparisonModal({
    isOpen,
    closeModal,
}: PropertyComparisonModalProps) {
    const { selectedCompareProperties } = usePropertyStore();

    const properties = selectedCompareProperties.map((p) => p.data);

    // Helper to safely get nested data regardless of property type (IProperty vs MLS)
    const getValue = (property: any, key: string, fallback: string = '—') => {
        if (!property) return fallback;

        // 1. Try to find the "root" listing object. 
        // It could be 'property' itself, strict 'property.listing', or wrapped 'property.data'
        // or even 'property.data.listing'.

        // We'll normalize to a few candidates
        const candidates = [
            property,
            property.listing,
            property.data,
            property.data?.listing
        ].filter(Boolean);

        // Helper to find value across candidates
        const find = (path: string[]) => {
            for (const root of candidates) {
                let current = root;
                for (const p of path) {
                    if (current?.[p] === undefined) {
                        current = undefined;
                        break;
                    }
                    current = current[p];
                }
                if (current !== undefined && current !== null && current !== '') return current;
            }
            return undefined;
        };

        switch (key) {
            case 'price':
                const price = find(['listPriceLow']) ||
                    find(['ListPrice']) ||
                    find(['price', 'amount']) ||
                    find(['data', 'price', 'amount']); // Fallback
                return price ? formatCurrency(price, 'USD') : fallback;

            case 'address':
                return find(['address', 'unparsedAddress']) ||
                    find(['UnparsedAddress']) ||
                    find(['propertyAddressDetails', 'formattedAddress']) ||
                    fallback;

            case 'city':
                return find(['address', 'city']) ||
                    find(['City']) ||
                    find(['propertyAddressDetails', 'city']) ||
                    fallback;

            case 'zip':
                return find(['address', 'zipCode']) ||
                    find(['PostalCode']) ||
                    find(['propertyAddressDetails', 'postalCode']) ||
                    fallback;

            case 'beds':
                return find(['property', 'bedroomsTotal']) ||
                    find(['BedroomsTotal']) ||
                    find(['numBedroom']) ||
                    fallback;

            case 'baths':
                return find(['property', 'bathroomsTotal']) ||
                    find(['BathroomsTotalInteger']) ||
                    find(['numBathroom']) ||
                    fallback;

            case 'sqft':
                return find(['property', 'livingArea']) ||
                    find(['LivingArea']) ||
                    find(['lotSizeValue']) ||
                    fallback;

            case 'year':
                return find(['property', 'yearBuilt']) ||
                    find(['YearBuilt']) ||
                    find(['yearBuild']) ||
                    fallback;

            case 'type':
                return find(['property', 'propertyType']) ||
                    find(['PropertyType']) ||
                    find(['propertyType']) ||
                    fallback;

            case 'lot':
                return find(['property', 'lotSizeArea']) ||
                    find(['LotSizeArea']) ||
                    find(['lotSizeValue']) ||
                    fallback;

            case 'pricePerSqft':
                const p = find(['listPriceLow']) || find(['ListPrice']) || find(['price', 'amount']);
                const s = find(['property', 'livingArea']) || find(['LivingArea']);
                if (p && s) {
                    return formatCurrency(Math.round(p / s), 'USD');
                }
                return fallback;

            case 'hoa':
                return find(['property', 'associationFee']) ||
                    find(['AssociationFee']) ||
                    fallback;

            case 'parking':
                const parking = find(['property', 'parkingTotal']) ||
                    find(['ParkingTotal']) ||
                    find(['garageSpaces']) ||
                    fallback;
                return parking !== fallback ? parking : fallback;

            case 'cooling':
                const cooling = find(['property', 'cooling']) || find(['Cooling']);
                return cooling ? 'Yes' : '—'; // Simplified check

            case 'fireplace':
                const fireplace = find(['property', 'fireplacesTotal']) || find(['FireplacesTotal']);
                return fireplace && fireplace > 0 ? 'Yes' : 'No';

            case 'pool':
                const pool = find(['property', 'poolPrivate']) ||
                    find(['PoolPrivateYN']) ||
                    find(['property', 'hasPool']) ||
                    find(['hasPool']);
                return pool ? 'Yes' : 'No';

            case 'tax':
                const tax = find(['property', 'taxAnnualAmount']) || find(['TaxAnnualAmount']);
                return tax ? formatCurrency(tax, 'USD') : fallback;

            case 'monthlyPayment':
                // Simple estimation: Principal & Interest for 30yr fixed @ 6.5%
                // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
                const pVal = find(['listPriceLow']) || find(['ListPrice']) || find(['price', 'amount']);
                if (pVal) {
                    const principal = Number(pVal);
                    const rate = 0.065 / 12; // 6.5% annual
                    const n = 30 * 12;
                    const payment = principal * ((rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1));
                    return formatCurrency(Math.round(payment), 'USD');
                }
                return fallback;

            default:
                return fallback;
        }
    };

    const getImage = (property: any) => {
        // manual find for image
        const candidates = [property, property.listing, property.data].filter(Boolean);
        for (const c of candidates) {
            if (c?.media?.primaryListingImageUrl) return c.media.primaryListingImageUrl;
            if (c?.Media?.[0]?.MediaURL) return c.Media[0].MediaURL;
            if (c?.images?.[0]?.url) return c.images[0].url;
            if (c?.image) return c.image;
        }
        return '/assets/images/placeholder.svg';
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold leading-6 text-gray-900"
                                    >
                                        Compare Properties
                                    </Dialog.Title>
                                    <button
                                        onClick={closeModal}
                                        className="rounded-full p-2 hover:bg-gray-100"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-fixed divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="w-48 px-4 py-2 bg-gray-50 text-left text-sm font-semibold text-gray-900 border-r">
                                                    Property
                                                </th>
                                                {properties.map((property: any, index: number) => (
                                                    <th key={index} className="px-4 py-2 text-left bg-white min-w-[250px]">
                                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-2">
                                                            <Image
                                                                src={getImage(property)}
                                                                alt="Property"
                                                                fill
                                                                loader={imageLoader}
                                                                className="object-cover"
                                                                onError={(e: any) => e.target.src = '/assets/images/placeholder.svg'}
                                                            />
                                                        </div>
                                                        <div className="text-lg font-bold text-ocOrange">
                                                            {getValue(property, 'price')}
                                                        </div>
                                                        <div className="text-sm font-medium truncate">
                                                            {getValue(property, 'address')}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {getValue(property, 'city')}, {getValue(property, 'zip')}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {/* Basic Info Section */}
                                            <tr className="bg-gray-50">
                                                <td colSpan={properties.length + 1} className="px-4 py-2 font-bold text-gray-700">Basic Information</td>
                                            </tr>
                                            {[
                                                { label: 'Bedrooms', key: 'beds' },
                                                { label: 'Bathrooms', key: 'baths' },
                                                { label: 'Square Feet', key: 'sqft' },
                                                { label: 'Year Built', key: 'year' },
                                                { label: 'Property Type', key: 'type' },
                                                { label: 'Lot Size', key: 'lot' },
                                            ].map((row) => (
                                                <tr key={row.key}>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 border-r">
                                                        {row.label}
                                                    </td>
                                                    {properties.map((property: any, idx: number) => (
                                                        <td key={idx} className="px-4 py-3 text-sm text-gray-700">
                                                            {getValue(property, row.key)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}

                                            {/* Features & Amenities */}
                                            <tr className="bg-gray-50">
                                                <td colSpan={properties.length + 1} className="px-4 py-2 font-bold text-gray-700 mt-4">Features & Amenities</td>
                                            </tr>
                                            {[
                                                { label: 'Parking', key: 'parking' },
                                                { label: 'Cooling', key: 'cooling' },
                                                { label: 'Fireplace', key: 'fireplace' },
                                                { label: 'Pool', key: 'pool' },
                                            ].map((row) => (
                                                <tr key={row.key}>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 border-r">
                                                        {row.label}
                                                    </td>
                                                    {properties.map((property: any, idx: number) => (
                                                        <td key={idx} className="px-4 py-3 text-sm text-gray-700">
                                                            {getValue(property, row.key)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}

                                            {/* Financials Section */}
                                            <tr className="bg-gray-50">
                                                <td colSpan={properties.length + 1} className="px-4 py-2 font-bold text-gray-700 mt-4">Financial Details</td>
                                            </tr>
                                            {[
                                                { label: 'Price per sqft', key: 'pricePerSqft' },
                                                { label: 'Monthly Payment (Est.)', key: 'monthlyPayment' },
                                                { label: 'Property Tax', key: 'tax' },
                                                { label: 'HOA Fees', key: 'hoa' },
                                            ].map((row) => (
                                                <tr key={row.key}>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 border-r">
                                                        {row.label}
                                                    </td>
                                                    {properties.map((property: any, idx: number) => (
                                                        <td key={idx} className="px-4 py-3 text-sm text-gray-700">
                                                            {getValue(property, row.key)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
