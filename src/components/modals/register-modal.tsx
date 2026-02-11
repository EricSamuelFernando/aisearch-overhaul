'use client';

import axios from 'axios';
import { z } from 'zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { error, success } from '../alert/notify';
import { AuthButton } from '../AuthButton';
import { useRegisterActions } from '@/hooks/api/auth/useRegister';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { UserType } from '@/types/user.types';
import { updateUserType } from '@/slices/onboarding/onboarding-slice';
import { useAppDispatch } from '@/lib/hook';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { Button } from '@/components/ui/button';
import CustomInput from '@/components/customs/input';
import { UserCard } from '@/components/modals/user-card';
import { useAtom } from 'jotai';
import { agentEmailAtom } from '@/hooks/atoms';
import { Loader2 } from 'lucide-react';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';

interface IFormInput {
  email: string;
}

const schema = z.object({
  email: z.string().email(),
});

export default function RegisterModal({
  handleStage,
  presetUserType,
  startAt,
}: {
  handleStage: () => void;
  presetUserType?: UserType;
  startAt?: 'account-selection' | 'send-code';
}) {
  const [view, setView] = useState<'account-selection' | 'send-code'>(
    startAt ?? 'account-selection',
  );
  const [activeUserType, setActiveUserType] = useState<UserType | null>(
    presetUserType ?? null,
  );
  const { selectAccountType } = useRegisterActions();
  const [isLoading, setLoading] = useState(false)
  const dispatch = useAppDispatch();
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql"
  const { sendCodeMutation } = useUserAuthApi();

  const handleSetView = useCallback(
    (newView: 'account-selection' | 'send-code') => {
      setView(newView);
    },
    [],
  );

  useEffect(() => {
    if (view === 'account-selection') {
      sendCodeMutation.reset();
    }
  }, [view, sendCodeMutation]);

  useEffect(() => {
    if (!presetUserType) return;
    storeCookie({ key: USER_ROLE, value: presetUserType });
    setActiveUserType(presetUserType);
    dispatch(updateUserType({ userType: presetUserType }));
    selectAccountType(presetUserType);
    if (startAt) {
      setView(startAt);
    }
  }, [presetUserType, startAt, dispatch, selectAccountType]);

  const handleCardClick = useCallback(
    (userType: UserType) => {
      if (activeUserType === userType) {
        setActiveUserType(null);
        storeCookie({ key: USER_ROLE, value: undefined });
        dispatch(updateUserType({ userType: null }));
      } else {
        storeCookie({ key: USER_ROLE, value: userType });
        setActiveUserType(userType);
        dispatch(updateUserType({ userType }));
      }
    },
    [activeUserType, dispatch],
  );

  const navigateUser = useCallback(
    () => {
      if (activeUserType === 'agent' && typeof window !== 'undefined') {
        window.location.href = 'https://agents.snaphomz.com';
      } else {
        selectAccountType(activeUserType as UserType);
        handleSetView('send-code');
      }
    },
    [activeUserType, selectAccountType, handleSetView],
  );

  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
  });

  const [, setAgentEmail] = useAtom(agentEmailAtom);
  const { selectEmail } = useRegisterActions();
  const payload = useRegister();
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();
  const handleGoogleLogin = () => {
    cognitoGoogleLogin();
  };

  const onSubmit = (values: { email: string }) => {
    selectEmail(values.email);
    setLoading(true)
    axios
      .post(
        GRAPHQL_URI,
        JSON.stringify({
          query: `mutation { sendVerification(sendVerificationInput: { accountType: ${activeUserType?.toUpperCase()}, email: "${values.email}" }) }`,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((res) => {
        setLoading(false)
        // Check for GraphQL errors first
        if (res?.data?.errors && res.data.errors.length > 0) {
          const errorMessage = res.data.errors[0]?.message || 'An error occurred';
          // Check if it's a user already exists error
          if (errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('user with email')) {
            error({ message: 'User already exists. Please login instead.' });
          } else {
            error({ message: errorMessage });
          }
          return;
        }

        // Check for successful response
        if (res?.data?.data?.sendVerification === 'Email sent successfully') {
          setAgentEmail(values.email);
          success({ message: res?.data?.data?.sendVerification });
          router.push('/verify-email');
        } else {
          error({ message: 'An unexpected error occurred. Please try again.' });
        }
      })
      .catch((err) => {
        setLoading(false)
        // Handle axios errors
        const errorMessage = err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'An error occurred. Please try again.';

        // Check if it's a user already exists error
        if (errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('user with email')) {
          error({ message: 'User already exists. Please login instead.' });
        } else {
          error({ message: errorMessage });
        }
      });
  };

  return (
    <div className={cn('w-full')}>
      {view === 'account-selection' ? (
        <div className='w-full'>
          <h1 className='m-5 text-center text-2xl font-bold'>
            Choose User Type
          </h1>
          <div className='flex flex-col items-center justify-center space-y-5 pb-5'>
            <div className='w-full'>
              {['buyer', 'seller', 'agent'].map((item) => (
                <UserCard
                  key={item}
                  userType={item as UserType}
                  onClick={() => handleCardClick(item as UserType)}
                  isActive={activeUserType === item}
                />
              ))}
            </div>
            <Button
              onClick={navigateUser}
              className='h-12 w-full text-lg font-bold text-white'
              disabled={isLoading}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={cn('flex items-center', 'justify-start')}>
            <Button
              onClick={() => handleSetView('account-selection')}
              variant='secondary'
              size='icon'
              className='cursor-pointer bg-transparent p-0 hover:bg-transparent'
            >
              <Image
                width={20}
                height={20}
                src={`/assets/images/arrow-back.svg`}
                objectFit='contain'
                alt='Back'
              />
            </Button>
          </div>
          <h1 className='m-4 text-center text-2xl font-bold'>Register</h1>

          <form
            className='mx-auto my-4 flex w-full flex-col items-center justify-center gap-5'
            onSubmit={handleSubmit(onSubmit)}
          >
            <CustomInput
              placeholder='Enter email address'
              onChange={(e) => {
                setValue('email', e.currentTarget.value);
              }}
              className='h-12 max-w-xl placeholder:text-base'
              containerClass='max-w-xl'
              type='email'
              error={errors.email?.message}
            />
            <div className='flex w-full flex-col gap-2'>
              <Button
                disabled={
                  isLoading ||
                  sendCodeMutation.isPending ||
                  sendCodeMutation.isSuccess ||
                  sendCodeMutation.isError
                }
                className='w-full text-lg font-bold'
                size={'lg'}
                type='submit'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending code...
                  </>
                ) : sendCodeMutation.isSuccess ? (
                  'Code sent successfully!'
                ) : sendCodeMutation.isError ? (
                  'Error occurred. Try again.'
                ) : (
                  'Continue'
                )}
              </Button>
              <AuthButton
                className='justify-center gap-x-4'
                imageSrc='/assets/images/google.svg'
                imageAlt='Google Logo'
                text='Continue with Google'
                onClick={handleGoogleLogin}
              />
            </div>
          </form>

          <section className='mt-3 flex w-full items-center justify-center'>
            <p className='text-sm'>
              Already have an account?{' '}
              <button
                className='cursor-pointer text-primary-main'
                onClick={handleStage}
              >
                Login
              </button>
            </p>
          </section>
        </>
      )}
    </div>
  );
}


