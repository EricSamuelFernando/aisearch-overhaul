'use client';

import { usePropertyStore } from '@/store/use-property-store';
import { MLSSearchParams } from '@/types/ai-assistant';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
type ListingsPayload = { params?: Partial<MLSSearchParams> };

interface UserIdentity {
  userId: string;
  email: string | null;
  name: string | null;
}

function getUserIdentity(): UserIdentity {
  if (typeof window === 'undefined') return { userId: 'anon', email: null, name: null };
  try {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      if (parsed?.id) {
        const firstName = parsed.firstname ?? parsed.firstName ?? '';
        const lastName = parsed.lastname ?? parsed.lastName ?? '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;
        return { userId: parsed.id, email: parsed.email ?? null, name: fullName };
      }
    }
  } catch {}

  let id = localStorage.getItem('snapz_ai_user_id');
  if (!id) {
    id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `anon-${Date.now()}`;
    localStorage.setItem('snapz_ai_user_id', id);
  }
  return { userId: id, email: null, name: null };
}

const toKeywordList = (raw?: string) =>
  String(raw ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

const uniqueKeywords = (items: string[]) => Array.from(new Set(items.map((k) => k.toLowerCase())));

const enrichAiParamsFromQuery = (
  aiParams: Partial<MLSSearchParams>,
  rawQuery: string,
): Partial<MLSSearchParams> => {
  const q = rawQuery.toLowerCase();
  const next: Partial<MLSSearchParams> = { ...aiParams };
  const existingKeywords = toKeywordList(aiParams.description_keywords as string | undefined);
  const inferredKeywords: string[] = [];

  if (/\b(big|large)\s+garden\b|\bgarden\b|\b(backyard|yard)\b/.test(q)) {
    inferredKeywords.push('big garden', 'large backyard', 'spacious yard');
    if (typeof next.lot_size_min !== 'number') next.lot_size_min = 7000;
  }
  if (/\bdining\b|\bdining room\b|\bdining table\b/.test(q)) {
    inferredKeywords.push('dining room', 'large dining table');
    if (!next.room_hint || next.room_hint === 'any') next.room_hint = 'dining_room';
  }
  if (/\bhardwood floors?\b|\bhardwood\b/.test(q)) {
    inferredKeywords.push('hardwood floors');
  }
  if (/\bnatural light\b|\bbright\b|\bbig windows?\b|\bwell lit\b/.test(q)) {
    inferredKeywords.push('natural light', 'large windows', 'bright interior');
  }

  const mergedKeywords = uniqueKeywords([...existingKeywords, ...inferredKeywords]);
  if (mergedKeywords.length > 0 && !next.description_keywords) {
    next.description_keywords = mergedKeywords.join(', ');
  } else if (mergedKeywords.length > 0) {
    next.description_keywords = mergedKeywords.join(', ');
  }

  if (!next.visual_query && inferredKeywords.length > 0) {
    next.visual_query = mergedKeywords.join(', ');
  }

  return next;
};

export default function BrowseAIChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: "I'm your AI listing assistant. Ask about homes, neighborhoods, budget, or features and I'll refine results.",
    },
  ]);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { clearProperties, setIsLoading } = usePropertyStore();

  const rawQ = searchParams.get('q') || '';
  const browseCity = rawQ.split(',')[0]?.trim() || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const applySearchParams = useCallback((aiParams: Partial<MLSSearchParams>, fallbackQuery: string) => {
    const enrichedParams = enrichAiParamsFromQuery(aiParams, fallbackQuery);
    const params = new URLSearchParams(searchParams.toString());
    const city = (enrichedParams.city ?? '').trim();
    const state = (enrichedParams.state ?? '').trim().toUpperCase();
    const zip = (enrichedParams.zip ?? '').trim();
    const county = (enrichedParams.county ?? '').trim();
    const nextQ = city && state ? `${city}, ${state}` : city || zip || county || fallbackQuery;
    if (nextQ) params.set('q', nextQ);

    const setOrDelete = (key: string, value: unknown) => {
      if (value === null || value === undefined || value === '') params.delete(key);
      else params.set(key, String(value));
    };

    setOrDelete('bedRooms', enrichedParams.bedrooms_min ?? enrichedParams.bedrooms_max);
    setOrDelete('bathRooms', enrichedParams.bathrooms_min ?? enrichedParams.bathrooms_max);
    setOrDelete('priceMin', enrichedParams.listing_price_min);
    setOrDelete('priceMax', enrichedParams.listing_price_max);
    setOrDelete(
      'propertyType',
      enrichedParams.property_sub_type ?? enrichedParams.listing_property_type ?? enrichedParams.property_type,
    );
    setOrDelete('hasPool', enrichedParams.has_pool === true ? 1 : undefined);
    setOrDelete('latestOnly', enrichedParams.latest_only === true ? 1 : undefined);
    params.set('aiParams', encodeURIComponent(JSON.stringify(enrichedParams)));

    clearProperties();
    setIsLoading(true);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, clearProperties, setIsLoading, router]);

  async function send() {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: query };
    const assistantId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, ...getUserIdentity() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let prose = '';
      let paramsApplied = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          let event: { type: string; data?: any; text?: string; message?: string };
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === 'listings') {
            const payload = event.data;
            if (payload && !Array.isArray(payload) && typeof payload === 'object' && !paramsApplied) {
              const aiParams = (payload as ListingsPayload).params;
              if (aiParams) {
                applySearchParams(aiParams, query);
                paramsApplied = true;
              }
            }
          } else if (event.type === 'token') {
            prose += event.text ?? '';
            const snapshot = prose;
            setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: snapshot } : m)));
          } else if (event.type === 'error') {
            throw new Error(event.message ?? 'Unknown error');
          }
        }
      }

      setMessages(prev =>
        prev.map(m => (m.id === assistantId && !m.content.trim() ? { ...m, content: 'Done.' } : m)),
      );
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('[BrowseAIChat] error:', err);
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, content: 'Something went wrong. Please try again.' } : m)),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      ref={containerRef}
      className={[
        'fixed z-50 bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 md:bottom-6',
        isOpen ? 'w-[calc(100vw-24px)] max-w-[440px]' : 'w-auto',
      ].join(' ')}
    >
      {isOpen ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_18px_52px_rgba(0,0,0,0.17)] overflow-hidden">
          <div className="h-11 border-b border-gray-100 px-4 flex items-center justify-end">
            <button
              type="button"
              aria-label="Close chat panel"
              className="h-6 w-6 p-0 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <span className="block text-xs leading-none select-none">&times;</span>
            </button>
          </div>
          <div className="max-h-[320px] min-h-[210px] overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              (msg.role === 'assistant' && !msg.content.trim()) ? null : (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="shrink-0 mt-0.5"><AskAiIcon size={20} /></div>}
                <div
                  className={[
                    'max-w-[86%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-gray-950 text-white rounded-tr-sm'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm',
                  ].join(' ')}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
              )
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="shrink-0 mt-0.5"><AskAiIcon size={20} /></div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <span className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center bg-white border-t border-gray-100 px-3 py-2.5">
            <div className="shrink-0 mr-2">
              <AskAiIcon size={24} />
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={browseCity ? `Ask about listings in ${browseCity}...` : 'Ask about these listings...'}
              disabled={loading}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 !bg-white outline-none disabled:opacity-50 min-w-0"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="shrink-0 w-[34px] h-[34px] min-w-[34px] min-h-[34px] aspect-square rounded-full bg-orange-500 flex items-center justify-center p-0 disabled:opacity-40 hover:bg-orange-600 active:scale-90 transition-all ml-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="white" className="w-[18px] h-[18px] block">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI search chat"
          className="h-[58px] w-[58px] rounded-full border border-gray-200 bg-white shadow-[0_18px_52px_rgba(0,0,0,0.17)] flex items-center justify-center hover:shadow-[0_22px_58px_rgba(0,0,0,0.2)]"
        >
          <AskAiIcon size={34} />
        </button>
      )}
    </div>
  );
}
