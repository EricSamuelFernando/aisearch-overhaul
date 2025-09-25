'use client';

import { useState, useEffect } from 'react';

import { LoginModal } from './login-modal';
import RegisterModal from './register-modal';
import { AlertDialog, AlertDialogContent } from '../ui/alert-dialog';

interface AutoLoginModalProps {
  currentStage: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AutoLoginModal: React.FC<AutoLoginModalProps> = ({
  currentStage,
  isOpen,
  onOpenChange,
}) => {
  const [currentForm, setCurrentForm] = useState<number>(currentStage);

  const handleNextForm = () => {
    setCurrentForm(1);
  };

  const handlePrevForm = () => {
    setCurrentForm(0);
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentForm(currentStage);
    }
  }, [isOpen, currentStage]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {/* <AlertDialogContent className='w-[22rem] rounded-[20px] md:w-[36rem]'>
        {currentForm === 0 && <LoginModal handleStage={handleNextForm} />}
        {currentForm === 1 && <RegisterModal handleStage={handlePrevForm} />}
      </AlertDialogContent> */}
    </AlertDialog>
  );
};

export default AutoLoginModal;
