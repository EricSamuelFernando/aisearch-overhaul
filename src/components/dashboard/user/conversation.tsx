import React from 'react';
import UserList from '../main/userList';
import ConversationList from '../main/conversationList';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Conversation = () => {
  return (
    <div className='grid h-screen grid-cols-3'>
      <div className='col-span-2 mt-20 border-r p-4'>
        <UserList />
      </div>
      <div className='col-span-1 h-screen bg-[#FAF8F5] p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Conversations</h2>

          <Button
            roundness='md'
            variant='default'
            className='flex items-center gap-x-2 border-[1px] py-1 font-medium text-white'
          >
            <Image
              src={'/assets/images/summaryIcon.png'}
              alt='Summary Icon'
              width={20}
              height={20}
              style={{ cursor: 'pointer' }}
            />
            <span>Summarize</span>
          </Button>
        </div>
        <ConversationList />
      </div>
    </div>
  );
};

export default Conversation;
