'use client';

import { useForm } from '@mantine/form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { PasswordInput2 } from '@/components/password-input-2';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';

export const SetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  useEffect(() => {
    // Get email from localStorage or searchParams
    const storedEmail = localStorage.getItem('forgotPasswordEmail');
    const urlEmail = searchParams.get('email');
    const storedCode = localStorage.getItem('forgotPasswordCode');
    
    if (urlEmail) {
      setEmail(urlEmail);
      localStorage.setItem('forgotPasswordEmail', urlEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }
    
    if (storedCode) {
      setCode(storedCode);
    }
  }, [searchParams]);

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
  
  const { confirmForgotPasswordMutation, resetPasswordMutation } = useUserAuthApi();
  const token = searchParams.get('token');

  const passwordValue = form.values.password || '';
  const passwordChecks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /\d/.test(passwordValue),
    special: /[@$!%*#?&]/.test(passwordValue),
  };

  const isValid =
    form.isValid() &&
    form.values.password.length >= 8 &&
    form.values.confirmPassword.length >= 8 &&
    ((email && code) || token); // Allow if we have email+code OR token

  const handleSubmit = (values: { password: string }) => {
    if (token) {
      // Legacy token-based reset
      resetPasswordMutation.mutate({ token, newPassword: values.password });
    } else if (email && code) {
      // Cognito-based reset with code
      confirmForgotPasswordMutation.mutate({
        email,
        code,
        newPassword: values.password,
      });
      // Clear stored values after submission
      localStorage.removeItem('forgotPasswordEmail');
      localStorage.removeItem('forgotPasswordCode');
    }
  };

  return (
    <form
      className='h-max min-w-[400px]'
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <section>
        <section className=''>
          <h3 className='mb-4 text-xl font-medium'>Set New Password</h3>
        </section>

        {!email && !token && (
          <div className='mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800'>
            Missing email or token. Please start the password reset process again.
          </div>
        )}

        <div
          className='mb-4'
          onFocusCapture={() => setShowPasswordRules(true)}
          onBlurCapture={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
              setShowPasswordRules(false);
            }
          }}
        >
          <label className='mb-2 block font-medium text-gray-700'>
            Password
          </label>
          <PasswordInput2
            placeholder='Enter your new password'
            className='w-full py-4'
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
        </div>

        <div className='mb-4'>
          <label className='mb-2 block font-medium text-gray-700'>
            Confirm Password
          </label>
          <PasswordInput2
            placeholder='Confirm your new password'
            className='w-full py-4'
            {...form.getInputProps('confirmPassword')}
          />
          {form.errors.confirmPassword && (
            <p className='mt-1 text-sm text-red-600'>{form.errors.confirmPassword}</p>
          )}
          {!form.errors.confirmPassword && form.values.confirmPassword && form.values.confirmPassword === form.values.password && (
            <p className='mt-1 text-xs text-green-600'>✓ Passwords match</p>
          )}
        </div>

        {!isValid && (form.values.password || form.values.confirmPassword) && (
          <div className='mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800'>
            <p className='font-medium mb-1'>Please fix the following to continue:</p>
            <ul className='list-disc list-inside space-y-1'>
              {form.errors.password && <li>{form.errors.password}</li>}
              {form.errors.confirmPassword && <li>{form.errors.confirmPassword}</li>}
              {!email && !token && <li>Missing email or verification code. Please start the password reset process again.</li>}
            </ul>
          </div>
        )}

        <Button
          disabled={
            (confirmForgotPasswordMutation.isPending || resetPasswordMutation.isPending) || 
            !isValid
          }
          size='lg'
          className='w-full disabled:bg-primary-main/20 disabled:cursor-not-allowed disabled:opacity-60 bg-primary-main hover:bg-primary-main/90 text-white font-bold transition-opacity'
          roundness='md'
          type='submit'
          variant='ocreal'
        >
          {(confirmForgotPasswordMutation.isPending || resetPasswordMutation.isPending) ? (
            <>
              <ButtonLoader />
              <span className='ml-2'>Processing...</span>
            </>
          ) : !isValid ? (
            <span className='flex items-center justify-center'>
              <span>Change Password</span>
              <span className='ml-2 text-xs opacity-75'>(Fix errors above)</span>
            </span>
          ) : (
            'Change Password'
          )}
        </Button>
      </section>
    </form>
  );
};
