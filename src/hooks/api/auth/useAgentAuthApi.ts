import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { generateSHAString } from '../../../lib/helpers';
import { IDENTITY_GATEWAY, SECURE_LOGIN_KEY } from '@/shared/constants/env';
import { storeCookie } from '../../../lib/storage';
import client, { pickErrorMessage, pickResult } from '../../../lib/client';
import { SignInFormValues, SignUpFormValues } from '@/intferfaces/form';

export const useAgentAuthApi = () => {
  const globalLogin = true; // read from store
  const router = useRouter();

  const loginMutation = useMutation({
    mutationKey: ['login-mutation'],
    mutationFn: async (loginData: SignInFormValues) => {
      //TODO dispatch action to save username

      const prudding = generateSHAString(loginData.email);
      storeCookie({ key: SECURE_LOGIN_KEY, value: prudding });

      return await client
        .post(`api${IDENTITY_GATEWAY}`, {
          email: loginData.email,
          password: loginData.password,
        })
        .then(pickResult, pickErrorMessage);
    },
  });

  const signUpMutation = useMutation({
    mutationKey: ['signup-mutation'],
    mutationFn: async (signupData: SignUpFormValues) => {
      //TODO dispatch action to save username

      const prudding = generateSHAString(signupData.email);
      storeCookie({ key: SECURE_LOGIN_KEY, value: prudding });

      return await client
        .post(`api${IDENTITY_GATEWAY}`, {
          email: signupData.email,
        })
        .then(pickResult, pickErrorMessage);
    },
  });

  return { loginMutation, signUpMutation };
};
