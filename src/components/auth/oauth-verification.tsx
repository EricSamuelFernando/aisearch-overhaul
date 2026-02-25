'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import client from '@/lib/client';
import { success, error as errorNotify } from '../alert/notify';
import { setAuthToken } from '@/slices/auth/register.slices';
import { login } from '@/slices/auth/auth.slice';
import { storeCookie } from '@/lib/storage';
import { AUTH_TOKEN, USER_ROLE } from '@/shared/constants/env';
import { AxiosResponse } from '@/types/axios.types';
import { IAuthUser, PropertyPreference, User } from '@/types/user.types';
import { Button } from '../ui/button';
import { useAuth } from '@/shared/hooks/useAuth';

export default function OAuthVerification() {
  const router = useRouter();
  const successShown = useRef(false);
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useAuth();

  console.log('User', user);

  const generateRandomUserData = (): User => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const randomEmail = `chigozobike@gmail.com`;

    const randomPropertyPreference: PropertyPreference = {
      propertyType: 'Single Family Home',
      onboardingCompleted: false,
      spendAmount: { max: 1000000, min: 0 },
      financialProcess: 'options',
      preApprovalAffiliates: true,
      workWithLender: false,
      preferredPropertyAddress: `751 Grahambell, Paris, France`,
    };

    return {
      id: randomId,
      email: randomEmail,
      status:"offline",
      firstname: 'Chigoz',
      lastname: 'Obike',
      fullname: 'Chigoz Obike',
      account_type: 'buyer',
      preApproval: Math.random() > 0.5,
      propertyPreference: randomPropertyPreference,
    };
  };

  const fullQueryString =
    typeof window !== 'undefined' ? window.location.search : '';

  const { isLoading, error, data } = useQuery({
    queryKey: ['oauthVerification', fullQueryString],
    queryFn: async () => {
      if (!fullQueryString) {
        throw new Error('No query parameters found');
      }
      return await client.get(`/auth/google/callback${fullQueryString}`);
    },
    select: (data: AxiosResponse<IAuthUser>) => {
      const randomUserData = generateRandomUserData();

      if (data.status === 200) {
        const { user: googleUser, token } = data?.data?.data;
        console.log('Google Data:', data?.data);

        setAuthToken(token);
        // Spread randomUserData FIRST so that googleUser fields always win.
        // Critical: googleUser.id (the real DB UUID) must NOT be overwritten by
        // randomUserData.id (Math.random string) — otherwise the Redux user.id
        // won't match the JWT userId, causing all snap permission checks to fail.
        const mergedUser: User = {
          ...randomUserData,
          ...googleUser,
          id: googleUser.id,
          email: googleUser.email || randomUserData.email,
          account_type: (googleUser as any).accountType || googleUser.account_type || 'buyer',
          propertyPreference:
            googleUser.propertyPreference || randomUserData.propertyPreference,
        };

        dispatch(login(mergedUser));

        storeCookie({ key: AUTH_TOKEN, value: token });
        storeCookie({ key: USER_ROLE, value: 'buyer' });
        return { ...data, mergedUser };
      }
      throw new Error('Authentication failed');
    },
    enabled: !!fullQueryString,
  });

  useEffect(() => {
    if (data && !successShown.current) {
      success({ message: data?.data?.message });
      successShown.current = true;

      console.log('Isloggedin', isLoggedIn);
      console.log('User', user);

      // router.push('/dashboard/buyer');
    }
  }, [data, router]);

  useEffect(() => {
    if (error) {
      console.error('Login Error:', error);
      errorNotify({
        message: 'An unexpected error occurred',
      });
    }
  }, [error]);

  // useEffect(() => {
  //   if (isLoggedIn && user) {
  //     console.log('User after login:', user);
  //   }
  // }, [isLoggedIn, user]);
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('User after login:', user);
    }
  }, [isLoggedIn, user]);  // Add 'isLoggedIn' and 'user' to the dependency array
  

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md rounded-lg p-8'>
        <h1 className='mb-6 text-center text-3xl font-bold'>Verifying OAuth</h1>
        {isLoading ? (
          <div className='flex flex-col items-center text-center'>
            <Loader2 className='mb-4 h-12 w-12 animate-spin' />
            <p className='text-lg text-gray-600'>
              Please wait while we complete the authentication process.
            </p>
          </div>
        ) : error ? (
          <div className='text-center'>
            <p className='mb-4 text-lg text-red-600'>
              {'An unexpected error occurred'}
            </p>
            <Button
              variant='default'
              onClick={() => router.push('/login')}
              className='rounded-md px-4 py-2 text-white transition-colors hover:bg-opacity-90'
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <p className='flex flex-col items-center justify-center text-center text-lg text-green-600'>
            Authentication successful! <br /> Redirecting...{' '}
            <Loader2 className='mb-4 h-4 w-4 animate-spin' />
          </p>
        )}
      </div>
    </div>
  );
}
