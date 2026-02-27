'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { LoginModal } from './login-modal';
import RegisterModal from './register-modal';
import { PasswordResetModal } from './password-reset-modal';

let lastAuthLoginKey: string | null = null;

const LoginRegisterModal = ({
  initialStage,
  label,
  className,
  variant,
  registerDefaults,
}: {
  initialStage: number;
  label: string;
  className?: string;
  variant:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'ocreal'
    | null
    | undefined;
  registerDefaults?: {
    userType?: import('@/types/user.types').UserType;
    startAt?: 'account-selection' | 'send-code';
  };
}) => {
  const [currentForm, setCurrentForm] = useState<number>(initialStage | 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setCurrentForm(initialStage);
    }
  }, [isOpen, initialStage]);

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth !== 'login') {
      lastAuthLoginKey = null;
      return;
    }

    const authKey = `${pathname}?${searchParams.toString()}`;
    if (auth === 'login' && initialStage === 0 && lastAuthLoginKey !== authKey) {
      lastAuthLoginKey = authKey;
      setIsOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('auth');
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    }
  }, [searchParams, initialStage, pathname, router]);

  const handleNextForm = () => {
    setCurrentForm(1);
  };

  const handlePrevForm = () => {
    setCurrentForm(0);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} className={(cn('w-full'), className)}>
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent className='w-[22rem] rounded-[20px] md:w-[36rem]'>
          {currentForm === 0 && (
            <LoginModal 
              handleStage={handleNextForm} 
              setIsOpen={setIsOpen}
              onForgotPassword={() => {
                setIsOpen(false);
                setTimeout(() => {
                  setIsPasswordResetOpen(true);
                }, 100);
              }}
            />
          )}
          {currentForm === 1 && (
            <RegisterModal
              handleStage={handlePrevForm}
              presetUserType={registerDefaults?.userType}
              startAt={registerDefaults?.startAt}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <PasswordResetModal 
        isOpen={isPasswordResetOpen} 
        setIsOpen={setIsPasswordResetOpen} 
      />
    </>
  );
};

export default LoginRegisterModal;
