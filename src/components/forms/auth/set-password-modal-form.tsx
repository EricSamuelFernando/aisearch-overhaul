'use client';

import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
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
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
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

  const passwordValue = form.values.password || '';
  const passwordChecks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /\d/.test(passwordValue),
    special: /[@$!%*#?&]/.test(passwordValue),
  };

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
        <div
          className='w-full max-w-xl'
          onFocusCapture={() => setShowPasswordRules(true)}
          onBlurCapture={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
              setShowPasswordRules(false);
            }
          }}
        >
          <PasswordInput2
            placeholder='Enter your new password'
            className='h-12 placeholder:text-base focus-visible:border focus-visible:border-black focus-visible:ring-0 w-full'
            {...form.getInputProps('password')}
          />
          {form.errors.password && (
            <p className='mt-1 text-sm text-red-600'>{form.errors.password}</p>
          )}

          {showPasswordRules && (
            <div className='mt-3 space-y-1 text-sm'>
              <p className='text-gray-600'>Password must contain:</p>
              <div
                className={`flex items-center gap-2 ${passwordChecks.length
                  ? 'text-green-700'
                  : passwordValue.length > 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                  }`}
              >
                <span>{passwordChecks.length ? '✓' : '○'}</span>
                <span>At least 8 characters</span>
              </div>
              <div
                className={`flex items-center gap-2 ${passwordChecks.upper
                  ? 'text-green-700'
                  : passwordValue.length > 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                  }`}
              >
                <span>{passwordChecks.upper ? '✓' : '○'}</span>
                <span>1 uppercase letter (A-Z)</span>
              </div>
              <div
                className={`flex items-center gap-2 ${passwordChecks.lower
                  ? 'text-green-700'
                  : passwordValue.length > 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                  }`}
              >
                <span>{passwordChecks.lower ? '✓' : '○'}</span>
                <span>1 lowercase letter (a-z)</span>
              </div>
              <div
                className={`flex items-center gap-2 ${passwordChecks.number
                  ? 'text-green-700'
                  : passwordValue.length > 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                  }`}
              >
                <span>{passwordChecks.number ? '✓' : '○'}</span>
                <span>1 number (0-9)</span>
              </div>
              <div
                className={`flex items-center gap-2 ${passwordChecks.special
                  ? 'text-green-700'
                  : passwordValue.length > 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                  }`}
              >
                <span>{passwordChecks.special ? '✓' : '○'}</span>
                <span>1 special character (e.g., !@#$)</span>
              </div>
            </div>
          )}

          <div className='mt-5'>
            <PasswordInput2
              placeholder='Confirm your new password'
              className='h-12 placeholder:text-base focus-visible:border focus-visible:border-black focus-visible:ring-0 w-full'
              {...form.getInputProps('confirmPassword')}
            />
            {form.errors.confirmPassword && (
              <p className='mt-1 text-sm text-red-600'>{form.errors.confirmPassword}</p>
            )}
          </div>
        </div>

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
