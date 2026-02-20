'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface AppQueryClientProps {
  children: ReactNode;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors — the axios / client interceptors
        // will silently refresh the token. If they can't, they mark auth
        // as expired and AuthSessionSync takes over.
        const message = error?.message || '';
        if (
          message === 'Unauthorized' ||
          message.includes('Session expired') ||
          error?.response?.status === 401
        ) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1 * 60 * 60 * 1000,
    },
    mutations: {
      retry: false,
      // Removed the global onError that was calling markAuthExpired() —
      // the axios interceptors now handle token refresh silently.
      // markAuthExpired is only called as an absolute last resort inside
      // the interceptor when the refresh token itself is invalid.
    },
  },
});

const AppQueryProviders: React.FC<AppQueryClientProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default AppQueryProviders;
