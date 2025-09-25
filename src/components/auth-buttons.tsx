'use client';

import { useModalContext } from '@/providers/modal-provider';
import { useAuthModal, useAuthModalActions } from '@/shared/hooks/useAuthModal';
import { AuthButton } from './AuthButton';
import { Icons } from './icons';
import { Button } from '@/components/ui/button';
import { setAuthToken } from '@/slices/auth/register.slices';
import { AxiosResponse } from '@/types/axios.types';
import { IAuthUser } from '@/types/user.types';
import { storeCookie } from '@/lib/storage';
import { useMutation } from '@tanstack/react-query';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AUTH_TOKEN, USER_ROLE } from '@/shared/constants/env';
import { GOOGLE_LOGIN_ENDPOINT } from '@/utils/apis';
import { error, success } from './alert/notify';
import { login } from '@/slices/auth/auth.slice';
import { useRouter } from 'next/navigation';

export const AuthButtons = ({ origin }: { origin?: 'page' | 'modal' }) => {
  const { setScreen, close } = useAuthModalActions();
  const { navBtn, currentScreen } = useAuthModal();
  const { closeModal } = useModalContext();
  const router = useRouter();

  const googleLoginMutation = useMutation({
    mutationKey: ['google-login-mutation'],
    mutationFn: async (googleData: { token: string }) => {
      // Construct the URL with the token as a query parameter
      const urlWithToken = `${GOOGLE_LOGIN_ENDPOINT}?token=${googleData.token}`;

      // Log the constructed URL
      console.log('Google Login Endpoint URL:', urlWithToken);

      // Make the GET request and log the response
      try {
        const response = await handleAsync<AxiosResponse<IAuthUser>>(
          client.get,
          urlWithToken, // Pass the constructed URL with the token included
        );

        // Log the response data
        console.log('Google Login Response:', response);

        return response;
      } catch (error) {
        // Log the error details
        console.error('Google Login Error:', error);
        throw error; // Re-throw the error to trigger onError callback
      }
    },
    onSuccess: (data: AxiosResponse<IAuthUser>) => {
      if (data.status === 200) {
        const { user, token } = data?.data?.data;
        console.log('Login Success:', data?.data); // Log success response

        success({ message: data?.data?.message });
        setAuthToken(token);
        login(user);
        storeCookie({ key: AUTH_TOKEN, value: token });
        storeCookie({ key: USER_ROLE, value: user?.account_type });
        router.push(`/dashboard`); // or any other route based on user role
      }
    },
    onError: (err: any) => {
      console.error('Login Error:', err); // Log error response
      error({ message: err?.response?.data?.message });
    },
  });

  // Handle Google login button click
  const handleGoogleLogin = () => {
    // Simulate getting a Google token (you should replace this with actual logic)
    const googleData = { token: 'your-google-token' };

    // Trigger the mutation
    googleLoginMutation.mutate(googleData);
  };

  const handleButtonClick = () => {
    setScreen(navBtn);
  };

  return (
    <section className='overflow-x-hidden'>
      {origin === 'modal' ? (
        <div className='flex justify-end'>
          <Button
            onClick={() => closeModal()}
            variant='secondary'
            size='icon'
            className='cursor-pointer bg-transparent hover:bg-transparent'
          >
            <Icons.Close className='h-5 w-5' />
          </Button>
        </div>
      ) : null}
      <h1 className='mb-4 text-center text-3xl font-bold'>Login</h1>
      <div className='grid gap-y-4 text-center'>
        <AuthButton
          imageSrc='/assets/images/google.svg'
          imageAlt='Google Logo'
          text='Continue with Google'
          onClick={handleGoogleLogin}
        />
        {/* <AuthButton
          imageSrc='/assets/images/facebook.svg'
          imageAlt='Facebook Logo'
          text='Continue with Facebook'
          bgColor='bg-ocBlue-250 hover:bg-ocBlue-250/80'
          textColor='text-white'
        />
        <AuthButton
          imageSrc='/assets/images/ios.svg'
          imageAlt='IOS Logo'
          text='Continue with Apple'
          bgColor='bg-black hover:bg-black/80'
          textColor='text-white'
        /> */}
        <AuthButton
          imageSrc='/assets/images/email.svg'
          imageAlt='Email'
          text='Continue with Email'
          onClick={handleButtonClick}
        />
      </div>
    </section>
  );
};
