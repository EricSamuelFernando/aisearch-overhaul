'use client';

import React from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

const STORAGE_KEY = 'snaphomz_compare_selection';

type CompareItem = {
  id: string;
  label: string;
  price?: number | null;
  image?: string | null;
  address?: string | null;
  cityStateZip?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  yearBuilt?: string | number | null;
  propertyType?: string | null;
  lotSize?: string | null;
  parking?: string | null;
  centralAc?: boolean | null;
  fireplace?: boolean | null;
  pool?: boolean | null;
  hardwood?: boolean | null;
  updatedKitchen?: boolean | null;
  pricePerSqft?: number | null;
  monthlyPayment?: number | null;
  propertyTax?: number | null;
  hoa?: number | null;
};

const parseNumber = (value: any) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value?: number | null, decimals = 0) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
};

const estimateMonthlyPayment = (price?: number | null, ratePct = 6.5, termYears = 30, downPct = 20) => {
  if (!price) return null;
  const downAmount = (price * downPct) / 100;
  const loanAmount = Math.max(0, price - downAmount);
  const r = ratePct / 100 / 12;
  const n = termYears * 12;
  if (n === 0) return null;
  if (r === 0) return loanAmount / n;
  const factor = Math.pow(1 + r, n);
  return (loanAmount * (r * factor)) / (factor - 1);
};

const getListing = (item: any) => item?.listing || item;

const normalizeItem = (item: any, label: string): CompareItem => {
  const listing = getListing(item);
  const address =
    listing?.address ||
    item?.address ||
    item?.public?.address ||
    item?.listing?.address ||
    {};
  const property =
    listing?.property ||
    item?.property ||
    item?.public?.property ||
    item?.listing?.property ||
    {};
  const homedetails = listing?.homedetails || item?.homedetails || {};
  const media = listing?.media || item?.media || {};

  const price =
    parseNumber(listing?.listPriceLow) ??
    parseNumber(listing?.listPrice) ??
    parseNumber(item?.listPrice) ??
    null;

  const sqft =
    parseNumber(property?.livingArea) ??
    parseNumber(property?.livingSquareFeet) ??
    parseNumber(item?.livingArea) ??
    null;

  const pricePerSqft =
    parseNumber(listing?.pricePerSqFt) ??
    parseNumber(item?.pricePerSqFt) ??
    (price && sqft ? price / sqft : null);

  const lotSqft =
    parseNumber(property?.lotSizeSquareFeet) ??
    parseNumber(homedetails?.lotSizeArea) ??
    null;
  const lotAcres = parseNumber(property?.lotSizeAcres);
  const lotSize = lotSqft
    ? `${formatNumber(lotSqft)} sqft`
    : lotAcres
      ? `${lotAcres} acres`
      : null;

  const flooring = String(homedetails?.flooring || '').toLowerCase();
  const tags = item?.tags || listing?.tags || [];
  const remarks = String(item?.publicRemarks || listing?.remarks || '').toLowerCase();

  const propertyTax = parseNumber(homedetails?.taxAmount ?? listing?.taxAmount ?? item?.taxAmount);
  const hoa = parseNumber(property?.associationFee ?? listing?.associationFee ?? item?.associationFee);

  return {
    id: String(
      item?.listingId ||
      listing?.listingId ||
      listing?.mlsNumber ||
      address?.unparsedAddress ||
      label
    ),
    label,
    price,
    image: media?.primaryListingImageUrl || media?.photosList?.[0]?.lowRes || null,
    address: address?.unparsedAddress || address?.label || null,
    cityStateZip: [address?.city, address?.stateOrProvince, address?.zipCode]
      .filter(Boolean)
      .join(', '),
    beds: parseNumber(property?.bedroomsTotal) ?? null,
    baths: parseNumber(property?.bathroomsTotal) ?? null,
    sqft,
    yearBuilt: property?.yearBuilt || null,
    propertyType: property?.propertyType || property?.propertySubType || null,
    lotSize,
    parking: property?.garageSpaces
      ? `${property.garageSpaces}-car garage`
      : null,
    centralAc: String(homedetails?.cooling || '').toLowerCase().includes('central')
      ? true
      : homedetails?.cooling
        ? false
        : null,
    fireplace: typeof homedetails?.fireplaceYn === 'boolean'
      ? homedetails.fireplaceYn
      : null,
    pool: typeof property?.hasPool === 'boolean' ? property.hasPool : null,
    hardwood: flooring.includes('wood') || flooring.includes('hardwood') ? true : flooring ? false : null,
    updatedKitchen: tags.some((tag: string) => /kitchen/i.test(tag)) || remarks.includes('kitchen'),
    pricePerSqft,
    monthlyPayment: estimateMonthlyPayment(price),
    propertyTax,
    hoa,
  };
};

