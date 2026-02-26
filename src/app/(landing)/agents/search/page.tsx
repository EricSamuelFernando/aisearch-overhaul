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


function highlightPrefix(text: string, rawQuery: string): React.ReactNode {
  const q = rawQuery.trim();
  if (!q || !text) return text;


  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();


  // highlight only when it starts with query (prefix)
  if (!lowerText.startsWith(lowerQ)) return text;


  const prefix = text.slice(0, q.length);
  const rest = text.slice(q.length);


  return (
    <>
      <span className="text-orange-600">{prefix}</span>
      {rest}
    </>
  );
}


function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = React.useState(value);


  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);


  return debounced;
}


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
    'la': 'la',
    'los angeles': 'la',
    'los angeles, ca': 'la',
    'sf': 'sf',
    'san francisco': 'sf',
    'san francisco, ca': 'sf',
    'sd': 'sd',
    'san diego': 'sd',
    'san diego, ca': 'sd',
    'sj': 'sj',
    'san jose': 'sj',
    'san jose, ca': 'sj',
    'aus': 'austin',
    'austin': 'austin',
    'austin, tx': 'austin',
    'hou': 'houston',
    'houston': 'houston',
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
  highlightQuery,
}: {
  agents: Agent[] | null;
  highlightQuery?: string;
}) {
  // Made highlightQuery optional giving typescript error
  const isPresent = (v: any) =>
    v !== null &&
    v !== undefined &&
    v !== '' &&
    v !== 'N/A' &&
    !(typeof v === 'number' && Number.isNaN(v));


  // Helper to extract values safely
  const getAny = (obj: any, keys: string[]) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (isPresent(v) || v === 0) return v;
    }
    return null;
  };

  const extractPhoneNumbers = (rawValues: any[]): string[] => {
    const values = rawValues
      .filter((v) => isPresent(v))
      .map((v) => String(v));

    if (values.length === 0) return [];

    const found: string[] = [];
    const phonePattern = /(?:\(\d{3}\)\s*\d{3}-\d{4})|(?:\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g;

    values.forEach((value) => {
      const matches = value.match(phonePattern);
      if (matches && matches.length > 0) {
        matches.forEach((m) => found.push(m.trim()));
        return;
      }

      value
        .split(/[;,|/]/)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => found.push(p));
    });

    const deduped = Array.from(new Set(found));
    return deduped.slice(0, 2);
  };


  if (agents === null) {
    return (
      <div className="text-center text-gray-500 py-12 col-span-full">
        Loading agents...
      </div>
    );
  }


  // Filter valid agents
  const validAgents = agents.filter((agent) => {
    const anyAgent = agent as any;
    const name = anyAgent.full_name ?? anyAgent.Name;
    // We display them even if some data is missing, but Name/Brokerage is good baseline
    return isPresent(name);
  });


  if (validAgents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 col-span-full">
        No agents found.
      </div>
    );
  }


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
      {validAgents.map((agent) => {
        const anyAgent = agent as any;
        const agentName = anyAgent.full_name ?? anyAgent.Name ?? 'Agent';
        const agentBrokerage =
          anyAgent.Brokerage ?? anyAgent.brokerageName ?? 'Sales Executive';
        const agentEmail = anyAgent.email ?? anyAgent.agentEmail;
        const agentPhones = extractPhoneNumbers([
          anyAgent.phone,
          anyAgent.mobile,
          anyAgent.phone2,
          anyAgent.mobile2,
          anyAgent.secondary_phone,
          anyAgent.contact_number,
        ]);


        // ID resolution
        const cardId =
          (agent as any).id ??
          anyAgent.id ??
          agentEmail ??
          anyAgent.profile_image_url ??
          agentName;


        // Rating Logic
        const ratingRaw =
          (anyAgent.rating ??
            anyAgent.avgRating ??
            anyAgent.avgRatingForCustomerDisplay) as any;
        const ratingNum = Number(ratingRaw);
        const hasRating = Number.isFinite(ratingNum) && ratingNum > 0;


        // Deals Logic
        const recentlySoldRaw =
          asNonNegativeNumber(getAny(anyAgent, ['recentlySoldCount', 'Recently Sold Count'])) || 0;


        // Recommendations/Reviews count
        const recommendationsRaw = asNonNegativeNumber(
          getAny(anyAgent, ['recommendationsCount', 'Recommendations Count'])
        );
        const reviewCount = recommendationsRaw ?? 0;




        return (
          <Link
            href={`/agents/${(agent as any).id}`}
            key={cardId}
            className="block w-full group"
          >
            <div className="w-full rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch h-full overflow-hidden">
              {/* Left: Image (Square rounded) */}
              <div className="shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 relative rounded-2xl overflow-hidden bg-gray-100">
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
              </div>


              {/* Right: Content */}
              <div className="w-full flex-grow flex flex-col min-w-0">
                {/* Header: Name + Title */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-black group-hover:text-orange-600 transition-colors leading-tight break-words">
                    {agentName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {agentBrokerage}
                  </p>
                </div>


                {/* Metrics Stack */}
                <div className="flex flex-col gap-2.5 mt-3 mb-3 w-full">
                  {/* Mobile / Mobile 1 / Mobile 2 */}
                  {agentPhones.length > 0 ? (
                    agentPhones.map((phone, index) => (
                      <div
                        key={`${cardId}-phone-${index}`}
                        className="flex justify-between items-start text-xs border-b border-gray-300 pb-2.5 gap-3"
                      >
                        <span className="text-gray-500 font-medium shrink-0">
                          {agentPhones.length === 1 ? 'Mobile' : `Mobile ${index + 1}`}
                        </span>
                        <span className="font-semibold text-black text-right text-xs break-all">
                          {phone}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center text-xs border-b border-gray-300 pb-2.5 gap-3">
                      <span className="text-gray-500 font-medium shrink-0">Mobile</span>
                      <span className="font-semibold text-black text-right text-xs break-all">N/A</span>
                    </div>
                  )}






                  {/* Ratings */}
                  <div className="flex justify-between items-center text-xs border-b border-gray-300 pb-2.5 gap-3">
                    <span className="text-gray-500 font-medium shrink-0">Ratings</span>
                    <div className="flex items-center gap-1 font-semibold text-black min-w-0">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                      <span className="text-xs">{hasRating ? ratingNum.toFixed(1) : 'N/A'}</span>
                      <span className="text-gray-400 font-normal ml-1 text-[10px] truncate">
                        {reviewCount > 0 ? `${reviewCount} reviews` : ''}
                      </span>
                    </div>
                  </div>


                  {/* Recently Sold */}
                  <div className="flex justify-between items-center text-xs border-b border-gray-300 pb-2.5 gap-3">
                    <span className="text-gray-500 font-medium shrink-0">Recently Sold</span>
                    <span className="font-semibold text-black text-xs">
                      {recentlySoldRaw}
                    </span>
                  </div>
                </div>


                {/* Footer: View Listings */}
                <div className="">
                  <span className="text-orange-500 text-sm font-semibold group-hover:underline cursor-pointer">
                    View Listings
                  </span>
                </div>
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
  const deferredSearchInput = useDebounce(searchInput, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;
  const searchSectionRef = useRef<HTMLDivElement>(null);


  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);


  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/auth/graphql';


  const fetchExternalAgents = async ({
    limit,
    offset,
    search,
    signal,
  }: {
    limit: number;
    offset: number;
    search?: string;
    signal: AbortSignal;
  }): Promise<Agent[]> => {
    const response = await fetch(GRAPHQL_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apollo-require-preflight': 'true',
      },
      body: JSON.stringify({
        query: `
        query ExternalAgents($limit: Int, $offset: Int, $search: String) {
          externalAgents(limit: $limit, offset: $offset, search: $search) {
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
        variables: { limit, offset, search },
      }),
      signal,
      cache: 'no-store',
    });


    if (!response.ok) return [];


    const json = await response.json();
    const data = json?.data?.externalAgents?.data || [];


    return data.map((agent: any) => ({
      ...agent,
      Name: agent.full_name || '',
      agentEmail: agent.email || undefined,
      Location: agent.locationRaw || undefined,
      Brokerage: agent.brokerage || undefined,
    }));
  };




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


  // Orginal Code
  // useEffect(() => {
  //   const queryParam = searchParams.get('query') || '';
  //   const modeParam = (searchParams.get('mode') as SearchMode | null) ?? 'name';


  //   setMode(modeParam);
  //   setSearchInput(modeParam === 'name' ? queryParam : '');


  //   (async () => {
  //     const data: Agent[] = await fetchAgents();


  //     let final = data;


  //     if (modeParam === 'location' && queryParam.trim()) {
  //       final = data.filter((agent) =>
  //         agentMatchesLocation(agent, queryParam)
  //       );
  //     }


  //     setAgents(final);
  //   })();
  // }, [searchParams]);


  useEffect(() => {
    const queryParam = searchParams.get('query') || '';
    const modeParam = (searchParams.get('mode') as SearchMode | null) ?? 'name';
    const controller = new AbortController();


    setMode(modeParam);
    setSearchInput(modeParam === 'name' ? queryParam : '');


    const fetchData = async () => {
      try {
        const data: Agent[] = await fetchExternalAgents({
          limit: 1000,
          offset: 0,
          signal: controller.signal,  // Pass the signal to fetchExternalAgents
          search: queryParam
        });


        let final = data;


        if (modeParam === 'location' && queryParam.trim()) {
          final = data.filter((agent) =>
            agentMatchesLocation(agent, queryParam)
          );
        }


        setAgents(final);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setAgents([]);  // Optionally, handle the error state
        }
      }
    };


    fetchData();


    // Cleanup function to abort the fetch when the effect is cleaned up
    return () => {
      controller.abort();
    };
  }, [searchParams]);




  useEffect(() => {
    const controller = new AbortController();


    (async () => {
      setAgents(null);


      try {
        if (mode === 'name') {
          const typed = deferredSearchInput.trim();


          // const data = await fetchExternalAgents({
          //   limit: 1000,
          //   offset: 0,
          //   search: typed ? typed : undefined,
          //   signal: controller.signal,
          // });

          const data = await fetchExternalAgents({
            limit: 1000,
            offset: 0,
            search: typed ? typed : undefined,
            signal: controller.signal,
          });

          setAgents(data);

        } else {
          const typed = query.trim();


          // const data = await fetchExternalAgents({
          //   limit: 1000,
          //   offset: 0,
          //   signal: controller.signal,
          // });
          const data = await fetchExternalAgents({
            limit: 1000,
            offset: 0,
            signal: controller.signal,
          });

          const final = typed ? data.filter((a) => agentMatchesLocation(a, typed)) : data;
          setAgents(final);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') setAgents([]);
      }
    })();


    return () => controller.abort();
  }, [mode, deferredSearchInput, query]); // only one fetch path


  useEffect(() => {
    if (mode !== 'name') return;


    const typed = searchInput.trim();


    // const t = setTimeout(() => {
    //   router.replace(`/agents/search?query=${encodeURIComponent(typed)}&mode=name`);
    // }, 350); // 300–500ms feels good

    const t = setTimeout(() => {
      router.replace(`/agents/search?query=${encodeURIComponent(typed)}&mode=name`);
    }, 350); // 300–500ms feels good

    return () => clearTimeout(t);
  }, [mode, searchInput, router]);




  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowLocationDropdown(false);
        setShowRatingDropdown(false);
      }
    };


    if (showLocationDropdown || showRatingDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLocationDropdown, showRatingDropdown]);


  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;


    const next = `/agents/search?query=${encodeURIComponent(trimmed)}&mode=name`;
    router.push(next);
  };


  function highlightPrefix(text: string, rawQuery: string) {
    const q = rawQuery.trim();
    if (!q || !text) return text;


    const lowerText = text.toLowerCase();
    const lowerQ = q.toLowerCase();


    // We only highlight when the name starts with the search (your backend behavior)
    if (!lowerText.startsWith(lowerQ)) return text;


    const prefix = text.slice(0, q.length);
    const rest = text.slice(q.length);


    return (
      <>
        <span className="text-orange-600">{prefix}</span>
        {rest}
      </>
    );
  }


  const filteredAgents = useMemo(() => {
    if (agents === null) return null;


    let result = agents;


    // Apply search input filter
    const q = deferredSearchInput.trim().toLowerCase();
    if (q) {
      result = result.filter((agent) => {
        const anyAgent = agent as any;
        const name = (anyAgent.full_name ?? anyAgent.Name ?? '').toLowerCase();
        const email = (anyAgent.agentEmail ?? anyAgent.email ?? '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }


    // Apply location filter
    if (selectedLocation) {
      result = result.filter((agent) => agentMatchesLocation(agent, selectedLocation));
    }


    // Apply rating filter
    if (selectedRating) {
      result = result.filter((agent) => {
        const anyAgent = agent as any;
        const ratingRaw = anyAgent.rating ?? anyAgent.avgRating ?? anyAgent.avgRatingForCustomerDisplay;
        const ratingNum = Number(ratingRaw);


        if (!Number.isFinite(ratingNum) || ratingNum <= 0) return false;


        switch (selectedRating) {
          case '1-5':
            return ratingNum >= 1 && ratingNum <= 5;
          case '6':
            return ratingNum >= 6 && ratingNum < 7;
          case '7':
            return ratingNum >= 7 && ratingNum < 8;
          case '8':
            return ratingNum >= 8 && ratingNum < 9;
          case '9':
            return ratingNum >= 9 && ratingNum < 10;
          case '9+':
            return ratingNum >= 9;
          default:
            return true;
        }
      });
    }


    return result;
  }, [agents, deferredSearchInput, selectedLocation, selectedRating]);


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
    <div className="min-h-screen bg-[#F9F3EB] text-black font-sans overflow-x-hidden">
      <MainNavPages />


      <div className="pt-8 sm:pt-10 md:pt-14 lg:pt-16 pb-16 md:pb-20">
        <div
          className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12"
          ref={searchSectionRef}
        >
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Search / Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-4 items-start">
              {/* Search Input */}
              <div className="relative w-full min-w-0 md:col-span-2 xl:col-span-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:border-gray-300 transition-colors">
                  <Search className="text-gray-400 w-5 h-5 mr-3" />
                  <input
                    type="text"
                    placeholder="Search name, email or location"
                    className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full text-sm"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>


              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full md:col-span-2 xl:col-span-6">
                {/* Location Filter */}
                <div className="relative w-full">
                  <button
                    onClick={() => {
                      setShowLocationDropdown(!showLocationDropdown);
                      setShowRatingDropdown(false);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 flex items-center justify-between gap-2 hover:border-gray-300 shadow-sm transition-all whitespace-nowrap"
                  >
                    <span>{selectedLocation || 'Location'}</span>
                    <span className="text-gray-400 text-[10px]">▼</span>
                  </button>


                  {showLocationDropdown && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setSelectedLocation('');
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          All Locations
                        </button>
                        {['San Francisco', 'Los Angeles', 'San Diego', 'San Jose', 'Austin', 'Houston'].map((loc) => (
                          <button
                            key={loc}
                            onClick={() => {
                              setSelectedLocation(loc);
                              setShowLocationDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>


                {/* Property Type Filter (Disabled) */}
                <button
                  disabled
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400 flex items-center justify-between gap-2 shadow-sm whitespace-nowrap opacity-50 cursor-not-allowed"
                >
                  <span>Property Type</span>
                  <span className="text-gray-400 text-[10px]">▼</span>
                </button>


                {/* Budget Range Filter (Disabled) */}
                <button
                  disabled
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400 flex items-center justify-between gap-2 shadow-sm whitespace-nowrap opacity-50 cursor-not-allowed"
                >
                  <span>Budget Range</span>
                  <span className="text-gray-400 text-[10px]">▼</span>
                </button>


                {/* Agent Rating Filter */}
                <div className="relative w-full">
                  <button
                    onClick={() => {
                      setShowRatingDropdown(!showRatingDropdown);
                      setShowLocationDropdown(false);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 flex items-center justify-between gap-2 hover:border-gray-300 shadow-sm transition-all whitespace-nowrap"
                  >
                    <span>{selectedRating || 'Agent Rating'}</span>
                    <span className="text-gray-400 text-[10px]">▼</span>
                  </button>


                  {showRatingDropdown && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setSelectedRating('');
                            setShowRatingDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          All Ratings
                        </button>
                        {['1-5', '6', '7', '8', '9', '9+'].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => {
                              setSelectedRating(rating);
                              setShowRatingDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                          >
                            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                            <span>{rating}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Search Button */}
              <button
                onClick={onSubmitSearch}
                className="bg-black text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors shadow-lg whitespace-nowrap w-full md:col-span-2 xl:col-span-2 xl:justify-self-end"
              >
                Search agent
              </button>
            </div>


            {/* Active Filters Display */}
            {(selectedLocation || selectedRating) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-600 font-medium">Active Filters:</span>


                {selectedLocation && (
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>Location: {selectedLocation}</span>
                    <button
                      onClick={() => setSelectedLocation('')}
                      className="hover:text-orange-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}


                {selectedRating && (
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>Rating: {selectedRating}</span>
                    <button
                      onClick={() => setSelectedRating('')}
                      className="hover:text-orange-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}


                <button
                  onClick={() => {
                    setSelectedLocation('');
                    setSelectedRating('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}


            {/* All Agents Header */}
            <div className="mt-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-black">All Agents</h1>
            </div>
          </div>
        </div>


        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <AgentsGrid agents={paginatedAgents} />


          {/* Pagination and Counts */}
          <div className="mt-12 flex flex-col items-center">
            {orderedAgents && totalPages > 1 && (
              <div className="w-full max-w-full flex items-center justify-center gap-2 sm:gap-4 mb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 sm:p-3 rounded-full bg-[#f0eadd] hover:bg-[#e6dec9] disabled:opacity-50 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>


                <div className="flex gap-1 sm:gap-2 min-w-0">
                  {pageNumbers.map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors shrink-0 ${currentPage === p
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-[#f0eadd]'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>


                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 sm:p-3 rounded-full bg-[#f0eadd] hover:bg-[#e6dec9] disabled:opacity-50 transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>
            )}


            <p className="text-gray-500 text-sm mt-4 text-center px-2">
              {orderedAgents === null ? '' : countText}
            </p>
          </div>
        </div>






      </div>
    </div>
  );
}

