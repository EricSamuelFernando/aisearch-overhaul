import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { fetchHistory } from '@/lib/api';

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

  useEffect(() => {
    if (!userData?.id) return;

    const controller = new AbortController();

    const loadSearchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const json = await fetchHistory(userData.id, historyPage, historyPerPage, undefined, controller.signal);
        
        const rawItems =
          json?.history ||
          json?.results ||
          (Array.isArray(json?.data) ? json.data : json?.data?.history || json?.data?.results || null) ||
          json?.items ||
          (Array.isArray(json) ? json : []);
        
        const items = Array.isArray(rawItems) ? rawItems : [];
        const pagination = json?.pagination || json?.data?.pagination;
        const total = pagination?.total_items ?? json?.total ?? json?.total_items ?? 0;
        
        const totalPages =
          pagination?.total_pages ||
          json?.total_pages ||
          (total && historyPerPage
            ? Math.max(1, Math.ceil(Number(total) / historyPerPage))
            : 1);

        if (!controller.signal.aborted) {
          setSearchHistory(items);
          setHistoryTotalPages(totalPages);
          setHistoryMeta({
            totalItems: total,
            hasNext: pagination?.has_next_page ?? json?.has_next_page,
            hasPrev: pagination?.has_previous_page ?? json?.has_previous_page,
          });
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError' && !controller.signal.aborted) {
          setHistoryError(err?.message || 'Failed to load search history');
          setSearchHistory([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setHistoryLoading(false);
        }
      }
    };

    loadSearchHistory();
    
    return () => {
      controller.abort();
    };
  }, [userData?.id, historyPage, historyPerPage]);

  const dedupedHistory = useMemo(() => {
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const item of searchHistory) {
      const natural = item?.query || item?.natural_query || item?.search || '';
      const createdAt = item?.created_at || item?.timestamp || item?.createdAt || '';
      const id = item?.id || '';
      const key = id || `${natural}__${createdAt}`;
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
            <div className='col-span-12 md:col-span-8'>Search Query</div>
            <div className='col-span-12 md:col-span-4'>Date</div>
          </div>

          <div className='grid grid-cols-1 gap-3'>
            {dedupedHistory.map((item, idx) => {
              const queryStr = item?.query || item?.natural_query || item?.search || '';
              const searchQuery = item?.search_query || {};
              
              // Fallback to query string if location details are missing
              const location = [searchQuery?.address, searchQuery?.city, searchQuery?.state]
                .filter(Boolean)
                .join(', ');
                
              const createdAt = item?.created_at || item?.timestamp || item?.createdAt || '';
              const label = queryStr || location || `Search ${idx + 1}`;
              
              const targetUrl = queryStr
                ? `/buy/browse?q=${encodeURIComponent(queryStr)}`
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
                    <div className='md:col-span-8'>
                      <p className='text-sm font-semibold text-black'>{label}</p>
                      {location && location !== queryStr && (
                        <p className='text-xs text-gray-500'>{location}</p>
                      )}
                    </div>
                    <div className='md:col-span-4'>
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

