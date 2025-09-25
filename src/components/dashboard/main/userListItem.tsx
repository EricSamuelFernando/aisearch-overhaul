'use client';

import { Button } from '@/components/ui/button';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { sellerGetInitials } from '@/lib/helpers';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

type UserProps = {
  name: string;
  role: string;
  imageUrl?: string;
};

const UserListItem: React.FC<UserProps> = ({ name, role, imageUrl }) => {
  const params = useSearchParams();
  const id = params?.get('id');
  const type = params?.get('type');
  const { propertyOffers } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = propertyOffers;
  const res = data?.data?.data?.result;
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `/dashboard/seller/offer/view?id=${'65f1bcafdcea50ce12d53af7'}`,
    );
  };

  return (
    <div className='flex items-center justify-between p-4 hover:bg-gray-100'>
      {/* <div className='flex items-center'>
        <img
          src={imageUrl}
          alt={`${name}'s profile`}
          className='w-10 h-10 rounded-full'
        />
        <div className='ml-4'>
          <p className='font-semibold'>{name}</p>
          <p className='text-gray-500'>{role}</p>
        </div>
      </div> */}
      <div className='flex items-center'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-black'>
          {sellerGetInitials(name)}
        </div>
        <div className='ml-4'>
          <h4 className='text-sm font-semibold'>{name}</h4>
          <p className='text-xs text-gray-500'>{role}</p>
        </div>
      </div>

      <Button
        roundness='full'
        variant='outline'
        className='border-[1px] border-black px-6 py-1 font-bold text-black'
        onClick={handleClick}
      >
        <span> View Offer</span>
      </Button>
    </div>
  );
};

export default UserListItem;
