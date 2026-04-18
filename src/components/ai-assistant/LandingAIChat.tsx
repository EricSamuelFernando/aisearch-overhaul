'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { MLSListing, MLSSearchParams, PhotoRankResult } from '@/types/ai-assistant';
import ListingTile from './ListingTile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  listings?: MLSListing[];
  searchParams?: Partial<MLSSearchParams>;
  focusedListing?: MLSListing;
  elapsed?: number;
  queryText?: string;
  timestamp?: string;
}

interface HistorySession {
  startTs: number | null;
  label: string;
  messages: Message[];
}

interface ConversationMeta {
  id: string;
  preview: string;
  messageCount: number;
  timestamp: string | null;
}

function groupIntoSessions(messages: Message[]): HistorySession[] {
  const GAP_MS = 2 * 60 * 60 * 1000; // 2 hours = new session
  const sessions: HistorySession[] = [];
  let current: HistorySession | null = null;
  let lastTs: number | null = null;

  for (const msg of messages) {
    const ts = msg.timestamp ? new Date(msg.timestamp).getTime() : null;
    if (!current || (ts && lastTs && ts - lastTs > GAP_MS)) {
      const label = ts ? sessionDateLabel(ts) : 'Earlier';
      current = { startTs: ts, label, messages: [] };
      sessions.push(current);
    }
    current.messages.push(msg);
    if (ts) lastTs = ts;
  }

  return sessions.reverse(); // newest session first
}

function sessionDateLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}

function sessionPreview(session: HistorySession): string {
  const firstUser = session.messages.find((m) => m.role === 'user');
  return firstUser ? firstUser.content.slice(0, 72) : 'Conversation';
}

