'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useDeferredValue,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MainNavPages from '../navbars/main-nav-pages';
import { Search, X, Star, ArrowRight } from 'lucide-react';

interface HeroLayoutProps {
  className?: string;
  agents?: any[]; // using any[] to work with DB column casing
}

type SearchMode = 'location' | 'name';

type LocationMapping = {
  token: string; // existing CSV token, e.g. "sf"
  city: string; // Clean display name "San Francisco"
  state: string; // "CA"
  synonyms: string[]; // Lowercase variations and typos to map to this city
};

type LocationSuggestion = {
  label: string; // The clean display label "San Francisco, CA"
  token: string; // The search token "sf"
};

// Clean location strings like ". San Diego", "SAN DIEGO.", "San Diego, Ca 92108"
function cleanLocationForMatch(raw: string): string {
  if (!raw) return '';
  let s = String(raw).trim().toLowerCase();

  // remove leading junk like ". ", ", ", "- "
  s = s.replace(/^[^a-z0-9]+/g, '');

  // remove zipcodes (92108 or 92108-1234)
  s = s.replace(/\b\d{5}(?:-\d{4})?\b/g, '');

  // remove dots anywhere
  s = s.replace(/\./g, '');

  // normalize commas/spaces
  s = s.replace(/\s*,\s*/g, ', ');
  s = s.replace(/\s+/g, ' ').trim();

  // remove trailing commas
  s = s.replace(/,\s*$/g, '').trim();

  return s;
}

const LOCATION_MAPPINGS: LocationMapping[] = [
  {
    token: 'la',
    city: 'Los Angeles',
    state: 'CA',
    synonyms: ['la', 'los', 'los angeles', 'los angeles, ca', 'los angeles ca'],
  },
  {
    token: 'sd',
    city: 'San Diego',
    state: 'CA',
    synonyms: [
      'sd',
      'san diego',
      'san diego, ca',
      'san diego ca',
      'san diejo',
      'san deigo',
      'san deigo, ca',
      'san deigo ca',
    ],
  },
  {
    token: 'sf',
    city: 'San Francisco',
    state: 'CA',
    synonyms: [
      'sf',
      'san francisco',
      'san francisco, ca',
      'san francisco ca',
      'san fransisco',
      'san franscisco',
      'san farancisco',
      'san francisico',
      'san fran',
    ],
  },
  {
    token: 'sj',
    city: 'San Jose',
    state: 'CA',
    synonyms: ['sj', 'san jose', 'san jose, ca', 'san jose ca'],
  },
  {
    token: 'hou',
    city: 'Houston',
    state: 'TX',
    synonyms: ['ho', 'hou', 'houston', 'houston, tx', 'houston tx'],
  },
  {
    token: 'aus',
    city: 'Austin',
    state: 'TX',
    synonyms: ['au', 'aus', 'austin', 'austin, tx', 'austin tx'],
  },
];

// Normalize query based on mappings
function normalizeLocationQuery(rawQuery: string): string | null {
  const q = cleanLocationForMatch(rawQuery);
  if (!q) return null;

  const mapping = LOCATION_MAPPINGS.find(
    (m) =>
      m.synonyms.some((s) => s === q) ||
      m.city.toLowerCase() === q ||
      m.token.toLowerCase() === q
  );

  if (mapping) return mapping.token.toLowerCase();
  return null;
}

