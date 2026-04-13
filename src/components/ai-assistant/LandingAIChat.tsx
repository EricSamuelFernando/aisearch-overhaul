'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { MLSListing } from '@/types/ai-assistant';
import ListingTile from './ListingTile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  listings?: MLSListing[];
  focusedListing?: MLSListing;
  elapsed?: number;
}

function cleanContent(text: string): string {
  return text.replace(/```mls_search[\s\S]*?```/g, '').trim();
}

function getUserId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem('snapz_ai_user_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('snapz_ai_user_id', id);
  }
  return id;
}

const SUGGESTIONS = [
  '3 bed under $500k in Austin with a pool',
  'Condos in Miami under $400k',
  'Show me 4 bed homes in Dallas under $700k',
];

function LiveTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startTime) / 1000), 100);
    return () => clearInterval(id);
  }, [startTime]);
  return <span className="text-[10px] text-white/40 ml-1">{elapsed.toFixed(1)}s</span>;
}

export default function LandingAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Persist last fetched listings so follow-up responses can re-attach them
  const lastListingsRef = useRef<MLSListing[]>([]);


  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setInput('');
    setIsExpanded(true);
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setLoading(true);
    // Placeholder assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    const start = Date.now();
    setStreamStartTime(start);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, userId: getUserId() }),
      });

      if (!res.ok || !res.body) throw new Error(`Error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let prose = '';
      let receivedListings = false;

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
          let event: { type: string; data?: MLSListing | MLSListing[]; index?: number; text?: string; message?: string };
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          if (event.type === 'listings') {
            const listings = (event.data as MLSListing[]) ?? [];
            receivedListings = true;
            if (listings.length > 0) lastListingsRef.current = listings;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], listings };
              return updated;
            });
          } else if (event.type === 'listing_focus') {
            const listing = event.data as MLSListing;
            receivedListings = true;
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

  const lastMsgIndex = messages.length - 1;

  return (
    <div className={`w-full max-w-[680px] mx-auto transition-all duration-500 ${isExpanded ? 'max-h-[800px]' : 'max-h-[160px]'}`}>

      {/* Chat messages */}
      {isExpanded && (
        <div ref={scrollContainerRef} className="h-[660px] overflow-y-auto mb-3 rounded-2xl bg-[#1a0800] border border-white/10 p-4 space-y-4 scrollbar-hide">
          {messages.map((m, i) => {
            const clean = cleanContent(m.content);
            const isUser = m.role === 'user';
            const isThinking = !isUser && !clean && !m.listings && loading && i === lastMsgIndex;
            const isStreaming = !isUser && loading && i === lastMsgIndex && (!!clean || !!m.listings);

            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-[#e8804c] flex-shrink-0 flex items-center justify-center text-white text-[10px] mt-0.5">
                    ✦
                  </div>
                )}

                <div className="flex flex-col gap-2 max-w-[90%] min-w-0">
                  {/* Full listing grid — rendered on new searches */}
                  {m.listings && m.listings.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                      {m.listings.map((listing, idx) => (
                        <ListingTile key={listing.id || idx} listing={listing} index={idx} />
                      ))}
                    </div>
                  )}

                  {/* Single focused tile — rendered when user asks about a specific listing */}
                  {m.focusedListing && (
                    <div className="w-fit ring-2 ring-[#e8804c]/60 rounded-2xl overflow-hidden">
                      <ListingTile listing={m.focusedListing} index={0} />
                    </div>
                  )}

                  {/* Prose summary — streams in after tiles */}
                  {!isUser && (
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-[#2d1400] text-white rounded-bl-sm border border-white/10 ${!clean && !isThinking ? 'hidden' : ''}`}>
                      {isThinking ? (
                        <span className="flex gap-0.5 items-center opacity-60">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce delay-75">.</span>
                          <span className="animate-bounce delay-150">.</span>
                        </span>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {clean || m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User bubble */}
                  {isUser && (
                    <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-[#e8804c] text-white rounded-br-sm">
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  )}

                  {/* Elapsed timer */}
                  {!isUser && (
                    <div className="flex items-center gap-1 px-1">
                      {isStreaming && streamStartTime ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e8804c] animate-pulse" />
                          <span className="text-[10px] text-white/40">
                            {m.listings ? 'summarizing' : m.focusedListing ? 'analyzing' : 'thinking'}
                          </span>
                          <LiveTimer startTime={streamStartTime} />
                        </>
                      ) : isThinking && streamStartTime ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                          <span className="text-[10px] text-white/40">thinking</span>
                          <LiveTimer startTime={streamStartTime} />
                        </>
                      ) : m.elapsed != null ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                          <span className="text-[10px] text-white/40">{m.elapsed.toFixed(1)}s</span>
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
      )}

      {/* Suggestion chips */}
      {!isExpanded && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 bg-white rounded-2xl px-4 py-3 shadow-xl">
        <div className="w-7 h-7 rounded-full bg-[#1a0900] flex-shrink-0 flex items-center justify-center mb-0.5">
          <span className="text-white text-xs">✦</span>
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
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#e8804c] text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors mb-0.5"
          aria-label="Send"
        >
          {loading ? (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-white/40 mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
