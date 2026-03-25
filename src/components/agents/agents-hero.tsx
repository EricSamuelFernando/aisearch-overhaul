// 'use client';

// import {
//   useState,
//   useRef,
//   useEffect,
//   useMemo,
//   useDeferredValue,
//   useCallback,
//   FormEvent,
// } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import MainNavPages from '../navbars/main-nav-pages';
// import { Search, X, Star, ArrowRight } from 'lucide-react';

// interface HeroLayoutProps {
//   className?: string;
//   agents?: any[]; // using any[] to work with DB column casing
// }

// type SearchMode = 'location' | 'name';

// type LocationMapping = {
//   token: string; // existing CSV token, e.g. "sf"
//   city: string; // Clean display name "San Francisco"
//   state: string; // "CA"
//   synonyms: string[]; // Lowercase variations and typos to map to this city
// };

// type LocationSuggestion = {
//   label: string; // The clean display label "San Francisco, CA"
//   token: string; // The search token "sf"
// };

// // Clean location strings like ". San Diego", "SAN DIEGO.", "San Diego, Ca 92108"
// function cleanLocationForMatch(raw: string): string {
//   if (!raw) return '';
//   let s = String(raw).trim().toLowerCase();

//   // remove leading junk like ". ", ", ", "- "
//   s = s.replace(/^[^a-z0-9]+/g, '');

//   // remove zipcodes (92108 or 92108-1234)
//   s = s.replace(/\b\d{5}(?:-\d{4})?\b/g, '');

//   // remove dots anywhere
//   s = s.replace(/\./g, '');

//   // normalize commas/spaces
//   s = s.replace(/\s*,\s*/g, ', ');
//   s = s.replace(/\s+/g, ' ').trim();

//   // remove trailing commas
//   s = s.replace(/,\s*$/g, '').trim();

//   return s;
// }

// const LOCATION_MAPPINGS: LocationMapping[] = [
//   {
//     token: 'la',
//     city: 'Los Angeles',
//     state: 'CA',
//     synonyms: ['la', 'los', 'los angeles', 'los angeles, ca', 'los angeles ca'],
//   },
//   {
//     token: 'sd',
//     city: 'San Diego',
//     state: 'CA',
//     synonyms: [
//       'sd',
//       'san diego',
//       'san diego, ca',
//       'san diego ca',
//       'san diejo',
//       'san deigo',
//       'san deigo, ca',
//       'san deigo ca',
//     ],
//   },
//   {
//     token: 'sf',
//     city: 'San Francisco',
//     state: 'CA',
//     synonyms: [
//       'sf',
//       'san francisco',
//       'san francisco, ca',
//       'san francisco ca',
//       'san fransisco',
//       'san franscisco',
//       'san farancisco',
//       'san francisico',
//       'san fran',
//     ],
//   },
//   {
//     token: 'sj',
//     city: 'San Jose',
//     state: 'CA',
//     synonyms: ['sj', 'san jose', 'san jose, ca', 'san jose ca'],
//   },
//   {
//     token: 'hou',
//     city: 'Houston',
//     state: 'TX',
//     synonyms: ['ho', 'hou', 'houston', 'houston, tx', 'houston tx'],
//   },
//   {
//     token: 'aus',
//     city: 'Austin',
//     state: 'TX',
//     synonyms: ['au', 'aus', 'austin', 'austin, tx', 'austin tx'],
//   },
// ];

// // Normalize query based on mappings
// function normalizeLocationQuery(rawQuery: string): string | null {
//   const q = cleanLocationForMatch(rawQuery);
//   if (!q) return null;

//   const mapping = LOCATION_MAPPINGS.find(
//     (m) =>
//       m.synonyms.some((s) => s === q) ||
//       m.city.toLowerCase() === q ||
//       m.token.toLowerCase() === q
//   );

//   if (mapping) return mapping.token.toLowerCase();
//   return null;
// }

// function buildLocationSuggestions(
//   rawQuery: string,
//   agents: any[],
//   showAllWhenEmpty = false
// ): LocationSuggestion[] {
//   const q = cleanLocationForMatch(rawQuery);
//   const shouldReturnAll = showAllWhenEmpty && !q;
//   if (!q && !shouldReturnAll) return [];

//   const suggestionsMap = new Map<string, LocationSuggestion>();

