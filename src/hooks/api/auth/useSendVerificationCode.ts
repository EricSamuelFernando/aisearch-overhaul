'use client';

import { SignInFormValues } from '@/intferfaces/form';
import { SECURE_LOGIN_KEY } from '@/shared/constants/env';
import { useMutation } from '@tanstack/react-query';
import client from '../../../lib/client';
import { generateSHAString } from '../../../lib/helpers';
import { storeCookie } from '../../../lib/storage';

export const useSendCodeMution = () => {
  const sendCodeMutation = useMutation({
    mutationKey: ['login-mutation'],
    mutationFn: async (loginData: SignInFormValues) => {
      //TODO dispatch action to save username

      const prudding = generateSHAString(loginData.email);
      storeCookie({ key: SECURE_LOGIN_KEY, value: prudding });

      return await client
        .post(``, {
          email: loginData.email,
          password: loginData.password,
        })
        .then((res) => res)
        .catch((err) => console.log(err));
    },
  });

  return { sendCodeMutation };
};
