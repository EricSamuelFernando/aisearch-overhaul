'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import { Button } from '@/components/ui/button';
import CustomInput from '@/components/customs/input';
import { cn } from '@/lib/utils';
import { ButtonLoader } from '@/components/loader';
import { success } from '@/components/alert/notify';
import axios from 'axios';

interface VerifyPasswordCodeModalFormProps {
  email: string;
  onCodeVerify: () => void;
  onBack: () => void;
  externalError?: string;
}

const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/auth/graphql';

export const VerifyPasswordCodeModalForm = ({ email, onCodeVerify, onBack, externalError }: VerifyPasswordCodeModalFormProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [inlineError, setInlineError] = useState('');

  const codeForm = useForm({
    initialValues: {
      code: '',
    },
  });

  const handleSubmit = async (values: { code: string }) => {
    if (!values?.code || values.code.length !== 6) return;

    setIsVerifying(true);
    setInlineError('');

    try {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation VerifyForgotPasswordCode($email: String!, $code: String!) {
            verifyForgotPasswordCode(email: $email, code: $code)
          }
        `,
        variables: { email, code: values.code },
      });

      if (response.data?.errors?.length) {
        const msg = response.data.errors[0]?.message || 'Invalid or expired code';
        setInlineError(msg);
        return;
      }

      // Code is valid — save and proceed
      localStorage.setItem('forgotPasswordCode', values.code);
      success({ message: 'OTP verified successfully' });
      onCodeVerify();
    } catch (err: any) {
      setInlineError(err?.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const displayError = inlineError || externalError;

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
          onChange={(e: any) => {
            codeForm.getInputProps('code').onChange(e);
            if (inlineError) setInlineError('');
          }}
        />

        {displayError && (
          <p className='text-sm text-red-600 text-center w-full max-w-xl'>
            {displayError}
          </p>
        )}

        <div className='flex w-full flex-col gap-3'>
          <Button
            disabled={codeForm.values.code.length !== 6 || isVerifying}
            size='lg'
            className='h-12 w-full max-w-xl text-lg font-bold disabled:bg-primary-main/20'
            type='submit'
            variant='ocreal'
          >
            {isVerifying ? (
              <>
                <ButtonLoader />
                <span className='ml-2'>Verifying...</span>
              </>
            ) : (
              'Continue'
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
