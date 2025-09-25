import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChatItem from './chat-item';
import PropertyDetailCard from './property-detail-card';
import { useAuth } from '@/shared/hooks/useAuth';
import socket from '@/lib/socket';
import { property } from './data';

interface AgentPropertyListProps {
  agent: Agent;
  properties: Property[];
  onPropertySelect: (property: any, agent: Agent) => void;
  setConversationId:(id:any)=> void;
  setStatusMessage:(message:any) => void;
  activeAgent:any;
}

export default function AgentPropertyList({
  agent,
  properties,
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


  return (
    <div className='mb-2 pr-10'>
      <div
        className={` ${activeAgent?.id === agent?.id ? "bg-orange-100":""}  flex cursor-pointer p-2 rounded-xl items-center justify-between`}
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
        <ChatItem
          firstname={agent.firstName}
          lastname={agent.lastName}
          email={agent.email}
          propertiesCount={properties?.length || 1}
          main={false}
        />
      </div>
      {isOpen && (
        <div className='mt-2 space-y-2'>
          {properties?.map((property, index) => (
            <PropertyDetailCard
              key={property._id}
              index={index}
              activeIndex={activePropertyId}
              handleCardClick={() => {
                setActivePropertyId(property._id);
                onPropertySelect(property, agent);
                joinConversation({
                  propertyId:property._id,
                  participants:[
                     user?.id,
                     agent?._id
                  ]
                })
              }}
              property={property}
            />
          ))}
        </div>
      )}
    </div>
  );
}
