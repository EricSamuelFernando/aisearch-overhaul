'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { Loader2, X, RotateCcw, Check } from 'lucide-react';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { useAuth } from '@/shared/hooks/useAuth';
import API from '@/lib/api/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SnapProperty {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  price?: number;
  bedRooms?: number;
  bathRooms?: number | string;
  sqft?: string | number;
  name?: string;
  listingId?: string;
  propertyId?: string;
  image?: string;
  propertyType?: string;
  yearBuilt?: number | string;
  lotSizeValue?: string | number;
  lotSizeUnit?: string;
  features?: Array<{ feature?: string; description?: string } | string> | null;
  publicRemarks?: string;
  propertyDescription?: string;
  hoa?: string | number | null;
  tags?: string[];
  mls_data?: any;
  listing?: any;
  unreadCommentCount?: number;
  comments?: string[];
  engaged?: boolean;
}

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  dimension: string; // e.g. 'location', 'price_range', 'comment:123 Main St'
  text: string;
  contextHint?: string;
  options: QuestionOption[];
}

interface Analysis {
  priceRange: { min: number; max: number };
  cities: string[];
  avgBeds: number;
  propertyType: string;
  consistentFeatures?: string[];
  ambiguousDimensions?: string[];
}

interface RecommendedProperty {
  listingId?: string;
  id?: string;
  listing?: any;
  [key: string]: any;
}

/** Saved session loaded from backend */
interface AISession {
  askedDimensions: string[];
  previousAnswers: Record<string, string>;
  dismissedListingIds: string[];
  likedListingIds: string[];
  lastPropertyFingerprint: string;
  analysis: Analysis | null;
}

type Phase =
  | 'idle'
  | 'analyzing'
  | 'questioning'
  | 'loading_recs'
  | 'results'
  | 'empty'
  | 'error';

interface Props {
  snapProperties: SnapProperty[];
  snapId: string;
  onPropertyAdded: () => void;
  onRecommendationsReady?: (properties: RecommendedProperty[]) => void;
}

// ─── Property helpers ─────────────────────────────────────────────────────────

const formatPrice = (price?: number) => {
  if (!price) return '—';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  return `$${(price / 1000).toFixed(0)}K`;
};

const getPropertyImage = (prop: RecommendedProperty): string => {
  // Try all possible root-level image fields first (common in AI/search responses)
  const rootImg = prop?.primaryListingImageUrl || prop?.primaryImage || prop?.image || prop?.photo || prop?.primaryPhoto;
  if (rootImg && typeof rootImg === 'string') return rootImg;

  // Then try nested structures
  return prop?.listing?.media?.primaryListingImageUrl ||
    prop?.listing?.media?.photos?.[0]?.uri ||
    prop?.listing?.media?.photos?.[0]?.url ||
    prop?.listing?.photos?.[0]?.uri ||
    prop?.listing?.photos?.[0]?.url ||
    prop?.listing?.image ||
    prop?.listing?.primaryPhoto ||
    prop?.media?.primaryListingImageUrl ||
    prop?.media?.photos?.[0]?.uri ||
    prop?.primaryPhoto ||
    prop?.photo ||
    prop?.image ||
    '';
};

const getListingId = (prop: RecommendedProperty): string =>
  String(prop?.listingId || prop?.listing?.listingId || prop?.listing?.mlsNumber || prop?.id || '');

const getPropertyId = (prop: RecommendedProperty): string =>
  String(prop?.propertyId || prop?.id || prop?.listingId || '');

const getAddress = (prop: RecommendedProperty): string => {
  const unparsed = prop?.listing?.address?.unparsedAddress || 
                   prop?.address?.unparsedAddress || 
                   prop?.unparsedAddress;
  if (typeof unparsed === 'string' && unparsed.length > 0) return unparsed;

  const simpleAddress = prop?.listing?.address || prop?.address;
  if (typeof simpleAddress === 'string' && simpleAddress.length > 0) return simpleAddress;

  const formatted = prop?.propertyAddressDetails?.formattedAddress || prop?.formattedAddress;
  if (typeof formatted === 'string' && formatted.length > 0) return formatted;

  return 'Address unavailable';
};

