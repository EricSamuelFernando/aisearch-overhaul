import { success } from '@/components/alert/notify';
import { Button } from '@/components/ui/button';
import { AppleIcon, CardIcon, GoogleIcon, PaypalIcon } from '@public/assets/icons';
import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';

interface PaymentModalProps {
  onClose: () => void;
  onProceed: () => void;
  onSuccess?:() => void;
  title: string;
  subTitle: string;
  icon: StaticImageData;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  onClose,
  onProceed,
  onSuccess,
  title,
  subTitle,
  icon,
  amount,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const handlePayment = () => {
    // Simulate payment result (you can replace with real API call)
    const isSuccess = Math.random() > 0.5;
    setStep(isSuccess ? 3 : 4);
    onProceed(); // Optional external callback
  };

  const options = [
    { title: 'Card', icons: CardIcon },
    { title: 'GooglePay', icons: GoogleIcon },
    { title: 'ApplePay', icons: AppleIcon },
    { title: 'Paypal', icons: PaypalIcon },
  ];



  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='relative mx-auto w-[600px] rounded-3xl bg-white px-12 py-16 shadow-lg'>
        <button className='absolute right-5 top-5 text-gray-600' onClick={onClose}>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        {/* Step 1 – Intro */}
        {step === 1 && (
          <div className='flex flex-col items-center gap-4'>
            <Image src={icon} alt='icon' width={64} />
            <h2 className='mb-2 text-center text-3xl font-medium'>{title}</h2>
            <p className='mb-2 text-lg text-orange-500'>{subTitle}</p>
            <p className='mb-6 rounded-md bg-gray-100 px-4 py-2 text-sm'>${amount} USD / property</p>
            <Button className='w-fit rounded-full bg-black px-12 text-white' onClick={() => setStep(2)}>
              Proceed
            </Button>
          </div>
        )}

        {/* Step 2 – Payment Form */}
        {step === 2 && (
          <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-md text-center'>Payment Method</h2>
              <p className='text-lg text-gray-700'>Charge Amount: <strong>${amount} USD</strong></p>
            </div>

            <div className='flex justify-center gap-3'>
              {options.map((method) => (
                <div key={method.title} className='flex flex-1 flex-col items-center gap-2 rounded-md border p-4 text-sm shadow-sm'>
                  <Image src={method.icons} alt='icon' width={32} />
                  <p>{method.title}</p>
                </div>
              ))}
            </div>

            <div>
              <p className='mb-2 text-sm font-medium'>Card Number</p>
              <input type='text' className='w-full rounded-md bg-slate-100 px-3 py-2 text-sm' />
            </div>

            <div className='flex gap-2'>
              <div className='flex w-full flex-col gap-2'>
                <p className='text-sm font-medium'>Expiry</p>
                <input type='text' placeholder='MM/YY' className='w-full rounded-md bg-slate-100 px-3 py-2 text-sm' />
              </div>
              <div className='flex w-full flex-col gap-2'>
                <p className='text-sm font-medium'>CVV</p>
                <input type='text' placeholder='CVC' className='w-full rounded-md bg-slate-100 px-3 py-2 text-sm' />
              </div>
            </div>

            <div className='mb-6'>
              <label className='flex items-center gap-2 text-sm'>
                <input type='checkbox' className='accent-black' />
                Save this card details
              </label>
            </div>

            <div className='flex justify-between'>
              <button className='text-sm text-gray-500' onClick={onClose}>Cancel</button>
              <Button className='rounded-full bg-black px-6 py-2 text-white' onClick={handlePayment}>
                Make payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 – Success */}
        {step === 3 && (
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-full bg-green-100 p-4'>
              <svg className='h-8 w-8 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-xl font-medium'>Payment Successful</h2>
            <div className='rounded-md bg-gray-100 px-6 py-2 text-xl font-semibold'>${amount} USD</div>
            <p className='text-sm text-gray-500'>Card Payment</p>
            <Button className='mt-6 rounded-full bg-black text-white' onClick={onSuccess}>Continue</Button>
          </div>
        )}

        {/* Step 4 – Failure */}
        {step === 4 && (
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-full bg-red-100 p-4'>
              <svg className='h-8 w-8 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <h2 className='text-xl font-medium'>Payment Failed</h2>
            <div className='rounded-md bg-gray-100 px-6 py-2 text-xl font-semibold'>${amount} USD</div>
            <p className='text-sm text-gray-500'>Card Payment</p>
            <Button className='mt-6 rounded-full bg-black text-white' onClick={() => setStep(2)}>Go Back</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
