'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

interface HistoryMeta {
  totalItems?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const SearchHistorySection = () => {
  const userData = useSelector((state: any) => state.auth.user);
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyMeta, setHistoryMeta] = useState<HistoryMeta>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || '';

  useEffect(() => {
    if (!userData?.id) return;
    const controller = new AbortController();

    const loadSearchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const params = new URLSearchParams({
          user_id: String(userData.id),
          page: String(historyPage),
          per_page: String(historyPerPage),
        });
        const base = AI_BASE_URL.replace(/\/$/, '');
        const response = await fetch(`${base}/api/search_history?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to load search history');
        }
        const json = await response.json();
        const items =
          json?.history ||
          json?.data ||
          json?.items ||
          json?.results ||
          (Array.isArray(json) ? json : []);
        const totalPages =
          json?.pagination?.total_pages ||
          json?.total_pages ||
          (json?.total && historyPerPage
            ? Math.max(1, Math.ceil(Number(json.total) / historyPerPage))
            : 1);
        setSearchHistory(items);
        setHistoryTotalPages(totalPages);
        setHistoryMeta({
          totalItems: json?.pagination?.total_items ?? json?.total,
          hasNext: json?.pagination?.has_next_page,
          hasPrev: json?.pagination?.has_previous_page,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setHistoryError(err?.message || 'Failed to load search history');
          setSearchHistory([]);
        }
      } finally {
        setHistoryLoading(false);
      }
    };

    loadSearchHistory();
    return () => controller.abort();
  }, [userData?.id, historyPage, historyPerPage, AI_BASE_URL]);

  const dedupedHistory = useMemo(() => {
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const item of searchHistory) {
      const natural = item?.natural_query || item?.query || item?.search || '';
      const createdAt = item?.timestamp || item?.created_at || item?.createdAt || '';
      const key = `${natural}__${createdAt}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }
    return unique;
  }, [searchHistory]);

  return (
    <div className='py-4'>
      {historyLoading ? (
        <p className='text-sm text-gray-500'>Loading search history...</p>
      ) : historyError ? (
        <p className='text-sm text-red-600'>{historyError}</p>
      ) : dedupedHistory.length === 0 ? (
        <p className='text-sm text-gray-500'>No search history found.</p>
      ) : (
        <div className='space-y-4'>
          <div className='hidden grid-cols-12 gap-3 rounded-lg bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500 md:grid'>
            <div className='col-span-4'>Search</div>
            <div className='col-span-4'>Location</div>
            <div className='col-span-2'>Photos</div>
            <div className='col-span-2'>Date</div>
          </div>

          <div className='grid grid-cols-1 gap-3'>
            {dedupedHistory.map((item, idx) => {
              const natural = item?.natural_query || item?.query || item?.search || '';
              const searchQuery = item?.search_query || {};
              const location = [searchQuery?.address, searchQuery?.city, searchQuery?.state]
                .filter(Boolean)
                .join(', ');
              const photos = searchQuery?.include_photos ? 'Yes' : 'No';
              const size = searchQuery?.size ? `Size ${searchQuery.size}` : '';
              const createdAt = item?.timestamp || item?.created_at || item?.createdAt || '';
              const label = natural || location || `Search ${idx + 1}`;
              const targetQuery = natural || location || '';
              const targetUrl = targetQuery
                ? `/buy/browse?q=${encodeURIComponent(targetQuery)}`
                : '/buy/browse';

              return (
                <button
                  type='button'
                  key={item?.id || `${idx}-${label}`}
                  onClick={() => router.push(targetUrl)}
                  className='rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-gray-300 hover:bg-gray-50'
                  aria-label={`Open results for ${label}`}
                >
                  <div className='grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3'>
                    <div className='md:col-span-4'>
                      <p className='text-sm font-semibold text-black'>{label}</p>
                      {/* {size ? <p className='text-xs text-gray-500'>{size}</p> : null} */}
                    </div>
                    <div className='md:col-span-4'>
                      <p className='text-sm text-gray-800'>{location || 'N/A'}</p>
                    </div>
                    <div className='md:col-span-2'>
                      <p className='text-sm text-gray-800'>{photos}</p>
                    </div>
                    <div className='md:col-span-2'>
                      <p className='text-sm text-gray-800'>
                        {createdAt ? formatTimestamp(createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {historyTotalPages > 1 && (
            <div className='flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between'>
              <button
                className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage === 1 || historyMeta.hasPrev === false}
              >
                Previous
              </button>
              <p className='text-sm text-gray-600'>
                Page {historyPage} of {historyTotalPages}
                {historyMeta.totalItems ? ` - ${historyMeta.totalItems} total` : ''}
              </p>
              <button
                className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                disabled={historyPage >= historyTotalPages || historyMeta.hasNext === false}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchHistorySection;
