'use client';

import * as React from 'react';
import { useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { SocketContext } from '@/providers/socket.context';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { error, success } from '@/components/alert/notify';
import type { WebSocketClient } from '@/lib/websocket-client';

// Location search helpers (from agents-hero.tsx)
type LocationMapping = {
  token: string;
  city: string;
  state: string;
  synonyms: string[];
};

type LocationSuggestion = {
  label: string;
  token: string;
};

function cleanLocationForMatch(raw: string): string {
  if (!raw) return '';
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/^[^a-z0-9]+/g, '');
  s = s.replace(/\b\d{5}(?:-\d{4})?\b/g, '');
  s = s.replace(/\./g, '');
  s = s.replace(/\s*,\s*/g, ', ');
  s = s.replace(/\s+/g, ' ').trim();
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
    synonyms: ['sd', 'san diego', 'san diego, ca', 'san diego ca', 'san diejo', 'san deigo', 'san deigo, ca', 'san deigo ca'],
  },
  {
    token: 'sf',
    city: 'San Francisco',
    state: 'CA',
    synonyms: ['sf', 'san francisco', 'san francisco, ca', 'san francisco ca', 'san fransisco', 'san franscisco', 'san farancisco', 'san francisico', 'san fran'],
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

function normalizeNameForSearch(raw: string): string {
  if (!raw) return '';
  return String(raw).replace(/^[^a-z0-9]+/i, '').trim().toLowerCase();
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

interface AgentDirectoryWrapperProps {
  engagementId: string;
  propertyId: string;
  onClose: () => void;
}

export const AgentDirectoryWrapper: React.FC<AgentDirectoryWrapperProps> = ({ engagementId, propertyId, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { agentIvitationMutation, externalAgentIvitationMutation } = useUserAuthApi();
  const socketContext = React.useContext(SocketContext);
  const wrapperSocket: WebSocketClient | null = socketContext.socket;
  const [allAgents, setAllAgents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedAgent, setSelectedAgent] = React.useState<any>();
  const [loadingAgentId, setLoadingAgentId] = React.useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchMode, setSearchMode] = React.useState<'location' | 'name'>('name');
  const [locationSuggestions, setLocationSuggestions] = React.useState<any[]>([]);
  const [locationAgents, setLocationAgents] = React.useState<any[]>([]);
  const [totalAgents, setTotalAgents] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 100;
  const isFetchingMoreRef = React.useRef(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const agentsPreservedRef = React.useRef<any[]>([]);
  const searchQueryPreservedRef = React.useRef<string>('');
  const userClearedRef = React.useRef(false);

  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/auth/graphql';

  const fetchExternalAgents = React.useCallback(
    async ({
      limit,
      offset,
      search,
      signal,
    }: {
      limit: number;
      offset?: number;
      search?: string;
      signal: AbortSignal;
    }): Promise<{ data: any[]; total: number }> => {
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
                total
                data {
                  id
                  full_name
                  email
                  phone
                  brokerage
                  locationRaw
                  profile_image_url
                }
              }
            }
          `,
          variables: {
            limit,
            offset: offset ?? 0,
            search,
          },
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const json = await response.json();
      const payload = json?.data?.externalAgents || { data: [], total: 0 };
      const data = payload?.data || [];
      return {
        total: Number(payload?.total || 0),
        data: data.map((agent: any) => ({
          ...agent,
          Name: agent.full_name || '',
          agentEmail: agent.email || undefined,
          Location: agent.locationRaw || undefined,
          Brokerage: agent.brokerage || undefined,
        })),
      };
    },
    [GRAPHQL_URI],
  );

  const engagedProperty = useSelector((state: any) => state.property.engagedProperty);
  const wrapperCurrentUser = useSelector(userData);
  const wrapperPropertyData = useSelector((state: any) => state.property.property);

  // Use deferred value exactly like agents-hero.tsx
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const query = deferredSearchQuery.toLowerCase().trim();
  const immediateQuery = searchQuery.toLowerCase().trim();

  // Always preserve searchQuery in ref - this is the source of truth
  React.useEffect(() => {
    if (searchQuery) {
      searchQueryPreservedRef.current = searchQuery;
    }
  }, [searchQuery]);

  // Restore searchQuery from ref if it gets cleared accidentally
  React.useLayoutEffect(() => {
    if (!searchQuery && searchQueryPreservedRef.current && !userClearedRef.current && searchMode === 'name') {
      setSearchQuery(searchQueryPreservedRef.current);
    }
    if (searchQuery) {
      userClearedRef.current = false;
    }
  }, [searchQuery, searchMode]);

  // Load all agents on mount when in name mode
  React.useEffect(() => {
    const controller = new AbortController();

    const loadAgentsPage = async () => {
      if (searchMode !== 'name') {
        return;
      }

      setLoading(true);
      try {
        const { data, total } = await fetchExternalAgents({
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          search: immediateQuery || undefined,
          signal: controller.signal,
        });
        setAllAgents((prev) => {
          const base = currentPage === 1 ? [] : prev;
          const merged = [...base, ...data];
          const deduped = merged.filter(
            (agent, index, arr) =>
              arr.findIndex(
                (a) => (a.id || a._id || a.email) === (agent.id || agent._id || agent.email)
              ) === index
          );
          agentsPreservedRef.current = deduped;
          return deduped;
        });
        setTotalAgents(total);
        setLoading(false);
        isFetchingMoreRef.current = false;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error loading agents:', err);
        }
        setLoading(false);
        isFetchingMoreRef.current = false;
      }
    };

    loadAgentsPage();

    return () => controller.abort();
  }, [searchMode, currentPage, immediateQuery, fetchExternalAgents]);

  // Restore agents from ref if they were lost
  React.useEffect(() => {
    if (searchMode === 'name' && allAgents.length === 0 && agentsPreservedRef.current.length > 0) {
      setAllAgents(agentsPreservedRef.current);
    }
  }, [searchMode, allAgents.length]);

  // Reset pagination when search changes
  React.useEffect(() => {
    if (searchMode === 'name') {
      setCurrentPage(1);
      setAllAgents([]);
      setTotalAgents(0);
    }
  }, [immediateQuery, searchMode]);

  // Filter agents client-side exactly like agents-hero.tsx
  const agentsToFilter = React.useMemo(() => {
    const agents = allAgents.length > 0 ? allAgents : agentsPreservedRef.current;
    if (allAgents.length > 0) {
      agentsPreservedRef.current = allAgents;
    }
    return agents;
  }, [allAgents]);

  const filteredAgents = React.useMemo(() => {
    if (searchMode !== 'name') return [];
    const searchTerm = immediateQuery;
    if (!searchTerm) return agentsToFilter;

    return agentsToFilter.filter((agent: any) => {
      const name = normalizeNameForSearch(
        agent.Name || agent.full_name || agent.firstName || agent.firstname || ''
      );
      return name.startsWith(searchTerm);
    });
  }, [agentsToFilter, searchMode, immediateQuery]);

  const hasMoreAgents = React.useMemo(() => {
    if (searchMode !== 'name') return false;
    if (!totalAgents) return false;
    return allAgents.length < totalAgents;
  }, [searchMode, totalAgents, allAgents.length]);

  // Focus input when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Focus input when search mode changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [searchMode]);

  // Load agents for location suggestions
  React.useEffect(() => {
    const controller = new AbortController();

    const loadAgentsForLocation = async () => {
      if (searchMode !== 'location') {
        setLocationSuggestions([]);
        setLocationAgents([]);
        return;
      }

      try {
        const { data } = await fetchExternalAgents({
          limit: 1000,
          signal: controller.signal,
        });
        setLocationAgents(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error loading agents for location:', err);
          setLocationAgents([]);
        }
      }
    };

    loadAgentsForLocation();

    return () => controller.abort();
  }, [searchMode]);

  // Location suggestions logic
  React.useEffect(() => {
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

  // Highlight match function
  const highlightMatch = React.useCallback(
    (text: string) => {
      const searchTerm = immediateQuery || query;
      if (!searchTerm || !text) return text;
      const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === searchTerm ? (
          <span key={i} className="text-orange-600">
            {part}
          </span>
        ) : (
          part
        )
      );
    },
    [query, searchQuery]
  );

  // Send agent invitation function - uses email for MLS data agents
  const sendAgentInvitation = React.useCallback((agent: any) => {
    const agentId = agent.id || agent._id || '';
    const agentEmail = agent.agentEmail || agent.email || '';
    const identifier = agentId || agentEmail || `agent-${Math.random()}`;

    const hasExistingInvite = engagedProperty?.participants?.some((participant: any) => {
      const participantEngagementId = participant?.engagementId;
      const engagementMatches = !participantEngagementId || participantEngagementId === engagementId;
      const status = participant?.is_accepted || "pending";
      return engagementMatches && ["pending", "accepted"].includes(status);
    });

    if (hasExistingInvite) {
      error({ message: "This property already has an invited agent." });
      return;
    }

    setLoadingAgentId(identifier);

    // Use email-based invitation for MLS data (which has email but may not have valid agentId in our DB)
    // Use agentId-based invitation only if we have a valid agentId and no email
    const useEmailInvitation = !!agentEmail;

    if (useEmailInvitation) {
      // Use email-based invitation (externalAgentIvitationMutation)
      const emailPayload = {
        agentType: wrapperCurrentUser?.account_type,
        userId: wrapperCurrentUser?.id,
        email: agentEmail,
        is_accepted: 'pending',
        engagementId: engagementId || undefined,
        ...(engagedProperty?.threadId && { threadId: engagedProperty.threadId }),
      };

      externalAgentIvitationMutation.mutateAsync(emailPayload, {
        onSuccess: (response: any) => {
          setLoadingAgentId(null);
          const { message, success: successStatus, agentId: returnedAgentId, participantId } = response || {};

          if (successStatus) {
            // Send socket notification
            if (wrapperSocket && returnedAgentId && participantId) {
              wrapperSocket.emit('send_property_invitation', {
                reciepent: returnedAgentId,
                userName: `${wrapperCurrentUser.firstname} ${wrapperCurrentUser.lastname}`,
                userEmail: wrapperCurrentUser?.email,
                propertyImage: wrapperPropertyData?.propertyImage || wrapperPropertyData?.listing?.media?.primaryListingImageUrl,
                propertyAddress: wrapperPropertyData?.propertyAddress || wrapperPropertyData?.public?.address?.label,
                id: participantId,
              });
            }

            // Update engaged property state
            if (engagedProperty && participantId && returnedAgentId) {
              const participent = [{
                id: participantId,
                userId: wrapperCurrentUser?.id,
                bra_id: null,
                is_accepted: "pending",
                agent: { ...selectedAgent, id: returnedAgentId, email: agentEmail }
              }];
              dispatch(setEngagedProperty({
                ...engagedProperty,
                participants: participent
              }));
            }

            success({ message: message || 'Invitation sent!' });
            setSelectedAgent(null);
            setIsSearchFocused(false);
            // Close modal and navigate to dashboard
            if (onClose) {
              onClose();
            }
            setTimeout(() => {
              router.push('/dashboard/buyer');
            }, 300);
          } else {
            error({ message: message || 'Failed to send invitation' });
          }
        },
        onError: (err: any) => {
          setLoadingAgentId(null);
          const errorMessage = err?.response?.data?.errors?.[0]?.message || err?.message || 'Failed to send invitation';
          error({ message: errorMessage });
        },
      });
    } else {
      // Fallback to agentId-based invitation (if no email available)
      const payload = {
        agentType: wrapperCurrentUser?.account_type,
        userId: wrapperCurrentUser?.id,
        agentId,
        is_accepted: 'pending',
        engagementId: engagementId || undefined,
      };

      agentIvitationMutation.mutateAsync(payload, {
        onSuccess: (response: any) => {
          setLoadingAgentId(null);
          if (response?.errors?.length) {
            error({ message: response?.errors?.[0]?.message });
            return;
          }
          wrapperSocket?.emit('send_property_invitation', {
            reciepent: agentId,
            userName: `${wrapperCurrentUser.firstname} ${wrapperCurrentUser.lastname}`,
            userEmail: wrapperCurrentUser?.email,
            propertyImage: wrapperPropertyData?.propertyImage || wrapperPropertyData?.listing?.media?.primaryListingImageUrl,
            propertyAddress: wrapperPropertyData?.propertyAddress || wrapperPropertyData?.public?.address?.label,
            id: response?.data?.createParticipant?.id,
          });
          if (engagedProperty) {
            const participent = [{
              id: response?.data?.createParticipant?.id,
              userId: wrapperCurrentUser?.id,
              bra_id: null,
              is_accepted: "pending",
              agent: selectedAgent
            }];
            dispatch(setEngagedProperty({
              ...engagedProperty,
              participants: participent
            }));
          }
          success({ message: 'Invitation sent!' });
          setSelectedAgent(null);
          setIsSearchFocused(false);
          if (onClose) {
            onClose();
          }
          setTimeout(() => {
            router.push('/dashboard/buyer');
          }, 300);
        },
        onError: (err: any) => {
          setLoadingAgentId(null);
          const errorMessage = err?.response?.data?.errors?.[0]?.message || err?.message || 'Failed to send invitation';
          error({ message: errorMessage });
        },
      });
    }
  }, [engagementId, wrapperCurrentUser, wrapperPropertyData, wrapperSocket, engagedProperty, selectedAgent, agentIvitationMutation, externalAgentIvitationMutation, dispatch, onClose, router]);

  // Agent cards for name mode
  const agentCards = React.useMemo(() => {
    return filteredAgents.map((agent) => {
      const agentName = agent.Name || agent.full_name || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agent';
      const agentId = agent.id || agent._id || '';
      const agentEmail = agent.agentEmail || agent.email || '';

      return (
        <div
          key={agentId || `agent-${Math.random()}`}
          className="flex items-center p-4 bg-[#FAF9F6] border border-transparent rounded-xl hover:border-orange-300 hover:bg-[#FDF4EB] transition-all group"
        >
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-bold text-black text-lg group-hover:text-orange-900">
                  {highlightMatch(agentName)}
                </h4>
                <p className="text-sm text-gray-500">
                  {agent.Brokerage || 'Real Estate Agent'}
                  {' - '}
                  {agent.Location || 'CA'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (agentId) {
                  router.push(`/agents/${agentId}`);
                }
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full text-sm font-medium transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(agent);
                if (agentId) {
                  sendAgentInvitation(agentId);
                }
              }}
              disabled={loadingAgentId === agentId || !agentId}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingAgentId === agentId ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </div>
      );
    });
  }, [filteredAgents, highlightMatch, loadingAgentId, sendAgentInvitation, router]);

  const placeholderText =
    searchMode === 'location'
      ? 'Search by city, area or region'
      : 'Search by agent name or email';

  const handleLocationSuggestionClick = (suggestion: any) => {
    const normalized = normalizeLocationQuery(suggestion.label);
    const qParam = normalized || suggestion.token.toLowerCase();
    setSearchQuery(qParam);
    setSearchMode('name');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchFocused(true);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-transparent py-6">
      {/* Search Bar */}
      <div className="w-full max-w-3xl mx-auto relative" ref={searchContainerRef}>
        <div
          className={`relative flex items-center w-full h-16 bg-white border-4 border-[#C08C73] shadow-xl overflow-hidden pl-4 pr-1 z-50 transition-all duration-300 ${isSearchFocused ? 'rounded-t-2xl rounded-b-none border-b-0' : 'rounded-full'
            }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
            className="flex-shrink-0 text-gray-400 mr-3 hover:text-black"
          >
            <Search className="w-6 h-6" />
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholderText}
            className="flex-grow w-full h-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-base"
            onFocus={() => setIsSearchFocused(true)}
            value={searchQuery || searchQueryPreservedRef.current || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              userClearedRef.current = false;
              searchQueryPreservedRef.current = newValue;
              setSearchQuery(newValue);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            onBlur={(e) => {
              const currentValue = e.target.value;
              if (currentValue) {
                searchQueryPreservedRef.current = currentValue;
                if (!searchQuery) {
                  setSearchQuery(currentValue);
                }
              }
            }}
          />

          {(searchQuery || searchQueryPreservedRef.current) && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                userClearedRef.current = true;
                setSearchQuery('');
                searchQueryPreservedRef.current = '';
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2 mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center ml-2 flex-shrink-0 h-full py-1.5">
            <div className="flex bg-gray-100 rounded-full p-1 h-full items-center">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('location');
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
                className={`h-full flex items-center px-4 rounded-full transition-colors text-sm font-medium ${searchMode === 'location'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                  }`}
              >
                Location
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('name');
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
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

        {/* Dropdown Results */}
        <div
          className="absolute top-16 left-0 w-full bg-white rounded-b-2xl border-4 border-t-0 border-[#C08C73] shadow-2xl z-40 overflow-hidden min-h-[500px] max-h-[calc(95vh-320px)] overflow-y-auto"
          onScroll={(e) => {
            if (searchMode !== 'name') return;
            if (loading || isFetchingMoreRef.current || !hasMoreAgents) return;
            const target = e.currentTarget;
            const threshold = 120;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < threshold) {
              isFetchingMoreRef.current = true;
              setCurrentPage((p) => p + 1);
            }
          }}
        >
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
              ) : query ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                  <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-[#1A2B49]" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No locations found</h3>
                  <p className="text-gray-500 text-sm">Try a different city, area, or region.</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-4 bg-white min-h-[500px] flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center flex-1 py-10">
                  <Loader2 className="animate-spin text-gray-600" size={24} />
                  <span className="ml-2 text-sm text-gray-600">Loading agents...</span>
                </div>
              ) : filteredAgents.length > 0 ? (
                <>
                  <p className="text-gray-500 text-sm mb-3 pl-2 sticky top-0 bg-white py-2 z-10 border-b pb-2">
                    {filteredAgents.length} agents found
                  </p>
                  <div className="flex flex-col gap-3 pb-4">{agentCards}</div>
                  {hasMoreAgents && (
                    <div className="flex items-center justify-center border-t pt-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="animate-spin" size={16} />
                        Loading more agents...
                      </div>
                    </div>
                  )}
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
      </div>
    </div>
  );
};

