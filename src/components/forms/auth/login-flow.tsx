'use client';

import { LoginForm } from '@/components/forms/auth/login-form';
import { useAuthModal, useAuthModalActions } from '@/shared/hooks/useAuthModal';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export const LoginFlow = ({
  origin = 'page',
}: {
  origin?: 'page' | 'modal';
}) => {
  const modals = useAuthModal();
  const { currentScreen } = modals;

  const { setScreen } = useAuthModalActions();

  useEffect(() => {
    return () => {
      setScreen('login');
    };
  }, [setScreen]);

  return (
    <div
      className={cn(
        '',
        origin === 'page' ? 'w-[22rem] md:w-[36rem]' : 'w-full',
      )}
    >
      {currentScreen === 'login' ? (
        <LoginForm showBack origin={origin} />
      ) : null}
    </div>
  );
};
