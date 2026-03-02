'use client';

import * as React from 'react';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useState } from 'react';

import CustomInput from '@/components/customs/input';
import { PasswordInput2 } from '@/components/password-input-2';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/loader';
import { AuthButton } from '@/components/AuthButton';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { error, success } from '../alert/notify';

export const LoginModal = ({
  handleStage,
  setIsOpen,
  onForgotPassword
}: {
  handleStage: () => void;
  setIsOpen: any;
  onForgotPassword?: () => void;
}) => {
  const [magicLogin, setMagicLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql"
  const { loginMutation } = useUserAuthApi();
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '💌 Let\'s make sure your email is perfect! Check the format and try again'),
      password: (value) =>
        magicLogin || !value
          ? null
          : /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(value)
            ? null
            : 'Password must be 8+ chars, with 1 letter, number & special character',
    },
  });

  const handleSubmit = (values: any) => {
    if (magicLogin) {
      onSubmit(values.email);
    } else {
      loginMutation.mutate(values);
    }
  };

  const onSubmit = (values: { email: string }) => {
    axios
      .post(
        GRAPHQL_URI,
        JSON.stringify({
          query: `mutation { sendLoginLink(sendLoginLinkInput: { email: "${values}" }) }`,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((res) => {
        setLoading(false)
        if (res?.data?.data?.sendLoginLink) {
          success({ message: res?.data?.data?.sendLoginLink });
          setIsOpen(false)
        } else {
          error({ message: res?.data?.errors?.[0]?.message });
        }
      })
      .catch((err) => {
        error({ message: err?.message });
      });
  };

  return (
    <section className={cn('w-full items-center justify-center')}>
      <h2 className='m-5 text-center text-2xl font-bold'>
        {magicLogin ? 'Magic Login' : 'Login'}
      </h2>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className='mx-auto flex flex-col items-center justify-center space-y-5 pb-5'
      >
        <CustomInput
          placeholder='Email'
          className='h-12 max-w-xl placeholder:text-base'
          containerClass='max-w-xl'
          {...form.getInputProps('email')}
        />

        {!magicLogin && (
          <PasswordInput2
            placeholder='Password'
            className='h-12 max-w-xl placeholder:text-base focus-visible:border focus-visible:border-black focus-visible:ring-0'
            {...form.getInputProps('password')}
          />
        )}
        <div className='flex w-full flex-col gap-3'>
          <Button
            //disabled={loginMutation.isPending || sendOtpLinkMutation.isPending || !form.isValid()}
            size='lg'
            className='h-12 w-full max-w-xl text-lg font-bold'
            type='submit'
          >
            {(loginMutation.isPending) && <ButtonLoader />}
            {magicLogin ? 'Send Magic Link' : 'Continue'}
          </Button>

          {/* <Button className='h-12 w-full max-w-xl text-lg cursor-pointer font-bold'>
          
            <p
              // className='text-sm font-medium text-white '
              onClick={() => setMagicLogin(!magicLogin)}
            >
              {magicLogin ? 'Use password instead' : 'Login with Link'}
            </p>
          
          </Button> */}

          <AuthButton
            className='justify-center gap-x-4'
            imageSrc='/assets/images/google.svg'
            imageAlt='Google Logo'
            text='Continue with Google'
            onClick={cognitoGoogleLogin}
          />
        </div>

        <section className='flex w-full flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <div className='order-2 sm:order-1'>
            {!magicLogin && (
              <button
                type='button'
                onClick={() => {
                  if (onForgotPassword) {
                    onForgotPassword();
                  } else {
                    setIsOpen(false);
                  }
                }}
                className='cursor-pointer text-sm font-medium text-primary-main'
              >
                Forgot Password
              </button>
            )}
          </div>

          <div className='order-1 sm:order-2'>
            <p className='text-center text-sm font-medium sm:text-left'>
              Don&apos;t have an account? &nbsp;
              <span
                className='cursor-pointer font-medium text-primary-main'
                onClick={handleStage}
              >
                Register
              </span>
            </p>
          </div>
        </section>
      </form>
    </section>
  );
};

