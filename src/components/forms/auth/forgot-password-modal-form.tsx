'use client';

import { useForm } from '@mantine/form';
import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/loader';
import { useMutation } from '@tanstack/react-query';
import { error, success } from '@/components/alert/notify';
import { cn } from '@/lib/utils';
import CognitoAuth from '@/lib/cognito';
import { useRouter } from 'next/navigation';

interface ForgotPasswordModalFormProps {
  onEmailSubmit: (email: string) => void;
  onBack: () => void;
}

export const ForgotPasswordModalForm = ({ onEmailSubmit, onBack }: ForgotPasswordModalFormProps) => {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '🔐 We need a valid email to help you reset your password. Please check and try again!'),
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async (email: string) => {
      await CognitoAuth.forgotPassword(email);
      return { message: 'Password reset code sent to your email.', email };
    },
    onSuccess: (data) => {
      success({
        message: 'Reset password email sent',
        subtitle: 'Reset email sent. Go catch it before it buries itself.',
      });
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

  const handleBackToLogin = () => {
    onBack();
    router.push('/home?auth=login');
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
            onClick={handleBackToLogin}
            className='text-sm font-medium text-primary-main cursor-pointer'
          >
            Back to Login
          </button>
        </section>
      </form>
    </section>
  );
};
