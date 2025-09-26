'use client';

import * as React from 'react';
import Image from 'next/image';
import { useModalContext } from '@/providers/modal-provider';
import { Skeleton } from '@/components/ui/skeleton';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownAZ, ArrowRight, ArrowUpAZ, Phone, Search } from 'lucide-react';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { userData } from '@/slices/auth/auth.slice';
import { useSelector } from 'react-redux';
import useDebounce from '@/hooks/utils/debounce';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { SocketContext } from '@/providers/socket.context';
import { UseSellerAuthAPI } from '@/hooks/api/start-process/auth_api';
import { error, success } from '@/components/alert/notify';
import axios from 'axios';

export const SellingAgentDirectoryBox: React.FC = () => {
  const { openModal } = useModalContext();
  const params = useParams();
  const propertyId = params?.id;
  const [search, setSearch] = React.useState('');
  const [filteredAgents, setFilteredAgents] = React.useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agentDetails,setAgentDetails] = React.useState<any>(null);
  const [email, setEmail] = React.useState('');
  const [searchedAgents, setSearchedAgents] = React.useState<{ _id: string; fullname: string; region: string; email: string; }[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [loading, setLoading] = React.useState(false);
  const [loadingAgentId, setLoadingAgentId] = React.useState<string | null>(null);
  const { getAgentsMutation, getAllAgents, getAllAgentsMutation } = useUserAuthApi();
  const { agentInvitationMutation } = UseSellerAuthAPI()
  const [agents, setAgents] = React.useState<Agent[] | []>([]);
  const [selectedAgent, setSelectedAgent] = React.useState("")
  const debounce = useDebounce();
  const currentUser = useSelector(userData);
  const engagementId = searchParams.get('engagementId');
  const propertyData = useSelector((state: any) => state.property.engagedProperty)
  const meansType = searchParams.get("mean_type")
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const { socket, state, setState } = React.useContext(SocketContext)
  const [receiverId, setRecieverId] = React.useState<string>("")
  const claimedProperty = useSelector((state: any) => state?.property?.claimProperty);
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || "https://ai.snaphomz.com";
  const dummyAgents = [
    {
      _id: '1',
      fullname: 'John Doe',
      region: 'New York, NY',
      email: "jhon@gmail.com"
    },
    {
      _id: '2',
      fullname: 'Jane Smith',
      region: 'Los Angeles, CA',
      email: "jane@gmail.com"
    },
    {
      _id: '3',
      fullname: 'Michael Johnson',
      region: 'Chicago, IL',
      email: "michael@gmail.com"
    },
  ];

  const handleAgentSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Value ", value);

    setEmail(value);

    if (value.trim().length > 0) {
      setLoading(true);
      setAgents([] as Agent[])
      setTimeout(() => {
        const filteredAgents = dummyAgents.filter((agent) =>
          agent.email.toLowerCase().includes(value.toLowerCase()) ||
          agent.fullname.toLowerCase().includes(value.toLowerCase())
        );

        getAgentsMutation.mutateAsync(value, {
          onSuccess: (data: any) => {
            if (data?.data?.searchAgents?.length) {
              setAgents(data?.data?.searchAgents)
            } else {
              error({ message: 'No any agents found' })
            }
          },
          onError: (error) => {
            console.error('Error fetching agents:', error);
          },
        });

        setSearchedAgents(filteredAgents);
        setLoading(false);
      }, 500);
    }
    else {
      setSearchedAgents([]);
    }
  }, []);

  const getAllListedAgents = () => {
    setLoading(true);
    getAllAgentsMutation.mutateAsync({ limit: 100, offset: 0 }, {
      onSuccess: (data) => {
        setAgents(data)
        setLoading(false);
      },
      onError: () => {
        setLoading(false)
      }
    })
  }

  const sendAgentInvitation = async (agent: any) => {
    const agentInvitationData = {
      firstname: agent?.firstName,
      lastname: agent?.lastName,
      email: agent?.email,
      id: "" + claimedProperty?.id,
      listingid: "" + claimedProperty?.listingid,
      agent_id: agent?.id,
      owner_id: currentUser?.id,
      status: 'accepted'
    }
    const response = await axios.post(`${AI_SEARCH_ENDPOINT}/api/selling_agent`, agentInvitationData);
    success({ message: response?.data?.message })
   // router.push(`/dashboard/seller/listing/listingprocess?id=${claimedProperty?.id}`)
   router.push(`/dashboard/seller/listing/listingprocess?id=${propertyId}`)
  }

  const handleSearch = () => {
    const query = search.toLowerCase();
    const results = dummyAgents.filter(
      (agent) =>
        agent.fullname.toLowerCase().includes(query) ||
        agent.region.toLowerCase().includes(query)
    );
    // setFilteredAgents(results);
  };

  React.useEffect(() => {
    getAllAgents.mutate('', {
      onSuccess: (data) => {
        setAgents(data)
      },
      onError: (err) => {
        console.log(err)
      }
    })
  }, [])

  React.useEffect(() => {
    getAllListedAgents()
  }, [])
  React.useEffect(() => {
    const sortedAgents = [...agents].sort((a, b) => {
      const nameA = a.firstName?.toLowerCase() || '';
      const nameB = b.firstName?.toLowerCase() || '';
      if (sortOrder === 'asc') return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });
    setAgents(sortedAgents)
  }, [sortOrder])

  const agentsToRender = filteredAgents.length > 0 || search ? filteredAgents : dummyAgents;

  const debounceSearch = React.useCallback(debounce(handleAgentSearch, 1400), []);

  return (
    <div className="h-auto rounded-3xl bg-white p-8">
      <Heading className="mb-10 text-2xl font-semibold" title="Choose Snaphomz Agents" />

      {/* Search + Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search agents by name or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            debounceSearch(e);
          }}
          className="flex-1 p-4 text-md"
        />
        <Button
          onClick={handleSearch}
          className="flex items-center gap-2 bg-primary-main text-white"
        >
          <Search size={16} />
          Search
        </Button>
      </div>

      {/* Sort */}
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 text-sm font-medium"
        >
          {sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
          {sortOrder === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
        </Button>
      </div>

      {/* Agents Grid */}
      {agents?.length > 0 ? (
        <div className="mt-4 w-full rounded-lg">
          <ul className="grid mt-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => {
              const initials = agent.firstName
                ? agent.firstName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                : 'A';

              const isSelected = selectedIndex === index;

              return (
                <li
                  key={agent.id}
                  className={`border rounded-xl overflow-hidden shadow-sm transition hover:shadow-md
                ${isSelected ? 'ring-2 ring-primary-main bg-gray-50' : 'bg-white'}
              `}
                  onMouseEnter={() => setSelectedIndex(index)}
                ><div className="flex h-66 w-66 items-center justify-center p-12">
                {agent.profile? (
                 <Image
                 src={agent.profile}
                 alt={agent.firstName}
                 height={40}
                 width={40}
                 unoptimized
                 className="object-cover h-48 w-48 rounded-full"
               />
                ) : (
                  <div className="h-48 w-48 rounded-full bg-orange-400 text-white flex items-center justify-center text-4xl font-semibold uppercase">
                    {agent.firstName[0]}{agent.lastName[0]}
                  </div>
                )}
              </div>

              

                  {/* Details */}
                  <div className="flex flex-col p-4 border-t gap-2">
                    <p className="text-lg font-semibold truncate">
                      {agent.firstName} {agent.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={16} color="orange" />
                      {agent.phone}
                    </div>

                    {/* Invite Button */}
                    <button
                      className={`mt-4 px-4 py-2 rounded-full text-sm font-medium transition
                    ${selectedAgent === agent.id
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-black hover:bg-gray-300'}
                  `}
                      disabled={loadingAgentId === agent.id}
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        setEmail(agent.email);
                        setLoadingAgentId(agent.id);
                        sendAgentInvitation(agent);
                      }}
                    >
                      {loadingAgentId === agent.id ? (
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                      ) : (
                        'Invite'
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-10 text-center text-gray-500 text-sm">No agents found.</div>
      )}

      {/* Load Directory Button */}
      {agentsToRender.length > 0 && (
        <div className="mt-10 flex items-center justify-center">
          <Button
            variant="secondary"
            onClick={() => openModal('select-agent')}
            className="border border-black bg-white px-12 font-semibold rounded-full"
          >
            Load Directory
          </Button>
        </div>
      )}
    </div>

  );
};


