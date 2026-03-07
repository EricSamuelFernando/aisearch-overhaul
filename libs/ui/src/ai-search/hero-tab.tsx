'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { askQuestion, searchProperties, cancelActiveTask, fetchHistory, fetchSessionDetails, clearHistoryAPI, suggestAddresses } from '@/lib/api';
import type { QuestionPayload, AddressSuggestion } from '@/lib/api';
import { isMlsBypassModeEnabled, setMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';
import { detectIntent } from '@/lib/chatRouting';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Sparkles, Paperclip, X, ArrowUp, Mic, Search as SearchIcon, FileText, Image as ImageIcon, ChevronDown, ChevronUp, MapPin, School, Shield, Footprints, Thermometer, CloudSun, BedDouble, Bath, Square, Scaling, Calendar, Clock, TrendingUp, GraduationCap, Trees, Plus, Lightbulb, Droplets, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import SchoolMapPanel from '@/components/SchoolMapPanel';
import InteractiveSchoolMapPanel from '@/components/InteractiveSchoolMapPanel';


// Force refresh logic
// Mock notifications
const success = (msg: { message: string }) => console.log('Success:', msg.message);
const error = (msg: { message: string }) => console.error('Error:', msg.message);

// --- Types & Interfaces ---
interface Suggestion {
  id: string;
  text: string;
}

interface LocationSuggestion {
  placeId: string;
  description: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  attachmentName?: string;
  intent?: string;

  query?: string;
  query_history_formatted?: string;
  relatedProperties?: any[];
  allProperties?: any[];  // All properties for pagination
  totalMatches?: number;  // Total number of matches
  relatedQuestions?: string[];
  showSchools?: boolean;
  relatedSchools?: {
    name: string;
    distance: string;
    rating: string;
    type: string;
    meta?: string;
    sector?: string;
    level?: string;
  }[];

  schoolAddress?: string;
  isForecast?: boolean;
  forecastData?: ForecastPoint[];
  map?: any;
}

type ForecastPoint = { date: string; rate: number };

// Helper to bold text
const renderTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Helper to render table
const renderTable = (rows: string[], key: string) => {
  // 1. Remove separator lines (e.g. |---|)
  const contentRows = rows.filter(r => !r.trim().match(/^\|\s*:?-+:?\s*\|/));
  if (contentRows.length === 0) return null;

  // 2. Extract Headers & Body
  const header = contentRows[0];
  const body = contentRows.slice(1);

  const parseRow = (row: string) => row.split('|').filter((c, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());

  const headers = parseRow(header);

  return (
    <div key={key} className="my-6 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {renderTextWithBold(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {body.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {parseRow(row).map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {renderTextWithBold(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SNAP_RESULTS_BATCH_SIZE = 10;
const SNAP_NO_KEYWORDS = [
  'no',
  'nope',
  'nah',
  'not yet',
  'not really',
  'still looking',
  'more',
  'show me more',
  'need more',
  'keep going',
  'none of these',
  "didn't see it",
  'did not see it',
  'no thanks',
  'no thank you'
];
const SNAP_YES_KEYWORDS = [
  'yes',
  'yeah',
  'yep',
  'yup',
  'found it',
  'got it',
  'i did',
  'i found it',
  'all set',
  'done',
  'y',
  'yes please'
];

const DEFAULT_MAIN_SITE_URL = 'https://demo.snaphomz.com';

const getMainSiteBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_MAIN_SITE_URL || DEFAULT_MAIN_SITE_URL;
  return raw.replace(/\/+$/, '');
};

const normalizeAuthToken = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'string' && parsed.trim()) return parsed.trim();
  } catch {
    // Value was not JSON-encoded; use it as-is.
  }
  return trimmed;
};

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const encodedKey = `${encodeURIComponent(name)}=`;
  const rawKey = `${name}=`;
  const cookieParts = document.cookie.split(';');

  for (const segment of cookieParts) {
    const cookie = segment.trim();
    if (cookie.startsWith(encodedKey)) {
      return decodeURIComponent(cookie.slice(encodedKey.length));
    }
    if (cookie.startsWith(rawKey)) {
      return decodeURIComponent(cookie.slice(rawKey.length));
    }
  }
  return undefined;
};

const getCrossAppAuthToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  const cookieTokenNames = [
    'oc_real_agent_token',
    '__WEB_APP_Ocreal345####btny_ocreal',
  ];

  for (const cookieName of cookieTokenNames) {
    const token = normalizeAuthToken(getCookieValue(cookieName));
    if (token) return token;
  }

  const localStorageKeys = ['userAccessToken', 'userAccessTokenAgent'];
  for (const storageKey of localStorageKeys) {
    const token = normalizeAuthToken(window.localStorage.getItem(storageKey));
    if (token) return token;
  }

  return undefined;
};

const withMainSiteAuthRedirect = (targetUrl: string): string => {
  const token = getCrossAppAuthToken();
  if (!token) return targetUrl;

  try {
    const mainSiteBase = getMainSiteBaseUrl();
    const mainSiteUrl = new URL(mainSiteBase);
    const destinationUrl = new URL(targetUrl);

    // Never attach auth token when the destination is outside main Snaphomz site.
    if (destinationUrl.origin !== mainSiteUrl.origin) {
      return targetUrl;
    }

    const redirectPath = `${destinationUrl.pathname}${destinationUrl.search}`;
    // Use the destination path itself as handoff URL so deployments that don't
    // process /home token links still receive token + redirect correctly.
    const handoffUrl = new URL(redirectPath || '/', mainSiteUrl.origin);
    handoffUrl.searchParams.set('token', token);
    handoffUrl.searchParams.set('redirect', redirectPath);
    return handoffUrl.toString();
  } catch {
    return targetUrl;
  }
};

const pickFirstValidId = (candidates: any[]): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    const raw = String(candidate).trim();
    if (!raw) continue;
    if (raw === '0' || /^null$/i.test(raw) || /^undefined$/i.test(raw)) continue;

    // MLS/detail IDs should not be negative; skip them and try the next candidate.
    if (/^-?\d+$/.test(raw)) {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed <= 0) continue;
      return String(Math.trunc(parsed));
    }

    return raw;
  }
  return undefined;
};

const resolveListingId = (property: any) =>
  pickFirstValidId([
    property?.listingId,
    property?.listing_id,
    property?.ListingId,
    property?.mls_id,
    property?.zpid,
    property?.propertyId,
    property?.property_id,
    property?.id,
  ]);

const resolvePropertyId = (property: any) =>
  pickFirstValidId([
    property?.propertyId,
    property?.property_id,
    property?.zpid,
    property?.id,
    property?.listingId,
    property?.listing_id,
    property?.ListingId,
    property?.mls_id,
  ]) ??
  resolveListingId(property);

const buildStableFallbackId = (property: any, prefix: string, index: number) => {
  const addressSeed =
    property?.address ||
    property?.formattedAddress ||
    property?.fullAddress ||
    property?.street ||
    'unknown';
  const normalizedSeed = String(addressSeed).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${prefix}-${normalizedSeed}-${index}`;
};

const toMainSitePropertyPreviewUrl = (property: any, fallbackQuery?: string) => {
  const mainSiteBase = getMainSiteBaseUrl();
  const listingId = resolveListingId(property);
  const propertyId = resolvePropertyId(property);
  const province = property?.state || property?.province || property?.stateOrProvince;
  const mostRecentStatus = property?.homeStatus || property?.status || property?.mostRecentStatus;

  if (listingId !== undefined && listingId !== null && String(listingId).trim() !== '') {
    const params = new URLSearchParams();
    params.set('listingId', String(listingId));
    if (propertyId !== undefined && propertyId !== null && String(propertyId).trim() !== '') {
      params.set('propertyId', String(propertyId));
    }
    if (property?.city) {
      params.set('city', String(property.city));
    }
    if (province) {
      params.set('province', String(province));
    }
    if (mostRecentStatus) {
      params.set('mostRecentStatus', String(mostRecentStatus));
    }

    const previewPath = `/buy/${encodeURIComponent(String(listingId))}/prop/preview`;
    const targetUrl = `${mainSiteBase}${previewPath}?${params.toString()}`;
    return withMainSiteAuthRedirect(targetUrl);
  }

  const listingUrl = property?.listingUrl || property?.listing_url || property?.url;
  if (typeof listingUrl === 'string' && listingUrl.trim()) {
    const trimmed = listingUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const absoluteUrl = `${mainSiteBase}${normalizedPath}`;
    return withMainSiteAuthRedirect(absoluteUrl);
  }

  if (fallbackQuery) {
    const browsePath = `/buy/browse`;
    const params = new URLSearchParams();
    params.set('q', fallbackQuery);
    const targetUrl = `${mainSiteBase}${browsePath}?${params.toString()}`;
    return withMainSiteAuthRedirect(targetUrl);
  }

  const browsePath = `/buy/browse`;
  const targetUrl = `${mainSiteBase}${browsePath}`;
  return withMainSiteAuthRedirect(targetUrl);
};

const parseNumericValue = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const DEFAULT_AUTH_GRAPHQL_URL = 'http://localhost:4000/auth/graphql';

const getAuthGraphqlUrl = () =>
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || DEFAULT_AUTH_GRAPHQL_URL;

const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const resolveUserIdFromToken = (token?: string): string | undefined => {
  const normalizedToken = normalizeAuthToken(token);
  if (!normalizedToken) return undefined;
  const payload = decodeJwtPayload(normalizedToken);
  return pickFirstValidId([payload?.id, payload?.userId, payload?.sub, payload?.uid]);
};

const resolvePropertyIdentityKey = (property: any): string | undefined =>
  pickFirstValidId([
    resolvePropertyId(property),
    resolveListingId(property),
    property?.id,
    property?.propertyId,
    property?.listingId,
  ]);

const resolvePropertyAddressText = (property: any): string => {
  if (typeof property?.address === 'string') return property.address;
  if (typeof property?.formattedAddress === 'string') return property.formattedAddress;
  if (typeof property?.fullAddress === 'string') return property.fullAddress;
  if (typeof property?.streetAddress === 'string') return property.streetAddress;
  if (typeof property?.address?.unparsedAddress === 'string') return property.address.unparsedAddress;
  return '';
};

const resolvePrimaryPropertyImage = (property: any): string | undefined => {
  const imageCandidates = Array.isArray(property?.images)
    ? property.images
    : Array.isArray(property?.photos)
      ? property.photos
      : [];

  const galleryImages = imageCandidates
    .map((img: any) => {
      if (typeof img === 'string') return img;
      return img?.highRes || img?.midRes || img?.lowRes || img?.url || null;
    })
    .filter(Boolean);

  return (
    property?.image ||
    property?.primaryImage ||
    property?.primaryListingImageUrl ||
    property?.listing?.media?.primaryListingImageUrl ||
    galleryImages[0] ||
    undefined
  );
};

const buildFavouritePayload = (property: any, snapId: string) => {
  const listingId = resolveListingId(property);
  const propertyId = resolvePropertyId(property);
  const resolvedListingId = listingId ?? propertyId;
  const resolvedPropertyId = propertyId ?? listingId;

  if (!resolvedListingId || !resolvedPropertyId) return null;

  const address = resolvePropertyAddressText(property);
  const city =
    property?.city ||
    property?.address?.city ||
    property?.listing?.address?.city ||
    '';
  const zipCode =
    property?.zipCode ||
    property?.zipcode ||
    property?.zip_code ||
    property?.address?.zipCode ||
    property?.listing?.address?.zipCode ||
    '';
  const price =
    parseNumericValue(property?.listPrice ?? property?.price) ??
    parseNumericValue(property?.listing?.listPriceLow) ??
    0;
  const bedRooms =
    parseNumericValue(property?.beds ?? property?.bedrooms ?? property?.bedroomTotal) ??
    parseNumericValue(property?.listing?.property?.bedroomsTotal) ??
    0;
  const bathRooms =
    parseNumericValue(property?.baths ?? property?.bathrooms ?? property?.bathroomTotal) ??
    parseNumericValue(property?.listing?.property?.bathroomsTotal) ??
    0;
  const sqft =
    parseNumericValue(property?.sqft ?? property?.livingArea) ??
    parseNumericValue(property?.listing?.property?.livingArea) ??
    0;
  const image = resolvePrimaryPropertyImage(property);
  const name =
    property?.name ||
    property?.listing?.courtesyOf ||
    (address ? address.split(',')[0].trim() : '') ||
    'Property';

  return {
    snapId,
    name,
    address,
    city,
    zipCode,
    price,
    image,
    bedRooms,
    bathRooms: String(bathRooms),
    sqft: String(sqft),
    listingId: String(resolvedListingId),
    propertyId: String(resolvedPropertyId),
  };
};

interface HeroTabProps {
  enableAgentFavorites?: boolean;
  agentUserId?: string;
}

interface HeroSearchFormProps {
  placeholderText?: string;
  onSearchStateChange?: (isActive: boolean, searchTerm: string) => void;
  isSearchActive?: boolean;
  searchType?: string;
  showOutline?: boolean;
  disableAutoExpand?: boolean;
  enableAgentFavorites?: boolean;
  agentUserId?: string;
}

interface AgentSnapCollection {
  id?: string;
  name?: string;
  favourites?: Array<{
    id?: string;
    propertyId?: string;
    listingId?: string;
  }>;
}

const buildPreviewFallbackListing = (property: any) => {
  const listingId = resolveListingId(property);
  const propertyId = resolvePropertyId(property);
  const imageCandidates = Array.isArray(property?.images)
    ? property.images
    : Array.isArray(property?.photos)
      ? property.photos
      : [];
  const galleryImages = imageCandidates
    .map((img: any) => {
      if (typeof img === 'string') return img;
      return img?.highRes || img?.midRes || img?.lowRes || img?.url || null;
    })
    .filter(Boolean);
  const primaryImage =
    property?.image ||
    property?.primaryListingImageUrl ||
    property?.primaryImage ||
    galleryImages[0] ||
    null;
  const photosList = (galleryImages.length ? galleryImages : primaryImage ? [primaryImage] : []).map((url: string) => ({
    lowRes: url,
    midRes: url,
    highRes: url,
    url,
  }));
  const rawAddress =
    property?.address ||
    property?.unparsedAddress ||
    property?.streetAddress ||
    property?.formattedAddress ||
    '';
  const listPriceValue = parseNumericValue(property?.listPrice ?? property?.price);

  return {
    listingId: listingId ?? propertyId,
    propertyId: propertyId ?? listingId,
    listPrice: listPriceValue ?? property?.listPrice ?? property?.price ?? null,
    listPriceLow: listPriceValue ?? property?.listPrice ?? property?.price ?? null,
    zpid: property?.zpid ?? propertyId ?? listingId,
    address: {
      unparsedAddress: rawAddress,
      city: property?.city || '',
      stateOrProvince: property?.state || property?.province || property?.stateOrProvince || '',
      zipCode: property?.zipCode || property?.zipcode || property?.zip_code || '',
      countyOrParish: property?.countyOrParish || '',
    },
    property: {
      bedroomsTotal: parseNumericValue(property?.beds ?? property?.bedrooms ?? property?.bedroomTotal),
      bathroomsTotal: parseNumericValue(property?.baths ?? property?.bathrooms ?? property?.bathroomTotal),
      livingArea: parseNumericValue(property?.sqft ?? property?.livingArea),
      yearBuilt: property?.yearBuilt || null,
      propertyType: property?.propertyType || property?.homeType || property?.type || 'Residential',
      hasPool: Boolean(property?.hasPool ?? property?.has_pool),
      latitude: parseNumericValue(property?.latitude ?? property?.lat),
      longitude: parseNumericValue(property?.longitude ?? property?.lon ?? property?.long),
    },
    homedetails: {
      flooring: '',
      fireplaceYn: false,
    },
    media: {
      primaryListingImageUrl: primaryImage,
      photosList,
    },
    publicRemarks: property?.description || '',
    tags: Array.isArray(property?.features) ? property.features : [],
    standardStatus: property?.homeStatus || property?.status || property?.mostRecentStatus || 'Active',
    mostRecentStatus: property?.homeStatus || property?.status || property?.mostRecentStatus || 'Active',
    daysOnMarket: property?.daysOnMarket ?? null,
    listingContractDate: property?.listingContractDate ?? null,
    latitude: parseNumericValue(property?.latitude ?? property?.lat),
    longitude: parseNumericValue(property?.longitude ?? property?.lon ?? property?.long),
    url: property?.listingUrl || property?.listing_url || property?.url || null,
  };
};

const storePreviewFallback = (property: any) => {
  if (typeof window === 'undefined') return;
  const listingId = resolveListingId(property);
  const propertyId = resolvePropertyId(property);
  const cacheIds = [listingId, propertyId].filter(
    (value): value is string => value !== undefined && value !== null && String(value).trim() !== ''
  );
  if (!cacheIds.length) return;

  const fallbackPayload = {
    listingId: String(listingId || propertyId),
    listing: buildPreviewFallbackListing(property),
  };

  cacheIds.forEach((cacheId) => {
    localStorage.setItem(
      `snaphomz_preview_fallback_${String(cacheId)}`,
      JSON.stringify(fallbackPayload)
    );
  });
};

const mapSnapProperties = (rawProperties: any[]) => {
  return (rawProperties || []).map((p: any, index: number) => {
    let mainImage =
      p.primaryListingImageUrl ||
      p.primaryImage ||
      p.imgSrc ||
      p.image ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

    let galleryImages: string[] = [];

    const parseImageArray = (source: any) => {
      if (!source) return [];
      if (Array.isArray(source)) {
        return source
          .map((x: any) => {
            if (typeof x === 'string') return x;
            return x?.highRes || x?.midRes || x?.url || x?.lowRes || null;
          })
          .filter(Boolean);
      }
      if (typeof source === 'string') {
        try {
          const parsed = JSON.parse(source);
          return parseImageArray(parsed);
        } catch {
          return [];
        }
      }
      return [];
    };

    galleryImages = parseImageArray(p.photoListJson);
    if (!galleryImages.length) {
      galleryImages = parseImageArray(p.photoList);
    }
    if (!galleryImages.length) {
      galleryImages = parseImageArray(p.photos);
    }

    if (galleryImages.length > 0 && mainImage.includes('unsplash')) {
      mainImage = galleryImages[0];
    }
    if (galleryImages.length === 0 && !mainImage.includes('unsplash')) {
      galleryImages = [mainImage];
    }
    if (galleryImages.length === 0) {
      galleryImages = [mainImage];
    }

    const price = p.price || p.listPrice || '$0';
    const fmtPrice = typeof price === 'number' ? `$${price.toLocaleString()}` : price;
    const address = p.address || p.formattedAddress || p.fullAddress ||
      (p.street ? `${p.street}, ${p.city}, ${p.state}` : 'Address Unavailable');

    const schoolsRaw = p.nearby_schools || p.schools;
    const localParseSchools = (schoolsData: any) => {
      if (!schoolsData) return [];
      if (Array.isArray(schoolsData)) return schoolsData;
      if (typeof schoolsData === 'string') {
        try {
          return JSON.parse(schoolsData);
        } catch {
          return [];
        }
      }
      return [];
    };
    const schools = localParseSchools(schoolsRaw).map((s: any) => ({
      name: s.name || s.schoolName || "Local School",
      type: s.type || s.level || "School",
      distance: s.distance ? `${s.distance} mi` : "Nearby",
      rating: s.rating ? `${s.rating}/10` : "N/A"
    })).slice(0, 3);

    const listingId = resolveListingId(p);
    const propertyId = resolvePropertyId(p);
    const cardIdentity = listingId ?? propertyId;
    const cardId = cardIdentity ?? buildStableFallbackId(p, 'snap', index);
    const listingUrl = p.listing_url || p.url || p.hdpUrl;

    return {
      id: cardId,
      listingId,
      propertyId,
      listingUrl,
      displayIndex: p.display_index || p.displayIndex || index + 1,
      image: mainImage,
      price: fmtPrice,
      address,
      latitude: p.latitude || p.lat,
      longitude: p.longitude || p.lon || p.long,
      city: p.city,
      state: p.state,
      beds: p.beds || p.bedrooms || p.bedroomTotal || 0,
      baths: p.baths || p.bathrooms || p.bathroomTotal || 0,
      sqft: p.livingArea || p.sqft || 'N/A',
      schoolRating: schools[0]?.rating || 'N/A',
      type: p.propertyType || p.homeType || 'Residential',
      description: p.description || `Match score: ${p.similarity_score?.toFixed(1) || 'N/A'}% - Found via image recognition`,
      features: p.features || ['Image Match', `Similarity: ${p.similarity_score?.toFixed(1) || 'N/A'}%`],
      schools,
      insights: {
        price: fmtPrice,
        safety: 'N/A',
        walkability: 'N/A',
        climate: 'N/A'
      },
      images: galleryImages,
      matchDistance: p.match_distance
    };
  });
};

// Helper to format AI response cleanly
const formatMessageContent = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');
  const formattedElements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let currentTableRows: string[] = [];

  const flushList = (idx: number) => {
    if (currentListItems.length > 0) {
      formattedElements.push(
        <ul key={`ul-${idx}`} className="list-disc pl-5 mb-4 space-y-1 text-gray-600">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  const flushTable = (idx: number) => {
    if (currentTableRows.length > 0) {
      formattedElements.push(renderTable(currentTableRows, `table-${idx}`) as React.ReactNode);
      currentTableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Check Table Rows
    if (trimmed.startsWith('|')) {
      flushList(index); // Close list if open
      currentTableRows.push(trimmed);
      return;
    }

    // Not a table row -> Flush table if exists
    flushTable(index);

    // 2. List Items
    if (trimmed.startsWith('- ')) {
      const content = trimmed.substring(2);
      currentListItems.push(
        <li key={`li-${index}`} className="mb-1 text-gray-600">
          {renderTextWithBold(content)}
        </li>
      );
      return;
    } else {
      flushList(index); // Not a list item -> close list
    }

    if (!trimmed) {
      return;
    }

    // 3. Headings
    if (trimmed.startsWith('### ')) {
      formattedElements.push(<h4 key={`h4-${index}`} className="text-base font-bold text-gray-800 mt-5 mb-2">{renderTextWithBold(trimmed.substring(4))}</h4>);
    }
    else if (trimmed.startsWith('## ')) {
      formattedElements.push(<h3 key={`h3-${index}`} className="text-lg font-bold text-gray-900 mt-6 mb-3">{renderTextWithBold(trimmed.substring(3))}</h3>);
    } else if (trimmed.startsWith('# ')) {
      formattedElements.push(<h2 key={`h2-${index}`} className="text-xl font-bold text-gray-900 mt-6 mb-4">{renderTextWithBold(trimmed.substring(2))}</h2>);
    } else {
      // Paragraph
      formattedElements.push(
        <p key={`p-${index}`} className="mb-2 text-gray-600">
          {renderTextWithBold(trimmed)}
        </p>
      );
    }
  });

  // Final Flush
  flushList(lines.length);
  flushTable(lines.length);

  return formattedElements;
};

const normalizePoolValue = (value: any): boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (!v) return null;
    if (["yes", "y", "true", "1"].includes(v)) return true;
    if (["no", "n", "false", "0"].includes(v)) return false;
  }
  return null;
};

export default function HeroTab({ enableAgentFavorites = false, agentUserId }: HeroTabProps) {
  const [activeTab, setActiveTab] = useState<string | null>('buy');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full px-2 sm:px-6 mx-auto flex max-w-[2200px] flex-col items-center transition-all duration-500 ease-in-out">
      {/* Tabs */}
      <div className={`flex flex-row items-center gap-x-1 mb-2 transition-all duration-300 ${isExpanded ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-8'}`}>
        {['buy', 'sell'].map((item) => (
          <div
            key={item}
            onClick={() => setActiveTab(item)}
            className={`flex h-8 cursor-pointer items-center justify-center rounded-tl-md rounded-tr-md px-4 transition-colors ${activeTab?.toLowerCase() === item.toLowerCase()
              ? 'bg-white/10 text-white font-semibold'
              : 'text-white/60 hover:text-white'
              }`}
          >
            <h3 className="text-sm uppercase tracking-wide">{item}</h3>
          </div>
        ))}
      </div>
      <HeroSearchForm
        onSearchStateChange={(expanded) => setIsExpanded(expanded)}
        enableAgentFavorites={enableAgentFavorites}
        agentUserId={agentUserId}
      />
    </div>
  );
}

