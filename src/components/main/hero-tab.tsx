'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { searchProperties, cancelActiveTask, fetchHistory, fetchSessionDetails, clearHistoryAPI, suggestAddresses, fetchThinkingProgress } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { useAuth } from '@/shared/hooks/useAuth';
import { initializeTempUserId, incrementSearchCount } from '@/slices/onboarding/property-preference';
import { usePropertyStore } from '@/store/use-property-store';
import type { AddressSuggestion, ThinkingProgressResponse } from '@/lib/api';
import { setMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Sparkles, Paperclip, X, ArrowUp, Mic, Search as SearchIcon, FileText, Image as ImageIcon, Camera, ChevronDown, ChevronUp, MapPin, School, Shield, Footprints, Thermometer, CloudSun, BedDouble, Bath, Square, Scaling, Calendar, Clock, TrendingUp, GraduationCap, Trees, Plus, Lightbulb, Droplets, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import SchoolMapPanel from '@/components/SchoolMapPanel';
import InteractiveSchoolMapPanel from '@/components/InteractiveSchoolMapPanel';
import ThinkingPanel from '@/components/main/ThinkingPanel';
import type { ThinkingStep } from '@/components/main/ThinkingPanel';
import { warning as showWarning } from '@/components/alert/notify';
import { useRecordPropertyView } from '@/hooks/api/auth/useViewHistory';


// Force refresh logic

// --- Types & Interfaces ---
interface Suggestion {
    id: string;
    text: string;
}

type SmartSuggestionIntent = 'mls' | 'nl' | 'mixed';

type AiQueryLogEntry = {
    query: string;
    count: number;
    lastUsedAt: number;
};

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
    clarification?: string;
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
    stoppedThinking?: boolean;
}

type ForecastPoint = { date: string; rate: number };

const US_STATE_ABBREVIATIONS = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA',
    'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
    'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]);

const US_STATE_NAMES = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida',
    'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine',
    'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska',
    'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
    'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas',
    'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming', 'district of columbia',
];

const LOCATION_INTENT_KEYWORDS = [
    'buy', 'rent', 'mortgage', 'loan', 'price', 'budget', 'under', 'over', 'around', 'approx', 'afford', 'payment',
    'bed', 'beds', 'bedroom', 'bedrooms', 'bath', 'baths', 'bathroom', 'bathrooms', 'sqft', 'square', 'feet',
    'garage', 'pool', 'yard', 'school', 'schools', 'district', 'condo', 'condos', 'townhome', 'townhomes',
    'apartment', 'apartments', 'house', 'houses', 'home', 'homes', 'property', 'properties', 'listing', 'listings',
    'near', 'nearby', 'with', 'without', 'looking', 'look', 'find', 'show', 'recommend', 'compare', 'explain',
    'calculate', 'what', 'why', 'how', 'can', 'should', 'tell', 'need', 'want', 'best', 'cheapest', 'expensive',
    'cheap', 'luxury', 'open', 'tour',
];

const STREET_SUFFIXES = [
    'st', 'street', 'ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 'dr', 'drive', 'ln', 'lane', 'ct', 'court',
    'cir', 'circle', 'pl', 'place', 'ter', 'terrace', 'pkwy', 'parkway', 'way', 'hwy', 'highway', 'trl', 'trail',
    'sq', 'square', 'loop', 'pike', 'aly', 'alley', 'route', 'rt',
];

const normalizeLocationInput = (value: string) =>
    value.trim().replace(/\s+/g, ' ');

const hasStateToken = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z\s]/g, ' ').toLowerCase();
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    if (tokens.some((token) => US_STATE_ABBREVIATIONS.has(token.toUpperCase()))) return true;
    const padded = ` ${cleaned} `;
    return US_STATE_NAMES.some((name) => padded.includes(` ${name} `));
};

const hasStreetAddressPattern = (value: string) => {
    const lowered = value.toLowerCase();
    if (!/^\s*\d{1,6}\s+/.test(lowered)) return false;
    const suffixPattern = new RegExp(`\\b(${STREET_SUFFIXES.join('|')})\\b`, 'i');
    return suffixPattern.test(lowered);
};

const hasLocationCues = (value: string) => {
    if (/\b\d{5}(?:-\d{4})?\b/.test(value)) return true;
    if (/^\s*-?\d{1,3}\.\d+\s*[,\\s]+-?\d{1,3}\.\d+\s*$/.test(value)) return true;
    if (hasStreetAddressPattern(value)) return true;
    if (hasStateToken(value)) return true;
    return false;
};

const hasLocationIntentKeywords = (value: string) => {
    const lower = value.toLowerCase();
    if (/[?$]/.test(lower)) return true;
    return LOCATION_INTENT_KEYWORDS.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(lower));
};

const classifyLocationQuery = (value: string) => {
    const normalized = normalizeLocationInput(value);
    if (!normalized) return 'invalid';

    const locationCues = hasLocationCues(normalized);
    const intentKeywords = hasLocationIntentKeywords(normalized);

    if (!locationCues && intentKeywords) return 'invalid';
    if (locationCues && !intentKeywords) return 'valid';
    if (locationCues && intentKeywords) return 'invalid';
    return 'borderline';
};

const hasLikelyMlsIdentifier = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;

    const compact = normalized.replace(/[\s#:,.-]/g, '');
    if (/^mls\d{5,12}$/.test(compact)) return true;
    if (/^\d{6,12}$/.test(compact)) return true;
    return false;
};

const classifySuggestionIntent = (value: string): SmartSuggestionIntent => {
    const normalized = normalizeLocationInput(value);
    if (!normalized) return 'nl';
    if (hasLikelyMlsIdentifier(normalized)) return 'mls';
    const locationClassification = classifyLocationQuery(normalized);
    if (locationClassification === 'valid') return 'mls';
    if (locationClassification === 'borderline') return 'mixed';
    return 'nl';
};

const geocodeValidateLocation = (value: string) =>
    new Promise<boolean>((resolve) => {
        if (typeof window === 'undefined' || !window.google?.maps?.Geocoder) {
            resolve(true);
            return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            {
                address: value,
                componentRestrictions: { country: 'us' },
            },
            (results: any, status: any) => {
                if (status !== 'OK' || !results || results.length === 0) {
                    resolve(false);
                    return;
                }

                const allowedTypes = new Set([
                    'street_address',
                    'route',
                    'premise',
                    'subpremise',
                    'locality',
                    'neighborhood',
                    'sublocality',
                    'postal_code',
                    'administrative_area_level_1',
                    'administrative_area_level_2',
                ]);

                const match = results.some((result: any) =>
                    Array.isArray(result.types) && result.types.some((t: any) => allowedTypes.has(t))
                );
                resolve(match);
            }
        );
    });

const showLocationValidationToast = () => {
    showWarning({
        message: 'Enter a valid location',
        subtitle: 'Please enter a city, state, or full address in the U.S.',
        id: 'mls-location-validation',
        duration: 4000,
    });
};

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

const CAMERA_TIP_TOPIC_TEXT = 'finding similar homes instantly from a photo.';
const AI_MODE_TIPS = [
    'finding the perfect home.',
    'nearby schools and neighborhoods.',
    'mortgage options and affordability.',
    CAMERA_TIP_TOPIC_TEXT,
    'whether renting or buying is better for you.',
    'current home loan interest rates.',
    'buying or renting a home.'
];
const CAMERA_TIP_TEXT = `Click here to ask AI about ${CAMERA_TIP_TOPIC_TEXT}`;
const AI_MODE_TIP_LAST_INDEX_STORAGE_KEY = 'snaphomz:ai-mode-tip:last-index';
const AI_QUERY_LOG_STORAGE_KEY = 'snaphomz:hero:ai-suggestion-logs:v1';
const MAX_AI_QUERY_LOGS = 80;
const MAX_AI_SUGGESTIONS = 4;
const INITIAL_AI_TRY_ASKING_SUGGESTIONS: Suggestion[] = [
    { id: 'try-1', text: '3-bedroom homes near top-rated schools in Manhattan Beach' },
    { id: 'try-2', text: "I'm looking for 4-bedroom houses in Los Angeles, California with a pool" },
    { id: 'try-3', text: "Explain what an HOA is like I'm 5." },
    { id: 'try-4', text: 'What is the monthly payment on a $240,000 loan at 6% for 30 years?' },
];

// ── Proactive Greeting Helpers ──────────────────────────────────────────────
const SNAPHOMZ_LAST_SEARCH_KEY = 'snaphomz_last_search';

function getTimeGreeting(): string {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 22) return 'Good evening';
    return 'Hey';
}

function getLastSearchSummary(userId?: string): string | null {
    try {
        if (!userId) return null; // anonymous users never show last search
        const key = `${SNAPHOMZ_LAST_SEARCH_KEY}_${userId}`;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (Date.now() - (data.ts || 0) > 30 * 24 * 60 * 60 * 1000) return null;
        return data.summary || null;
    } catch { return null; }
}

const PROACTIVE_TEMPLATES_NO_NAME: Array<(time: string) => string> = [
    (time) => `${time}! I'm here to help you find your perfect home.\n\nWhat are you looking for today?`,
    (time) => `${time}! Ready to help you search smarter.\n\nTell me what kind of home you have in mind.`,
    (time) => `${time}! Let's find you the perfect place.\n\nWhat would you like to search for?`,
];

const PROACTIVE_TEMPLATES_NAMED: Array<(time: string, name: string) => string> = [
    (time, name) => `${time}, ${name}! I'm here to help you find your perfect home.\n\nWhat are you looking for today?`,
    (time, name) => `${time}, ${name}! Ready to help you search smarter.\n\nTell me what kind of home you have in mind.`,
    (time, name) => `${time}, ${name}! Let's find you the perfect place.\n\nWhat would you like to search for?`,
];

const PROACTIVE_TEMPLATES_RETURNING: Array<(time: string, name: string, search: string) => string> = [
    (time, name, search) => `${time}, ${name}! Welcome back.\n\nLast time you were looking at **${search}** homes. Want to pick up that search, or start fresh?`,
    (time, name, search) => `${time}, ${name}! Good to see you again.\n\nYou were searching for **${search}** homes last time. Continue where you left off?`,
    (time, name, search) => `${time}, ${name}! Welcome back.\n\nShall we pick up your **${search}** search, or explore something new today?`,
];

function buildProactiveGreeting(userName?: string, userId?: string): string {
    const time = getTimeGreeting();
    const lastSearch = getLastSearchSummary(userId);
    const name = userName?.trim();
    const idx = Math.floor(Math.random() * 3);
    if (lastSearch && name) return PROACTIVE_TEMPLATES_RETURNING[idx](time, name, lastSearch);
    if (name) return PROACTIVE_TEMPLATES_NAMED[idx](time, name);
    return PROACTIVE_TEMPLATES_NO_NAME[idx](time);
}

const PROACTIVE_SUGGESTION_SETS: string[][] = [
    // Set A — Search + Finance + Education
    [
        '3-bed homes in Austin under $600K with a pool',
        'Can I afford a home on $9,000/month income?',
        'Explain closing costs like I\'m 5',
    ],
    // Set B — Finance WOW + Comparison + Concepts
    [
        'What\'s my monthly payment on a $450,000 home?',
        'Compare Austin vs Denver for a first-time buyer',
        'What is PMI and will I have to pay it?',
    ],
];

function buildProactiveSuggestions(): string[] {
    const idx = Math.floor(Math.random() * PROACTIVE_SUGGESTION_SETS.length);
    return PROACTIVE_SUGGESTION_SETS[idx];
}
// ────────────────────────────────────────────────────────────────────────────
const CURATED_AI_SEARCH_TEMPLATES: string[] = [
    '3-bedroom homes near top-rated schools in Manhattan Beach',
    'Homes in Irvine under $900k with low HOA',
    'Show family-friendly neighborhoods in Austin with great schools',
    'Condos in San Diego with ocean view and parking',
    'What can I afford with $8,000 monthly income and 20% down?',
    'Best neighborhoods in Dallas for first-time home buyers',
    'Townhomes near BART stations in the Bay Area',
    'Single-family homes in Phoenix with a pool under $700k',
    'Safe neighborhoods in Seattle with short downtown commute',
    'Starter homes in Sacramento under $500k',
    'Compare buying vs renting in Los Angeles this year',
    'Investment properties in Tampa with strong rental demand',
    '2-bedroom condos in Miami with low maintenance fees',
    'Homes near top elementary schools in Plano Texas',
    'New construction homes in Charlotte under $650k',
    'Fixer-uppers in Denver with high upside potential',
    'Walkable neighborhoods in Chicago with good public transit',
    'Luxury homes in Orange County with a guest house',
    'Show homes with ADU potential in San Jose',
    'Estimate monthly payment for a $1.1M home at 6.25% interest',
    'Homes with large backyard in San Antonio under $450k',
    'Best suburbs near Atlanta for young families',
    'Properties close to hospitals in Houston',
    'Pet-friendly condo communities in Scottsdale',
];

const normalizeSuggestionKey = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

const scoreSuggestionMatch = (candidateText: string, query: string, queryTokens: string[]) => {
    if (!query) return 30;
    const normalizedCandidate = normalizeSuggestionKey(candidateText);
    if (normalizedCandidate === query) return 180;
    if (normalizedCandidate.startsWith(query)) return 140;
    if (normalizedCandidate.includes(query)) return 95;
    if (queryTokens.length === 0) return 0;
    const tokenHits = queryTokens.reduce((count, token) => (
        normalizedCandidate.includes(token) ? count + 1 : count
    ), 0);
    if (tokenHits === 0) return 0;
    return 48 + tokenHits * 14;
};

