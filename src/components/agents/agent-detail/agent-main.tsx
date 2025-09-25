'use client';

import { AgentPropertyCard } from '@/components/dashboard/agent/agent-property-card';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface agent {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  avatarUrl?: string;
  specialties?: string[];
  languages?: string[];
  conciergeLink?: string;
  conciergeIcon?: string;
  bio?: string[];
  profile?: string;
}

const AgentDetailPage = () => {
  const { agentId } = useParams();
  const { getEngagedPropertyByAgentId, getAgentDetail } = usePropertyServiceAPI();
  const [propertyData, setPropertyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [agent, setAgent] = useState<agent | null>(null);

  const getEngagedProperty = async () => {
    setPropertyData([]);
    setLoading(true);

    // Fetch agent details
    getAgentDetail.mutate(agentId as string, {
      onSuccess: (data) => {
        console.log(data)
        setAgent(data?.data?.data?.getUserDetailById);
        console.log(data?.data?.data?.getUserDetailById);
      },
      onError: (error: any) => {
        console.error('Error fetching agent details:', error);
        setLoading(false);
      }
    });

    // Fetch properties associated with the agent
    getEngagedPropertyByAgentId.mutate(agentId as string, {
      onSuccess: (response: any) => {
        setPropertyData(response);
        setLoading(false);
      },
      onError: (error: any) => {
        console.error('Error fetching agent properties:', error);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (agentId) {
      getEngagedProperty();
    }
  }, [agentId]);

  return (
    <div className="flex max-w-7xl gap-10 mx-auto flex-col px-4 py-12 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="flex flex-col items-center md:items-start">
          {
            // Check if profile picture is available, otherwise show initials
            agent?.profile ? (
              <img
                src={agent?.profile || 'https://i.pravatar.cc/250?img=3'}
                alt={agent?.fullName || 'Agent Avatar'}
                className="rounded-md w-64 h-64 object-cover"
              />
            ) : (
              <div className="h-48 w-48 rounded-full uppercase flex items-center justify-center bg-orange-400 text-white text-5xl font-semibold">
                {agent?.firstName?.[0]}{agent?.lastName?.[0]}
              </div>
            )
          }

          <div className="mt-8 w-full">
            <h2 className="text-lg font-semibold mb-2">Social Media</h2>
            <a
              href={agent?.conciergeLink || '#'}
              target="_blank"
              className="text-blue-600 hover:underline flex items-center gap-2"
              rel="noopener noreferrer"
            >
              {agent?.conciergeIcon && (
                <img
                  src={agent?.conciergeIcon}
                  alt="Concierge Icon"
                  className="w-5 h-5"
                />
              )}
              {agent?.firstName}’s Concierge Page
            </a>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-1">Specialties</h2>
            <p className="text-sm text-gray-700">{agent?.specialties?.join(', ')}</p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Languages:</span> {agent?.languages?.join(', ')}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-semibold">{agent?.firstName} {agent?.lastName}</h1>
          <p className="mt-2 text-gray-700">
            REALTOR® | DRE# {agent?.licenseNumber}<br />
            <span className="block">{agent?.email}</span>
            <span className="block mt-1">M: {agent?.phone}</span>
          </p>

          <button className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Work with {agent?.firstName} {agent?.lastName}
          </button>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">About {agent?.firstName}</h2>
            <p>{agent?.bio}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 border-b-4 w-fit border-orange-500">
          Listings by {agent?.firstName} {agent?.lastName}
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : propertyData?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyData.map((property, idx) => (
              <AgentPropertyCard
                {...property?.engagement}
                engagedProperty={property?.engagement}
                users={property.users}
                key={idx}
                userId={property.userId || ''}
              />
            ))}
          </div>
        ) : (
          <p>No properties found.</p>
        )}
      </div>
    </div>
  );
};

export default AgentDetailPage;
