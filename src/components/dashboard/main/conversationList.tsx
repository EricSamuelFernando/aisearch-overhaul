import React from 'react';
import ConversationItem from './conversationItem';

const conversations = [
  {
    name: 'Emily Johnson',
    message:
      'Of course. How about Wednesday at 3:00 PM? Does that work for your client?',
    time: '2:30pm',
  },
  {
    name: 'Your Agent',
    message:
      'Wednesday at 3:00 PM sounds great. I’ll confirm with my client and get back to you shortly.',
    time: '2:30pm',
    isAgent: true,
  },
];

const ConversationList = () => {
  return (
    <div className='p-4'>
      {conversations.map((conversation, index) => (
        <ConversationItem
          key={index}
          name={conversation.name}
          message={conversation.message}
          time={conversation.time}
          isAgent={conversation.isAgent}
        />
      ))}
    </div>
  );
};

export default ConversationList;
