'use client';

import { SellerPropertiesProvider } from '@/providers/seller-property-context';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { logout } from '../../../slices/auth/auth.slice';
import SellerDashboard from './seller-dashboard';
import { Navigate } from '@/lib/Navigate';
import { useEffect } from 'react';

interface CurrentDashboardProps {
  token: any;
}

function CurrentDashboard({ token }: CurrentDashboardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const currentUser = user?.account_type?.toLowerCase();

  if (!currentUser || currentUser === 'agent') {
    logout();
    return <Navigate to='/' />;
  }

  // if (currentUser === 'buyer' && user?.propertyPreference.onboardingCompleted)
  //   return <Navigate to='/dashboard/buyer' />;

  // if (currentUser === 'buyer' && !user?.propertyPreference.onboardingCompleted)
  //   return <Navigate to='/property-preference' />;

  if (currentUser === 'buyer') return <Navigate to='/dashboard/buyer' />;

  return (
    <section className=''>
      <SellerPropertiesProvider>
        <SellerDashboard />
      </SellerPropertiesProvider>
    </section>
  );
}

export default CurrentDashboard;
