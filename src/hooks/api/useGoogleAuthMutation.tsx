import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { success, error } from '@/components/alert/notify';
import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { storeCookie } from '@/lib/storage';
import { AUTH_TOKEN, USER_ROLE } from '@/shared/constants/env';
import { login } from '@/slices/auth/auth.slice';
import { resetAuthExpired } from '@/lib/api/axios';
import { setAuthToken } from '@/slices/auth/register.slices';
import { IAuthUser } from '@/types/user.types';
import { GOOGLE_LOGIN_ENDPOINT } from '@/utils/apis';
import { AxiosResponse } from '@/types/axios.types';

/**
 *
 * @returns @function handleGoogleLogin
 */

const useGoogleAuthMutation = () => {
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
        resetAuthExpired();
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

  return {
    handleGoogleLogin,
  };
};

export { useGoogleAuthMutation };
