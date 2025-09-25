import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChatItem from './chat-item';
import PropertyDetailCard from './property-detail-card';
import { useAuth } from '@/shared/hooks/useAuth';
import socket from '@/lib/socket';
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
  const [isOpen, setIsOpen] = useState(false);
  const {user}= useAuth()
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [selectedAgent , setSelectedAgent] = useState("")
 

  const joinConversation = async (createConversationDto:any) => {
    console.log(createConversationDto)
    socket.emit('createOrJoinConversation', createConversationDto, (response:any) => {
      if (response.status === 'success') {
        setConversationId(response.data._id);
        setStatusMessage(response.message);
      } else {
        setStatusMessage(response.message);
      }
    });
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
          main={false}
        />
      </div>
   
    </div>
  );
}
