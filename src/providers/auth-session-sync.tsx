'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthActions } from '@/shared/hooks/useAuth';

/**
 * AuthSessionSync
 * 
 * Listens for the 'auth-session-expired' custom event dispatched by the axios interceptor
 * when the refresh token fails. On event:
 *   1. Dispatches Redux logout (clears state, cookies, localStorage)
 *   2. Shows a single "session expired" toast
 *   3. Redirects to /login
 * 
 * This prevents the infinite "Unauthorized" toaster loop by handling forced logout
 * in one centralized place instead of letting each API call show its own toast.
 */
export default function AuthSessionSync() {
  const router = useRouter();
  const { logout } = useAuthActions();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      // Only handle once to prevent duplicate toasts/redirects
      if (hasHandledRef.current) return;
      hasHandledRef.current = true;

      // Dispatch Redux logout to clear all auth state
      logout();

      // Show a single, clear toast message
      toast.error('Your session has expired. Please login again.', {
        id: 'session-expired', // Use a fixed ID to prevent duplicates
        duration: 5000,
      });

      // Redirect to login
      router.push('/login');
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, [logout, router]);

  // Reset the handled flag when user navigates (in case they log in again and session expires again later)
  useEffect(() => {
    hasHandledRef.current = false;
  }, []);

  return null;
}
