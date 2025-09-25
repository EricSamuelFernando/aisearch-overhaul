import React from 'react';

interface PaymentSuccessModalProps {
  onClose: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  onClose,
}) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-96 rounded-lg bg-white p-8 text-center'>
        <div className='mb-4'>
          <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <svg
              className='h-6 w-6 text-green-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M5 13l4 4L19 7'
              ></path>
            </svg>
          </div>
          <h2 className='text-xl font-semibold'>Payment Successful</h2>
        </div>
        <p className='text-lg font-medium'>$15 USD</p>
        <p className='text-gray-500'>Card Payment</p>

        <button
          onClick={onClose}
          className='mt-6 w-full rounded-lg bg-black py-2 text-white'
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
