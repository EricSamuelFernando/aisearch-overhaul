'use client';

import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { PasswordInput2 } from '@/components/password-input-2';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { cn } from '@/lib/utils';

interface SetPasswordModalFormProps {
  email: string;
  onPasswordSet: () => void;
  onBack: () => void;
}

export const SetPasswordModalForm = ({ email, onPasswordSet, onBack }: SetPasswordModalFormProps) => {
  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter';
        if (!/\d/.test(value)) return 'Password must contain at least one number';
        if (!/[@$!%*#?&]/.test(value)) return 'Password must contain at least one special character (@$!%*#?&)';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
    },
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const { confirmForgotPasswordMutation } = useUserAuthApi();
  const code = localStorage.getItem('forgotPasswordCode') || '';

  useEffect(() => {
    if (confirmForgotPasswordMutation.isSuccess) {
      // Clear stored values
      localStorage.removeItem('forgotPasswordEmail');
      localStorage.removeItem('forgotPasswordCode');
      // Call success handler
      onPasswordSet();
    }
  }, [confirmForgotPasswordMutation.isSuccess, onPasswordSet]);

  const isValid =
    form.isValid() &&
    form.values.password.length >= 8 &&
    form.values.confirmPassword.length >= 8 &&
    email &&
    code;

  const handleSubmit = (values: { password: string }) => {
    if (email && code) {
      confirmForgotPasswordMutation.mutate({
        email,
        code,
        newPassword: values.password,
      });
    }
  };

  return (
    <section className={cn('w-full items-center justify-center')}>
      <h2 className='m-5 text-center text-2xl font-bold'>Set New Password</h2>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className='mx-auto flex flex-col items-center justify-center space-y-5 pb-5'
      >
        <PasswordInput2
          placeholder='Enter your new password'
          className='h-12 max-w-xl placeholder:text-base focus-visible:border focus-visible:border-black focus-visible:ring-0 w-full'
          {...form.getInputProps('password')}
        />
        {form.errors.password && (
          <p className='mt-1 text-sm text-red-600 max-w-xl w-full'>{form.errors.password}</p>
        )}

        <PasswordInput2
          placeholder='Confirm your new password'
          className='h-12 max-w-xl placeholder:text-base focus-visible:border focus-visible:border-black focus-visible:ring-0 w-full'
          {...form.getInputProps('confirmPassword')}
        />
        {form.errors.confirmPassword && (
          <p className='mt-1 text-sm text-red-600 max-w-xl w-full'>{form.errors.confirmPassword}</p>
        )}

        <div className='flex w-full flex-col gap-3'>
          <Button
            disabled={
              (confirmForgotPasswordMutation.isPending) || 
              !isValid
            }
            size='lg'
            className='h-12 w-full max-w-xl text-lg font-bold disabled:bg-primary-main/20 disabled:cursor-not-allowed'
            type='submit'
            variant='ocreal'
          >
            {confirmForgotPasswordMutation.isPending ? (
              <>
                <ButtonLoader />
                <span className='ml-2'>Processing...</span>
              </>
            ) : (
              'Change Password'
            )}
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
