'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { ForgotPasswordModalForm } from '@/components/forms/auth/forgot-password-modal-form';
import { VerifyPasswordCodeModalForm } from '@/components/forms/auth/verify-password-code-modal-form';
import { SetPasswordModalForm } from '@/components/forms/auth/set-password-modal-form';

interface PasswordResetModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const PasswordResetModal = ({ isOpen, setIsOpen }: PasswordResetModalProps) => {
  const [currentStep, setCurrentStep] = useState<'forgot' | 'verify' | 'set-password'>('forgot');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      // Reset to initial step when modal closes
      setCurrentStep('forgot');
      setEmail('');
    }
  }, [isOpen]);

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    localStorage.setItem('forgotPasswordEmail', submittedEmail);
    setCurrentStep('verify');
  };

  const handleCodeVerify = () => {
    setCurrentStep('set-password');
  };

  const handlePasswordSet = () => {
    // Clear stored values
    localStorage.removeItem('forgotPasswordEmail');
    localStorage.removeItem('forgotPasswordCode');
    // Close modal on success
    setIsOpen(false);
    setCurrentStep('forgot');
    setEmail('');
  };

  const handleBack = () => {
    if (currentStep === 'verify') {
      setCurrentStep('forgot');
    } else if (currentStep === 'set-password') {
      setCurrentStep('verify');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='w-[22rem] rounded-[20px] md:w-[36rem]'>
        {currentStep === 'forgot' && (
          <ForgotPasswordModalForm 
            onEmailSubmit={handleEmailSubmit}
            onBack={() => setIsOpen(false)}
          />
        )}
        {currentStep === 'verify' && (
          <VerifyPasswordCodeModalForm 
            email={email}
            onCodeVerify={handleCodeVerify}
            onBack={handleBack}
          />
        )}
        {currentStep === 'set-password' && (
          <SetPasswordModalForm 
            email={email}
            onPasswordSet={handlePasswordSet}
            onBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
