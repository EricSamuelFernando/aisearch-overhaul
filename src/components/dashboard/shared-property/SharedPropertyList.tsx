"use client"
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useSharedProperties } from '@/hooks/api/property/useSharedProperty';

interface SharedUser {
  name: string;
  email: string;
  role: string;
  message?: string;
}

interface SharedProperty {
  id: string;
  propertyId: string;
  propertyImage: string;
  propertyAddress: string;
  propertyUrl: string;
  sharedUsers: SharedUser[];
}



const SharedPropertyList = () => {

    const { data: sharedProperties, isLoading, isError } = useSharedProperties();

    if (isLoading) {
      return <div className="px-12 py-16 text-gray-500">Loading shared properties...</div>;
    }
  
  return (
    <div className="px-12 py-16 min-h-screen">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Shared Properties</h2>

      {sharedProperties?.length === 0 ? (
        <div className="text-gray-500 text-sm">No properties shared yet.</div>
      ) : (
        <div className="flex gap-6 overflow-x-auto">
          {sharedProperties?.map((property:SharedProperty) => (
            <div
              key={property.id}
              className="min-w-[320px] rounded-2xl shadow-md bg-black "
            >
              <div className="overflow-hidden rounded-t-xl">
                <Image
                  src={property.propertyImage}
                  alt="Property"
                  width={320}
                  height={200}
                  className="h-[180px] w-full object-cover"
                />
              </div>

              <div className="bg-black px-4 py-3 text-white text-sm font-medium rounded-b-xl">
                <p>{property.propertyAddress}</p>
              </div>

              <div className="px-4 pt-3 pb-2 text-sm text-gray-800">
                {property.sharedUsers.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Message:</p>
                    <p className="text-gray-600">{property.sharedUsers[0]?.message || 'No message'}</p>
                  </div>
                )}
              </div>

              <div className="px-4 pb-4 pt-2">
                <a href={property.propertyUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    Check Property
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedPropertyList;
