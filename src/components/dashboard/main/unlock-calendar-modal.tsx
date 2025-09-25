import React from 'react';
import PaymentModal from './payment-modal';
import PaymentSuccessModal from './payment-success-modal';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface UnlockCalendarModalProps {
  onClose: () => void;
  onProceed: () => void;
}

const UnlockCalendarModal: React.FC<UnlockCalendarModalProps> = ({
  onClose,
  onProceed,
}) => {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const handleProceed = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-2/5 rounded-3xl bg-white px-12 py-10'>
        <div className='flex items-center justify-between'>
          <div />
          <button
            onClick={onClose}
            className='text-3xl font-normal text-gray-500 hover:text-black'
          >
            &#10005;
          </button>
        </div>
        <div className='flex h-full flex-col items-center justify-center'>
          <Image
            src={'/assets/images/unlock.svg'}
            alt='Summary Icon'
            width={60}
            height={60}
          />
          <h2 className='mt-8 text-2xl font-medium text-[#454545]'>
            Unlock Calendar Services
          </h2>
          <p className='mt-3 text-lg font-medium text-[#E8804C]'>
            Effectively Schedule Showings
          </p>

          <div className='my-12 flex w-48 items-center justify-center rounded-lg bg-[#F5F6F9] p-4 text-center text-md'>
            <span className='font-bold'>$15</span>
            <span className='ml-1 font-normal'>USD / property</span>
          </div>

          <Button
            onClick={handleProceed}
            roundness='full'
            className='mb-6 items-center justify-center bg-black px-16 py-2 text-center text-md font-medium text-white'
          >
            Proceed
          </Button>
        </div>
      </div>
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPayment={handlePayment}
        />
      )}

      {showSuccessModal && (
        <PaymentSuccessModal
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default UnlockCalendarModal;
