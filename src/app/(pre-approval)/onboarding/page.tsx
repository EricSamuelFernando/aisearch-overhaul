import { Metadata } from 'next';
import OnboardingScreen from '@/components/onboardig/onboarding-screen';

export const metadata: Metadata = {
  title: 'Add Pre-Approval Documents',
  description: 'Pre-Approval | Snap Homz',
};

type Props = {};

function PreApproval({}: Props) {
  return <OnboardingScreen />;
}

export default PreApproval;