function buildLocationSuggestions(
  rawQuery: string,
  agents: any[],
  showAllWhenEmpty = false
): LocationSuggestion[] {
  const q = cleanLocationForMatch(rawQuery);
  const shouldReturnAll = showAllWhenEmpty && !q;
  if (!q && !shouldReturnAll) return [];

  const suggestionsMap = new Map<string, LocationSuggestion>();

  const addSuggestion = (label: string, token: string, isCanonical: boolean) => {
    const key = token.toLowerCase();
    const existing = suggestionsMap.get(key);

    if (!existing) {
      suggestionsMap.set(key, { label, token });
      return;
    }

    if (isCanonical) {
      suggestionsMap.set(key, { label, token });
    } else if (!existing.label.includes(',') && label.includes(',')) {
      suggestionsMap.set(key, { label, token });
    }
  };

  // Phase A: Add explicit mappings matching the query
  for (const m of LOCATION_MAPPINGS) {
    const matchesQuery =
      m.synonyms.some((s) => s.startsWith(q)) ||
      m.city.toLowerCase().startsWith(q) ||
      m.token.toLowerCase().startsWith(q);

    if (shouldReturnAll || matchesQuery) {
      const label = `${m.city}, ${m.state}`;
      addSuggestion(label, m.token, true);
    }
  }

  // Phase B: Iterate agents and merge into the same map
  for (const agent of agents) {
    const rawLoc = (agent.Location || '').trim();
    if (!rawLoc) continue;

    const locClean = cleanLocationForMatch(rawLoc);
    if (!locClean) continue;

    const mapped = LOCATION_MAPPINGS.find((m) => {
      const city = m.city.toLowerCase();
      const state = m.state.toLowerCase();
      const token = m.token.toLowerCase();

      if (locClean === token) return true;
      if (locClean === city) return true;
      if (m.synonyms.includes(locClean)) return true;

      if (locClean.startsWith(`${city}, ${state}`)) return true;
      if (locClean.startsWith(`${city} ${state}`)) return true;
      if (locClean.startsWith(city)) return true;

      return false;
    });

    if (mapped) {
      const label = `${mapped.city}, ${mapped.state}`;

      const labelLower = label.toLowerCase();
      const tokenLower = mapped.token.toLowerCase();

      if (
        shouldReturnAll ||
        labelLower.startsWith(q) ||
        tokenLower.startsWith(q) ||
        mapped.city.toLowerCase().startsWith(q)
      ) {
        addSuggestion(label, mapped.token, true);
      }
    } else {
      // unknown city - keep behavior same, but avoid weird punctuation tokens
      if (shouldReturnAll || locClean.startsWith(q)) {
        const cleanedToken = locClean.replace(/[^a-z0-9]/g, '');

        if (cleanedToken.startsWith('sanfran')) {
          addSuggestion('San Francisco, CA', 'sf', true);
        } else {
          addSuggestion(rawLoc.replace(/^[^A-Za-z0-9]+/, '').trim(), cleanedToken, false);
        }
      }
    }
  }

  const result = Array.from(suggestionsMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return shouldReturnAll ? result : result.slice(0, 5);
}

export default function HeroLayout({
  className = '',
  agents = [],
}: HeroLayoutProps) {
  const router = useRouter();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('location');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const query = deferredSearchQuery.toLowerCase().trim();

  const goToSearchPage = () => {
    setIsSearchFocused(false);

    let queryForApi = searchQuery.trim().toLowerCase();

    if (searchMode === 'location') {
      const normalized = normalizeLocationQuery(searchQuery);
      if (normalized) queryForApi = normalized;
    }

    const qParam = encodeURIComponent(queryForApi);
    const modeParam = encodeURIComponent(searchMode);

    router.push(`/agents/search?query=${qParam}&mode=${modeParam}`);
  };

  const goToAgentProfile = useCallback(
    (agentId: string) => {
      setIsSearchFocused(false);
      router.push(`/agents/${agentId}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      goToSearchPage();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchMode !== 'location') {
      setLocationSuggestions([]);
      return;
    }
    const showAllWhenEmpty = !query;
    const suggestions = buildLocationSuggestions(
      deferredSearchQuery,
      agents,
      showAllWhenEmpty
    );
    setLocationSuggestions(suggestions);
  }, [deferredSearchQuery, searchMode, agents, query]);

  const filteredAgents = useMemo(() => {
    if (searchMode !== 'name') return [];
    if (!query) return agents;

    return agents.filter((agent) => {
      const name = (agent.Name || '').toLowerCase();
      const email = (agent.agentEmail || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [agents, query, searchMode]);

  const highlightMatch = useCallback(
    (text: string) => {
      if (!query || !text) return text;
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === query ? (
          <span key={i} className="text-orange-600">
            {part}
          </span>
        ) : (
          part
        )
      );
    },
    [query]
  );

  const agentCards = useMemo(() => {
    return filteredAgents.map((agent) => (
      <div
        key={agent.id}
        onClick={() => goToAgentProfile(agent.id)}
        className="flex items-center p-4 bg-[#FAF9F6] border border-transparent rounded-xl hover:border-orange-300 hover:bg-[#FDF4EB] transition-all cursor-pointer group"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
          <Image
            src={agent.profile_image_url || '/assets/images/agetn-hero-deop.jpg'}
            alt={agent.Name || 'Agent'}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-bold text-black text-lg group-hover:text-orange-900">
                {highlightMatch(agent.Name)}
              </h4>
              <p className="text-sm text-gray-500">
                {agent.Brokerage || 'Real Estate Agent'}
                {' - '}
                {agent.Location || 'CA'}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex sm:flex-col items-start sm:items-end gap-4 sm:gap-0">
              <div className="text-sm font-medium text-black">
                {agent.homesSoldLastYear || 0}{' '}
                <span className="text-gray-500 font-normal">
                  homes sold last year
                </span>
              </div>
              <div className="flex items-center text-sm font-bold text-black">
                <Star className="w-4 h-4 text-orange-500 fill-orange-500 mr-1" />
                {agent.avgRating ? Number(agent.avgRating).toFixed(1) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }, [filteredAgents, highlightMatch, goToAgentProfile]);

  const placeholderText =
    searchMode === 'location'
      ? 'Search by city, area or region'
      : 'Search by agent name or email';

  const handleLocationSuggestionClick = (suggestion: LocationSuggestion) => {
    setSearchMode('location');
    setIsSearchFocused(false);
    setSearchQuery(suggestion.label);

    const qParam = encodeURIComponent(suggestion.token.toLowerCase());
    router.push(`/agents/search?query=${qParam}&mode=location`);
  };

  return (
    <>
      <div className="fixed w-full z-50 top-0 left-0">
        <MainNavPages />
      </div>

      <div className={`text-black min-h-screen relative pt-28 -mt-28 overflow-visible ${className}`}>
        <div className="relative min-h-[100vh] sm:min-h-[100vh] md:min-h-[100vh] w-full overflow-visible pb-20 sm:pb-0">
          <div className="absolute inset-0 z-0 min-h-full">
            <Image
              src="/assets/images/agents-hero.jpg"
              alt="Agents Hero"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative inset-0 flex flex-col items-center px-4 sm:px-6 md:px-12 lg:px-20 z-20 pb-8 sm:pb-12">
            <div className="pt-20 md:pt-24 lg:pt-32" />

            <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-semibold text-black drop-shadow-lg mb-10">
              Discover Agent Possibilities 
              <br />
              <span className=''>With</span>
               <span className="italic font-light">Snaphomz</span>
            </h1>

            <div className="w-full max-w-2xl relative" ref={searchContainerRef}>
              <div
                className={`relative flex items-center w-full h-14 bg-white border-4 border-[#C08C73] shadow-xl overflow-hidden pl-4 pr-1 z-30 transition-all duration-300 ${isSearchFocused ? 'rounded-t-2xl rounded-b-none border-b-0' : 'rounded-full'
                  }`}
              >
                <button
                  onClick={goToSearchPage}
                  className="flex-shrink-0 text-gray-400 mr-3 hover:text-black"
                >
                  <Search className="w-6 h-6" />
                </button>

                <input
                  type="text"
                  placeholder={placeholderText}
                  className="flex-grow w-full h-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-base"
                  onFocus={() => setIsSearchFocused(true)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2 mr-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className="flex items-center ml-2 flex-shrink-0 h-full py-1.5">
                  <div className="flex bg-gray-100 rounded-full p-1 h-full items-center">
                    <button
                      type="button"
                      onClick={() => setSearchMode('location')}
                      className={`h-full flex items-center px-4 rounded-full transition-colors text-sm font-medium ${searchMode === 'location'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black'
                        }`}
                    >
                      Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMode('name')}
                      className={`h-full flex items-center px-4 rounded-full transition-colors text-sm font-medium ${searchMode === 'name'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black'
                        }`}
                    >
                      Agent name
                    </button>
                  </div>
                </div>
              </div>

              {isSearchFocused && (
                <div className="absolute top-14 left-0 w-full bg-white rounded-b-2xl border-4 border-t-0 border-[#C08C73] shadow-2xl z-20 overflow-hidden min-h-[300px] max-h-[400px] overflow-y-auto">
                  {searchMode === 'location' ? (
                    <div className="p-4 bg-white h-full flex flex-col">
                      <p className="text-gray-500 text-sm mb-3 pl-2">
                        {query ? `${locationSuggestions.length} locations found` : 'Browse available locations'}
                      </p>

                      {locationSuggestions.length > 0 ? (
                        <div className="flex flex-col divide-y divide-gray-100">
                          {locationSuggestions.map((s) => (
                            <button
                              key={`${s.token}:${s.label}`}
                              type="button"
                              onClick={() => handleLocationSuggestionClick(s)}
                              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left"
                            >
                              <span className="w-2 h-2 rounded-full bg-gray-400 mr-3" />
                              <span className="text-sm text-[#f97316]">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                          <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-[#1A2B49]" />
                          </div>
                          <h3 className="text-lg font-semibold text-black mb-2">No locations found</h3>
                          <p className="text-gray-500 text-sm">Try a different city, area, or region.</p>
                        </div>
                      )}
                    </div>
                  ) : query === '' ? (
                    <div className="p-10 flex flex-col items-center text-center h-full">
                      <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-[#1A2B49]" />
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">Begin your agent search</h3>
                      <p className="text-gray-500 text-sm max-w-md">
                        Type a name or email to find an agent.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-white h-full flex flex-col">
                      {filteredAgents.length > 0 ? (
                        <>
                          <p className="text-gray-500 text-sm mb-3 pl-2">
                            {filteredAgents.length} agents found
                          </p>
                          <div className="flex flex-col gap-3">{agentCards}</div>

                          <button
                            onClick={goToSearchPage}
                            className="w-full mt-4 py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                          >
                            See all results for "{searchQuery}"
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                          <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-[#1A2B49]" />
                          </div>
                          <h3 className="text-lg font-semibold text-black mb-2">No agents found</h3>
                          <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-12 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
              <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md p-6 flex items-center space-x-4 shadow-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 relative">
                  <Image
                    src="/assets/images/agetn-hero-deop.jpg"
                    alt="Racheal"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-black">Racheal Wyatt</p>
                  <p className="text-sm text-orange-900 font-medium">Buyer</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md p-6 flex items-center space-x-4 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <span className="font-semibold text-blue-800">JS</span>
                </div>
                <div>
                  <p className="font-semibold text-black">John Smith</p>
                  <p className="text-sm text-orange-900 font-medium">Agent</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md p-6 flex items-center space-x-4 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="font-semibold text-gray-800">KW</span>
                </div>
                <div>
                  <p className="font-semibold text-black">Kevin Winston</p>
                  <p className="text-sm text-orange-900 font-medium">Broker</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
