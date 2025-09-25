import React from 'react';
import { Button } from '../ui/button';

interface Agent {
  image?: string;
  name: string;
  email: string;
  address: string;
}

interface RejectOfferModalProps {
  agent: Agent;
  offerId: string;
  onClose: () => void;
  onReject: () => void;
}

const RejectOfferModal: React.FC<RejectOfferModalProps> = ({
  agent,
  offerId,
  onClose,
  onReject,
}) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative mx-auto w-[37.5rem] rounded-3xl bg-white px-16 py-10 shadow-md'>
        <button
          className='absolute right-4 top-4 text-gray-600'
          onClick={onClose}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
        <div className='mb-10 text-center text-xl font-medium'>
          <h2>Reject Offer</h2>
        </div>
        <div className='flex items-center space-x-4'>
          {agent.image && (
            <img
              src={agent.image}
              alt={agent.name}
              className='h-16 w-16 rounded-full'
            />
          )}
          <div className='mb-6'>
            <h3 className='mb-1 text-lg font-semibold'>{agent.name}</h3>
            <p className='text-sm text-gray-500'>{agent.email}</p>
          </div>
        </div>
        <p className='mt-4 rounded-2xl border border-grey-850 bg-gray-100 p-6 text-sm'>
          Your offer on {agent.address}, has been declined.
        </p>
        <textarea
          className='mt-5 w-full resize-none rounded-2xl border border-grey-850 bg-gray-100 p-6 text-sm outline-none focus:outline-none'
          rows={4}
          defaultValue={`Hello ${agent.name},\n\nI am writing to inform you that your offer has been declined, thank you for your interest. I hope we can work together in the future. `}
        />

        <div className='mt-16 flex justify-end'>
          <Button
            className='w-32 rounded-full p-6 py-1 text-white'
            onClick={onReject}
            variant='default'
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RejectOfferModal;