//   const addSuggestion = (label: string, token: string, isCanonical: boolean) => {
//     const key = token.toLowerCase();
//     const existing = suggestionsMap.get(key);

//     if (!existing) {
//       suggestionsMap.set(key, { label, token });
//       return;
//     }

//     if (isCanonical) {
//       suggestionsMap.set(key, { label, token });
//     } else if (!existing.label.includes(',') && label.includes(',')) {
//       suggestionsMap.set(key, { label, token });
//     }
//   };

//   // Phase A: Add explicit mappings matching the query
//   for (const m of LOCATION_MAPPINGS) {
//     const matchesQuery =
//       m.synonyms.some((s) => s.startsWith(q)) ||
//       m.city.toLowerCase().startsWith(q) ||
//       m.token.toLowerCase().startsWith(q);

//     if (shouldReturnAll || matchesQuery) {
//       const label = `${m.city}, ${m.state}`;
//       addSuggestion(label, m.token, true);
//     }
//   }

//   // Phase B: Iterate agents and merge into the same map
//   for (const agent of agents) {
//     const rawLoc = (agent.Location || '').trim();
//     if (!rawLoc) continue;

//     const locClean = cleanLocationForMatch(rawLoc);
//     if (!locClean) continue;

//     const mapped = LOCATION_MAPPINGS.find((m) => {
//       const city = m.city.toLowerCase();
//       const state = m.state.toLowerCase();
//       const token = m.token.toLowerCase();

//       if (locClean === token) return true;
//       if (locClean === city) return true;
//       if (m.synonyms.includes(locClean)) return true;

//       if (locClean.startsWith(`${city}, ${state}`)) return true;
//       if (locClean.startsWith(`${city} ${state}`)) return true;
//       if (locClean.startsWith(city)) return true;

//       return false;
//     });

//     if (mapped) {
//       const label = `${mapped.city}, ${mapped.state}`;

//       const labelLower = label.toLowerCase();
//       const tokenLower = mapped.token.toLowerCase();

//       if (
//         shouldReturnAll ||
//         labelLower.startsWith(q) ||
//         tokenLower.startsWith(q) ||
//         mapped.city.toLowerCase().startsWith(q)
//       ) {
//         addSuggestion(label, mapped.token, true);
//       }
//     } else {
//       // unknown city - keep behavior same, but avoid weird punctuation tokens
//       if (shouldReturnAll || locClean.startsWith(q)) {
//         const cleanedToken = locClean.replace(/[^a-z0-9]/g, '');

//         if (cleanedToken.startsWith('sanfran')) {
//           addSuggestion('San Francisco, CA', 'sf', true);
//         } else {
//           addSuggestion(rawLoc.replace(/^[^A-Za-z0-9]+/, '').trim(), cleanedToken, false);
//         }
//       }
//     }
//   }

//   const result = Array.from(suggestionsMap.values()).sort((a, b) =>
//     a.label.localeCompare(b.label)
//   );

//   return shouldReturnAll ? result : result.slice(0, 5);
// }

// export default function HeroLayout({
//   className = '',
//   agents = [],
// }: HeroLayoutProps) {
//   const router = useRouter();
//   const GRAPHQL_URI =
//     process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
//     'http://localhost:4000/auth/graphql';

//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchMode, setSearchMode] = useState<SearchMode>('location');
//   const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
//   const [nameAgents, setNameAgents] = useState<any[]>(agents);
//   const [locationAgents, setLocationAgents] = useState<any[]>(agents);

//   const searchContainerRef = useRef<HTMLDivElement>(null);
//   const mobileSearchContainerRef = useRef<HTMLFormElement>(null);
//   const deferredSearchQuery = useDeferredValue(searchQuery);
//   const query = deferredSearchQuery.toLowerCase().trim();

//   const immediateQuery = searchQuery.toLowerCase().trim();

//   const fetchExternalAgents = useCallback(
//     async ({
//       limit,
//       search,
//       signal,
//     }: {
//       limit: number;
//       search?: string;
//       signal: AbortSignal;
//     }) => {
//       const response = await fetch(GRAPHQL_URI, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'apollo-require-preflight': 'true',
//         },
//         body: JSON.stringify({
//           query: `
//             query ExternalAgents($limit: Int, $offset: Int, $search: String) {
//               externalAgents(limit: $limit, offset: $offset, search: $search) {
//                 data {
//                   id
//                   full_name
//                   email
//                   phone
//                   brokerage
//                   locationRaw
//                   profile_image_url
//                   avgRating
//                   avgRatingForCustomerDisplay
//                   homesSoldLastYear
//                 }
//               }
//             }
//           `,
//           variables: {
//             limit,
//             offset: 0,
//             search,
//           },
//         }),
//         signal,
//       });