const buildAiSuggestionsFromLocalData = (query: string, logs: AiQueryLogEntry[]): Suggestion[] => {
    const normalizedQuery = normalizeSuggestionKey(query);
    const queryTokens = normalizedQuery.split(' ').filter(Boolean);
    const now = Date.now();
    const deduped = new Map<string, { text: string; score: number }>();

    const upsert = (text: string, baseScore: number, usageCount = 0, lastUsedAt = 0) => {
        const normalizedText = normalizeSuggestionKey(text);
        if (!normalizedText) return;
        const matchScore = scoreSuggestionMatch(text, normalizedQuery, queryTokens);
        if (normalizedQuery && matchScore <= 0) return;

        const recencyDays = lastUsedAt > 0 ? Math.max(0, (now - lastUsedAt) / 86400000) : Number.POSITIVE_INFINITY;
        const recencyBoost = Number.isFinite(recencyDays) ? Math.max(0, 26 - recencyDays) : 0;
        const usageBoost = Math.min(usageCount, 20) * 6;
        const totalScore = baseScore + matchScore + usageBoost + recencyBoost;

        const existing = deduped.get(normalizedText);
        if (!existing || totalScore > existing.score) {
            deduped.set(normalizedText, { text, score: totalScore });
        }
    };

    CURATED_AI_SEARCH_TEMPLATES.forEach((template) => upsert(template, 36));
    logs.forEach((entry) => upsert(entry.query, 52, entry.count, entry.lastUsedAt));

    return Array.from(deduped.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_AI_SUGGESTIONS)
        .map((item) => ({
            id: normalizeSuggestionKey(item.text).replace(/[^a-z0-9]+/g, '-'),
            text: item.text,
        }));
};

const DEFAULT_MAIN_SITE_URL = 'https://demo.snaphomz.com';

// const getMainSiteBaseUrl = () => {
//     const raw = process.env.NEXT_PUBLIC_MAIN_SITE_URL || DEFAULT_MAIN_SITE_URL;
//     return raw.replace(/\/+$/, '');
// };

const getMainSiteBaseUrl = () => {
    // If we are in the browser, dynamically get the current domain
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    // Fallback for Server-Side Rendering (SSR)
    return '';
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
        return `${mainSiteBase}/buy/${encodeURIComponent(String(listingId))}/prop/preview?${params.toString()}`;
    }

    const listingUrl = property?.listingUrl || property?.listing_url || property?.url;
    if (typeof listingUrl === 'string' && listingUrl.trim()) {
        const trimmed = listingUrl.trim();
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return `${mainSiteBase}${normalizedPath}`;
    }

    if (fallbackQuery) {
        return `${mainSiteBase}/buy/browse?q=${encodeURIComponent(fallbackQuery)}`;
    }

    return `${mainSiteBase}/buy/browse`;
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

const getCanonicalPriceForCard = (property: any): string => {
    const raw =
        property?.price_display ??
        property?.listPrice ??
        property?.list_price ??
        property?.price_value ??
        property?.price ??
        property?.formattedPrice ??
        property?.asking_price;

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return `$${raw.toLocaleString()}`;
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return '$0';
        const numeric = Number(trimmed.replace(/[^0-9.]/g, ''));
        if (Number.isFinite(numeric) && numeric > 0) {
            return `$${numeric.toLocaleString()}`;
        }
        return trimmed;
    }
    return '$0';
};

const extractPropertyOrdinalFromQuery = (query: string): number | null => {
    if (!query) return null;
    const lower = query.toLowerCase();

    const numberedOrdinal = lower.match(/\b(\d+)\s*(?:st|nd|rd|th)\b/);
    if (numberedOrdinal) {
        const value = Number(numberedOrdinal[1]);
        return Number.isFinite(value) ? value : null;
    }

    const propertyNumber = lower.match(/\bproperty\s*#?\s*(\d+)\b/);
    if (propertyNumber) {
        const value = Number(propertyNumber[1]);
        return Number.isFinite(value) ? value : null;
    }

    const genericNumber = lower.match(/\b(\d+)\s*(?:property|home|house|listing)\b/);
    if (genericNumber) {
        const value = Number(genericNumber[1]);
        return Number.isFinite(value) ? value : null;
    }

    const wordToOrdinal: Record<string, number> = {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        sixth: 6,
        seventh: 7,
        eighth: 8,
        ninth: 9,
        tenth: 10,
    };
    for (const [word, ordinal] of Object.entries(wordToOrdinal)) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
            return ordinal;
        }
    }

    return null;
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

        const fmtPrice = getCanonicalPriceForCard(p);
        const streetAddr = p.address || p.formattedAddress || p.fullAddress || p.street;
        const addrCity = p.city || '';
        const addrState = p.state || p.stateOrProvince || '';
        const addrZip = p.zip || p.zipCode || '';
        const locationStr = [addrCity, addrState && addrZip ? `${addrState} ${addrZip}` : addrState].filter(Boolean).join(', ');
        const address = streetAddr
            ? (locationStr ? `${streetAddr}, ${locationStr}` : streetAddr)
            : 'Address Unavailable';

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

const autoFormatAnswerText = (rawText: string): string => {
    if (!rawText) return '';

    const hasStructuredMarkdown = /(^|\n)\s*(#{1,6}\s|[-*]\s+|\d+\.\s+|\|.+\|)/m.test(rawText);
    if (hasStructuredMarkdown) return rawText;

    const existingNonEmptyLines = rawText.split('\n').filter((line) => line.trim().length > 0).length;
    if (existingNonEmptyLines >= 4) return rawText;

    const normalized = rawText.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const sentenceChunks = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((part) => part.trim())
        .filter(Boolean);

    if (sentenceChunks.length <= 2) return normalized;

    const paragraphCueRegex =
        /^(firstly|first,|secondly|thirdly|alternatively|on the other hand|the broader market|for families|notably|overall|in summary|key takeaway|these educational opportunities)/i;

    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    sentenceChunks.forEach((sentence) => {
        const isCueSentence = paragraphCueRegex.test(sentence);
        const paragraphIsLong = currentParagraph.length >= 2;

        if (currentParagraph.length > 0 && (isCueSentence || paragraphIsLong)) {
            paragraphs.push(currentParagraph.join(' '));
            currentParagraph = [sentence];
            return;
        }

        currentParagraph.push(sentence);
    });

    if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs.join('\n');
};

const sanitizeAssistantOutput = (rawText: string) => {
    if (!rawText || typeof rawText !== 'string') {
        return { cleanedText: '', extractedSuggestions: [] as string[] };
    }

    let cleaned = rawText;
    const extractedSuggestions: string[] = [];
    const actionSuggestionPattern = /^(show|find|compare|filter|explore|use|list|calculate|tell|what|help|focus)\b/i;

    const suggestionsBlockRegex = /(?:^|\n)\s*-{2,}\s*SUGGESTIONS\s*-{2,}\s*([\s\S]*)$/i;
    const suggestionsBlock = cleaned.match(suggestionsBlockRegex);
    if (suggestionsBlock?.[1]) {
        const suggestionLines = suggestionsBlock[1]
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        suggestionLines.forEach((line) => {
            const item = line.replace(/^\d+[\).\-\s]+/, '').trim();
            if (item) extractedSuggestions.push(item);
        });

        cleaned = cleaned.replace(suggestionsBlockRegex, '').trim();
    }

    // Extract actionable numbered suggestions even when no explicit SUGGESTIONS block exists.
    rawText
        .split('\n')
        .map((line) => line.trim())
        .forEach((line) => {
            const numbered = line.match(/^\d+[\).\-\s]+(.+)$/);
            if (numbered?.[1]) {
                const candidate = numbered[1].trim();
                if (candidate && actionSuggestionPattern.test(candidate)) {
                    extractedSuggestions.push(candidate);
                }
            }

            const cta = line.match(/^want me to\s+(.+)\?$/i);
            if (cta?.[1]) {
                const normalized = cta[1]
                    .replace(/\s+or\s+/gi, ',')
                    .split(',')
                    .map((part) => part.trim())
                    .filter(Boolean);
                normalized.forEach((part) => {
                    if (actionSuggestionPattern.test(part)) {
                        extractedSuggestions.push(part.charAt(0).toUpperCase() + part.slice(1));
                    }
                });
            }
        });

    // Remove templated sections that should not be shown directly to end users.
    cleaned = cleaned.replace(
        /(?:^|\n)\s*(?:\*\*|__)?\s*Context\s*:(?:\*\*|__)?\s*[\s\S]*?(?=\n\s*(?:\*\*|__)?\s*Closing CTA\s*:|$)/i,
        '\n'
    );
    cleaned = cleaned.replace(
        /(?:^|\n)\s*(?:\*\*|__)?\s*Closing CTA\s*:(?:\*\*|__)?\s*[\s\S]*$/i,
        '\n'
    );

    // Line-based cleanup fallback to remove any lingering Context/CTA sections.
    const cleanedLines = cleaned.split('\n');
    const filteredLines: string[] = [];
    let skipBlock = false;
    for (const line of cleanedLines) {
        const trimmed = line.trim();
        const isContextHeader = /^(?:\*\*|__)?\s*Context\s*:(?:\*\*|__)?\s*$/i.test(trimmed);
        const isCtaHeader = /^(?:\*\*|__)?\s*Closing CTA\s*:(?:\*\*|__)?\s*$/i.test(trimmed);

        if (isContextHeader || isCtaHeader) {
            skipBlock = true;
            continue;
        }
        if (skipBlock) {
            if (!trimmed) {
                skipBlock = false;
            }
            continue;
        }
        filteredLines.push(line);
    }
    cleaned = filteredLines.join('\n');
    cleaned = cleaned
        .split('\n')
        .filter((line) => {
            const trimmed = line.trim();
            if (!trimmed) return true;
            if (/^---\s*SUGGESTIONS\s*---$/i.test(trimmed)) return false;
            if (/^Want me to\s+.+\?$/i.test(trimmed)) return false;
            const numbered = trimmed.match(/^\d+[\).\-\s]+(.+)$/);
            if (numbered?.[1] && actionSuggestionPattern.test(numbered[1].trim())) return false;
            return true;
        })
        .join('\n');

    // Remove markdown links [text](url) entirely — no external URLs or company references shown
    cleaned = cleaned
        .split('\n')
        .map((line) => line.replace(/\[([^\]]+)\]\([^)]+\)/g, '').trimEnd())
        .filter((line) => {
            const t = line.trim();
            // Drop lines that are now empty or just a bare bullet/dash after link removal
            return t !== '' && t !== '-' && t !== '•' && t !== '*';
        })
        .join('\n');

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    const uniqueSuggestions = Array.from(
        new Set(
            extractedSuggestions
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
        )
    );
    return { cleanedText: cleaned, extractedSuggestions: uniqueSuggestions };
};

// Helper to format AI response cleanly
const formatMessageContent = (text: string) => {
    if (!text) return null;

    const lines = autoFormatAnswerText(text).split('\n');
    const formattedElements: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];
    let currentTableRows: string[] = [];

    const flushList = (idx: number) => {
        if (currentListItems.length > 0) {
            formattedElements.push(
                <ul key={`ul-${idx}`} className="list-disc pl-5 mb-4 space-y-1 text-gray-800">
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
                <li key={`li-${index}`} className="mb-1 text-gray-800">
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
                <p key={`p-${index}`} className="mb-2 text-gray-800">
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

function AssistantResponseText({
    text,
    animate,
    speedMs = 10,
    onComplete,
    onProgress,
}: {
    text: string;
    animate: boolean;
    speedMs?: number;
    onComplete?: () => void;
    onProgress?: () => void;
}) {
    const [displayedText, setDisplayedText] = useState('');
    const onCompleteRef = useRef(onComplete);
    const onProgressRef = useRef(onProgress);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        onProgressRef.current = onProgress;
    }, [onProgress]);

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            return;
        }

        if (!animate) {
            setDisplayedText(text);
            onProgressRef.current?.();
            return;
        }

        let index = 0;
        setDisplayedText('');

        const timer = setInterval(() => {
            index += 1;
            setDisplayedText(text.slice(0, index));
            if (index % 3 === 0 || index >= text.length) {
                onProgressRef.current?.();
            }
            if (index >= text.length) {
                clearInterval(timer);
                onCompleteRef.current?.();
            }
        }, speedMs);

        return () => clearInterval(timer);
    }, [text, animate, speedMs]);

    const showCursor = animate && displayedText.length < text.length;

    return (
        <>
            {formatMessageContent(displayedText)}
            {showCursor && (
                <motion.span
                    aria-hidden="true"
                    className="ml-[1px] inline-block text-[#F58634]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                >
                    |
                </motion.span>
            )}
        </>
    );
}

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



