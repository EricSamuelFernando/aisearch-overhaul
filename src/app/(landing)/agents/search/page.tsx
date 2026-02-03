'use client';

import React, {
  useState,
  useEffect,
  memo,
  useMemo,
  useDeferredValue,
  useRef,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import MainNavPages from '@/components/navbars/main-nav-pages';
import { Agent } from '@/types/agent.types';
import { isValid } from '@/lib/utils';

type SearchMode = 'location' | 'name';

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US');
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const asPositiveNumber = (value: any): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
};

const asNonNegativeNumber = (value: any): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
};

// Supports decimals for values like $3.2M
function formatMillions(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  const n = Number(value);
  if (!Number.isFinite(n)) return 'N/A';
  const millions = n / 1_000_000;
  return `$${+millions.toFixed(2)}M`;
}

function normalizeLocationQuery(raw: string): string {
  const base = raw.trim().toLowerCase().replace(/\./g, '');

  const map: Record<string, string> = {
    la: 'la',
    'los angeles': 'la',
    'los angeles, ca': 'la',
    sf: 'sf',
    'san francisco': 'sf',
    'san francisco, ca': 'sf',
    sd: 'sd',
    'san diego': 'sd',
    'san diego, ca': 'sd',
    sj: 'sj',
    'san jose': 'sj',
    'san jose, ca': 'sj',
    aus: 'austin',
    austin: 'austin',
    'austin, tx': 'austin',
    hou: 'houston',
    houston: 'houston',
    'houston, tx': 'houston',
  };

  return map[base] ?? base;
}

function agentMatchesLocation(agent: Agent, rawQuery: string): boolean {
  const q = normalizeLocationQuery(rawQuery);
  if (!q) return true;

  const anyAgent = agent as any;
  const locationRaw =
    (anyAgent.Location ??
      anyAgent.location ??
      anyAgent.market ??
      anyAgent.city ??
      '') as string;

  if (!locationRaw) return false;

  const loc = locationRaw.toLowerCase().replace(/\./g, '').trim();

  if (['la', 'sf', 'sd', 'sj'].includes(q)) {
    return loc.startsWith(q);
  }

  return loc.includes(q);
}

