'use client';
import { useState, useCallback, useRef } from 'react';
import type { GeoLocation } from './useGeolocation';

const CLIENT_SESSION_KEY = 'snaphomz:suggestions:v2';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min — matches server-side Redis TTL

interface SuggestionsCache {
  suggestions: string[];
  cacheKey: string;
  ts: number;
}

function buildCacheKey(
  userId?: string | null,
  tempUserId?: string | null,
  location?: GeoLocation | null
): string {
  const uid = userId || tempUserId || 'anon';
  const isUS = location?.countryCode === 'US';
  const loc = isUS && location?.city
    ? `${location.city}-${location.state || ''}`.toLowerCase().replace(/\s+/g, '-')
    : 'generic';
  return `${uid}:${loc}`;
}

function readCache(key: string): string[] | null {
  try {
    const raw = sessionStorage.getItem(CLIENT_SESSION_KEY);
    if (!raw) return null;
    const cache: SuggestionsCache = JSON.parse(raw);
    if (cache.cacheKey === key && Date.now() - cache.ts < CACHE_TTL_MS) {
      return cache.suggestions;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeCache(key: string, suggestions: string[]): void {
  try {
    const cache: SuggestionsCache = { suggestions, cacheKey: key, ts: Date.now() };
    sessionStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(cache));
  } catch {
    // storage quota — ignore
  }
}

/**
 * Fetches and caches personalized search suggestions.
 *
 * Usage:
 *   const { suggestions, loading, fetch: fetchSuggestions, clearCache } = useSuggestions();
 *
 * Call fetchSuggestions(userId, tempUserId, location) lazily — on search bar focus.
 * Call clearCache() after user submits a query so next session re-generates fresh suggestions.
 */
export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(
    async (
      userId?: string | null,
      tempUserId?: string | null,
      location?: GeoLocation | null
    ) => {
      const cacheKey = buildCacheKey(userId, tempUserId, location);

      // Serve from client cache if fresh
      const cached = readCache(cacheKey);
      if (cached) {
        setSuggestions(cached);
        return;
      }

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || null,
            tempUserId: tempUserId || null,
            location: location || null,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          writeCache(cacheKey, data.suggestions);
        }
      } catch (err: unknown) {
        // AbortError is expected on cleanup — ignore silently
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn('[useSuggestions] fetch failed:', err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Call after user submits a query so next focus re-generates fresh suggestions
   * reflecting the new conversation context.
   */
  const clearCache = useCallback(() => {
    try {
      sessionStorage.removeItem(CLIENT_SESSION_KEY);
    } catch {
      // ignore
    }
    setSuggestions([]);
  }, []);

  return { suggestions, loading, fetch: fetchSuggestions, clearCache };
}
