'use client';

import React from 'react';

interface AgentPropertyCardProps {
  propertyId?: string;
  image?: string;
  title?: string;
  location?: string;
  price?: string;
  progress?: number;
  onClick?: () => void;
}

const AgentPropertyCard: React.FC<AgentPropertyCardProps> = ({
  propertyId,
  image,
  title = 'No Title',
  location = 'Unknown',
  price = '$0',
  progress = 0,
  onClick
}) => {
  return (
    <div
      className="rounded-lg border shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="h-48 w-full">
        <img
          src={image || 'https://via.placeholder.com/300x200'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
        <p className="text-xl font-bold text-blue-700 mt-2">{price}</p>

        <div className="mt-3 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-xs text-gray-400 mt-1">Progress: {progress}%</p>
      </div>
    </div>
  );
};

export default AgentPropertyCard;
