import Image from 'next/image';
import React, { useState } from 'react';

interface PaymentModalProps {
  onClose: () => void;
  onPayment: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-2/5 rounded-3xl bg-white px-12 py-10'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Payment Method</h3>
          <h3 className='text-lg font-semibold'>Charge Amount: $15 USD</h3>
          <button
            onClick={onClose}
            className='text-3xl font-normal text-gray-500 hover:text-black'
          >
            &#10005;
          </button>
        </div>

        <div className='mb-6 grid grid-cols-4 gap-2'>
          <button
            onClick={() => setPaymentMethod('card')}
            className='border p-2'
          >
            <Image
              src={'/assets/images/card.svg'}
              alt='Summary Icon'
              width={40}
              height={40}
            />
            Card
          </button>
          <button
            onClick={() => setPaymentMethod('googlePay')}
            className='border p-2'
          >
            <Image
              src={'/assets/images/google.svg'}
              alt='Summary Icon'
              width={40}
              height={40}
            />
            Google Pay
          </button>
          <button
            onClick={() => setPaymentMethod('applePay')}
            className='border p-2'
          >
            <Image
              src={'/assets/images/apple-pay.svg'}
              alt='Summary Icon'
              width={40}
              height={40}
            />
            Apple Pay
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className='border p-2'
          >
            <Image
              src={'/assets/images/paypal.svg'}
              alt='Summary Icon'
              width={40}
              height={40}
            />
            PayPal
          </button>
        </div>
        <div className='mb-6'>
          <h2>Card Number</h2>
          <input
            className='mb-4 w-full rounded-lg bg-grey-100 p-2'
            type='text'
            placeholder='Card Number'
          />

          <div className='flex w-full space-x-4'>
            <div className='w-full'>
              <h2>Expiry</h2>
              <input
                className='w-full border p-2'
                type='text'
                placeholder='MM/YY'
              />
            </div>

            <div className='w-full'>
              <h2>CVC</h2>
              <input
                className='w-full border p-2'
                type='text'
                placeholder='CVC'
              />
            </div>
          </div>
        </div>
        <div className='mb-4 flex items-center justify-between'>
          <label className='flex items-center space-x-2'>
            <input type='checkbox' />
            <span>Save this card details</span>
          </label>
        </div>
        <div className='flex space-x-4'>
          <button onClick={onClose} className='w-full rounded-lg border py-2'>
            Cancel
          </button>
          <button
            onClick={onPayment}
            className='w-full rounded-lg bg-black py-2 text-white'
          >
            Make Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
