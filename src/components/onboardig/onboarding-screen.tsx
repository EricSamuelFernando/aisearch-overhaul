'use client';

import React from 'react';
import ActionButtons from '@/components/onboardig/action-buttons';
import { OnboardingSteps } from '@/components/onboardig/onboarding-steps';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';

type Props = {};

function OnboardingScreen({}: Props) {
  // const { user } = useAuth()
  // const currentUser = user?.account_type
  // const router = useRouter()

  // if (currentUser === 'seller') {
  //   router.push('/dashboard')
  // }

  // if (currentUser === 'buyer' && user?.propertyPreference.onboardingCompleted) {
  //   router.push('/dashboard/buyer')
  // }

  return (
    <section className='flex h-full flex-col'>
      <div className='flex-1'>
        <OnboardingSteps />
      </div>
      <div className='h-max'>
        <ActionButtons />
      </div>
    </section>
  );
}

export default OnboardingScreen;