const getCity = (prop: RecommendedProperty): string => {
  const addr = prop?.listing?.address;
  if (!addr) return '';
  return [addr.city, addr.stateOrProvince, addr.zipCode].filter(Boolean).join(', ');
};

const getPrice = (prop: RecommendedProperty): number =>
  prop?.listing?.listPriceLow || prop?.price || prop?.listing?.price || 0;

const getBeds = (prop: RecommendedProperty): number =>
  prop?.listing?.property?.bedroomsTotal || prop?.listing?.bedrooms || prop?.bedRooms || 0;

const getBaths = (prop: RecommendedProperty): number | string =>
  prop?.listing?.property?.bathroomsTotal || prop?.listing?.bathrooms || prop?.bathRooms || 0;

const FALLBACK_COLORS = [
  'bg-slate-700', 'bg-zinc-600', 'bg-stone-600', 'bg-neutral-700', 'bg-gray-600',
];

// ─── Fingerprint helper ───────────────────────────────────────────────────────

/** Normalise an ID to a plain integer string so "12345", "12345.0", 12345 all match */
function normalizeId(raw: unknown): string {
  const s = String(raw ?? '').trim().replace(/\.0+$/, '');
  // If purely numeric, coerce through Number to strip any zero-padding
  return /^\d+$/.test(s) ? String(Number(s)) : s;
}

function computeFingerprint(props: SnapProperty[]): string {
  return props
    .map((p) => normalizeId(p.listingId || p.propertyId || ''))
    .filter(Boolean)
    .sort((a, b) => {
      // Sort numerically when both are numeric, alphabetically otherwise
      const na = Number(a), nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    })
    .join(',');
}

// ─── Compact property row ─────────────────────────────────────────────────────