function cleanContent(text: string): string {
  const stripped = text.replace(/```mls_search[\s\S]*?```/g, '');
  const lines = stripped.split('\n').filter((line) => {
    // Remove markdown horizontal rules and table separator rows
    if (/^\s*-{3,}\s*$/.test(line)) return false;
    if (/^\s*\|?(?:\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line)) return false;
    // Strip SUGGEST: lines — rendered separately as chips
    if (line.startsWith('SUGGEST:')) return false;
    return true;
  }).map((line) => line.replace(/^#{1,6}\s+/, '')); // strip stray heading markers
  return lines.join('\n').trim();
}

function extractSuggestions(content: string): string[] {
  const lines = content.split('\n');
  const suggestLine = lines.find((l) => l.startsWith('SUGGEST:'));
  if (!suggestLine) return [];
  return suggestLine.replace('SUGGEST:', '').split('|').map((s) => s.trim()).filter(Boolean);
}

interface UserIdentity {
  userId: string;
  email:  string | null;
  name:   string | null;
}

function getUserIdentity(): UserIdentity {
  if (typeof window === 'undefined') return { userId: 'anon', email: null, name: null };
  // Use authenticated user's details if logged in
  try {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      if (parsed?.id) {
        const firstName = parsed.firstname ?? parsed.firstName ?? '';
        const lastName  = parsed.lastname  ?? parsed.lastName  ?? '';
        const name = [firstName, lastName].filter(Boolean).join(' ') || null;
        return { userId: parsed.id, email: parsed.email ?? null, name };
      }
    }
  } catch {}
  // Anonymous fallback — persist across page reloads
  let id = localStorage.getItem('snapz_ai_user_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('snapz_ai_user_id', id);
  }
  return { userId: id, email: null, name: null };
}

function getUserId(): string {
  return getUserIdentity().userId;
}

const SUGGESTIONS = [
  '3 bed under $500k in Austin with a pool',
  'Condos in Miami under $400k',
  'Show me 4 bed homes in Dallas under $700k',
];
const CHAT_EXPANDED_STORAGE_KEY = 'landing_ai_chat_expanded';
const CHAT_STATE_STORAGE_KEY = 'landing_ai_chat_state_v1';
const SESSION_TS_KEY = 'landing_ai_chat_session_ts';
const CONV_ID_KEY = 'landing_ai_chat_conv_id';
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours — after this, new visit starts clean

function AskAiIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z" fill="black" stroke="url(#baiGradLanding)" strokeWidth="2" />
      <mask id="baiM1Landing" fill="white">
        <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
      </mask>
      <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" fill="white" stroke="white" strokeWidth="4" mask="url(#baiM1Landing)" />
      <mask id="baiM2Landing" fill="white">
        <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
      </mask>
      <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" fill="white" stroke="white" strokeWidth="4" mask="url(#baiM2Landing)" />
      <defs>
        <linearGradient id="baiGradLanding" x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8804C" />
          <stop offset="0.5" stopColor="#E84C85" />
          <stop offset="0.75" stopColor="#A64EBA" />
          <stop offset="1" stopColor="#654FEF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LiveTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startTime) / 1000), 100);
    return () => clearInterval(id);
  }, [startTime]);
  return <span className="text-[10px] text-gray-400 ml-1">{elapsed.toFixed(1)}s</span>;
}

const buildLocationQueryFromSearchParams = (searchParams?: Partial<MLSSearchParams>): string => {
  if (!searchParams) return '';
  const city = (searchParams.city ?? '').trim();
  const state = (searchParams.state ?? '').trim().toUpperCase();
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  const zip = (searchParams.zip ?? '').trim();
  if (zip) return zip;
  const county = (searchParams.county ?? '').trim();
  if (county) return county;
  return '';
};

const buildBrowseUrl = (
  listings: MLSListing[],
  queryText?: string,
  searchParams?: Partial<MLSSearchParams>,
): string => {
  const params = new URLSearchParams();

  const derivedLocationFromSearch = buildLocationQueryFromSearchParams(searchParams);
  if (derivedLocationFromSearch) {
    params.set('q', derivedLocationFromSearch);
  }

  const setNumeric = (key: string, value?: number) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      params.set(key, String(value));
    }
  };

  // Reuse the same filter shape expected by /buy/browse.
  setNumeric('bedRooms', searchParams?.bedrooms_min ?? searchParams?.bedrooms_max);
  setNumeric('bathRooms', searchParams?.bathrooms_min ?? searchParams?.bathrooms_max);
  setNumeric('priceMin', searchParams?.listing_price_min);
  setNumeric('priceMax', searchParams?.listing_price_max);

  const propertyType =
    (searchParams?.property_sub_type ?? '').trim() ||
    (searchParams?.listing_property_type ?? '').trim() ||
    (searchParams?.property_type ?? '').trim();
  if (propertyType) {
    params.set('propertyType', propertyType);
  }

  if (searchParams?.has_pool === true) {
    params.set('hasPool', '1');
  }
  if (searchParams?.latest_only === true) {
    params.set('latestOnly', '1');
  }

  if (searchParams && Object.keys(searchParams).length > 0) {
    params.set('aiParams', encodeURIComponent(JSON.stringify(searchParams)));
  }

  // Fallback for older messages that do not have search params.
  if (!params.get('q')) {
    const normalize = (value?: string) => (value ?? '').trim();
    const stateCounts = new Map<string, number>();
    const cityStateCounts = new Map<string, number>();

    for (const listing of listings) {
      const state = normalize(listing.state).toUpperCase();
      if (state) stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1);

      const city = normalize(listing.city);
      const cityState = [city, state].filter(Boolean).join(', ');
      if (cityState) cityStateCounts.set(cityState, (cityStateCounts.get(cityState) ?? 0) + 1);
    }

    const mostFrequent = (counts: Map<string, number>) => {
      let winner = '';
      let best = 0;
      for (const [key, count] of counts.entries()) {
        if (count > best) {
          winner = key;
          best = count;
        }
      }
      return winner;
    };

    const dominantState = mostFrequent(stateCounts);
    const dominantCityState = mostFrequent(cityStateCounts);
    const derivedLocationQuery = dominantState || dominantCityState || (queryText ?? '').trim();

    if (derivedLocationQuery) {
      params.set('q', derivedLocationQuery);
    }
  }

  const queryString = params.toString();
  return queryString ? `/buy/browse?${queryString}` : '/buy/browse';
};

