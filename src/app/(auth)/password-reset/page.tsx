'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { ForgotPasswordForm } from '@/components/forms/auth/forgot-password-form';
import { VerifyForgotPasswordCodeForm } from '@/components/forms/auth/verify-password-code';

const PasswordReset = () => {
  const params = useSearchParams();
  const step = params?.get('step');

  const routes: { [key: string]: ReactNode } = {
    'send-code': <ForgotPasswordForm />,
    'verify-code': <VerifyForgotPasswordCodeForm />,
  };
  return routes[step ?? 'send-code'];
};

export default PasswordReset;
