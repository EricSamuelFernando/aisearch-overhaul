'use client';

import React, { createContext, useContext, useState } from 'react';

interface DisclosureContextType {
  opened: boolean;
  open: () => void;
  close: () => void;
}

const DisclosureContext = createContext<DisclosureContextType | null>(null);

export const useCustomDisclosure = () => {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error('useDisclosure must be used within a DisclosureProvider');
  }
  return context;
};

interface DisclosureProviderProps {
  children: React.ReactNode;
}

export const DisclosureProvider: React.FC<DisclosureProviderProps> = ({
  children,
}) => {
  const [opened, setOpened] = useState(false);

  const open = () => {
    setOpened(true);
  };

  const close = () => {
    setOpened(false);
  };

  const value: DisclosureContextType = {
    opened,
    open,
    close,
  };

  return (
    <DisclosureContext.Provider value={value}>
      {children}
    </DisclosureContext.Provider>
  );
};