export const HeroSearchForm = ({ placeholderText, onSearchStateChange, isSearchActive, searchType, onSuggestionsOpen, respectParentWidth = false }: { placeholderText?: string, onSearchStateChange?: (isActive: boolean, searchTerm: string) => void, isSearchActive?: boolean, searchType?: string, showOutline?: boolean, disableAutoExpand?: boolean, onSuggestionsOpen?: (open: boolean) => void, respectParentWidth?: boolean }) => {
    // --- Hooks & State ---
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { recordPropertyView } = useRecordPropertyView();
    const viewHistoryDedupeRef = useRef<Set<string>>(new Set());
    const tempUserId = useAppSelector((state: any) => state.propertyPreference.tempUserId);
    const { sessionId: globalSessionId, setSessionId: setGlobalSessionId } = usePropertyStore();

    useEffect(() => {
        if (!tempUserId) {
            dispatch(initializeTempUserId());
        }
    }, [dispatch, tempUserId]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    // Address autocomplete state
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [isLoadingAddressSuggestions, setIsLoadingAddressSuggestions] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] = useState(false);
    const [aiQueryLogs, setAiQueryLogs] = useState<AiQueryLogEntry[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
    const [thinkingIntentHint, setThinkingIntentHint] = useState<string | undefined>(undefined);
    const [latestThoughtDurationMs, setLatestThoughtDurationMs] = useState<number | null>(null);
    const requestStartedAtRef = useRef<number | null>(null);
    // Controls expansion state (Collapsed Search Bar vs Expanded Chat UI)
    const [isExpanded, setIsExpanded] = useState(false);
    // Proactive greeting shown on fresh chat open (UI-only, not stored in chatHistory)
    const [showProactiveGreeting, setShowProactiveGreeting] = useState(false);
    const [proactiveGreetingText, setProactiveGreetingText] = useState('');
    const [proactiveSuggestions, setProactiveSuggestions] = useState<string[]>([]);
    const [proactiveGreetingComplete, setProactiveGreetingComplete] = useState(false);
    const [typedPlaceholder, setTypedPlaceholder] = useState("");
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showAttachTooltip, setShowAttachTooltip] = useState(false);
    const attachMenuRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingImageRef = useRef<File | null>(null);
    const chatLayoutRef = useRef<HTMLDivElement | null>(null);
    // Menu State for AI Badge
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Session State for Conversation Persistence
    const [sessionId, setLocalSessionId] = useState<string | null>(null);
    const setSessionId = useCallback((id: string | null) => {
        setLocalSessionId(id);
        setGlobalSessionId(id);
    }, [setGlobalSessionId]);
    const activeSessionId = sessionId || globalSessionId;
    const [recentSessions, setRecentSessions] = useState<any[]>([]);
    const [mlsBypassMode, setMlsBypassMode] = useState(false);
    const [aiModeActive, setAiModeActive] = useState(true);
    const aiModeTipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasShownInitialAiTipRef = useRef(false);
    const [showAiModeTip, setShowAiModeTip] = useState(false);
    const [aiModeTipIndex, setAiModeTipIndex] = useState(0);
    const activeAiModeTip = AI_MODE_TIPS[aiModeTipIndex] || AI_MODE_TIPS[0];
    const showCameraTipBubble = activeAiModeTip === CAMERA_TIP_TOPIC_TEXT;
    const [pendingLocationImage, setPendingLocationImage] = useState<File | null>(null);
    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
    const [pendingImageStatus, setPendingImageStatus] = useState<'idle' | 'processing' | 'ready'>('idle');
    const [submittedImage, setSubmittedImage] = useState<File | null>(null);
    const [snapSearchInProgress, setSnapSearchInProgress] = useState(false);
    const [isClearingHistory, setIsClearingHistory] = useState(false);
    const [carouselEdges, setCarouselEdges] = useState<Record<string, { atStart: boolean; atEnd: boolean }>>({});
    const aiSuggestions = React.useMemo(
        () => buildAiSuggestionsFromLocalData(searchTerm, aiQueryLogs),
        [searchTerm, aiQueryLogs]
    );
    const searchSuggestionIntent = classifySuggestionIntent(searchTerm);
    const initialSuggestionsMode = searchTerm.trim().length === 0;
    const displayedAiSuggestions = initialSuggestionsMode
        ? INITIAL_AI_TRY_ASKING_SUGGESTIONS
        : aiSuggestions;
    const suggestionsVisible =
        !isExpanded &&
        showSuggestions &&
        searchSuggestionIntent === 'nl' &&
        displayedAiSuggestions.length > 0;
    const anySuggestionsVisible = !isExpanded && (
        suggestionsVisible ||
        (!!searchTerm.trim() && (showAddressSuggestions || isLoadingAddressSuggestions || showLocationSuggestions || isLoadingLocationSuggestions))
    );

    // Rent Vs Buy State

    useEffect(() => {
        // Homepage search now auto-routes between MLS and AI based on query type.
        // Keep persisted MLS bypass disabled so natural-language queries stay on AI.
        setMlsBypassMode(false);
        setAiModeActive(true);
        setMlsBypassModeEnabled(false);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(AI_QUERY_LOG_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;
            const cleaned = parsed
                .filter((item: any) =>
                    item &&
                    typeof item.query === 'string' &&
                    Number.isFinite(Number(item.count)) &&
                    Number.isFinite(Number(item.lastUsedAt))
                )
                .map((item: any) => ({
                    query: String(item.query).trim(),
                    count: Math.max(1, Math.trunc(Number(item.count))),
                    lastUsedAt: Math.max(0, Math.trunc(Number(item.lastUsedAt))),
                }))
                .filter((item: AiQueryLogEntry) => item.query.length > 0)
                .sort((a: AiQueryLogEntry, b: AiQueryLogEntry) => b.lastUsedAt - a.lastUsedAt)
                .slice(0, MAX_AI_QUERY_LOGS);

            setAiQueryLogs(cleaned);
        } catch {
            // Ignore malformed local storage payloads.
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (!isMenuOpen) return;

        const loadHistory = async () => {
            try {
                const currentUserId = user?.id || tempUserId;
                if (!currentUserId) return;
                const sessions = await fetchHistory(currentUserId);
                if (!cancelled) {
                    const historyItems = Array.isArray(sessions?.history) ? sessions.history : Array.isArray(sessions) ? sessions : [];
                    setRecentSessions(historyItems);
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

    const getNextAiTipIndex = React.useCallback(() => {
        if (typeof window === 'undefined') return 0;

        try {
            const lastRaw = localStorage.getItem(AI_MODE_TIP_LAST_INDEX_STORAGE_KEY);
            const last = lastRaw !== null ? Number(lastRaw) : -1;
            const next = Number.isFinite(last)
                ? (Math.trunc(last) + 1 + AI_MODE_TIPS.length) % AI_MODE_TIPS.length
                : 0;

            localStorage.setItem(AI_MODE_TIP_LAST_INDEX_STORAGE_KEY, String(next));
            return next;
        } catch {
            return 0;
        }
    }, []);

    const showAiModeTipBubble = React.useCallback(() => {
        setAiModeTipIndex(getNextAiTipIndex());
        setShowAiModeTip(true);
        if (aiModeTipTimerRef.current) {
            clearTimeout(aiModeTipTimerRef.current);
        }
        aiModeTipTimerRef.current = setTimeout(() => {
            setShowAiModeTip(false);
        }, 5500);
    }, [getNextAiTipIndex]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const tryShowInitialTip = () => {
            if (hasShownInitialAiTipRef.current) return;
            if (isExpanded) return;
            hasShownInitialAiTipRef.current = true;
            showAiModeTipBubble();
        };

        const timer = window.setTimeout(tryShowInitialTip, 650);
        window.addEventListener('resize', tryShowInitialTip);
        window.addEventListener('orientationchange', tryShowInitialTip);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('resize', tryShowInitialTip);
            window.removeEventListener('orientationchange', tryShowInitialTip);
        };
    }, [isExpanded, showAiModeTipBubble]);

    // Typing effect for placeholder
    useEffect(() => {
        const text = aiModeActive
            ? "Ask anything about homes, neighborhoods, schools"
            : "Enter city, state, neighborhood, or address";
        let i = 0;
        let isDeleting = false;
        let timeoutId: NodeJS.Timeout;
        let mounted = true;

        const tick = () => {
            if (!mounted) return;
            setTypedPlaceholder(text.slice(0, i));

            if (!isDeleting) {
                if (i < text.length) {
                    i++;
                    timeoutId = setTimeout(tick, 60);
                } else {
                    isDeleting = true;
                    timeoutId = setTimeout(tick, 4000);
                }
            } else {
                if (i > 0) {
                    i--;
                    timeoutId = setTimeout(tick, 30);
                } else {
                    isDeleting = false;
                    timeoutId = setTimeout(tick, 1000);
                }
            }
        };

        setTypedPlaceholder('');
        timeoutId = setTimeout(tick, 500);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [aiModeActive]);

    // Loading state is now handled by <ThinkingPanel /> below

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
            const res = await fetch(`/api/forecast/model-cache?horizon=${horizon}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch forecast (${res.status})`);
            }
            const data = await res.json();
            if (Array.isArray(data?.points)) {
                return data.points.map((point: any) => ({
                    date: String(point?.date ?? ''),
                    rate: Number(point?.rate ?? 0),
                }));
            }
            return [];
        } catch (e: any) {
            console.error(e);
            setForecastError(e.message);
            return [];
        } finally {
            setForecastLoading(false);
        }
    };

    const mapBackendChartDataToForecastPoints = (chartData: any, horizon: 6 | 12 | 24 = 24): ForecastPoint[] => {
        try {
            const key = `${horizon}m`;
            const series = chartData?.forecast?.[key];
            const dates = Array.isArray(series?.dates) ? series.dates : [];
            const rates = Array.isArray(series?.rates) ? series.rates : [];
            const len = Math.min(dates.length, rates.length);
            if (!len) return [];
            const points: ForecastPoint[] = [];
            for (let i = 0; i < len; i++) {
                const date = String(dates[i] ?? '').trim();
                const rateNum = Number(rates[i] ?? 0);
                if (!date || !Number.isFinite(rateNum)) continue;
                points.push({ date, rate: rateNum });
            }
            return points;
        } catch {
            return [];
        }
    };

    // New state for property selection & expansion
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | number | null>(null);
    const [expandedPropertyId, setExpandedPropertyId] = useState<string | number | null>(null);

    const openHiddenFileInput = (type: 'image' | 'pdf', options?: { capture?: 'environment' | 'user' }) => {
        if (!fileInputRef.current) return;
        fileInputRef.current.value = '';
        fileInputRef.current.accept = type === 'image' ? 'image/*' : 'application/pdf';

        if (options?.capture && type === 'image') {
            fileInputRef.current.setAttribute('capture', options.capture);
        } else {
            fileInputRef.current.removeAttribute('capture');
        }

        fileInputRef.current.click();
    };

    const requestLocationAccess = async () => {
        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

        await new Promise<void>((resolve) => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                resolve();
            };

            navigator.geolocation.getCurrentPosition(
                () => finish(),
                () => finish(),
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
            );

            // Guard in case callback does not return.
            setTimeout(() => finish(), 11000);
        });
    };

    const handleAttachmentClick = (type: 'image' | 'pdf') => {
        openHiddenFileInput(type);
        setShowAttachMenu(false);
    };

    const handleMobileCameraClick = () => {
        // iOS Safari blocks file input dialogs when click is triggered after await.
        // Keep input.click() in the direct tap call stack.
        requestLocationAccess().catch(() => {
            // Location denied/unavailable should not block camera capture.
        });
        openHiddenFileInput('image', { capture: 'environment' });
        setShowAttachMenu(false);
    };



    // --- State for Real Data ---
    const [properties, setProperties] = useState<any[]>([]); // Accumulates all properties
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Stores conversation
    const [completedAnswerAnimations, setCompletedAnswerAnimations] = useState<Record<string, boolean>>({});
    const [snapResultsShown, setSnapResultsShown] = useState(0);
    const [snapCachedProperties, setSnapCachedProperties] = useState<any[]>([]);
    const [snapResultsPage, setSnapResultsPage] = useState(0);
    const [snapLastUploadFile, setSnapLastUploadFile] = useState<File | null>(null);
    const [snapLastManualLocation, setSnapLastManualLocation] = useState<{ latitude?: string; longitude?: string; query?: string } | null>(null);
    const [snapIsFetchingMore, setSnapIsFetchingMore] = useState(false);
    const [awaitingSnapConfirmation, setAwaitingSnapConfirmation] = useState(false);
    const [snapConfirmationMessageId, setSnapConfirmationMessageId] = useState<string | null>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const autoScrollEnabledRef = useRef(true);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isSearchingRef = useRef(false);
    const lastIntentRef = useRef<string | null>(null);
    const addressSuggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const locationSuggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const locationSuggestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const locationSuggestRequestIdRef = useRef(0);
    const [expandedSchoolLists, setExpandedSchoolLists] = useState<Record<string, boolean>>({});
    const [nearbySchoolsById, setNearbySchoolsById] = useState<Record<string, { status: 'idle' | 'loading' | 'ready' | 'error'; schools: any[]; error?: string; schoolType?: string; fallbackUsed?: boolean }>>({});

    const scrollChatToBottom = React.useCallback((behavior: ScrollBehavior = 'auto', options?: { force?: boolean }) => {
        const container = chatBottomRef.current?.parentElement;
        if (!container) return;
        if (!options?.force && !autoScrollEnabledRef.current) return;
        container.scrollTo({ top: container.scrollHeight, behavior });
    }, []);

    useEffect(() => {
        if (!isExpanded) return;
        let cancelled = false;
        const attachScrollListener = () => {
            if (cancelled) return;
            const container = chatBottomRef.current?.parentElement;
            if (!container) {
                window.setTimeout(attachScrollListener, 80);
                return;
            }

            let lastScrollTop = container.scrollTop;
            const disableAutoScroll = () => {
                autoScrollEnabledRef.current = false;
            };
            const updateAutoScroll = () => {
                const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
                const delta = container.scrollTop - lastScrollTop;
                if (delta < 0) {
                    autoScrollEnabledRef.current = false;
                } else if (distance <= 32) {
                    autoScrollEnabledRef.current = true;
                } else {
                    autoScrollEnabledRef.current = false;
                }
                lastScrollTop = container.scrollTop;
            };

            updateAutoScroll();
            container.addEventListener('scroll', updateAutoScroll, { passive: true });
            container.addEventListener('wheel', disableAutoScroll, { passive: true });
            container.addEventListener('touchstart', disableAutoScroll, { passive: true });
            container.addEventListener('touchmove', disableAutoScroll, { passive: true });
            container.addEventListener('pointerdown', disableAutoScroll, { passive: true });
            return () => {
                container.removeEventListener('scroll', updateAutoScroll);
                container.removeEventListener('wheel', disableAutoScroll);
                container.removeEventListener('touchstart', disableAutoScroll);
                container.removeEventListener('touchmove', disableAutoScroll);
                container.removeEventListener('pointerdown', disableAutoScroll);
            };
        };

        const detach = attachScrollListener();
        return () => {
            cancelled = true;
            if (detach) detach();
        };
    }, [isExpanded]);

    const startNewChat = React.useCallback((options?: { focusInput?: boolean }) => {
        setShowAiModeTip(false);
        if (aiModeTipTimerRef.current) {
            clearTimeout(aiModeTipTimerRef.current);
            aiModeTipTimerRef.current = null;
        }
        setIsExpanded(true);
        setSearchTerm('');
        setChatHistory([]);
        setCompletedAnswerAnimations({});
        setSessionId(null);
        setIsSearching(false);
        setCurrentQuery('');
        setThinkingSteps([]);
        setThinkingIntentHint(undefined);
        setLatestThoughtDurationMs(null);
        setIsMenuOpen(false);
        setSelectedPropertyId(null);
        setExpandedPropertyId(null);
        setNearbySchoolsById({});
        if (onSearchStateChange) onSearchStateChange(true, '');

        // Show proactive greeting on fresh chat open
        setProactiveGreetingText(buildProactiveGreeting(user?.firstname, user?.id));
        setProactiveSuggestions(buildProactiveSuggestions());
        setProactiveGreetingComplete(false);
        setShowProactiveGreeting(true);

        if (options?.focusInput) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 120);
        }
    }, [onSearchStateChange, setChatHistory, setExpandedPropertyId, setIsExpanded, setIsMenuOpen, setIsSearching, setNearbySchoolsById, setSearchTerm, setSelectedPropertyId, setSessionId, user?.firstname]);

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
            if (locationSuggestTimeoutRef.current) {
                clearTimeout(locationSuggestTimeoutRef.current);
            }
            if (aiModeTipTimerRef.current) {
                clearTimeout(aiModeTipTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        onSuggestionsOpen?.(anySuggestionsVisible);
    }, [onSuggestionsOpen, anySuggestionsVisible]);

    const updateCarouselEdges = (id: string, el: HTMLElement | null) => {
        if (!el) return;
        const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
        const atStart = el.scrollLeft <= 4;
        const atEnd = el.scrollLeft >= maxScroll - 4;
        setCarouselEdges((prev) => {
            const current = prev[id];
            if (current && current.atStart === atStart && current.atEnd === atEnd) return prev;
            return { ...prev, [id]: { atStart, atEnd } };
        });
    };

    useEffect(() => {
        if (!isExpanded) return;
        const scrollToChat = () => {
            const el = chatLayoutRef.current;
            if (!el) return;
            const scrollContainer = (document.querySelector('main') as HTMLElement | null) || document.scrollingElement || document.documentElement;
            if (!scrollContainer) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            const containerRect = scrollContainer.getBoundingClientRect();
            const rect = el.getBoundingClientRect();
            const padding = 20;
            const availableHeight = containerRect.height - padding * 2;
            const delta = rect.top - containerRect.top - padding;
            const desiredTop = scrollContainer.scrollTop + delta * 0.75;

            if (rect.height <= availableHeight) {
                scrollContainer.scrollTo({
                    top: Math.max(0, desiredTop),
                    behavior: 'smooth',
                });
                return;
            }

            const bottomOverflow = rect.bottom - (containerRect.bottom - padding);
            const topOverflow = rect.top - (containerRect.top + padding);

            if (bottomOverflow > 0) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollTop + bottomOverflow,
                    behavior: 'smooth',
                });
            } else if (topOverflow < 0) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollTop + topOverflow,
                    behavior: 'smooth',
                });
            }
        };

        let attempts = 0;
        const attemptScroll = () => {
            attempts += 1;
            if (chatLayoutRef.current) {
                scrollToChat();
                return;
            }
            if (attempts < 8) {
                window.setTimeout(attemptScroll, 120);
            }
        };

        const t1 = window.setTimeout(attemptScroll, 120);
        const t2 = window.setTimeout(attemptScroll, 320);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [isExpanded]);

    useEffect(() => {
        if (!isExpanded) return;
        let attempts = 0;
        const attemptScrollBottom = () => {
            attempts += 1;
            scrollChatToBottom('auto', { force: true });
            if (attempts < 4) {
                window.setTimeout(attemptScrollBottom, 140);
            }
        };
        const t1 = window.setTimeout(attemptScrollBottom, 80);
        return () => {
            window.clearTimeout(t1);
        };
    }, [isExpanded, scrollChatToBottom]);

    useEffect(() => {
        if (!showAttachMenu) return;

        const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!attachMenuRef.current || !target) return;
            if (!attachMenuRef.current.contains(target)) {
                setShowAttachMenu(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [showAttachMenu]);

    useEffect(() => {
        if (!showAttachMenu) {
            setShowAttachTooltip(false);
            return;
        }
        setShowAttachTooltip(true);
        const timer = window.setTimeout(() => {
            setShowAttachTooltip(false);
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [showAttachMenu]);

    useEffect(() => {
        setAiModeActive(!mlsBypassMode);
    }, [mlsBypassMode]);

    useEffect(() => {
        if (isExpanded) {
            setShowAiModeTip(false);
        }
    }, [isExpanded]);

    useEffect(() => {
        if (!aiModeActive) {
            setShowAiModeTip(false);
        }
    }, [aiModeActive]);

    useEffect(() => {
        setMlsBypassModeEnabled(mlsBypassMode);
        if (mlsBypassMode) {
            setSessionId(null);
            setRecentSessions([]);
        }
    }, [mlsBypassMode]);

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

    const renderPendingImageChip = (variant: 'collapsed' | 'expanded' | 'desktop') => {
        if (!pendingImage && !pendingImagePreview) return null;

        if (variant === 'expanded') {
            return (
                <div className="flex items-start">
                    <div className="relative h-[72px] w-[108px] sm:h-20 sm:w-28 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                        {pendingImagePreview ? (
                            <img src={pendingImagePreview} alt="Selected upload" className="object-cover w-full h-full" />
                        ) : (
                            <ImageIcon className="w-5 h-5 text-gray-500 absolute inset-0 m-auto" />
                        )}
                        <button
                            type="button"
                            onClick={resetPendingImageSelection}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black transition-colors"
                            aria-label="Remove selected image"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        {pendingImageStatus === 'processing' && (
                            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-gray-700">Preparing...</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (variant === 'desktop') {
            return (
                <div className="flex items-start">
                    <div className="relative h-12 w-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-[0_6px_16px_rgba(15,23,42,0.12)]">
                        {pendingImagePreview ? (
                            <img src={pendingImagePreview} alt="Selected upload" className="object-cover w-full h-full" />
                        ) : (
                            <ImageIcon className="w-4 h-4 text-gray-500 absolute inset-0 m-auto" />
                        )}
                        <button
                            type="button"
                            onClick={resetPendingImageSelection}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black transition-colors"
                            aria-label="Remove selected image"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        {pendingImageStatus === 'processing' && (
                            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-gray-700">Preparing...</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const statusText = pendingImageStatus === 'processing' ? 'Preparing image...' : 'Add location and send';

        return (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-3xl shadow-[0_6px_16px_rgba(15,23,42,0.08)] pl-2.5 pr-2 py-1.5 max-w-[180px] sm:max-w-[210px]">
                <div className="relative w-9 h-9 rounded-2xl overflow-hidden border border-gray-100 bg-gray-100">
                    {pendingImagePreview ? (
                        <img src={pendingImagePreview} alt="Selected upload" className="object-cover w-full h-full" />
                    ) : (
                        <ImageIcon className="w-4 h-4 text-gray-500 absolute inset-0 m-auto" />
                    )}
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-xs font-semibold text-gray-900 truncate">
                        {pendingImage?.name || 'Attached'}
                    </span>
                    <span className="text-[11px] text-gray-400">{statusText}</span>
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

    useEffect(() => {
        const sessionForThinking = activeSessionId;
        if (!isSearching || !sessionForThinking) return;

        let cancelled = false;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const pollThinking = async () => {
            try {
                const progress: ThinkingProgressResponse = await fetchThinkingProgress(sessionForThinking);
                if (cancelled) return;
                if (Array.isArray(progress?.steps) && progress.steps.length > 0) {
                    setThinkingSteps(progress?.steps as any);
                }
                if (progress?.is_done && intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } catch {
                // Best-effort polling; silently ignore transient failures.
            }
        };

        pollThinking();
        intervalId = setInterval(pollThinking, 500);
        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSearching, activeSessionId]);

    // Auto-scroll to bottom when conversation updates.
    useEffect(() => {
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (!lastMsg) return;

        if (lastMsg.role === 'user') {
            scrollChatToBottom('smooth');
            return;
        }

        if (lastMsg.role === 'assistant' || isSearching) {
            scrollChatToBottom('auto');
        }
    }, [chatHistory, isSearching, scrollChatToBottom]);

    // Keep the viewport pinned while thinking steps stream in.
    useEffect(() => {
        if (!isSearching || thinkingSteps.length === 0) return;
        scrollChatToBottom('auto');
    }, [thinkingSteps, isSearching, scrollChatToBottom]);

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

    const persistAiQueryLogs = useCallback((nextLogs: AiQueryLogEntry[]) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(AI_QUERY_LOG_STORAGE_KEY, JSON.stringify(nextLogs));
        } catch {
            // Ignore storage quota/write errors.
        }
    }, []);

    const trackAiQueryForSuggestions = useCallback((rawQuery: string) => {
        const trimmed = normalizeLocationInput(rawQuery);
        if (trimmed.length < 4) return;
        if (classifySuggestionIntent(trimmed) === 'mls') return;

        setAiQueryLogs((prev) => {
            const normalized = normalizeSuggestionKey(trimmed);
            const now = Date.now();
            const existingIndex = prev.findIndex((entry) => normalizeSuggestionKey(entry.query) === normalized);
            const next = [...prev];

            if (existingIndex >= 0) {
                const existing = next[existingIndex];
                next[existingIndex] = {
                    query: trimmed,
                    count: Math.min(existing.count + 1, 9999),
                    lastUsedAt: now,
                };
            } else {
                next.push({ query: trimmed, count: 1, lastUsedAt: now });
            }

            const sorted = next
                .sort((a, b) => {
                    if (b.count !== a.count) return b.count - a.count;
                    return b.lastUsedAt - a.lastUsedAt;
                })
                .slice(0, MAX_AI_QUERY_LOGS);

            persistAiQueryLogs(sorted);
            return sorted;
        });
    }, [persistAiQueryLogs]);

    const handleSearchSubmit = async (queryToSearch: string) => {
        if (!queryToSearch.trim() || isSearching || isSearchingRef.current) return;

        // Conversational messages (hi, hello, thanks…) must never trigger MLS routing — "hi"
        // matches the Hawaii state abbreviation "HI" which fools hasStateToken().
        const isConversationalQuery = /^(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening)|thanks?|thank\s+you|ok|okay|sure|awesome|great|cool)$/i.test(queryToSearch.trim());

        // Auto-route: MLS-style queries go to browse results, natural-language stays in AI chat.
        let allowMlsRoute = !pendingLocationImage && !isConversationalQuery;
        if (allowMlsRoute) {
            const trimmedQuery = normalizeLocationInput(queryToSearch);
            if (!hasLikelyMlsIdentifier(trimmedQuery)) {
                const classification = classifyLocationQuery(trimmedQuery);
                if (classification === 'invalid') {
                    allowMlsRoute = false;
                } else if (classification === 'borderline') {
                    const geocodedValid = await geocodeValidateLocation(trimmedQuery);
                    if (!geocodedValid) {
                        allowMlsRoute = false;
                    }
                }
            }

            if (allowMlsRoute) {
                const destination = `/buy/browse?q=${encodeURIComponent(queryToSearch.trim())}`;
                if (typeof window !== 'undefined') {
                    window.location.assign(destination);
                }
                return;
            }
        }
        setMlsBypassMode(false);
        setMlsBypassModeEnabled(false);
        trackAiQueryForSuggestions(queryToSearch);
        setShowProactiveGreeting(false); // Hide proactive greeting once user sends first message
        setIsExpanded(true); // Immediate UI response
        if (onSearchStateChange) {
            onSearchStateChange(true, queryToSearch);
        }

        isSearchingRef.current = true;
        console.log('[Snap-Search] handleSearchSubmit called. pendingLocationImage:', pendingLocationImage ? pendingLocationImage.name : 'null');

        let responseData: any;

        // 1. Add User Message
        const userMsgId = Date.now().toString();
        const newMsg: ChatMessage = { id: userMsgId, role: 'user', content: queryToSearch };
        setChatHistory(prev => [...prev, newMsg]);
        scrollChatToBottom('smooth', { force: true });
        requestAnimationFrame(() => {
            scrollChatToBottom('smooth', { force: true });
        });
        setTimeout(() => {
            scrollChatToBottom('auto', { force: true });
        }, 120);

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

        const activeSessionId =
            sessionId ||
            (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        if (!sessionId) {
            setSessionId(activeSessionId);
        }

        // 2. Set Loading & Reset Input
        setCurrentQuery(queryToSearch);
        setThinkingSteps([]);
        setThinkingIntentHint(undefined);
        setLatestThoughtDurationMs(null);
        requestStartedAtRef.current = Date.now();
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

                responseData = await response.json();
                setPendingLocationImage(null);

                const mappedProps = mapSnapProperties(responseData.properties || []);

                const totalMatches = responseData.total_matches || mappedProps.length;
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

            // All messages route through LangGraph via /api/search.
            // Nova Planner handles routing internally: property search, Q&A, SnapInterest,
            // rent-vs-buy, school lookup, etc. The response contract is identical regardless
            // of intent — properties=[] for text-only answers, properties=[...] for search results.
            setThinkingIntentHint("search");

            responseData = await searchProperties({
                userid: user?.id || tempUserId || 'anonymous',
                query: queryToSearch,
                session_id: activeSessionId,
                from_browse: false,
                user_name: user?.firstname || undefined,
                user_local_hour: new Date().getHours(),
            }, newController.signal);

            console.log("Backend Response:", responseData);

            if (responseData.session_id) {
                setSessionId(responseData.session_id);
            }
            if (responseData.intent) {
                lastIntentRef.current = responseData.intent;
                setThinkingIntentHint(responseData.intent);
            }
            if (Array.isArray(responseData.thinking_steps) && responseData.thinking_steps.length > 0) {
                setThinkingSteps(responseData.thinking_steps);
            }
            dispatch(incrementSearchCount());

            const rawProperties = responseData.properties || responseData.search_results || [];
            const aiText = responseData.final_response || responseData.answer || responseData.summary || responseData.response;
            const responseMode = responseData?.metadata?.response_mode;
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
                    const fmtPrice = getCanonicalPriceForCard(p);

                    const streetAddr2 = p.address || p.formattedAddress || p.fullAddress || p.street;
                    const addrCity2 = p.city || '';
                    const addrState2 = p.state || p.stateOrProvince || '';
                    const addrZip2 = p.zip || p.zipCode || '';
                    const locationStr2 = [addrCity2, addrState2 && addrZip2 ? `${addrState2} ${addrZip2}` : addrState2].filter(Boolean).join(', ');
                    const address = streetAddr2
                        ? (locationStr2 ? `${streetAddr2}, ${locationStr2}` : streetAddr2)
                        : 'Address Unavailable';

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
                        displayIndex: p.display_index || p.displayIndex || index + 1,
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
                const backendRelatedQuestions =
                    responseData.suggestions ||
                    responseData.suggested_actions ||
                    responseData.recommendations ||
                    responseData.suggested_questions ||
                    responseData.related_questions ||
                    [];

                const schoolKeywords = ['school', 'education', 'university', 'college', 'district', 'elementary', 'high', 'rating'];
                const showSchools = schoolKeywords.some(keyword => queryToSearch.toLowerCase().includes(keyword));

                // Logic: If properties found -> Short text. If text query (no props) -> check for extracted schools.
                let finalContent = "";
                let extractedSchools: any[] = [];
                let extractedAddress: string | undefined = undefined;
                let isForecastMsg = false;
                let forecastPoints: ForecastPoint[] | undefined = undefined;
                const backendForecastPoints = mapBackendChartDataToForecastPoints(responseData?.chart_data, 24);

                if (backendForecastPoints.length > 0) {
                    isForecastMsg = true;
                    forecastPoints = backendForecastPoints;
                }

                // Check for Forecast — only trigger when user explicitly wants a chart/forecast/trend.
                // "what is the interest rate today?" is a text question → NO chart.
                // "show me mortgage rate forecast" / "rate forecast chart" → YES chart.
                const loweredQuery = queryToSearch.toLowerCase();
                const hasExplicitForecastIntent =
                    /\bforecast\b/.test(loweredQuery) ||
                    /\brate\s+(trend|chart|graph|projection|predict)\b/.test(loweredQuery) ||
                    /\b(show|display|visuali[sz]e)\b.{0,20}\brate(s)?\b/.test(loweredQuery);
                const isRateForecastQuery = hasExplicitForecastIntent;
                if (!isForecastMsg && isRateForecastQuery) {
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

                const sanitizedFinal = sanitizeAssistantOutput(finalContent);
                const relatedQuestions = Array.from(
                    new Set([
                        ...(Array.isArray(backendRelatedQuestions) ? backendRelatedQuestions : []),
                        ...sanitizedFinal.extractedSuggestions
                    ])
                );

                const aiMsg: ChatMessage = {
                    id: aiMsgId,
                    role: 'assistant',
                    content: sanitizedFinal.cleanedText || finalContent,
                    query: queryToSearch,
                    query_history_formatted: responseData.metadata?.query_history_formatted,
                    relatedProperties: mappedProps,
                    relatedQuestions: relatedQuestions,
                    clarification: responseData.clarification || "",
                    showSchools: showSchools,
                    relatedSchools: extractedSchools,
                    schoolAddress: extractedAddress,
                    isForecast: isForecastMsg,
                    forecastData: forecastPoints,
                    map: responseData.map,
                    intent: responseData.intent
                };
                setChatHistory(prev => [...prev, aiMsg]);

                // Persist last search context for proactive greeting on next session
                if (mappedProps.length > 0) {
                    try {
                        const p = mappedProps[0];
                        const city = p.city || '';
                        const state = p.state || '';
                        const beds = p.beds ? `${p.beds}-bed` : '';
                        const location = [city, state].filter(Boolean).join(', ');
                        const summary = [location, beds].filter(Boolean).join(' · ');
                        if (summary && user?.id) {
                            const key = `${SNAPHOMZ_LAST_SEARCH_KEY}_${user.id}`;
                            localStorage.setItem(key, JSON.stringify({ summary, ts: Date.now() }));
                        }
                    } catch (_) { /* localStorage unavailable */ }
                }

            } else {
                // Empty results
                const aiMsgId = (Date.now() + 1).toString();
                const backendRelatedQuestions =
                    responseData.suggestions ||
                    responseData.suggested_actions ||
                    responseData.recommendations ||
                    responseData.suggested_questions ||
                    responseData.related_questions ||
                    [];
                const sanitizedEmpty = sanitizeAssistantOutput(aiText || "I couldn't find any properties matching that search right now.");
                const relatedQuestions = Array.from(
                    new Set([
                        ...(Array.isArray(backendRelatedQuestions) ? backendRelatedQuestions : []),
                        ...sanitizedEmpty.extractedSuggestions
                    ])
                );

                const aiMsg: ChatMessage = {
                    id: aiMsgId,
                    role: 'assistant',
                    content: sanitizedEmpty.cleanedText || aiText || "I couldn't find any properties matching that search right now.",
                    relatedProperties: [],
                    relatedQuestions: relatedQuestions,
                    clarification: responseData.clarification || "",
                    intent: responseData.intent
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
            if (requestStartedAtRef.current) {
                setLatestThoughtDurationMs(Math.max(0, Date.now() - requestStartedAtRef.current));
                requestStartedAtRef.current = null;
            }
            setIsSearching(false);
            isSearchingRef.current = false;
        }
    };

    const handleStopSearch = React.useCallback(async () => {
        if (!isSearching) return;
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (sessionId) {
                await cancelActiveTask(sessionId);
            }
            setChatHistory(prev => [
                ...prev,
                {
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    role: 'assistant',
                    content: '',
                    stoppedThinking: true,
                },
            ]);
        } finally {
            requestStartedAtRef.current = null;
            setLatestThoughtDurationMs(null);
            setIsSearching(false);
            isSearchingRef.current = false;
            setThinkingSteps([]);
            setThinkingIntentHint(undefined);
        }
    }, [isSearching, sessionId]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pendingImage) {
            submitPendingImage();
            return;
        }
        handleSearchSubmit(searchTerm);
    };

    const clearMlsSuggestionState = () => {
        if (addressSuggestDebounceRef.current) {
            clearTimeout(addressSuggestDebounceRef.current);
            addressSuggestDebounceRef.current = null;
        }
        if (locationSuggestDebounceRef.current) {
            clearTimeout(locationSuggestDebounceRef.current);
            locationSuggestDebounceRef.current = null;
        }
        if (locationSuggestTimeoutRef.current) {
            clearTimeout(locationSuggestTimeoutRef.current);
            locationSuggestTimeoutRef.current = null;
        }
        locationSuggestRequestIdRef.current += 1;
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
        setIsLoadingAddressSuggestions(false);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        setIsLoadingLocationSuggestions(false);
    };

    const handleSuggestionClick = (text: string) => {
        setSearchTerm(text);
        handleSearchSubmit(text);
        setShowSuggestions(false);
        clearMlsSuggestionState();
        setShowAiModeTip(false);
        if (aiModeTipTimerRef.current) {
            clearTimeout(aiModeTipTimerRef.current);
            aiModeTipTimerRef.current = null;
        }
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
        if (locationSuggestTimeoutRef.current) {
            clearTimeout(locationSuggestTimeoutRef.current);
            locationSuggestTimeoutRef.current = null;
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
            setIsLoadingAddressSuggestions(false);
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            setIsLoadingLocationSuggestions(false);
            locationSuggestRequestIdRef.current += 1;
            return;
        }

        if (isAddressLike) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            setIsLoadingLocationSuggestions(false);
            locationSuggestRequestIdRef.current += 1;

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
            const requestId = ++locationSuggestRequestIdRef.current;
            if (typeof window === 'undefined' || !window.google?.maps?.places) {
                setLocationSuggestions([]);
                setShowLocationSuggestions(false);
                setIsLoadingLocationSuggestions(false);
                return;
            }

            try {
                setIsLoadingLocationSuggestions(true);
                if (locationSuggestTimeoutRef.current) {
                    clearTimeout(locationSuggestTimeoutRef.current);
                }
                locationSuggestTimeoutRef.current = setTimeout(() => {
                    if (locationSuggestRequestIdRef.current !== requestId) return;
                    setIsLoadingLocationSuggestions(false);
                }, 3500);
                const autocompleteService = new window.google.maps.places.AutocompleteService();
                autocompleteService.getPlacePredictions(
                    {
                        input: trimmed,
                        componentRestrictions: { country: 'us' },
                    },
                    (predictions: any, status: any) => {
                        if (locationSuggestRequestIdRef.current !== requestId) return;
                        if (locationSuggestTimeoutRef.current) {
                            clearTimeout(locationSuggestTimeoutRef.current);
                            locationSuggestTimeoutRef.current = null;
                        }
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
                if (locationSuggestTimeoutRef.current) {
                    clearTimeout(locationSuggestTimeoutRef.current);
                    locationSuggestTimeoutRef.current = null;
                }
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
        const queryParts = [
            suggestion.address,
            suggestion.city,
            suggestion.state,
            suggestion.zip_code,
        ]
            .map((value) => String(value || '').trim())
            .filter(Boolean);
        const suggestionQuery = queryParts.join(', ');
        setSearchTerm(suggestionQuery || suggestion.address || '');

        const mainSiteBase = getMainSiteBaseUrl();
        window.location.href = `${mainSiteBase}/buy/browse?q=${encodeURIComponent(
            suggestionQuery || suggestion.address || '',
        )}`;
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
        if (onSearchStateChange) {
            onSearchStateChange(true, caption || '');
        }
        setIsSearching(true);
        setSnapSearchInProgress(true);

        await performSnapImageSearch(file, caption || undefined);
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
        if (onSearchStateChange) {
            onSearchStateChange(true, '');
        }
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

    const buildViewHistoryPayload = useCallback((property: any) => {
        const listingId = resolveListingId(property);
        const propertyId = resolvePropertyId(property);
        const propertyAddress =
            property?.propertyAddress ||
            property?.address?.unparsedAddress ||
            property?.address ||
            property?.formattedAddress ||
            property?.fullAddress ||
            property?.streetAddress ||
            property?.street ||
            '';
        const city = property?.city || property?.address?.city || '';
        const state =
            property?.state ||
            property?.province ||
            property?.stateOrProvince ||
            property?.address?.stateOrProvince ||
            property?.address?.state ||
            '';
        const priceValue =
            property?.price ??
            property?.listPrice ??
            property?.listPriceLow ??
            property?.listPriceHigh ??
            property?.listingPrice;
        const propertyType =
            property?.propertyType ||
            property?.homeType ||
            property?.type ||
            property?.property?.propertyType ||
            property?.propertyTypeName;
        const propertyImage =
            property?.image ||
            property?.primaryListingImageUrl ||
            property?.primaryImage ||
            property?.media?.primaryListingImageUrl ||
            property?.media?.photosList?.[0]?.url ||
            property?.photos?.[0]?.url ||
            property?.photos?.[0] ||
            property?.images?.[0] ||
            null;

        return {
            listingId,
            propertyId,
            propertyAddress,
            city,
            state,
            price: priceValue !== undefined && priceValue !== null ? String(priceValue) : undefined,
            propertyType,
            propertyImage,
            bedroomsTotal: parseNumericValue(property?.beds ?? property?.bedrooms ?? property?.bedroomTotal ?? property?.property?.bedroomsTotal),
            bathroomsTotal: parseNumericValue(property?.baths ?? property?.bathrooms ?? property?.bathroomTotal ?? property?.property?.bathroomsTotal),
            livingArea: parseNumericValue(property?.sqft ?? property?.livingArea ?? property?.property?.livingArea),
        };
    }, []);

    const recordViewHistoryOnce = useCallback((property: any) => {
        if (!user?.id) return;
        if (!property) return;
        const listingId = resolveListingId(property);
        const propertyId = resolvePropertyId(property);
        const dedupeKey = listingId || propertyId;
        if (!dedupeKey) return;
        if (viewHistoryDedupeRef.current.has(dedupeKey)) return;
        viewHistoryDedupeRef.current.add(dedupeKey);
        recordPropertyView.mutate(buildViewHistoryPayload(property));
    }, [recordPropertyView, buildViewHistoryPayload, user?.id]);

    // Strict Interaction Handlers
    const handlePropertyClick = (id: string | number) => {
        // Select the card AND immediately expand details (no need to click "Show More")
        if (id === selectedPropertyId) {
            // Clicking the already-selected tile: deselect + collapse
            setSelectedPropertyId(null);
            setExpandedPropertyId(null);
        } else {
            setSelectedPropertyId(id);
            // Find the property object from chat history to fetch schools
            let foundProperty: any = null;
            for (const msg of chatHistory) {
                if (msg.relatedProperties) {
                    foundProperty = msg.relatedProperties.find((p: any) => p.id === id);
                    if (foundProperty) break;
                }
            }
            setExpandedPropertyId(id);
            if (foundProperty) {
                fetchNearbySchools(foundProperty);
                recordViewHistoryOnce(foundProperty);
            }
        }
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
            recordViewHistoryOnce(property);
        }
    };

    const latestVisibleAssistantMessageId = chatHistory
        .slice()
        .reverse()
        .find((message) =>
            message.role === 'assistant' &&
            (
                (typeof message.content === 'string' && message.content.trim().length > 0) ||
                (Array.isArray(message.relatedProperties) && message.relatedProperties.length > 0) ||
                (Array.isArray(message.relatedSchools) && message.relatedSchools.length > 0) ||
                Boolean(message.isForecast)
            )
        )?.id;
    const latestAssistantTextMessageId = chatHistory
        .slice()
        .reverse()
        .find((message) => message.role === 'assistant' && typeof message.content === 'string' && message.content.trim().length > 0)?.id;
    const hasCompletedThinkingForCurrentTurn = thinkingSteps.length > 0 || latestThoughtDurationMs !== null;
    const shouldShowThinkingForLatestAssistant =
        !isSearching &&
        Boolean(latestVisibleAssistantMessageId) &&
        hasCompletedThinkingForCurrentTurn;
    const showStandaloneThinkingPanel =
        isSearching ||
        (hasCompletedThinkingForCurrentTurn && !latestVisibleAssistantMessageId);

    const isSellSearch = searchType === 'sell';
    const startNewChatSession = () => {
        setSearchTerm('');
        setChatHistory([]);
        setCompletedAnswerAnimations({});
        setSessionId(null);
        setIsSearching(false);
        setSelectedPropertyId(null);
        setExpandedPropertyId(null);
        setIsMenuOpen(false);
        if (onSearchStateChange) onSearchStateChange(true, '');
        // Show proactive greeting on new session
        setProactiveGreetingText(buildProactiveGreeting(user?.firstname, user?.id));
        setProactiveSuggestions(buildProactiveSuggestions());
        setProactiveGreetingComplete(false);
        setShowProactiveGreeting(true);

        setTimeout(() => {
            searchContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
        }, 100);
    };
    const closeExpandedChat = () => {
        setIsExpanded(false);
        setShowProactiveGreeting(false);
        resetPendingImageSelection();
        setSearchTerm('');
        setShowSuggestions(false);
        setShowAddressSuggestions(false);
        setShowLocationSuggestions(false);
        setIsMenuOpen(false);
        if (onSearchStateChange) onSearchStateChange(false, '');
    };
    const handleExpandedChatClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isMenuOpen) return;
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('[data-new-chat-menu]') || target.closest('[data-new-chat-button]')) return;
        setIsMenuOpen(false);
    };
    const renderNewChatControl = (containerClassName: string, menuPlacementClassName: string, menuSizeClassName: string, idSuffix: string) => (
        <div className={containerClassName}>
            <button
                data-new-chat-button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-black text-white pl-3 pr-3 py-2 rounded-full flex items-center gap-2.5 shadow-md hover:bg-gray-800 transition-colors group active:scale-95 duration-200 select-none"
            >
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                    <path d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z" fill="black" stroke={`url(#askAiGradient-${idSuffix})`} strokeWidth="2" />
                    <mask id={`askAiMask1-${idSuffix}`} fill="white">
                        <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
                    </mask>
                    <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" fill="white" stroke="white" strokeWidth="4" mask={`url(#askAiMask1-${idSuffix})`} />
                    <mask id={`askAiMask2-${idSuffix}`} fill="white">
                        <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
                    </mask>
                    <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" fill="white" stroke="white" strokeWidth="4" mask={`url(#askAiMask2-${idSuffix})`} />
                    <defs>
                        <linearGradient id={`askAiGradient-${idSuffix}`} x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#E8804C" />
                            <stop offset="0.5" stopColor="#E84C85" />
                            <stop offset="0.75" stopColor="#A64EBA" />
                            <stop offset="1" stopColor="#654FEF" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="font-semibold text-[14px] tracking-wide">New Chat</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            data-new-chat-menu
                            className={`absolute left-0 ${menuPlacementClassName} ${menuSizeClassName} bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black/5 max-h-80 flex flex-col`}
                        >
                            <div className="flex flex-col flex-1 overflow-hidden p-2 space-y-1">
                                <button
                                    onClick={startNewChatSession}
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
                                                                        const fmtPrice = getCanonicalPriceForCard(p);
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
                                                                            displayIndex: p.display_index || p.displayIndex || index + 1,
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
                                                            setCompletedAnswerAnimations(
                                                                recovered.reduce<Record<string, boolean>>((acc, message) => {
                                                                    if (message.role === 'assistant' && typeof message.content === 'string' && message.content.trim()) {
                                                                        acc[message.id] = true;
                                                                    }
                                                                    return acc;
                                                                }, {})
                                                            );
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

                                <div className="border-t border-gray-100 mt-1 p-1 flex-none">
                                    <button
                                        onClick={async () => {
                                            if (isClearingHistory) return;
                                            setIsClearingHistory(true);
                                            setRecentSessions([]);
                                            setSearchTerm('');
                                            setChatHistory([]);
                                            setCompletedAnswerAnimations({});
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
    );

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
                .ai-mode-shell {
                    position: relative;
                    border-radius: 999px;
                    border: 1px solid #f2cfb0;
                    background: linear-gradient(180deg, #fffaf4 0%, #fff3e7 100%);
                    box-shadow: 0 6px 14px rgba(240, 118, 57, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.85);
                    overflow: hidden;
                    isolation: isolate;
                }
                .ai-mode-shell::before {
                    content: '';
                    position: absolute;
                    inset: -30%;
                    border-radius: inherit;
                    background: conic-gradient(
                        from 0deg,
                        transparent 0deg 286deg,
                        #ffd5af 302deg,
                        #f8a86b 324deg,
                        #f07639 344deg,
                        #ffd9b7 360deg
                    );
                    animation: ai-mode-snake-orbit 1.8s linear infinite;
                    pointer-events: none;
                    z-index: 0;
                }
                .ai-mode-shell::after {
                    content: '';
                    position: absolute;
                    inset: 1.2px;
                    border-radius: inherit;
                    background: linear-gradient(180deg, #fffaf5 0%, #fff3e8 100%);
                    z-index: 1;
                    pointer-events: none;
                }
                @keyframes ai-mode-snake-orbit {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                @media (max-width: 639px) {
                    .mobile-no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .mobile-no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .ai-mode-shell::before {
                        animation: none !important;
                    }
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
                className={`bg-white shadow-xl shadow-black/5 mx-auto bg-clip-padding relative overflow-visible w-full ${respectParentWidth ? 'max-w-none' : (isExpanded ? 'max-w-[1150px]' : (isSellSearch ? 'w-[92vw] max-w-[500px] sm:max-w-[560px] md:w-[600px] md:max-w-none lg:w-[660px] xl:w-[700px]' : 'max-w-[460px] lg:max-w-[480px] xl:max-w-[820px] min-[1280px]:max-[1440px]:max-w-[640px]'))
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
                                <div className="flex-1 min-w-0 flex min-h-[44px] items-center rounded-[22px] border border-[#ECECEC] bg-white px-2 py-1 max-[380px]:px-1.5 md:border-0 md:min-h-0 md:rounded-none md:bg-transparent md:p-0">
                                    {/* Left Ask AI Icon */}
                                    <div className="pl-1 max-[380px]:pl-0.5 md:pl-2 flex-shrink-0">
                                        <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 max-[380px]:h-[22px] max-[380px]:w-[22px] md:h-6 md:w-6">
                                            <path d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z" fill="black" stroke="url(#askAiGradient)" strokeWidth="2" />
                                            <mask id="askAiMask1" fill="white">
                                                <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
                                            </mask>
                                            <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" fill="white" stroke="white" strokeWidth="4" mask="url(#askAiMask1)" />
                                            <mask id="askAiMask2" fill="white">
                                                <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
                                            </mask>
                                            <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" fill="white" stroke="white" strokeWidth="4" mask="url(#askAiMask2)" />
                                            <defs>
                                                <linearGradient id="askAiGradient" x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#E8804C" />
                                                    <stop offset="0.5" stopColor="#E84C85" />
                                                    <stop offset="0.75" stopColor="#A64EBA" />
                                                    <stop offset="1" stopColor="#654FEF" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    {/* Input Field */}
                                    <div className="flex-1 min-w-0 flex items-center gap-3 max-[380px]:gap-1.5">
                                        {renderPendingImageChip('collapsed')}
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSearchTerm(val);
                                                setShowSuggestions(true);
                                                setShowAiModeTip(false);
                                                if (aiModeTipTimerRef.current) {
                                                    clearTimeout(aiModeTipTimerRef.current);
                                                    aiModeTipTimerRef.current = null;
                                                }
                                                const typedIntent = classifySuggestionIntent(val);
                                                if (!val.trim() || typedIntent === 'nl') {
                                                    clearMlsSuggestionState();
                                                } else {
                                                    fetchAddressSuggestions(val);
                                                }
                                            }}
                                            onFocus={() => {
                                                // Collapsed search box clicked — open chat with proactive greeting
                                                setIsExpanded(true);
                                                setProactiveGreetingText(buildProactiveGreeting(user?.firstname, user?.id));
                                                setProactiveSuggestions(buildProactiveSuggestions());
                                                setProactiveGreetingComplete(false);
                                                setShowProactiveGreeting(true);
                                                if (onSearchStateChange) onSearchStateChange(true, '');
                                                onSuggestionsOpen?.(true);
                                                setShowAiModeTip(false);
                                                if (aiModeTipTimerRef.current) {
                                                    clearTimeout(aiModeTipTimerRef.current);
                                                    aiModeTipTimerRef.current = null;
                                                }
                                            }}
                                            onBlur={() => setTimeout(() => {
                                                setShowSuggestions(false);
                                                setShowAddressSuggestions(false);
                                                setShowLocationSuggestions(false);
                                                setIsLoadingAddressSuggestions(false);
                                                setIsLoadingLocationSuggestions(false);
                                                onSuggestionsOpen?.(false);
                                            }, 200)}
                                            placeholder={placeholderText || typedPlaceholder}
                                            className="flex-1 min-w-0 bg-transparent outline-none px-3 py-1.5 text-sm font-medium text-gray-700 placeholder-gray-400 max-[380px]:px-2 max-[380px]:text-[13px] md:px-4 md:text-sm"
                                        />
                                    </div>

                                    <div className="relative flex-shrink-0 md:hidden">
                                        <button
                                            type="button"
                                            onClick={handleMobileCameraClick}
                                            title={CAMERA_TIP_TEXT}
                                            aria-label={CAMERA_TIP_TEXT}
                                            className="flex h-10 w-10 items-center justify-center text-[#1E1E1E] transition-colors hover:text-black max-[380px]:h-8 max-[380px]:w-8"
                                        >
                                            <Camera className="h-[18px] w-[18px] max-[380px]:h-4 max-[380px]:w-4" />
                                        </button>
                                        <AnimatePresence>
                                            {showAiModeTip && !isExpanded && showCameraTipBubble && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute bottom-full right-0 z-[75] mb-3 w-[220px] rounded-xl border border-[#f2cfb0] bg-white px-3 py-2 shadow-xl max-[380px]:w-[190px]"
                                                >
                                                    <p className="text-[11px] font-semibold leading-relaxed text-[#5A2B13]">
                                                        {CAMERA_TIP_TEXT}
                                                    </p>
                                                    <span className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 border-r border-b border-[#f2cfb0] bg-white" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="hidden md:flex items-center gap-2 flex-shrink-0 pr-1">
                                        <div className="relative" ref={attachMenuRef}>
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
                                                        className="absolute bottom-full right-0 mb-2 w-32 overflow-visible z-[70]"
                                                    >
                                                        <div className="rounded-xl bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 ring-1 ring-black/5 overflow-visible">
                                                            <div className="flex flex-col p-1.5 gap-1">
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => handleAttachmentClick('image')}
                                                                        type="button"
                                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left w-full"
                                                                    >
                                                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                                                        <span>Image</span>
                                                                    </button>
                                                                    <AnimatePresence>
                                                                        {showAttachTooltip && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                                                transition={{ duration: 0.2 }}
                                                                                className="absolute left-full top-1/2 ml-3 mt-[-20px] w-[170px] -translate-y-[72%] rounded-xl border border-[#f2cfb0] bg-white px-3 py-2 shadow-xl z-[90]"
                                                                            >
                                                                                <p className="text-[11px] font-semibold leading-relaxed text-[#5A2B13]">
                                                                                    Search homes with a photo
                                                                                </p>
                                                                                <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-l border-b border-[#f2cfb0] bg-white" />
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAttachmentClick('pdf')}
                                                                    type="button"
                                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                                                                >
                                                                    <FileText className="w-4 h-4 text-red-500" />
                                                                    <span>PDF</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        {/* Desktop Begin Journey Button */}
                                        <Button
                                            type='submit'
                                            disabled={!!pendingImage && pendingImageStatus !== 'ready'}
                                            className="hidden md:flex bg-[#F58634] hover:bg-[#E07224] text-white rounded-xl px-6 py-2.5 font-semibold text-sm md:text-[15px] items-center transition-all shadow-md hover:shadow-lg h-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#F58634]"
                                        >
                                            Begin Journey
                                        </Button>
                                    </div>
                                </div>

                            </motion.form>

                            {/* Integrated Suggestions Dropdown */}
                            <AnimatePresence>
                                {suggestionsVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full border-t border-gray-100/50"
                                    >
                                        <div className="p-4 pt-4 text-left">
                                            <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider pl-2">
                                                {initialSuggestionsMode ? 'Try Asking' : 'AI Suggestions'}
                                            </p>
                                            <div className="space-y-1">
                                                {displayedAiSuggestions.map((suggestion) => (
                                                    <div
                                                        key={suggestion.id}
                                                        onMouseDown={() => handleSuggestionClick(suggestion.text)}
                                                        className="flex items-center gap-3 p-3 hover:bg-orange-50/50 rounded-xl cursor-pointer group transition-all"
                                                    >
                                                        <SearchIcon
                                                            className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-[#F58634] transition-colors"
                                                            strokeWidth={2.25}
                                                            absoluteStrokeWidth
                                                        />
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
                            ref={chatLayoutRef}
                            key="chat-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            onClickCapture={handleExpandedChatClickCapture}
                            className="flex flex-col gap-0 w-full h-[560px] sm:h-[580px] md:h-[600px] lg:h-[600px] overflow-hidden"
                        >
                            <div className="flex items-center w-full px-1 relative z-50">
                                {renderNewChatControl('relative sm:hidden flex-shrink-0', 'top-full mt-3', 'w-72 max-w-[82vw]', 'mobile')}

                                {/* Right: Close */}
                                <button
                                    onClick={closeExpandedChat}
                                    className="p-1.5 -mr-2 ml-auto text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* 1) User Bubble */}


                            {/* 2) AI Logic Section */}
                            {/* Chat History Loop */}
                            <div
                                className="mobile-no-scrollbar flex flex-col gap-4 w-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0 sm:pr-2 pb-2 sm:pb-2"
                                style={{ overflowAnchor: 'none' }}
                            >
                                {/* Proactive Greeting — UI-only, shown on fresh chat open, never stored in chatHistory */}
                                {showProactiveGreeting && chatHistory.length === 0 && proactiveGreetingText && (
                                    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="flex items-start gap-3 sm:gap-5 px-1">
                                            <div className="flex-shrink-0 mt-1 w-[34px] h-[34px] sm:w-[45px] sm:h-[45.18px] flex items-center justify-center">
                                                <Image
                                                    src="/assets/images/Group14455(1).svg"
                                                    alt="Snaphomz AI"
                                                    width={45}
                                                    height={45}
                                                    className="w-[34px] h-[34px] sm:w-[45px] sm:h-[45.18px] object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-black text-sm tracking-tight">Snaphomz AI</span>
                                                </div>
                                                <div className="text-gray-800 text-[15px] sm:text-[17px] leading-relaxed text-left font-normal break-words">
                                                    <AssistantResponseText
                                                        text={proactiveGreetingText}
                                                        animate={true}
                                                        speedMs={12}
                                                        onProgress={() => scrollChatToBottom('auto')}
                                                        onComplete={() => setProactiveGreetingComplete(true)}
                                                    />
                                                </div>
                                                {/* Rotating suggestion chips — shown only after greeting animation completes */}
                                                {proactiveGreetingComplete && <div className="flex flex-wrap gap-2 pt-1">
                                                    {proactiveSuggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion}
                                                            onMouseDown={() => handleSearchSubmit(suggestion)}
                                                            className="text-sm px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-[#F58634] hover:text-[#F58634] transition-colors cursor-pointer"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                            <div className={`flex flex-col ${msg.relatedProperties?.length ? 'gap-1' : 'gap-6'} w-full animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                                {msg.relatedProperties && msg.relatedProperties.length > 0 && (
                                                    <div className="order-1 flex items-start gap-3 sm:gap-5 px-1">
                                                        <div className="flex-shrink-0 mt-1 w-[34px] h-[34px] sm:w-[45px] sm:h-[45.18px] flex items-center justify-center">
                                                            <Image
                                                                src="/assets/images/Group14455(1).svg"
                                                                alt="Snaphomz AI"
                                                                width={45}
                                                                height={45}
                                                                className="w-[34px] h-[34px] sm:w-[45px] sm:h-[45.18px] object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-black text-sm tracking-tight">Snaphomz AI</span>
                                                            </div>
                                                            {msg.id === latestVisibleAssistantMessageId && shouldShowThinkingForLatestAssistant && (
                                                                <div className="mt-3 self-start w-full">
                                                                    <ThinkingPanel
                                                                        isThinking={isSearching}
                                                                        query={msg.query || currentQuery}
                                                                        intentHint={thinkingIntentHint}
                                                                        backendSteps={thinkingSteps.length > 0 ? thinkingSteps : undefined}
                                                                        forceDoneMs={latestThoughtDurationMs ?? (!isSearching ? 1200 : undefined)}
                                                                        embedded
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AI Avatar & Message */}
                                                <div className={`flex items-start gap-3 sm:gap-5 px-1 ${msg.relatedProperties?.length ? 'order-4' : ''}`}>
                                                    {!msg.relatedProperties?.length && (
                                                        <div className="flex-shrink-0 mt-1 w-[34px] h-[34px] sm:w-[45px] sm:h-[45.18px] flex items-center justify-center">
                                                            <Image
                                                                src="/assets/images/Group14455(1).svg"
                                                                alt="Snaphomz AI"
                                                                width={45}
                                                                height={45}
                                                                className="w-[34px] h-[34px] sm:w-[45px] sm:h-[45.18px] object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                                                        {!msg.relatedProperties?.length && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-black text-sm tracking-tight">Snaphomz AI</span>
                                                            </div>
                                                        )}

                                                        {msg.id === latestVisibleAssistantMessageId && shouldShowThinkingForLatestAssistant && !msg.relatedProperties?.length && (
                                                            <ThinkingPanel
                                                                isThinking={isSearching}
                                                                query={msg.query || currentQuery}
                                                                intentHint={thinkingIntentHint}
                                                                backendSteps={thinkingSteps.length > 0 ? thinkingSteps : undefined}
                                                                forceDoneMs={latestThoughtDurationMs ?? (!isSearching ? 1200 : undefined)}
                                                                embedded
                                                            />
                                                        )}


                                                        {(() => {
                                                            if (msg.stoppedThinking) {
                                                                return (
                                                                    <div className="text-gray-400 text-[13px] sm:text-[14px] leading-relaxed text-left font-medium">
                                                                        Stopped thinking
                                                                    </div>
                                                                );
                                                            }
                                                            const sanitizedMessage = sanitizeAssistantOutput(msg.content || '');
                                                            const relatedQuestionCandidates =
                                                                msg.relatedQuestions && msg.relatedQuestions.length > 0
                                                                    ? msg.relatedQuestions
                                                                    : sanitizedMessage.extractedSuggestions;
                                                            const displayRelatedQuestions = Array.from(new Set(relatedQuestionCandidates || []));

                                                            return (
                                                                <>
                                                                    <div className="text-gray-800 text-[15px] sm:text-[17px] leading-relaxed text-left font-normal break-words">
                                                                        {(() => {
                                                                            const shouldAnimateResponse =
                                                                                msg.id === latestAssistantTextMessageId && !completedAnswerAnimations[msg.id];
                                                                            return (
                                                                                <AssistantResponseText
                                                                                    text={sanitizedMessage.cleanedText || msg.content || ''}
                                                                                    animate={shouldAnimateResponse}
                                                                                    speedMs={8}
                                                                                    onProgress={shouldAnimateResponse ? () => scrollChatToBottom('auto') : undefined}
                                                                                    onComplete={() =>
                                                                                        setCompletedAnswerAnimations((prev) =>
                                                                                            prev[msg.id] ? prev : { ...prev, [msg.id]: true }
                                                                                        )
                                                                                    }
                                                                                />
                                                                            );
                                                                        })()}
                                                                    </div>

                                                                    {msg.clarification && (
                                                                        <div className="mt-4 mb-2 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                                                            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                                            <p className="text-sm text-blue-800 font-medium leading-relaxed">{msg.clarification}</p>
                                                                        </div>
                                                                    )}

                                                                </>
                                                            );
                                                        })()}

                                                        {/* Forecast Chart Card — only render when we have actual data points */}
                                                        {msg.isForecast && msg.forecastData && msg.forecastData.length > 0 && (
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
                                                                            <GraduationCap className="w-10 h-10 sm:w-6 sm:h-6 text-[#F58634]" />
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
                                                    <div className={`w-full max-w-full ${msg.relatedProperties?.length ? 'order-2' : ''} relative group`}>
                                                        {(() => {
                                                            const edges = carouselEdges[msg.id] || { atStart: true, atEnd: false };
                                                            return (
                                                                <>

                                                                    {/* Left Scroll Arrow */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (edges.atStart) return;
                                                                            const container = document.getElementById(`carousel-${msg.id}`);
                                                                            if (container) {
                                                                                container.scrollBy({ left: -360, behavior: 'smooth' });
                                                                                setTimeout(() => updateCarouselEdges(msg.id, container), 260);
                                                                            }
                                                                        }}
                                                                        className={`absolute left-1 sm:left-4 top-[50%] -translate-y-1/2 z-30 hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-95 group/btn ${edges.atStart
                                                                            ? 'bg-gray-200 text-gray-400 shadow-none pointer-events-none'
                                                                            : 'bg-gradient-to-br from-[#F58634] to-[#FF9E5E] shadow-[0_4px_12px_rgba(245,134,52,0.4)] text-white hover:scale-[1.1] hover:shadow-[0_8px_24px_rgba(245,134,52,0.6)] pointer-events-none group-hover:pointer-events-auto'
                                                                            }`}
                                                                        aria-label="Scroll Left"
                                                                        aria-disabled={edges.atStart}
                                                                    >
                                                                        <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 rotate-90 stroke-[3] transition-transform duration-300 ${edges.atStart ? '' : 'group-hover/btn:-translate-y-0.5 group-hover/btn:-translate-x-0.5'}`} />
                                                                    </button>

                                                                    {/* Right Scroll Arrow */}
                                                                    {!edges.atEnd && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const container = document.getElementById(`carousel-${msg.id}`);
                                                                                if (container) {
                                                                                    container.scrollBy({ left: 360, behavior: 'smooth' });
                                                                                    setTimeout(() => updateCarouselEdges(msg.id, container), 260);
                                                                                }
                                                                            }}
                                                                            className="absolute right-1 sm:right-4 top-[50%] -translate-y-1/2 z-30 hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F58634] to-[#FF9E5E] shadow-[0_4px_12px_rgba(245,134,52,0.4)] text-white hover:scale-[1.1] hover:shadow-[0_8px_24px_rgba(245,134,52,0.6)] transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto active:scale-95 group/btn"
                                                                            aria-label="Scroll Right"
                                                                        >
                                                                            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 -rotate-90 stroke-[3] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                        <div
                                                            id={`carousel-${msg.id}`}
                                                            className="flex flex-row items-stretch sm:items-center overflow-x-auto gap-3 sm:gap-4 md:gap-5 px-3 sm:px-6 md:px-8 py-1 sm:py-2.5 md:py-3.5 snap-x snap-mandatory no-scrollbar"
                                                            style={{ scrollBehavior: 'smooth' }}
                                                            onScroll={(event) => updateCarouselEdges(msg.id, event.currentTarget)}
                                                            ref={(el) => updateCarouselEdges(msg.id, el)}
                                                        >
                                                            {msg.relatedProperties.map((property: any, idx: number) => {
                                                                const isActive = selectedPropertyId === property.id;
                                                                const isExpandedCard = expandedPropertyId === property.id;
                                                                const isAnySelected = selectedPropertyId !== null;
                                                                const listingNumber =
                                                                    Number.isFinite(Number(property.displayIndex))
                                                                        ? Number(property.displayIndex)
                                                                        : idx + 1;
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
                                                                w-[78%] min-w-[78%] max-w-[78%] sm:min-w-[250px] sm:w-[250px] md:min-w-[300px] md:w-[300px] md:max-w-[300px] lg:min-w-[270px] lg:w-[270px] lg:max-w-[270px]
                                                                flex-shrink-0 rounded-2xl cursor-pointer snap-start sm:snap-center
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

                                                                        <div className="h-36 sm:h-40 md:h-48 lg:h-44 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
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
                                                                            <div className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/80 shadow-sm backdrop-blur-md">
                                                                                #{listingNumber}
                                                                            </div>
                                                                        </div>

                                                                        <div className="p-3.5 flex flex-col gap-1.5">
                                                                            <div>
                                                                                <h4 className="text-lg font-bold text-gray-900 tracking-tight">{property.price}</h4>
                                                                                <p className="text-sm text-gray-500 font-medium line-clamp-1 mt-0.5">{property.address}</p>
                                                                            </div>

                                                                            {/* Premium Icons Stats */}
                                                                            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 border-t border-b border-gray-100 py-1.5">
                                                                                <span className='flex items-center gap-1.5'>
                                                                                    <BedDouble className="w-3 h-3 text-gray-400 stroke-[1.5]" />
                                                                                    <span>{property.beds} Beds</span>
                                                                                </span>
                                                                                <div className="w-[1px] h-3.5 bg-gray-200"></div>
                                                                                <span className='flex items-center gap-1.5'>
                                                                                    <Bath className="w-3 h-3 text-gray-400 stroke-[1.5]" />
                                                                                    <span>{property.baths} Baths</span>
                                                                                </span>
                                                                                <div className="w-[1px] h-3.5 bg-gray-200"></div>
                                                                                <span className='flex items-center gap-1.5'>
                                                                                    <Scaling className="w-3 h-3 text-gray-400 stroke-[1.5]" />
                                                                                    <span>{property.sqft} sqft</span>
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                                                                <span className="flex items-center gap-1.5">
                                                                                    <Droplets className="w-3 h-3 text-gray-400 stroke-[1.5]" />
                                                                                    Pool
                                                                                </span>
                                                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${poolBadgeClass}`}>
                                                                                    {poolLabel}
                                                                                </span>
                                                                            </div>

                                                                            {/* Show More Button (Always Visible) */}
                                                                            <div className="flex justify-end pt-1">
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
                                                                    href={`${getMainSiteBaseUrl()}/buy/browse?q=${encodeURIComponent(msg.query_history_formatted || msg.query || '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="group flex-shrink-0 snap-start sm:snap-start self-center relative flex h-24 w-24 min-h-[96px] min-w-[96px] max-h-[96px] max-w-[96px] sm:h-32 sm:w-32 sm:min-h-[128px] sm:min-w-[128px] sm:max-h-[128px] sm:max-w-[128px] flex-col items-center justify-center gap-0 rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md transition-all duration-300 hover:scale-105 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-200/60 cursor-pointer"
                                                                >
                                                                    {/* Outer ring on hover */}
                                                                    <div className="pointer-events-none absolute inset-[-6px] rounded-full border-2 border-orange-200 opacity-0 transition-all duration-500 group-hover:opacity-100" />

                                                                    {/* Icon circle */}
                                                                    <div className="mb-1.5 sm:mb-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                                                                        </svg>
                                                                    </div>

                                                                    {/* Label */}
                                                                    <span className="text-center text-[9px] sm:text-[11px] font-semibold leading-tight text-orange-600 px-2 whitespace-normal sm:whitespace-nowrap tracking-tight">
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
                                                                        Yes, that&apos;s the one
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
                                                                                            <GraduationCap className="w-10 h-10 sm:w-6 sm:h-6 text-[#F58634]" />
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
                                                                    {/* <div className="flex flex-col items-start w-full">
                                                                        <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-left">Features</h3>
                                                                        <div className="flex flex-wrap justify-start gap-2 sm:gap-3 w-full">
                                                                            {selectedProp.features?.map((feature: string, i: number) => (
                                                                                <span key={i} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white border border-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors cursor-default whitespace-normal">
                                                                                    {feature}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div> */}

                                                                    {/* 4. INSIGHTS */}
                                                                    {/* <div className="bg-[#FFF9F5] border border-[#FFD8B4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-8">
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
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6"> */}
                                                                    {/* Card 1: Price */}
                                                                    {/* <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
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
                                                                            </div> */}
                                                                    {/* Card 2: Safety */}
                                                                    {/* <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
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
                                                                            </div> */}
                                                                    {/* Card 3: Walkability */}
                                                                    {/* <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
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
                                                                                </div> */}
                                                                    {/* </div> */}
                                                                    {/* Card 4: Climate */}
                                                                    {/* <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between h-auto sm:h-48">
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
                                                                            </div> */}
                                                                    {/* </div> */}
                                                                    {/* Bottom Button */}
                                                                    {/* <div className="flex justify-end mt-3 sm:mt-4">
                                                                            <button className="bg-[#121212] hover:bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-md">
                                                                                Explore Manhattan Beach on Local Wiki <ArrowUp className="w-3 h-3 rotate-90" />
                                                                            </button>
                                                                        </div> */}
                                                                    {/* </div> */}
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

                                {/* Thinking Panel — agent-transparent loading state */}
                                {showStandaloneThinkingPanel && (
                                    <ThinkingPanel
                                        isThinking={isSearching}
                                        query={currentQuery}
                                        intentHint={thinkingIntentHint}
                                        backendSteps={thinkingSteps.length > 0 ? thinkingSteps : undefined}
                                        forceDoneMs={latestThoughtDurationMs ?? undefined}
                                    />
                                )}

                                <div ref={chatBottomRef} className="h-1" />
                            </div>

                            {/* Footer / Related Questions & Search */}
                            <div className="mt-0 border-t border-gray-100/70 bg-white/95 backdrop-blur-md z-30 px-3 pt-1 pb-[max(env(safe-area-inset-bottom),0.1rem)] sm:px-0 sm:pt-1 sm:pb-0.5">
                                {/* 1. Related Questions (Removed - now dynamic per message) */}

                                {/* 2. New Large Search Bar + Controls */}
                                <div ref={searchContainerRef} className="mb-0 flex items-center gap-2 sm:gap-3 -translate-y-[2px]">
                                    {renderNewChatControl('relative hidden sm:block flex-shrink-0 -translate-y-[4px]', 'bottom-full mb-3', 'w-80', 'desktop')}

                                    {/* Search Input */}
                                    <div className="flex-1 min-w-0">
                                        <div className="relative min-w-0">
                                            {(pendingImage || pendingImagePreview) && (
                                                <div className="absolute left-3 top-3 z-10 md:hidden">
                                                    {renderPendingImageChip('expanded')}
                                                </div>
                                            )}
                                            {(pendingImage || pendingImagePreview) && !searchTerm && (
                                                <span
                                                    aria-hidden="true"
                                                    className="md:hidden absolute left-4 right-24 sm:right-24 top-[88px] text-[12px] text-gray-400 pointer-events-none whitespace-normal break-words text-left"
                                                >
                                                    Upload image to discover similar homes
                                                </span>
                                            )}
                                            {(pendingImage || pendingImagePreview) && (
                                                <div className="hidden md:block absolute left-4 top-3 z-10">
                                                    {renderPendingImageChip('desktop')}
                                                </div>
                                            )}
                                            <textarea
                                                ref={searchInputRef}
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSearchTerm(val);
                                                    const typedIntent = classifySuggestionIntent(val);
                                                    if (!val.trim() || typedIntent === 'nl') {
                                                        clearMlsSuggestionState();
                                                    } else {
                                                        fetchAddressSuggestions(val);
                                                    }
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                onFocus={() => {
                                                    if (!isExpanded) {
                                                        // First click on collapsed search box — open chat with proactive greeting
                                                        setIsExpanded(true);
                                                        setProactiveGreetingText(buildProactiveGreeting(user?.firstname, user?.id));
                                                        setProactiveSuggestions(buildProactiveSuggestions());
                                                        setProactiveGreetingComplete(false);
                                                        setShowProactiveGreeting(true);
                                                        if (onSearchStateChange) onSearchStateChange(true, '');
                                                        return;
                                                    }
                                                    // Already expanded — existing suggestions behavior
                                                    setShowSuggestions(true);
                                                    const trimmedSearch = searchTerm.trim();
                                                    if (trimmedSearch) {
                                                        const focusIntent = classifySuggestionIntent(trimmedSearch);
                                                        if (focusIntent === 'nl') {
                                                            clearMlsSuggestionState();
                                                        } else {
                                                            fetchAddressSuggestions(trimmedSearch);
                                                        }
                                                    }
                                                }}
                                                onBlur={() => setTimeout(() => {
                                                    setShowSuggestions(false);
                                                    setShowAddressSuggestions(false);
                                                    setShowLocationSuggestions(false);
                                                    setIsLoadingAddressSuggestions(false);
                                                    setIsLoadingLocationSuggestions(false);
                                                }, 200)}
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
                                                        // Reset height on submit
                                                        if (searchInputRef.current) {
                                                            searchInputRef.current.style.height = 'auto';
                                                        }
                                                    }
                                                }}
                                                placeholder=""
                                                rows={1}
                                                className={`w-full bg-white text-gray-900 rounded-2xl sm:rounded-3xl overflow-y-hidden resize-none pl-4 sm:pl-5 ${pendingImage || pendingImagePreview ? 'min-h-[104px] max-h-40 sm:max-h-48 pt-[70px] pb-2 md:min-h-[92px] md:max-h-36 md:pt-[60px] md:pb-2 md:pl-4' : 'min-h-[48px] sm:min-h-[52px] max-h-24 sm:max-h-32 py-2.5 sm:py-[14px] md:min-h-[46px] md:py-[12px]'} pr-24 sm:pr-24 md:pr-28 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200 transition-all text-[14px] sm:text-base md:text-[15px] placeholder:text-gray-400 font-normal leading-relaxed`}
                                            />
                                            <div className={`absolute right-2 sm:right-3 flex items-center gap-1.5 sm:gap-4 md:gap-2.5 ${(pendingImage || pendingImagePreview) ? 'bottom-2 md:top-1/2 md:translate-y-[calc(-50%-3px)]' : 'top-1/2 translate-y-[calc(-50%-3px)]'}`}>
                                                <div className="hidden md:flex items-center gap-1.5 sm:gap-4 md:gap-2.5">
                                                    {/* Attach Icon & Menu */}
                                                    <div className="relative" ref={attachMenuRef}>
                                                        <div
                                                            className="p-1.5 sm:p-2 md:p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-400 hover:text-gray-600"
                                                            onClick={() => setShowAttachMenu(!showAttachMenu)}
                                                        >
                                                            <Paperclip className="w-5 h-5 sm:w-5 sm:h-5" />
                                                        </div>

                                                        {/* Dropdown Menu (Opens Upwards) */}
                                                        <AnimatePresence>
                                                            {showAttachMenu && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="absolute bottom-full right-0 mb-2 w-32 overflow-visible z-[70]"
                                                                >
                                                                    <div className="rounded-xl bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 ring-1 ring-black/5 overflow-visible">
                                                                        <div className="flex flex-col p-1.5 gap-1">
                                                                            <div className="relative">
                                                                                <button
                                                                                    onClick={() => handleAttachmentClick('image')}
                                                                                    type="button"
                                                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left w-full"
                                                                                >
                                                                                    <ImageIcon className="w-4 h-4 text-blue-500" />
                                                                                    <span>Image</span>
                                                                                </button>
                                                                                <AnimatePresence>
                                                                                    {showAttachTooltip && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                                                            transition={{ duration: 0.2 }}
                                                                                            className="absolute right-0 bottom-full mb-2 w-[170px] rounded-xl border border-[#f2cfb0] bg-white px-3 py-2 shadow-xl z-[90]"
                                                                                        >
                                                                                            <p className="text-[11px] font-semibold leading-relaxed text-[#5A2B13]">
                                                                                                Search homes with a photo
                                                                                            </p>
                                                                                            <span className="absolute right-6 -bottom-1 h-2 w-2 rotate-45 border-r border-b border-[#f2cfb0] bg-white" />
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleAttachmentClick('pdf')}
                                                                                type="button"
                                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                                                                            >
                                                                                <FileText className="w-4 h-4 text-red-500" />
                                                                                <span>PDF</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                    {/* AI toggle hidden in expanded (chat) view on desktop */}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleMobileCameraClick}
                                                    title={CAMERA_TIP_TEXT}
                                                    aria-label={CAMERA_TIP_TEXT}
                                                    className="md:hidden h-10 w-10 text-[#1E1E1E] flex items-center justify-center transition-colors hover:text-black"
                                                >
                                                    <Camera className="h-[21px] w-[21px]" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (isSearching) {
                                                            handleStopSearch();
                                                            return;
                                                        }
                                                        if (pendingImage) {
                                                            submitPendingImage();
                                                            return;
                                                        }
                                                        handleSearchSubmit(searchTerm);
                                                    }}
                                                    disabled={!!pendingImage && pendingImageStatus !== 'ready'}
                                                    className={`bg-black text-white w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md ${pendingImage && pendingImageStatus !== 'ready' ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'hover:bg-gray-800'}`}
                                                >
                                                    {isSearching ? <Square className="w-4 h-4 fill-white" /> : <ArrowUp className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Disclaimer */}
                                <div className="px-2 text-center pb-0">
                                    <p className="text-[11px] sm:text-xs text-gray-400">
                                        Snaphomz AI can make mistakes. Consider checking important information.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div >
        </div >
    );
};

export default function HeroTab() {
    const [activeTab, setActiveTab] = useState<string | null>('buy');
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full mx-auto flex max-w-[1600px] flex-col items-center transition-all duration-500 ease-in-out">
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
            <HeroSearchForm onSearchStateChange={(expanded) => setIsExpanded(expanded)} />
        </div>
    );
}