function ListingsRow({ listings, queryText, searchParams }: { listings: MLSListing[]; queryText?: string; searchParams?: Partial<MLSSearchParams> }) {
  const router = useRouter();
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [listings, updateScrollState]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const handle = () => updateScrollState();
    el.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    return () => {
      el.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, [updateScrollState]);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.min(320, el.clientWidth * 0.9);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const browseUrl = buildBrowseUrl(listings, queryText, searchParams);

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gray-200 text-gray-600 shadow-md flex items-center justify-center"
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#e8804c] text-white shadow-md flex items-center justify-center"
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      <div ref={rowRef} className="flex items-start gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {listings.map((listing, idx) => (
          <ListingTile key={listing.id || idx} listing={listing} index={idx} queryText={queryText} />
        ))}
        <button
          type="button"
          onClick={() => router.push(browseUrl)}
          className="self-center flex-shrink-0 w-[132px] h-[132px] rounded-2xl border-[3px] border-[#e8804c] bg-white text-[#c86b3e] shadow-sm hover:shadow-md hover:bg-[#fffaf7] transition-all flex flex-col items-center justify-center"
          aria-label="View more properties"
        >
          <span className="w-11 h-11 rounded-full bg-[#e8804c] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden="true">
              <path d="M13.5 5.5a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-4.58 4.58a1 1 0 0 1-1.42-1.42l2.88-2.88H5a1 1 0 1 1 0-2h11.96L13.5 6.92a1 1 0 0 1 0-1.42z" />
            </svg>
          </span>
          <span className="text-[12px] leading-tight font-semibold">View more</span>
          <span className="text-[12px] leading-tight font-semibold">properties</span>
        </button>
      </div>
    </div>
  );
}

