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
        // Don't retry on auth errors - the session sync handler will take care of logout
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
      refetchInterval: 1800000,
    },
    mutations: {
      retry: false,
    },
  },
});
const AppQueryProviders: React.FC<AppQueryClientProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default AppQueryProviders;
