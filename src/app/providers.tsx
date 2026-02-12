'use client';

import { Toaster } from 'sonner';
import { DisclosureProvider } from '../providers/disclosure-provider';
import {
  initialModals,
  ModalProvider,
  Modals,
} from '../providers/modal-provider';
import AppQueryProviders from '../providers/query-provider';
import StoreProvider from '../providers/store-provider';
import CollectionModalProvider from '@/providers/collection-modal-provider';

import { MantineProvider } from '@mantine/core';

// import '@mantine/charts/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';
import '@mantine/core/styles.css';
import './embla.css';
import './globals.css';
import { WindowSizeProvider } from '@/providers/window-size-provider';
import SocketProvider from '@/providers/socket.context';
import AuthSessionSync from '@/providers/auth-session-sync';
import '@/utils/testCognitoConfig'; // Makes testCognitoConfig available in browser console

const ToastSuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const ToastErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.828-10.828a.75.75 0 00-1.06-1.06L10 7.879 8.232 6.111a.75.75 0 10-1.06 1.06L8.94 8.94 7.172 10.707a.75.75 0 101.06 1.06L10 10.001l1.768 1.768a.75.75 0 001.06-1.06L11.06 8.94l1.768-1.768z"
      clipRule="evenodd"
    />
  </svg>
);

const ToastInfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-10a1 1 0 100-2 1 1 0 000 2zm1 6a1 1 0 10-2 0V9a1 1 0 102 0v5z"
      clipRule="evenodd"
    />
  </svg>
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <MantineProvider
        theme={{
          colors: {
            ocOrange: [
              '#fff4e6', // lighter
              '#ffe8cc',
              '#ffd4a3',
              '#ffbb75',
              '#ff9f3d',
              '#e8804c', // main ocOrange color
              '#d16f3e', // darker shades
              '#b44d00',
              '#873900',
              '#5c2700',
            ],
          },
          primaryColor: 'ocOrange', // Use ocOrange as primary color for other components
        }}
      >
        <DisclosureProvider>
          <AppQueryProviders>
            <ModalProvider initialModals={initialModals}>
              <Modals />
              <AuthSessionSync />
              <SocketProvider>
                <CollectionModalProvider>
                  {children}
                </CollectionModalProvider>
              </SocketProvider>
              <WindowSizeProvider />
            </ModalProvider>
            <Toaster
              position="top-right"
              duration={3500}
              closeButton={false}
              richColors={false}
              icons={{
                success: <ToastSuccessIcon />,
                error: <ToastErrorIcon />,
                info: <ToastInfoIcon />,
              }}
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast: 'snaphomz-toast',
                  success: 'snaphomz-toast--success custom-toast-success',
                  error: 'snaphomz-toast--error custom-toast-error',
                  warning: 'snaphomz-toast--warning custom-toast-warning',
                  info: 'snaphomz-toast--info custom-toast-info',
                  title: 'snaphomz-toast__title',
                  description: 'snaphomz-toast__desc',
                  actionButton: 'snaphomz-toast__action',
                  cancelButton: 'snaphomz-toast__action snaphomz-toast__action--secondary',
                  closeButton: 'snaphomz-toast__close',
                  icon: 'snaphomz-toast__icon',
                  content: 'snaphomz-toast__content',
                },
              }}
              style={{ zIndex: 99999 }}
            />
          </AppQueryProviders>
        </DisclosureProvider>
      </MantineProvider>
    </StoreProvider>
  );
}
