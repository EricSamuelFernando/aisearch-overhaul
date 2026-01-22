'use client';

import * as React from 'react';
import Image from 'next/image';
import { Phone, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Agent {
  id: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  email: string;
  phone?: string;
  profile?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  deals?: number;
  mobile?: {
    number_body?: string;
    mobile_extension?: string;
    raw_mobile?: string;
    _id?: string;
  };
}

interface AgentCardProps {
  agent: Agent;
  onInvite: (agentId: string) => void;
  onContact: (agent: Agent) => void;
  onCheckProfile: (agentId: string) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onInvite,
  onContact,
  onCheckProfile,
  isLoading = false,
  isSelected = false,
}) => {
  const firstName = agent.firstName || agent.firstname || '';
  const lastName = agent.lastName || agent.lastname || '';
  const fullName = `${firstName} ${lastName}`.trim();
  // First letter of first name OR last letter of last name (not both)
  const initial = firstName[0] || lastName[lastName.length - 1] || '';
  const phoneNumber = agent.phone || agent.mobile?.raw_mobile || agent.mobile?.number_body || 'N/A';
  const profileImage = agent.profile || agent.image;
  const rating = agent.rating || 4.5; // Default rating if not available
  const reviews = agent.reviews || 50; // Default reviews count
  const deals = agent.deals || 0;

  return (
    <div className="bg-[#F8F8F8] rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex p-5 gap-5">
        {/* Agent Photo - Larger, covers more height */}
        <div className="flex-shrink-0 flex items-center">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={fullName}
              width={120}
              height={120}
              className="rounded-xl object-cover w-28 h-28"
              unoptimized
            />
          ) : (
            <div className="w-28 h-28 rounded-xl bg-orange-400 text-white flex items-center justify-center text-4xl font-semibold uppercase">
              {initial || <User className="w-14 h-14" />}
            </div>
          )}
        </div>

        {/* Agent Details */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Name and Title */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
              {fullName || 'Agent Name'}
            </h3>
            <p className="text-sm text-gray-600">Sales Executive</p>
          </div>

          {/* Contact & Performance Details */}
          <div className="space-y-0 mb-4">
            {/* Mobile */}
            <div className="flex items-center gap-2 text-sm pb-2.5 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Mobile</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-800">{phoneNumber}</span>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 text-sm py-2.5 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Ratings</span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-800">{rating.toFixed(1)}/{reviews} reviews</span>
              </div>
            </div>

            {/* Past Year Deals */}
            <div className="flex items-center gap-2 text-sm pt-2.5">
              <span className="text-gray-600 font-medium">Past Year Deals</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-800">{deals}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => onInvite(agent.id)}
              disabled={isLoading || isSelected}
              className="flex-1 text-xs px-4 py-2 h-auto bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium disabled:opacity-50"
              size="sm"
            >
              {isLoading && isSelected ? 'Inviting...' : 'Invite'}
            </Button>
            <Button
              onClick={() => onContact(agent)}
              variant="outline"
              className="flex-1 text-xs px-4 py-2 h-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full font-medium"
              size="sm"
            >
              Contact
            </Button>
            <Button
              onClick={() => onCheckProfile(agent.id)}
              variant="outline"
              className="flex-1 text-xs px-4 py-2 h-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full font-medium"
              size="sm"
            >
              Check Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
