import React from 'react';

type ConversationProps = {
  name: string;
  message: string;
  time: string;
  isAgent?: boolean;
};

const ConversationItem: React.FC<ConversationProps> = ({
  name,
  message,
  time,
  isAgent,
}) => {
  return (
    <div className={`p-4 ${isAgent ? 'text-right' : 'text-left'}`}>
      <div className='inline-block max-w-lg rounded-lg bg-gray-100 p-3'>
        <p className='font-semibold'>{name}</p>
        <p className='text-sm'>{message}</p>
      </div>
      <p className='mt-1 text-xs text-gray-500'>{time}</p>
    </div>
  );
};

export default ConversationItem;
