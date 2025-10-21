'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoginModal } from '@components/modals/login-modal';
import RegisterModal from '@components/modals/register-modal';
import { useSearchParams } from 'next/navigation';
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
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();

 const typeParam = searchParams.get("type") || "null";
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={(cn('w-full'), className)}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[22rem] rounded-[20px] md:w-[36rem]'>
        <RegisterModal handleStage={handlePrevForm} viewParam='send-code' accountTypes='buyer' userRedirection={typeParam} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginRegisterModal;