//       if (!response.ok) {
//         return [];
//       }

//       const json = await response.json();
//       const data = json?.data?.externalAgents?.data || [];
//       return data.map((agent: any) => ({
//         ...agent,
//         Name: agent.full_name || '',
//         agentEmail: agent.email || undefined,
//         Location: agent.locationRaw || undefined,
//         Brokerage: agent.brokerage || undefined,
//       }));
//     },
//     [GRAPHQL_URI]
//   );

//   const goToSearchPage = () => {
//     setIsSearchFocused(false);

//     let queryForApi = searchQuery.trim().toLowerCase();

//     if (searchMode === 'location') {
//       const normalized = normalizeLocationQuery(searchQuery);
//       if (normalized) queryForApi = normalized;
//     }

//     const qParam = encodeURIComponent(queryForApi);
//     const modeParam = encodeURIComponent(searchMode);

//     router.push(`/agents/search?query=${qParam}&mode=${modeParam}`);
//   };

//   const goToSearchPageForMobile = (event?: FormEvent<HTMLFormElement>) => {
//     event?.preventDefault();
//     const trimmedQuery = searchQuery.trim().toLowerCase();
//     if (!trimmedQuery) return;

//     setIsSearchFocused(false);

//     const normalizedLocation = normalizeLocationQuery(searchQuery);
//     const mobileMode: SearchMode = normalizedLocation ? 'location' : 'name';
//     const queryForApi = normalizedLocation || trimmedQuery;

//     const qParam = encodeURIComponent(queryForApi);
//     const modeParam = encodeURIComponent(mobileMode);

//     router.push(`/agents/search?query=${qParam}&mode=${modeParam}`);
//   };

//   const goToAgentProfile = useCallback(
//     (agentId: string) => {
//       setIsSearchFocused(false);
//       router.push(`/agents/${agentId}`);
//     },
//     [router]
//   );

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       goToSearchPage();
//     }
//   };

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       const target = event.target as Node;
//       const clickedDesktopSearch =
//         searchContainerRef.current &&
//         searchContainerRef.current.contains(target);
//       const clickedMobileSearch =
//         mobileSearchContainerRef.current &&
//         mobileSearchContainerRef.current.contains(target);