function AiPropertyCard({
  property, onThumbsUp, onThumbsDown, addedStatus, index,
}: {
  property: RecommendedProperty;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  addedStatus: 'idle' | 'adding' | 'added';
  index: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const image = getPropertyImage(property);
  const price = getPrice(property);
  const address = getAddress(property);
  const city = getCity(property);
  const beds = getBeds(property);
  const baths = getBaths(property);
  const fallbackColor = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  const showImg = image && !imgFailed;

  const meta = [
    Number(beds) > 0 ? `${beds} bd` : null,
    Number(baths) > 0 ? `${baths} ba` : null,
    city ? city.split(',')[0] : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-3 py-2.5 px-1 group">
      <div className={`relative w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 ${fallbackColor}`}>
        {showImg && (
          <img src={image} alt={address} className="absolute inset-0 w-full h-full object-cover" onError={() => setImgFailed(true)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-gray-900 leading-tight">{price ? formatPrice(price) : '—'}</p>
        <p className="text-[11px] text-gray-500 truncate mt-0.5 leading-tight">{address}</p>
        {meta && <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{meta}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {addedStatus === 'added' ? (
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-green-600" />
          </div>
        ) : (
          <>
            <button
              onClick={onThumbsUp}
              disabled={addedStatus === 'adding'}
              title="Add to Snapz"
              className="w-7 h-7 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {addedStatus === 'adding'
                ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                : <span className="text-white text-[16px] leading-none pb-px">+</span>}
            </button>
            <button
              onClick={onThumbsDown}
              title="Not interested"
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Gradient AI icon ─────────────────────────────────────────────────────────

function AskAIIcon() {
  const uid = useId().replace(/:/g, '');
  const gradientId = `snapz-ai-grad-${uid}`;
  const mask1Id = `snapz-ai-m1-${uid}`;
  const mask2Id = `snapz-ai-m2-${uid}`;

  return (
    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z"
        fill="black" stroke={`url(#${gradientId})`} strokeWidth="2"
      />
      <mask id={mask1Id} fill="white">
        <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
      </mask>
      <path
        d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z"
        fill="white" stroke="white" strokeWidth="4" mask={`url(#${mask1Id})`}
      />
      <mask id={mask2Id} fill="white">
        <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
      </mask>
      <path
        d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z"
        fill="white" stroke="white" strokeWidth="4" mask={`url(#${mask2Id})`}
      />
      <defs>
        <linearGradient id={gradientId} x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8804C" stopOpacity="1" />
          <stop offset="0.5" stopColor="#E84C85" stopOpacity="1" />
          <stop offset="0.75" stopColor="#A64EBA" stopOpacity="1" />
          <stop offset="1" stopColor="#654FEF" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Comment enrichment ───────────────────────────────────────────────────────

const SNAPZ_GRAPHQL_URI =
  (process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL as string) ||
  'http://localhost:4000/auth/graphql';

function normalizeNumId(raw: unknown): string {
  const s = String(raw ?? '').trim().replace(/\.0+$/, '');
  return /^\d+$/.test(s) ? String(Number(s)) : '';
}

function idsMatch(a: unknown, b: unknown): boolean {
  const la = String(a ?? '').trim();
  const lb = String(b ?? '').trim();
  if (!la || !lb) return false;
  if (la === lb) return true;
  const na = normalizeNumId(la);
  const nb = normalizeNumId(lb);
  return Boolean(na && nb && na === nb);
}

async function fetchCommentsForSnap(snapId: string, currentUserId?: string): Promise<Record<string, string[]>> {
  // Guard: if we don't have a verified userId, return empty to avoid leaking other users' comments
  if (!currentUserId || !snapId) {
    console.warn('[SnapzAI] fetchCommentsForSnap called without userId or snapId — skipping');
    return {};
  }

  try {
    const query = `
      query RecentComments($limit: Int) {
        recentComments(limit: $limit) {
          id
          propertyId
          userId
          text
          snapId
          createdAt
        }
      }
    `;
    const response = await API.post(
      SNAPZ_GRAPHQL_URI,
      { query, variables: { limit: 200 } },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const allComments: any[] = response?.data?.data?.recentComments || [];

    // Only look at comments from the last 7 days — older comments are stale preference signals
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Strict filter: ONLY this user's comments in THIS specific snap
    const snapComments = allComments.filter((c: any) => {
      const inSnap = c.snapId === snapId;
      const byCurrentUser = c.userId === currentUserId;
      const isRecent = c.createdAt ? new Date(c.createdAt).getTime() >= sevenDaysAgo : true;
      return inSnap && byCurrentUser && isRecent;
    });

    const commentMap: Record<string, string[]> = {};
    const addToMap = (key: string, text: string) => {
      if (!key) return;
      commentMap[key] = commentMap[key] || [];
      commentMap[key].push(text);
    };

    snapComments.forEach((c: any) => {
      const raw = String(c.propertyId || '').trim();
      if (!raw || !c.text) return;
      const text = String(c.text).trim();
      addToMap(raw, text);
      const numNorm = normalizeNumId(raw);
      if (numNorm && numNorm !== raw) addToMap(numNorm, text);
    });

    console.log('[SnapzAI] fetched', snapComments.length, 'comments for snap', snapId, '| keys:', Object.keys(commentMap));
    return commentMap;
  } catch (e) {
    console.warn('[SnapzAI] comment fetch failed silently:', e);
    return {};
  }
}

// ─── Session helpers (GraphQL calls) ─────────────────────────────────────────

async function loadAISession(userId: string, snapId: string): Promise<AISession | null> {
  try {
    const data = await API.graphql({
      query: `
        query GetSnapAISession($userId: String!, $snapId: String!) {
          getSnapAISession(userId: $userId, snapId: $snapId) {
            askedDimensionsJson
            previousAnswersJson
            dismissedListingIdsJson
            likedListingIdsJson
            analysisJson
            lastPropertyFingerprint
          }
        }
      `,
      variables: { userId, snapId },
    });

    const raw = data?.getSnapAISession;
    if (!raw) return null;

    const parseJson = <T,>(s: string | null | undefined, fb: T): T => {
      if (!s) return fb;
      try { return JSON.parse(s) as T; } catch { return fb; }
    };

    return {
      askedDimensions: parseJson<string[]>(raw.askedDimensionsJson, []),
      previousAnswers: parseJson<Record<string, string>>(raw.previousAnswersJson, {}),
      dismissedListingIds: parseJson<string[]>(raw.dismissedListingIdsJson, []),
      likedListingIds: parseJson<string[]>(raw.likedListingIdsJson, []),
      lastPropertyFingerprint: raw.lastPropertyFingerprint ?? '',
      analysis: parseJson<Analysis | null>(raw.analysisJson, null),
    };
  } catch (e) {
    console.warn('[SnapzAI] loadAISession failed silently:', e);
    return null;
  }
}

async function saveAISession(
  userId: string,
  snapId: string,
  askedDimensions: string[],
  answers: Record<string, string>,
  fingerprint: string,
  analysis?: Analysis | null,
): Promise<void> {
  try {
    await API.graphql({
      query: `
        mutation SaveSnapAISession($input: SaveSnapAISessionInput!) {
          saveSnapAISession(input: $input)
        }
      `,
      variables: {
        input: {
          userId,
          snapId,
          askedDimensionsJson: JSON.stringify(askedDimensions),
          previousAnswersJson: JSON.stringify(answers),
          lastPropertyFingerprint: fingerprint,
          ...(analysis !== undefined && analysis !== null
            ? { analysisJson: JSON.stringify(analysis) }
            : {}),
        },
      },
    });
  } catch (e) {
    console.warn('[SnapzAI] saveAISession failed silently:', e);
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SnapzAIAssistant({ snapProperties, snapId, onPropertyAdded, onRecommendationsReady }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, 'idle' | 'adding' | 'added'>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const { toggleFavourite } = useUserSnapAPIs();
  const { user } = useAuth();
  const autoStarted = useRef(false);
  const enrichedPropertiesRef = useRef<SnapProperty[]>([]);
  // Holds session loaded from DB — used in reset/retry flows
  const sessionRef = useRef<AISession | null>(null);

  useEffect(() => {
    // Wait for user?.id to be available before auto-starting so that
    // fetchCommentsForSnap can filter strictly by userId. Firing before
    // Redux hydrates would mean user?.id is undefined and we'd either
    // skip comments entirely (safe, but misses real ones) or — before the
    // strict-filter fix — accidentally include other users' comments.
    if (!autoStarted.current && snapProperties.length > 0 && phase === 'idle' && user?.id) {
      autoStarted.current = true;
      handleStart(snapProperties);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapProperties.length, user?.id]);

  const reset = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnalysis(null);
    setAnswers({});
    setRecommendations([]);
    setAddedMap({});
    setErrorMsg('');
    setCustomInput('');
    setShowCustomInput(false);
    setSelectedValue(null);
    // On manual reset, ignore session so user gets fresh questions
    sessionRef.current = null;
    handleStart(snapProperties, true);
  };

  const handleStart = async (props?: SnapProperty[], forceReset = false) => {
    const propsToUse = props ?? snapProperties;
    if (!propsToUse.length) return;
    setPhase('analyzing');
    setErrorMsg('');

    try {
      // ── 1. Enrich with comments ───────────────────────────────────────────
      // Only use the current user's own comments as preference signals.
      // fetchCommentsForSnap filters by both snapId and currentUserId so
      // collaborators' comments are never included.
      const commentMap = await fetchCommentsForSnap(snapId, user?.id);

      const enriched = propsToUse.map((p) => {
        const propId = String(p.propertyId || '').trim();
        const listId = String(p.listingId || '').trim();

        const propertyComments =
          commentMap[propId] ||
          commentMap[listId] ||
          commentMap[normalizeNumId(propId)] ||
          commentMap[normalizeNumId(listId)] ||
          (() => {
            const found = Object.keys(commentMap).find(
              (k) => idsMatch(k, propId) || idsMatch(k, listId),
            );
            return found ? commentMap[found] : [];
          })();

        return {
          ...p,
          comments: propertyComments.length > 0 ? propertyComments : undefined,
          engaged: propertyComments.length > 0 ? true : undefined,
        };
      });
      enrichedPropertiesRef.current = enriched;

      // ── 2. Load session from backend ──────────────────────────────────────
      const userId = user?.id;
      let session: AISession | null = sessionRef.current;
      if (!session && userId && !forceReset) {
        session = await loadAISession(userId, snapId);
        sessionRef.current = session;
      }

      // ── 3. Check fingerprint — if same snap & same answers, skip questions ──
      const fingerprint = computeFingerprint(propsToUse);
      if (
        session &&
        session.lastPropertyFingerprint === fingerprint &&
        Object.keys(session.previousAnswers).length > 0 &&
        !forceReset
      ) {
        console.log('[SnapzAI] Same snap fingerprint — skipping questions, using saved answers + saved analysis');
        setAnswers(session.previousAnswers);
        if (session.analysis) setAnalysis(session.analysis);
        await fetchRecommendations(session.previousAnswers, session.analysis, session.dismissedListingIds, session.likedListingIds);
        return;
      }

      // ── 4. Call Phase A with session context ──────────────────────────────
      const sessionContext = session && session.askedDimensions.length > 0
        ? {
            askedDimensions: session.askedDimensions,
            previousAnswers: session.previousAnswers,
            dismissedListingIds: session.dismissedListingIds,
          }
        : undefined;

      const res = await fetch('/api/snapz-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'analyze', snapProperties: enriched, session: sessionContext }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      console.log('[SnapzAI] Analyze data received:', data);
      setAnalysis(data.analysis || null);

      // ── 5. If AI returned 0 questions (all dimensions covered) → skip to recs ──
      if (!data?.questions?.length && session && Object.keys(session.previousAnswers).length > 0) {
        console.log('[SnapzAI] AI returned 0 questions — using session answers directly');
        const mergedAnswers = { ...session.previousAnswers };
        setAnswers(mergedAnswers);
        await fetchRecommendations(mergedAnswers, data.analysis || null, session.dismissedListingIds, session.likedListingIds);
        return;
      }

      if (!data?.questions?.length) throw new Error('No questions returned');
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setPhase('questioning');
    } catch (err: any) {
      console.error('[SnapzAI] Questions error:', err);
      setErrorMsg('Could not load questions. Please try again.');
      setPhase('error');
    }
  };

  const fetchRecommendations = async (
    finalAnswers: Record<string, string>,
    overrideAnalysis?: Analysis | null,
    dismissedListingIds?: string[],
    likedListingIds?: string[],
  ) => {
    setPhase('loading_recs');
    const propsForRec =
      enrichedPropertiesRef.current.length > 0 ? enrichedPropertiesRef.current : snapProperties;
    const analysisToUse = overrideAnalysis !== undefined ? overrideAnalysis : analysis;

    // If we don't have an analysis object (e.g. jumped straight from saved session),
    // build a minimal one so route.ts doesn't reject
    const safeAnalysis: Analysis = analysisToUse ?? {
      priceRange: { min: 0, max: 9999999 },
      cities: [],
      avgBeds: 0,
      propertyType: 'any',
    };

    const dismissed = dismissedListingIds ?? sessionRef.current?.dismissedListingIds ?? [];
    // Pass liked listings so the AI can use them as positive preference signals
    const liked = likedListingIds ?? sessionRef.current?.likedListingIds ?? [];

    try {
      const res = await fetch('/api/snapz-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'recommend',
          userId: user?.id,
          snapProperties: propsForRec,
          analysis: safeAnalysis,
          answers: finalAnswers,
          dismissedListingIds: dismissed,
          likedListingIds: liked,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      console.log('[SnapzAI] Recommend data received:', data);
      const props: RecommendedProperty[] = data?.properties || [];
      if (!props.length) { setPhase('empty'); return; }
      setRecommendations(props);
      const initMap: Record<string, 'idle'> = {};
      props.forEach((p) => { const id = getListingId(p); if (id) initMap[id] = 'idle'; });
      setAddedMap(initMap);
      setPhase('results');
      onRecommendationsReady?.(props);
    } catch (err: any) {
      console.error('[SnapzAI] Recommend error:', err);
      setErrorMsg('Could not fetch recommendations. Please try again.');
      setPhase('error');
    }
  };

  const handleAnswer = (value: string) => {
    if (!value.trim() || phase !== 'questioning') return;

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    setSelectedValue(value);
    setTimeout(async () => {
      setSelectedValue(null);
      setCustomInput('');
      setShowCustomInput(false);

      // Key answers by dimension (not question id) so they survive across sessions
      const updatedAnswers = { ...answers, [currentQ.dimension || currentQ.id]: value };
      setAnswers(updatedAnswers);

      const userId = user?.id;
      const fingerprint = computeFingerprint(snapProperties);
      // Accumulate asked dimensions across sessions
      const existingDims = sessionRef.current?.askedDimensions ?? [];
      const answeredSoFar = questions.slice(0, currentQuestionIndex + 1).map((q) => q.dimension || q.id);
      const mergedDims = Array.from(new Set([...existingDims, ...answeredSoFar]));

      // Save after EVERY answer so partial progress is never lost.
      // Also persist the current analysis so re-opens use real price/city context.
      if (userId) {
        saveAISession(userId, snapId, mergedDims, updatedAnswers, fingerprint, analysis);
      }

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        // All questions answered — fetch recommendations
        fetchRecommendations(updatedAnswers);
      }
    }, 220);
  };

  const handleThumbsUp = (property: RecommendedProperty) => {
    const listingId = getListingId(property);
    const propertyId = getPropertyId(property);
    if (!listingId) return;
    setAddedMap((prev) => ({ ...prev, [listingId]: 'adding' }));
    toggleFavourite.mutate(
      {
        snapId,
        propertyId: propertyId || listingId,
        listingId,
        createFavouritesInput: {
          name: getAddress(property),
          address: getAddress(property),
          city: getCity(property).split(',')[0]?.trim() || '',
          price: getPrice(property),
          image: getPropertyImage(property),
          bedRooms: getBeds(property),
          bathRooms: String(getBaths(property)),
          sqft: String(property?.listing?.property?.livingArea || ''),
          listingId,
          propertyId: propertyId || listingId,
          snapId,
        },
      },
      {
        onSuccess: (wasAdded: boolean) => {
          setAddedMap((prev) => ({ ...prev, [listingId]: 'added' }));
          if (wasAdded) onPropertyAdded();
        },
        onError: () => setAddedMap((prev) => ({ ...prev, [listingId]: 'idle' })),
      },
    );
  };

  const handleThumbsDown = (property: RecommendedProperty) => {
    const listingId = getListingId(property);
    setRecommendations((prev) => prev.filter((p) => getListingId(p) !== listingId));
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPct = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="w-full h-full rounded-2xl bg-white shadow-lg border border-[#EDEDED] flex flex-col overflow-hidden">

      {/* ── Thin progress bar at the very top ── */}
      {phase === 'questioning' && totalQuestions > 0 && (
        <div className="h-[3px] bg-gray-100 flex-shrink-0">
          <div
            className="h-full bg-gradient-to-r from-ocOrange to-[#E84C85] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col p-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <AskAIIcon />
          <h3 className="text-[17px] font-semibold">Snapz AI</h3>
          {phase === 'questioning' && totalQuestions > 1 && (
            <span className="ml-1 text-[10px] text-gray-400 font-medium">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          )}
          {(phase !== 'idle' && phase !== 'analyzing') && (
            <button
              onClick={reset}
              className="ml-auto p-1 rounded-md hover:bg-gray-100 transition-colors"
              title="Start over"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 flex flex-col">

          {/* Analyzing */}
          {phase === 'analyzing' && (
            <>
              <p className="text-[12px] text-gray-400 mb-3">Your personalised home finder for this Snapz.</p>
              <div className="flex items-center gap-2 text-[12px] text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                Analysing your Snapz…
              </div>
            </>
          )}

          {/* Loading recs */}
          {phase === 'loading_recs' && (
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
              Finding homes you&apos;ll love…
            </div>
          )}

          {/* ── Questioning ── */}
          {phase === 'questioning' && currentQuestion && (
            <div className="flex flex-col gap-0">

              {/* Previously answered — compact green pills */}
              {currentQuestionIndex > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5 flex-shrink-0">
                  {questions.slice(0, currentQuestionIndex).map((q) => (
                    <span
                      key={q.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] text-green-700 font-medium"
                    >
                      <Check className="w-2.5 h-2.5 flex-shrink-0" />
                      {answers[q.dimension || q.id]}
                    </span>
                  ))}
                </div>
              )}

              {/* Context hint */}
              {currentQuestion.contextHint && (
                <p className="text-[11px] text-ocOrange mb-2 flex-shrink-0 flex items-start gap-1 leading-snug">
                  <span className="mt-px flex-shrink-0">✦</span>
                  <span>{currentQuestion.contextHint}</span>
                </p>
              )}

              {/* Question text */}
              <p className="text-[13px] font-semibold text-gray-800 leading-snug mb-3 flex-shrink-0">
                {currentQuestion.text}
              </p>

              {/* ── Pill chip options ── */}
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => !selectedValue && handleAnswer(opt.value)}
                      disabled={!!selectedValue && !isSelected}
                      className={`
                        inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium
                        border transition-all duration-150 active:scale-95 cursor-pointer
                        ${isSelected
                          ? 'bg-black text-white border-black scale-95'
                          : 'bg-[#F6F6F6] text-gray-700 border-transparent hover:border-gray-300 hover:bg-white hover:shadow-sm disabled:opacity-40'
                        }
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* ── Custom input toggle ── */}
              <div className="mt-3 flex-shrink-0">
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Type your own preference
                  </button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type your preference…"
                      className="flex-1 min-w-0 border border-[#D9D9D9] rounded-xl px-3 py-2 text-[12px] outline-none focus:border-gray-400 transition-colors"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customInput.trim()) handleAnswer(customInput.trim());
                        if (e.key === 'Escape') { setShowCustomInput(false); setCustomInput(''); }
                      }}
                    />
                    <button
                      onClick={() => { if (customInput.trim()) handleAnswer(customInput.trim()); }}
                      disabled={!customInput.trim()}
                      className="flex-shrink-0 px-3 py-2 bg-black text-white rounded-xl text-[11px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results — minimal sidebar state; cards live in the page reel below */}
          {phase === 'results' && (
            <div className="flex flex-col gap-3 flex-shrink-0">
              {/* Count + retry row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-ocOrange text-[13px]">✦</span>
                  <span className="text-[13px] font-semibold text-gray-800">
                    {recommendations.length} home{recommendations.length !== 1 ? 's' : ''} matched
                  </span>
                </div>
                <button
                  onClick={reset}
                  className="text-[11px] text-gray-400 hover:text-ocOrange flex items-center gap-0.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              </div>
              {/* Scroll nudge */}
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Scroll down to review your AI picks. Tap <span className="font-medium text-gray-600">Add</span> on any home to save it to this Snapz.
              </p>
              {/* Animated arrow pointing down */}
              <div className="flex justify-center pt-1">
                <div className="flex flex-col items-center gap-0.5 opacity-40">
                  <div className="w-px h-4 bg-gray-400" />
                  <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Empty */}
          {phase === 'empty' && (
            <>
              <p className="text-[12px] text-gray-400 mb-2">No matching homes found right now.</p>
              <button
                onClick={reset}
                className="text-[12px] text-ocOrange font-medium flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" /> Try different preferences
              </button>
            </>
          )}

          {/* Error */}
          {phase === 'error' && (
            <>
              <p className="text-[12px] text-gray-400 mb-2">{errorMsg || 'Something went wrong.'}</p>
              <button
                onClick={reset}
                className="text-[12px] text-ocOrange font-medium flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" /> Try again
              </button>
            </>
          )}

          {/* Spacer for non-results, non-questioning phases */}
          {phase !== 'results' && phase !== 'questioning' && <div className="flex-1" />}

        </div>
      </div>
    </div>
  );
}