const renderBoolean = (value?: boolean | null) => {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
  return value ? (
    <Check className="w-4 h-4 text-green-600 mx-auto" />
  ) : (
    <X className="w-4 h-4 text-gray-400 mx-auto" />
  );
};

const ComparePage = () => {
  const router = useRouter();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [items, setItems] = React.useState<CompareItem[]>([]);
  const compareColumnCount = Math.max(items.length, 1);

  React.useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const base = parsed?.base ? normalizeItem(parsed.base, 'Current Property') : null;
      const selected = Array.isArray(parsed?.selected)
        ? parsed.selected.map((item: any, index: number) => normalizeItem(item, `Similar ${index + 1}`))
        : [];
      const nextItems = [base, ...selected].filter(Boolean) as CompareItem[];
      setItems(nextItems);
    } catch (err) {
      console.error('Failed to parse compare data', err);
    }
  }, []);

  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#F8F5F1] px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Compare homes</h1>
          <p className="text-gray-600 mb-6">
            We could not find any selected homes to compare. Please return to the property page and
            select up to three similar homes.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/buy/${propertyId}/prop/preview`)}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-900 transition-colors"
          >
            Back to property
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'Basic Information',
      rows: [
        { label: 'Bedrooms', render: (item: CompareItem) => formatNumber(item.beds) },
        { label: 'Bathrooms', render: (item: CompareItem) => formatNumber(item.baths) },
        { label: 'Square Feet', render: (item: CompareItem) => formatNumber(item.sqft) },
        { label: 'Year Built', render: (item: CompareItem) => item.yearBuilt ?? '—' },
        { label: 'Property Type', render: (item: CompareItem) => item.propertyType ?? '—' },
        { label: 'Lot Size', render: (item: CompareItem) => item.lotSize ?? '—' },
      ],
    },
    {
      title: 'Features & Amenities',
      rows: [
        { label: 'Parking', render: (item: CompareItem) => item.parking ?? '—' },
        { label: 'Central A/C', render: (item: CompareItem) => renderBoolean(item.centralAc) },
        { label: 'Fireplace', render: (item: CompareItem) => renderBoolean(item.fireplace) },
        { label: 'Pool', render: (item: CompareItem) => renderBoolean(item.pool) },
        { label: 'Hardwood Floors', render: (item: CompareItem) => renderBoolean(item.hardwood) },
        { label: 'Updated Kitchen', render: (item: CompareItem) => renderBoolean(item.updatedKitchen) },
      ],
    },
    {
      title: 'Financial Details',
      rows: [
        { label: 'Price per sqft', render: (item: CompareItem) => formatCurrency(item.pricePerSqft, 0) },
        { label: 'Monthly Payment', render: (item: CompareItem) => formatCurrency(item.monthlyPayment, 0) },
        { label: 'Property Tax', render: (item: CompareItem) => item.propertyTax ? formatCurrency(item.propertyTax, 0) : '—' },
        { label: 'HOA Fees', render: (item: CompareItem) => item.hoa ? formatCurrency(item.hoa, 0) : '—' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F1] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Buy Listing - AI Search - Grid</p>
            <h1 className="text-3xl font-semibold text-gray-900 mt-2">Which property is right for you?</h1>
            <p className="text-sm text-gray-600 mt-1">Compare specifications, location, and value side by side.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/buy/${propertyId}/prop/preview`)}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-900 transition-colors"
          >
            Back to property
          </button>
        </div>

        <div className="overflow-x-auto mb-10">
          <div className="min-w-[900px] flex gap-4">
            <div className="min-w-[12rem] flex items-center justify-center text-sm font-semibold text-gray-700">
              Property details
            </div>
            <div
              className="grid flex-1 gap-4"
              style={{ gridTemplateColumns: `repeat(${compareColumnCount}, minmax(0, 1fr))` }}
            >
              {items.map((item, index) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.address || 'Property'} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-xs font-semibold bg-orange-600 text-white px-3 py-1 rounded-full">
                      {index === 0 ? 'Current Home' : 'Similar Home'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-gray-700">{item.address ?? '—'}</p>
                    <p className="text-xs text-gray-500">{item.cityStateZip ?? '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="mb-8">
            <div className="inline-flex items-center px-6 py-2 bg-black text-white rounded-full text-sm font-semibold">
              {section.title}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-2 table-fixed">
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="bg-white rounded-xl shadow-sm">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 w-48">
                        {row.label}
                      </td>
                      {items.map((item) => (
                        <td key={`${row.label}-${item.id}`} className="py-3 px-4 text-center text-sm text-gray-900">
                          {row.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparePage;