export const HeroSearchForm = ({ placeholderText, onSearchStateChange, isSearchActive, enableAgentFavorites = false, agentUserId }: HeroSearchFormProps) => {
  // --- Hooks & State ---
  // Mocked state
  const searchCount = 0;
  const user = null;
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isLoadingAddressSuggestions, setIsLoadingAddressSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // Controls expansion state (Collapsed Search Bar vs Expanded Chat UI)
  const [isExpanded, setIsExpanded] = useState(false);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageRef = useRef<File | null>(null);
  // Menu State for AI Badge
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Session State for Conversation Persistence
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [mlsBypassMode, setMlsBypassMode] = useState(false);
  const [pendingLocationImage, setPendingLocationImage] = useState<File | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [pendingImageStatus, setPendingImageStatus] = useState<'idle' | 'processing' | 'ready'>('idle');
  const [submittedImage, setSubmittedImage] = useState<File | null>(null);
  const [snapSearchInProgress, setSnapSearchInProgress] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  // Rent Vs Buy State

  useEffect(() => {
    setMlsBypassMode(isMlsBypassModeEnabled());

    const handleBypassChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMlsBypassMode(customEvent.detail);
        return;
      }
      setMlsBypassMode(isMlsBypassModeEnabled());
    };

    window.addEventListener('snaphomz:mls-bypass-changed', handleBypassChange as EventListener);
    return () => {
      window.removeEventListener('snaphomz:mls-bypass-changed', handleBypassChange as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!isMenuOpen) return;

    const loadHistory = async () => {
      try {
        const sessions = await fetchHistory();
        if (!cancelled) {
          setRecentSessions(Array.isArray(sessions) ? sessions : []);
        }
      } catch (e) {
        console.error("Failed to fetch history:", e);
        if (!cancelled) setRecentSessions([]);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [isMenuOpen]);

  // Dynamic Loading State
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Analyzing your request...",
    "Identifying target location...",
    "Scanning property database...",
    "Fetching school ratings...",
    "Curating top matches..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      setLoadingStep(0);
      interval = setInterval(() => {
        // Loop through messages instead of stopping at the last one
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000); // Slower interval (3 seconds)
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  // Chat History State (consolidated below)

  // Forecast State
  const [forecastHorizon, setForecastHorizon] = useState<6 | 12 | 24>(24);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Interactive chart state
  const [activeForecastPoint, setActiveForecastPoint] = useState<ForecastPoint | null>(null);
  const [activeForecastPosition, setActiveForecastPosition] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const [isForecastHovered, setIsForecastHovered] = useState(false);

  // Helper functions for chart
  const formatForecastTickLabel = (date: string) => {
    const d = new Date(date);
    // Return Month Year (e.g. Jan 26)
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };
  const formatForecastYearLabel = (date: string) => {
    return ''; // Can be customized
  };
  const formatForecastTooltipLabel = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });
  };

  const fetchForecast = async (horizon: number) => {
    setForecastLoading(true);
    setForecastError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/forecast?horizon=${horizon}&ensemble=true`);
      const data = await res.json();

      // Transform logic
      const f = data.forecast || {};
      const dates = f.dates || [];
      const rates = f.central || f.rates || []; // Prefer central

      const points = dates.map((d: string, i: number) => ({
        date: d,
        rate: rates[i] || 0
      }));
      return points;
    } catch (e: any) {
      console.error(e);
      setForecastError(e.message);
      return [];
    } finally {
      setForecastLoading(false);
    }
  };

  // New state for property selection & expansion
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | number | null>(null);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | number | null>(null);

  const handleAttachmentClick = (type: 'image' | 'pdf') => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.accept = type === 'image' ? "image/*" : "application/pdf";
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const suggestions: Suggestion[] = [
    { id: '1', text: '3-bedroom homes near top-rated schools in Manhattan Beach' },
    { id: '2', text: "I'm looking for 4-bedroom houses in Los Angeles, California with a pool" },
    { id: '3', text: "Explain what an HOA is like I’m 5." },
    { id: '4', text: 'What is the monthly payment on a $240,000 loan at 6% for 30 years?' },
  ];


  // --- State for Real Data ---
  const [properties, setProperties] = useState<any[]>([]); // Accumulates all properties
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Stores conversation
  const [snapResultsShown, setSnapResultsShown] = useState(0);
  const [snapCachedProperties, setSnapCachedProperties] = useState<any[]>([]);
  const [snapResultsPage, setSnapResultsPage] = useState(0);
  const [snapLastUploadFile, setSnapLastUploadFile] = useState<File | null>(null);
  const [snapLastManualLocation, setSnapLastManualLocation] = useState<{ latitude?: string; longitude?: string; query?: string } | null>(null);
  const [snapIsFetchingMore, setSnapIsFetchingMore] = useState(false);
  const [awaitingSnapConfirmation, setAwaitingSnapConfirmation] = useState(false);
  const [snapConfirmationMessageId, setSnapConfirmationMessageId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastIntentRef = useRef<string | null>(null);
  const addressSuggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationSuggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedSchoolLists, setExpandedSchoolLists] = useState<Record<string, boolean>>({});
  const [nearbySchoolsById, setNearbySchoolsById] = useState<Record<string, { status: 'idle' | 'loading' | 'ready' | 'error'; schools: any[]; error?: string; schoolType?: string; fallbackUsed?: boolean }>>({});
  const [agentFavouriteSavingId, setAgentFavouriteSavingId] = useState<string | null>(null);
  const [agentFavouriteSavedMap, setAgentFavouriteSavedMap] = useState<Record<string, boolean>>({});
  const [agentFavouriteMessage, setAgentFavouriteMessage] = useState<string | null>(null);
  const [agentFavouriteModalOpen, setAgentFavouriteModalOpen] = useState(false);
  const [agentFavouriteModalProperty, setAgentFavouriteModalProperty] = useState<any | null>(null);
  const [agentSnapCollections, setAgentSnapCollections] = useState<AgentSnapCollection[]>([]);
  const [agentSnapLoading, setAgentSnapLoading] = useState(false);
  const [agentCreateSnapOpen, setAgentCreateSnapOpen] = useState(false);
  const [agentNewSnapName, setAgentNewSnapName] = useState('');
  const [agentCollaborativeOpen, setAgentCollaborativeOpen] = useState(false);
  const [agentCollaborativeStep, setAgentCollaborativeStep] = useState<1 | 2>(1);
  const [agentCollaborativeSnapName, setAgentCollaborativeSnapName] = useState('');
  const [agentCollaborativeSnapId, setAgentCollaborativeSnapId] = useState<string | null>(null);
  const [agentInviteType, setAgentInviteType] = useState<'co-buyer' | 'agent' | 'other'>('co-buyer');
  const [agentInviteEmail, setAgentInviteEmail] = useState('');

  const startNewChat = React.useCallback((options?: { focusInput?: boolean }) => {
    setIsExpanded(true);
    setSearchTerm('');
    setChatHistory([]);
    setSessionId(null);
    setIsSearching(false);
    setIsMenuOpen(false);
    setSelectedPropertyId(null);
    setExpandedPropertyId(null);
    setNearbySchoolsById({});
    if (onSearchStateChange) onSearchStateChange(true, '');

    if (options?.focusInput) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 120);
    }
  }, [onSearchStateChange, setChatHistory, setExpandedPropertyId, setIsExpanded, setIsMenuOpen, setIsSearching, setNearbySchoolsById, setSearchTerm, setSelectedPropertyId, setSessionId]);

  useEffect(() => {
    const handleOpenSearch = (event: Event) => {
      const customEvent = event as CustomEvent<{ focusInput?: boolean }>;
      startNewChat({ focusInput: customEvent.detail?.focusInput });
    };

    window.addEventListener('snaphomz:open-hero-search', handleOpenSearch as EventListener);
    return () => {
      window.removeEventListener('snaphomz:open-hero-search', handleOpenSearch as EventListener);
    };
  }, [startNewChat]);

  useEffect(() => {
    return () => {
      if (addressSuggestDebounceRef.current) {
        clearTimeout(addressSuggestDebounceRef.current);
      }
      if (locationSuggestDebounceRef.current) {
        clearTimeout(locationSuggestDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setAgentFavouriteMessage(null);
  }, [expandedPropertyId, agentFavouriteModalProperty?.id]);

  const toggleMlsBypass = () => {
    const next = !mlsBypassMode;
    setMlsBypassModeEnabled(next);
    setMlsBypassMode(next);
    if (next) {
      setSessionId(null);
      setRecentSessions([]);
    }
  };

  const appendAssistantMessage = (content: string) => {
    const msgId = (Date.now() + Math.random()).toString();
    const assistantMsg: ChatMessage = { id: msgId, role: 'assistant', content };
    setChatHistory(prev => [...prev, assistantMsg]);
    return msgId;
  };

  const resetPendingImageSelection = () => {
    pendingImageRef.current = null;
    setPendingImage(null);
    setPendingImagePreview(null);
    setPendingImageStatus('idle');
    setSubmittedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderPendingImageChip = (variant: 'collapsed' | 'expanded') => {
    if (!pendingImage && !pendingImagePreview) return null;
    const statusText = pendingImageStatus === 'processing' ? 'Preparing image...' : 'Add location and send';
    const isExpandedVariant = variant === 'expanded';
    const padding = isExpandedVariant ? 'pl-3 pr-2 py-2' : 'pl-2.5 pr-2 py-1.5';
    const thumbSize = isExpandedVariant ? 'w-10 h-10' : 'w-9 h-9';
    const textClass = isExpandedVariant ? 'text-sm' : 'text-xs';
    const statusClass = isExpandedVariant ? 'text-xs' : 'text-[11px]';
    const gap = isExpandedVariant ? 'gap-3' : 'gap-2';
    const maxWidth = isExpandedVariant ? 'max-w-[130px] sm:max-w-[220px]' : 'max-w-[180px] sm:max-w-[210px]';

    return (
      <div
        className={`flex items-center ${gap} bg-white border border-gray-200 rounded-3xl shadow-[0_6px_16px_rgba(15,23,42,0.08)] ${padding} ${maxWidth}`}
      >
        <div className={`relative ${thumbSize} rounded-2xl overflow-hidden border border-gray-100 bg-gray-100`}>
          {pendingImagePreview ? (
            <img src={pendingImagePreview} alt="Selected upload" className="object-cover w-full h-full" />
          ) : (
            <ImageIcon className="w-4 h-4 text-gray-500 absolute inset-0 m-auto" />
          )}
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className={`${textClass} font-semibold text-gray-900 truncate`}>
            {pendingImage?.name || 'Attached'}
          </span>
          <span className={`${statusClass} text-gray-400`}>{statusText}</span>
        </div>
        <button
          type="button"
          onClick={resetPendingImageSelection}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Remove selected image"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const clearSnapSession = () => {
    setAwaitingSnapConfirmation(false);
    setSnapConfirmationMessageId(null);
    setSnapResultsShown(0);
    setSnapCachedProperties([]);
    setSnapResultsPage(0);
    setSnapIsFetchingMore(false);
    setSnapLastUploadFile(null);
    setSnapLastManualLocation(null);
  };

  const runAuthGraphql = React.useCallback(
    async <T = any>(
      query: string,
      variables: Record<string, any>,
      token: string
    ): Promise<T> => {
      const response = await fetch(getAuthGraphqlUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.errors?.length) {
        throw new Error(payload?.errors?.[0]?.message || 'Failed to process favorites request');
      }

      return payload.data as T;
    },
    []
  );

  const resolveEffectiveAgentUserId = React.useCallback(
    (token?: string): string | undefined =>
      pickFirstValidId([agentUserId, resolveUserIdFromToken(token)]),
    [agentUserId]
  );

  const getAgentAuthContext = React.useCallback(() => {
    const token = getCrossAppAuthToken();
    if (!token) {
      throw new Error('Please log in again to manage favorites.');
    }
    const userId = resolveEffectiveAgentUserId(token);
    if (!userId) {
      throw new Error('Unable to identify your account for favorites.');
    }
    return { token, userId: String(userId) };
  }, [resolveEffectiveAgentUserId]);

  const syncAgentFavouriteSavedMap = React.useCallback((collections: AgentSnapCollection[]) => {
    const nextMap: Record<string, boolean> = {};
    (collections || []).forEach((collection) => {
      (collection?.favourites || []).forEach((favourite) => {
        const identifiers = [
          pickFirstValidId([favourite?.propertyId]),
          pickFirstValidId([favourite?.listingId]),
        ].filter((value): value is string => !!value);
        identifiers.forEach((identifier) => {
          nextMap[identifier] = true;
        });
      });
    });
    setAgentFavouriteSavedMap(nextMap);
  }, []);

  const sortMyFavouriteFirst = React.useCallback((collections: AgentSnapCollection[]) => {
    const list = Array.isArray(collections) ? [...collections] : [];
    const myFav = list.find((snap) => {
      const name = String(snap?.name || '').trim().toLowerCase();
      return name === 'my favourite' || name === 'my favorite';
    });
    const others = list.filter((snap) => {
      const name = String(snap?.name || '').trim().toLowerCase();
      return name !== 'my favourite' && name !== 'my favorite';
    });
    return myFav ? [myFav, ...others] : others;
  }, []);

  const loadAgentSnapCollections = React.useCallback(async () => {
    if (!enableAgentFavorites) return [];

    const { token, userId } = getAgentAuthContext();
    const snapsData = await runAuthGraphql<{ snaps?: AgentSnapCollection[] }>(
      `
        query findAllByUserId($userId: String!) {
          snaps(userId: $userId) {
            id
            name
            favourites {
              id
              propertyId
              listingId
            }
          }
        }
      `,
      { userId },
      token
    );

    const loaded = sortMyFavouriteFirst(Array.isArray(snapsData?.snaps) ? snapsData.snaps : []);
    setAgentSnapCollections(loaded);
    syncAgentFavouriteSavedMap(loaded);
    return loaded;
  }, [enableAgentFavorites, getAgentAuthContext, runAuthGraphql, sortMyFavouriteFirst, syncAgentFavouriteSavedMap]);

  useEffect(() => {
    if (!enableAgentFavorites) return;
    loadAgentSnapCollections().catch((err) => {
      console.error('Failed to preload agent favorites:', err);
    });
  }, [enableAgentFavorites, loadAgentSnapCollections]);

  const createAgentSnapCollection = React.useCallback(
    async (name: string) => {
      const trimmedName = String(name || '').trim();
      if (!trimmedName) {
        throw new Error('Snapz name is required.');
      }

      const { token, userId } = getAgentAuthContext();
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      const sanitizedBaseUrl = String(baseUrl).replace(/\/+$/, '');
      const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'snapz';
      const link = `${sanitizedBaseUrl}/snaps/${slug}-${Date.now()}`;

      const createSnapData = await runAuthGraphql<{ createSnap?: { id?: string } }>(
        `
          mutation CreateSnap($createSnapsInput: CreateSnapsInput!) {
            createSnap(createSnapsInput: $createSnapsInput) {
              id
            }
          }
        `,
        {
          createSnapsInput: {
            name: trimmedName,
            link,
            userId,
          },
        },
        token
      );

      const createdSnapId = pickFirstValidId([createSnapData?.createSnap?.id]);
      if (!createdSnapId) {
        throw new Error('Failed to create snapz.');
      }
      return createdSnapId;
    },
    [getAgentAuthContext, runAuthGraphql]
  );

  const ensureMyFavouriteSnapId = React.useCallback(async () => {
    const existingMyFav = (agentSnapCollections || []).find((snap) => {
      const name = String(snap?.name || '').trim().toLowerCase();
      return name === 'my favourite' || name === 'my favorite';
    });
    const existingId = pickFirstValidId([existingMyFav?.id]);
    if (existingId) return existingId;

    const createdId = await createAgentSnapCollection('My Favourite');
    await loadAgentSnapCollections();
    return createdId;
  }, [agentSnapCollections, createAgentSnapCollection, loadAgentSnapCollections]);

  const isPropertySavedInSnap = React.useCallback((property: any, snap: AgentSnapCollection) => {
    const resolvedPropertyId = pickFirstValidId([resolvePropertyId(property)]);
    const resolvedListingId = pickFirstValidId([resolveListingId(property), resolvedPropertyId]);
    if (!Array.isArray(snap?.favourites)) return false;

    return snap.favourites.some((favourite) => {
      const favPropertyId = pickFirstValidId([favourite?.propertyId]);
      const favListingId = pickFirstValidId([favourite?.listingId, favPropertyId]);
      return (
        (!!resolvedPropertyId && !!favPropertyId && resolvedPropertyId === favPropertyId) ||
        (!!resolvedListingId && !!favListingId && resolvedListingId === favListingId)
      );
    });
  }, []);

  const isPropertySavedInAnySnap = React.useCallback(
    (property: any) => {
      const identifiers = [
        resolvePropertyIdentityKey(property),
        pickFirstValidId([resolvePropertyId(property)]),
        pickFirstValidId([resolveListingId(property)]),
      ].filter((value): value is string => !!value);
      return identifiers.some((identifier) => !!agentFavouriteSavedMap[identifier]);
    },
    [agentFavouriteSavedMap]
  );

  const openAgentFavouriteModal = React.useCallback(
    async (property: any, event?: React.MouseEvent) => {
      event?.stopPropagation();
      if (!enableAgentFavorites) return;

      setAgentFavouriteModalProperty(property);
      setAgentFavouriteModalOpen(true);
      setAgentFavouriteMessage(null);
      setAgentCreateSnapOpen(false);
      setAgentNewSnapName('');
      setAgentCollaborativeOpen(false);
      setAgentCollaborativeStep(1);
      setAgentCollaborativeSnapName('');
      setAgentCollaborativeSnapId(null);
      setAgentInviteType('co-buyer');
      setAgentInviteEmail('');
      setAgentSnapLoading(true);

      try {
        await loadAgentSnapCollections();
      } catch (loadError: any) {
        console.error('Failed to load snapz collections:', loadError);
        setAgentFavouriteMessage(loadError?.message || 'Unable to load snapz collections.');
      } finally {
        setAgentSnapLoading(false);
      }
    },
    [enableAgentFavorites, loadAgentSnapCollections]
  );

  const closeAgentFavouriteModal = React.useCallback(() => {
    setAgentFavouriteModalOpen(false);
    setAgentFavouriteModalProperty(null);
    setAgentCreateSnapOpen(false);
    setAgentNewSnapName('');
    setAgentCollaborativeOpen(false);
    setAgentCollaborativeStep(1);
    setAgentCollaborativeSnapName('');
    setAgentCollaborativeSnapId(null);
    setAgentInviteType('co-buyer');
    setAgentInviteEmail('');
    setAgentFavouriteMessage(null);
  }, []);

  const handleAgentSnapSelection = React.useCallback(
    async (snap: AgentSnapCollection) => {
      if (!agentFavouriteModalProperty) return;

      const propertyKey = resolvePropertyIdentityKey(agentFavouriteModalProperty);
      if (!propertyKey) {
        setAgentFavouriteMessage('Unable to save this property. Missing property ID.');
        return;
      }
      if (agentFavouriteSavingId === propertyKey) return;

      setAgentFavouriteSavingId(propertyKey);
      setAgentFavouriteMessage(null);

      try {
        const targetSnapId =
          pickFirstValidId([snap?.id]) ||
          (String(snap?.name || '').trim().toLowerCase() === 'my favourite'
            ? await ensureMyFavouriteSnapId()
            : undefined);

        if (!targetSnapId) {
          throw new Error('Unable to resolve snapz collection.');
        }

        const createFavouritesInput = buildFavouritePayload(agentFavouriteModalProperty, targetSnapId);
        if (!createFavouritesInput) {
          throw new Error('Could not build favourites payload for this property.');
        }

        const { token } = getAgentAuthContext();
        const toggleResult = await runAuthGraphql<{ toggleFavourite?: boolean }>(
          `
            mutation toggleFavourite(
              $snapId: String!,
              $propertyId: String!,
              $listingId: String!,
              $createFavouritesInput: CreateFavouritesInput
            ) {
              toggleFavourite(
                snapId: $snapId,
                propertyId: $propertyId,
                listingId: $listingId,
                createFavouritesInput: $createFavouritesInput
              )
            }
          `,
          {
            snapId: targetSnapId,
            propertyId: createFavouritesInput.propertyId,
            listingId: createFavouritesInput.listingId,
            createFavouritesInput,
          },
          token
        );

        const wasAdded = !!toggleResult?.toggleFavourite;
        setAgentFavouriteMessage(wasAdded ? 'Saved to favorites.' : 'Removed from favorites.');
        await loadAgentSnapCollections();
      } catch (toggleError: any) {
        console.error('Failed to toggle favourite from AI Search:', toggleError);
        setAgentFavouriteMessage(toggleError?.message || 'Failed to update favorites.');
      } finally {
        setAgentFavouriteSavingId(null);
      }
    },
    [
      agentFavouriteModalProperty,
      agentFavouriteSavingId,
      ensureMyFavouriteSnapId,
      getAgentAuthContext,
      loadAgentSnapCollections,
      runAuthGraphql,
    ]
  );

  const handleAgentCreateSnap = React.useCallback(async () => {
    const nextName = agentNewSnapName.trim();
    if (!nextName) return;

    setAgentSnapLoading(true);
    setAgentFavouriteMessage(null);
    try {
      await createAgentSnapCollection(nextName);
      setAgentNewSnapName('');
      setAgentCreateSnapOpen(false);
      await loadAgentSnapCollections();
      setAgentFavouriteMessage('New snapz created.');
    } catch (createError: any) {
      console.error('Failed to create snapz:', createError);
      setAgentFavouriteMessage(createError?.message || 'Failed to create snapz.');
    } finally {
      setAgentSnapLoading(false);
    }
  }, [agentNewSnapName, createAgentSnapCollection, loadAgentSnapCollections]);

  const openAgentCollaborativeFlow = React.useCallback(() => {
    setAgentCollaborativeOpen(true);
    setAgentCollaborativeStep(1);
    setAgentCollaborativeSnapName('');
    setAgentCollaborativeSnapId(null);
    setAgentInviteType('co-buyer');
    setAgentInviteEmail('');
    setAgentCreateSnapOpen(false);
    setAgentNewSnapName('');
    setAgentFavouriteMessage(null);
  }, []);

  const closeAgentCollaborativeFlow = React.useCallback(() => {
    setAgentCollaborativeOpen(false);
    setAgentCollaborativeStep(1);
    setAgentCollaborativeSnapName('');
    setAgentCollaborativeSnapId(null);
    setAgentInviteType('co-buyer');
    setAgentInviteEmail('');
    setAgentFavouriteMessage(null);
  }, []);

  const handleAgentCollaborativeCreateSnap = React.useCallback(async () => {
    const nextName = agentCollaborativeSnapName.trim();
    if (!nextName) return;

    setAgentSnapLoading(true);
    setAgentFavouriteMessage(null);
    try {
      const createdSnapId = await createAgentSnapCollection(nextName);
      setAgentCollaborativeSnapId(createdSnapId);
      setAgentCollaborativeStep(2);
      setAgentCollaborativeSnapName('');
      await loadAgentSnapCollections();
    } catch (createError: any) {
      console.error('Failed to create collaborative snapz:', createError);
      setAgentFavouriteMessage(createError?.message || 'Failed to create collaborative snapz.');
    } finally {
      setAgentSnapLoading(false);
    }
  }, [agentCollaborativeSnapName, createAgentSnapCollection, loadAgentSnapCollections]);

  const handleAgentCollaborativeInvite = React.useCallback(async () => {
    const snapId = pickFirstValidId([agentCollaborativeSnapId]);
    const inviteEmail = String(agentInviteEmail || '').trim();
    if (!snapId) {
      setAgentFavouriteMessage('Create a snapz first before sending invite.');
      return;
    }
    if (!inviteEmail) return;

    setAgentSnapLoading(true);
    setAgentFavouriteMessage(null);

    try {
      const { token } = getAgentAuthContext();
      const accountType =
        agentInviteType === 'agent' ? 'agent' : agentInviteType === 'other' ? 'other' : 'buyer';

      const inviteResponse = await runAuthGraphql<{
        createSnapsParticipant?: { success?: boolean | string; message?: string };
      }>(
        `
          mutation createSnapsParticipant($createSnapsParticipantsInput: CreateSnapsParticipantsInput!) {
            createSnapsParticipant(createSnapsParticipantsInput: $createSnapsParticipantsInput) {
              message
              success
            }
          }
        `,
        {
          createSnapsParticipantsInput: {
            snapId,
            email: inviteEmail,
            status: 'pending',
            accountType,
          },
        },
        token
      );

      const successValue = inviteResponse?.createSnapsParticipant?.success;
      const isInviteSuccess = successValue === true || successValue === 'true';
      if (!isInviteSuccess) {
        throw new Error(inviteResponse?.createSnapsParticipant?.message || 'Failed to send invite.');
      }

      if (agentFavouriteModalProperty) {
        await handleAgentSnapSelection({ id: snapId, name: 'Collaborative Snapz', favourites: [] });
      }

      closeAgentFavouriteModal();
      success({
        message: `Great! Your ${agentInviteType === 'agent' ? 'agent' : agentInviteType === 'other' ? 'collaboration' : 'co-buyer'
          } invite is on its way`,
      });
    } catch (inviteError: any) {
      console.error('Failed to send collaborative invite:', inviteError);
      setAgentFavouriteMessage(inviteError?.message || 'Failed to send invite.');
    } finally {
      setAgentSnapLoading(false);
    }
  }, [
    agentCollaborativeSnapId,
    agentInviteEmail,
    agentInviteType,
    agentFavouriteModalProperty,
    closeAgentFavouriteModal,
    getAgentAuthContext,
    handleAgentSnapSelection,
    runAuthGraphql,
  ]);

  const agentModalSnapRows = useMemo(() => {
    const ordered = sortMyFavouriteFirst(agentSnapCollections);
    const hasMyFavourite = ordered.some((snap) => {
      const name = String(snap?.name || '').trim().toLowerCase();
      return name === 'my favourite' || name === 'my favorite';
    });
    if (hasMyFavourite) return ordered;
    return [{ id: undefined, name: 'My Favourite', favourites: [] }, ...ordered];
  }, [agentSnapCollections, sortMyFavouriteFirst]);

  const registerSnapResultsSession = (messageId: string, properties: any[], page: number = 0) => {
    if (!properties.length) {
      clearSnapSession();
      return;
    }
    setSnapCachedProperties(properties);
    setSnapResultsShown(Math.min(SNAP_RESULTS_BATCH_SIZE, properties.length));
    setSnapResultsPage(page);
    setAwaitingSnapConfirmation(true);
    setSnapConfirmationMessageId(messageId);
  };

  const handleSnapYesResponse = () => {
    appendAssistantMessage("Great! Let me know if you'd like more details on any of those homes or want to try a different search.");
    clearSnapSession();
  };

  const deliverSnapChunk = (chunk: any[], startIndex: number, endIndex: number, total: number) => {
    if (!chunk.length) return;
    const chunkMsg: ChatMessage = {
      id: (Date.now() + Math.random()).toString(),
      role: 'assistant',
      content: `Here are matches ${startIndex + 1}–${endIndex} from your image.\n\nUse the buttons below to tell me if one of these is the exact property you're searching for.`,
      relatedProperties: chunk,
      allProperties: chunk,
      totalMatches: total
    };
    setChatHistory(prev => [...prev, chunkMsg]);
    setSnapResultsShown(endIndex);
    setSnapConfirmationMessageId(chunkMsg.id);
    setAwaitingSnapConfirmation(true);
  };

  const fetchSnapResultsPage = async (page: number) => {
    if (!snapLastUploadFile) return [];
    try {
      setSnapIsFetchingMore(true);
      const formData = new FormData();
      formData.append('photo', snapLastUploadFile);

      if (snapLastManualLocation?.latitude && snapLastManualLocation?.longitude) {
        formData.append('manual_latitude', snapLastManualLocation.latitude);
        formData.append('manual_longitude', snapLastManualLocation.longitude);
      } else if (snapLastManualLocation?.query) {
        formData.append('manual_location_query', snapLastManualLocation.query);
      }

      formData.append('results_page', page.toString());

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${apiBaseUrl}/api/snap-search/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        appendAssistantMessage(errorData.detail || 'Unable to fetch more matches right now.');
        return [];
      }

      const data = await response.json();
      return mapSnapProperties(data.properties || []);
    } catch (error) {
      console.error('[Snap-Search] Fetch more error:', error);
      appendAssistantMessage('Something went wrong while searching for more matches. Try again or upload a new image.');
      return [];
    } finally {
      setSnapIsFetchingMore(false);
    }
  };

  const handleSnapNoResponse = async () => {
    setAwaitingSnapConfirmation(false);
    setSnapConfirmationMessageId(null);
    if (!snapCachedProperties.length) {
      appendAssistantMessage("I don't have any cached matches from that photo right now. Feel free to upload a new image or describe the home you're looking for.");
      clearSnapSession();
      return;
    }

    const currentCount = snapResultsShown;
    if (currentCount < snapCachedProperties.length) {
      const nextCount = Math.min(currentCount + SNAP_RESULTS_BATCH_SIZE, snapCachedProperties.length);
      const chunk = snapCachedProperties.slice(currentCount, nextCount);
      deliverSnapChunk(chunk, currentCount, nextCount, snapCachedProperties.length);
      setAwaitingSnapConfirmation(true);
      return;
    }

    if (!snapLastUploadFile) {
      appendAssistantMessage("I don't have the original photo to keep searching. Upload it again and I'll look farther out.");
      clearSnapSession();
      return;
    }

    if (snapIsFetchingMore) {
      appendAssistantMessage("I'm already searching for more matches. I'll show them as soon as they arrive.");
      return;
    }

    let nextPage = snapResultsPage + 1;
    let attempts = 0;
    const MAX_EXTRA_PAGES = 6;

    while (attempts < MAX_EXTRA_PAGES) {
      const newResults = await fetchSnapResultsPage(nextPage);
      if (!newResults.length) {
        appendAssistantMessage("I couldn't find any more matches from that photo. Try a different angle or upload a new image.");
        clearSnapSession();
        return;
      }

      const uniqueNew = newResults.filter(
        (prop) => !snapCachedProperties.some(existing => existing.id === prop.id)
      );

      if (uniqueNew.length) {
        const updatedList = [...snapCachedProperties, ...uniqueNew];
        setSnapCachedProperties(updatedList);
        setSnapResultsPage(nextPage);
        setProperties(prev => [...prev, ...uniqueNew]);

        const startIndex = currentCount;
        const endIndex = Math.min(updatedList.length, startIndex + SNAP_RESULTS_BATCH_SIZE);
        const chunk = updatedList.slice(startIndex, endIndex);
        deliverSnapChunk(chunk, startIndex, endIndex, updatedList.length);
        setAwaitingSnapConfirmation(true);
        return;
      }

      nextPage += 1;
      attempts += 1;
    }

    appendAssistantMessage("I expanded the search radius but couldn't surface fresh listings. Let's try another photo, angle, or city to keep going.");
    clearSnapSession();
  };

  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    // Only scroll to bottom for USER messages so we see the 'Thinking...' state.
    // When AI replies (long content), we STAY at the current position to read from the top.
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg?.role === 'user' && chatBottomRef.current?.parentElement) {
      const container = chatBottomRef.current.parentElement;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory.length, isSearching]);

  // --- Helpers for Safe Info Extraction (from Assistant) ---
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

  const getString = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;

  const extractPhotosEnhanced = (item: unknown): string[] => {
    const record = isRecord(item) ? item : {};

    // 1) Direct array
    if (Array.isArray((record as any).photos) && (record as any).photos.length > 0) {
      const urls = (record as any).photos.map((p: any) => {
        if (typeof p === "string") return p;
        if (isRecord(p)) return (p as any).url || (p as any).href || (p as any).src;
        return undefined;
      }).filter(Boolean);
      if (urls.length) return urls;
    }

    // 2) JSON strings from Neo4j
    const possibleKeys = ["photoListJson", "photo_list_json", "photoList"];
    for (const key of possibleKeys) {
      const val = (record as any)[key];
      if (val) {
        if (Array.isArray(val)) return val.filter(x => typeof x === 'string');
        if (typeof val === "string" && val.trim().length > 0) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              return parsed.map((p: any) => typeof p === 'string' ? p : p?.url).filter(Boolean);
            }
          } catch (e) {
            console.warn('Failed to parse photo list JSON', e);
            return [];
          }
        }
      }
    }

    // 3) Single image fallbacks
    const single = getString((record as any).imgSrc) || getString((record as any).image) || getString((record as any).primaryImageUrl);
    return single ? [single] : [];
  };

  // --- Handlers ---

  // Helper to extract schools from text
  const extractSchoolsFromText = (text: string) => {
    if (!text) return { schools: [], address: null };

    // 1. Extract Address
    // Pattern: "near **Address**" or "near **Address ("
    const addressMatch = text.match(/near \*\*(.*?)\*\*/i);
    const address = addressMatch ? addressMatch[1] : "Your Location";

    // 2. Extract Schools
    const schools: any[] = [];
    const lines = text.split('\n');
    let currentSchool: any = null;

    const inferLevelFromName = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('elementary')) return 'Elementary';
      if (lower.includes('middle')) return 'Middle School';
      if (lower.includes('high')) return 'High School';
      return undefined;
    };

    const normalizeBullet = (input: string) =>
      input.replace(/\u00e2\u0080\u00a2|\u2022|\u00b7/g, '\u2022');

    const splitMetaParts = (input: string) =>
      normalizeBullet(input)
        .split('\u2022')
        .map(p => p.trim())
        .filter(Boolean);

    lines.forEach(line => {
      // Name: **1. School Name (Type)**
      const nameMatch = line.match(/\*\*\d+\.\s+(.*?)\s*(\(.*\))?\*\*/);
      if (nameMatch) {
        if (currentSchool) schools.push(currentSchool);
        currentSchool = {
          name: nameMatch[1],
          type: 'School',
          distance: '',
          rating: '-',
          sector: undefined,
          level: inferLevelFromName(nameMatch[1]),
          meta: undefined
        };
        return;
      }

      if (currentSchool) {
        // Distance & Type (e.g. "1.0 miles ? Public ? ...")
        const normalizedLine = normalizeBullet(line);
        const distStartMatch = normalizedLine.match(/^(\d+(?:\.\d+)?\s*miles)(?:\s*\u2022\s*(.*))?/i);
        if (distStartMatch) {
          currentSchool.distance = distStartMatch[1].trim().replace('miles', 'mi');
          if (distStartMatch[2]) {
            const parts = splitMetaParts(distStartMatch[2]);
            const sectorTokens = ['public', 'private', 'charter', 'postsecondary'];
            const levelTokens = ['elementary', 'middle', 'high'];

            parts.forEach(part => {
              const lower = part.toLowerCase();
              if (sectorTokens.some(t => lower.includes(t))) {
                currentSchool.sector = part;
              } else if (levelTokens.some(t => lower.includes(t))) {
                currentSchool.level = part;
              }
            });
          }
        }

        // Fallback for "Distance: ..."
        const distMatch = line.match(/Distance:\s+(.*)/i);
        if (distMatch) currentSchool.distance = distMatch[1].trim();

        const gradeMatch = line.match(/Grade:\s+(\d+)/i);
        if (gradeMatch) currentSchool.rating = `${gradeMatch[1]}/5`;

        const starMatch = line.match(/\((\d+)\s*Stars?\)/i);
        if (starMatch) currentSchool.rating = `${starMatch[1]}/5`;

        if (!currentSchool.level) {
          currentSchool.level = inferLevelFromName(currentSchool.name);
        }

        const metaParts = [];
        if (currentSchool.sector) metaParts.push(currentSchool.sector);
        if (currentSchool.level) metaParts.push(currentSchool.level);
        currentSchool.meta = metaParts.length > 0 ? metaParts.join(' \u2022 ') : currentSchool.type;
      }
    });

    if (currentSchool) schools.push(currentSchool);

    return { schools, address };
  };

  // Helper to safely parse schools
  const parseSchools = (schoolsData: any) => {
    if (!schoolsData) return [];
    if (Array.isArray(schoolsData)) return schoolsData;
    if (typeof schoolsData === 'string') {
      try {
        return JSON.parse(schoolsData);
      } catch (e) { return []; }
    }
    return [];
  };

  const handleSearchSubmit = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;

    // Direct MLS mode should behave like a normal search bar:
    // skip chat expansion/conversation and route to the listings page.
    if (mlsBypassMode && !pendingLocationImage) {
      const destination = `/buy/browse?q=${encodeURIComponent(queryToSearch.trim())}`;
      if (typeof window !== 'undefined') {
        window.location.assign(destination);
      }
      return;
    }
    setIsExpanded(true); // Immediate UI response
    if (onSearchStateChange) {
      onSearchStateChange(true, queryToSearch);
    }

    console.log('[Snap-Search] handleSearchSubmit called. pendingLocationImage:', pendingLocationImage ? pendingLocationImage.name : 'null');


    // 1. Add User Message
    const userMsgId = Date.now().toString();
    const newMsg: ChatMessage = { id: userMsgId, role: 'user', content: queryToSearch };
    setChatHistory(prev => [...prev, newMsg]);

    const normalizedInput = queryToSearch.trim().toLowerCase();
    const sanitizedInput = normalizedInput.replace(/[.!?,]/g, '').trim();

    if (awaitingSnapConfirmation) {
      if (SNAP_NO_KEYWORDS.includes(sanitizedInput)) {
        await handleSnapNoResponse();
        return;
      }
      if (SNAP_YES_KEYWORDS.includes(sanitizedInput)) {
        handleSnapYesResponse();
        return;
      }
    }

    if (awaitingSnapConfirmation) {
      clearSnapSession();
    }

    // 2. Set Loading & Reset Input
    setIsSearching(true);
    setSearchTerm('');
    setSelectedPropertyId(null);
    setExpandedPropertyId(null);

    // 3. Abort previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const newController = new AbortController();
    abortControllerRef.current = newController;

    try {
      // HANDLE MANUAL COORDINATES FOR IMAGE SEARCH
      // HANDLE MANUAL COORDINATES FOR IMAGE SEARCH
      if (pendingLocationImage) {
        const locationInput = queryToSearch.trim();
        if (!locationInput) {
          setChatHistory(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: "Please enter a city (e.g. \"Austin, TX\") or a ZIP code so I know where to search for your photo."
          }]);
          setIsSearching(false);
          return;
        }

        const pendingFile = pendingLocationImage;
        const formData = new FormData();
        formData.append('photo', pendingFile);

        const coordMatch = locationInput.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
        let locationDescriptor = '';

        if (coordMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[3];
          locationDescriptor = `coordinates (${lat}, ${lng})`;
          formData.append('manual_latitude', lat);
          formData.append('manual_longitude', lng);
          setSnapLastManualLocation({ latitude: lat, longitude: lng });
        } else {
          locationDescriptor = `"${locationInput}"`;
          formData.append('manual_location_query', locationInput);
          setSnapLastManualLocation({ query: locationInput });
        }
        formData.append('results_page', '0');
        setSnapLastUploadFile(pendingFile);
        setSnapResultsPage(0);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
        const response = await fetch(`${apiBaseUrl}/api/snap-search/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 400 && errorData.detail) {
            setChatHistory(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: errorData.detail
            }]);
            setIsSearching(false);
            return;
          }

          throw new Error(errorData.detail || 'Image search failed with the provided location');
        }

        const data = await response.json();
        setPendingLocationImage(null);

        const mappedProps = mapSnapProperties(data.properties || []);

        const totalMatches = data.total_matches || mappedProps.length;
        const manualResponseMsgId = (Date.now() + 1).toString();
        setChatHistory(prev => [...prev, {
          id: manualResponseMsgId,
          role: 'assistant',
          content: `I searched near ${locationDescriptor} and found ${totalMatches} properties that visually match your image.\n\nUse the buttons below to tell me if any of these homes are the exact property you're searching for.`,
          relatedProperties: mappedProps.slice(0, SNAP_RESULTS_BATCH_SIZE),
          allProperties: mappedProps,
          totalMatches: totalMatches,
          relatedQuestions: ['Show me details', 'Compare prices']
        }]);

        registerSnapResultsSession(manualResponseMsgId, mappedProps, 0);

        if (mappedProps.length > 0) {
          setProperties(prev => [...prev, ...mappedProps]);
        }

        setIsSearching(false);
        return;
      }

      const intent = detectIntent(queryToSearch, { enableRentVsBuy: true });
      const normalizedQuery = queryToSearch.trim().toLowerCase();
      const rvbFollowupKeywords = [
        "down payment",
        "downpayment",
        "dp",
        "income",
        "annual income",
        "monthly rent",
        "current rent",
        "loan term",
        "term",
        "years",
        "yr",
        "yrs",
        "interest rate",
        "mortgage rate",
        "apr",
        "budget",
        "home price",
        "price",
      ];
      const hasRentAmountSignal = /\brent\b/.test(normalizedQuery) && /\d/.test(normalizedQuery);
      const hasRvbFollowup =
        lastIntentRef.current === "rent_vs_buy" &&
        (rvbFollowupKeywords.some((keyword) => normalizedQuery.includes(keyword)) ||
          /\b\d+(?:\.\d+)?\s*%\b/.test(normalizedQuery) ||
          hasRentAmountSignal);
      const effectiveIntent = intent === "general" && hasRvbFollowup ? "property" : intent;

      if (effectiveIntent === "general") {
        const selectedPropPayload =
          selectedPropertyId !== null ? properties.find((p) => p.id === selectedPropertyId) : null;
        const questionPayload: QuestionPayload = {
          question: queryToSearch,
          session_id: sessionId
        };
        if (selectedPropertyId !== null) {
          questionPayload.selected_property_id =
            selectedPropPayload?.propertyId ??
            selectedPropPayload?.listingId ??
            selectedPropertyId;
          if (selectedPropPayload?.displayIndex) {
            questionPayload.selected_property_index = selectedPropPayload.displayIndex;
          }
        }

        const data = await askQuestion(questionPayload, newController.signal);
        console.log("Backend Response:", data);

        if (data.session_id) {
          setSessionId(data.session_id);
        }
        lastIntentRef.current = data.intent || "question";

        const aiText =
          data.answer ||
          data.final_response ||
          data.summary ||
          data.response ||
          "I couldn't find a response for that question.";

        const relatedQuestions =
          data.suggestions ||
          data.suggested_actions ||
          data.recommendations ||
          data.suggested_questions ||
          data.related_questions ||
          [];

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiText,
          relatedQuestions: relatedQuestions,
          map: data.map,
          intent: data.intent || "question"
        };
        setChatHistory(prev => [...prev, aiMsg]);
        setIsSearching(false);
        return;
      }

      console.log("Fetching properties for:", queryToSearch);
      const data = await searchProperties({
        query: queryToSearch,
        session_id: sessionId
      }, newController.signal);
      console.log("Backend Response:", data);

      if (data.session_id) {
        setSessionId(data.session_id);
      }
      if (data.intent) {
        lastIntentRef.current = data.intent;
      }

      const rawProperties = data.properties || data.search_results || [];
      const aiText = data.final_response || data.answer || data.summary || data.response;
      const responseMode = data?.metadata?.response_mode;
      const isCardsOnly = responseMode === "cards_only";
      const hasAiText = typeof aiText === "string" && aiText.trim().length > 0;

      if (Array.isArray(rawProperties)) {
        const mappedProps = rawProperties.map((p: any, index: number) => {
          // 1. Image Extraction Priority
          let mainImage =
            p.primaryListingImageUrl ||
            p.primaryImage ||
            p.imgSrc ||
            p.image ||
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

          let galleryImages: string[] = [];

          // Try to get photo list
          let rawPhotos = null;
          if (p.photoListJson) {
            rawPhotos = p.photoListJson;
            try {
              const parsed = typeof p.photoListJson === 'string' ? JSON.parse(p.photoListJson) : p.photoListJson;
              if (Array.isArray(parsed)) {
                galleryImages = parsed.map((x: any) => {
                  if (typeof x === 'string') return x;
                  return x.highRes || x.midRes || x.url || x.lowRes || null;
                }).filter(Boolean);
              }
            } catch (e) { console.error("Error parsing photoListJson:", e); }
          } else if (p.photoList) {
            rawPhotos = p.photoList;
            try {
              const parsed = typeof p.photoList === 'string' ? JSON.parse(p.photoList) : p.photoList;
              if (Array.isArray(parsed)) {
                galleryImages = parsed.map((x: any) => {
                  if (typeof x === 'string') return x;
                  return x.highRes || x.midRes || x.url || x.lowRes || null;
                }).filter(Boolean);
              }
            } catch (e) { console.error("Error parsing photoList:", e); }
          } else if (p.photos && Array.isArray(p.photos)) {
            galleryImages = p.photos.map((x: any) => {
              if (typeof x === 'string') return x;
              return x.highRes || x.midRes || x.url || x.lowRes || null;
            }).filter(Boolean);
          }

          console.log(`[DEBUG] Property ${p.id} photos:`, {
            extractedCount: galleryImages.length,
            firstURL: galleryImages[0]
          });

          // If we have gallery images but no main image, use first gallery image
          if (galleryImages.length > 0 && mainImage.includes('unsplash')) {
            mainImage = galleryImages[0];
          }
          // If we have main image but no gallery, use main image as gallery
          if (galleryImages.length === 0 && !mainImage.includes('unsplash')) {
            galleryImages = [mainImage];
          }
          // Fallback if both empty
          if (galleryImages.length === 0) {
            galleryImages = [mainImage];
          }

          // 2. Details Extraction
          const price = p.price || p.listPrice || '$0';
          const fmtPrice = typeof price === 'number' ? `$${price.toLocaleString()}` : price;

          const address = p.address || p.formattedAddress || p.fullAddress ||
            (p.street ? `${p.street}, ${p.city}, ${p.state}` : 'Address Unavailable');

          // 3. Schools Extraction
          const schoolsRaw = p.nearby_schools || p.schools;
          const schools = parseSchools(schoolsRaw).map((s: any) => ({
            name: s.name || s.schoolName || "Local School",
            type: s.type || s.level || "School",
            distance: s.distance ? `${s.distance} mi` : "Nearby",
            rating: s.rating ? `${s.rating}/10` : "N/A"
          })).slice(0, 3); // Take top 3

          const hasPool = normalizePoolValue(
            p.hasPool ??
            p.propertyHasPool ??
            p.pool ??
            p.has_pool ??
            p.poolPresent ??
            p.pool_present
          );

          const listingId = resolveListingId(p);
          const propertyId = resolvePropertyId(p);
          const cardIdentity = listingId ?? propertyId;
          const cardId = cardIdentity ?? buildStableFallbackId(p, 'search', index);
          const listingUrl = p.listing_url || p.url || p.hdpUrl;

          return {
            id: cardId,
            listingId,
            propertyId,
            listingUrl,
            image: mainImage,
            price: fmtPrice,
            address: address,
            latitude: p.latitude || p.lat,
            longitude: p.longitude || p.lon || p.long,
            city: p.city,
            state: p.state,
            beds: p.beds || p.bedrooms || p.bedroomTotal || 0,
            baths: p.baths || p.bathrooms || p.bathroomTotal || 0,
            sqft: p.livingArea || p.sqft || 'N/A',
            hasPool: hasPool,
            schoolRating: schools[0]?.rating || 'N/A',
            type: p.propertyType || p.homeType || 'Residential',
            description: p.description || "Discover this distinct property situated in a prime location. Featuring spacious living areas and modern amenities, it's the perfect place to call home.",
            features: p.features || ["Air Conditioning", "Garage", "Garden"],
            schools: schools,
            insights: {
              price: fmtPrice,
              safety: "Low", // Mock for now if not in backend
              walkability: "85", // Mock for now
              climate: "Sunny"   // Mock for now
            },
            images: galleryImages
          };
        });

        // Accumulate properties globally
        setProperties(prev => [...prev, ...mappedProps]);

        // Prefetch nearby public schools for top properties to avoid UI delay on "Show More"
        setTimeout(() => {
          mappedProps.slice(0, 3).forEach((prop: any) => fetchNearbySchools(prop));
        }, 0);

        // Add Assistant Response
        const aiMsgId = (Date.now() + 1).toString();
        const relatedQuestions =
          data.suggestions ||
          data.suggested_actions ||
          data.recommendations ||
          data.suggested_questions ||
          data.related_questions ||
          [];

        const schoolKeywords = ['school', 'education', 'university', 'college', 'district', 'elementary', 'high', 'rating'];
        const showSchools = schoolKeywords.some(keyword => queryToSearch.toLowerCase().includes(keyword));

        // Logic: If properties found -> Short text. If text query (no props) -> check for extracted schools.
        let finalContent = "";
        let extractedSchools: any[] = [];
        let extractedAddress: string | undefined = undefined;
        let isForecastMsg = false;
        let forecastPoints: ForecastPoint[] | undefined = undefined;

        // Check for Forecast (avoid false positives like "top-rated")
        const loweredQuery = queryToSearch.toLowerCase();
        const isRateForecastQuery =
          /\bforecast\b/.test(loweredQuery) ||
          /\binterest rate(s)?\b/.test(loweredQuery) ||
          (/\bmortgage\b/.test(loweredQuery) && /\brate(s)?\b/.test(loweredQuery));
        if (isRateForecastQuery) {
          isForecastMsg = true;
          forecastPoints = await fetchForecast(24);
          // Don't override content if we have AI text, unless necessary. 
          // Often AI text might be "Here is the forecast..."
          // If explicit "Show me forecast", AI might verify.
          // visual feedback:
          if (!finalContent && (!aiText || aiText.length < 50)) finalContent = "Here is the latest mortgage rate forecast.";
        }

        if (isForecastMsg && forecastPoints) {
          // Priority to forecast if explicitly asked?
          // Or combine?
          if (!finalContent) finalContent = aiText || "Here is the forecast.";
        } else if (mappedProps.length > 0) {
          finalContent = (!isCardsOnly && hasAiText)
            ? aiText
            : `I found ${mappedProps.length} homes that match your criteria.`;
        } else {
          // Try to extract schools from text if no homes found
          const extraction = extractSchoolsFromText(aiText || "");
          if (extraction && extraction.schools.length > 0) {
            extractedSchools = extraction.schools;
            extractedAddress = extraction.address || undefined;
            finalContent = `I found ${extraction.schools.length} schools near ${extractedAddress || 'the location'}.`;
          } else {
            finalContent = aiText || "I couldn't find any properties matching that search right now.";
          }
        }

        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'assistant',
          content: finalContent,
          query: queryToSearch,
          query_history_formatted: data.metadata?.query_history_formatted,
          relatedProperties: mappedProps,
          relatedQuestions: relatedQuestions,
          showSchools: showSchools,
          relatedSchools: extractedSchools,
          schoolAddress: extractedAddress,
          isForecast: isForecastMsg,
          forecastData: forecastPoints,
          map: data.map,
          intent: data.intent
        };
        setChatHistory(prev => [...prev, aiMsg]);

      } else {
        // Empty results
        const aiMsgId = (Date.now() + 1).toString();
        const relatedQuestions =
          data.suggestions ||
          data.suggested_actions ||
          data.recommendations ||
          data.suggested_questions ||
          data.related_questions ||
          [];

        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'assistant',
          content: aiText || "I couldn't find any properties matching that search right now.",
          relatedProperties: [],
          relatedQuestions: relatedQuestions,
          intent: data.intent
        };
        setChatHistory(prev => [...prev, aiMsg]);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted by user');
        return;
      }
      console.error("Search Error:", err);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while searching. Please try again."
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingImage) {
      submitPendingImage();
      return;
    }
    handleSearchSubmit(searchTerm);
  };

  const handleSuggestionClick = (text: string) => {
    setSearchTerm(text);
    handleSearchSubmit(text);
    setShowSuggestions(false);
  };

  // ─── Address autocomplete helpers ──────────────────────────────────────────

  /**
   * Debounced fetch of address suggestions from the MLS API.
   * Only fires when the input looks like a street address (starts with digits).
   */
  const fetchAddressSuggestions = (value: string) => {
    // Cancel any pending debounce
    if (addressSuggestDebounceRef.current) {
      clearTimeout(addressSuggestDebounceRef.current);
    }
    if (locationSuggestDebounceRef.current) {
      clearTimeout(locationSuggestDebounceRef.current);
    }

    const trimmed = value.trim();
    // Address-like heuristics
    const hasHouseNumber = /\b\d{1,6}\b/.test(trimmed);
    const hasStreetKeyword = /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place|cir|circle|pkwy|parkway|ter|terrace|hwy|highway)\b/i.test(trimmed);
    const hasCommaAddressShape = /,/.test(trimmed) && /[a-z]/i.test(trimmed);
    const isAddressLike = trimmed.length >= 3 && (hasHouseNumber || hasStreetKeyword || hasCommaAddressShape);

    if (trimmed.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    if (isAddressLike) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      setIsLoadingLocationSuggestions(false);

      addressSuggestDebounceRef.current = setTimeout(async () => {
        try {
          setIsLoadingAddressSuggestions(true);
          const results = await suggestAddresses(trimmed);
          setAddressSuggestions(results);
          setShowAddressSuggestions(results.length > 0);
        } catch {
          setAddressSuggestions([]);
          setShowAddressSuggestions(false);
        } finally {
          setIsLoadingAddressSuggestions(false);
        }
      }, 300);
      return;
    }

    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setIsLoadingAddressSuggestions(false);

    locationSuggestDebounceRef.current = setTimeout(() => {
      if (typeof window === 'undefined' || !window.google?.maps?.places) {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        setIsLoadingLocationSuggestions(false);
        return;
      }

      try {
        setIsLoadingLocationSuggestions(true);
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: trimmed,
            componentRestrictions: { country: 'us' },
          },
          (predictions: any, status: any) => {
            const isOk =
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              Array.isArray(predictions);

            if (!isOk) {
              setLocationSuggestions([]);
              setShowLocationSuggestions(false);
              setIsLoadingLocationSuggestions(false);
              return;
            }

            const locationTypeHints = new Set([
              'locality',
              'administrative_area_level_1',
              'administrative_area_level_2',
              'sublocality',
              'neighborhood',
              'postal_town',
            ]);

            const filtered = predictions.filter((prediction: any) => {
              const types = Array.isArray(prediction?.types) ? prediction.types : [];
              return types.some((t: string) => locationTypeHints.has(t));
            });
            const source = filtered.length > 0 ? filtered : predictions;
            const mapped: LocationSuggestion[] = source.slice(0, 8).map((prediction: any) => ({
              placeId: String(prediction?.place_id || prediction?.id || prediction?.description || ''),
              description: String(
                prediction?.description ||
                [
                  prediction?.structured_formatting?.main_text,
                  prediction?.structured_formatting?.secondary_text,
                ].filter(Boolean).join(', ')
              ),
            })).filter((item: LocationSuggestion) => item.description.trim().length > 0);

            setLocationSuggestions(mapped);
            setShowLocationSuggestions(mapped.length > 0);
            setIsLoadingLocationSuggestions(false);
          }
        );
      } catch {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        setIsLoadingLocationSuggestions(false);
      }
    }, 300);
  };

  /**
   * Navigate directly to the property detail page when a suggestion is clicked.
   * Bypasses the AI search pipeline entirely.
   */
  const handleAddressSuggestionClick = (suggestion: AddressSuggestion) => {
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    setSearchTerm(suggestion.address || '');

    const url = toMainSitePropertyPreviewUrl({
      listingId: suggestion.listingId,
      id: suggestion.id,
      city: suggestion.city,
      state: suggestion.state,
      zip_code: suggestion.zip_code,
      address: suggestion.address,
    });
    window.location.href = url;
  };

  const handleLocationSuggestionClick = (suggestion: LocationSuggestion) => {
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);

    const locationQuery = suggestion.description.trim();
    setSearchTerm(locationQuery);

    const mainSiteBase = getMainSiteBaseUrl();
    window.location.href = `${mainSiteBase}/buy/browse?q=${encodeURIComponent(locationQuery)}`;
  };

  const performSnapImageSearch = async (file: File, locationInput?: string) => {
    clearSnapSession();
    console.log('[Snap-Search] Beginning backend search for file:', file.name, file.type);

    setSnapLastUploadFile(file);
    setSnapLastManualLocation(null);
    setSnapResultsPage(0);
    setPendingLocationImage(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      const trimmedLocation = locationInput?.trim();
      if (trimmedLocation) {
        const coordMatch = trimmedLocation.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
        if (coordMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[3];
          formData.append('manual_latitude', lat);
          formData.append('manual_longitude', lng);
          setSnapLastManualLocation({ latitude: lat, longitude: lng });
        } else {
          formData.append('manual_location_query', trimmedLocation);
          setSnapLastManualLocation({ query: trimmedLocation });
        }
      }
      formData.append('results_page', '0');

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${apiBaseUrl}/api/snap-search/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Image search feature is not enabled on the backend. Please make sure the backend server is running and the snap-search router is properly configured.');
        }

        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));

        if (response.status === 400 || (errorData.detail && errorData.detail.includes('No location found'))) {
          setPendingLocationImage(file);
          setChatHistory(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `This image doesn't include GPS data. Tell me where to search by typing a city (e.g. "Austin, TX") or a ZIP code (e.g. "78704") in the chat, and I'll look for matching homes there.`
          }]);
          return;
        }

        throw new Error(errorData.detail || 'Image search failed');
      }

      const data = await response.json();
      console.log('[Snap-Search] Response:', data);

      if (data.next_steps) {
        setChatHistory(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `${data.message}\n\n${data.next_steps.join('\n')}\n\nQuery Hash: ${data.query_hash || 'N/A'}\nLocation: ${data.location ? `${data.location.latitude}, ${data.location.longitude}` : 'Not found'}`
        }]);
        return;
      }

      const mappedProps = mapSnapProperties(data.properties || []);

      if (mappedProps.length > 0) {
        setProperties(prev => [...prev, ...mappedProps]);
      }

      const aiMsgId = (Date.now() + 1).toString();
      const totalMatches = data.total_matches || mappedProps.length;
      const responseText = mappedProps.length > 0
        ? `I found ${totalMatches} properties that visually match your image! These homes have similar architectural features and appearance.\n\nUse the buttons below to tell me if any of these are the exact property you're searching for.`
        : `I processed your image (hash: ${data.query_hash}), but couldn't find matching properties in the area. This could be because:\n- No properties found near the image location\n- The image doesn't contain GPS data\n- The property database needs to be populated`;

      setChatHistory(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: responseText,
        relatedProperties: mappedProps.slice(0, SNAP_RESULTS_BATCH_SIZE),
        allProperties: mappedProps,
        totalMatches: totalMatches,
        relatedQuestions: mappedProps.length > 0 ? [
          'Show me more details about the top match',
          'What are the school ratings for these properties?',
          'Compare prices in this neighborhood'
        ] : [
          'Search for properties in a specific area',
          'Tell me about mortgage rates',
          'Find homes near top-rated schools'
        ]
      }]);

      registerSnapResultsSession(aiMsgId, mappedProps, 0);
    } catch (error: any) {
      console.error('[Snap-Search] Error:', error);

      if (error.message && error.message.includes('No location found')) {
        if (!pendingLocationImage) {
          setPendingLocationImage(file);
        }

        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `This image doesn't include GPS info. Type a city (for example, "Austin, TX") or a ZIP code (such as "78704") below and I'll rerun the search near that area.`
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Sorry, I couldn't process that image. ${error.message || 'Please try again or make sure the photo contains GPS data.'}`
        }]);
      }
    } finally {
      setIsSearching(false);
      setSnapSearchInProgress(false);
      setSubmittedImage(null);
    }
  };

  const submitPendingImage = async () => {
    if (!pendingImage) return;
    if (snapSearchInProgress) return;
    if (pendingImageStatus !== 'ready') return;

    const file = pendingImage;
    const preview = pendingImagePreview;
    const caption = searchTerm.trim();
    if (!caption) {
      setIsExpanded(true);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please add a city, state, ZIP code, or coordinates with your image so I can search the right location.'
      }]);
      return;
    }

    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: caption || undefined,
      imageUrl: preview || undefined,
      attachmentName: file.name
    };
    setChatHistory(prev => [...prev, userMessage]);

    setSearchTerm('');
    setPendingImage(null);
    pendingImageRef.current = null;
    setPendingImagePreview(null);
    setPendingImageStatus('idle');
    setShowAttachMenu(false);

    setSubmittedImage(file);
    setIsExpanded(true);
    setIsSearching(true);
    setSnapSearchInProgress(true);

    await performSnapImageSearch(file, caption);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please upload an image file to use Snap-to-Search.'
      }]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    clearSnapSession();
    console.log('[Snap-Search] File selected (staged):', file.name, file.type);

    setIsExpanded(true);
    setPendingLocationImage(null);
    pendingImageRef.current = file;
    setPendingImage(file);
    setPendingImagePreview(null);
    setPendingImageStatus('processing');
    setSubmittedImage(null);
    setShowAttachMenu(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (pendingImageRef.current !== file) return;
      const result = typeof reader.result === 'string' ? reader.result : null;
      setPendingImagePreview(result);
      setPendingImageStatus('ready');
    };
    reader.onerror = () => {
      if (pendingImageRef.current !== file) return;
      setPendingImagePreview(null);
      setPendingImageStatus('ready');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const formatSchoolRating = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') {
      if (value <= 5) return `${value}/5`;
      if (value <= 10) {
        const scaled = Math.round((value / 2) * 10) / 10; // 10-point -> 5-point
        return `${scaled}/5`;
      }
      return `${value}`;
    }
    const v = String(value).trim();
    if (!v) return 'N/A';
    const upper = v.toUpperCase();
    const gradeMap: Record<string, number> = {
      "A+": 5,
      "A": 4.7,
      "A-": 4.5,
      "B+": 4.0,
      "B": 3.7,
      "B-": 3.5,
      "C+": 3.0,
      "C": 2.7,
      "C-": 2.5,
      "D+": 2.0,
      "D": 1.7,
      "F": 0,
    };
    if (upper in gradeMap) {
      return `${gradeMap[upper]}/5`;
    }
    const numeric = Number(v);
    if (!Number.isNaN(numeric)) {
      if (numeric <= 5) return `${numeric}/5`;
      if (numeric <= 10) {
        const scaled = Math.round((numeric / 2) * 10) / 10;
        return `${scaled}/5`;
      }
    }
    return v;
  };

  const formatSchoolDistance = (value: any) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value.toFixed(1)} mi`;
    }
    const v = String(value).trim();
    if (!v) return null;
    const parsed = Number(v.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(parsed)) {
      return `${parsed.toFixed(1)} mi`;
    }
    return v;
  };

  const fetchNearbySchools = async (property: any, options?: { silent?: boolean }) => {
    const key = String(property?.id ?? '');
    if (!key) return;

    const existing = nearbySchoolsById[key];
    if (existing && (existing.status === 'loading' || existing.status === 'ready')) {
      return;
    }

    if (!options?.silent) {
      setNearbySchoolsById(prev => ({
        ...prev,
        [key]: { status: 'loading', schools: [] }
      }));
    }

    const lat = property?.latitude ?? property?.lat;
    const lon = property?.longitude ?? property?.lon ?? property?.long;
    const city = property?.city;
    const state = property?.state;

    if (lat === null || lat === undefined || lon === null || lon === undefined || !city || !state) {
      setNearbySchoolsById(prev => ({
        ...prev,
        [key]: { status: 'error', schools: [], error: 'Missing location data' }
      }));
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        city: String(city),
        state: String(state),
        radius: '5',
        limit: '3',
        school_type: 'public'
      });
      const response = await fetch(`${apiBaseUrl}/api/schools/nearby?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch nearby schools');
      }
      const data = await response.json();
      const schools = Array.isArray(data?.schools) ? data.schools.slice(0, 3) : [];
      setNearbySchoolsById(prev => ({
        ...prev,
        [key]: { status: 'ready', schools, schoolType: data?.school_type, fallbackUsed: data?.fallback_used }
      }));
    } catch (err: any) {
      console.error('[Schools] Nearby fetch error:', err);
      setNearbySchoolsById(prev => ({
        ...prev,
        [key]: { status: 'error', schools: [], error: err?.message || 'Failed to fetch' }
      }));
    }
  };

  // Strict Interaction Handlers
  const handlePropertyClick = (id: string | number) => {
    // Only highlights the card. Does NOT toggle expansion.
    setSelectedPropertyId(id === selectedPropertyId ? null : id);
  };

  const handleExpandClick = (property: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click
    (e.currentTarget as HTMLElement).blur();
    const id = property?.id;
    if (expandedPropertyId === id) {
      setExpandedPropertyId(null); // Collapse if already expanded
    } else {
      setExpandedPropertyId(id); // Expand this one
      fetchNearbySchools(property);
    }
  };

  // --- Render ---
  return (
    <div className="relative w-full z-20 text-black">
      {/* Styles for scrollbar hiding/styling if needed */}
      <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

      {/* Animated Container: Transitions from Pill (Search Bar) to Box (Chat UI) */}
      <motion.div
        layout
        initial={false}
        animate={{
          borderRadius: isExpanded ? 32 : 12, // 32px (rounded-3xl) vs 12px (rounded-xl) - Rectangular with soft corners
          padding: isExpanded ? 16 : 8, // keep expanded layout comfortable on mobile
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-white shadow-xl shadow-black/5 mx-auto bg-clip-padding relative overflow-visible w-full font-satoshi ${isExpanded ? 'max-w-[1800px]' : 'max-w-[720px]'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <AnimatePresence mode="wait">
          {/* State 1: Collapsed Search Bar Form */}
          {!isExpanded ? (
            <>
              <motion.form
                key="search-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                onSubmit={handleFormSubmit}
                className="relative flex items-center w-full bg-transparent"
              >
                {/* Left Sparkle Icon */}
                <div className="pl-3 md:pl-2 flex-shrink-0">
                  <Sparkles className="text-[#F58634] w-5 h-5 md:w-6 md:h-6" />
                </div>

                {/* Input Field */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  {renderPendingImageChip('collapsed')}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      fetchAddressSuggestions(val);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => {
                      setShowSuggestions(false);
                      setShowAddressSuggestions(false);
                      setShowLocationSuggestions(false);
                    }, 200)}
                    placeholder={pendingImage ? 'Add city, ZIP, or coordinates for this image' : (placeholderText || typedPlaceholder)}
                    className="flex-1 min-w-0 bg-transparent outline-none px-3 md:px-4 py-2 text-gray-700 placeholder-gray-400 text-sm md:text-sm font-medium"
                  />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 pr-1">
                  <button
                    type="button"
                    onClick={toggleMlsBypass}
                    title={mlsBypassMode ? 'Direct MLS mode is ON (AI search bypassed)' : 'Use Direct MLS mode'}
                    className={`h-8 rounded-full px-3 text-[11px] font-semibold transition-colors border ${mlsBypassMode
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {mlsBypassMode ? 'AI OFF' : 'AI Search'}
                  </button>
                  <div className="relative">
                    <div
                      className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-400 hover:text-gray-600"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                    >
                      <Paperclip className="w-5 h-5" />
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showAttachMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-full right-0 mb-2 w-32 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 ring-1 ring-black/5 overflow-hidden z-[70]"
                        >
                          <div className="flex flex-col p-1.5 gap-1">
                            <button
                              onClick={() => handleAttachmentClick('image')}
                              type="button"
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                            >
                              <ImageIcon className="w-4 h-4 text-blue-500" />
                              <span>Image</span>
                            </button>
                            <button
                              onClick={() => handleAttachmentClick('pdf')}
                              type="button"
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                            >
                              <FileText className="w-4 h-4 text-red-500" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Button
                    type='submit'
                    disabled={!!pendingImage && (pendingImageStatus !== 'ready' || !searchTerm.trim())}
                    className="bg-[#F58634] hover:bg-[#E07224] text-white rounded-xl px-8 py-3 font-semibold text-sm md:text-base flex items-center transition-all shadow-md hover:shadow-lg h-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#F58634]"
                  >
                    Begin Journey
                  </Button>
                </div>
              </motion.form>

              {/* Integrated Suggestions Dropdown */}
              <AnimatePresence>
                {!searchTerm && showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full border-t border-gray-100/50"
                  >
                    <div className="p-4 pt-4 text-left">
                      <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider pl-2">
                        Try Asking
                      </p>
                      <div className="space-y-1">
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            onMouseDown={() => handleSuggestionClick(suggestion.text)}
                            className="flex items-center gap-3 p-3 hover:bg-orange-50/50 rounded-xl cursor-pointer group transition-all"
                          >
                            <SearchIcon className="w-4 h-4 text-gray-300 group-hover:text-[#F58634] transition-colors" />
                            <span className="text-gray-600 group-hover:text-gray-900 font-medium text-sm transition-colors leading-snug">
                              {suggestion.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Address Autocomplete Suggestions ── */}
                {searchTerm && (showAddressSuggestions || isLoadingAddressSuggestions) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full border-t border-gray-100/50"
                  >
                    <div className="p-2 pt-3 text-left">
                      <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider pl-3">
                        Properties
                      </p>
                      <div className="space-y-0.5">
                        {isLoadingAddressSuggestions ? (
                          <div className="flex items-center gap-3 p-3 text-sm text-gray-400">
                            <div className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            Searching addresses…
                          </div>
                        ) : (
                          addressSuggestions.map((suggestion, idx) => {
                            // Split "123 Main St, City, State ZIP" into street vs city-state
                            const commaIdx = suggestion.address.indexOf(',');
                            const streetPart = commaIdx !== -1
                              ? suggestion.address.slice(0, commaIdx).trim()
                              : suggestion.address;
                            const cityStatePart = commaIdx !== -1
                              ? suggestion.address.slice(commaIdx + 1).trim()
                              : '';
                            return (
                              <div
                                key={suggestion.id || String(idx)}
                                onMouseDown={() => handleAddressSuggestionClick(suggestion)}
                                className="flex items-start gap-3 p-3 hover:bg-orange-50/50 rounded-xl cursor-pointer group transition-all"
                              >
                                <MapPin className="w-4 h-4 text-gray-300 group-hover:text-[#F58634] flex-shrink-0 mt-0.5 transition-colors" />
                                <span className="flex flex-col min-w-0">
                                  <span className="text-gray-800 font-semibold text-sm leading-snug truncate">
                                    {streetPart}
                                  </span>
                                  {cityStatePart && (
                                    <span className="text-gray-400 text-xs leading-snug truncate">
                                      {cityStatePart}
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Location (City/State) Autocomplete Suggestions ── */}
                {searchTerm && (showLocationSuggestions || isLoadingLocationSuggestions) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full border-t border-gray-100/50"
                  >
                    <div className="p-2 pt-3 text-left">
                      <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider pl-3">
                        Locations
                      </p>
                      <div className="space-y-0.5">
                        {isLoadingLocationSuggestions ? (
                          <div className="flex items-center gap-3 p-3 text-sm text-gray-400">
                            <div className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            Searching locations...
                          </div>
                        ) : (
                          locationSuggestions.map((suggestion, idx) => (
                            <div
                              key={suggestion.placeId || String(idx)}
                              onMouseDown={() => handleLocationSuggestionClick(suggestion)}
                              className="flex items-start gap-3 p-3 hover:bg-orange-50/50 rounded-xl cursor-pointer group transition-all"
                            >
                              <MapPin className="w-4 h-4 text-gray-300 group-hover:text-[#F58634] flex-shrink-0 mt-0.5 transition-colors" />
                              <span className="text-gray-800 font-medium text-sm leading-snug truncate">
                                {suggestion.description}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* State 2: Expanded Chat UI */
            <motion.div
              key="chat-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-col gap-6 w-full"
            >
              <div className="flex justify-between items-center w-full px-1 relative z-50">
                {/* Left: Brand Badge & Menu Trigger */}
                <div className="relative">
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="bg-black text-white pl-1 pr-4 py-1 rounded-full flex items-center gap-3 shadow-md hover:bg-gray-800 transition-colors cursor-pointer group active:scale-95 duration-200 select-none"
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src="/assets/images/group-14455.svg"
                        alt="SnapHomz AI"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm tracking-wide">SnapHomz AI</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* --- Premium Command Menu --- */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        {/* Backdrop to close */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="absolute top-full left-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black/5 max-h-80 flex flex-col"
                        >
                          <div className="flex flex-col flex-1 overflow-hidden p-2 space-y-1">
                            {/* New Chat Action */}
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setChatHistory([]);
                                setSessionId(null);
                                setIsSearching(false);
                                setIsMenuOpen(false);
                                setSelectedPropertyId(null);
                                setExpandedPropertyId(null);
                                if (onSearchStateChange) onSearchStateChange(true, '');

                                // Smooth scroll to search bar
                                setTimeout(() => {
                                  searchContainerRef.current?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                  });
                                  // Focus input after scroll
                                  setTimeout(() => {
                                    searchInputRef.current?.focus();
                                  }, 300);
                                }, 100);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-3 hover:bg-orange-50 rounded-xl transition-colors group text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">New Chat</p>
                                <p className="text-xs text-gray-500">Start a fresh search</p>
                              </div>
                            </button>

                            <div className="h-px bg-gray-100 my-1 mx-2" />

                            {/* History Section */}
                            <div className="flex flex-col flex-1 min-h-0 px-3 py-1.5">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex-none">Recent</p>
                              <div className="space-y-0.5 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                                {recentSessions.length === 0 && (
                                  <div className="px-2 py-2 text-xs text-gray-400">
                                    No recent chats yet.
                                  </div>
                                )}
                                {recentSessions.map((item, idx) => (
                                  <div
                                    key={item.id || idx}
                                    onClick={async () => {
                                      try {
                                        const details = await fetchSessionDetails(item.id);
                                        if (details) {
                                          const recovered: ChatMessage[] = details.messages.map((m: any, i: number) => ({
                                            id: `restored-${i}`,
                                            role: m.role,
                                            content: m.content
                                          }));

                                          if (details.last_results && recovered.length > 0) {
                                            const lastAiIndex = recovered.map(m => m.role).lastIndexOf('assistant');
                                            if (lastAiIndex !== -1) {
                                              const mappedProps = details.last_results.map((p: any, index: number) => {
                                                const mainImage = p.primaryListingImageUrl || p.primaryImage || p.imgSrc || p.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';
                                                const price = p.price || p.listPrice || '$0';
                                                const fmtPrice = typeof price === 'number' ? `$${price.toLocaleString()}` : price;
                                                const address = p.address || p.formattedAddress || (p.street ? `${p.street}, ${p.city}, ${p.state}` : 'Address Unavailable');
                                                const listingId = resolveListingId(p);
                                                const propertyId = resolvePropertyId(p);
                                                const cardIdentity = listingId ?? propertyId;
                                                const cardId = cardIdentity ?? `restored-${item.id}-${index}`;
                                                return {
                                                  id: cardId,
                                                  listingId,
                                                  propertyId,
                                                  listingUrl: p.listing_url || p.url || p.hdpUrl,
                                                  image: mainImage,
                                                  price: fmtPrice,
                                                  address: address,
                                                  beds: p.beds || p.bedrooms || p.bedroomTotal || 0,
                                                  baths: p.baths || p.bathrooms || p.bathroomTotal || 0,
                                                  sqft: p.livingArea || p.sqft || 'N/A',
                                                  type: 'Residential',
                                                  hasPool: p.hasPool,
                                                  features: p.features || [],
                                                  schools: [],
                                                  insights: { price: fmtPrice, safety: 'N/A', walkability: 'N/A', climate: 'N/A' },
                                                  images: [mainImage]
                                                };
                                              });
                                              recovered[lastAiIndex].relatedProperties = mappedProps;
                                              recovered[lastAiIndex].totalMatches = mappedProps.length;
                                              const existingContent = recovered[lastAiIndex].content;
                                              if (!existingContent || !existingContent.trim()) {
                                                recovered[lastAiIndex].content = `I found ${mappedProps.length} homes that match your criteria.`;
                                              }
                                            }
                                          }

                                          setSessionId(item.id);
                                          setChatHistory(recovered);
                                          setIsSearching(false);
                                          setIsMenuOpen(false);
                                          setIsExpanded(true);
                                          if (onSearchStateChange) onSearchStateChange(true, '');
                                        }
                                      } catch (e) { console.error(e); }
                                    }}
                                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate">{item.title || 'Untitled Session'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-gray-100 mt-1 p-1 flex-none">
                              <button
                                onClick={async () => {
                                  if (isClearingHistory) return;
                                  setIsClearingHistory(true);
                                  // Optimistic UI clear for smooth UX
                                  setRecentSessions([]);
                                  setSearchTerm('');
                                  setChatHistory([]);
                                  setSessionId(null);
                                  setIsSearching(false);
                                  setProperties([]);
                                  try {
                                    await clearHistoryAPI();
                                  } catch (e) {
                                    console.error("Failed to clear history:", e);
                                  } finally {
                                    setIsClearingHistory(false);
                                    setIsMenuOpen(false);
                                  }
                                }}
                                className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors ${isClearingHistory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                                disabled={isClearingHistory}
                              >
                                {isClearingHistory ? 'Clearing...' : 'Clear History'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right: Close */}
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    if (onSearchStateChange) onSearchStateChange(false, '');
                  }}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 1) User Bubble */}


              {/* 2) AI Logic Section */}
              {/* Chat History Loop */}
              <div className={`flex flex-col gap-8 w-full min-h-0 overflow-y-auto pr-0 sm:pr-2 pb-20 sm:pb-8 transition-all duration-500
              ${isExpanded ? 'h-[56vh] sm:h-[600px] md:h-[700px] lg:h-[750px]' : 'h-auto'}`}
                style={{ overflowAnchor: 'none' }}>
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex flex-col w-full min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'user' ? (
                      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl rounded-tr-sm max-w-[92%] sm:max-w-[80%] border border-gray-100 shadow-sm space-y-3">
                        {msg.imageUrl && (
                          <div className="space-y-2">
                            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-gray-200">
                              <img
                                src={msg.imageUrl}
                                alt={msg.attachmentName ? `Uploaded image ${msg.attachmentName}` : 'Uploaded image'}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            {msg.attachmentName && (
                              <p className="text-xs text-gray-500 font-medium truncate">{msg.attachmentName}</p>
                            )}
                          </div>
                        )}
                        {msg.content && (
                          <p className="text-gray-900 text-base sm:text-lg font-medium leading-relaxed break-words">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {msg.relatedProperties && msg.relatedProperties.length > 0 && (
                          <div className="order-1 flex items-start gap-5 px-1">
                            <div className="flex-shrink-0 mt-1 w-11 h-11 rounded-xl bg-[#140800] ring-1 ring-[#F58634]/35 shadow-sm flex items-center justify-center">
                              <Image
                                src="/assets/images/group-14455.svg"
                                alt="SnapHomz AI"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-black text-sm tracking-tight">SnapHomz AI</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI Avatar & Message */}
                        <div className={`flex items-start gap-5 px-1 ${msg.relatedProperties?.length ? 'order-4' : ''}`}>
                          {!msg.relatedProperties?.length && (
                            <div className="flex-shrink-0 mt-1 w-11 h-11 rounded-xl bg-[#140800] ring-1 ring-[#F58634]/35 shadow-sm flex items-center justify-center">
                              <Image
                                src="/assets/images/group-14455.svg"
                                alt="SnapHomz AI"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 space-y-3">
                            {!msg.relatedProperties?.length && (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-black text-sm tracking-tight">SnapHomz AI</span>
                              </div>
                            )}


                            <div className="text-gray-600 text-[15px] sm:text-[17px] leading-relaxed text-left font-normal break-words">
                              {formatMessageContent(msg.content || '')}
                            </div>

                            {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                              <div className="mt-6 mb-2">
                                <div className="flex items-center gap-2 mb-3">
                                  <Lightbulb className="w-5 h-5 text-[#F58634]" />
                                  <h3 className="text-lg font-bold text-gray-900">Related questions</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {msg.relatedQuestions.map((q, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setSearchTerm(q);
                                        handleSearchSubmit(q);
                                      }}
                                      className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-all text-left shadow-sm whitespace-normal"
                                    >
                                      {q}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Forecast Chart Card */}
                            {msg.isForecast && msg.forecastData && (
                              <div className="w-full mt-4 max-w-2xl bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 flex flex-col h-full shadow-sm">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-clash text-[18px] font-semibold text-gray-900">Rate forecast</h4>
                                    {activeForecastPoint && (
                                      <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[12px] font-satoshi text-gray-700">
                                        <span className="font-semibold">{formatForecastTooltipLabel(activeForecastPoint.date)}</span>
                                        <span className="text-gray-500">rate: {activeForecastPoint.rate.toFixed(3)}%</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Horizon Toggle */}
                                  <div className="inline-flex bg-black text-white rounded-full p-1 text-xs sm:text-sm font-satoshi">
                                    {[6, 12, 24].map((h) => (
                                      <button
                                        key={h}
                                        type="button"
                                        className={`px-3 py-1 rounded-full transition-colors ${forecastHorizon === h ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                                        onClick={async () => {
                                          setForecastHorizon(h as 6 | 12 | 24);
                                          const newPoints = await fetchForecast(h);
                                          if (newPoints && newPoints.length > 0) {
                                            setChatHistory(prev => prev.map(m =>
                                              m.id === msg.id ? { ...m, forecastData: newPoints } : m
                                            ));
                                          }
                                        }}
                                      >
                                        {h}M
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Chart Container */}
                                <div className="h-64 sm:h-72 lg:h-80 relative font-satoshi">
                                  {forecastLoading ? (
                                    <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading forecast...</div>
                                  ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart
                                        data={msg.forecastData} // Use message data
                                        margin={{ left: -16, right: 28, top: 8, bottom: 34 }}
                                        onMouseMove={(state: any) => {
                                          if (state && typeof state.activeTooltipIndex === "number" && state.activePayload && state.activePayload.length) {
                                            setIsForecastHovered(true);
                                            setActiveForecastPoint(state.activePayload[0].payload);
                                          }
                                        }}
                                        onMouseLeave={() => {
                                          setIsForecastHovered(false);
                                          setActiveForecastPoint(null);
                                        }}
                                      >
                                        <XAxis
                                          dataKey="date"
                                          tickFormatter={formatForecastTickLabel}
                                          tick={{ fontSize: 11 }}
                                          tickMargin={10}
                                          tickLine={false}
                                          axisLine={{ stroke: "#E5E7EB" }}
                                        />
                                        <YAxis
                                          domain={['auto', 'auto']}
                                          tickFormatter={(v: number) => `${v.toFixed(2)}%`}
                                          tick={{ fontSize: 11 }}
                                          tickLine={false}
                                          axisLine={{ stroke: "#E5E7EB" }}
                                        />
                                        {activeForecastPoint && (
                                          <>
                                            <ReferenceLine x={activeForecastPoint.date} stroke="#D1D5DB" strokeDasharray="3 3" />
                                            <ReferenceDot x={activeForecastPoint.date} y={activeForecastPoint.rate} r={4} fill="#F07639" stroke="#ffffff" strokeWidth={2} />
                                          </>
                                        )}
                                        <Line type="monotone" dataKey="rate" stroke="#F07639" strokeWidth={3} dot={{ r: 3 }} isAnimationActive={true} />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  )}
                                </div>
                              </div>
                            )}

                            {msg.map?.image_url && (
                              <div className="w-full mt-4 max-w-2xl">
                                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                                  <InteractiveSchoolMapPanel
                                    title={msg.map?.title}
                                    radiusMiles={msg.map?.radius_miles}
                                    markers={msg.map?.markers}
                                    fallbackImageUrl={msg.map?.image_url}
                                    listCount={msg.map?.list_count}
                                  />
                                ) : (
                                  <SchoolMapPanel
                                    title={msg.map?.title}
                                    imageUrl={msg.map?.image_url}
                                    radiusMiles={msg.map?.radius_miles}
                                    markers={msg.map?.markers}
                                    listCount={msg.map?.list_count}
                                  />
                                )}
                              </div>
                            )}

                            {/* Extracted Schools Card (Chat) */}
                            {msg.relatedSchools && msg.relatedSchools.length > 0 && (
                              <div className="w-full mt-4 max-w-2xl bg-[#FFF9F5] border border-[#FFD8B4] rounded-[20px] p-8">
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-3">
                                    <div className="">
                                      <GraduationCap className="w-6 h-6 text-[#F58634]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Schools Near <span className="text-[#F58634]">{msg.schoolAddress || 'Location'}</span></h3>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#F58634] bg-white border border-[#FFD8B4] px-3 py-1 rounded-full uppercase tracking-wide">
                                    via SnapGrad
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  {(expandedSchoolLists[msg.id] ? msg.relatedSchools : msg.relatedSchools.slice(0, 3)).map((school: any, i: number) => (
                                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between border border-gray-50 hover:shadow-md transition-shadow">
                                      <div className="text-left">
                                        <p className="font-medium text-gray-900 text-lg mb-1">{school.name}</p>
                                        <p className="text-sm text-gray-500 font-normal">
                                          {[school.meta ?? school.type, school.distance].filter(Boolean).join(' • ')}
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-end justify-center">
                                        <span className="text-2xl font-bold text-gray-900 tracking-tight">{school.rating}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {msg.relatedSchools.length > 3 && (
                                  <button
                                    onClick={() =>
                                      setExpandedSchoolLists(prev => ({
                                        ...prev,
                                        [msg.id]: !prev[msg.id]
                                      }))
                                    }
                                    className="mt-6 flex items-center gap-2 text-[#F58634] text-sm font-semibold hover:text-[#dd6d20] transition-colors"
                                  >
                                    {expandedSchoolLists[msg.id] ? 'Show less' : 'Show more'}
                                    {expandedSchoolLists[msg.id] ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Properties Carousel */}
                        {msg.relatedProperties && msg.relatedProperties.length > 0 && (
                          <div className={`w-full max-w-full ${msg.relatedProperties?.length ? 'order-2' : ''}`}>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center overflow-visible sm:overflow-x-auto gap-2 sm:gap-4 md:gap-6 px-0 sm:px-4 md:px-6 py-3 sm:py-5 md:py-6 sm:snap-x sm:snap-mandatory no-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                              {msg.relatedProperties.map((property: any) => {
                                const isActive = selectedPropertyId === property.id;
                                const isExpandedCard = expandedPropertyId === property.id;
                                const isAnySelected = selectedPropertyId !== null;
                                const propertyIdentity = resolvePropertyIdentityKey(property) || String(property.id || '');
                                const isFavourite = enableAgentFavorites && isPropertySavedInAnySnap(property);
                                const isFavouriteSaving = !!propertyIdentity && agentFavouriteSavingId === propertyIdentity;
                                const poolLabel =
                                  property.hasPool === true
                                    ? "Yes"
                                    : property.hasPool === false
                                      ? "No"
                                      : "N/A";
                                const poolBadgeClass =
                                  property.hasPool === true
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : property.hasPool === false
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-gray-50 text-gray-500 border-gray-200";

                                return (
                                  <div
                                    key={property.id}
                                    onClick={() => handlePropertyClick(property.id)}
                                    className={`
                                                                group relative flex flex-col
                                                                w-full min-w-0 max-w-full sm:min-w-[300px] sm:w-[300px] md:min-w-[360px] md:w-[360px] md:max-w-[360px] lg:min-w-[320px] lg:w-[320px] lg:max-w-[320px]
                                                                flex-shrink-0 rounded-2xl cursor-pointer sm:snap-center
                                                                transition-all duration-300 ease-out border bg-white overflow-hidden
                                                                ${isAnySelected
                                        ? isActive
                                          ? 'border-[#F58634] border-[3px] shadow-[0_8px_30px_rgba(249,115,22,0.2)] scale-[1.02] z-10'
                                          : 'border-gray-100 scale-100 z-0'
                                        : 'border-gray-200 hover:shadow-xl hover:scale-[1.01] hover:border-gray-300 z-0'
                                      }
                                                                ${isExpandedCard ? 'h-auto' : ''}
                                                            `}
                                  >
                                    {/* White Overlay for Inactive Effect */}
                                    {isAnySelected && !isActive && (
                                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] z-20 pointer-events-none transition-opacity duration-300" />
                                    )}

                                    <div className="h-44 sm:h-48 md:h-56 lg:h-52 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
                                      <Image
                                        src={property.image}
                                        alt="Property"
                                        fill
                                        unoptimized={true}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                      />
                                      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-md">
                                        {property.type}
                                      </div>
                                      {enableAgentFavorites && (
                                        <button
                                          type="button"
                                          onClick={(event) => openAgentFavouriteModal(property, event)}
                                          className={`absolute top-3 right-3 h-9 w-9 rounded-full border shadow-sm backdrop-blur-sm flex items-center justify-center transition-colors ${isFavourite
                                            ? 'bg-orange-500 border-orange-400 text-white'
                                            : 'bg-white/95 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-500'
                                            } ${isFavouriteSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                          aria-label={isFavourite ? 'Saved in favorites' : 'Save to favorites'}
                                          disabled={isFavouriteSaving}
                                        >
                                          <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
                                        </button>
                                      )}
                                    </div>

                                    <div className="p-5 flex flex-col gap-3">
                                      <div>
                                        <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{property.price}</h4>
                                        <p className="text-sm text-gray-500 font-medium line-clamp-1 mt-1">{property.address}</p>
                                      </div>

                                      {/* Premium Icons Stats */}
                                      <div className="flex items-center justify-between text-xs font-semibold text-gray-600 border-t border-b border-gray-100 py-3">
                                        <span className='flex items-center gap-1.5'>
                                          <BedDouble className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                                          <span>{property.beds} Beds</span>
                                        </span>
                                        <div className="w-[1px] h-4 bg-gray-200"></div>
                                        <span className='flex items-center gap-1.5'>
                                          <Bath className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                                          <span>{property.baths} Baths</span>
                                        </span>
                                        <div className="w-[1px] h-4 bg-gray-200"></div>
                                        <span className='flex items-center gap-1.5'>
                                          <Scaling className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                                          <span>{property.sqft} sqft</span>
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2 text-xs font-semibold text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                          <Droplets className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                                          Pool
                                        </span>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${poolBadgeClass}`}>
                                          {poolLabel}
                                        </span>
                                      </div>

                                      {/* Show More Button (Always Visible) */}
                                      <div className="flex justify-end pt-2">
                                        <button
                                          onClick={(e) => handleExpandClick(property, e)}
                                          className="flex items-center gap-1 text-xs font-bold text-[#F58634] hover:text-[#E07224] transition-colors"
                                        >
                                          {isExpandedCard ? "Show Less" : "Show More"}
                                          {isExpandedCard ? <ChevronUp className="w-3.5 h-3.5 stroke-[3]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {msg.query && (
                                <a
                                  href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://demo.snaphomz.com'}/buy/browse?q=${encodeURIComponent(msg.query || '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex-shrink-0 sm:snap-start self-stretch sm:self-center relative flex h-14 sm:h-48 w-full sm:w-48 flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 rounded-2xl sm:rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg transition-all duration-300 hover:scale-[1.01] sm:hover:scale-105 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-200/60 cursor-pointer"
                                >
                                  {/* Outer ring on hover */}
                                  <div className="pointer-events-none absolute inset-[-6px] rounded-2xl sm:rounded-full border-2 border-orange-200 opacity-0 transition-all duration-500 group-hover:opacity-100" />

                                  {/* Icon circle */}
                                  <div className="sm:mb-3 flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                                    </svg>
                                  </div>

                                  {/* Label */}
                                  <span className="text-center text-xs sm:text-sm font-semibold leading-tight text-orange-600 px-2 sm:px-4">
                                    Show More Properties
                                  </span>
                                </a>
                              )}
                            </div>
                            {snapConfirmationMessageId === msg.id && awaitingSnapConfirmation && (
                              <div className="px-0 sm:px-6 pb-6">
                                <p className="text-base font-semibold text-gray-900 mb-1">Did you find the exact property?</p>
                                <p className="text-sm text-gray-500 mb-4">Let me know so I can either dive deeper into a home or keep expanding the search radius.</p>
                                <div className="flex flex-wrap gap-3">
                                  <button
                                    type="button"
                                    onClick={handleSnapYesResponse}
                                    className="px-5 py-3 rounded-full bg-[#F58634] text-white text-sm font-semibold shadow-sm hover:bg-[#E07224] transition-colors"
                                  >
                                    Yes, that's the one
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSnapNoResponse()}
                                    disabled={snapIsFetchingMore}
                                    className={`px-5 py-3 rounded-full border text-sm font-semibold transition-colors ${snapIsFetchingMore
                                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'}`}
                                  >
                                    {snapIsFetchingMore ? 'Loading more matches...' : 'Show more similar homes'}
                                  </button>
                                </div>
                                {snapIsFetchingMore && (
                                  <p className="text-xs text-gray-400 mt-2">Expanding the search radius to surface fresh listings…</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expanded Details - Using Global Expanded ID but finding specific property */}
                        <AnimatePresence>
                          {expandedPropertyId && msg.relatedProperties?.some((p: any) => p.id === expandedPropertyId) && (() => {
                            const selectedProp = msg.relatedProperties?.find((p: any) => p.id === expandedPropertyId);
                            if (!selectedProp) return null;
                            const propertyDetailsUrl = toMainSitePropertyPreviewUrl(selectedProp, msg.query);

                            return (
                              <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                className={`w-full overflow-hidden ${msg.relatedProperties?.length ? 'order-3' : ''}`}
                              >
                                <div className="mt-4 sm:mt-8 flex flex-col gap-5 sm:gap-8 max-w-[1200px] mx-auto">
                                  {/* 1. ABOUT & GALLERY */}
                                  <div className="flex flex-col items-start w-full">
                                    <div className="mb-4 sm:mb-6 w-full">
                                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4 text-left">About this Home</h3>
                                      <p className="text-gray-600 leading-relaxed text-sm sm:text-lg max-w-4xl text-left">
                                        {selectedProp.description}
                                      </p>
                                    </div>

                                    <div className="flex overflow-x-auto gap-3 sm:gap-5 w-full pb-3 sm:pb-4 no-scrollbar snap-x snap-mandatory" style={{ scrollBehavior: 'smooth' }}>
                                      {selectedProp.images.map((img: string, idx: number) => (
                                        <div key={idx} className="relative flex-shrink-0 w-[85%] md:w-[320px] h-[170px] sm:h-[240px] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-sm group snap-center border border-gray-100">
                                          <Image
                                            src={img}
                                            alt={`Gallery ${idx}`}
                                            fill
                                            unoptimized={true}
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* 2. SCHOOLS NEARBY */}
                                  <div className="w-full">
                                    {(() => {
                                      const schoolsState = nearbySchoolsById[String(selectedProp.id)] || { status: 'idle', schools: [] as any[], schoolType: undefined, fallbackUsed: false };
                                      const schools = Array.isArray(schoolsState.schools) ? schoolsState.schools : [];
                                      const label = schoolsState.schoolType === 'private' ? 'Private Schools' : 'Public Schools';
                                      const labelNote = schoolsState.fallbackUsed ? ' (Fallback)' : '';

                                      return (
                                        <div className="bg-[#FFF9F5] border border-[#FFD8B4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-8">
                                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <div className="flex items-center gap-3">
                                              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#F58634]" />
                                              <h3 className="text-base sm:text-xl font-bold text-gray-900">
                                                Schools Near <span className="text-[#F58634]">{selectedProp.address.split(',')[0]}</span>
                                              </h3>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-[#F58634] bg-white border border-[#FFD8B4] px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide">
                                              {label}{labelNote}
                                            </span>
                                          </div>

                                          {schoolsState.status === 'loading' && (
                                            <div className="space-y-3">
                                              {[0, 1, 2].map((i) => (
                                                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 animate-pulse">
                                                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {schoolsState.status === 'error' && (
                                            <div className="text-sm text-gray-500">
                                              Nearby schools are unavailable for this property.
                                            </div>
                                          )}

                                          {schoolsState.status === 'ready' && schools.length === 0 && (
                                            <div className="text-sm text-gray-500">
                                              No nearby schools found within 5 miles.
                                            </div>
                                          )}

                                          {schoolsState.status === 'ready' && schools.length > 0 && (
                                            <div className="space-y-3 sm:space-y-4">
                                              {schools.map((school: any, i: number) => (
                                                <div key={i} className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between border border-gray-50 hover:shadow-md transition-shadow">
                                                  <div>
                                                    <p className="font-bold text-gray-900 text-sm sm:text-lg mb-1">{school.name}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                                      {[school.level || school.type, formatSchoolDistance(school.distance_miles ?? school.distance)].filter(Boolean).join(' • ')}
                                                    </p>
                                                  </div>
                                                  <div className="flex flex-col items-end justify-center">
                                                    <span className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                                                      {formatSchoolRating(school.rating ?? school.grade)}
                                                    </span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* 3. FEATURES */}
                                  <div className="flex flex-col items-start w-full">
                                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-left">Features</h3>
                                    <div className="flex flex-wrap justify-start gap-2 sm:gap-3 w-full">
                                      {selectedProp.features?.map((feature: string, i: number) => (
                                        <span key={i} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white border border-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors cursor-default whitespace-normal">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* 4. INSIGHTS */}
                                  <div className="bg-[#FFF9F5] border border-[#FFD8B4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-8">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                      <div className="flex items-center gap-3">
                                        <div className="">
                                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#F58634]" />
                                        </div>
                                        <h3 className="text-base sm:text-xl font-bold text-gray-900">{selectedProp.address.split(',')[0]} Insights</h3>
                                      </div>
                                      <span className="text-[9px] sm:text-[10px] font-bold text-[#F58634] bg-white border border-[#FFD8B4] px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide">
                                        via Local Wiki
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                      {/* Card 1: Price */}
                                      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
                                        <div className="flex justify-between items-start">
                                          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-[#F58634]" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Median Price</p>
                                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">{selectedProp.insights?.price}</p>
                                          <p className="text-[11px] sm:text-xs font-bold text-green-600 flex items-center gap-1">
                                            <ArrowUp className="w-3 h-3" /> +4.2% YoY <span className="text-gray-400 font-medium">vs last month</span>
                                          </p>
                                        </div>
                                      </div>
                                      {/* Card 2: Safety */}
                                      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
                                        <div className="flex justify-between items-start">
                                          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                                            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-[#F58634]" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Safety</p>
                                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">{selectedProp.insights?.safety}</p>
                                          <p className="text-[11px] sm:text-xs font-bold text-red-500 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 rotate-180" /> 5% <span className="text-gray-400 font-medium">Crime Index</span>
                                          </p>
                                        </div>
                                      </div>
                                      {/* Card 3: Walkability */}
                                      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
                                        <div className="flex justify-between items-start">
                                          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                                            <Trees className="w-4 h-4 sm:w-6 sm:h-6 text-[#F58634]" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Walkability</p>
                                          <div className="flex items-end justify-between">
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{selectedProp.insights?.walkability}</p>
                                            <span className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Walk Score</span>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Card 4: Climate */}
                                      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
                                        <div className="flex justify-between items-start">
                                          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                                            <CloudSun className="w-4 h-4 sm:w-6 sm:h-6 text-[#F58634]" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Climate</p>
                                          <div className="flex items-end justify-between">
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{selectedProp.insights?.climate}</p>
                                            <span className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Marine Layer</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Bottom Button */}
                                    <div className="flex justify-end mt-3 sm:mt-4">
                                      <button className="bg-[#121212] hover:bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-md">
                                        Explore Manhattan Beach on Local Wiki <ArrowUp className="w-3 h-3 rotate-90" />
                                      </button>
                                    </div>
                                  </div>
                                  {/* 5. VIEW FULL PROPERTY */}
                                  <div className="flex justify-center pb-4">
                                    <a
                                      href={propertyDetailsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => storePreviewFallback(selectedProp)}
                                      className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-orange-500 px-5 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
                                    >
                                      Want to know more about this property?
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
                                    </a>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })()}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ))}

                {enableAgentFavorites && agentFavouriteModalOpen && (
                  <div
                    className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4"
                    onClick={closeAgentFavouriteModal}
                  >
                    <div
                      className="w-full max-w-[480px] rounded-2xl bg-white shadow-2xl border border-gray-100 p-6"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={closeAgentFavouriteModal}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label="Close favorites modal"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 rounded-md overflow-hidden bg-gray-100">
                          {resolvePrimaryPropertyImage(agentFavouriteModalProperty) ? (
                            <img
                              src={resolvePrimaryPropertyImage(agentFavouriteModalProperty)}
                              alt="Property preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Save to favorites</h3>
                        </div>
                        <div className="ml-auto">
                          <Heart className="h-6 w-6 fill-orange-500 text-orange-500" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 mb-3">
                        <h2 className="text-xl font-bold">Snapz</h2>
                        {agentCollaborativeOpen ? (
                          <button
                            type="button"
                            onClick={closeAgentCollaborativeFlow}
                            className="text-sm text-orange-500"
                          >
                            Back
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAgentCreateSnapOpen((prev) => !prev)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-lg font-bold hover:bg-black transition-colors leading-none"
                            aria-label={agentCreateSnapOpen ? 'Cancel create snapz' : 'Create new snapz'}
                          >
                            {agentCreateSnapOpen ? '×' : '+'}
                          </button>
                        )}
                      </div>

                      {agentCollaborativeOpen ? (
                        <div className="mb-4">
                          {agentCollaborativeStep === 1 ? (
                            <form
                              className="flex flex-col gap-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void handleAgentCollaborativeCreateSnap();
                              }}
                            >
                              <input
                                type="text"
                                value={agentCollaborativeSnapName}
                                onChange={(event) => setAgentCollaborativeSnapName(event.target.value)}
                                placeholder="Enter new snapz name"
                                className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={!agentCollaborativeSnapName.trim() || agentSnapLoading}
                                className="bg-gray-900 hover:bg-black text-white font-semibold px-4 py-2 rounded-md transition disabled:opacity-40"
                              >
                                Create Snapz
                              </button>
                            </form>
                          ) : (
                            <form
                              className="flex flex-col gap-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void handleAgentCollaborativeInvite();
                              }}
                            >
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Invite Type</label>
                                  <select
                                    value={agentInviteType}
                                    onChange={(event) =>
                                      setAgentInviteType(event.target.value as 'co-buyer' | 'agent' | 'other')
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-500 transition-colors bg-white"
                                  >
                                    <option value="co-buyer">Invite Co-buyer</option>
                                    <option value="agent">Invite Agent</option>
                                    <option value="other">Invite Family/Friends</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {agentInviteType === 'co-buyer'
                                      ? 'Co-buyer Email'
                                      : agentInviteType === 'agent'
                                        ? 'Agent Email'
                                        : 'Email'}
                                  </label>
                                  <input
                                    type="email"
                                    value={agentInviteEmail}
                                    onChange={(event) => setAgentInviteEmail(event.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-500 transition-colors"
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                disabled={!agentInviteEmail.trim() || agentSnapLoading}
                                className="bg-gray-900 hover:bg-black text-white font-semibold px-4 py-2 rounded-md transition mt-2 disabled:opacity-40"
                              >
                                Send Invite
                              </button>
                            </form>
                          )}
                        </div>
                      ) : (
                        <>
                          {agentCreateSnapOpen && (
                            <form
                              className="flex items-center gap-2 mb-3"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void handleAgentCreateSnap();
                              }}
                            >
                              <input
                                type="text"
                                value={agentNewSnapName}
                                onChange={(event) => setAgentNewSnapName(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void handleAgentCreateSnap();
                                  }
                                }}
                                placeholder="Name your snapz..."
                                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500 transition-colors"
                              />
                              <button
                                type="submit"
                                disabled={!agentNewSnapName.trim() || agentSnapLoading}
                                className={`text-white text-sm font-semibold px-4 py-2 rounded-lg transition ${!agentNewSnapName.trim() || agentSnapLoading
                                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                  : 'bg-gray-900 hover:bg-black'
                                  }`}
                              >
                                Save
                              </button>
                            </form>
                          )}

                          <div className="flex flex-col gap-2 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
                            {agentSnapLoading ? (
                              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                                Loading snapz collections...
                              </div>
                            ) : (
                              agentModalSnapRows.map((snap, index) => {
                                const isMyFavourite = index === 0;
                                const isSaved =
                                  !!agentFavouriteModalProperty && isPropertySavedInSnap(agentFavouriteModalProperty, snap);
                                const rowId = pickFirstValidId([snap?.id]) || `snap-row-${index}`;

                                return (
                                  isMyFavourite ? (
                                    <div
                                      key={rowId}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition ${isSaved ? 'bg-orange-50 hover:bg-orange-100' : 'bg-gray-50 hover:bg-gray-100'
                                        } ${agentFavouriteSavingId ? 'cursor-not-allowed opacity-80' : ''}`}
                                      onClick={() => void handleAgentSnapSelection(snap)}
                                    >
                                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500">
                                        <Heart className="h-5 w-5 fill-white text-white" />
                                      </div>
                                      <span className="flex-1 font-semibold text-gray-800">
                                        {snap?.name || (isMyFavourite ? 'My Favourite' : 'Snapz')}
                                      </span>
                                      <Heart className={`h-6 w-6 ${isSaved ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                                    </div>
                                  ) : (
                                    <div
                                      key={rowId}
                                      className={`flex cursor-pointer items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition ${agentFavouriteSavingId ? 'cursor-not-allowed opacity-80' : ''}`}
                                      onClick={() => void handleAgentSnapSelection(snap)}
                                    >
                                      <span className="font-medium text-gray-800">{snap?.name || 'Snapz'}</span>
                                      <Heart className={`h-6 w-6 ${isSaved ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                                    </div>
                                  )
                                );
                              })
                            )}
                          </div>

                          <a
                            href="/snapz"
                            className="text-sm mb-4 text-right text-orange-500 w-full block"
                          >
                            View All Snapz
                          </a>
                        </>
                      )}

                      {agentFavouriteMessage && (
                        <p className="text-sm text-gray-500 mb-3">{agentFavouriteMessage}</p>
                      )}

                      <button
                        type="button"
                        onClick={openAgentCollaborativeFlow}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 bg-black p-3 rounded-md">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold">Create a collaborative snapz</p>
                            <p className="text-sm text-gray-500">Invite users to a saved snapz for collaboration</p>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isSearching && (
                  <div className="flex items-start gap-4 mt-6 ml-1">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#140800] ring-1 ring-[#F58634]/35 shadow-sm flex items-center justify-center">
                      <Image
                        src="/assets/images/group-14455.svg"
                        alt="SnapHomz AI"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-3 pt-1 w-full max-w-md">
                      <div className="flex items-center gap-3 animate-pulse">
                        {/* Custom Curvy Sparkles Icon matching Figma */}
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-[0_0_12px_rgba(245,134,52,0.7)]">
                          <path d="M14.5 4C14.5 4 15.5 10 20 12C15.5 14 14.5 20 14.5 20C14.5 20 13.5 14 9 12C13.5 10 14.5 4 14.5 4Z" fill="#F58634" />
                          <path d="M5.5 6C5.5 6 6 9 8 10C6 11 5.5 14 5.5 14C5.5 14 5 11 3 10C5 9 5.5 6 5.5 6Z" fill="#F58634" />
                          <path d="M5 16C5 16 5.5 18 7 19C5.5 20 5 22 5 22C5 22 4.5 20 3 19C4.5 18 5 16 5 16Z" fill="#F58634" />
                        </svg>
                        <span className="text-lg font-medium text-black">
                          {loadingMessages[loadingStep]}
                        </span>
                      </div>
                      <div className="space-y-3 opacity-40 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} className="h-2" />
              </div>

              {/* Footer / Related Questions & Search */}
              <div className="mt-2 pt-2 border-t border-gray-100/50 sticky bottom-0 bg-white/95 backdrop-blur-md z-30 pb-2 sm:pb-4">
                {/* 1. Related Questions (Removed - now dynamic per message) */}

                {/* 2. New Large Search Bar + Controls */}
                <div ref={searchContainerRef} className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:flex-nowrap sm:gap-3">
                  {/* Contextual Actions */}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setChatHistory([]); // Clear history
                      setSessionId(null); // Clear session
                      setIsSearching(false);
                      setIsMenuOpen(false);
                      setSelectedPropertyId(null);
                      setExpandedPropertyId(null);
                      setNearbySchoolsById({});
                      if (onSearchStateChange) onSearchStateChange(true, '');

                      // Smooth scroll to search bar
                      setTimeout(() => {
                        searchContainerRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                        });
                        // Focus input after scroll
                        setTimeout(() => {
                          searchInputRef.current?.focus();
                        }, 300);
                      }, 100);
                    }}
                    title="New Chat"
                    className="flex-shrink-0 w-11 h-12 sm:w-[60px] sm:h-[68px] bg-white border border-gray-200 rounded-2xl sm:rounded-[28px] flex items-center justify-center text-gray-400 hover:text-[#F58634] hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm group"
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the menu
                    }}
                    title="History"
                    className="flex-shrink-0 w-11 h-12 sm:w-[60px] sm:h-[68px] bg-white border border-gray-200 rounded-2xl sm:rounded-[28px] flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* Search Input */}
                  <div className={`relative min-w-0 ${pendingImage || pendingImagePreview ? 'w-full sm:flex-1' : 'flex-1'}`}>
                    <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20">
                      <button
                        type="button"
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
                      >
                        <Plus className="w-5 h-5" strokeWidth={2} />
                      </button>
                      <AnimatePresence>
                        {showAttachMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: -50 }} // Floating upwards from the button
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-full left-0 mb-2 w-32 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 ring-1 ring-black/5 overflow-hidden z-[70]"
                          >
                            <div className="flex flex-col p-1.5 gap-1">
                              <button
                                onClick={() => handleAttachmentClick('image')}
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                              >
                                <ImageIcon className="w-4 h-4 text-blue-500" />
                                <span>Image</span>
                              </button>
                              <button
                                onClick={() => handleAttachmentClick('pdf')}
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                              >
                                <FileText className="w-4 h-4 text-red-500" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {(pendingImage || pendingImagePreview) && (
                      <div className="absolute left-11 sm:left-14 top-1/2 -translate-y-1/2 z-10">
                        {renderPendingImageChip('expanded')}
                      </div>
                    )}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (pendingImage) {
                            if (pendingImageStatus === 'ready') {
                              submitPendingImage();
                            }
                          } else {
                            handleSearchSubmit(searchTerm);
                          }
                        }
                      }}
                      placeholder={pendingImage ? "Type city, ZIP, or coordinates for this image" : "Ask anything about homes, neighborhoods, schools"}
                      className={`w-full bg-white text-gray-900 rounded-full h-12 sm:h-[68px] ${pendingImage || pendingImagePreview ? 'pl-40 sm:pl-[19rem]' : 'pl-11 sm:pl-14'} pr-16 sm:pr-32 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200 transition-all text-sm sm:text-base placeholder:text-gray-400 font-normal`}
                    />
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-4">
                      <button
                        type="button"
                        onClick={toggleMlsBypass}
                        title={mlsBypassMode ? 'Direct MLS mode is ON (AI search bypassed)' : 'Use Direct MLS mode'}
                        className={`h-7 sm:h-8 rounded-full px-2.5 sm:px-3 text-[10px] sm:text-[11px] font-semibold border transition-colors ${mlsBypassMode
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {mlsBypassMode ? 'MLS' : 'AI'}
                      </button>
                      <button className="text-gray-500 hover:text-gray-900 transition-colors">
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => pendingImage ? submitPendingImage() : handleSearchSubmit(searchTerm)}
                        disabled={!!pendingImage && (pendingImageStatus !== 'ready' || !searchTerm.trim())}
                        className={`bg-black text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md ${pendingImage && (pendingImageStatus !== 'ready' || !searchTerm.trim()) ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'hover:bg-gray-800'}`}
                      >
                        {isSearching ? <Square className="w-4 h-4 fill-white" /> : <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Disclaimer */}
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Snapz AI can make mistakes. Consider checking important information.
                  </p>
                  {mlsBypassMode && (
                    <p className="mt-1 text-[11px] text-amber-600">
                      Direct MLS mode enabled: AI chat answers/history are bypassed for search reliability.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div >
    </div >
  );
};

