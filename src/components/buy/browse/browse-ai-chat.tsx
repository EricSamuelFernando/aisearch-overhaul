'use client';

import { usePropertyStore } from '@/store/use-property-store';
import { useAppDispatch } from '@/lib/hook';
import { setPropertyView } from '@/slices/property/property-slice';
import { useProperty } from '@/shared/hooks/useProperty';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function AskAiIcon({ size = 31 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z" fill="black" stroke="url(#baiGrad)" strokeWidth="2" />
      <mask id="baiM1" fill="white">
        <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
      </mask>
      <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" fill="white" stroke="white" strokeWidth="4" mask="url(#baiM1)" />
      <mask id="baiM2" fill="white">
        <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
      </mask>
      <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" fill="white" stroke="white" strokeWidth="4" mask="url(#baiM2)" />
      <defs>
        <linearGradient id="baiGrad" x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8804C" />
          <stop offset="0.5" stopColor="#E84C85" />
          <stop offset="0.75" stopColor="#A64EBA" />
          <stop offset="1" stopColor="#654FEF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

interface BrowseAIDelta {
  city: string | null;
  state: string | null;
  beds: number | null;
  baths: number | null;
  priceMin: number | null;
  priceMax: number | null;
  propertyType: string | null;
  subcategories_add: string[];
  subcategories_remove: string[];
  clear_filters: boolean;
  map_overlay: string | null;      // "schools" | "none" | null
  poi_add: string[];               // restaurants | gyms | hospitals | parks
  poi_remove: string[];
  view_mode: string | null;        // "map" | "grid" | null
  compare_mode: boolean | null;
  clear_draw: boolean;
  reply: string;
}

export default function BrowseAIChat() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentView } = useProperty();
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Current URL state — source of truth for what's on screen
  const searchParams = useSearchParams();
  const rawQ = searchParams.get('q') || '';
  const urlParts = rawQ.split(',').map(s => s.trim());
  const browseCity = urlParts[0] || null;
  const stateCandidate = urlParts[1]?.toUpperCase();
  const browseState = stateCandidate && /^[A-Z]{2}$/.test(stateCandidate) ? stateCandidate : null;

  const {
    allProperties,
    setIsLoading,
    clearProperties,
    selectedSubCategories,
    toggleSubCategory,
    setSelectedSubCategories,
    mapOverlay,
    setMapOverlay,
    activePOICategories,
    setActivePOICategories,
    isCompareMode,
    setCompareMode,
    incrementClearDrawSignal,
    setDrawFilteredPropertyIds,
  } = usePropertyStore();

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (expanded) setTimeout(() => inputRef.current?.focus(), 180);
  }, [expanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (loading) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [loading]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  function buildContext() {
    const beds = searchParams.get('bedRooms') ? Number(searchParams.get('bedRooms')) : null;
    const baths = searchParams.get('bathRooms') ? Number(searchParams.get('bathRooms')) : null;
    const priceMin = searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : null;
    const priceMax = searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : null;
    const propertyType = searchParams.get('propertyType') || null;

    // Top 10 visible listings for Q&A context
    const topProperties = allProperties.slice(0, 10).map((p: any) => {
      const d = p.data || p;
      const listing = d.listing || d;
      const addr = listing?.address?.unparsedAddress || d.address || '';
      const price = listing?.listPriceLow ?? listing?.listPrice ?? listing?.ListPrice ?? d.price ?? 0;
      const beds = d.beds ?? listing?.property?.bedroomsTotal ?? 0;
      const baths = d.baths ?? listing?.property?.bathroomsTotal ?? 0;
      return { address: addr, price: Number(price) || 0, beds: Number(beds) || 0, baths: Number(baths) || 0 };
    });

    return {
      city: browseCity,
      state: browseState,
      beds,
      baths,
      priceMin,
      priceMax,
      propertyType,
      activeSubCategories: selectedSubCategories,
      mapOverlay: mapOverlay || 'none',
      currentView: currentView || 'map',
      isCompareMode: isCompareMode || false,
      resultCount: allProperties.length,
      topProperties,
    };
  }

  function applyDelta(delta: BrowseAIDelta) {
    const params = new URLSearchParams(searchParams.toString());

    // Clear all non-location filters
    if (delta.clear_filters) {
      params.delete('bedRooms');
      params.delete('bathRooms');
      params.delete('priceMin');
      params.delete('priceMax');
      params.delete('propertyType');
      setSelectedSubCategories([]);
    }

    // Location change — update ?q= param and clear stale cards immediately
    if (delta.city) {
      const newQ = delta.state ? `${delta.city}, ${delta.state}` : delta.city;
      params.set('q', newQ);
      clearProperties();
    }

    // Numeric filters — null = no change, 0 = delete, positive = set
    if (delta.beds !== null) {
      delta.beds === 0 ? params.delete('bedRooms') : params.set('bedRooms', String(delta.beds));
    }
    if (delta.baths !== null) {
      delta.baths === 0 ? params.delete('bathRooms') : params.set('bathRooms', String(delta.baths));
    }
    if (delta.priceMin !== null) {
      delta.priceMin === 0 ? params.delete('priceMin') : params.set('priceMin', String(delta.priceMin));
    }
    if (delta.priceMax !== null) {
      delta.priceMax === 0 ? params.delete('priceMax') : params.set('priceMax', String(delta.priceMax));
    }
    if (delta.propertyType !== null) {
      delta.propertyType === '' ? params.delete('propertyType') : params.set('propertyType', delta.propertyType);
    }

    // Subcategory toggles (client-side feature filter on loaded results)
    delta.subcategories_add?.forEach(sc => {
      if (!selectedSubCategories.includes(sc)) toggleSubCategory(sc);
    });
    delta.subcategories_remove?.forEach(sc => {
      if (selectedSubCategories.includes(sc)) toggleSubCategory(sc);
    });

    // POI category toggles (restaurants, gyms, hospitals, parks)
    if ((delta.poi_add?.length ?? 0) > 0 || (delta.poi_remove?.length ?? 0) > 0) {
      let next = [...activePOICategories];
      delta.poi_add?.forEach(k => { if (!next.includes(k)) next.push(k); });
      delta.poi_remove?.forEach(k => { next = next.filter(x => x !== k); });
      setActivePOICategories(next);
    }

    // Map overlay (schools district layer)
    if (delta.map_overlay !== null && delta.map_overlay !== undefined) {
      const overlay = delta.map_overlay === 'schools' ? 'schools' : 'none';
      setMapOverlay(overlay);
    }

    // View mode (map / grid)
    if (delta.view_mode === 'map' || delta.view_mode === 'grid') {
      dispatch(setPropertyView(delta.view_mode));
    }

    // Compare mode
    if (delta.compare_mode !== null && delta.compare_mode !== undefined) {
      setCompareMode(delta.compare_mode);
    }

    // Clear drawn polygon
    if (delta.clear_draw) {
      setDrawFilteredPropertyIds(null);
      incrementClearDrawSignal();
    }

    // Push URL change — property-info.tsx useEffect detects this and fires sendSearchRequest()
    const hasUrlChange =
      delta.city ||
      delta.beds !== null ||
      delta.baths !== null ||
      delta.priceMin !== null ||
      delta.priceMax !== null ||
      delta.propertyType !== null ||
      delta.clear_filters;

    if (hasUrlChange) {
      setIsLoading(true);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }

  function clearChat() {
    setMessages([]);
  }

  async function send() {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setExpanded(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const context = buildContext();
      // Last 6 messages = last 3 conversation turns
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/browse-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, context, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const delta: BrowseAIDelta = await res.json();

      applyDelta(delta);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: delta.reply || 'Done.',
      }]);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('[BrowseAIChat] error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); send(); }
    if (e.key === 'Escape') { setExpanded(false); }
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3"
    >
      {/* ── Floating chat history ─────────────────────────────────────────── */}
      {hasMessages && (
        <div className="w-[440px] bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.16)] border border-gray-100 overflow-hidden">
          <div className="max-h-[320px] overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="shrink-0 mt-0.5"><AskAiIcon size={20} /></div>}
                <div className={[
                  'max-w-[86%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-gray-950 text-white rounded-tr-sm'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm',
                ].join(' ')}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="shrink-0 mt-0.5"><AskAiIcon size={20} /></div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <span className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
            <button
              onClick={clearChat}
              className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
            >
              Clear chat
            </button>
          </div>
        </div>
      )}

      {/* ── Expanding pill ─────────────────────────────────────────────────── */}
      <div
        className={[
          'flex items-center bg-white rounded-full border border-gray-200',
          'transition-all duration-300 ease-out overflow-hidden',
          expanded
            ? 'w-[440px] pl-3 pr-2.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.14)]'
            : 'w-[58px] h-[58px] justify-center cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.20)]',
          !expanded && hasMessages && !loading ? 'browse-ai-active-glow' : 'shadow-[0_8px_32px_rgba(0,0,0,0.14)]',
        ].join(' ')}
        onClick={() => !expanded && setExpanded(true)}
      >
        <button
          className={`flex items-center justify-center transition-all duration-200 hover:scale-105 relative${expanded ? ' shrink-0' : ' w-full h-full'}`}
          style={expanded ? { marginRight: '8px' } : undefined}
          onClick={e => { if (expanded) { e.stopPropagation(); setExpanded(false); } }}
          aria-label="Toggle AI search"
        >
          <AskAiIcon size={expanded ? 28 : 38} />
          {loading && !expanded && (
            <span className="absolute inset-0 rounded-full animate-ping bg-orange-400 opacity-30" />
          )}
        </button>

        {expanded && (
          <>
            <span className="w-px h-5 bg-gray-200 shrink-0 mr-3" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={browseCity ? `Ask about listings in ${browseCity}…` : 'Ask about these listings…'}
              disabled={loading}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50 min-w-0"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="shrink-0 w-[34px] h-[34px] min-w-[34px] min-h-[34px] aspect-square rounded-full bg-orange-500 flex items-center justify-center p-0 disabled:opacity-40 hover:bg-orange-600 active:scale-90 transition-all ml-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="white" className="w-[18px] h-[18px] block" style={{ transform: 'rotate(-45deg)' }}>
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
