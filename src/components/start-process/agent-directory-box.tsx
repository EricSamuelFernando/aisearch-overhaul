'use client';

import * as React from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { Phone, Share2, ArrowRight } from 'lucide-react';
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
  const [loading,setLoading] = React.useState(false);
  const propertyData = useSelector((state: any) => state.property.engagedProperty);
  const [agentDetails,setAgentDetails] = React.useState<any>(null);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [sortOption, setSortOption] = React.useState('firstName-asc');
  const [selectedAgent, setSelectedAgent] = React.useState<any>();
  const [loadingAgentId, setLoadingAgentId] = React.useState<string | null>(null);
  const [showDetails,setShowDetails] = React.useState(false);
  const engagementId = searchParams.get('engagementId');
  const meansType = searchParams.get('mean_type');
  const { getAllAgentsMutation, getAgentsMutation, agentIvitationMutation } = useUserAuthApi();
  const propertyId = params?.propertyId || ''
  const engagementData = useSelector((state:any)=>state.property?.engagedProperty);
  const dispatch = useDispatch();
  const sortOptions = [
    { label: 'Agent First Name A-Z', value: 'firstName-asc' },
    { label: 'Agent First Name Z-A', value: 'firstName-desc' },
    { label: 'Agent Last Name A-Z', value: 'lastName-asc' },
    { label: 'Agent Last Name Z-A', value: 'lastName-desc' },
  ];

  const loadAgents = () => {
    getAllAgentsMutation.mutateAsync({ limit: 100, offset: 0 }, {
      onSuccess: (data) => setAgents(data || []),
      onError: () => error({ message: 'Failed to load agents' }),
    });
  };

  const sendAgentInvitation = (agentId: string) => {
    setLoading(true);
    const payload = {
      agentType: currentUser?.account_type,
      userId: currentUser?.id,
      agentId,
      is_accepted: 'pending',
      engagementId,
    };

    agentIvitationMutation.mutateAsync(payload, {
      onSuccess: (response: any) => {
        setLoading(false)
        // console.log("Response : ",response);
        if(response?.errors?.length){
          error({message:response?.errors?.[0]?.message})
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
        if(engagementData){
          const participent = [
            {
              id:response?.data?.createParticipant?.id,
              userId:currentUser?.id,
              bra_id:null,
              is_accepted:"pending",
              agent:selectedAgent
            }
          ]
          dispatch(setEngagedProperty({
            ...engagementData,
            participants:participent
          }));
        }
        setLoading(false)
        success({ message: 'Invitation sent!' });
        setSelectedAgent('');
        setAgents([]);
        setLoadingAgentId(null);

        if (meansType)
            router.push('/dashboard/buyer') 
          // router.push(`/dashboard/buyer/property/${propertyId}`);
      },
      onError: () => {
        error({ message: 'Failed to send invitation' })
        setLoading(false)
      },
    });
  };

  React.useEffect(() => {
    loadAgents();
  }, []);

  const sortedAgents = sortAgents(agents, sortOption);

  return (
    <div className="h-full w-full rounded-3xl bg-white p-10 px-8">
      <Heading className="mb-10 text-2xl font-medium" title="Choose Snaphomz Agents" />

      <div className="mb-6 w-full">
        <AsyncAutocomplete setAgentSearch={setAgents} />
      </div>

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
        <ul className="mt-4 flex flex-wrap gap-4">
          {sortedAgents.map((agent) => (
            <li key={agent.id} className="w-66 flex flex-col overflow-hidden rounded-lg border transition bg-white">
              <div className="flex h-66 w-66 items-center justify-center p-12">
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
              <div className="p-4 border-t">
                <p className="text-2xl font-semibold">{agent.firstName} {agent.lastName}</p>
                <p className="text-xs text-gray-500">{agent.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Phone size={16} color="orange" />
                  <p className="text-xs text-gray-500">{agent.phone}</p>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    disabled={loading}
                    className={`flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium ${
                      selectedAgent?.id === agent.id ? 'bg-black text-white' : 'bg-gray-300 text-black hover:bg-gray-400'
                    }`}
                    onClick={() => {
                      setSelectedAgent(agent);
                      sendAgentInvitation(agent.id);
                    }}
                  >
                    <Share2 size={14} /> Invite
                  </button>
                  <button
                    onClick={() => {
                      console.log('Agent Detail:', agent);
                      setAgentDetails(agent);
                      // setShowDetails(true);
                      router.push(`/agent/${agent.id}`)
                    }}
                    className="flex items-center gap-2 rounded-full bg-gray-300 px-4 py-1 text-xs font-medium text-black hover:bg-gray-400"
                  >
                    <ArrowRight size={14} /> Check Detail
                  </button>
                  <button
                    onClick={() => {
                      console.log('Agent Detail:', agent);
                      setAgentDetails(agent);
                      // setShowDetails(true);
                      router.push(`/agent/${agent.id}`)
                    }}
                    className="flex items-center gap-2 rounded-full bg-gray-300 px-4 py-1 text-xs font-medium text-black hover:bg-gray-400"
                  >
                    <ArrowRight size={14} /> Contact Agent
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
