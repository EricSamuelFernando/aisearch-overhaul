'use client';

import { useForm } from '@mantine/form';
import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/loader';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { error, success } from '@/components/alert/notify';
import { cn } from '@/lib/utils';

interface ForgotPasswordModalFormProps {
  onEmailSubmit: (email: string) => void;
  onBack: () => void;
}

export const ForgotPasswordModalForm = ({ onEmailSubmit, onBack }: ForgotPasswordModalFormProps) => {
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '🔐 We need a valid email to help you reset your password. Please check and try again!'),
    },
  });

  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";

  const forgotPasswordMutation = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async (email: string) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
            mutation ForgotPassword($email: String!) {
              forgotPassword(email: $email)
            }
          `,
        variables: { email },
      });

      if (response.data?.errors) {
        throw new Error(response.data.errors[0]?.message || 'Failed to send password reset code');
      }

      return { message: response.data?.data?.forgotPassword, email };
    },
    onSuccess: (data) => {
      success({ message: data?.message || 'Password reset code sent to your email.' });
      // Store email in localStorage for the next step
      if (data?.email) {
        localStorage.setItem('forgotPasswordEmail', data.email);
      }
      // Call the callback instead of navigating
      onEmailSubmit(data.email);
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.errors?.[0]?.message || err?.message || 'Something went wrong' });
    },
  });

  const handleSubmit = (values: { email: string }) => {
    forgotPasswordMutation.mutate(values.email);
  };

  return (
    <section className={cn('w-full items-center justify-center')}>
      <h2 className='m-5 text-center text-2xl font-bold'>Forgot Password?</h2>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className='mx-auto flex flex-col items-center justify-center space-y-5 pb-5'
      >
        <CustomInput
          label='Enter Your Email to get Verification Code'
          placeholder='Enter Your Email'
          className='h-12 max-w-xl placeholder:text-base w-full'
          containerClass='max-w-xl w-full'
          {...form.getInputProps('email')}
          type='email'
        />

        <div className='flex w-full flex-col gap-3'>
          <Button
            disabled={!form.isValid() || forgotPasswordMutation.isPending}
            size='lg'
            className='h-12 w-full max-w-xl text-lg font-bold'
            type='submit'
          >
            {forgotPasswordMutation.isPending && <ButtonLoader />}
            {forgotPasswordMutation.isPending ? 'Sending...' : 'Continue'}
          </Button>
        </div>

        <section className='flex w-full items-center justify-between'>
          <button
            type='button'
            onClick={onBack}
            className='text-sm font-medium text-primary-main cursor-pointer'
          >
            Back to Login
          </button>
        </section>
      </form>
    </section>
  );
};
