import React from 'react';
import { Button } from '@/components/ui/button';

interface DeletePropertyModalProps {
  onClose: () => void;
  onProceed: () => void;
}

const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  onClose,
  onProceed,
}) => {
  const handleYesProceed = () => {
    onProceed();
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='relative mx-auto w-2/5 rounded-[2.5rem] bg-white p-8 py-28 shadow-md'>
        <button
          className='absolute right-8 top-6 text-gray-600'
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
        <h2 className='mb-2 text-center text-4xl font-medium text-ocBlack-50'>
          Remove Property?
        </h2>
        <p className='mb-28 text-center text-lg font-normal text-grey-580'>
          Are you sure you want to remove this property?
        </p>

        <div className='flex items-center justify-center gap-6'>
          <Button
            className='w-[35%] rounded-full border border-black bg-white px-8 py-2 text-black'
            onClick={() => {
              onClose();
            }}
            variant='outline'
          >
            No
          </Button>
          <Button
            className='w-[35%] rounded-full border border-black bg-black px-8 py-2 text-white'
            onClick={() => {
              onProceed();
              onClose();
            }}
          >
            Yes, Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeletePropertyModal;
