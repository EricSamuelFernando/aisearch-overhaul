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
import '@/utils/testCognitoConfig'; // Makes testCognitoConfig available in browser console

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
              <SocketProvider>
                <CollectionModalProvider>
                  {children}
                </CollectionModalProvider>
              </SocketProvider>
              <WindowSizeProvider />
            </ModalProvider>
            <Toaster position='top-right' duration={2000} richColors />
          </AppQueryProviders>
        </DisclosureProvider>
      </MantineProvider>
    </StoreProvider>
  );
}
