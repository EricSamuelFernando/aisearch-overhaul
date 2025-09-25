import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChatItem from './chat-item';
import PropertyDetailCard from './property-detail-card';

interface AgentPropertyListProps {
  agent: Agent;
  properties: Property[];
  onPropertySelect: (property: Property, agent: Agent) => void;
}

export default function AgentPropertyList({
  agent,
  properties,
  onPropertySelect,
}: AgentPropertyListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  return (
    <div className='mb-4 pr-10'>
      <div
        className='flex cursor-pointer items-center justify-between'
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChatItem
          firstname={agent.firstname}
          lastname={agent.lastname}
          propertiesCount={properties.length}
          main={false}
        />
      </div>
      {isOpen && (
        <div className='mt-2 space-y-2'>
          {properties.map((property, index) => (
            <PropertyDetailCard
              key={property._id}
              index={index}
              activeIndex={activePropertyId}
              handleCardClick={() => {
                setActivePropertyId(property._id);
                onPropertySelect(property, agent);
              }}
              property={property}
            />
          ))}
        </div>
      )}
    </div>
  );
}
