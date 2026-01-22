'use client';

import * as React from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { Phone, Share2, ArrowRight, Search, ChevronDown } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { AsyncAutocomplete } from '../ui/async-auto-complete';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useModalContext } from '@/providers/modal-provider';
import { SocketContext } from '@/providers/socket.context';
import { userData } from '@/slices/auth/auth.slice';
import { error, success } from '../alert/notify';
import AgentDetailModal from '../ui/user_details.modal';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { AgentCard } from './agent-card';
import { Input } from '@/components/ui/input';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profile?: string;
}

const sortAgents = (agents: Agent[], sortOption: string): Agent[] => {
  const [key, order] = sortOption.split('-');
  return [...agents].sort((a, b) => {
    const aVal = typeof a[key as keyof Agent] === 'string' ? (a[key as keyof Agent] as string).toLowerCase() : '';
    const bVal = typeof b[key as keyof Agent] === 'string' ? (b[key as keyof Agent] as string).toLowerCase() : '';
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const AgentDirectoryBox: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { openModal } = useModalContext();
  const { socket } = React.useContext(SocketContext);
  const currentUser = useSelector(userData);
  const [loading, setLoading] = React.useState(false);
  const propertyData = useSelector((state: any) => state.property.engagedProperty);
  const [agentDetails, setAgentDetails] = React.useState<any>(null);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [sortOption, setSortOption] = React.useState('firstName-asc');
  const [selectedAgent, setSelectedAgent] = React.useState<any>();
  const [loadingAgentId, setLoadingAgentId] = React.useState<string | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const engagementId = searchParams.get('engagementId');
  const meansType = searchParams.get('mean_type');
  const { getAllAgentsMutation, getAgentsMutation, agentIvitationMutation } = useUserAuthApi();
  const propertyId = params?.propertyId || ''
  const engagementData = useSelector((state: any) => state.property?.engagedProperty);
  const dispatch = useDispatch();
  const sortOptions = [
    { label: 'Agent First Name A-Z', value: 'firstName-asc' },
    { label: 'Agent First Name Z-A', value: 'firstName-desc' },
    { label: 'Agent Last Name A-Z', value: 'lastName-asc' },
    { label: 'Agent Last Name Z-A', value: 'lastName-desc' },
  ];

  // Search and filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [propertyType, setPropertyType] = React.useState('');
  const [budgetRange, setBudgetRange] = React.useState('');
  const [agentRating, setAgentRating] = React.useState('');

  const propertyTypes = [
    { value: '', label: 'Property Type' },
    { value: 'Residential', label: 'Residential' },
    { value: 'Residential Income', label: 'Residential Income' },
    { value: 'Land', label: 'Land' },
    { value: 'Commercial Sale', label: 'Commercial Sale' },
  ];

  const budgetRanges = [
    { value: '', label: 'Budget Range' },
    { value: '0-1000000', label: '$1M or less' },
    { value: '1000000-1200000', label: '$1M - $1.2M' },
    { value: '1200000-1500000', label: '$1.2M - $1.5M' },
    { value: '1500000-2000000', label: '$1.5M - $2M' },
    { value: '2000000+', label: '$2M +' },
  ];

  const ratingOptions = [
    { value: '', label: 'Agent Rating' },
    { value: '4.5+', label: '4.5+ Stars' },
    { value: '4.0+', label: '4.0+ Stars' },
    { value: '3.5+', label: '3.5+ Stars' },
    { value: '3.0+', label: '3.0+ Stars' },
  ];

  const handleSearch = () => {
    // Implement search logic here
    loadAgents();
  };

  const loadAgents = () => {
    getAllAgentsMutation.mutateAsync({ limit: 100, offset: 0 }, {
      onSuccess: (data) => setAgents(data || []),
      onError: () => error({ message: 'Failed to load agents' }),
    });
  };

  const sendAgentInvitation = (agentId: string) => {
    setLoading(true);
    setLoadingAgentId(agentId);
    const payload = {
      agentType: currentUser?.account_type,
      userId: currentUser?.id,
      agentId,
      is_accepted: 'pending',
      engagementId: engagementId || undefined,
    };

    agentIvitationMutation.mutateAsync(payload, {
      onSuccess: (response: any) => {
        setLoading(false)
        setLoadingAgentId(null);
        // console.log("Response : ",response);
        if (response?.errors?.length) {
          error({ message: response?.errors?.[0]?.message })
          return;
        }
        socket?.emit('send_property_invitation', {
          reciepent: agentId,
          userName: `${currentUser.firstname} ${currentUser.lastname}`,
          userEmail: currentUser?.email,
          propertyImage: propertyData?.propertyImage,
          propertyAddress: propertyData?.propertyAddress,
          id: response?.data?.createParticipant?.id,
        });
        if (engagementData) {
          const participent = [
            {
              id: response?.data?.createParticipant?.id,
              userId: currentUser?.id,
              bra_id: null,
              is_accepted: "pending",
              agent: selectedAgent
            }
          ]
          dispatch(setEngagedProperty({
            ...engagementData,
            participants: participent
          }));
        }
        success({ message: 'Invitation sent!' });
        setSelectedAgent('');
        setAgents([]);

        if (meansType)
          router.push('/dashboard/buyer')
        // router.push(`/dashboard/buyer/property/${propertyId}`);
      },
      onError: () => {
        error({ message: 'Failed to send invitation' })
        setLoading(false)
        setLoadingAgentId(null);
      },
    });
  };

  React.useEffect(() => {
    loadAgents();
  }, []);

  const sortedAgents = sortAgents(agents, sortOption);

  return (
    <div className="h-full w-full rounded-3xl bg-transparent p-10 px-8">
      {/* Search and Filter Bar */}
      <div className="mb-8 w-full">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search name, email or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Location/Zipcode Input */}
          <div className="min-w-[150px]">
            <Input
              type="text"
              placeholder="Location/Zipcode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Property Type Dropdown */}
          <div className="min-w-[150px] relative">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              {propertyTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Budget Range Dropdown */}
          <div className="min-w-[150px] relative">
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              {budgetRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Agent Rating Dropdown */}
          <div className="min-w-[150px] relative">
            <select
              value={agentRating}
              onChange={(e) => setAgentRating(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Search agent
          </Button>
        </div>
      </div>

      <Heading className="text-2xl font-semibold text-gray-900" title="All Agents" />

      <div className="mb-4 flex justify-end">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="rounded-md border border-gray-300 p-2 text-sm shadow-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {sortedAgents.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={{
                  id: agent.id,
                  firstName: agent.firstName,
                  firstname: agent.firstName,
                  lastName: agent.lastName,
                  lastname: agent.lastName,
                  email: agent.email,
                  phone: agent.phone,
                  profile: agent.profile,
                  mobile: (agent as any).mobile,
                }}
                onInvite={(agentId) => {
                  setSelectedAgent(agent);
                  sendAgentInvitation(agentId);
                }}
                onContact={(agent) => {
                  setAgentDetails(agent);
                  router.push(`/agent/${agent.id}`);
                }}
                onCheckProfile={(agentId) => {
                  router.push(`/agent/${agentId}`);
                }}
                isLoading={loading && loadingAgentId === agent.id}
                isSelected={selectedAgent?.id === agent.id}
              />
            ))}
          </div>
        </div>
      )}

      {agents.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => openModal('select-agent')}
            className="border border-black bg-white px-12 font-semibold"
            roundness="full"
          >
            Load Directory
          </Button>
        </div>
      )}
      {showDetails && (
        <AgentDetailModal
          agent={agentDetails}
          onClose={() => {
            setShowDetails(false);
            setAgentDetails(null);
          }}
        />
      )}
    </div>

  );
};
