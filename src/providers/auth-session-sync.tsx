'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthActions } from '@/shared/hooks/useAuth';

/**
 * AuthSessionSync
 * 
 * Listens for the 'auth-session-expired' custom event dispatched by the axios
 * interceptor / query-provider / client interceptor when an Unauthorized error
 * is detected and the refresh token has failed (or doesn't exist).
 *
 * On event this component:
 *   1. Dispatches Redux logout (clears state + calls clearAllAuthStorage which
 *      wipes cookies, localStorage, sessionStorage, Redux Persist, Cognito SDK)
 *   2. Clears the React Query cache so no stale queries re-fire
 *   3. Dismisses all existing toasts, then shows a single "session expired" toast
 *   4. Redirects to /login
 *
 * This prevents the infinite "Unauthorized" toaster loop by handling forced
 * logout in one centralized place.
 */
export default function AuthSessionSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthActions();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      // Only handle once to prevent duplicate toasts/redirects
      if (hasHandledRef.current) return;
      hasHandledRef.current = true;

      // 1. Dispatch Redux logout → clearAllAuthStorage()
      //    Wipes cookies, localStorage, sessionStorage, persist:root, Cognito keys
      logout();

      // 2. Clear React Query cache so no stale/failed queries keep re-firing
      queryClient.cancelQueries();
      queryClient.clear();

      // 3. Dismiss all existing toasts (kills any queued "Unauthorized" toasts)
      //    then show one single clear message
      toast.dismiss();
      setTimeout(() => {
        toast.error('Your session has expired. Please login again.', {
          id: 'session-expired',
          duration: 5000,
        });
      }, 100);

      // 4. Redirect to login
      router.push('/login');
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, [logout, router, queryClient]);

  // Reset the handled flag when user logs in again
  // (resetAuthExpired() dispatches 'auth-session-reset')
  useEffect(() => {
    const handleReset = () => {
      hasHandledRef.current = false;
    };

    window.addEventListener('auth-session-reset', handleReset);
    return () => {
      window.removeEventListener('auth-session-reset', handleReset);
    };
  }, []);

  return null;
}
