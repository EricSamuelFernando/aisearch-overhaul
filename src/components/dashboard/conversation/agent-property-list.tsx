import React, { useState, useContext } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChatItem from './chat-item';
import PropertyDetailCard from './property-detail-card';
import { useAuth } from '@/shared/hooks/useAuth';
import { SocketContext } from '@/providers/socket.context';
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
  const { socket } = useContext(SocketContext);
  const [isOpen, setIsOpen] = useState(false);
  const {user}= useAuth()
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [selectedAgent , setSelectedAgent] = useState("")
 

  const joinConversation = async (createConversationDto:any) => {
    console.log("[agent-property-list] Joining conversation:", createConversationDto);
    
    const handleConversationResponse = (response:any) => {
      console.log("[agent-property-list] createOrJoinConversation_response:", response);
      if (response.status === 'success') {
        // Handle both MongoDB _id and PostgreSQL id formats
        const conversationId = response.data?._id || response.data?.id;
        setConversationId(conversationId);
        setStatusMessage(response.message || 'Joined conversation');
        
        // Join the room after successful conversation creation
        if (conversationId && socket && socket.joinRoom) {
          socket.joinRoom(conversationId);
        }
      } else {
        setStatusMessage(response.message || 'Failed to join conversation');
      }
      if (socket) {
        socket.off('createOrJoinConversation_response', handleConversationResponse);
      }
    };

    if (socket) {
      socket.on('createOrJoinConversation_response', handleConversationResponse);
      
      // Use the proper createOrJoinRoom method from websocket-client
      if (socket.createOrJoinRoom) {
        socket.createOrJoinRoom({
          propertyId: createConversationDto.propertyId,
          userId: user?.id,
          participants: createConversationDto.participants,
          ...createConversationDto
        });
      } else {
        // Fallback to emit for backward compatibility
        socket.emit('createOrJoinConversation', createConversationDto);
      }
    }
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
