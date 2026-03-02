'use client';

import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import CustomTextInput from '@/components/text-input';

export const VerifyForgotPasswordCodeForm = () => {
  const router = useRouter();
  const codeForm = useForm({
    initialValues: {
      code: '',
    },
  });

  const handleSubmit = (values: { code: string }) => {
    // Store the code in localStorage
    if (values?.code) {
      localStorage.setItem('forgotPasswordCode', values.code);
    }
    // Redirect to set-password page
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
