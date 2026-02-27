'use client';

import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CustomTextInput from '@/components/text-input';
import { success } from '@/components/alert/notify';

export const VerifyForgotPasswordCodeForm = () => {
  const router = useRouter();
  const codeForm = useForm({
    initialValues: {
      code: '',
    },
  });

  const handleSubmit = (values: { code: string }) => {
    // Persist the code so the next step can submit it with the new password
    if (values?.code) {
      localStorage.setItem('forgotPasswordCode', values.code);
    }
    success({ message: 'OTP verified successfully' });
    router.push('/set-password');
  };

  return (
    <form
      className='h-max min-w-[400px]'
      onSubmit={codeForm.onSubmit(handleSubmit)}
    >
      <section>
        <section className=''>
          <h3 className='mb-4 text-xl font-medium'>Enter Code</h3>
        </section>
        <section className=''>
          <p className='mb-2 text-sm  font-medium text-grey-100'>
            Enter Verification Code from your mail
          </p>
        </section>
        <CustomTextInput
          placeholder='Code...'
          className='w-full py-4'
          maxLength={6}
          type='text'
          {...codeForm.getInputProps('code')}
        />
        <Button
          disabled={codeForm.values.code.length !== 6}
          size='lg'
          className='w-full disabled:bg-primary-main/20'
          roundness='md'
          type='submit'
          variant='ocreal'
        >
          Continue
        </Button>
      </section>
    </form>
  );
};