export default function LandingAIChat({ onExpandedChange }: { onExpandedChange?: (expanded: boolean) => void }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScrollRef = useRef(true);
  // Persist last fetched listings so follow-up responses can re-attach them
  const lastListingsRef = useRef<MLSListing[]>([]);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sessionTs = sessionStorage.getItem(SESSION_TS_KEY);
      const now = Date.now();
      const isActiveSession = sessionTs && (now - parseInt(sessionTs)) < SESSION_TIMEOUT_MS;

      if (isActiveSession) {
        // Restore in-progress conversation — user refreshed within the same session window
        const savedState = sessionStorage.getItem(CHAT_STATE_STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState) as {
            messages?: Message[];
            input?: string;
            isExpanded?: boolean;
            lastListings?: MLSListing[];
          };
          if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
          if (typeof parsed.input === 'string') setInput(parsed.input);
          if (typeof parsed.isExpanded === 'boolean') setIsExpanded(parsed.isExpanded);
          if (Array.isArray(parsed.lastListings)) lastListingsRef.current = parsed.lastListings;
        } else {
          // Backward compat
          const savedExpanded = sessionStorage.getItem(CHAT_EXPANDED_STORAGE_KEY);
          if (savedExpanded === '1') setIsExpanded(true);
        }
      } else {
        // New session — clear stale state, stamp start time, and issue a fresh convId.
        // Never reuse the previous session's convId — that would pull stale search context
        // from Redis and apply old filters (location, beds, baths) to new searches.
        sessionStorage.removeItem(CHAT_STATE_STORAGE_KEY);
        sessionStorage.setItem(SESSION_TS_KEY, now.toString());
        sessionStorage.setItem(CONV_ID_KEY, uuidv4());
      }
    } catch {}
    hasHydratedRef.current = true;
  }, []);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydratedRef.current) return;
    // Always persist expanded/collapsed state even if large chat payload fails to save.
    try {
      sessionStorage.setItem(CHAT_EXPANDED_STORAGE_KEY, isExpanded ? '1' : '0');
    } catch {}

    // Persist a compact version of chat state to reduce quota errors.
    const compactListings = (listings: MLSListing[] | undefined) =>
      (listings ?? []).map((l) => ({
        ...l,
        photos: (l.photos ?? []).slice(0, 6),
      }));

    const compactMessages: Message[] = messages.slice(-20).map((m) => ({
      ...m,
      listings: compactListings(m.listings),
      focusedListing: m.focusedListing
        ? { ...m.focusedListing, photos: (m.focusedListing.photos ?? []).slice(0, 6) }
        : undefined,
    }));

    try {
      // Refresh the session timestamp so active conversations don't expire mid-use
      sessionStorage.setItem(SESSION_TS_KEY, Date.now().toString());
      sessionStorage.setItem(
        CHAT_STATE_STORAGE_KEY,
        JSON.stringify({
          messages: compactMessages,
          input,
          isExpanded,
          lastListings: compactListings(lastListingsRef.current),
        }),
      );
    } catch {
      // Fallback: preserve text conversation + expanded state even if listing payload is too large.
      try {
        sessionStorage.setItem(
          CHAT_STATE_STORAGE_KEY,
          JSON.stringify({
            messages: messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
            input,
            isExpanded,
            lastListings: [],
          }),
        );
      } catch {}
    }
  }, [messages, input, isExpanded]);

  // History is loaded on-demand when the user opens the past-chats panel.
  // We no longer inject past sessions into the main chat on mount —
  // each visit starts clean, and the AI's Supermemory greeting surfaces prior context naturally.

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updatePinnedState = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 80;
    };

    updatePinnedState();
    el.addEventListener('scroll', updatePinnedState, { passive: true });
    return () => el.removeEventListener('scroll', updatePinnedState);
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    if (!shouldAutoScrollRef.current) return;

    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  }, [messages, loading, isExpanded]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput('');
    setIsExpanded(true);
    shouldAutoScrollRef.current = true;
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setLoading(true);
    // Placeholder assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '', queryText: content }]);

    const start = Date.now();
    setStreamStartTime(start);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          ...getUserIdentity(),
          conversationId: sessionStorage.getItem(CONV_ID_KEY),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let prose = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by \n\n
        const parts = buffer.split('\n\n');
        // Keep the last (possibly incomplete) chunk in the buffer
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          let event: { type: string; data?: MLSListing | MLSListing[] | PhotoRankResult[] | Record<string, unknown>; index?: number; text?: string; message?: string };
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === 'listings') {
            const payload = event.data;
            let listings: MLSListing[] = [];
            let searchParams: Partial<MLSSearchParams> | undefined;

            if (Array.isArray(payload)) {
              listings = payload as MLSListing[];
            } else if (payload && typeof payload === 'object') {
              const typedPayload = payload as { listings?: MLSListing[]; params?: Partial<MLSSearchParams> };
              if (Array.isArray(typedPayload.listings)) {
                listings = typedPayload.listings;
              }
              if (typedPayload.params && typeof typedPayload.params === 'object') {
                searchParams = typedPayload.params;
              }
            }

            if (listings.length > 0) lastListingsRef.current = listings;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], listings, searchParams };
              return updated;
            });
          } else if (event.type === 'listing_focus') {
            const listing = event.data as MLSListing;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], focusedListing: listing };
              return updated;
            });
          } else if (event.type === 'token') {
            prose += event.text ?? '';
            const snapshot = prose;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: snapshot,
              };
              return updated;
            });
          } else if (event.type === 'done') {
            const elapsed = (Date.now() - start) / 1000;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], elapsed };
              return updated;
            });
          } else if (event.type === 'photo_rank') {
            // Vision model finished scoring — reorder photos AND sort cards by best match.
            const ranks = (event.data as PhotoRankResult[]) ?? [];
            const rankMap = new Map(ranks.map((r) => [r.listingId, r]));
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (!last?.listings) return prev;
              const updatedListings = last.listings
                .map((l) => {
                  const rank = rankMap.get(l.id);
                  if (!rank) return l;
                  return { ...l, photos: rank.rankedPhotos, bestScore: rank.bestScore };
                })
                .sort((a, b) => (b.bestScore ?? 0) - (a.bestScore ?? 0));
              updated[updated.length - 1] = { ...last, listings: updatedListings };
              return updated;
            });
          } else if (event.type === 'debug') {
            // Score report for testing — visible in browser devtools Network tab
            console.log('[AI Debug]', event.data);
          } else if (event.type === 'error') {
            throw new Error(event.message ?? 'Unknown error');
          }
        }
      }
    } catch (err) {
      console.error('[AI] Stream error:', err);
      const elapsed = (Date.now() - start) / 1000;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          elapsed,
        };
        return updated;
      });
    } finally {
      setLoading(false);
      setStreamStartTime(null);
    }
  }, [input, loading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const loadHistoryPanel = useCallback(async () => {
    setShowHistory(true);
    if (conversations.length > 0) return; // already loaded
    setHistoryLoading(true);
    try {
      const userId = getUserId();
      const res = await fetch(`/api/ai-assistant/history?userId=${encodeURIComponent(userId)}&mode=conversations`);
      if (res.ok) {
        const data = await res.json() as { conversations?: ConversationMeta[] };
        if (Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      }
    } catch {}
    setHistoryLoading(false);
  }, [conversations.length]);

  const continueConversation = useCallback(async (convId: string) => {
    setShowHistory(false);
    setHistoryLoading(true);
    try {
      const userId = getUserId();
      const res = await fetch(`/api/ai-assistant/history?userId=${encodeURIComponent(userId)}&convId=${encodeURIComponent(convId)}`);
      if (res.ok) {
        const { messages: loaded } = await res.json() as { messages: Message[] };
        if (Array.isArray(loaded) && loaded.length > 0) {
          setMessages(loaded);
          lastListingsRef.current = [...loaded].reverse().find((m) => m.listings && m.listings.length > 0)?.listings ?? [];
          sessionStorage.setItem(CONV_ID_KEY, convId);
          setIsExpanded(true);
        }
      }
    } catch {}
    setHistoryLoading(false);
  }, []);

  const startNewConversation = useCallback(() => {
    sessionStorage.setItem(CONV_ID_KEY, uuidv4());
    setMessages([]);
    setConversations([]); // clear so history panel refetches next time
    lastListingsRef.current = [];
    try { sessionStorage.removeItem(CHAT_STATE_STORAGE_KEY); } catch {}
  }, []);

  const lastMsgIndex = messages.length - 1;

  return (
    <div className={`w-full mx-auto transition-all duration-500 ${isExpanded ? 'max-w-[860px] max-h-[880px]' : 'max-w-[680px] max-h-[160px]'}`}>

      {/* Chat messages + input panel */}
      {isExpanded && (
        <div className="relative rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex items-center gap-1">
              {/* Past chats button */}
              <button
                type="button"
                onClick={loadHistoryPanel}
                className="w-[32px] h-[32px] text-gray-400 hover:text-gray-600 flex items-center justify-center"
                aria-label="Past conversations"
                title="Past conversations"
              >
                <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                </svg>
              </button>
              {/* New chat button */}
              <button
                type="button"
                onClick={startNewConversation}
                className="w-[32px] h-[32px] text-gray-400 hover:text-gray-600 flex items-center justify-center"
                aria-label="New conversation"
                title="New conversation"
              >
                <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-[32px] h-[32px] text-gray-400 hover:text-gray-600 flex items-center justify-center"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>

          {/* Past conversations panel — overlays the messages area */}
          {showHistory && (
            <div className="absolute inset-0 bg-white z-30 flex flex-col rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Back</span>
                </button>
                <span className="ml-auto text-xs text-gray-400 font-medium tracking-wide uppercase">Past conversations</span>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 chat-scrollbar">
                {historyLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
                    <span className="w-3 h-3 border-2 border-gray-300 border-t-[#e8804c] rounded-full animate-spin" />
                    Loading…
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">No past conversations yet.</p>
                ) : conversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => continueConversation(conv.id)}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                  >
                    <p className="text-sm text-gray-800 truncate leading-snug font-medium group-hover:text-black">
                      {conv.preview}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {conv.timestamp ? sessionDateLabel(new Date(conv.timestamp).getTime()) : 'Earlier'} · {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={scrollContainerRef} className="h-[720px] overflow-y-auto px-4 pb-4 space-y-4 chat-scrollbar">
            {messages.map((m, i) => {
              const clean = cleanContent(m.content);
              const isUser = m.role === 'user';
              const isThinking = !isUser && !clean && !m.listings && loading && i === lastMsgIndex;
              const isStreaming = !isUser && loading && i === lastMsgIndex && (!!clean || !!m.listings);

              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                  {!isUser && (
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <AskAiIcon size={20} />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-w-[90%] min-w-0">
                    {/* Full listing grid — rendered on new searches */}
                  {m.listings && m.listings.length > 0 && (
                    <ListingsRow listings={m.listings} queryText={m.queryText} searchParams={m.searchParams} />
                  )}

                    {/* Single focused tile — rendered when user asks about a specific listing */}
                    {m.focusedListing && (
                      <div className="w-fit ring-2 ring-primary-main/40 rounded-2xl overflow-hidden">
                        <ListingTile listing={m.focusedListing} index={0} queryText={m.queryText} />
                      </div>
                    )}

                    {/* Prose summary — streams in after tiles */}
                  {!isUser && (
                      <div className={`text-sm leading-relaxed text-gray-900 text-left ${!clean && !isThinking ? 'hidden' : ''}`}>
                      {isThinking ? (
                        <span className="flex gap-0.5 items-center text-gray-400">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce delay-75">.</span>
                          <span className="animate-bounce delay-150">.</span>
                        </span>
                      ) : (
                        m.listings != null || m.focusedListing ? (
                          // PATH A: search results — markdown beside tile cards
                          <div className="text-sm leading-relaxed text-gray-700 text-left">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              }}
                            >
                              {clean || m.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          // PATH B: Q&A, profile reads, conversational — styled markdown
                          <div className="text-sm leading-relaxed text-gray-800">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <p className="font-semibold text-gray-900 mb-1">{children}</p>,
                                h2: ({ children }) => <p className="font-semibold text-gray-900 mb-1">{children}</p>,
                                h3: ({ children }) => <p className="font-semibold text-gray-900 mb-0.5">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="my-1 pl-4 space-y-0.5 list-disc marker:text-gray-300">{children}</ul>,
                                ol: ({ children }) => <ol className="my-1 pl-4 space-y-0.5 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-3 rounded-lg border border-gray-100">
                                    <table className="w-full text-sm border-collapse">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                                th: ({ children }) => (
                                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                                    {children}
                                  </th>
                                ),
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => <tr className="border-b border-gray-100 last:border-0">{children}</tr>,
                                td: ({ children }) => <td className="px-3 py-2 text-gray-800">{children}</td>,
                              }}
                            >
                              {clean || m.content}
                            </ReactMarkdown>
                          </div>
                        )
                      )}
                    </div>
                  )}

                    {/* User bubble */}
                    {isUser && (
                      <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-white text-gray-900 rounded-br-sm border border-gray-200 shadow-sm">
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    )}


                    {/* Elapsed timer */}
                    {!isUser && (
                      <div className="flex items-center gap-1 px-1">
                        {isStreaming && streamStartTime ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-main animate-pulse" />
                            <span className="text-[10px] text-gray-400">
                              {m.listings ? 'summarizing' : m.focusedListing ? 'analyzing' : 'thinking'}
                            </span>
                            <LiveTimer startTime={streamStartTime} />
                          </>
                        ) : isThinking && streamStartTime ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                            <span className="text-[10px] text-gray-400">thinking</span>
                            <LiveTimer startTime={streamStartTime} />
                          </>
                        ) : m.elapsed != null ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                            <span className="text-[10px] text-gray-400">{m.elapsed.toFixed(1)}s</span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-2 shadow-sm">
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                <AskAiIcon size={22} />
              </div>
              <textarea
                ref={textareaRef}
                className="flex-1 resize-none bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none min-h-[24px] max-h-[120px] overflow-y-auto leading-relaxed"
                placeholder="Ask anything about homes, neighborhoods, budgets…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-black text-white flex items-center justify-center disabled:opacity-100 disabled:bg-black hover:bg-black/90 transition-colors"
                aria-label="Send"
              >
                {loading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.75c.3 0 .58.12.79.33l5.5 5.5a1.125 1.125 0 1 1-1.59 1.59L13.125 8.6V19a1.125 1.125 0 1 1-2.25 0V8.6l-3.57 3.57a1.125 1.125 0 1 1-1.59-1.59l5.5-5.5c.21-.21.49-.33.79-.33Z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Snaphomz AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      )}

      {/* Suggestion chips */}
      {!isExpanded && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar (collapsed state) */}
      {!isExpanded && (
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-xl border border-gray-200">
          <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
            <AskAiIcon size={22} />
          </div>
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none min-h-[24px] max-h-[120px] overflow-y-auto leading-relaxed"
            placeholder="Find homes by address or ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-black text-white flex items-center justify-center disabled:opacity-100 disabled:bg-black hover:bg-black/90 transition-colors"
            aria-label="Send"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.75c.3 0 .58.12.79.33l5.5 5.5a1.125 1.125 0 1 1-1.59 1.59L13.125 8.6V19a1.125 1.125 0 1 1-2.25 0V8.6l-3.57 3.57a1.125 1.125 0 1 1-1.59-1.59l5.5-5.5c.21-.21.49-.33.79-.33Z" />
              </svg>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
