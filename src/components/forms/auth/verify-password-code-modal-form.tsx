'use client';

import { useForm } from '@mantine/form';
import { Button } from '@/components/ui/button';
import CustomInput from '@/components/customs/input';
import { cn } from '@/lib/utils';
import { success } from '@/components/alert/notify';

interface VerifyPasswordCodeModalFormProps {
  email: string;
  onCodeVerify: () => void;
  onBack: () => void;
}

export const VerifyPasswordCodeModalForm = ({ email, onCodeVerify, onBack }: VerifyPasswordCodeModalFormProps) => {
  const codeForm = useForm({
    initialValues: {
      code: '',
    },
  });

  const handleSubmit = (values: { code: string }) => {
    if (values?.code) {
      localStorage.setItem('forgotPasswordCode', values.code);
    }
    success({ message: 'OTP verified successfully' });
    onCodeVerify();
  };

  return (
    <section className={cn('w-full items-center justify-center')}>
      <h2 className='m-5 text-center text-2xl font-bold'>Enter Code</h2>

      <form
        onSubmit={codeForm.onSubmit(handleSubmit)}
        className='mx-auto flex flex-col items-center justify-center space-y-5 pb-5'
      >
        <div className='w-full'>
          <p className='mb-4 text-sm font-medium text-gray-600 text-center'>
            Enter Verification Code sent to {email}
          </p>
        </div>

        <CustomInput
          placeholder='Enter 6-digit code'
          className='h-12 max-w-xl placeholder:text-base w-full'
          containerClass='max-w-xl w-full'
          maxLength={6}
          type='text'
          {...codeForm.getInputProps('code')}
        />

        <div className='flex w-full flex-col gap-3'>
          <Button
            disabled={codeForm.values.code.length !== 6}
            size='lg'
            className='h-12 w-full max-w-xl text-lg font-bold disabled:bg-primary-main/20'
            type='submit'
            variant='ocreal'
          >
            Continue
          </Button>
        </div>

        <section className='flex w-full items-center justify-between'>
          <button
            type='button'
            onClick={onBack}
            className='text-sm font-medium text-primary-main cursor-pointer'
          >
            ← Back
          </button>
        </section>
      </form>
    </section>
  );
};
