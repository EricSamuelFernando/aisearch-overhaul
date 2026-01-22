'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { LoginModal } from './login-modal';
import RegisterModal from './register-modal';
import { PasswordResetModal } from './password-reset-modal';

const LoginRegisterModal = ({
  initialStage,
  label,
  className,
  variant,
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
}) => {
  const [currentForm, setCurrentForm] = useState<number>(initialStage | 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentForm(initialStage);
    }
  }, [isOpen, initialStage]);

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
          {currentForm === 1 && <RegisterModal handleStage={handlePrevForm} />}
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