const AgentsGrid = memo(function AgentsGrid({
  agents,
}: {
  agents: Agent[] | null;
}) {
  // Treat 0 as valid (important for For Sale Count / Recently Sold Count)
  const isPresent = (v: any) =>
    v !== null &&
    v !== undefined &&
    v !== '' &&
    v !== 'N/A' &&
    !(typeof v === 'number' && Number.isNaN(v));

  // Works for both styles of keys: camelCase + spaced CSV headers
  const getAny = (obj: any, keys: string[]) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (isPresent(v) || v === 0) return v;
    }
    return null;
  };

  const pickMetric = (
    agent: any,
    priorities: { field: string; format?: (value: any) => string }[]
  ): string | null => {
    for (const priority of priorities) {
      const raw = agent?.[priority.field];
      if (isPresent(raw) || raw === 0) {
        if (priority.format) return priority.format(raw);
        return String(raw);
      }
    }
    return null;
  };

  if (agents === null) {
    return (
      <div className="text-center text-gray-500 py-12 col-span-full">
        Loading agents...
      </div>
    );
  }

  const validAgents = agents.filter((agent) => {
    const anyAgent = agent as any;

    const name = anyAgent.full_name ?? anyAgent.Name;
    const brokerage = anyAgent.Brokerage ?? anyAgent.brokerageName;

    const anyMetric = getAny(anyAgent, [
      // Redfin/performance style
      'totalDeals',
      'Total Deals',
      'numHomesClosed',
      'homesSoldLastYear',
      'salesVolumeLastYear',
      'transactionVolumeLastYear',
      'dealVolume',
      'Deal Volume',
      'highestDealPrice',
      'Highest Deal Price',
      'highestSalePriceLastYear',
      'highestTransactionPriceLastYear',
      'active_listings_count',

      // Realtor/inventory style
      'forSaleCount',
      'For Sale Count',
      'forSaleMax',
      'For Sale Max',
      'recentlySoldCount',
      'Recently Sold Count',
      'recentlySoldMax',
      'Recently Sold Max',
      'Recommendations Count',
      'recommendationsCount',
    ]);

    return (
      isPresent(name) &&
      isPresent(brokerage) &&
      (isValid(anyMetric) || anyMetric === 0)
    );
  });

  if (validAgents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 col-span-full">
        No agents found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {validAgents.map((agent) => {
        const anyAgent = agent as any;

        const agentName = anyAgent.full_name ?? anyAgent.Name ?? 'Agent';
        const agentBrokerage =
          anyAgent.Brokerage ?? anyAgent.brokerageName ?? 'Real Estate Agent';
        const agentLocation =
          anyAgent.Location ??
          [anyAgent.city, anyAgent.state].filter(Boolean).join(', ');

        const ratingRaw =
          (anyAgent.rating ??
            anyAgent.avgRating ??
            anyAgent.avgRatingForCustomerDisplay) as any;

        const ratingNum = Number(ratingRaw);
        const hasRating = Number.isFinite(ratingNum) && ratingNum > 0;

        // Redfin/performance metrics
        const totalDealsRaw =
          asPositiveNumber(getAny(anyAgent, ['totalDeals', 'Total Deals'])) ||
          asPositiveNumber(getAny(anyAgent, ['total_deals_past_year'])) ||
          asPositiveNumber(getAny(anyAgent, ['numHomesClosed'])) ||
          asPositiveNumber(getAny(anyAgent, ['homesSoldLastYear']));

        const salesLastYearRaw =
          asPositiveNumber(getAny(anyAgent, ['salesVolumeLastYear'])) ||
          asPositiveNumber(getAny(anyAgent, ['transactionVolumeLastYear'])) ||
          asPositiveNumber(getAny(anyAgent, ['dealVolume', 'Deal Volume']));

        const dealPriceRaw = asPositiveNumber(
          getAny(anyAgent, ['highestDealPrice', 'Highest Deal Price'])
        );
        const salePriceRaw = asPositiveNumber(
          getAny(anyAgent, ['highestSalePriceLastYear'])
        );
        const forSaleMaxRaw = asPositiveNumber(
          getAny(anyAgent, ['forSaleMax', 'For Sale Max'])
        );

        let highestSaleRaw: number | null = null;
        let highestSaleLabel = 'Highest Sale';

        if (dealPriceRaw) {
          highestSaleRaw = dealPriceRaw;
          highestSaleLabel = 'Highest Deal Price';
        } else if (salePriceRaw) {
          highestSaleRaw = salePriceRaw;
          highestSaleLabel = 'Highest Sale';
        } else if (forSaleMaxRaw) {
          highestSaleRaw = forSaleMaxRaw;
          highestSaleLabel = 'Highest List Price';
        }

        const detailedMetricsAvailable =
          totalDealsRaw !== null &&
          salesLastYearRaw !== null &&
          highestSaleRaw !== null;

        // Realtor/inventory metrics
        const forSaleCountRaw = asNonNegativeNumber(
          getAny(anyAgent, ['forSaleCount', 'For Sale Count'])
        );
        const recentlySoldCountRaw = asNonNegativeNumber(
          getAny(anyAgent, ['recentlySoldCount', 'Recently Sold Count'])
        );
        const recentlySoldMaxRaw = asPositiveNumber(
          getAny(anyAgent, ['recentlySoldMax', 'Recently Sold Max'])
        );
        const recommendationsRaw = asNonNegativeNumber(
          getAny(anyAgent, ['recommendationsCount', 'Recommendations Count'])
        );

        const hasRealtorMetrics =
          forSaleCountRaw !== null ||
          recentlySoldCountRaw !== null ||
          forSaleMaxRaw !== null ||
          recentlySoldMaxRaw !== null ||
          recommendationsRaw !== null;

        const activeListingsMetric = pickMetric(anyAgent, [
          { field: 'active_listings_count', format: formatNumber },
          { field: 'forSaleCount', format: formatNumber },
          { field: 'For Sale Count', format: formatNumber },
        ]);

        const highestValueDisplay = highestSaleRaw
          ? formatMillions(highestSaleRaw)
          : 'N/A';

        const activeListingsDisplay =
          forSaleCountRaw !== null
            ? formatNumber(forSaleCountRaw)
            : activeListingsMetric ?? 'N/A';

        const realtorPriceLabel = forSaleMaxRaw
          ? 'Highest List Price'
          : recentlySoldMaxRaw
            ? 'Highest Sold Price'
            : recommendationsRaw !== null
              ? 'Recommendations'
              : 'Highest Price';

        const realtorPriceValue = forSaleMaxRaw
          ? formatMillions(forSaleMaxRaw)
          : recentlySoldMaxRaw
            ? formatMillions(recentlySoldMaxRaw)
            : recommendationsRaw !== null
              ? formatNumber(recommendationsRaw)
              : 'N/A';

        const realtorLeftLabel =
          recentlySoldCountRaw !== null
            ? 'Recently Sold'
            : recommendationsRaw !== null
              ? 'Recommendations'
              : 'Active Listings';

        const realtorLeftValue =
          recentlySoldCountRaw !== null
            ? formatNumber(recentlySoldCountRaw)
            : recommendationsRaw !== null
              ? formatNumber(recommendationsRaw)
              : activeListingsDisplay;

        const cardId =
          (agent as any).id ??
          anyAgent.id ??
          anyAgent.agentEmail ??
          anyAgent.profile_image_url ??
          agentName;

        return (
          <Link
            href={`/agents/${(agent as any).id}`}
            key={cardId}
            className="block group"
          >
            <div className="bg-[#f7f2e9] rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center relative h-full">
              <div className="absolute top-6 right-6 flex items-center gap-1 text-xs font-bold text-gray-600">
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                {hasRating ? (
                  <span>{Number(ratingNum).toFixed(1)}</span>
                ) : recommendationsRaw !== null ? (
                  <span className="text-gray-600">
                    Rec {formatNumber(recommendationsRaw)}
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>

              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white mb-4 relative">
                <Image
                  src={
                    anyAgent.profile_image_url ||
                    '/assets/images/agetn-hero-deop.jpg'
                  }
                  alt={agentName}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-black mb-1 group-hover:text-orange-600 transition-colors">
                {agentName}
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                {agentBrokerage}
                {' - '}
                {agentLocation}
              </p>

              <div className="w-full flex justify-between items-center px-4 mt-auto">
                {detailedMetricsAvailable ? (
                  <>
                    <div className="flex flex-col items-center w-1/3 border-r border-gray-300/50">
                      <span className="text-xs text-gray-500 mb-1">
                        Total Deals
                      </span>
                      <span className="text-black font-bold text-lg">
                        {formatNumber(totalDealsRaw!)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center w-1/3 border-r border-gray-300/50">
                      <span className="text-xs text-gray-500 mb-1">
                        Sales (last 12 months)
                      </span>
                      <span className="text-black font-bold text-lg">
                        {formatMillions(salesLastYearRaw)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center w-1/3">
                      <span className="text-xs text-gray-500 mb-1">
                        {highestSaleLabel}
                      </span>
                      <span className="text-black font-bold text-lg">
                        {highestValueDisplay}
                      </span>
                    </div>
                  </>
                ) : hasRealtorMetrics ? (
                  <>
                    <div className="flex flex-col items-center w-1/3 border-r border-gray-300/50">
                      <span className="text-xs text-gray-500 mb-1">
                        {realtorLeftLabel}
                      </span>
                      <span className="text-black font-bold text-lg">
                        {realtorLeftValue}
                      </span>
                    </div>

                    <div className="flex flex-col items-center w-1/3 border-r border-gray-300/50">
                      <span className="text-xs text-gray-500 mb-1">
                        {realtorPriceLabel}
                      </span>
                      <span className="text-black font-bold text-lg">
                        {realtorPriceValue}
                      </span>
                    </div>

                    <div className="flex flex-col items-center w-1/3">
                      <span className="text-xs text-gray-500 mb-1">
                        Active Listings
                      </span>
                      <span className="text-black font-bold text-lg">
                        {activeListingsDisplay}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center w-1/3 border-r border-gray-300/50">
                      <span className="text-xs text-gray-500 mb-1">
                        Active Listings
                      </span>
                      <span className="text-black font-bold text-lg">
                        {activeListingsDisplay}
                      </span>
                    </div>
                    <div className="flex flex-col items-center w-1/3 border-r border-gray-300/50">
                      <span className="text-xs text-gray-500 mb-1">
                        Highest Price
                      </span>
                      <span className="text-black font-bold text-lg">
                        {highestValueDisplay}
                      </span>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                      <span className="text-xs text-gray-500 mb-1">
                        Recommendations
                      </span>
                      <span className="text-black font-bold text-lg">
                        {recommendationsRaw !== null
                          ? formatNumber(recommendationsRaw)
                          : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
});

export default function AgentSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('name');
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const deferredSearchInput = useDeferredValue(searchInput);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/auth/graphql';

  async function fetchAgents() {
    const response = await fetch(GRAPHQL_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apollo-require-preflight': 'true',
      },
      body: JSON.stringify({
        query: `
        query ExternalAgents($limit: Int, $offset: Int) {
          externalAgents(limit: $limit, offset: $offset) {
            data {
              id
              full_name
              email
              phone
              brokerage
              locationRaw
              profile_image_url
              avgRating
              active_listings_count
              recentlySoldCount
              recommendationsCount
              avgRatingForCustomerDisplay
              homesSoldLastYear
            }
          }
        }
      `,
        variables: {
          limit: 1000,
          offset: 0,
        },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const data = json?.data?.externalAgents?.data || [];
    return data.map((agent: any) => ({
      ...agent,
      Name: agent.full_name || '',
      agentEmail: agent.email || undefined,
      Location: agent.locationRaw || undefined,
      Brokerage: agent.brokerage || undefined,
    }));
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const queryParam = searchParams.get('query') || '';
    const modeParam = (searchParams.get('mode') as SearchMode | null) ?? 'name';

    setQuery(queryParam);
    setMode(modeParam);
    setSearchInput(modeParam === 'name' ? queryParam : '');

    (async () => {
      const data: Agent[] = await fetchAgents()

      let final = data;
      if (mode === 'location' && query.trim()) {
        final = data.filter((agent) => agentMatchesLocation(agent, query));
      }

      setAgents(final);
    })()

  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAgents() {
      setAgents(null);

      try {
        const qs: string[] = [];
        if (query) qs.push(`q=${encodeURIComponent(query)}`);
        if (mode) qs.push(`mode=${mode}`);

        // const url = `/api/agents${qs.length ? `?${qs.join('&')}` : ''}`;

        // const res = await fetch(url, { signal: controller.signal });
        // if (!res.ok) {
        //   setAgents([]);
        //   return;
        // }

        // const data: Agent[] = await res.json();

        // const data: Agent[] = await fetchAgents()

        // let final = data;
        // if (mode === 'location' && query.trim()) {
        //   final = data.filter((agent) => agentMatchesLocation(agent, query));
        // }

        // setAgents(final);
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          setAgents([]);
        }
      }
    }

    loadAgents();

    return () => controller.abort();
  }, [query, mode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchInput, query, mode]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;

    const next = `/agents/search?query=${encodeURIComponent(trimmed)}&mode=name`;
    router.push(next);
  };

  const filteredAgents = useMemo(() => {
    if (agents === null) return null;
    const q = deferredSearchInput.trim().toLowerCase();
    if (!q) return agents;

    return agents.filter((agent) => {
      const anyAgent = agent as any;
      const name = (anyAgent.full_name ?? anyAgent.Name ?? '').toLowerCase();
      const email = (anyAgent.agentEmail ?? anyAgent.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [agents, deferredSearchInput]);

  // Global ordering before pagination (so empty cards go to the end of all pages)
  const orderedAgents = useMemo(() => {
    if (filteredAgents === null) return null;

    const isPresent = (v: any) =>
      v !== null &&
      v !== undefined &&
      v !== '' &&
      v !== 'N/A' &&
      !(typeof v === 'number' && Number.isNaN(v));

    const getAny = (obj: any, keys: string[]) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (isPresent(v) || v === 0) return v;
      }
      return null;
    };

    const score = (agent: any): 0 | 1 | 2 => {
      const anyAgent = agent as any;

      const totalDealsRaw =
        asPositiveNumber(getAny(anyAgent, ['totalDeals', 'Total Deals'])) ||
        asPositiveNumber(getAny(anyAgent, ['total_deals_past_year'])) ||
        asPositiveNumber(getAny(anyAgent, ['numHomesClosed'])) ||
        asPositiveNumber(getAny(anyAgent, ['homesSoldLastYear']));

      const salesLastYearRaw =
        asPositiveNumber(getAny(anyAgent, ['salesVolumeLastYear'])) ||
        asPositiveNumber(getAny(anyAgent, ['transactionVolumeLastYear'])) ||
        asPositiveNumber(getAny(anyAgent, ['dealVolume', 'Deal Volume']));

      const highestSaleRaw =
        asPositiveNumber(getAny(anyAgent, ['highestDealPrice', 'Highest Deal Price'])) ||
        asPositiveNumber(getAny(anyAgent, ['highestSalePriceLastYear'])) ||
        asPositiveNumber(getAny(anyAgent, ['highestTransactionPriceLastYear'])) ||
        asPositiveNumber(getAny(anyAgent, ['forSaleMax', 'For Sale Max']));

      const detailedMetricsAvailable =
        totalDealsRaw !== null && salesLastYearRaw !== null && highestSaleRaw !== null;

      const forSaleCountRaw = asNonNegativeNumber(getAny(anyAgent, ['forSaleCount', 'For Sale Count']));
      const recentlySoldCountRaw = asNonNegativeNumber(getAny(anyAgent, ['recentlySoldCount', 'Recently Sold Count']));
      const recommendationsRaw = asNonNegativeNumber(getAny(anyAgent, ['recommendationsCount', 'Recommendations Count']));
      const forSaleMaxRaw = asPositiveNumber(getAny(anyAgent, ['forSaleMax', 'For Sale Max']));
      const recentlySoldMaxRaw = asPositiveNumber(getAny(anyAgent, ['recentlySoldMax', 'Recently Sold Max']));

      const activeListingsRaw =
        forSaleCountRaw ?? asNonNegativeNumber(getAny(anyAgent, ['active_listings_count']));

      const realtorComplete =
        (recentlySoldCountRaw ?? 0) > 0 &&
        (activeListingsRaw ?? 0) > 0 &&
        ((forSaleMaxRaw ?? 0) > 0 || (recentlySoldMaxRaw ?? 0) > 0);

      const emptyRealtor =
        (recentlySoldCountRaw ?? 0) === 0 &&
        (recommendationsRaw ?? 0) === 0 &&
        (activeListingsRaw ?? 0) === 0 &&
        (forSaleMaxRaw ?? 0) === 0 &&
        (recentlySoldMaxRaw ?? 0) === 0;

      const anyPerformanceSignal =
        totalDealsRaw !== null || salesLastYearRaw !== null || highestSaleRaw !== null;

      const isEmptyCard = !detailedMetricsAvailable && !realtorComplete && !anyPerformanceSignal && emptyRealtor;

      if (detailedMetricsAvailable || realtorComplete) return 0;
      if (isEmptyCard) return 2;
      return 1;
    };

    return filteredAgents
      .map((a, idx) => ({ a, idx, s: score(a) }))
      .sort((x, y) => x.s - y.s || x.idx - y.idx)
      .map((x) => x.a);
  }, [filteredAgents]);

  const totalAgents = orderedAgents?.length ?? 0;
  const totalPages =
    orderedAgents === null ? 0 : Math.max(1, Math.ceil(totalAgents / PAGE_SIZE));

  useEffect(() => {
    if (orderedAgents && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [orderedAgents, currentPage, totalPages]);

  const paginatedAgents = useMemo(() => {
    if (orderedAgents === null) return null;
    const start = (currentPage - 1) * PAGE_SIZE;
    return orderedAgents.slice(start, start + PAGE_SIZE);
  }, [orderedAgents, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const windowSize = Math.min(5, totalPages);
    const half = Math.floor(windowSize / 2);
    let start = currentPage - half;
    start = Math.max(1, start);
    start = Math.min(start, totalPages - windowSize + 1);

    return Array.from({ length: windowSize }, (_, idx) => start + idx);
  }, [currentPage, totalPages]);

  const rangeStart =
    orderedAgents === null || totalAgents === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const rangeEnd =
    orderedAgents === null || totalAgents === 0
      ? 0
      : Math.min(totalAgents, currentPage * PAGE_SIZE);

  const countText =
    orderedAgents === null
      ? 'Loading agents...'
      : `${totalAgents} agents found (showing ${rangeStart}-${rangeEnd})`;

  return (
    <div className="min-h-screen bg-white text-black">
      <MainNavPages />

      <div className="pt-28 pb-20">
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col items-center text-center"
          ref={searchSectionRef}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-black">
            Find a real estate agent
          </h1>

          <form
            onSubmit={onSubmitSearch}
            className="flex items-center w-full max-w-2xl bg-gray-100 border border-gray-300 rounded-full overflow-hidden px-4 py-2 focus-within:ring-2 focus-within:ring-black transition-all"
          >
            <Search className="text-gray-500 w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="Search agent name or email"
              className="flex-grow bg-transparent outline-none text-gray-700 placeholder-gray-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Search agent
            </button>
          </form>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <p className="text-black font-medium">
            {orderedAgents === null ? '' : countText}
          </p>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AgentsGrid agents={paginatedAgents} />

          {orderedAgents && totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-3 mt-12">
              <button
                className="w-12 h-12 rounded-full bg-[#EADDD7] flex items-center justify-center hover:bg-[#DCCBC3] transition-colors text-gray-700 disabled:opacity-40"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`px-4 py-2 rounded-full border ${pageNumber === currentPage
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                className="w-12 h-12 rounded-full bg-[#EADDD7] flex items-center justify-center hover:bg-[#DCCBC3] transition-colors text-gray-700 disabled:opacity-40"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
