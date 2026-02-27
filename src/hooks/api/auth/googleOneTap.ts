// components/auth/GoogleOneTap.tsx
'use client';

import { useGoogleOneTapLogin } from '@react-oauth/google';
import { error, success } from '@/components/alert/notify';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/shared/hooks/useAuth';
import { AUTH_TOKEN, USER_ROLE } from '@/shared/constants/env';
import { storeCookie } from '@/lib/storage';
import { resetAuthExpired } from '@/lib/api/axios';
import { setAuthToken } from '@/slices/auth/register.slices';

const GRAPHQL_URI =
  process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

const GoogleOneTap = () => {
  const router = useRouter();
  const { login } = useAuthActions();

  const handleAuthSuccess = async (googleToken: string) => {
    try {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation GoogleLogin($googleToken: String!) {
            googleLogin(googleToken: $googleToken) {
              id,
              firstName,
              lastName,
              email,
              accountType,
              access_token
            }
          }
        `,
        variables: {
          googleToken,
        },
      });

      const data = response.data?.data?.googleLogin;
      if (data) {
        const { firstName, lastName, email, accountType, access_token, id } = data;
        const user: any = {
          firstname: firstName,
          lastname: lastName,
          email,
          account_type: accountType,
          id,
        };

        localStorage.setItem('userEmail', email);
        localStorage.setItem('userAccessToken', access_token);
        localStorage.setItem('userDetails', JSON.stringify(user));

        success({ message: 'Success! Welcome back via Google.' });
        resetAuthExpired();
        setAuthToken(access_token);
        login(user);
        storeCookie({ key: AUTH_TOKEN, value: access_token });
        storeCookie({ key: USER_ROLE, value: accountType });
        router.push(`/home`);
      }
    } catch (err) {
      console.error('Google One Tap Auth Error:', err);
      error({ message: 'Google One Tap login failed' });
    }
  };

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (credentialResponse.credential) {
        await handleAuthSuccess(credentialResponse.credential);
      }
    },
    onError: () => {
      error({ message: 'Google One Tap login failed or cancelled' });
    },
  });

  return null;
};

export default GoogleOneTap;

