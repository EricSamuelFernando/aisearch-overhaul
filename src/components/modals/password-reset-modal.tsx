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
  const [codeError, setCodeError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      // Reset to initial step when modal closes
      setCurrentStep('forgot');
      setEmail('');
      setCodeError('');
    }
  }, [isOpen]);

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    localStorage.setItem('forgotPasswordEmail', submittedEmail);
    setCurrentStep('verify');
    setCodeError('');
  };

  const handleCodeVerify = () => {
    setCodeError('');
    setCurrentStep('set-password');
  };

  const handleCodeInvalid = () => {
    // Code was rejected by backend — go back to verify step and show error
    setCurrentStep('verify');
    setCodeError('The code you entered is invalid or has expired. Please enter the correct code.');
  };

  const handlePasswordSet = () => {
    // Clear stored values
    localStorage.removeItem('forgotPasswordEmail');
    localStorage.removeItem('forgotPasswordCode');
    // Close modal on success
    setIsOpen(false);
    setCurrentStep('forgot');
    setEmail('');
    setCodeError('');
  };

  const handleBack = () => {
    if (currentStep === 'set-password') {
      setCurrentStep('verify');
    } else if (currentStep === 'verify') {
      setCurrentStep('forgot');
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
            externalError={codeError}
          />
        )}
        {currentStep === 'set-password' && (
          <SetPasswordModalForm 
            email={email}
            onPasswordSet={handlePasswordSet}
            onBack={handleBack}
            onCodeInvalid={handleCodeInvalid}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
