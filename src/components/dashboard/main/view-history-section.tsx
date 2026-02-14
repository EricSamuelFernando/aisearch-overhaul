'use client';

import { useMemo, useState } from 'react';
import { useGetViewHistory, ViewHistoryItem } from '@/hooks/api/auth/useViewHistory';
import PropertyCards from '@/components/buy/browse/property-card';
import { useAuth } from '@/shared/hooks/useAuth';

const buildListing = (item: ViewHistoryItem) => {
  const price = item?.price
    ? Number(String(item.price).replace(/[^0-9.]/g, ''))
    : undefined;
  const numericPrice =
    typeof price === 'number' && Number.isFinite(price) && price > 0 ? price : undefined;

  return {
    listingId: item?.listingId ? Number(item.listingId) : undefined,
    listPriceLow: numericPrice,
    address: {
      unparsedAddress: item?.propertyAddress ?? '',
      city: item?.city ?? '',
      stateOrProvince: item?.state ?? '',
      zipCode: '',
    },
    media: {
      primaryListingImageUrl: item?.propertyImage ?? null,
      photosList: [],
    },
    property: {
      propertyType: item?.propertyType,
      bedroomsTotal: item?.bedroomsTotal,
      bathroomsTotal: item?.bathroomsTotal,
      livingArea: item?.livingArea,
    },
  };
};

const ViewHistorySection = () => {
  const [page, setPage] = useState(1);
  const perPage = 12;
  const { user } = useAuth();
  const { getViewHistory } = useGetViewHistory(page, perPage);
  const { data, isLoading, error } = getViewHistory;

  const items = useMemo(() => {
    const raw = data?.items ?? [];
    const filtered = user?.id
      ? raw.filter((item) => item.userId === user.id || item.userId === 'local')
      : raw;
    // Dedup by listingId/propertyId, keep most recent viewedAt
    const dedup = new Map<string, any>();
    filtered.forEach((item) => {
      const key = item.listingId || item.propertyId || item.id;
      if (!key) return;
      const existing = dedup.get(key);
      const currentTs = new Date(item.viewedAt || 0).getTime();
      const existingTs = existing ? new Date(existing.viewedAt || 0).getTime() : -Infinity;
      if (!existing || currentTs > existingTs) {
        dedup.set(key, item);
      }
    });
    return Array.from(dedup.values()).sort(
      (a, b) => new Date(b.viewedAt || 0).getTime() - new Date(a.viewedAt || 0).getTime(),
    );
  }, [data, user?.id]);
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return <p className='text-sm text-gray-500'>Loading view history...</p>;
  }

  if (error) {
    return (
      <p className='text-sm text-red-600'>
        {(error as Error)?.message || 'Failed to load view history.'}
      </p>
    );
  }

  if (!items.length) {
    return <p className='text-sm text-gray-500'>No view history found.</p>;
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {items.map((item) => {
          const listingId = item?.listingId || item?.propertyId;
          const listing = buildListing(item);

          return (
            <div key={item.id}>
              <PropertyCards
                listing={listing}
                listingId={listingId}
                id={item.id}
                propertyId={item?.propertyId}
              />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className='flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between'>
          <button
            className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <p className='text-sm text-gray-600'>
            Page {page} of {totalPages}
          </p>
          <button
            className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewHistorySection;