//       if (!clickedDesktopSearch && !clickedMobileSearch) {
//         setIsSearchFocused(false);
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if (searchMode !== 'location') {
//       setLocationSuggestions([]);
//       return;
//     }
//     const showAllWhenEmpty = !query;
//     const suggestions = buildLocationSuggestions(
//       deferredSearchQuery,
//       locationAgents,
//       showAllWhenEmpty
//     );
//     setLocationSuggestions(suggestions);
//   }, [deferredSearchQuery, searchMode, locationAgents, query]);

//   useEffect(() => {
//     const controller = new AbortController();

//     async function loadNameAgents() {
//       if (searchMode !== 'name') return;
//       try {
//         const data = await fetchExternalAgents({
//           limit: 100,
//           search: immediateQuery || undefined,
//           signal: controller.signal,
//         });
//         setNameAgents(data);
//       } catch (err: any) {
//         if (err?.name !== 'AbortError') {
//           console.error('Error loading agents:', err);
//         }
//       }
//     }

//     loadNameAgents();
//     return () => controller.abort();
//   }, [searchMode, immediateQuery, fetchExternalAgents]);

//   useEffect(() => {
//     const controller = new AbortController();

//     async function loadLocationAgents() {
//       if (searchMode !== 'location') return;
//       try {
//         const data = await fetchExternalAgents({
//           limit: 1000,
//           signal: controller.signal,
//         });
//         setLocationAgents(data);
//       } catch (err: any) {
//         if (err?.name !== 'AbortError') {
//           console.error('Error loading agents for location:', err);
//         }
//       }
//     }

//     loadLocationAgents();
//     return () => controller.abort();
//   }, [searchMode, fetchExternalAgents]);

//   const filteredAgents = useMemo(() => {
//     if (searchMode !== 'name') return [];
//     if (!query) return nameAgents;

//     return nameAgents.filter((agent) => {
//       const name = (agent.Name || '').toLowerCase();
//       const email = (agent.agentEmail || '').toLowerCase();
//       return name.includes(query) || email.includes(query);
//     });
//   }, [nameAgents, query, searchMode]);

//   const highlightMatch = useCallback(
//     (text: string) => {
//       if (!query || !text) return text;
//       const parts = text.split(new RegExp(`(${query})`, 'gi'));
//       return parts.map((part, i) =>
//         part.toLowerCase() === query ? (
//           <span key={i} className="text-orange-600">
//             {part}
//           </span>
//         ) : (
//           part
//         )
//       );
//     },
//     [query]
//   );

//   const agentCards = useMemo(() => {
//     return filteredAgents.map((agent) => (
//       <div
//         key={agent.id}
//         onClick={() => goToAgentProfile(agent.id)}
//         className="flex items-center p-4 bg-[#FAF9F6] border border-transparent rounded-xl hover:border-orange-300 hover:bg-[#FDF4EB] transition-all cursor-pointer group"
//       >
//         <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
//           <Image
//             src={agent.profile_image_url || '/assets/images/agetn-hero-deop.jpg'}
//             alt={agent.Name || 'Agent'}
//             fill
//             className="object-cover"
//           />
//         </div>
//         <div className="ml-4 flex-grow">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h4 className="font-bold text-black text-lg group-hover:text-orange-900">
//                 {highlightMatch(agent.Name)}
//               </h4>
//               <p className="text-sm text-gray-500">
//                 {agent.Brokerage || 'Real Estate Agent'}
//                 {' - '}
//                 {agent.Location || 'CA'}
//               </p>
//             </div>
//             <div className="mt-2 sm:mt-0 flex sm:flex-col items-start sm:items-end gap-4 sm:gap-0">
//               <div className="text-sm font-medium text-black">
//                 {agent.homesSoldLastYear || 0}{' '}
//                 <span className="text-gray-500 font-normal">
//                   homes sold last year
//                 </span>
//               </div>
//               <div className="flex items-center text-sm font-bold text-black">
//                 <Star className="w-4 h-4 text-orange-500 fill-orange-500 mr-1" />
//                 {agent.avgRating ? Number(agent.avgRating).toFixed(1) : 'N/A'}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ));
//   }, [filteredAgents, highlightMatch, goToAgentProfile]);

//   const placeholderText =
//     searchMode === 'location'
//       ? 'Search by city, area or region'
//       : 'Search by agent name or email';

//   const handleLocationSuggestionClick = (suggestion: LocationSuggestion) => {
//     setSearchMode('location');
//     setIsSearchFocused(false);
//     setSearchQuery(suggestion.label);

//     const qParam = encodeURIComponent(suggestion.token.toLowerCase());
//     router.push(`/agents/search?query=${qParam}&mode=location`);
//   };

//   return (
//     <>
//       <div className="fixed w-full z-50 top-0 left-0">
//         <MainNavPages />
//       </div>

//       <div className={`text-black relative pt-28 -mt-28 ${className}`}>
//         <div className="relative w-full min-h-[15.5rem] sm:min-h-[36rem] md:min-h-[42rem] lg:min-h-[48rem] overflow-visible bg-[url('/assets/images/agents-hero.jpg')] bg-[length:205%_auto] bg-[center_top] sm:bg-[length:100%_100%] sm:bg-center bg-no-repeat">
//           <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-white/3 to-[#fff6ec]/8 sm:hidden" />
//           <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/6 to-transparent sm:hidden" />
//           <div className="absolute inset-x-0 bottom-0 h-0 sm:hidden" />

//           <div className="relative inset-0 h-full flex flex-col items-center justify-start sm:justify-center px-4 sm:px-6 md:px-12 lg:px-20 z-20 pt-20 sm:pt-56 pb-0 sm:pb-0">
//             <h1 className="max-w-[18rem] text-center text-[1.95rem] font-medium leading-[1.15] tracking-[-0.03em] text-black drop-shadow-sm sm:max-w-4xl sm:text-[2.75rem] md:text-[3.35rem] sm:leading-tight mb-3 sm:mb-6 sm:drop-shadow-lg">
//               <span className="block sm:inline">Discover Agent</span>
//               <span className="block sm:inline">Possibilities With</span>
//               <span className="italic font-light">Snaphomz</span>
//             </h1>

//             <div className="hidden sm:block w-full max-w-3xl relative mx-auto mt-4 sm:mt-12" ref={searchContainerRef}>
//               <div className={`relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 w-full min-h-[clamp(52px,4.8vw,60px)] sm:h-[clamp(52px,4.8vw,60px)] bg-white border-[3px] sm:border-4 border-[#C08C73] shadow-xl overflow-hidden px-2 sm:pl-4 sm:pr-1 py-2 sm:py-0 z-30 transition-all duration-300 ${isSearchFocused ? 'rounded-2xl sm:rounded-t-2xl sm:rounded-b-none sm:border-b-0' : 'rounded-[1.15rem] sm:rounded-full'}`}
//               >
//                 <div className="flex items-center w-full min-w-0">
//                   <button
//                     onClick={goToSearchPage}
//                     className="flex-shrink-0 text-gray-400 mr-2 sm:mr-3 hover:text-black"
//                   >
//                     <Search className="w-[clamp(18px,2vw,24px)] h-[clamp(18px,2vw,24px)]" />
//                   </button>

//                   <input
//                     type="text"
//                     placeholder={placeholderText}
//                     className="flex-grow w-full min-w-0 h-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-[0.82rem] sm:text-[clamp(0.9rem,1.05vw,1rem)]"
//                     onFocus={() => setIsSearchFocused(true)}
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                   />

//                   {searchQuery && (
//                     <button
//                       onClick={() => setSearchQuery('')}
//                       className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2 mr-1"
//                     >
//                       <X className="w-[clamp(14px,1.5vw,20px)] h-[clamp(14px,1.5vw,20px)]" />
//                     </button>
//                   )}
//                 </div>

//                 <div className="w-full sm:w-auto flex items-center sm:ml-2 flex-shrink-0 sm:h-full py-0 sm:py-1.5">
//                   <div className="grid grid-cols-2 sm:flex bg-gray-100 rounded-full p-1 w-full sm:w-auto h-[38px] sm:h-full items-center">
//                     <button
//                       type="button"
//                       onClick={() => setSearchMode('location')}
//                       className={`h-full flex items-center justify-center px-3 sm:px-4 rounded-full transition-colors text-[0.68rem] sm:text-[clamp(0.7rem,0.9vw,0.875rem)] font-medium ${searchMode === 'location'
//                         ? 'bg-black text-white shadow-sm'
//                         : 'text-gray-600 hover:text-black'
//                         }`}
//                     >
//                       Location
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setSearchMode('name')}
//                       className={`h-full flex items-center justify-center px-3 sm:px-4 rounded-full transition-colors text-[0.68rem] sm:text-[clamp(0.7rem,0.9vw,0.875rem)] font-medium ${searchMode === 'name'
//                         ? 'bg-black text-white shadow-sm'
//                         : 'text-gray-600 hover:text-black'
//                         }`}
//                     >
//                       Agent name
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {isSearchFocused && (
//                 <div className="absolute top-full mt-2 sm:mt-0 left-0 w-full bg-white rounded-2xl sm:rounded-b-2xl sm:rounded-t-none border-4 sm:border-t-0 border-[#C08C73] shadow-2xl z-20 overflow-hidden min-h-[300px] max-h-[400px] overflow-y-auto">
//                   {searchMode === 'location' ? (
//                     <div className="p-4 bg-white h-full flex flex-col">
//                       <p className="text-gray-500 text-sm mb-3 pl-2">
//                         {query ? `${locationSuggestions.length} locations found` : 'Browse available locations'}
//                       </p>

//                       {locationSuggestions.length > 0 ? (
//                         <div className="flex flex-col divide-y divide-gray-100">
//                           {locationSuggestions.map((s) => (
//                             <button
//                               key={`${s.token}:${s.label}`}
//                               type="button"
//                               onClick={() => handleLocationSuggestionClick(s)}
//                               className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left"
//                             >
//                               <span className="w-2 h-2 rounded-full bg-gray-400 mr-3" />
//                               <span className="text-sm text-[#f97316]">{s.label}</span>
//                             </button>
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center justify-center h-full py-10 text-center">
//                           <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
//                             <Search className="w-6 h-6 text-[#1A2B49]" />
//                           </div>
//                           <h3 className="text-lg font-semibold text-black mb-2">No locations found</h3>
//                           <p className="text-gray-500 text-sm">Try a different city, area, or region.</p>
//                         </div>
//                       )}
//                     </div>
//                   ) : query === '' ? (
//                     <div className="p-10 flex flex-col items-center text-center h-full">
//                       <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
//                         <Search className="w-6 h-6 text-[#1A2B49]" />
//                       </div>
//                       <h3 className="text-lg font-semibold text-black mb-2">Begin your agent search</h3>
//                       <p className="text-gray-500 text-sm max-w-md">
//                         Type a name or email to find an agent.
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="p-4 bg-white h-full flex flex-col">
//                       {filteredAgents.length > 0 ? (
//                         <>
//                           <p className="text-gray-500 text-sm mb-3 pl-2">
//                             {filteredAgents.length} agents found
//                           </p>
//                           <div className="flex flex-col gap-3">{agentCards}</div>

//                           <button
//                             onClick={goToSearchPage}
//                             className="w-full mt-4 py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
//                           >
//                             See all results for &quot;{searchQuery}&quot;
//                             <ArrowRight className="w-4 h-4" />
//                           </button>
//                         </>
//                       ) : (
//                         <div className="flex flex-col items-center justify-center h-full py-10 text-center">
//                           <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
//                             <Search className="w-6 h-6 text-[#1A2B49]" />
//                           </div>
//                           <h3 className="text-lg font-semibold text-black mb-2">No agents found</h3>
//                           <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="sm:hidden bg-[#FFF6EC] px-2 pb-10 pt-8">
//           <p className="mx-auto max-w-[19rem] text-center text-[0.95rem] leading-8 text-[#6E645A]">
//             Start your journey with the right guide — explore our trusted directory of experienced agents or invite someone you already trust to walk the process with you.
//           </p>

//           <form
//             onSubmit={goToSearchPageForMobile}
//             ref={mobileSearchContainerRef}
//             className="mx-auto mt-8 w-[calc(100%-12px)] max-w-[21.5rem] rounded-[1rem] border border-[#D8CCBC] bg-[#FFF6EC] px-4 py-5 shadow-[0_10px_30px_rgba(73,44,22,0.08)]"
//           >
//             <h2 className="text-center text-[1.12rem] font-medium leading-none text-[#201611]">
//               Search For An <span className="font-light">Agent</span>
//             </h2>

//             <div className="mt-5 flex items-center rounded-md bg-[#F3E9DE] px-4 py-3.5">
//               <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#C8BBAE]" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onFocus={() => setIsSearchFocused(true)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={placeholderText}
//                 className="ml-2 w-full border-none bg-transparent text-[0.82rem] text-[#4D4036] outline-none placeholder:text-[#C0B2A4]"
//               />
//               {searchQuery && (
//                 <button
//                   type="button"
//                   onClick={() => setSearchQuery('')}
//                   className="ml-2 text-[#B8A999]"
//                 >
//                   <X className="h-3.5 w-3.5" />
//                 </button>
//               )}
//             </div>

//             <div className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-[#F3E9DE] p-1">
//               <button
//                 type="button"
//                 onClick={() => setSearchMode('location')}
//                 className={`rounded-full px-3 py-2 text-[0.78rem] font-medium transition-colors ${
//                   searchMode === 'location' ? 'bg-black text-white' : 'text-[#6E645A]'
//                 }`}
//               >
//                 Location
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setSearchMode('name')}
//                 className={`rounded-full px-3 py-2 text-[0.78rem] font-medium transition-colors ${
//                   searchMode === 'name' ? 'bg-black text-white' : 'text-[#6E645A]'
//                 }`}
//               >
//                 Agent name
//               </button>
//             </div>

//             {isSearchFocused && (
//               <div className="mt-3 max-h-[18rem] overflow-y-auto rounded-xl border border-[#E8D8C8] bg-white">
//                 {searchMode === 'location' ? (
//                   <div className="p-3">
//                     <p className="mb-2 text-[0.72rem] text-[#8D8278]">
//                       {query ? `${locationSuggestions.length} locations found` : 'Browse available locations'}
//                     </p>
//                     {locationSuggestions.length > 0 ? (
//                       <div className="flex flex-col divide-y divide-[#F1E6DA]">
//                         {locationSuggestions.map((s) => (
//                           <button
//                             key={`${s.token}:${s.label}`}
//                             type="button"
//                             onClick={() => handleLocationSuggestionClick(s)}
//                             className="flex w-full items-center px-2 py-3 text-left text-[0.82rem] text-[#3F342C]"
//                           >
//                             <span className="mr-3 h-2 w-2 rounded-full bg-[#C8B39F]" />
//                             {s.label}
//                           </button>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="py-6 text-center text-[0.78rem] text-[#8D8278]">
//                         Try a different city, area, or region.
//                       </div>
//                     )}
//                   </div>
//                 ) : query === '' ? (
//                   <div className="p-4 text-center text-[0.78rem] text-[#8D8278]">
//                     Type a name or email to find an agent.
//                   </div>
//                 ) : filteredAgents.length > 0 ? (
//                   <div className="flex flex-col gap-2 p-3">
//                     {filteredAgents.slice(0, 4).map((agent) => (
//                       <button
//                         key={agent.id}
//                         type="button"
//                         onClick={() => goToAgentProfile(agent.id)}
//                         className="flex items-center rounded-lg border border-[#F1E6DA] bg-[#FFFCF8] px-3 py-3 text-left"
//                       >
//                         <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#E9DCCF]">
//                           <Image
//                             src={agent.profile_image_url || '/assets/images/agetn-hero-deop.jpg'}
//                             alt={agent.Name || 'Agent'}
//                             fill
//                             className="object-cover"
//                           />
//                         </div>
//                         <div className="ml-3 min-w-0">
//                           <p className="truncate text-[0.84rem] font-semibold text-[#201611]">
//                             {agent.Name}
//                           </p>
//                           <p className="truncate text-[0.74rem] text-[#7F7267]">
//                             {agent.agentEmail || agent.Location || 'Real Estate Agent'}
//                           </p>
//                         </div>
//                       </button>
//                     ))}
//                     <button
//                       type="submit"
//                       className="mt-1 rounded-lg bg-black px-3 py-2.5 text-[0.8rem] font-medium text-white"
//                     >
//                       See all results
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="p-4 text-center text-[0.78rem] text-[#8D8278]">
//                     No agents found. Try adjusting your search.
//                   </div>
//                 )}
//               </div>
//             )}

//             <p className="mt-5 text-center text-[0.88rem] text-[#7F7267]">
//               Can&apos;t find your agent?{' '}
//               <a href="#" className="font-semibold text-[#201611]">
//                 Invite them here
//               </a>
//             </p>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }
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
  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/auth/graphql';

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('location');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [nameAgents, setNameAgents] = useState<any[]>(agents);
  const [locationAgents, setLocationAgents] = useState<any[]>(agents);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const query = deferredSearchQuery.toLowerCase().trim();

  const immediateQuery = searchQuery.toLowerCase().trim();

  const fetchExternalAgents = useCallback(
    async ({
      limit,
      search,
      signal,
    }: {
      limit: number;
      search?: string;
      signal: AbortSignal;
    }) => {
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
                  avgRatingForCustomerDisplay
                  homesSoldLastYear
                }
              }
            }
          `,
          variables: {
            limit,
            offset: 0,
            search,
          },
        }),
        signal,
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
    },
    [GRAPHQL_URI]
  );

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
      locationAgents,
      showAllWhenEmpty
    );
    setLocationSuggestions(suggestions);
  }, [deferredSearchQuery, searchMode, locationAgents, query]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNameAgents() {
      if (searchMode !== 'name') return;
      try {
        const data = await fetchExternalAgents({
          limit: 100,
          search: immediateQuery || undefined,
          signal: controller.signal,
        });
        setNameAgents(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Error loading agents:', err);
        }
      }
    }

    loadNameAgents();
    return () => controller.abort();
  }, [searchMode, immediateQuery, fetchExternalAgents]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLocationAgents() {
      if (searchMode !== 'location') return;
      try {
        const data = await fetchExternalAgents({
          limit: 1000,
          signal: controller.signal,
        });
        setLocationAgents(data);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Error loading agents for location:', err);
        }
      }
    }

    loadLocationAgents();
    return () => controller.abort();
  }, [searchMode, fetchExternalAgents]);

  const filteredAgents = useMemo(() => {
    if (searchMode !== 'name') return [];
    if (!query) return nameAgents;

    return nameAgents.filter((agent) => {
      const name = (agent.Name || '').toLowerCase();
      const email = (agent.agentEmail || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [nameAgents, query, searchMode]);

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

      <div className={`text-black relative pt-28 -mt-28 ${className}`}>
        <div className="relative w-full min-h-[24rem] sm:min-h-[36rem] md:min-h-[42rem] lg:min-h-[48rem] overflow-visible bg-[url('/assets/images/agents-hero.jpg')] bg-[length:205%_auto] bg-[center_top] sm:bg-[length:100%_100%] sm:bg-center bg-no-repeat">
          <div className="relative inset-0 h-full flex flex-col items-center justify-start sm:justify-center px-4 sm:px-6 md:px-12 lg:px-20 z-20 pt-24 sm:pt-56 pb-6 sm:pb-0">
            <h1 className="max-w-[17rem] text-center text-[1.95rem] font-semibold leading-[1.08] text-black drop-shadow-sm sm:max-w-4xl sm:text-[2.75rem] md:text-[3.35rem] sm:leading-tight mb-3 sm:mb-6 sm:drop-shadow-lg">Discover Agent Possibilities
              <br />
              <span className=''>With</span>
              <span className="italic font-light">Snaphomz</span>
            </h1>

            <div className="w-full max-w-3xl relative mx-auto mt-4 sm:mt-12" ref={searchContainerRef}>
              <div className={`relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 w-full min-h-[clamp(52px,4.8vw,60px)] sm:h-[clamp(52px,4.8vw,60px)] bg-white border-[3px] sm:border-4 border-[#C08C73] shadow-xl overflow-hidden px-2 sm:pl-4 sm:pr-1 py-2 sm:py-0 z-30 transition-all duration-300 ${isSearchFocused ? 'rounded-t-[1.15rem] rounded-b-none border-b-0 sm:rounded-t-2xl sm:rounded-b-none' : 'rounded-[1.15rem] sm:rounded-full'}`}
              >
                <div className="flex items-center w-full min-w-0">
                  <button
                    onClick={goToSearchPage}
                    className="flex-shrink-0 text-gray-400 mr-2 sm:mr-3 hover:text-black"
                  >
                    <Search className="w-[clamp(18px,2vw,24px)] h-[clamp(18px,2vw,24px)]" />
                  </button>

                  <input
                    type="text"
                    placeholder={placeholderText}
                    className="flex-grow w-full min-w-0 h-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-[0.82rem] sm:text-[clamp(0.9rem,1.05vw,1rem)]"
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
                      <X className="w-[clamp(14px,1.5vw,20px)] h-[clamp(14px,1.5vw,20px)]" />
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-auto flex items-center sm:ml-2 flex-shrink-0 sm:h-full py-0 sm:py-1.5">
                  <div className="grid grid-cols-2 sm:flex bg-gray-100 rounded-full p-1 w-full sm:w-auto h-[38px] sm:h-full items-center">
                    <button
                      type="button"
                      onClick={() => setSearchMode('location')}
                      className={`h-full flex items-center justify-center px-3 sm:px-4 rounded-full transition-colors text-[0.68rem] sm:text-[clamp(0.7rem,0.9vw,0.875rem)] font-medium ${searchMode === 'location'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-600 hover:text-black'
                        }`}
                    >
                      Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMode('name')}
                      className={`h-full flex items-center justify-center px-3 sm:px-4 rounded-full transition-colors text-[0.68rem] sm:text-[clamp(0.7rem,0.9vw,0.875rem)] font-medium ${searchMode === 'name'
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
                <div className="absolute top-full left-0 w-full bg-white rounded-b-[1.15rem] rounded-t-none sm:rounded-b-2xl sm:rounded-t-none border-[3px] sm:border-4 border-t-0 border-[#C08C73] shadow-2xl z-20 overflow-hidden min-h-[300px] max-h-[400px] overflow-y-auto">
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
                            See all results for &quot;{searchQuery}&quot;
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

            {/* Removed the three hero cards below the search bar per request */}

          </div>
        </div>
      </div>
    </>
  );
}
