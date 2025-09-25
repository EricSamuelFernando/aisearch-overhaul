'use client';

import { useGetPropertyListApi } from '@/hooks/api/document/useDocument';
import { DocumentShareItem } from '@/interfaces/property.interface';
import { sellerGetInitials } from '@/lib/helpers';
import React from 'react';
import { toast } from 'sonner';

interface RemoveAccessProps {
  id: string;
  openRemoveAccess: () => void;
}
interface User {
  id: string;
  name: string;
  role: string;
  image?: string;
}

const RemoveAccess: React.FC<RemoveAccessProps> = ({
  id,
  openRemoveAccess,
}) => {
  const { propertyList, deletePropertyMutation } = useGetPropertyListApi(id);

  const handleRemoveAccess = (userId: string) => {
    deletePropertyMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('Access rights were successfully removed.');
      },
      onError: (error: any) => {
        toast.error(`Failed to remove access: ${error.message}`);
      },
    });
  };

  if (propertyList.isLoading) {
    return <div>Loading...</div>;
  }

  if (propertyList.isError) {
    return <div>Error loading property list.</div>;
  }

  const users: User[] =
    propertyList.data?.documentsShareList.map((item: DocumentShareItem) => ({
      id: item._id,
      name: item.name,
      role: item.role,
      image: item.images,
    })) || [];

  return (
    <div className='p-4'>
      <div className='space-y-4'>
        {users.map((user) => (
          <div key={user.id} className='flex items-center justify-between'>
            <div className='flex items-center'>
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className='mr-4 h-10 w-10 rounded-full'
                />
              ) : (
                <div className='mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black'>
                  {sellerGetInitials(user.name)}
                </div>
              )}
              <div>
                <div className='text-sm font-semibold capitalize'>
                  {user.name}
                </div>
                <div className='text-xs text-gray-500'>{user.role}</div>
              </div>
            </div>
            <button
              className='font-semibold text-red-500'
              onClick={() => handleRemoveAccess(user.id)}
            >
              Remove access
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoveAccess;
