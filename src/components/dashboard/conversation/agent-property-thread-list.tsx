import React, { useState, useContext } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChatItem from './chat-item';
import PropertyDetailCard from './property-detail-card';
import { useAuth } from '@/shared/hooks/useAuth';
import { SocketContext } from '@/providers/socket.context';
import { getProfileImageUrl } from '@/lib/utils';
import { property } from './data';
import ChatThread from './chat-thread';

interface AgentPropertyListProps {
  agent: Agent;
  propertyId:string;
  lastMessage:string;
  timeStamp:string;
  onPropertySelect: (property: any, agent: Agent) => void;
  setConversationId:(id:any)=> void;
  setStatusMessage:(message:any) => void;
  activeAgent:any;
}

export default function PropertyThreadList({
  agent,
  propertyId,
  lastMessage,
  timeStamp,
  onPropertySelect,
  setConversationId,
  setStatusMessage,
  activeAgent,
}: AgentPropertyListProps) {
  const { socket } :any = useContext(SocketContext);
  const [isOpen, setIsOpen] = useState(false);
  const {user}= useAuth()
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [selectedAgent , setSelectedAgent] = useState("")
 

  const joinConversation = async (createConversationDto:any) => {
    console.log(createConversationDto)
    
    const handleConversationResponse = (response:any) => {
      if (response.status === 'success') {
        setConversationId(response.data._id);
        setStatusMessage(response.message);
      } else {
        setStatusMessage(response.message);
      }
      socket?.off('createOrJoinConversation_response', handleConversationResponse);
    };

    if (socket) {
      socket.on('createOrJoinConversation_response', handleConversationResponse);
      socket.emit('createOrJoinConversation', createConversationDto);
    }
  };

  console.log(activeAgent)

  return (
    <div className='mb-2 pr-4'>
      <div
        className={` ${activeAgent?.id === agent?.id ? "bg-orange-100":""}  flex cursor-pointer p-3 w-full rounded-xl border items-center justify-between`}
        //onClick={() => setIsOpen(!isOpen)}
        onClick={() => {
          setSelectedAgent(agent?.id)
          setActivePropertyId(property[0].id);
          onPropertySelect(property[0], agent);
          joinConversation({
            propertyId:property[0].id,
            participants:[
               user?.id,
               agent?.id
            ]
          })
        }}
      >
        <ChatThread
          firstname={agent?.firstName}
          lastname={agent?.lastName}
          propertyID={propertyId}
          timestamp={timeStamp}
          lastMessage={lastMessage}
          profileImage={getProfileImageUrl(agent)}
          main={false}
        />
      </div>
   
    </div>
  );
}
