'use client';

import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import CustomTextInput from '@/components/text-input';
export const ForgotPasswordForm = () => {
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '🔐 We need a valid email to help you reset your password. Please check and try again!'),
    },
  });

  const { forgotPasswordMutation } = useUserAuthApi();

  return (
    <form
      className='h-max min-w-[400px]'
      onSubmit={form.onSubmit((values) => {
        forgotPasswordMutation.mutate(values?.email );
      })}
    >
      <section>
        <section className=''>
          <h3 className='mb-4 text-xl font-medium'>Forgot Password?</h3>
        </section>
        <CustomTextInput
          label='Enter Your Email to get Verification Code'
          placeholder='Enter Your Email'
          className='w-full py-4'
          {...form.getInputProps('email')}
          type='email'
        />
        <button
          className={cn(
            'w-full rounded-md py-3 font-bold text-white disabled:bg-primary-main/20',
            !form.isValid()
              ? 'cursor-not-allowed bg-primary-main/20'
              : 'bg-primary-main',
              forgotPasswordMutation.isPending
              ? 'bg-primary-main/20'
              : 'bg-primary-main',
          )}
          type='submit'
          disabled={!form?.isValid()}
        >
          {forgotPasswordMutation.isPending ? 'Loading...' : 'Continue'}
        </button>
        <section className='cursor-pointer py-4 text-right text-sm text-black'>
          <Link href='/home' className='font-semibold text-primary-main'>
            Login
          </Link>
        </section>
      </section>
    </form>
  );
};
